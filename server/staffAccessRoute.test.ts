import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("FlowSites staff access routing", () => {
  const footer = source("client/src/components/Footer.tsx");
  const app = source("client/src/App.tsx");

  it("keeps the staff entry in the footer and points it to the protected sign-in route", () => {
    expect(footer).toContain('href="/flowsites-admin-secret"');
    expect(footer).toContain(">Admin access</Link>");
    expect(footer).not.toContain('href="/admin-login"');
  });

  it("continues to serve the earlier staff bookmark without exposing dashboard functionality", () => {
    expect(app).toContain('<Route path="/admin-login" component={AdminLogin} />');
    expect(app).toContain('<Route path="/flowsites-admin-secret" component={AdminLogin} />');
    expect(app).toContain('<Route path="/flowsites-admin-dashboard" component={AdminDashboard} />');
  });

  it("keeps both staff sign-in paths out of the public site shell", () => {
    const layout = source("client/src/components/Layout.tsx");
    expect(layout).toContain('"/admin-login"');
    expect(layout).toContain('"/flowsites-admin"');
  });
});
