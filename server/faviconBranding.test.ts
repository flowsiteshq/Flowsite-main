import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("FlowSites favicon branding", () => {
  it("references the cache-safe FS favicon set and ships all icon sizes", () => {
    const root = process.cwd();
    const html = fs.readFileSync(path.resolve(root, "client/index.html"), "utf8");

    expect(html).toContain("favicon.ico?v=flowsites-fs-2026");
    expect(html).toContain("favicon-32.png?v=flowsites-fs-2026");
    expect(html).toContain("favicon-192.png?v=flowsites-fs-2026");
    expect(html).toContain("apple-touch-icon.png?v=flowsites-fs-2026");

    for (const filename of ["favicon.ico", "favicon-16.png", "favicon-32.png", "favicon-192.png", "apple-touch-icon.png"]) {
      const filePath = path.resolve(root, "client/public", filename);
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.statSync(filePath).size).toBeGreaterThan(100);
    }
  });
});
