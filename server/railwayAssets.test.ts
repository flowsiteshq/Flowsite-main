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
  it("bundles the FlowSites logo for static serving", () => {
    const logoPath = path.join(projectRoot, "client", "public", "flowsites-logo.png");
    expect(fs.existsSync(logoPath)).toBe(true);
    expect(fs.statSync(logoPath).size).toBeGreaterThan(0);
    expect(fs.statSync(logoPath).size).toBeLessThan(1_000_000);
  });

  it("bundles all five trust-bar avatar graphics", () => {
    for (let index = 1; index <= 5; index += 1) {
      const avatarPath = path.join(projectRoot, "client", "public", "avatars", `avatar${index}.jpg`);
      expect(fs.existsSync(avatarPath)).toBe(true);
      expect(fs.statSync(avatarPath).size).toBeGreaterThan(0);
    }
  });

  it("does not use Manus-only storage paths in client source", () => {
    const sourceFiles = walk(clientSource).filter(file => /\.(ts|tsx)$/.test(file));
    const contents = sourceFiles.map(file => fs.readFileSync(file, "utf8")).join("\n");
    const navbar = fs.readFileSync(path.join(clientSource, "components", "Navbar.tsx"), "utf8");

    expect(contents).not.toContain("/manus-storage/");
    expect(contents).toContain('src="/flowsites-logo.png"');
    expect(contents).toContain('"/avatars/avatar1.jpg"');
    expect(navbar).toContain("h-12 sm:h-14");
  });
});
