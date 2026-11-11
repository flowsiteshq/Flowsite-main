/**
 * FlowSites Stripe Products & Prices
 *
 * Website packages are intentionally separate from the existing recurring
 * service catalog. Existing customer subscriptions must not be changed.
 */

export type TierKey = "launch" | "growth" | "authority";
export type WebsitePackageKey = "pay_save" | "launch_now";

export interface Tier {
  name: string;
  buildAmountCents: number;
  monthlyAmountCents: number;
  financeMonthlyBuildCents: number;
  description: string;
}

/** Legacy tiers retained for existing links and internal compatibility. */
export const TIERS: Record<TierKey, Tier> = {
  launch: { name: "Launch", buildAmountCents: 120000, monthlyAmountCents: 7900, financeMonthlyBuildCents: 10000, description: "Legacy Launch website package" },
  growth: { name: "Growth", buildAmountCents: 240000, monthlyAmountCents: 12900, financeMonthlyBuildCents: 20000, description: "Legacy Growth website package" },
  authority: { name: "Authority", buildAmountCents: 390000, monthlyAmountCents: 17900, financeMonthlyBuildCents: 32500, description: "Legacy Authority website package" },
};

export interface WebsitePackage {
  key: WebsitePackageKey;
  name: string;
  setupAmountCents: number;
  monthlyAmountCents: number;
  initialAmountCents: number;
  commitmentMonths: number | null;
  badge: string;
  description: string;
  features: string[];
}

const SHARED_FEATURES = [
  "Professional website with up to 5 pages",
  "Modern, mobile-responsive design",
  "Business branding and color customization",
  "Contact forms and lead capture",
  "Click-to-call functionality",
  "Social media integration",
  "Basic SEO configuration",
  "Managed website hosting",
  "SSL certificate",
  "Routine website maintenance",
  "Website backups",
  "Standard email support",
  "Two consolidated design revision rounds",
];

export const WEBSITE_PACKAGES: Record<WebsitePackageKey, WebsitePackage> = {
  pay_save: {
    key: "pay_save",
    name: "Pay & Save",
    setupAmountCents: 49900,
    monthlyAmountCents: 4900,
    initialAmountCents: 54800,
    commitmentMonths: null,
    badge: "Lower Monthly Cost",
    description: "$499 setup, then $49/month with no annual commitment.",
    features: SHARED_FEATURES,
  },
  launch_now: {
    key: "launch_now",
    name: "Launch Now",
    setupAmountCents: 0,
    monthlyAmountCents: 9900,
    initialAmountCents: 9900,
    commitmentMonths: 12,
    badge: "No Upfront Setup Fee",
    description: "$0 setup, then $99/month with a 12-month service commitment.",
    features: SHARED_FEATURES,
  },
};
