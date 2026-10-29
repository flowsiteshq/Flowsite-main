import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("Admin 3.1 Knowledge Center", () => {
  it("keeps the additive migration separate from the legacy Drizzle journal", () => {
    const migration = read("database/feature-migrations/2026-10-29-admin-31-knowledge-center.sql");
    const ledger = read("database/feature-migrations/README.md");
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS knowledge_articles");
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS admin_notifications");
    expect(migration).not.toMatch(/DROP TABLE|DELETE FROM|UPDATE client_accounts|UPDATE client_invoices/i);
    expect(ledger).toContain("2026-10-29-admin-31-knowledge-center");
  });

  it("keeps the established CRM Knowledge Center as the primary Admin route", () => {
    const router = read("server/routers/adminKnowledgeRouter.ts");
    const app = read("client/src/App.tsx");
    const shell = read("client/src/components/AdminCommandShell.tsx");
    expect(router).toContain("assertStrictAdminAccess");
    expect(router).toContain("markCueSync");
    expect(router).toContain("getCuePublishedKnowledge");
    expect(app).toContain("/flowsites-admin-knowledge");
    expect(app).toContain('path="/flowsites-admin-knowledge" component={AdminDashboard}');
    expect(read("client/src/pages/AdminDashboard.tsx")).toContain('window.location.pathname === "/flowsites-admin-knowledge" ? "knowledgeCenter" : "leads"');
    expect(shell).toContain("Knowledge Center");
    expect(shell).toContain("bg-white text-gray-900");
    expect(shell).toContain("border-black bg-black text-white");
  });

  it("states the provider truth boundary in the reconciliation UI", () => {
    const router = read("server/routers/adminCommandCenterRouter.ts");
    const page = read("client/src/pages/AdminCommandCenterPages.tsx");
    expect(router).toContain("financialReconciliation");
    expect(router).toContain("stripeSubscriptionVerified");
    expect(page).toContain("Provider-side Stripe truth is intentionally not inferred");
    expect(page).toContain("/flowsites-admin-billing?accountId=");
  });
});
