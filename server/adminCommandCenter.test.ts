import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("Admin 3.0 command center", () => {
  it("uses a strict administrator gate for each new read model", () => {
    const router = read("server/routers/adminCommandCenterRouter.ts");
    const guard = read("server/adminCommandCenterAuth.ts");

    expect(router).toContain('await assertStrictAdminAccess(ctx);');
    expect(router.match(/await assertStrictAdminAccess\(ctx\);/g)?.length).toBeGreaterThanOrEqual(5);
    expect(guard).toContain('technician.role === "admin"');
    expect(guard).toContain('ctx.user?.role === "admin"');
    expect(guard).not.toContain('x-admin-token');
  });

  it("keeps high-volume customer, invoice, lead, and project reads server-bounded", () => {
    const router = read("server/routers/adminCommandCenterRouter.ts");

    expect(router).toContain('max(50)');
    expect(router).toContain('max(10).default(10)');
    expect(router).toContain('nextCursor');
    expect(router.match(/\.limit\(input\.pageSize \+ 1\)/g)?.length).toBeGreaterThanOrEqual(3);
    expect(router).toContain('.offset(offset)');
    expect(router).toContain('isNull(clientAccounts.removedAt)');
    expect(router).toContain('isNull(wizardSubmissions.removedAt)');
  });

  it("shows source-backed financial disclosure instead of inventing reconciled Stripe facts", () => {
    const router = read("server/routers/adminCommandCenterRouter.ts");
    const page = read("client/src/pages/AdminCommandCenterPages.tsx");

    expect(router).toContain('Configured monthly amount on active local accounts');
    expect(router).toContain('Credits, refunds, partial payments, and write-offs are not modeled');
    expect(router).toContain('count(distinct ${clientInvoices.clientAccountId})');
    expect(router).toContain('lt(clientInvoices.dueDate, today)');
    expect(router).toContain("clientInvoices.status} = 'open' and ${clientInvoices.dueDate} < ${today}");
    expect(page).toContain('not verified MRR');
    expect(page).toContain('Gross local open invoice value');
    expect(page).toContain('local invoice records');
  });

  it("uses exactly the four requested overview cards and routes each to source records", () => {
    const page = read("client/src/pages/AdminCommandCenterPages.tsx");

    expect(page).toContain('label="Active customers"');
    expect(page).toContain('label="Monthly revenue"');
    expect(page).toContain('label="Outstanding balance"');
    expect(page).toContain('label="Overdue accounts"');
    expect(page).not.toContain('label="Active services"');
    expect(page).not.toContain('label="Configured MRR"');
    expect(page).toContain('href="/flowsites-admin-billing?status=overdue"');
  });

  it("keeps customer creation local and does not represent it as a provider charge", () => {
    const page = read("client/src/pages/AdminCommandCenterPages.tsx");
    const billingRouter = read("server/routers/clientBillingRouter.ts");

    expect(page).toContain('+ Add Customer');
    expect(page).toContain('Create local customer');
    expect(page).toContain('does not create a Stripe customer or subscription');
    expect(billingRouter).toContain('An active customer record already uses this business name or email.');
    expect(billingRouter).toContain('monthlyPriceCents: z.number().int().min(100)');
  });

  it("keeps global search bounded and makes Settings a primary command-center route", () => {
    const router = read("server/routers/adminCommandCenterRouter.ts");
    const shell = read("client/src/components/AdminCommandShell.tsx");

    expect(router).toContain('globalSearch: publicProcedure');
    expect(router).toContain('min(2).max(80)');
    expect(router.match(/\.limit\(5\)/g)?.length).toBeGreaterThanOrEqual(3);
    expect(shell).toContain('Search customers, invoices, leads');
    expect(shell).toContain('{ label: "Settings", href: "/flowsites-admin-settings", icon: Settings }');
    expect(shell).toContain('{ label: "Cue AI", href: "/flowsites-admin-cue-telephone", icon: Bot }');
  });

  it("keeps the focused command-center routes ahead of the legacy CRM fallback", () => {
    const app = read("client/src/App.tsx");

    expect(app.indexOf('path="/flowsites-admin-customers/:accountId"')).toBeLessThan(app.indexOf('path="/flowsites-admin-customers"'));
    expect(app).toContain('path="/flowsites-admin-legacy-crm"');
    expect(app).toContain('component={AdminCommandOverview}');
  });

  it("renders cards rather than an overflow-only customer table on mobile", () => {
    const page = read("client/src/pages/AdminCommandCenterPages.tsx");

    expect(page).toContain('divide-y divide-slate-100 sm:hidden');
    expect(page).toContain('hidden overflow-x-auto sm:block');
    expect(page).toContain('Search business, contact, email, phone');
  });
});
