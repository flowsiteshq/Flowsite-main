import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = (relative: string) => fs.readFileSync(path.resolve(process.cwd(), relative), "utf8");

describe("primary light surfaces", () => {
  it("uses a light AI intake and shared footer", () => {
    const intake = source("client/src/pages/AIIntake.tsx");
    const footer = source("client/src/components/Footer.tsx");

    expect(intake).toContain('min-h-screen bg-[#f6f9ff]');
    expect(intake).not.toContain('min-h-screen bg-[#0a0a0f]');
    expect(footer).toContain('bg-white text-slate-900');
    expect(footer).not.toContain('bg-[oklch(0.10_0.008_260)]');
  });
});
