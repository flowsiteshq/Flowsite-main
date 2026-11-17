import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (file: string) =>
  readFileSync(resolve(process.cwd(), file), "utf8");

describe("portfolio page", () => {
  it("opens with the requested concise hero and keeps the approved project destinations", () => {
    const page = source("client/src/pages/Portfolio.tsx");
    expect(page).toContain("Our work");
    expect(page).toContain("Explore the websites and software built by FlowSites.");
    expect(page).toContain('name: "MyDojo Martial Arts"');
    expect(page).toContain('name: "DojoFlow"');
    expect(page).toContain('name: "Zolamind Counseling"');
    expect(page).toContain('name: "Don Bar Bakery"');
    expect(page).toContain('name: "Green Bahamas Life"');
    expect(page).not.toContain('name: "PolicyPilot"');
    expect(page).toContain('caseStudy: "/case-study/mydojo"');
    expect(page).toContain('caseStudy: "/case-study/dojoflow"');
    expect(page).toContain('caseStudy: "/case-study/zolamind"');
    expect(page).toContain('caseStudy: "/case-study/donbar"');
    expect(page).toContain('caseStudy: "/case-study/greenbahamas"');
  });

  it("does not publish the previously mismatched project image cards", () => {
    const page = source("client/src/pages/Portfolio.tsx");
    for (const name of [
      "Yaeger Self Defense of America",
      "HomeUp Services",
      "Aladdin Kebab Grill",
      "Stitched with Love",
      "ASLS Foundation",
      "Stylist Factory",
    ]) {
      expect(page).not.toContain(`name: "${name}"`);
    }
    expect(page).not.toContain("Additional project cards remain unpublished");
  });

  it("uses verified captures, a lead project, supporting cards, and one plans CTA", () => {
    const page = source("client/src/pages/Portfolio.tsx");
    expect(page).toContain("md:grid-cols-2");
    expect(page).toContain("aspect-[16/9]");
    expect(page).toContain("dojoflow-dashboard-landscape.webp");
    expect(page).toContain("mydojo-live.png");
    expect(page).toContain("zolamind-live.png");
    expect(page).toContain("donbar-live.png");
    expect(page).toContain("greenbahamas-live.png");
    expect(page).toContain("featured: true");
    expect(page).toContain("Let’s build your website");
    expect(page).toContain('href="/get-started"');
    expect(page).toContain("View Website Plans");
    expect(page).not.toContain("activeFilter");
    expect(page).not.toContain("results:");
    expect(page).not.toContain("categories");
  });
});
