/**
 * Server-side PDF invoice generation using @react-pdf/renderer
 * Renders a clean, professional FlowSites invoice as a PDF buffer.
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function fmtDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    padding: 0,
  },
  // Header band
  header: {
    backgroundColor: "#111827",
    paddingHorizontal: 40,
    paddingVertical: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandBadge: {
    width: 28,
    height: 28,
    backgroundColor: "#dc2626",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  brandBadgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  brandName: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  brandSub: {
    color: "#9ca3af",
    fontSize: 8,
    marginTop: 2,
  },
  invoiceMeta: {
    alignItems: "flex-end",
  },
  invoiceLabel: {
    color: "#6b7280",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  invoiceNumber: {
    color: "#ffffff",
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-end",
  },
  statusText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  recurringBadge: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  recurringText: {
    color: "#7c3aed",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },
  // Body
  body: {
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 40,
  },
  // Bill to / dates grid
  metaRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: "1 solid #e5e7eb",
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  metaValue: {
    fontSize: 10,
    color: "#111827",
    fontFamily: "Helvetica-Bold",
    marginBottom: 1,
  },
  metaValueSub: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 1,
  },
  metaValueSmall: {
    fontSize: 8,
    color: "#9ca3af",
  },
  overdueText: {
    fontSize: 8,
    color: "#dc2626",
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  paidText: {
    fontSize: 8,
    color: "#059669",
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  // Line items table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottom: "1 solid #f3f4f6",
    alignItems: "flex-start",
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  colDesc: { flex: 1 },
  colQty: { width: 40, textAlign: "center" },
  colAmt: { width: 70, textAlign: "right" },
  cellText: {
    fontSize: 9,
    color: "#111827",
  },
  cellSub: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  cellTextRight: {
    fontSize: 9,
    color: "#111827",
    textAlign: "right",
  },
  cellTextCenter: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "center",
  },
  // Totals
  totalsSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTop: "1 solid #e5e7eb",
    alignItems: "flex-end",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 40,
    marginBottom: 5,
  },
  totalsLabel: {
    fontSize: 9,
    color: "#6b7280",
    width: 100,
    textAlign: "right",
  },
  totalsValue: {
    fontSize: 9,
    color: "#111827",
    width: 70,
    textAlign: "right",
  },
  totalDivider: {
    width: 210,
    borderTop: "1.5 solid #111827",
    marginBottom: 5,
    marginTop: 3,
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    width: 100,
    textAlign: "right",
  },
  totalValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    width: 70,
    textAlign: "right",
  },
  discountValue: {
    fontSize: 9,
    color: "#059669",
    width: 70,
    textAlign: "right",
  },
  lateFeeValue: {
    fontSize: 9,
    color: "#dc2626",
    width: 70,
    textAlign: "right",
  },
  // Billing terms
  termsBox: {
    marginTop: 28,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 14,
    border: "1 solid #e5e7eb",
  },
  termsTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  termsRow: {
    flexDirection: "row",
    gap: 12,
  },
  termItem: {
    flex: 1,
    flexDirection: "row",
    gap: 5,
    alignItems: "flex-start",
  },
  termDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  termText: {
    fontSize: 8,
    color: "#374151",
    flex: 1,
    lineHeight: 1.4,
  },
  termBold: {
    fontFamily: "Helvetica-Bold",
  },
  // Footer
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTop: "1 solid #e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
  footerLink: {
    fontSize: 8,
    color: "#dc2626",
  },
});

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  open:    { label: "Open",    bg: "#eff6ff", text: "#1d4ed8" },
  paid:    { label: "Paid",    bg: "#ecfdf5", text: "#065f46" },
  overdue: { label: "Overdue", bg: "#fef2f2", text: "#991b1b" },
  draft:   { label: "Draft",   bg: "#f3f4f6", text: "#4b5563" },
  void:    { label: "Void",    bg: "#f3f4f6", text: "#6b7280" },
};

// ── Invoice data types ─────────────────────────────────────────────────────────
export interface InvoicePdfData {
  invoice: {
    invoiceNumber: string;
    status: string;
    isRecurring: boolean;
    periodStart: string;
    periodEnd: string;
    dueDate: string;
    paidAt?: string | null;
    baseAmountCents: number;
    discountCents?: number | null;
    lateFeeCents?: number | null;
    totalAmountCents: number;
    notes?: string | null;
  };
  account: {
    businessName: string;
    clientName: string;
    clientEmail: string;
  } | null;
}

// ── PDF Document ───────────────────────────────────────────────────────────────
function InvoiceDocument({ invoice, account }: InvoicePdfData) {
  const statusCfg = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.open;
  const isPaid = invoice.status === "paid";
  const isOverdue = invoice.status === "overdue";
  const discount = invoice.discountCents ?? 0;
  const lateFee = invoice.lateFeeCents ?? 0;

  return (
    <Document
      title={`Invoice ${invoice.invoiceNumber} — FlowSites`}
      author="FlowSites Agency"
      subject="Monthly Website Management Invoice"
    >
      <Page size="A4" style={s.page}>
        {/* ── Header band ─────────────────────────────────────────────────── */}
        <View style={s.header}>
          {/* Brand */}
          <View>
            <View style={s.brandBox}>
              <View style={s.brandBadge}>
                <Text style={s.brandBadgeText}>FS</Text>
              </View>
              <Text style={s.brandName}>FlowSites</Text>
            </View>
            <Text style={s.brandSub}>hello@flow-sites.com · flow-sites.com · (281) 818-9288</Text>
          </View>
          {/* Invoice meta */}
          <View style={s.invoiceMeta}>
            <Text style={s.invoiceLabel}>Invoice</Text>
            <Text style={s.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <View style={[s.statusBadge, { backgroundColor: statusCfg.bg }]}>
              <Text style={[s.statusText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
            </View>
            {invoice.isRecurring && (
              <View style={s.recurringBadge}>
                <Text style={s.recurringText}>↻ Recurring Monthly</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <View style={s.body}>
          {/* Bill to / dates */}
          <View style={s.metaRow}>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>Bill To</Text>
              {account ? (
                <>
                  <Text style={s.metaValue}>{account.businessName}</Text>
                  <Text style={s.metaValueSub}>{account.clientName}</Text>
                  <Text style={s.metaValueSmall}>{account.clientEmail}</Text>
                </>
              ) : (
                <Text style={s.metaValueSub}>—</Text>
              )}
            </View>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>Billing Period</Text>
              <Text style={s.metaValue}>{fmtDate(invoice.periodStart)}</Text>
              <Text style={s.metaValueSmall}>to {fmtDate(invoice.periodEnd)}</Text>
            </View>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>Due Date</Text>
              <Text style={[s.metaValue, isOverdue ? { color: "#dc2626" } : {}]}>
                {fmtDate(invoice.dueDate)}
              </Text>
              {isOverdue && <Text style={s.overdueText}>Payment overdue</Text>}
              {isPaid && invoice.paidAt && (
                <Text style={s.paidText}>
                  Paid {fmtDate(invoice.paidAt.split("T")[0])}
                </Text>
              )}
            </View>
          </View>

          {/* Line items table */}
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderText, s.colDesc]}>Description</Text>
            <Text style={[s.tableHeaderText, s.colQty, { textAlign: "center" }]}>Qty</Text>
            <Text style={[s.tableHeaderText, s.colAmt, { textAlign: "right" }]}>Amount</Text>
          </View>

          {/* Main service row */}
          <View style={s.tableRow}>
            <View style={s.colDesc}>
              <Text style={s.cellText}>Monthly Website Management</Text>
              <Text style={s.cellSub}>
                {fmtDate(invoice.periodStart)} – {fmtDate(invoice.periodEnd)}
              </Text>
            </View>
            <Text style={[s.cellTextCenter, s.colQty]}>1</Text>
            <Text style={[s.cellTextRight, s.colAmt]}>{fmt(invoice.baseAmountCents)}</Text>
          </View>

          {/* Discount row */}
          {discount > 0 && (
            <View style={[s.tableRow, s.tableRowAlt]}>
              <View style={s.colDesc}>
                <Text style={[s.cellText, { color: "#059669" }]}>Early Payment Discount (5%)</Text>
                <Text style={s.cellSub}>Paid before the 1st of the month</Text>
              </View>
              <Text style={[s.cellTextCenter, s.colQty]}>—</Text>
              <Text style={[s.cellTextRight, s.colAmt, { color: "#059669" }]}>−{fmt(discount)}</Text>
            </View>
          )}

          {/* Late fee row */}
          {lateFee > 0 && (
            <View style={[s.tableRow, s.tableRowAlt]}>
              <View style={s.colDesc}>
                <Text style={[s.cellText, { color: "#dc2626" }]}>Late Payment Fee (15%)</Text>
                <Text style={s.cellSub}>Applied after due date</Text>
              </View>
              <Text style={[s.cellTextCenter, s.colQty]}>—</Text>
              <Text style={[s.cellTextRight, s.colAmt, { color: "#dc2626" }]}>+{fmt(lateFee)}</Text>
            </View>
          )}

          {/* Totals */}
          <View style={s.totalsSection}>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>Subtotal</Text>
              <Text style={s.totalsValue}>{fmt(invoice.baseAmountCents)}</Text>
            </View>
            {discount > 0 && (
              <View style={s.totalsRow}>
                <Text style={s.totalsLabel}>Discount</Text>
                <Text style={s.discountValue}>−{fmt(discount)}</Text>
              </View>
            )}
            {lateFee > 0 && (
              <View style={s.totalsRow}>
                <Text style={s.totalsLabel}>Late Fee</Text>
                <Text style={s.lateFeeValue}>+{fmt(lateFee)}</Text>
              </View>
            )}
            <View style={s.totalDivider} />
            <View style={s.totalsRow}>
              <Text style={s.totalLabel}>Total Due</Text>
              <Text style={s.totalValue}>{fmt(invoice.totalAmountCents)}</Text>
            </View>
          </View>

          {/* Notes */}
          {invoice.notes && (
            <View style={{ marginTop: 16 }}>
              <Text style={s.metaLabel}>Notes</Text>
              <Text style={{ fontSize: 9, color: "#374151", lineHeight: 1.5 }}>{invoice.notes}</Text>
            </View>
          )}

          {/* Billing terms */}
          <View style={s.termsBox}>
            <Text style={s.termsTitle}>Billing Terms</Text>
            <View style={s.termsRow}>
              <View style={s.termItem}>
                <View style={[s.termDot, { backgroundColor: "#059669" }]} />
                <Text style={s.termText}>
                  <Text style={s.termBold}>5% discount</Text> when paid before the 1st
                </Text>
              </View>
              <View style={s.termItem}>
                <View style={[s.termDot, { backgroundColor: "#059669" }]} />
                <Text style={s.termText}>
                  <Text style={s.termBold}>15% discount</Text> when paid annually in advance
                </Text>
              </View>
              <View style={s.termItem}>
                <View style={[s.termDot, { backgroundColor: "#f59e0b" }]} />
                <Text style={s.termText}>
                  <Text style={s.termBold}>15% late fee</Text> applied after due date
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>
              Questions? Contact us at hello@flow-sites.com
            </Text>
            <Text style={s.footerText}>
              FlowSites Agency · flow-sites.com
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ── Export: render to buffer ───────────────────────────────────────────────────
export async function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  const buffer = await renderToBuffer(<InvoiceDocument {...data} />);
  return Buffer.from(buffer);
}
