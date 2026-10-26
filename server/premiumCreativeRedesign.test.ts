import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = (relative: string) => fs.readFileSync(path.resolve(process.cwd(), relative), "utf8");

describe("premium creative direction homepage", () => {
  it("implements the approved editorial hero and cinematic service composition", () => {
    const home = source("client/src/pages/Home.tsx");

    expect(home).toContain("Your Vision.");
    expect(home).toContain("Engineered");
    expect(home).toContain("Into Reality.");
    expect(home).toContain("High-performance websites. Intelligent AI automation. Cinematic video production.");
    expect(home).toContain("Explore our services");
    expect(home).toContain("View our work");
    expect(home).toContain("Website Design & Development");
    expect(home).toContain("AI Business Automation");
    expect(home).toContain("AI Video Production");
    expect(home).toContain("bg-[#020814]");
  });

  it("keeps the AI Video Studio showcase interactive, honest, and motion-conscious", () => {
    const home = source("client/src/pages/Home.tsx");

    expect(home).toContain("Original FlowSites demonstration concepts.");
    expect(home).toContain("The gallery uses real, playable FlowSites demonstration clips—not static placeholders.");
    expect(home).toContain('href="/ai-video-studio#video-order"');
    expect(home).toContain("prefers-reduced-motion: reduce");
    expect(home).toContain('preload={allowHoverPlayback ? "metadata" : "none"}');
    expect(home).toContain("mobile and reduced-motion visitors initiate playback themselves.");
  });

  it("preserves direct destinations for the three public service pillars", () => {
    const home = source("client/src/pages/Home.tsx");
    const navbar = source("client/src/components/Navbar.tsx");
    const footer = source("client/src/components/Footer.tsx");

    expect(home).toContain('href="/#packages" action="Explore website packages"');
    expect(home).toContain('href="/ai-services" action="Explore AI services"');
    expect(home).toContain('href="/ai-video-studio" action="Explore AI Video Studio"');
    expect(home).toContain('href="/portfolio"');
    expect(home).toContain('href="/ai-video-studio#video-order"');
    expect(home).toContain('leadCaptureHref({ intent: `Start the ${pkg.name} package`, packageId: pkg.id })');
    expect(home).toContain("trpc.contact.submit.useMutation");
    expect(navbar).toContain('href="/client-billing"');
    expect(navbar).not.toContain('href={getGoogleLoginUrl("/client-portal")}');
    expect(navbar).not.toContain("function getGoogleLoginUrl");
    expect(navbar).not.toContain("Log in");
    expect(footer).toContain('href="/flowsites-admin-secret"');
    expect(footer).toContain("Admin access");
    expect(footer).not.toContain('href="/flowsites-admin-dashboard"');
  });
});
