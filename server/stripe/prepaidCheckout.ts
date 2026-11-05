import type Stripe from "stripe";

interface InvoiceInput {
  id: number;
  invoiceNumber: string;
  totalAmountCents: number;
  isRecurring: number;
  status: string;
  shareToken: string | null;
}
interface AccountInput {
  id: number;
  businessName: string;
  clientEmail: string;
  monthlyPriceCents: number;
  stripeSubscriptionId: string | null;
  paymentArrangementJson: string | null;
}
export interface PrepaidBillingPlan {
  initialAmountCents: number;
  recurringAmountCents: number;
  initialMonths: number;
  coverageStartDate: string;
  coverageEndDate: string;
  recurringStartDate: string;
  coverageDatesStatus: string;
}
function parseDate(value: unknown): Date {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Invalid prepaid billing date.");
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error("Invalid prepaid billing date.");
  return date;
}
/** Only the explicitly designated initial invoice receives staged subscription terms. */
export function resolvePrepaidBilling(invoice: InvoiceInput, account: AccountInput | null): PrepaidBillingPlan | null {
  if (!account?.paymentArrangementJson) return null;
  let arrangement: Record<string, unknown>;
  try { arrangement = JSON.parse(account.paymentArrangementJson); } catch { throw new Error("Invalid customer payment arrangement. Please contact FlowSites."); }
  if (!arrangement || arrangement.initialInvoiceId !== invoice.id) return null;
  const initialMonths = Number(arrangement.initialTermMonths);
  const initialAmountCents = Number(arrangement.initialChargeCents);
  const recurringAmountCents = Number(arrangement.recurringAmountCents);
  if (!Number.isInteger(initialMonths) || initialMonths < 1 || initialMonths > 24
    || !Number.isInteger(recurringAmountCents) || recurringAmountCents <= 0
    || !Number.isInteger(initialAmountCents) || initialAmountCents !== recurringAmountCents * initialMonths
    || initialAmountCents !== invoice.totalAmountCents || recurringAmountCents !== account.monthlyPriceCents
    || invoice.isRecurring !== 0) throw new Error("Prepaid invoice amounts do not match the approved billing arrangement.");
  const start = parseDate(arrangement.initialTermStartDate);
  const end = parseDate(arrangement.initialTermEndDate);
  const recurring = parseDate(arrangement.ongoingMonthlyStartDate);
  const expectedStart = new Date(start);
  expectedStart.setUTCMonth(expectedStart.getUTCMonth() + initialMonths);
  const expectedEnd = new Date(recurring); expectedEnd.setUTCDate(expectedEnd.getUTCDate() - 1);
  if (recurring.getTime() !== expectedStart.getTime() || end.getTime() !== expectedEnd.getTime()) throw new Error("The prepaid coverage period and recurring start date do not match.");
  return {
    initialAmountCents, recurringAmountCents, initialMonths,
    coverageStartDate: start.toISOString().slice(0, 10),
    coverageEndDate: end.toISOString().slice(0, 10),
    recurringStartDate: recurring.toISOString().slice(0, 10),
    coverageDatesStatus: String(arrangement.coverageDatesStatus || ""),
  };
}
/** Stripe supports a one-time initial line item while monthly billing is deferred using trial_end. */
export function buildPrepaidCheckoutParameters(
  plan: PrepaidBillingPlan, invoice: InvoiceInput, account: AccountInput, origin: string, now = new Date()
): Stripe.Checkout.SessionCreateParams & { managed_payments: { enabled: boolean } } {
  if (!["open", "overdue"].includes(invoice.status)) throw new Error("This invoice is not finalized and payable.");
  if (account.stripeSubscriptionId) throw new Error("This account already has a subscription. Contact FlowSites to avoid duplicate billing.");
  if (plan.coverageDatesStatus !== "confirmed") throw new Error("The prepaid coverage dates must be confirmed before payment.");
  if (!invoice.shareToken) throw new Error("Invoice payment link is missing.");
  const recurringStart = parseDate(plan.recurringStartDate);
  const delay = recurringStart.getTime() - now.getTime();
  if (delay < 48 * 60 * 60 * 1000 || delay > 730 * 24 * 60 * 60 * 1000) throw new Error("The recurring start date must be between 48 hours and 730 days in the future.");
  const base = new URL(origin);
  if (base.protocol !== "https:" && base.hostname !== "localhost") throw new Error("A secure invoice origin is required.");
  const metadata = {
    invoiceId: String(invoice.id), invoiceNumber: invoice.invoiceNumber,
    clientAccountId: String(account.id), billingMode: "prepaid_then_monthly",
    initialMonths: String(plan.initialMonths), recurringAmountCents: String(plan.recurringAmountCents),
    recurringStartDate: plan.recurringStartDate,
  };
  const initial = (plan.initialAmountCents / 100).toFixed(2);
  const monthly = (plan.recurringAmountCents / 100).toFixed(2);
  return {
    // This account defaults to Managed Payments, which rejects custom_text.
    // Override only this Checkout request, never the account's global settings.
    managed_payments: { enabled: false },
    mode: "subscription", payment_method_types: ["card"], payment_method_collection: "always",
    customer_email: account.clientEmail,
    line_items: [
      { quantity: 1, price_data: { currency: "usd", unit_amount: plan.initialAmountCents, product_data: {
        name: `${account.businessName} — initial ${plan.initialMonths}-month service period`,
        description: `${plan.coverageStartDate} through ${plan.coverageEndDate}; invoice ${invoice.invoiceNumber}. One-time charge.`,
      } } },
      { quantity: 1, price_data: { currency: "usd", unit_amount: plan.recurringAmountCents, recurring: { interval: "month" }, product_data: {
        name: `${account.businessName} — ongoing monthly FlowSites service`,
        description: `$${monthly}/month beginning ${plan.recurringStartDate}; no monthly charges during the prepaid period.`,
      } } },
    ],
    subscription_data: {
      trial_end: Math.floor(recurringStart.getTime() / 1000),
      metadata, description: `$${initial} initial prepaid period, then $${monthly}/month from ${plan.recurringStartDate}.`,
      trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
    },
    metadata: { ...metadata, shareToken: invoice.shareToken },
    custom_text: { submit: { message: `$${initial} is due once now for ${plan.initialMonths} months. $${monthly} will be charged each month starting ${plan.recurringStartDate}.` } },
    success_url: `${base.origin}/invoice/${invoice.shareToken}?payment=success`,
    cancel_url: `${base.origin}/invoice/${invoice.shareToken}?payment=cancelled`,
  };
}
