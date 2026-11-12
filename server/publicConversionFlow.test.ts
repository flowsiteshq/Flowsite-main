import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), "utf8");

describe("public conversion flow", () => {
  it("routes acquisition paths through intake while keeping scheduling direct", () => {
    const app = source("client/src/App.tsx");
    const home = source("client/src/pages/Home.tsx");
    const aiServices = source("client/src/pages/AIServices.tsx");
    const navbar = source("client/src/components/Navbar.tsx");
    const freeWebsite = source("client/src/pages/FreeWebsite.tsx");
    const industries = source("client/src/components/IndustryLanding.tsx");

    expect(app).toContain('path="/get-started"');
    expect(app).toContain('leadCaptureHref({ intent: "Get started" })');
    expect(app).toContain('<Route path="/schedule" component={BookCall} />');
    expect(app).toContain('<Route path="/book-call" component={BookCall} />');
    expect(app).toContain('path="/ai-services" component={AIServices}');
    expect(home).toContain("href={`/get-started?package=${pkg.id}`}");
    expect(home).toContain('href="/#packages"');
    expect(aiServices).toContain("leadCaptureHref({ prompt:");
    expect(aiServices).toContain(
      'leadCaptureHref({ intent: "Discuss AI services" })'
    );
    expect(navbar).toContain('href="/free-website"');
    expect(freeWebsite).toContain(
      "trpc.freeWebsite.submitPreviewRequest.useMutation"
    );
    expect(freeWebsite).toContain('href="#preview-request"');
    expect(industries).toContain(
      "leadCaptureHref({ intent: `Discuss a ${config.name} website` })"
    );
  });

  it("keeps origin intent with the AI intake lead submission", () => {
    const intake = source("client/src/pages/AIIntake.tsx");
    expect(intake).toContain('const intent = params.get("intent") || ""');
    expect(intake).toContain(
      'const selectedPackage = params.get("package") || ""'
    );
    expect(intake).toContain("Requested next step:");
    expect(intake).toContain("Selected package:");
  });

  it("passes captured intake contact details into the editable scheduler form", () => {
    const intake = source("client/src/pages/AIIntake.tsx");
    const scheduler = source("client/src/pages/BookCall.tsx");
    expect(intake).toContain("name: data.ownerName");
    expect(intake).toContain("email: data.email");
    expect(intake).toContain("business: data.businessName");
    expect(intake).toContain('params.set("package", selectedPackage)');
    expect(intake).toContain("navigate(`/book-call?${params.toString()}`)");
    expect(scheduler).toContain('params.get("name")');
    expect(scheduler).toContain('params.get("email")');
    expect(scheduler).toContain("Review\n                        and edit anything before confirming.");
    expect(scheduler).toContain('websitePackage: selectedPackage');
    expect(scheduler).toContain("Prepay for my package");
    expect(scheduler).toContain('dueToday: "$548 due today"');
    expect(scheduler).toContain('dueToday: "$99 due today"');
  });

  it("does not fail after persistence when secondary notifications are unavailable", () => {
    const routers = source("server/routers.ts");
    expect(routers).toContain("Notifications are secondary to persistence");
    expect(routers).toContain("Confirmation email failed for submission");
    expect(routers).toContain("Owner notification failed for submission");
    expect(routers).toContain(
      "Owner notification unavailable; booking remains confirmed"
    );
  });
});
