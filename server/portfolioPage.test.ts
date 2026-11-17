import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("portfolio page", () => {
  it("opens with the concise hero and keeps the verified project records", () => {
    const page = source("client/src/pages/Portfolio.tsx");
    expect(page).toContain("Our work");
    expect(page).toContain("Explore the websites and software built by FlowSites.");
    for (const name of [
      "MyDojo Martial Arts",
      "DojoFlow",
      "Zolamind Counseling",
      "Don Bar Bakery",
      "Green Bahamas Life",
      "Creative Cyber Management",
    ]) {
      expect(page).toContain(`name: "${name}"`);
    }
    expect(page).toContain('caseStudy: "/case-study/mydojo"');
    expect(page).toContain('caseStudy: "/case-study/dojoflow"');
    expect(page).toContain('caseStudy: "/case-study/zolamind"');
    expect(page).toContain('caseStudy: "/case-study/donbar"');
    expect(page).toContain('caseStudy: "/case-study/greenbahamas"');
    expect(page).toContain('caseStudy: "https://creativecybermanagement.com/"');
  });

  it("does not publish the previously mismatched project image cards", () => {
    const page = source("client/src/pages/Portfolio.tsx");
    for (const name of [
      "PolicyPilot",
      "Yaeger Self Defense of America",
      "HomeUp Services",
      "Aladdin Kebab Grill",
      "Stitched with Love",
      "ASLS Foundation",
      "Stylist Factory",
    ]) {
      expect(page).not.toContain(`name: "${name}"`);
    }
  });

  it("uses clean live captures, equal cards, and one plans CTA", () => {
    const page = source("client/src/pages/Portfolio.tsx");
    expect(page).toContain("grid gap-x-8 gap-y-14 md:grid-cols-2");
    expect(page).toContain("aspect-[16/9]");
    expect(page).toContain("mydojo-clean_73756e46.png");
    expect(page).toContain("dojoflow-dashboard-landscape.webp");
    expect(page).toContain("zolamind-live.png");
    expect(page).toContain("donbar-live.png");
    expect(page).toContain("greenbahamas-clean_aa8f54da.png");
    expect(page).toContain("creativecyber-clean_44a4cf65.png");
    expect(page).not.toContain("featured: true");
    expect(page).toContain("Let’s build your website");
    expect(page).toContain('href="/get-started"');
    expect(page).toContain("View Website Plans");
    expect(page).not.toContain("activeFilter");
    expect(page).not.toContain("results:");
    expect(page).not.toContain("categories");
  });
});
