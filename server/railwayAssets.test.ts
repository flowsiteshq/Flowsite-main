import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const clientSource = path.join(projectRoot, "client", "src");

function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

describe("Railway production assets", () => {
  it("bundles the transparent FlowSites logo for static serving", () => {
    const logoPath = path.join(projectRoot, "client", "public", "flowsites-logo-transparent.png");
    expect(fs.existsSync(logoPath)).toBe(true);
    expect(fs.statSync(logoPath).size).toBeGreaterThan(0);
    expect(fs.statSync(logoPath).size).toBeLessThan(1_000_000);
    // PNG IHDR color type 6 denotes RGBA, preventing a white RGB background matte.
    expect(fs.readFileSync(logoPath)[25]).toBe(6);
  });

  it("bundles all five trust-bar avatar graphics", () => {
    for (let index = 1; index <= 5; index += 1) {
      const avatarPath = path.join(projectRoot, "client", "public", "avatars", `avatar${index}.jpg`);
      expect(fs.existsSync(avatarPath)).toBe(true);
      expect(fs.statSync(avatarPath).size).toBeGreaterThan(0);
    }
  });

  it("bundles the refined website, platform, and cinematic assets", () => {
    for (const fileName of [
      "flowsites-site-preview.webp",
      "dojoflow-platform-preview.webp",
      "flowsites-cinematic-hero.webp",
      "flowsites-service-websites.webp",
      "flowsites-service-automation.webp",
      "flowsites-service-video.webp",
    ]) {
      const assetPath = path.join(projectRoot, "client", "public", fileName);
      expect(fs.existsSync(assetPath)).toBe(true);
      expect(fs.statSync(assetPath).size).toBeGreaterThan(0);
      expect(fs.statSync(assetPath).size).toBeLessThan(1_000_000);
    }
  });

  it("does not use Manus-only storage paths in client source", () => {
    const sourceFiles = walk(clientSource).filter(file => /\.(ts|tsx)$/.test(file));
    const contents = sourceFiles.map(file => fs.readFileSync(file, "utf8")).join("\n");
    const navbar = fs.readFileSync(path.join(clientSource, "components", "Navbar.tsx"), "utf8");
    const home = fs.readFileSync(path.join(clientSource, "pages", "Home.tsx"), "utf8");

    expect(contents).not.toContain("/manus-storage/");
    expect(contents).toContain('src="/flowsites-logo-transparent.png"');
    expect(contents).not.toContain('src="/flowsites-logo.png"');
    expect(home).toContain("MyDojo Martial Arts");
    expect(home).toContain("mydojo-hero_ba21ac04.png");
    expect(home).toContain("/flowsites-cinematic-hero.webp");
    expect(home).toContain("/flowsites-service-websites.webp");
    expect(home).toContain("/dojoflow-platform-preview.webp");
    expect(navbar).toContain("h-11 w-auto");
  });
});
