import { describe, expect, it, vi } from "vitest";
import { clientAccounts, clientInvoices, invoiceActivities } from "../drizzle/schema";
import { reconcilePrepaidCheckout } from "./stripe/prepaidReconciliation";

type Invoice = Parameters<typeof reconcilePrepaidCheckout>[2];
type Account = Parameters<typeof reconcilePrepaidCheckout>[3];
type StripeClient = Parameters<typeof reconcilePrepaidCheckout>[0];

function fixture() {
  const arrangement = {
    initialInvoiceId: 420001,
    initialChargeCents: 96800,
    initialTermMonths: 11,
    recurringAmountCents: 8800,
    initialTermStartDate: "2026-11-05",
    initialTermEndDate: "2027-10-04",
    ongoingMonthlyStartDate: "2027-10-05",
    coverageDatesStatus: "confirmed",
    prepaidCheckoutSessionId: "cs_prepaid_exact",
  };
  const invoice = {
    id: 420001,
    invoiceNumber: "FS-420001",
    totalAmountCents: 96800,
    isRecurring: 0,
    status: "open",
    shareToken: "prepaid-share-token",
  } as Invoice;
  const account = {
    id: 1320003,
    businessName: "Prepaid Fixture Business",
    clientEmail: "billing@example.test",
    monthlyPriceCents: 8800,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    removedAt: null,
    paymentArrangementJson: JSON.stringify(arrangement),
  } as Account;
  const paidAt = new Date("2026-11-05T12:00:00Z");
  const session = {
    id: arrangement.prepaidCheckoutSessionId,
    status: "complete",
    payment_status: "paid",
    mode: "subscription",
    currency: "usd",
    amount_total: 96800,
    customer: "cus_prepaid",
    subscription: "sub_prepaid",
    invoice: "in_prepaid",
    created: new Date("2026-11-05T11:59:00Z").getTime() / 1000,
    metadata: {
      invoiceId: String(invoice.id),
      clientAccountId: String(account.id),
      billingMode: "prepaid_then_monthly",
    },
  };
  const paidInvoice = {
    id: "in_prepaid",
    status: "paid",
    currency: "usd",
    amount_paid: 96800,
    customer: "cus_prepaid",
    status_transitions: { paid_at: paidAt.getTime() / 1000 },
  };
  const subscription = {
    id: "sub_prepaid",
    customer: "cus_prepaid",
    status: "trialing",
    collection_method: "charge_automatically",
    trial_end: new Date("2027-10-05T00:00:00Z").getTime() / 1000,
    items: {
      data: [{
        quantity: 1,
        price: {
          unit_amount: 8800,
          currency: "usd",
          recurring: { interval: "month", interval_count: 1 },
        },
      }],
    },
  };
  const charge = { paid: true, refunded: false, disputed: false, amount_refunded: 0 };
  const intent = {
    id: "pi_prepaid",
    status: "succeeded",
    currency: "usd",
    amount_received: 96800,
    customer: "cus_prepaid",
    latest_charge: charge,
  };
  const stripe = {
    checkout: { sessions: { retrieve: vi.fn().mockResolvedValue(session) } },
    invoices: { retrieve: vi.fn().mockResolvedValue(paidInvoice) },
    subscriptions: { retrieve: vi.fn().mockResolvedValue(subscription) },
    invoicePayments: {
      list: vi.fn().mockResolvedValue({
        data: [{ status: "paid", amount_paid: 96800, payment: { payment_intent: "pi_prepaid" } }],
      }),
    },
    paymentIntents: { retrieve: vi.fn().mockResolvedValue(intent) },
  };
  const currentInvoice = { ...invoice };
  const lock = vi.fn().mockResolvedValueOnce([currentInvoice]).mockResolvedValueOnce([account]);
  const writeWhere = vi.fn().mockResolvedValue(undefined);
  const set = vi.fn(() => ({ where: writeWhere }));
  const values = vi.fn().mockResolvedValue(undefined);
  const tx = {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ for: lock })) })) })),
    update: vi.fn(() => ({ set })),
    insert: vi.fn(() => ({ values })),
  };
  const db = { transaction: vi.fn(async (callback: (transaction: typeof tx) => Promise<boolean>) => callback(tx)) };
  const run = () => reconcilePrepaidCheckout(stripe as unknown as StripeClient, db, invoice, account);
  return { arrangement, invoice, account, session, paidInvoice, subscription, charge, intent, stripe,
    currentInvoice, lock, tx, set, values, writeWhere, db, paidAt, run };
}

