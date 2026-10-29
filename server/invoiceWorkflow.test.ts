import { describe, expect, it } from "vitest";
import fs from "node:fs";

const routerSource = fs.readFileSync("server/routers/clientBillingRouter.ts", "utf8");
const schemaSource = fs.readFileSync("drizzle/schema.ts", "utf8");
const migrationSource = fs.readFileSync("database/feature-migrations/2026-10-29-draft-invoice-communications.sql", "utf8");
const billingUiSource = fs.readFileSync("client/src/pages/AdminCommandCenterPages.tsx", "utf8");

describe("draft invoice communications", () => {
  it("does not automatically send an invoice during account creation", () => {
    const accountCreation = routerSource.slice(routerSource.indexOf("adminCreateAccount:"), routerSource.indexOf("adminUpdateAccount:"));
    expect(accountCreation).toContain('status: "draft"');
    expect(accountCreation).not.toContain("sendInvoiceEmail");
    expect(accountCreation).not.toContain("sendEmail");
  });

  it("supports all deliberate communication modes and saves a retryable delivery state", () => {
    expect(routerSource).toContain("adminFinalizeInvoice");
    expect(routerSource).toContain("adminRetryInvoiceEmail");
    expect(routerSource).toContain("adminSendInvoiceOnly");
    for (const mode of ["invoice_only", "invoice_welcome", "invoice_custom", "invoice_cue"]) {
      expect(routerSource).toContain(`"${mode}"`);
    }
    expect(schemaSource).toContain('"pending", "sent", "delivered", "bounced", "failed"');
    expect(routerSource).toContain("This invoice has already been sent");
    expect(routerSource).toContain("Controlled retry");
    expect(billingUiSource).toContain("Send invoice");
    expect(billingUiSource).toContain("Retry send");
    expect(billingUiSource).toContain("This will not create another invoice");
  });

  it("records a customer invoice activity timeline without destructive billing updates", () => {
    expect(schemaSource).toContain('mysqlTable("invoice_activities"');
    expect(routerSource).toContain('activityType: "invoice_draft_created"');
    expect(routerSource).toContain('activityType: "invoice_email_sent"');
    expect(routerSource).toContain('activityType: "invoice_email_failed"');
    expect(migrationSource).toContain("CREATE TABLE invoice_activities");
    expect(migrationSource).not.toMatch(/UPDATE\s+client_invoices|DELETE\s+FROM\s+client_invoices/i);
  });
});
