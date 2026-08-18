import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("admin CRM theme defaults", () => {
  it("starts new dashboard sessions in the bright light workspace", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "client/src/pages/AdminDashboard.tsx"),
      "utf8",
    );

    expect(source).toContain('useState<"dark" | "light">("light")');
    expect(source).not.toContain('admin_dashboard_theme_v2');
    expect(source).toContain('const isDark = false;');
    expect(source).toContain('Bright workspace');
  });
});
