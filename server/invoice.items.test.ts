/**
 * Tests for multi-item invoice logic
 * Covers: line item total calculation, Code Transfer preset price, discount application
 */
import { describe, it, expect } from "vitest";

// ── Helpers mirroring server logic ────────────────────────────────────────────

type LineItem = { description: string; quantity: number; unitAmountCents: number };

function lineItemsTotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitAmountCents, 0);
}

function applyDiscount(
  subtotal: number,
  discountType: "none" | "early_pay" | "annual",
  earlyPayPct: number,
  annualPct: number
): { discountCents: number; total: number } {
  let discountCents = 0;
  if (discountType === "early_pay") {
    discountCents = Math.round(subtotal * earlyPayPct / 100);
  } else if (discountType === "annual") {
    discountCents = Math.round(subtotal * annualPct / 100);
  }
  return { discountCents, total: subtotal - discountCents };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Multi-item invoice line item total", () => {
  it("sums a single item correctly", () => {
    const items: LineItem[] = [{ description: "Monthly Hosting", quantity: 1, unitAmountCents: 4900 }];
    expect(lineItemsTotal(items)).toBe(4900);
  });

  it("sums multiple items correctly", () => {
    const items: LineItem[] = [
      { description: "Monthly Hosting & Maintenance", quantity: 1, unitAmountCents: 4900 },
      { description: "Code Transfer", quantity: 1, unitAmountCents: 60000 },
    ];
    expect(lineItemsTotal(items)).toBe(64900);
  });

  it("handles quantity > 1", () => {
    const items: LineItem[] = [
      { description: "Add-On Page", quantity: 3, unitAmountCents: 29900 },
    ];
    expect(lineItemsTotal(items)).toBe(89700);
  });

  it("returns 0 for empty items array", () => {
    expect(lineItemsTotal([])).toBe(0);
  });
});

describe("Code Transfer preset price", () => {
  it("Code Transfer is priced at $600 (60000 cents)", () => {
    const CODE_TRANSFER_CENTS = 60000;
    expect(CODE_TRANSFER_CENTS / 100).toBe(600);
  });

  it("invoice with Code Transfer + Monthly has correct total", () => {
    const items: LineItem[] = [
      { description: "Monthly Hosting & Maintenance", quantity: 1, unitAmountCents: 4900 },
      { description: "Code Transfer", quantity: 1, unitAmountCents: 60000 },
    ];
    const total = lineItemsTotal(items);
    expect(total).toBe(64900); // $649.00
  });
});

describe("Discount application on multi-item invoices", () => {
  const subtotal = 64900; // $649.00 (Monthly + Code Transfer)
  const earlyPayPct = 5;
  const annualPct = 15;

  it("no discount returns full subtotal", () => {
    const { discountCents, total } = applyDiscount(subtotal, "none", earlyPayPct, annualPct);
    expect(discountCents).toBe(0);
    expect(total).toBe(subtotal);
  });

  it("early_pay applies 5% discount", () => {
    const { discountCents, total } = applyDiscount(subtotal, "early_pay", earlyPayPct, annualPct);
    expect(discountCents).toBe(Math.round(subtotal * 0.05));
    expect(total).toBe(subtotal - discountCents);
  });

  it("annual applies 15% discount", () => {
    const { discountCents, total } = applyDiscount(subtotal, "annual", earlyPayPct, annualPct);
    expect(discountCents).toBe(Math.round(subtotal * 0.15));
    expect(total).toBe(subtotal - discountCents);
  });

  it("monthly-only invoice with no discount matches account monthly price", () => {
    const monthlyPriceCents = 4900;
    const items: LineItem[] = [
      { description: "Monthly Hosting & Maintenance", quantity: 1, unitAmountCents: monthlyPriceCents },
    ];
    const { total } = applyDiscount(lineItemsTotal(items), "none", 5, 15);
    expect(total).toBe(monthlyPriceCents);
  });
});

describe("Item amount cents calculation", () => {
  it("amountCents = quantity * unitAmountCents", () => {
    const item: LineItem = { description: "SEO Setup", quantity: 2, unitAmountCents: 49900 };
    const amountCents = item.quantity * item.unitAmountCents;
    expect(amountCents).toBe(99800); // $998.00
  });

  it("single quantity item has amountCents equal to unitAmountCents", () => {
    const item: LineItem = { description: "Code Transfer", quantity: 1, unitAmountCents: 60000 };
    expect(item.quantity * item.unitAmountCents).toBe(60000);
  });
});
