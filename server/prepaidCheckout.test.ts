import { describe, expect, it } from "vitest";
import {
  buildPrepaidCheckoutParameters,
  resolvePrepaidBilling,
} from "./stripe/prepaidCheckout";

type InvoiceInput = Parameters<typeof resolvePrepaidBilling>[0];
type AccountInput = NonNullable<Parameters<typeof resolvePrepaidBilling>[1]>;
type PrepaidPlan = Parameters<typeof buildPrepaidCheckoutParameters>[0];

const arrangement = {
  initialInvoiceId: 420001,
  initialChargeCents: 96800,
  initialTermMonths: 11,
  recurringAmountCents: 8800,
  initialTermStartDate: "2026-11-05",
  initialTermEndDate: "2027-10-04",
  ongoingMonthlyStartDate: "2027-10-05",
  coverageDatesStatus: "confirmed",
};

const expectedPlan: PrepaidPlan = {
  initialAmountCents: 96800,
  recurringAmountCents: 8800,
  initialMonths: 11,
  coverageStartDate: "2026-11-05",
  coverageEndDate: "2027-10-04",
  recurringStartDate: "2027-10-05",
  coverageDatesStatus: "confirmed",
};

const origin = "https://flow-sites.com";
const now = new Date("2026-11-05T00:00:00.000Z");
const recurringStart = new Date("2027-10-05T00:00:00.000Z");

function makeInvoice(overrides: Partial<InvoiceInput> = {}): InvoiceInput {
  return {
    id: 420001,
    invoiceNumber: "FS-420001",
    totalAmountCents: 96800,
    isRecurring: 0,
    status: "open",
    shareToken: "prepaid-fixture-share-token",
    ...overrides,
  };
}

function makeAccount(overrides: Partial<AccountInput> = {}): AccountInput {
  return {
    id: 1320003,
    businessName: "Prepaid Fixture Business",
    clientEmail: "billing@example.test",
    monthlyPriceCents: 8800,
    stripeSubscriptionId: null,
    paymentArrangementJson: JSON.stringify(arrangement),
    ...overrides,
  };
}

function accountWithArrangement(overrides: Partial<typeof arrangement>): AccountInput {
  return makeAccount({
    paymentArrangementJson: JSON.stringify({ ...arrangement, ...overrides }),
  });
}

function build(overrides: {
  plan?: PrepaidPlan;
  invoice?: InvoiceInput;
  account?: AccountInput;
  origin?: string;
  now?: Date;
} = {}) {
  return buildPrepaidCheckoutParameters(
    overrides.plan ?? { ...expectedPlan },
    overrides.invoice ?? makeInvoice(),
    overrides.account ?? makeAccount(),
    overrides.origin ?? origin,
    overrides.now ?? now,
  );
}

describe("resolvePrepaidBilling", () => {
  it("leaves a normal legacy invoice without a payment arrangement unchanged", () => {
    expect(resolvePrepaidBilling(
      makeInvoice({ id: 420002, totalAmountCents: 8800, isRecurring: 1 }),
      makeAccount({ paymentArrangementJson: null }),
    )).toBeNull();
  });

  it("returns null when the invoice has no customer account", () => {
    expect(resolvePrepaidBilling(makeInvoice(), null)).toBeNull();
  });

  it("does not apply an arrangement to an unrelated invoice", () => {
    expect(resolvePrepaidBilling(
      makeInvoice({ id: 420002, totalAmountCents: 8800, isRecurring: 1 }),
      makeAccount(),
    )).toBeNull();
  });

  it("resolves the designated $968 initial charge and $88 monthly plan", () => {
    expect(resolvePrepaidBilling(makeInvoice(), makeAccount())).toEqual(expectedPlan);
  });

  it("rejects accidentally storing the $968 initial total as the account monthly rate", () => {
    expect(() => resolvePrepaidBilling(
      makeInvoice(),
      makeAccount({ monthlyPriceCents: 96800 }),
    )).toThrow();
  });

  it("rejects accidentally storing the $968 initial total as the arrangement monthly rate", () => {
    expect(() => resolvePrepaidBilling(
      makeInvoice(),
      accountWithArrangement({ recurringAmountCents: 96800 }),
    )).toThrow();
  });

  it("rejects an invoice total that does not match the approved initial charge", () => {
    expect(() => resolvePrepaidBilling(
      makeInvoice({ totalAmountCents: 96801 }),
      makeAccount(),
    )).toThrow();
  });

  it("rejects an initial charge that does not equal eleven monthly installments", () => {
    expect(() => resolvePrepaidBilling(
      makeInvoice({ totalAmountCents: 96801 }),
      accountWithArrangement({ initialChargeCents: 96801 }),
    )).toThrow();
  });

  it("rejects a recurring invoice as the designated prepaid initial invoice", () => {
    expect(() => resolvePrepaidBilling(
      makeInvoice({ isRecurring: 1 }),
      makeAccount(),
    )).toThrow();
  });

  it("rejects malformed arrangement JSON rather than falling back to legacy billing", () => {
    expect(() => resolvePrepaidBilling(
      makeInvoice(),
      makeAccount({ paymentArrangementJson: "{invalid-json" }),
    )).toThrow();
  });

  it.each([
    "initialTermStartDate",
    "initialTermEndDate",
    "ongoingMonthlyStartDate",
  ] as const)("rejects an invalid %s", (field) => {
    expect(() => resolvePrepaidBilling(
      makeInvoice(),
      accountWithArrangement({ [field]: "not-a-date" }),
    )).toThrow();
  });

  it("rejects impossible calendar dates instead of allowing Date rollover", () => {
    expect(() => resolvePrepaidBilling(
      makeInvoice(),
      accountWithArrangement({ initialTermStartDate: "2026-02-30" }),
    )).toThrow();
  });

  it("rejects coverage that does not end the day before recurring billing", () => {
    expect(() => resolvePrepaidBilling(
      makeInvoice(),
      accountWithArrangement({ initialTermEndDate: "2027-10-05" }),
    )).toThrow();
  });

  it("rejects a recurring start that does not match the eleven-month term", () => {
    expect(() => resolvePrepaidBilling(
      makeInvoice(),
      accountWithArrangement({
        initialTermEndDate: "2027-11-04",
        ongoingMonthlyStartDate: "2027-11-05",
      }),
    )).toThrow();
  });
});

