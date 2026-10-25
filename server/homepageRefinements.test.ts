import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = (relative: string) => fs.readFileSync(path.resolve(process.cwd(), relative), "utf8");

describe("homepage premium refinements", () => {
  it("uses managed cinematic visuals and the authentic DojoFlow platform preview", () => {
    const home = source("client/src/pages/Home.tsx");
    const dojoflowPreview = path.resolve(process.cwd(), "client/public/dojoflow-platform-preview.webp");

    expect(home).toContain('const HERO_VISUAL = "/flowsites-cinematic-hero.webp"');
    expect(home).toContain('websites: "/flowsites-service-websites.webp"');
    expect(home).toContain('automation: "/flowsites-service-automation.webp"');
    expect(home).toContain('video: "/flowsites-service-video.webp"');
    expect(home).toContain('image: "/dojoflow-platform-preview.webp"');
    expect(home).toContain("DojoFlow platform preview shown across desktop and mobile devices");
    expect(home).not.toContain("dojoflow-hero-AdXSRFP2c2a4zAmpq8sKwr.webp");
    expect(fs.existsSync(dojoflowPreview)).toBe(true);
    expect(fs.statSync(dojoflowPreview).size).toBeGreaterThan(0);
    expect(fs.statSync(dojoflowPreview).size).toBeLessThan(1_000_000);
  });

  it("keeps package cards equal-height and preserves the selected package through intake", () => {
    const home = source("client/src/pages/Home.tsx");
    const leadCapture = source("client/src/lib/leadCapture.ts");
    const intake = source("client/src/pages/AIIntake.tsx");

    expect(home).toContain('id: "starter"');
    expect(home).toContain('id: "growth"');
    expect(home).toContain('id: "ai-business"');
    expect(home).toContain("min-h-[31rem]");
    expect(home).toContain("packageId: pkg.id");
    expect(home).toContain("We confirm scope and any ongoing fees before secure checkout.");
    expect(leadCapture).toContain("packageId?: string");
    expect(leadCapture).toContain('params.set("package", packageId.trim())');
    expect(intake).toContain('const selectedPackage = params.get("package") || ""');
    expect(intake).toContain("Selected package:");
  });

  it("makes delivery, revision, hosting, and third-party cost limits explicit", () => {
    const home = source("client/src/pages/Home.tsx");

    expect(home).toContain("Delivery terms, in plain language");
    expect(home).toContain("Available for qualifying standard sites once payment, scope, and complete materials are received.");
    expect(home).toContain("Revision rounds are limited to the agreed written scope; they are not unlimited.");
    expect(home).toContain("Separate ongoing costs unless specifically included in the final checkout.");
    expect(home).toContain("CRM, booking, messaging, payment, and AI subscriptions are billed by their providers unless included.");
  });

  it("adds a concise trust section without restoring unverified social proof", () => {
    const home = source("client/src/pages/Home.tsx");

    expect(home).toContain("Purpose before polish");
    expect(home).toContain("Scope before surprise costs");
    expect(home).toContain("One practical partner");
    expect(home).not.toContain("Trusted by 5,000+");
  });
});
