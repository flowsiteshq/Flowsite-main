import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = (relative: string) => fs.readFileSync(path.resolve(process.cwd(), relative), "utf8");

describe("public conversion flow", () => {
  it("routes public acquisition paths through the AI business-needs intake", () => {
    const app = source("client/src/App.tsx");
    const home = source("client/src/pages/Home.tsx");
    const aiServices = source("client/src/pages/AIServices.tsx");
    const navbar = source("client/src/components/Navbar.tsx");
    const freeWebsite = source("client/src/pages/FreeWebsite.tsx");
    const industries = source("client/src/components/IndustryLanding.tsx");

    expect(app).toContain('path="/get-started"');
    expect(app).toContain('leadCaptureHref({ intent: "Get started" })');
    expect(app).toContain('leadCaptureHref({ intent: "Schedule a strategy call" })');
    expect(app).toContain('path="/ai-services" component={AIServices}');
    expect(home).toContain('leadCaptureHref({ intent: `Start the ${pkg.name} package`, packageId: pkg.id })');
    expect(home).toContain('href="/#packages"');
    expect(aiServices).toContain("leadCaptureHref({ prompt:");
    expect(aiServices).toContain('leadCaptureHref({ intent: "Discuss AI services" })');
    expect(navbar).toContain('href="/free-website"');
    expect(freeWebsite).toContain("trpc.freeWebsite.submitPreviewRequest.useMutation");
    expect(freeWebsite).toContain('href="#preview-request"');
    expect(industries).toContain("leadCaptureHref({ intent: `Discuss a ${config.name} website` })");
  });

  it("keeps origin intent with the AI intake lead submission", () => {
    const intake = source("client/src/pages/AIIntake.tsx");
    expect(intake).toContain('const intent = params.get("intent") || ""');
    expect(intake).toContain('const selectedPackage = params.get("package") || ""');
    expect(intake).toContain("Requested next step:");
    expect(intake).toContain("Selected package:");
  });
});
