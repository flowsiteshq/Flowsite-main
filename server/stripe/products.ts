/**
 * FlowSites Stripe Products & Prices
 *
 * Each tier has:
 *  - A one-time build fee (Stripe Payment Intent / price_data)
 *  - A recurring monthly hosting fee (Stripe Subscription / price_data)
 *
 * These are created dynamically via price_data so no pre-created
 * Stripe products are required. Update amounts here to keep everything in sync.
 */

export type TierKey = "launch" | "growth" | "authority";

export interface Tier {
  name: string;
  buildAmountCents: number;      // one-time build fee in cents
  monthlyAmountCents: number;    // recurring monthly fee in cents
  financeMonthlyBuildCents: number; // 12-month instalment of build fee in cents
  description: string;
}

export const TIERS: Record<TierKey, Tier> = {
  launch: {
    name: "Launch",
    buildAmountCents: 120000,        // $1,200
    monthlyAmountCents: 7900,        // $79/mo
    financeMonthlyBuildCents: 10000, // $100/mo × 12
    description: "Custom 5-page website with basic CRM integration",
  },
  growth: {
    name: "Growth",
    buildAmountCents: 240000,        // $2,400
    monthlyAmountCents: 12900,       // $129/mo
    financeMonthlyBuildCents: 20000, // $200/mo × 12
    description: "Custom 10-page website with full CRM integration and automation",
  },
  authority: {
    name: "Authority",
    buildAmountCents: 390000,        // $3,900
    monthlyAmountCents: 17900,       // $179/mo
    financeMonthlyBuildCents: 32500, // $325/mo × 12
    description: "Unlimited pages with complete automation suite and multi-location support",
  },
};
