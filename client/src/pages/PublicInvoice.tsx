import { useParams, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Printer,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function fmtDate(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  open:    { label: "Open",    bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500" },
  paid:    { label: "Paid",    bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  overdue: { label: "Overdue", bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500" },
  draft:   { label: "Draft",   bg: "bg-gray-100",   text: "text-gray-600",    dot: "bg-gray-400" },
  void:    { label: "Void",    bg: "bg-gray-100",   text: "text-gray-500",    dot: "bg-gray-400" },
};

// ── Loading / Error states ─────────────────────────────────────────────────────
function InvoiceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col print:bg-white">
      {children}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PublicInvoice() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const paymentResult = params.get("payment");
  const [paying, setPaying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadPdf() {
    if (!shareToken) return;
    setDownloading(true);
    try {
      const response = await fetch(`/api/invoice/${shareToken}/pdf`);
      if (!response.ok) throw new Error("PDF generation failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const invoiceNum = data?.invoice?.invoiceNumber ?? "invoice";
      a.download = `FlowSites-${invoiceNum}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const { data, isLoading, error } = trpc.clientBilling.getInvoiceByShareToken.useQuery(
    { shareToken: shareToken ?? "" },
    { enabled: !!shareToken, retry: false }
  );

  const checkoutMutation = trpc.clientBilling.createSharedInvoiceCheckout.useMutation({
    onSuccess: (res) => {
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        toast.success("Redirecting to checkout…", { description: "Taking you to secure payment now." });
      }
      setPaying(false);
    },
    onError: (err) => {
      toast.error("Payment error", { description: err.message });
      setPaying(false);
    },
  });

  const handlePay = () => {
    if (!shareToken) return;
    setPaying(true);
    checkoutMutation.mutate({ shareToken, origin: window.location.origin });
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <InvoiceShell>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </InvoiceShell>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <InvoiceShell>
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 py-16">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
            <p className="text-gray-500 max-w-sm">
              This invoice link is invalid or has expired. Please contact FlowSites for assistance.
            </p>
          </div>
          <a
            href="mailto:hello@flow-sites.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            hello@flow-sites.com
          </a>
        </div>
      </InvoiceShell>
    );
  }

  const { invoice, account, items = [] } = data;
  const isPaid = invoice.status === "paid";
  const isOverdue = invoice.status === "overdue";
  const canPay = invoice.status === "open" || invoice.status === "overdue";
  const status = STATUS_MAP[invoice.status] ?? STATUS_MAP.open;

  const subtotal = invoice.baseAmountCents;
  const discount = invoice.discountCents ?? 0;
  const lateFee = invoice.lateFeeCents ?? 0;
  const total = invoice.totalAmountCents;

  return (
    <InvoiceShell>
      {/* ── Top action bar (hidden on print) ─────────────────────────────────── */}
      <div className="print:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663031545745/urOWhqfyIrKAoifg.png"
              alt="FlowSites"
              style={{ height: "56px", width: "auto" }}
              className="object-contain"
            />
            <span className="text-gray-300 text-sm">·</span>
            <span className="text-gray-500 text-sm">Invoice Portal</span>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading || isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {downloading ? "Generating…" : "Download PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Payment result banners ────────────────────────────────────────────── */}
      {paymentResult === "success" && (
        <div className="print:hidden max-w-3xl mx-auto w-full px-4 pt-6">
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800 text-sm">Payment Received — Thank You!</p>
              <p className="text-xs text-emerald-700">Your payment has been processed successfully.</p>
            </div>
          </div>
        </div>
      )}
      {paymentResult === "cancelled" && (
        <div className="print:hidden max-w-3xl mx-auto w-full px-4 pt-6">
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">Payment was cancelled. You can try again below.</p>
          </div>
        </div>
      )}

      {/* ── Invoice document ──────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto w-full px-4 py-8 print:py-0 print:px-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:rounded-none print:shadow-none print:border-0">

          {/* ── Header band ─────────────────────────────────────────────────── */}
          <div className="bg-gray-900 px-8 py-7 print:px-8 print:py-6">
            <div className="flex items-start justify-between gap-6">
              {/* Left: company */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <img
                    src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663031545745/urOWhqfyIrKAoifg.png"
                    alt="FlowSites"
                    style={{ height: "120px", width: "auto" }}
                    className="object-contain"
                  />
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  hello@flow-sites.com<br />
                  flow-sites.com<br />
                  (281) 503-8903
                </p>
              </div>
              {/* Right: invoice meta */}
              <div className="text-right">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">Invoice</p>
                <p className="text-white text-2xl font-bold tracking-tight mb-3">{invoice.invoiceNumber}</p>
                <div className="flex items-center gap-2 justify-end flex-wrap">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </div>
                  {invoice.isRecurring && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.65 2.35A8 8 0 1 0 15 8h-2a6 6 0 1 1-1.05-3.4L10 6h5V1l-1.35 1.35z" fill="currentColor"/>
                      </svg>
                      Recurring Monthly
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bill to / dates ──────────────────────────────────────────────── */}
          <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-gray-100">
            {/* Bill to */}
            <div className="sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Bill To</p>
              {account ? (
                <>
                  <p className="font-bold text-gray-900 text-base">{account.businessName}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{account.clientName}</p>
                  <p className="text-sm text-gray-500">{account.clientEmail}</p>

                </>
              ) : (
                <p className="text-sm text-gray-400">—</p>
              )}
            </div>
            {/* Billing period */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Billing Period</p>
              <p className="text-sm font-medium text-gray-900">{fmtDate(invoice.periodStart)}</p>
              <p className="text-xs text-gray-500">to {fmtDate(invoice.periodEnd)}</p>
            </div>
            {/* Due date */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Due Date</p>
              <p className={`text-sm font-bold ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
                {fmtDate(invoice.dueDate)}
              </p>
              {isOverdue && (
                <p className="text-xs text-red-500 font-medium mt-0.5">Payment overdue</p>
              )}
              {isPaid && invoice.paidAt && (
                <p className="text-xs text-emerald-600 font-medium mt-0.5">
                  Paid {fmtDate(String(invoice.paidAt).slice(0, 10))}
                </p>
              )}
            </div>
          </div>

          {/* ── Line items ───────────────────────────────────────────────────── */}
          <div className="px-8 py-6 border-b border-gray-100">
            {/* Column headers */}
            <div className="grid grid-cols-12 gap-2 mb-3">
              <p className="col-span-7 text-xs font-semibold uppercase tracking-widest text-gray-400">Description</p>
              <p className="col-span-2 text-xs font-semibold uppercase tracking-widest text-gray-400 text-center">Qty</p>
              <p className="col-span-3 text-xs font-semibold uppercase tracking-widest text-gray-400 text-right">Amount</p>
            </div>
            <div className="divide-y divide-gray-100">
              {items.length > 0 ? (
                /* Itemized invoice: render each line item */
                <>
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 py-3.5 items-center">
                      <div className="col-span-7">
                        <p className="text-sm font-semibold text-gray-900">{item.description}</p>
                        {item.description.toLowerCase().includes("monthly") && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {account?.businessName} — {fmtDate(invoice.periodStart)} to {fmtDate(invoice.periodEnd)}
                          </p>
                        )}
                      </div>
                      <p className="col-span-2 text-sm text-gray-700 text-center">{item.quantity}</p>
                      <p className="col-span-3 text-sm font-semibold text-gray-900 text-right">{fmt(item.amountCents)}</p>
                    </div>
                  ))}
                </>
              ) : (
                /* Legacy single-line invoice */
                <div className="grid grid-cols-12 gap-2 py-3.5 items-center">
                  <div className="col-span-7">
                    <p className="text-sm font-semibold text-gray-900">Monthly Website Management</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {account?.businessName} — {fmtDate(invoice.periodStart)} to {fmtDate(invoice.periodEnd)}
                    </p>
                  </div>
                  <p className="col-span-2 text-sm text-gray-700 text-center">1</p>
                  <p className="col-span-3 text-sm font-semibold text-gray-900 text-right">{fmt(subtotal)}</p>
                </div>
              )}

              {/* Discount line */}
              {discount > 0 && (
                <div className="grid grid-cols-12 gap-2 py-3 items-center">
                  <div className="col-span-7">
                    <p className="text-sm text-emerald-700 font-medium">
                      {invoice.discountType === "early_pay"
                        ? "Early Pay Discount (5% — paid before the 1st)"
                        : "Annual Discount (15% — paid annually in advance)"}
                    </p>
                  </div>
                  <p className="col-span-2 text-sm text-gray-400 text-center">—</p>
                  <p className="col-span-3 text-sm font-semibold text-emerald-700 text-right">−{fmt(discount)}</p>
                </div>
              )}

              {/* Late fee line */}
              {lateFee > 0 && (
                <div className="grid grid-cols-12 gap-2 py-3 items-center">
                  <div className="col-span-7">
                    <p className="text-sm text-red-600 font-medium">Late Payment Fee (15%)</p>
                    <p className="text-xs text-red-400 mt-0.5">Applied after due date</p>
                  </div>
                  <p className="col-span-2 text-sm text-gray-400 text-center">—</p>
                  <p className="col-span-3 text-sm font-semibold text-red-600 text-right">+{fmt(lateFee)}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Totals ───────────────────────────────────────────────────────── */}
          <div className="px-8 py-5 border-b border-gray-100">
            <div className="max-w-xs ml-auto space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-700">
                  <span>Discount</span>
                  <span>−{fmt(discount)}</span>
                </div>
              )}
              {lateFee > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Late Fee</span>
                  <span>+{fmt(lateFee)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Total Due</span>
                <span className="text-2xl font-black text-gray-900">{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* ── Notes ────────────────────────────────────────────────────────── */}
          {invoice.notes && (
            <div className="px-8 py-5 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Notes</p>
              <p className="text-sm text-gray-700 leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          {/* ── Billing terms ─────────────────────────────────────────────────── */}
          <div className="px-8 py-5 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Billing Terms</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong className="text-gray-800">5% early-pay discount</strong> when paid before the 1st of the month
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong className="text-gray-800">15% annual discount</strong> when paid annually in advance
                </p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong className="text-gray-800">15% late fee</strong> applied after the due date
                </p>
              </div>
            </div>
          </div>

          {/* ── Pay CTA ───────────────────────────────────────────────────────── */}
          {canPay && (
            <div className="px-8 py-6 print:hidden">
              <Button
                onClick={handlePay}
                disabled={paying}
                className="w-full h-14 text-base font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 transition-all"
              >
                {paying ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing…</>
                ) : (
                  <><CreditCard className="w-5 h-5 mr-2" />Pay {fmt(total)} Now</>
                )}
              </Button>
              <p className="text-center text-xs text-gray-400 mt-3">
                Secured by Stripe · SSL encrypted
              </p>
            </div>
          )}

          {isPaid && (
            <div className="px-8 py-6 print:hidden">
              <div className="flex items-center justify-center gap-3 py-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-800">Invoice Paid — Thank You!</p>
                  <p className="text-xs text-emerald-700">Your payment has been received and recorded.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Footer ───────────────────────────────────────────────────────── */}
          <div className="px-8 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-400">
              Questions?{" "}
              <a href="mailto:hello@flow-sites.com" className="text-red-600 hover:underline font-medium">
                hello@flow-sites.com
              </a>
              {" "}· (281) 503-8903
            </p>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} FlowSites Agency
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom spacer ────────────────────────────────────────────────────── */}
      <div className="h-12 print:hidden" />
    </InvoiceShell>
  );
}
