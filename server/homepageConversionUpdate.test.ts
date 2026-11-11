import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = (relative: string) => fs.readFileSync(path.resolve(process.cwd(), relative), "utf8");

describe("homepage conversion update", () => {
  it("presents transparent productized packages and qualifying turnaround terms", () => {
    const home = source("client/src/pages/Home.tsx");

    expect(home).toContain('name: "Pay & Save"');
    expect(home).toContain('monthly: "$49/month"');
    expect(home).toContain('name: "Launch Now"');
    expect(home).toContain('monthly: "$99/month"');
    expect(home).toContain("Pay & Save is $548 initially");
    expect(home).toContain("Launch Now is $99 initially");
    expect(home).toContain("48-hour qualifying delivery");
    expect(home).toContain("Secure checkout shows the full initial charge and applicable terms before payment.");
  });

  it("submits free website reviews into the established CRM notification path", () => {
    const home = source("client/src/pages/Home.tsx");
    const router = source("server/routers.ts");

    expect(home).toContain("trpc.contact.submit.useMutation");
    expect(home).toContain("Get my free review");
    expect(home).toContain("Enter an email address or phone number so we can reply.");
    expect(router).toContain('contact: router({');
    expect(router).toContain("An email address or phone number is required");
    expect(router).toContain('title: `New Contact Form: ${input.businessName}`');
  });

  it("keeps the requested primary navigation and dedicated AI services route", () => {
    const navbar = source("client/src/components/Navbar.tsx");

    expect(navbar).toContain('{ href: "/#packages", label: "Website Packages" }');
    expect(navbar).toContain('{ href: "/ai-services", label: "AI Services" }');
    expect(navbar).toContain('{ href: "/ai-video-studio", label: "AI Video Studio" }');
    expect(navbar).toContain('{ href: "/portfolio", label: "Portfolio" }');
    expect(navbar).toContain('{ href: "/contact", label: "Contact" }');
    expect(navbar).toContain("Client portal");
  });

  it("uses real project previews instead of unverified social-proof or dashboard claims", () => {
    const home = source("client/src/pages/Home.tsx");

    expect(home).toContain("MyDojo Martial Arts");
    expect(home).toContain("DojoFlow platform preview shown across desktop and mobile devices");
    expect(home).toContain("Featured work built around a clear customer journey.");
    expect(home).not.toContain("Trusted by <span");
    expect(home).not.toContain("5,000+");
    expect(home).not.toContain("AI runs the rest.");
  });
});
