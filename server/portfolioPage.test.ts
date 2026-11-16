import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (file: string) =>
  readFileSync(resolve(process.cwd(), file), "utf8");

describe("portfolio page", () => {
  it("opens with the requested work-first hero and keeps the approved featured projects", () => {
    const page = source("client/src/pages/Portfolio.tsx");
    expect(page).toContain("Websites and software we&apos;ve built.");
    expect(page).toContain("Website design, booking, CRM, and automation");
    expect(page).toContain('name: "MyDojo Martial Arts"');
    expect(page).toContain('name: "DojoFlow"');
    expect(page).toContain('name: "Zolamind Counseling"');
    expect(page).toContain('href: "/case-study/mydojo"');
    expect(page).toContain('href: "/case-study/dojoflow"');
    expect(page).toContain('href: "/case-study/zolamind"');
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
    expect(page).toContain("Additional project cards remain unpublished");
  });

  it("ends with one plans CTA and no legacy filter or stat UI", () => {
    const page = source("client/src/pages/Portfolio.tsx");
    expect(page).toContain("Let&apos;s build your website");
    expect(page).toContain('href="/#packages"');
    expect(page).toContain("View Website Plans");
    expect(page).not.toContain("activeFilter");
    expect(page).not.toContain("results:");
    expect(page).not.toContain("categories");
  });
});