describe("reconcilePrepaidCheckout", () => {
  it("returns false for an open/unpaid checkout without writing to the database", async () => {
    for (const status of ["open", "complete"]) {
      const f = fixture();
      f.session.status = status;
      f.session.payment_status = "unpaid";
      await expect(f.run()).resolves.toBe(false);
      expect(f.stripe.invoices.retrieve).not.toHaveBeenCalled();
      expect(f.db.transaction).not.toHaveBeenCalled();
    }
  });

  it("returns false without a stored checkout session and never calls Stripe", async () => {
    const f = fixture();
    const { prepaidCheckoutSessionId: _sessionId, ...arrangement } = f.arrangement;
    f.account.paymentArrangementJson = JSON.stringify(arrangement);
    await expect(f.run()).resolves.toBe(false);
    expect(f.stripe.checkout.sessions.retrieve).not.toHaveBeenCalled();
    expect(f.db.transaction).not.toHaveBeenCalled();
  });

  it("rejects mismatched Stripe customers at every verification layer", async () => {
    for (const layer of ["invoice", "subscription", "intent", "account"]) {
      const f = fixture();
      if (layer === "invoice") f.paidInvoice.customer = "cus_other";
      if (layer === "subscription") f.subscription.customer = "cus_other";
      if (layer === "intent") f.intent.customer = "cus_other";
      if (layer === "account") f.account.stripeCustomerId = "cus_other";
      await expect(f.run()).rejects.toThrow(/terms could not be verified|not fully settled|already linked/);
      expect(f.db.transaction).not.toHaveBeenCalled();
    }
  });

  it("rejects checkout metadata naming a different invoice", async () => {
    const f = fixture();
    f.session.metadata.invoiceId = "420002";
    await expect(f.run()).rejects.toThrow("Stripe checkout does not match this prepaid invoice.");
    expect(f.stripe.invoices.retrieve).not.toHaveBeenCalled();
    expect(f.db.transaction).not.toHaveBeenCalled();
  });

  it("rejects checkout metadata naming a different customer account", async () => {
    const f = fixture();
    f.session.metadata.clientAccountId = "1320004";
    await expect(f.run()).rejects.toThrow("Stripe checkout does not match this prepaid invoice.");
    expect(f.stripe.invoices.retrieve).not.toHaveBeenCalled();
    expect(f.db.transaction).not.toHaveBeenCalled();
  });

  it("rejects the wrong amount on the checkout, paid invoice, or payment intent", async () => {
    for (const layer of ["checkout", "invoice", "intent"]) {
      const f = fixture();
      if (layer === "checkout") f.session.amount_total = 8800;
      if (layer === "invoice") f.paidInvoice.amount_paid = 8800;
      if (layer === "intent") f.intent.amount_received = 8800;
      await expect(f.run()).rejects.toThrow(/does not match|terms could not be verified|not fully settled/);
      expect(f.db.transaction).not.toHaveBeenCalled();
    }
  });

  it("verifies the exact paid $968 session and deferred $88 monthly subscription before recording payment", async () => {
    const f = fixture();
    await expect(f.run()).resolves.toBe(true);
    expect(f.stripe.checkout.sessions.retrieve.mock.calls).toEqual([["cs_prepaid_exact"]]);
    expect(f.stripe.invoices.retrieve.mock.calls).toEqual([["in_prepaid"]]);
    expect(f.stripe.subscriptions.retrieve.mock.calls).toEqual([["sub_prepaid"]]);
    expect(f.stripe.invoicePayments.list.mock.calls).toEqual([[{ invoice: "in_prepaid", limit: 10 }]]);
    expect(f.stripe.paymentIntents.retrieve.mock.calls).toEqual([["pi_prepaid", { expand: ["latest_charge"] }]]);
    expect(f.db.transaction).toHaveBeenCalledTimes(1);
    expect(f.lock.mock.calls).toEqual([["update"], ["update"]]);
    expect(f.tx.update.mock.calls).toEqual([[clientInvoices], [clientAccounts]]);
    expect(f.set).toHaveBeenNthCalledWith(1, {
      status: "paid", paidAt: f.paidAt, stripeInvoiceId: "in_prepaid", stripePaymentIntentId: "pi_prepaid",
    });
    expect(f.set).toHaveBeenNthCalledWith(2, {
      stripeCustomerId: "cus_prepaid", stripeSubscriptionId: "sub_prepaid", status: "active",
      paymentArrangementJson: JSON.stringify({ ...f.arrangement, recurringActivationStatus: "scheduled_after_prepayment" }),
    });
    expect(f.writeWhere).toHaveBeenCalledTimes(2);
    expect(f.tx.insert.mock.calls).toEqual([[invoiceActivities]]);
    expect(f.values).toHaveBeenCalledTimes(1);
    expect(f.values).toHaveBeenCalledWith({
      clientAccountId: f.account.id, invoiceId: f.invoice.id,
      activityType: "prepaid_payment_reconciled", performedByName: "Stripe verified invoice return flow",
      details: JSON.stringify({
        stripeInvoiceId: "in_prepaid", paymentIntentId: "pi_prepaid", customerId: "cus_prepaid", subscriptionId: "sub_prepaid",
        initialAmountCents: 96800, recurringAmountCents: 8800, recurringStartDate: "2027-10-05",
      }),
    });
  });

  it("returns false for a duplicate when the locked current invoice is already paid", async () => {
    const f = fixture();
    f.currentInvoice.status = "paid";
    await expect(f.run()).resolves.toBe(false);
    expect(f.db.transaction).toHaveBeenCalledTimes(1);
    expect(f.lock).toHaveBeenCalledTimes(1);
    expect(f.tx.update).not.toHaveBeenCalled();
    expect(f.tx.insert).not.toHaveBeenCalled();
  });

  it("rejects fully refunded and partially refunded charges without database writes", async () => {
    for (const refunded of [true, false]) {
      const f = fixture();
      f.charge.refunded = refunded;
      f.charge.amount_refunded = refunded ? 96800 : 100;
      await expect(f.run()).rejects.toThrow("Prepaid payment is not fully settled or has been reversed.");
      expect(f.db.transaction).not.toHaveBeenCalled();
    }
  });

  it("rejects a disputed charge without database writes", async () => {
    const f = fixture();
    f.charge.disputed = true;
    await expect(f.run()).rejects.toThrow("Prepaid payment is not fully settled or has been reversed.");
    expect(f.db.transaction).not.toHaveBeenCalled();
  });
});
