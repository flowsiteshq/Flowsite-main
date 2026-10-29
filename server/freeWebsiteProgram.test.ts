import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = (relative: string) => fs.readFileSync(path.resolve(process.cwd(), relative), "utf8");

describe("Free Website Program", () => {
  it("keeps the public offer transparent and avoids automatic enrollment", () => {
    const page = source("client/src/pages/FreeWebsite.tsx");

    expect(page).toContain("Your business deserves an amazing website.");
    expect(page).toContain("We’ll build it for free.");
    expect(page).toContain("Plans start at");
    expect(page).toContain("12-month service commitment");
    expect(page).toContain("No subscription or payment created by this form");
    expect(page).toContain("No payment details are collected here.");
    expect(page).toContain("Cue AI chat is being introduced");
  });

  it("records optional SMS consent evidence and request details without a payment workflow", () => {
    const router = source("server/routers/freeWebsiteRouter.ts");
    const schema = source("drizzle/schema.ts");

    expect(router).toContain("marketingSmsConsent: z.boolean().default(false)");
    expect(router).toContain("marketingConsentAt: input.marketingSmsConsent ? new Date() : null");
    expect(router).toContain('consentDisclosureVersion: input.marketingSmsConsent ? consentDisclosureVersion : null');
    expect(router).toContain("Free Website Program request.");
    expect(router).not.toContain("stripe");
    expect(schema).toContain('free_website_preview_requests');
    expect(schema).toContain('marketingSmsConsent');
    expect(schema).toContain('consentDisclosureVersion');
  });

  it("registers the dedicated landing page, API, and public navigation destination", () => {
    const app = source("client/src/App.tsx");
    const routers = source("server/routers.ts");
    const navbar = source("client/src/components/Navbar.tsx");

    expect(app).toContain('path="/free-website" component={FreeWebsite}');
    expect(routers).toContain("freeWebsite: freeWebsiteRouter");
    expect(navbar).toContain('{ href: "/free-website", label: "Free Website" }');
    expect(navbar).toContain('href="/free-website"');
  });
});
