/**
 * Express route: GET /api/invoice/:shareToken/pdf
 * Generates and streams a PDF for the given invoice share token.
 * Public endpoint — no auth required (token acts as the secret).
 */
import type { Request, Response } from "express";
import { generateInvoicePdf } from "./invoicePdf";

export async function invoicePdfHandler(req: Request, res: Response): Promise<void> {
  const { shareToken } = req.params as { shareToken: string };

  if (!shareToken || shareToken.length < 10) {
    res.status(400).json({ error: "Invalid share token" });
    return;
  }

  try {
    const { getDb } = await import("./db");
    const { clientInvoices, clientAccounts } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database not available" });
      return;
    }

    // Look up invoice by share token
    const [invoice] = await db
      .select()
      .from(clientInvoices)
      .where(eq(clientInvoices.shareToken, shareToken))
      .limit(1);

    if (!invoice) {
      res.status(404).json({ error: "Invoice not found" });
      return;
    }

    // Look up the associated client account
    const [account] = await db
      .select({
        businessName: clientAccounts.businessName,
        clientName: clientAccounts.clientName,
        clientEmail: clientAccounts.clientEmail,
      })
      .from(clientAccounts)
      .where(eq(clientAccounts.id, invoice.clientAccountId))
      .limit(1);

    // Generate PDF
    const pdfBuffer = await generateInvoicePdf({
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        isRecurring: Boolean(invoice.isRecurring),
        periodStart: invoice.periodStart,
        periodEnd: invoice.periodEnd,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt ? (invoice.paidAt instanceof Date ? invoice.paidAt.toISOString() : String(invoice.paidAt)) : null,
        baseAmountCents: invoice.baseAmountCents,
        discountCents: invoice.discountCents ?? null,
        lateFeeCents: invoice.lateFeeCents ?? null,
        totalAmountCents: invoice.totalAmountCents,
        notes: invoice.notes ?? null,
      },
      account: account
        ? {
            businessName: account.businessName,
            clientName: account.clientName,
            clientEmail: account.clientEmail,
          }
        : null,
    });

    const filename = `FlowSites-${invoice.invoiceNumber}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("[PDF] Generation error:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}
