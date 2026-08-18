import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");
const readSource = (relativePath: string) => fs.readFileSync(path.join(projectRoot, relativePath), "utf8");

describe("homepage layout cleanup", () => {
  it("uses only the shared footer and removes the exit-intent popup overlay", () => {
    const app = readSource("client/src/App.tsx");
    const home = readSource("client/src/pages/Home.tsx");
    const footer = readSource("client/src/components/Footer.tsx");

    expect(app).not.toContain("ExitIntentPopup");
    expect(home).not.toContain("<footer");
    expect(footer).toContain('src="/flowsites-logo.png"');
    expect(footer).toContain("h-12");
  });
});
