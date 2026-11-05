import type Stripe from "stripe";
import { and, eq, inArray } from "drizzle-orm";
import { clientAccounts, clientInvoices, invoiceActivities } from "../../drizzle/schema";
import { resolvePrepaidBilling } from "./prepaidCheckout";

/** Read-through fallback: only a settled Stripe payment can mark this designated invoice paid. */
export async function reconcilePrepaidCheckout(stripe: Stripe, db: any, invoice: typeof clientInvoices.$inferSelect, account: typeof clientAccounts.$inferSelect): Promise<boolean> {
  if (!["open", "overdue"].includes(invoice.status)) return false;
  const plan = resolvePrepaidBilling(invoice, account);
  if (!plan) return false;
  const arrangement = JSON.parse(account.paymentArrangementJson!);
  const sessionId = arrangement.prepaidCheckoutSessionId;
  if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) return false;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.status !== "complete" || session.payment_status !== "paid") return false;
  const objectId = (value: any): string | undefined => typeof value === "string" ? value : value?.id;
  const customerId = objectId(session.customer);
  const subscriptionId = objectId(session.subscription);
  const stripeInvoiceId = objectId(session.invoice);
  if (session.mode !== "subscription" || session.currency !== "usd" || session.amount_total !== plan.initialAmountCents
    || session.metadata?.invoiceId !== String(invoice.id) || session.metadata?.clientAccountId !== String(account.id)
    || session.metadata?.billingMode !== "prepaid_then_monthly" || !customerId || !subscriptionId || !stripeInvoiceId) throw new Error("Stripe checkout does not match this prepaid invoice.");
  const [paidInvoice, subscription, payments] = await Promise.all([
    stripe.invoices.retrieve(stripeInvoiceId), stripe.subscriptions.retrieve(subscriptionId),
    stripe.invoicePayments.list({ invoice: stripeInvoiceId, limit: 10 }),
  ]);
  const recurringItem = subscription.items.data[0];
  const expectedStart = Math.floor(new Date(`${plan.recurringStartDate}T00:00:00Z`).getTime() / 1000);
  if (paidInvoice.status !== "paid" || paidInvoice.currency !== "usd" || paidInvoice.amount_paid !== plan.initialAmountCents
    || objectId(paidInvoice.customer) !== customerId || objectId(subscription.customer) !== customerId
    || !["trialing", "active"].includes(subscription.status) || subscription.collection_method !== "charge_automatically"
    || subscription.items.data.length !== 1 || recurringItem.quantity !== 1 || recurringItem.price.unit_amount !== plan.recurringAmountCents
    || recurringItem.price.currency !== "usd" || recurringItem.price.recurring?.interval !== "month"
    || recurringItem.price.recurring.interval_count !== 1 || subscription.trial_end !== expectedStart) throw new Error("Stripe prepaid payment or recurring subscription terms could not be verified.");
  const payment = payments.data.find(item => item.status === "paid" && item.amount_paid === plan.initialAmountCents);
  const paymentIntentId = objectId(payment?.payment?.payment_intent);
  if (!paymentIntentId) throw new Error("No settled payment is linked to the prepaid invoice.");
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] });
  const charge = intent.latest_charge as Stripe.Charge | null;
  if (intent.status !== "succeeded" || intent.currency !== "usd" || intent.amount_received !== plan.initialAmountCents
    || objectId(intent.customer) !== customerId || !charge?.paid || charge.refunded || charge.disputed || charge.amount_refunded) throw new Error("Prepaid payment is not fully settled or has been reversed.");
  if ((account.stripeCustomerId && account.stripeCustomerId !== customerId)
    || (account.stripeSubscriptionId && account.stripeSubscriptionId !== subscriptionId)) throw new Error("The customer is already linked to a different Stripe subscription.");
  return db.transaction(async (tx: any) => {
    const [currentInvoice] = await tx.select().from(clientInvoices).where(eq(clientInvoices.id, invoice.id)).for("update");
    if (!currentInvoice || !["open", "overdue"].includes(currentInvoice.status)) return false;
    if (currentInvoice.totalAmountCents !== plan.initialAmountCents) throw new Error("The local invoice changed before reconciliation.");
    const [currentAccount] = await tx.select().from(clientAccounts).where(eq(clientAccounts.id, account.id)).for("update");
    if (!currentAccount || currentAccount.removedAt
      || (currentAccount.stripeSubscriptionId && currentAccount.stripeSubscriptionId !== subscriptionId)) throw new Error("Customer account changed before reconciliation.");
    const paidAt = new Date((paidInvoice.status_transitions.paid_at || session.created) * 1000);
    await tx.update(clientInvoices).set({ status: "paid", paidAt, stripeInvoiceId, stripePaymentIntentId: paymentIntentId })
      .where(and(eq(clientInvoices.id, invoice.id), inArray(clientInvoices.status, ["open", "overdue"])));
    const currentArrangement = JSON.parse(currentAccount.paymentArrangementJson || "{}");
    await tx.update(clientAccounts).set({ stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId, status: "active",
      paymentArrangementJson: JSON.stringify({ ...currentArrangement, recurringActivationStatus: "scheduled_after_prepayment" }),
    }).where(eq(clientAccounts.id, account.id));
    await tx.insert(invoiceActivities).values({ clientAccountId: account.id, invoiceId: invoice.id,
      activityType: "prepaid_payment_reconciled", performedByName: "Stripe verified invoice return flow",
      details: JSON.stringify({ stripeInvoiceId, paymentIntentId, customerId, subscriptionId, initialAmountCents: plan.initialAmountCents, recurringAmountCents: plan.recurringAmountCents, recurringStartDate: plan.recurringStartDate }),
    });
    return true;
  });
}