describe("buildPrepaidCheckoutParameters", () => {
  it("creates a subscription checkout with exactly one initial and one monthly line", () => {
    const plan = resolvePrepaidBilling(makeInvoice(), makeAccount());
    expect(plan).not.toBeNull();
    const parameters = build({ plan: plan! });

    expect(parameters.mode).toBe("subscription");
    expect(parameters.line_items).toHaveLength(2);
    const [initial, monthly] = parameters.line_items!;
    expect(initial).toMatchObject({
      quantity: 1,
      price_data: { currency: "usd", unit_amount: 96800 },
    });
    expect(initial.price_data).not.toHaveProperty("recurring");
    expect(monthly).toMatchObject({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: 8800,
        recurring: { interval: "month" },
      },
    });
  });

  it("defers monthly billing to October 5, 2027 at midnight UTC in Unix seconds", () => {
    const parameters = build();
    expect(parameters.subscription_data?.trial_end).toBe(recurringStart.getTime() / 1000);
    expect(parameters.subscription_data).not.toHaveProperty("trial_period_days");
  });

  it("always collects the payment method and identifies the customer email", () => {
    const parameters = build();
    expect(parameters.payment_method_collection).toBe("always");
    expect(parameters.customer_email).toBe("billing@example.test");
  });

  it("uses invoiceId and the exact clientAccountId metadata key on both objects", () => {
    const parameters = build();
    for (const metadata of [parameters.metadata, parameters.subscription_data?.metadata]) {
      expect(metadata).toMatchObject({ invoiceId: "420001", clientAccountId: "1320003" });
      expect(metadata).not.toHaveProperty("customerAccountId");
    }
    expect(parameters.metadata).toMatchObject({ shareToken: makeInvoice().shareToken });
  });

  it("uses canonical invoice URLs even when origin contains a path and query", () => {
    const parameters = build({ origin: `${origin}/admin/billing/?source=portal#checkout` });
    expect(parameters.success_url).toBe(`${origin}/invoice/prepaid-fixture-share-token?payment=success`);
    expect(parameters.cancel_url).toBe(`${origin}/invoice/prepaid-fixture-share-token?payment=cancelled`);
  });

  it.each(["draft", "paid", "void"])("refuses a %s invoice", (status) => {
    expect(() => build({ invoice: makeInvoice({ status }) })).toThrow();
  });

  it("allows an overdue invoice that is still payable", () => {
    expect(build({ invoice: makeInvoice({ status: "overdue" }) }).mode).toBe("subscription");
  });

  it("refuses an account with an existing Stripe subscription", () => {
    expect(() => build({
      account: makeAccount({ stripeSubscriptionId: "sub_already_active" }),
    })).toThrow();
  });

  it.each(["unconfirmed", "pending", ""])("refuses coverage status %j", (coverageDatesStatus) => {
    expect(() => build({ plan: { ...expectedPlan, coverageDatesStatus } })).toThrow();
  });

  it("refuses an invoice without a share token", () => {
    expect(() => build({ invoice: makeInvoice({ shareToken: null }) })).toThrow();
  });

  it("refuses a trial end less than 48 hours in the future", () => {
    const tooLate = new Date(recurringStart.getTime() - 48 * 60 * 60 * 1000 + 1);
    expect(() => build({ now: tooLate })).toThrow();
  });

  it("refuses a trial end that has already passed", () => {
    expect(() => build({ now: new Date("2027-10-06T00:00:00.000Z") })).toThrow();
  });

  it("refuses a trial end more than 730 days in the future", () => {
    const tooEarly = new Date(recurringStart.getTime() - 730 * 24 * 60 * 60 * 1000 - 1);
    expect(() => build({ now: tooEarly })).toThrow();
  });

  it("allows a trial end exactly 48 hours in the future", () => {
    const minimumDelay = new Date(recurringStart.getTime() - 48 * 60 * 60 * 1000);
    expect(build({ now: minimumDelay }).subscription_data?.trial_end).toBe(recurringStart.getTime() / 1000);
  });

  it("allows a trial end exactly 730 days in the future", () => {
    const maximumDelay = new Date(recurringStart.getTime() - 730 * 24 * 60 * 60 * 1000);
    expect(build({ now: maximumDelay }).subscription_data?.trial_end).toBe(recurringStart.getTime() / 1000);
  });
});
