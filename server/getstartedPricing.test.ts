/**
 * Tests for GetStarted wizard pricing logic:
 * - Included add-ons should NOT be added to the base price
 * - Non-included add-ons should be added to the base price
 */

import { describe, it, expect } from "vitest";

// Mirror the data structures from GetStarted.tsx
interface AddOn { id: string; label: string; price: number; description?: string }

const BASE_PACKAGES = [
  {
    id: "launch", name: "Launch Site", price: 599,
    includedAddons: [] as string[],
  },
  {
    id: "growth", name: "Growth Site", price: 1497,
    includedAddons: ["gallery_portfolio","testimonials_section","faq_section","blog_setup","custom_homepage_section","analytics_setup"],
  },
  {
    id: "conversion", name: "Conversion Site", price: 2997,
    includedAddons: ["gallery_portfolio","testimonials_section","faq_section","blog_setup","custom_homepage_section","analytics_setup","crm_integration","booking_system","email_automation","lead_pipeline","popup_lead_capture","google_reviews"],
  },
  {
    id: "bos", name: "Business Operating System", price: 4997,
    includedAddons: ["gallery_portfolio","testimonials_section","faq_section","blog_setup","custom_homepage_section","analytics_setup","crm_integration","booking_system","email_automation","lead_pipeline","popup_lead_capture","google_reviews","member_portal","admin_dashboard","stripe_payments","sms_automation","ai_chatbot","review_automation"],
  },
];

const CORE_ADDONS: AddOn[] = [
  { id: "gallery_portfolio",        label: "Gallery / Portfolio",             price: 250 },
  { id: "testimonials_section",     label: "Testimonials Section",            price: 99 },
  { id: "faq_section",              label: "FAQ Section",                     price: 75 },
  { id: "blog_setup",               label: "Blog Setup",                      price: 299 },
  { id: "custom_homepage_section",  label: "Custom Homepage Section",         price: 350 },
  { id: "analytics_setup",          label: "Analytics & Tracking Setup",      price: 149 },
  { id: "extra_page",               label: "Extra Page",                      price: 75 },
];

const AUTO_ADDONS: AddOn[] = [
  { id: "crm_integration",          label: "CRM Integration",                 price: 599 },
  { id: "booking_system",           label: "Booking / Appointment System",    price: 399 },
  { id: "email_automation",         label: "Email Automation Sequences",      price: 399 },
  { id: "lead_pipeline",            label: "Lead Pipeline / CRM Dashboard",   price: 499 },
  { id: "popup_lead_capture",       label: "Popup / Lead Capture Modal",      price: 149 },
  { id: "google_reviews",           label: "Google Reviews Display",          price: 99 },
  { id: "member_portal",            label: "Member / Client Portal",          price: 999 },
  { id: "admin_dashboard",          label: "Custom Admin Dashboard",          price: 999 },
  { id: "stripe_payments",          label: "Stripe Payment Integration",      price: 399 },
  { id: "sms_automation",           label: "SMS Automation Sequences",        price: 249 },
  { id: "ai_chatbot",               label: "AI Chatbot",                      price: 499 },
  { id: "review_automation",        label: "Review Request Automation",       price: 149 },
  { id: "referral_program",         label: "Referral Program Setup",          price: 299 },
];

/**
 * Mirrors the totals computation from GetStarted.tsx
 */
function computePrice(
  packageId: string,
  selectedCoreIds: string[],
  selectedAutoIds: string[],
): number {
  const pkg = BASE_PACKAGES.find(p => p.id === packageId);
  if (!pkg) return 0;
  let buildPrice = pkg.price;
  const included = new Set(pkg.includedAddons);

  const allSelected = [
    ...selectedCoreIds.map(id => CORE_ADDONS.find(a => a.id === id)),
    ...selectedAutoIds.map(id => AUTO_ADDONS.find(a => a.id === id)),
  ].filter(Boolean) as AddOn[];

  for (const a of allSelected) {
    if (!included.has(a.id)) buildPrice += a.price;
  }
  return buildPrice;
}

describe("GetStarted wizard pricing logic", () => {
  it("Launch package: no included add-ons, extra page adds to price", () => {
    const base = computePrice("launch", [], []);
    expect(base).toBe(599);

    const withExtra = computePrice("launch", ["extra_page"], []);
    expect(withExtra).toBe(599 + 75);
  });

  it("Growth package: included add-ons do NOT add to price", () => {
    // Selecting gallery_portfolio (included) should NOT increase the price
    const withIncluded = computePrice("growth", ["gallery_portfolio", "testimonials_section"], []);
    expect(withIncluded).toBe(1497); // No extra charge

    // Selecting extra_page (NOT included) SHOULD increase the price
    const withExtra = computePrice("growth", ["extra_page"], []);
    expect(withExtra).toBe(1497 + 75);
  });

  it("Growth package: non-included add-ons add to price correctly", () => {
    // referral_program is not included in growth
    const withReferral = computePrice("growth", [], ["referral_program"]);
    expect(withReferral).toBe(1497 + 299);
  });

  it("Conversion package: all growth included add-ons + automation stack are free", () => {
    const withAllIncluded = computePrice(
      "conversion",
      ["gallery_portfolio", "testimonials_section", "faq_section", "blog_setup", "custom_homepage_section", "analytics_setup"],
      ["crm_integration", "booking_system", "email_automation", "lead_pipeline", "popup_lead_capture", "google_reviews"]
    );
    expect(withAllIncluded).toBe(2997); // All included, no extra charge
  });

  it("Conversion package: non-included add-ons still add to price", () => {
    const withMemberPortal = computePrice("conversion", [], ["member_portal"]);
    expect(withMemberPortal).toBe(2997 + 999);
  });

  it("BOS package: all add-ons included, nothing adds to price", () => {
    const withAll = computePrice(
      "bos",
      ["gallery_portfolio", "testimonials_section", "faq_section", "blog_setup", "custom_homepage_section", "analytics_setup"],
      ["crm_integration", "booking_system", "email_automation", "lead_pipeline", "popup_lead_capture", "google_reviews", "member_portal", "admin_dashboard", "stripe_payments", "sms_automation", "ai_chatbot", "review_automation"]
    );
    expect(withAll).toBe(4997); // All included, no extra charge

    // referral_program is NOT in BOS included list
    const withReferral = computePrice("bos", [], ["referral_program"]);
    expect(withReferral).toBe(4997 + 299);
  });

  it("Selecting included add-ons on growth package never inflates price", () => {
    // Simulate user selecting all growth included add-ons (as if they clicked them)
    const price = computePrice(
      "growth",
      ["gallery_portfolio", "testimonials_section", "faq_section", "blog_setup", "custom_homepage_section", "analytics_setup"],
      []
    );
    expect(price).toBe(1497);
  });
});
