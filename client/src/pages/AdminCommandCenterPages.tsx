import { useEffect, useState, type ComponentProps, type FormEvent } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { AdminCommandShell, formatCents } from "@/components/AdminCommandShell";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeDollarSign,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ExternalLink,
  FileText,
  Filter,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Search,
  Settings2,
  ShieldAlert,
  Sparkles,
  Trash2,
  UsersRound,
  WalletCards,
} from "lucide-react";

type CustomerStatus = "active" | "paused" | "cancelled" | "past_due";
type LeadStatus = "new" | "contacted" | "in_progress" | "proposal_sent" | "won" | "lost";

type CustomerRow = {
  id: number;
  businessName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  websiteUrl: string | null;
  status: CustomerStatus;
  displayStatus: CustomerStatus;
  planName: string | null;
  monthlyPriceCents: number;
  outstandingBalanceCents: number;
  overdueInvoiceCount: number;
  billingCycle: "monthly" | "annual";
  createdAt: Date;
  hasStripeSubscription: boolean;
};

const statusStyle: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  paused: "bg-amber-50 text-amber-700 ring-amber-600/15",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-500/15",
  past_due: "bg-rose-50 text-rose-700 ring-rose-600/15",
  new: "bg-blue-50 text-blue-700 ring-blue-600/15",
  contacted: "bg-violet-50 text-violet-700 ring-violet-600/15",
  in_progress: "bg-amber-50 text-amber-700 ring-amber-600/15",
  proposal_sent: "bg-orange-50 text-orange-700 ring-orange-600/15",
  won: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  lost: "bg-slate-100 text-slate-600 ring-slate-500/15",
  open: "bg-blue-50 text-blue-700 ring-blue-600/15",
  overdue: "bg-rose-50 text-rose-700 ring-rose-600/15",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  draft: "bg-slate-100 text-slate-600 ring-slate-500/15",
  void: "bg-slate-100 text-slate-600 ring-slate-500/15",
  onboarding: "bg-blue-50 text-blue-700 ring-blue-600/15",
  design: "bg-violet-50 text-violet-700 ring-violet-600/15",
  development: "bg-amber-50 text-amber-700 ring-amber-600/15",
  review: "bg-orange-50 text-orange-700 ring-orange-600/15",
  revisions: "bg-rose-50 text-rose-700 ring-rose-600/15",
  launch: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  maintenance: "bg-cyan-50 text-cyan-700 ring-cyan-600/15",
};

function humanize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, char => char.toUpperCase());
}

function StatusPill({ value }: { value: string }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ring-inset ${statusStyle[value] ?? "bg-slate-100 text-slate-600 ring-slate-500/15"}`}>{humanize(value)}</span>;
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function MetricCard({ label, value, detail, href, emphasis = false }: { label: string; value: string; detail: string; href: string; emphasis?: boolean }) {
  return <Link href={href} className={`block rounded-2xl border bg-white p-5 transition hover:border-blue-300 hover:bg-blue-50/20 focus:outline-none focus:ring-4 focus:ring-blue-100 ${emphasis ? "border-amber-200" : "border-slate-200"}`}>
    <p className="text-sm font-semibold text-slate-500">{label}</p>
    <p className="mt-5 text-3xl font-bold tracking-[-0.05em] text-[#0f172a]">{value}</p>
    <p className="mt-2 min-h-[2.5rem] text-xs leading-5 text-slate-500">{detail}</p>
  </Link>;
}

function CustomerDirectoryTable({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const [status, setStatus] = useState<CustomerStatus | "all">("all");
  const [sort, setSort] = useState<"attention" | "name" | "monthly" | "balance" | "status">("attention");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [items, setItems] = useState<CustomerRow[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const customerQuery = trpc.adminCommandCenter.listCustomers.useQuery({
    query: query || undefined,
    status: status === "all" ? undefined : status,
    sort,
    direction,
    cursor: cursor ?? undefined,
    pageSize: compact ? 8 : 10,
  });

  useEffect(() => {
    if (customerQuery.data) setItems(customerQuery.data.items as CustomerRow[]);
  }, [customerQuery.data]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (query) params.set("q", query); else params.delete("q");
    if (status !== "all") params.set("status", status); else params.delete("status");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState({}, "", next);
  }, [query, status]);

  const reset = (nextQuery?: string, nextStatus?: CustomerStatus | "all") => {
    if (nextQuery !== undefined) setQuery(nextQuery);
    if (nextStatus !== undefined) setStatus(nextStatus);
    setCursor(null);
    setPages([]);
  };
  const chooseSort = (nextSort: typeof sort) => {
    setDirection(current => nextSort === sort ? (current === "asc" ? "desc" : "asc") : "asc");
    setSort(nextSort);
    setCursor(null);
    setPages([]);
  };
  const goNext = () => {
    if (!customerQuery.data?.nextCursor) return;
    setPages(previous => [...previous, cursor ?? ""]);
    setCursor(customerQuery.data.nextCursor);
  };
  const goBack = () => {
    const previous = [...pages];
    const prior = previous.pop();
    setPages(previous);
    setCursor(prior || null);
  };
  const total = customerQuery.data?.total ?? 0;
  const sortHeader = (label: string, key: typeof sort) => <button type="button" onClick={() => chooseSort(key)} className="inline-flex items-center gap-1 transition hover:text-[#1269e8]">{label}{sort === key && <span aria-hidden="true">{direction === "asc" ? "↑" : "↓"}</span>}</button>;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div><h2 className="text-base font-bold text-[#14213f]">Customers</h2><p className="mt-1 text-sm text-slate-500">Manage your customer accounts and balances. {total.toLocaleString()} CRM {total === 1 ? "customer record" : "customer records"}.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {!compact && <button type="button" onClick={() => setShowCreate(true)} className="inline-flex h-10 items-center justify-center rounded-xl bg-[#1269e8] px-4 text-sm font-bold text-white transition hover:bg-[#0c58c8]">+ Add Customer</button>}
          <label className="relative block"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={event => reset(event.target.value)} placeholder="Search business, contact, email, phone" className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 sm:w-72" /></label>
          <label className="relative block"><Filter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><select value={status} onChange={event => reset(undefined, event.target.value as CustomerStatus | "all")} className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium outline-none focus:border-blue-400 sm:w-[150px]"><option value="all">All statuses</option><option value="active">Active</option><option value="past_due">Past Due</option><option value="paused">Paused</option><option value="cancelled">Cancelled</option><option disabled>Payment Failed (sync needed)</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /></label>
        </div>
      </div>
      {customerQuery.isLoading ? <LoadingRows /> : customerQuery.isError ? <ErrorBlock text={customerQuery.error.message} onRetry={() => customerQuery.refetch()} /> : (
        <>
          <div className="divide-y divide-slate-100 sm:hidden">{items.length ? items.map((customer) => <Link key={customer.id} href={`/flowsites-admin-customers/${customer.id}`} className="block px-5 py-4 transition hover:bg-[#f8fbff]"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-xs font-extrabold text-blue-700">{customer.businessName.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold text-[#17223b]">{customer.businessName}</p><p className="mt-0.5 truncate text-xs text-slate-500">{customer.clientName} · {customer.planName || "Billing plan not recorded"}</p></div><StatusPill value={customer.displayStatus} /></div><div className="mt-3 grid grid-cols-2 gap-3 text-xs"><p className="text-slate-500">Monthly <span className="block pt-0.5 text-sm font-bold text-[#17223b]">{formatCents(customer.monthlyPriceCents)}</span></p><p className="text-right text-slate-500">Balance <span className={`block pt-0.5 text-sm font-bold ${customer.outstandingBalanceCents > 0 ? "text-rose-600" : "text-[#17223b]"}`}>{formatCents(customer.outstandingBalanceCents)}</span></p></div><div className="mt-3 flex items-center justify-between"><span className="text-xs text-slate-500">{customer.clientEmail}</span><span className="inline-flex items-center gap-1 text-xs font-bold text-[#1269e8]">View <ArrowUpRight size={13}/></span></div></div></div></Link>) : <EmptyState label="No customers match this directory view." />}</div>
          <div className="hidden overflow-x-auto sm:block"><table className="min-w-[860px] w-full text-left"><thead><tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-[0.11em] text-slate-400"><th className="px-5 py-3.5">{sortHeader("Customer", "name")}</th><th className="px-5 py-3.5">Plan</th><th className="px-5 py-3.5">{sortHeader("Monthly", "monthly")}</th><th className="px-5 py-3.5">{sortHeader("Balance", "balance")}</th><th className="px-5 py-3.5">{sortHeader("Status", "status")}</th><th className="px-5 py-3.5 text-right">Action</th></tr></thead><tbody>{items.length ? items.map((customer) => <tr key={customer.id} className="border-b border-slate-50 last:border-0 hover:bg-[#f8fbff]"><td className="px-5 py-4"><Link href={`/flowsites-admin-customers/${customer.id}`} className="group flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-xs font-extrabold text-blue-700">{customer.businessName.slice(0, 2).toUpperCase()}</span><span><span className="block font-bold text-[#17223b] group-hover:text-[#1269e8]">{customer.businessName}</span><span className="mt-0.5 block text-xs text-slate-500">{customer.clientName} · {customer.clientEmail}</span></span></Link></td><td className="px-5 py-4 text-sm font-medium text-slate-700">{customer.planName || "Billing plan not recorded"}</td><td className="px-5 py-4 text-sm font-bold text-[#17223b]">{formatCents(customer.monthlyPriceCents)}</td><td className={`px-5 py-4 text-sm font-bold ${customer.outstandingBalanceCents > 0 ? "text-rose-600" : "text-slate-600"}`}><Link href={`/flowsites-admin-billing?accountId=${customer.id}`} className="hover:text-[#1269e8] hover:underline">{formatCents(customer.outstandingBalanceCents)}</Link></td><td className="px-5 py-4"><StatusPill value={customer.displayStatus} /></td><td className="px-5 py-4 text-right"><Link href={`/flowsites-admin-customers/${customer.id}`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#1269e8] hover:bg-blue-50">View <ArrowUpRight size={14} /></Link></td></tr>) : <tr><td colSpan={6}><EmptyState label="No customers match this directory view." /></td></tr>}</tbody></table></div>
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4"><p className="text-xs text-slate-500">Showing {items.length} customer records on this page</p><div className="flex gap-2"><button disabled={!pages.length || customerQuery.isFetching} onClick={goBack} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><button disabled={!customerQuery.data?.nextCursor || customerQuery.isFetching} onClick={goNext} className="rounded-lg bg-[#1269e8] px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div>
        </>
      )}
      {showCreate && <CreateLocalCustomerDialog onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); reset(); customerQuery.refetch(); }} />}
    </section>
  );
}

function CreateLocalCustomerDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ businessName: "", clientName: "", clientEmail: "", clientPhone: "", websiteUrl: "", monthlyPrice: "" });
  const [validation, setValidation] = useState("");
  const createAccount = trpc.clientBilling.adminCreateAccount.useMutation({ onSuccess: onCreated });
  const fieldClass = "mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50";
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const monthlyPriceCents = Math.round(Number(form.monthlyPrice) * 100);
    if (!form.businessName.trim() || !form.clientName.trim() || !form.clientEmail.trim() || !Number.isFinite(monthlyPriceCents) || monthlyPriceCents < 100) {
      setValidation("Enter the business, primary contact, email, and a monthly amount of at least $1.00.");
      return;
    }
    setValidation("");
    createAccount.mutate({
      businessName: form.businessName.trim(),
      clientName: form.clientName.trim(),
      clientEmail: form.clientEmail.trim(),
      clientPhone: form.clientPhone.trim() || undefined,
      websiteUrl: form.websiteUrl.trim() || undefined,
      monthlyPriceCents,
      billingStartDate: new Date().toISOString().slice(0, 10),
    });
  };
  return <div role="dialog" aria-modal="true" aria-labelledby="create-local-customer-title" className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/35 p-4" onMouseDown={event => { if (event.target === event.currentTarget && !createAccount.isPending) onClose(); }}>
    <form onSubmit={submit} className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1269e8]">Local CRM record</p><h2 id="create-local-customer-title" className="mt-1 text-xl font-bold tracking-[-0.03em] text-[#14213f]">Add customer</h2></div><button type="button" onClick={onClose} disabled={createAccount.isPending} className="rounded-lg px-2 py-1 text-sm font-bold text-slate-500 hover:bg-slate-100">Close</button></div>
      <p className="mt-3 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2 text-xs leading-5 text-slate-600">This creates a local CRM customer record and an open local invoice. It does not create a Stripe customer or subscription, send an email, or charge a payment method.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-bold text-slate-600">Business name<input required value={form.businessName} onChange={event => update("businessName", event.target.value)} className={fieldClass} placeholder="Company name" /></label>
        <label className="text-xs font-bold text-slate-600">Primary contact<input required value={form.clientName} onChange={event => update("clientName", event.target.value)} className={fieldClass} placeholder="Full name" /></label>
        <label className="text-xs font-bold text-slate-600">Email<input required type="email" value={form.clientEmail} onChange={event => update("clientEmail", event.target.value)} className={fieldClass} placeholder="name@company.com" /></label>
        <label className="text-xs font-bold text-slate-600">Phone<input value={form.clientPhone} onChange={event => update("clientPhone", event.target.value)} className={fieldClass} placeholder="Optional" /></label>
        <label className="text-xs font-bold text-slate-600">Website<input value={form.websiteUrl} onChange={event => update("websiteUrl", event.target.value)} className={fieldClass} placeholder="Optional" /></label>
        <label className="text-xs font-bold text-slate-600">Monthly amount<input required min="1" step="0.01" inputMode="decimal" value={form.monthlyPrice} onChange={event => update("monthlyPrice", event.target.value)} className={fieldClass} placeholder="99.00" /></label>
      </div>
      {(validation || createAccount.error) && <p className="mt-4 text-sm font-medium text-rose-600">{validation || createAccount.error?.message}</p>}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={createAccount.isPending} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600">Cancel</button><button disabled={createAccount.isPending} className="h-10 rounded-xl bg-[#1269e8] px-4 text-sm font-bold text-white disabled:opacity-60">{createAccount.isPending ? "Creating…" : "Create local customer"}</button></div>
    </form>
  </div>;
}

export function AdminCommandOverview() {
  const overview = trpc.adminCommandCenter.getOverview.useQuery(undefined, { retry: false });
  const reconciliation = trpc.adminCommandCenter.financialReconciliation.useQuery(undefined, { retry: false });
  const metrics = overview.data?.metrics;
  return <AdminCommandShell activeHref="/flowsites-admin-dashboard" title="Overview" subtitle="Your business at a glance.">
    {overview.isError ? <ErrorBlock text={overview.error.message} onRetry={() => overview.refetch()} /> : <>
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard href="/flowsites-admin-customers" label="Active customers" value={overview.isLoading ? "—" : String(metrics?.activeCustomers ?? 0)} detail="Active local CRM accounts. Paid-service verification requires subscription sync." />
        <MetricCard href="/flowsites-admin-billing" label="Monthly revenue" value={overview.isLoading ? "—" : formatCents(metrics?.configuredMonthlyRevenueCents ?? 0)} detail="Configured monthly amount on active local accounts; not verified MRR." />
        <MetricCard href="/flowsites-admin-billing" emphasis label="Outstanding balance" value={overview.isLoading ? "—" : formatCents(metrics?.grossOpenInvoiceCents ?? 0)} detail="Gross local open invoice value. Credits and partial payments are not modeled." />
        <MetricCard href="/flowsites-admin-billing?status=overdue" label="Overdue accounts" value={overview.isLoading ? "—" : String(metrics?.overdueAccounts ?? 0)} detail="Unique active-CRM customers with a local invoice marked overdue." />
      </section>
      <div className="mt-6"><CustomerDirectoryTable compact /></div>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-[#14213f]">Financial reconciliation review</h2><p className="mt-1 text-sm text-slate-500">Local record checks only. Provider-side Stripe truth is intentionally not inferred.</p></div><Link href="/flowsites-admin-billing" className="text-sm font-bold text-[#1269e8] hover:underline">Open Billing</Link></div>
        {reconciliation.isLoading ? <p className="mt-5 text-sm text-slate-500">Checking local account and invoice relationships…</p> : reconciliation.isError ? <p className="mt-5 text-sm font-semibold text-rose-600">{reconciliation.error.message}</p> : <div className="mt-5 divide-y divide-slate-100">{(reconciliation.data ?? []).filter(item => item.flags.length > 0).slice(0, 6).map(item => <div key={item.accountId} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"><div><Link href={`/flowsites-admin-customers/${item.accountId}`} className="font-bold text-[#17223b] hover:text-[#1269e8]">{item.businessName}</Link><p className="text-xs text-slate-500">{item.accountType.replaceAll("_", " ")} · {item.flags.map(flag => humanize(flag)).join(" · ")}</p></div><span className="text-xs font-bold text-amber-700">Review</span></div>)}{(reconciliation.data ?? []).every(item => item.flags.length === 0) && <p className="text-sm text-emerald-700">No local reconciliation flags found.</p>}</div>}
      </section>
    </>}
  </AdminCommandShell>;
}

export function AdminCustomersWorkspace() {
  return <AdminCommandShell activeHref="/flowsites-admin-customers" title="Customers" subtitle="Search, review, and open the account record for every active CRM customer."><CustomerDirectoryTable /></AdminCommandShell>;
}

function CollectionWorkspace({ type }: { type: "billing" | "leads" | "projects" }) {
  const config = {
    billing: { href: "/flowsites-admin-billing", title: "Billing", subtitle: "Local invoice records with clear source-of-truth disclosures.", icon: CircleDollarSign },
    leads: { href: "/flowsites-admin-leads", title: "Leads", subtitle: "Review real inquiries without mixing them with customer accounts.", icon: BriefcaseBusiness },
    projects: { href: "/flowsites-admin-projects", title: "Projects", subtitle: "Track active customer projects and launch milestones.", icon: FolderIcon },
  }[type];
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const [status, setStatus] = useState(() => type === "billing" ? (new URLSearchParams(window.location.search).get("status") ?? "all") : "all");
  const accountId = type === "billing" ? Number(new URLSearchParams(window.location.search).get("accountId")) : undefined;
  const [cursor, setCursor] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const overview = trpc.adminCommandCenter.getOverview.useQuery(undefined, { enabled: type === "billing", retry: false });
  const billing = trpc.adminCommandCenter.listInvoices.useQuery({ query: query || undefined, status: status === "all" ? undefined : status as "draft" | "open" | "paid" | "overdue" | "void", accountId: accountId && Number.isInteger(accountId) && accountId > 0 ? accountId : undefined, cursor: cursor ?? undefined, pageSize: 25 }, { enabled: type === "billing" });
  const leads = trpc.adminCommandCenter.listLeads.useQuery({ query: query || undefined, status: status === "all" ? undefined : status as LeadStatus, cursor: cursor ?? undefined, pageSize: 25 }, { enabled: type === "leads" });
  const projects = trpc.adminCommandCenter.listProjects.useQuery({ cursor: cursor ?? undefined, pageSize: 25 }, { enabled: type === "projects" });
  const active = type === "billing" ? billing : type === "leads" ? leads : projects;
  const rows = (active.data?.items ?? []) as any[];
  const reset = (nextQuery?: string, nextStatus?: string) => { if (nextQuery !== undefined) setQuery(nextQuery); if (nextStatus !== undefined) setStatus(nextStatus); setCursor(null); setHistory([]); };
  const next = () => { if (active.data?.nextCursor) { setHistory(v => [...v, cursor ?? ""]); setCursor(active.data.nextCursor); } };
  const previous = () => { const copy = [...history]; const previousCursor = copy.pop(); setHistory(copy); setCursor(previousCursor || null); };
  const Icon = config.icon;
  const statusOptions = type === "billing" ? ["all", "draft", "open", "paid", "overdue", "void"] : type === "leads" ? ["all", "new", "contacted", "in_progress", "proposal_sent", "won", "lost"] : ["all"];

  return <AdminCommandShell activeHref={config.href} title={config.title} subtitle={config.subtitle}>
      {type === "billing" && <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-500">Gross local open invoices</p><p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#14213f]">{overview.isLoading ? "—" : formatCents(overview.data?.metrics.grossOpenInvoiceCents ?? 0)}</p></div><div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-500">Open invoice records</p><p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#14213f]">{overview.isLoading ? "—" : String(overview.data?.metrics.openInvoiceCount ?? 0)}</p></div><div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4 lg:col-span-1"><p className="text-xs font-bold text-slate-500">Overdue accounts</p><p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#14213f]">{overview.isLoading ? "—" : String(overview.data?.metrics.overdueAccounts ?? 0)}</p></div></section>}
      {type === "billing" && accountId && Number.isInteger(accountId) && accountId > 0 && <p className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">Showing invoices linked to customer account #{accountId}. Payment history, credits, and provider attempts remain unavailable until their source ledgers are synchronized.</p>}
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_26px_rgba(31,58,94,0.045)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#1269e8]"><Icon size={19} /></span><div><h2 className="font-bold text-[#14213f]">{config.title} records</h2><p className="text-sm text-slate-500">{active.data?.total ?? "—"} current records</p></div></div>{type !== "projects" && <div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={event => reset(event.target.value)} placeholder={`Search ${type}`} className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-400 sm:w-64"/></label><select value={status} onChange={event => reset(undefined, event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-blue-400">{statusOptions.map(option => <option key={option} value={option}>{option === "all" ? "All statuses" : humanize(option)}</option>)}</select></div>}</div>
      {active.isLoading ? <LoadingRows /> : active.isError ? <ErrorBlock text={active.error.message} onRetry={() => active.refetch()} /> : <><div className="overflow-x-auto"><table className="min-w-[860px] w-full text-left"><thead><tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-[0.11em] text-slate-400">{type === "billing" ? <><th className="px-5 py-3.5">Invoice</th><th className="px-5 py-3.5">Customer</th><th className="px-5 py-3.5">Balance</th><th className="px-5 py-3.5">Due</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5 text-right">Action</th></> : type === "leads" ? <><th className="px-5 py-3.5">Business</th><th className="px-5 py-3.5">Contact</th><th className="px-5 py-3.5">Source</th><th className="px-5 py-3.5">Follow-up</th><th className="px-5 py-3.5">Status</th></> : <><th className="px-5 py-3.5">Project</th><th className="px-5 py-3.5">Client</th><th className="px-5 py-3.5">Stage</th><th className="px-5 py-3.5">Launch</th><th className="px-5 py-3.5">Status</th></>}</tr></thead><tbody>{rows.length ? rows.map(row => type === "billing" ? <tr key={row.id} className="border-b border-slate-50"><td className="px-5 py-4 font-bold text-[#17223b]">{row.invoiceNumber}<span className="ml-2 text-xs font-medium text-slate-400">{row.isRecurring ? "Recurring" : humanize(row.invoiceType)}</span></td><td className="px-5 py-4"><Link href={row.accountId ? `/flowsites-admin-customers/${row.accountId}` : "/flowsites-admin-customers"} className="font-semibold text-[#17223b] hover:text-[#1269e8]">{row.businessName || "Historical account"}</Link><p className="text-xs text-slate-500">{row.clientName || "Customer record unavailable"}</p></td><td className="px-5 py-4 font-bold text-[#17223b]"><Link href={row.accountId ? `/flowsites-admin-billing?accountId=${row.accountId}` : "/flowsites-admin-billing"} className="hover:text-[#1269e8] hover:underline">{formatCents(row.totalAmountCents)}</Link></td><td className="px-5 py-4 text-sm text-slate-600">{row.dueDate || "—"}</td><td className="px-5 py-4"><StatusPill value={row.status}/></td><td className="px-5 py-4 text-right">{row.shareToken ? <a href={`/invoice/${row.shareToken}`} target="_blank" rel="noreferrer" className="inline-flex rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#1269e8] hover:bg-blue-50">View invoice</a> : <span className="text-xs text-slate-400">Unavailable</span>}</td></tr> : type === "leads" ? <tr key={row.id} className="border-b border-slate-50"><td className="px-5 py-4 font-bold text-[#17223b]">{row.businessName}<p className="mt-0.5 text-xs font-medium text-slate-500">{row.businessType}</p></td><td className="px-5 py-4"><p className="font-semibold text-slate-700">{row.contactName || "Contact not supplied"}</p><p className="text-xs text-slate-500">{row.email}</p></td><td className="px-5 py-4 text-sm text-slate-600">{row.source ? humanize(row.source) : "Unattributed"}</td><td className="px-5 py-4 text-sm text-slate-600">{row.followUpDate || "Not scheduled"}</td><td className="px-5 py-4"><StatusPill value={row.status}/></td></tr> : <tr key={row.id} className="border-b border-slate-50"><td className="px-5 py-4"><p className="font-bold text-[#17223b]">{row.businessName}</p><p className="text-xs text-slate-500">{row.websiteDomain || "Domain not recorded"}</p></td><td className="px-5 py-4"><p className="font-semibold text-slate-700">{row.clientName}</p><p className="text-xs text-slate-500">{row.clientEmail}</p></td><td className="px-5 py-4 text-sm text-slate-600">Stage {row.currentStage + 1} · {row.stageProgress}%</td><td className="px-5 py-4 text-sm text-slate-600">{row.estimatedLaunchDate || "Not scheduled"}</td><td className="px-5 py-4"><StatusPill value={row.status}/></td></tr>) : <tr><td colSpan={5}><EmptyState label={`No ${type} records match this view.`}/></td></tr>}</tbody></table></div><div className="flex items-center justify-between border-t border-slate-100 px-5 py-4"><p className="text-xs text-slate-500">Page data is server-filtered and bounded to protect the CRM.</p><div className="flex gap-2"><button onClick={previous} disabled={!history.length || active.isFetching} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold disabled:opacity-40">Previous</button><button onClick={next} disabled={!active.data?.nextCursor || active.isFetching} className="rounded-lg bg-[#1269e8] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40">Next</button></div></div></>}
    </section>
    {type === "billing" && <p className="mt-4 text-xs leading-5 text-slate-500">Billing totals are based on local invoice records. Payment allocation, credits, refunds, disputes, and live Stripe subscription synchronization are not yet available in this workspace.</p>}
  </AdminCommandShell>;
}

export function AdminBillingWorkspace() { return <CollectionWorkspace type="billing" />; }
export function AdminLeadsWorkspace() { return <CollectionWorkspace type="leads" />; }
export function AdminProjectsWorkspace() { return <CollectionWorkspace type="projects" />; }

export function AdminCustomerDetailWorkspace() {
  const [, params] = useRoute("/flowsites-admin-customers/:accountId");
  const [, setLocation] = useLocation();
  const accountId = Number(params?.accountId);
  const [tab, setTab] = useState<"overview" | "billing" | "services" | "activity">("overview");
  const [showRemoval, setShowRemoval] = useState(false);
  const summary = trpc.adminCommandCenter.getCustomerSummary.useQuery({ accountId }, { enabled: Number.isInteger(accountId) && accountId > 0, retry: false });
  const invoices = trpc.adminCommandCenter.listInvoices.useQuery({ accountId, pageSize: 25 }, { enabled: tab === "billing" && Number.isInteger(accountId) && accountId > 0, retry: false });
  const utils = trpc.useUtils();
  const removeCustomer = trpc.clientBilling.adminRemoveCustomer.useMutation({ onSuccess: async () => { await utils.adminCommandCenter.listCustomers.invalidate(); await utils.adminCommandCenter.getOverview.invalidate(); setLocation("/flowsites-admin-customers"); } });
  const detail = summary.data;
  const account = detail?.account;
  return <AdminCommandShell activeHref="/flowsites-admin-customers" title={account?.businessName || "Customer account"} subtitle="Customer record, local billing summary, and service status.">
    <Link href="/flowsites-admin-customers" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#1269e8]"><ArrowLeft size={16}/> Back to Customers</Link>
    {summary.isLoading ? <LoadingRows /> : summary.isError || !detail || !account ? <ErrorBlock text={summary.error?.message || "Customer account could not be found."} onRetry={() => summary.refetch()} /> : <>
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_26px_rgba(31,58,94,0.045)] sm:p-7"><div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between"><div className="flex gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-lg font-extrabold text-blue-700">{account.businessName.slice(0, 2).toUpperCase()}</span><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold tracking-[-0.04em] text-[#14213f]">{account.businessName}</h2><StatusPill value={account.status}/></div><p className="mt-1 text-sm text-slate-500">{account.clientName} · {account.clientEmail}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">{account.clientPhone && <a href={`tel:${account.clientPhone}`} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 hover:text-[#1269e8]"><Phone size={13}/>{account.clientPhone}</a>}<a href={`mailto:${account.clientEmail}`} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 hover:text-[#1269e8]"><Mail size={13}/>Email</a>{account.websiteUrl && <a href={account.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 hover:text-[#1269e8]"><ExternalLink size={13}/>Website</a>}</div></div></div><div className="flex flex-col gap-3 sm:flex-row sm:items-start"><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#f6f9fe] px-4 py-3"><p className="text-xs font-semibold text-slate-500">Configured monthly</p><p className="mt-1 text-lg font-bold text-[#14213f]">{formatCents(account.monthlyPriceCents)}</p></div><div className="rounded-xl bg-[#f6f9fe] px-4 py-3"><p className="text-xs font-semibold text-slate-500">Outstanding local invoices</p><p className="mt-1 text-lg font-bold text-[#14213f]">{formatCents(detail!.invoiceSummary.outstandingInvoiceCents)}</p></div></div><button type="button" onClick={() => setShowRemoval(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 text-xs font-bold text-rose-700 hover:bg-rose-50"><Trash2 size={15}/> Remove customer</button></div></div>
        <div className="mt-7 flex gap-1 overflow-x-auto border-b border-slate-200">{(["overview", "billing", "services", "activity"] as const).map(item => <button key={item} onClick={() => setTab(item)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold capitalize transition ${tab === item ? "border-[#1269e8] text-[#1269e8]" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{item}</button>)}</div>
        <div className="pt-6">{tab === "overview" && <div className="grid gap-4 md:grid-cols-3"><DetailFact icon={CircleDollarSign} label="Local paid invoices" value={formatCents(detail!.invoiceSummary.paidInvoiceCents)} note="Invoice records marked paid locally."/><DetailFact icon={FileText} label="Invoice records" value={String(detail!.invoiceSummary.invoiceCount)} note="Open, paid, draft, overdue, or void records."/><DetailFact icon={CalendarDays} label="Customer since" value={formatDate(account.createdAt)} note={`Billing cycle: ${account.billingCycle}.`}/></div>}{tab === "billing" && <div>{invoices.isLoading ? <LoadingRows /> : invoices.isError ? <ErrorBlock text={invoices.error.message} onRetry={() => invoices.refetch()}/> : <div className="space-y-3">{invoices.data?.items.length ? invoices.data.items.map(invoice => <div key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-[#fbfcfe] p-4"><div><p className="font-bold text-[#17223b]">{invoice.invoiceNumber}</p><p className="mt-1 text-xs text-slate-500">Due {invoice.dueDate} · {invoice.isRecurring ? "Recurring" : humanize(invoice.invoiceType)}</p></div><div className="flex items-center gap-4"><p className="font-bold text-[#17223b]">{formatCents(invoice.totalAmountCents)}</p><StatusPill value={invoice.status}/></div></div>) : <EmptyState label="No local invoices are linked to this customer."/>}<p className="pt-2 text-xs text-slate-500">{detail!.disclosures.balance}</p></div>}</div>}{tab === "services" && <div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-slate-100 bg-[#fbfcfe] p-5"><div className="flex items-center gap-2"><Sparkles size={17} className="text-[#1269e8]"/><p className="font-bold text-[#17223b]">Service configuration</p></div><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Billing cycle</dt><dd className="font-bold capitalize">{account.billingCycle}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Billing start</dt><dd className="font-bold">{account.billingStartDate || "Not recorded"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Project link</dt><dd className="font-bold">{account.projectId ? `Project #${account.projectId}` : "Not linked"}</dd></div></dl></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-5"><div className="flex items-center gap-2"><ShieldAlert size={17} className="text-amber-600"/><p className="font-bold text-amber-950">Subscription verification</p></div><p className="mt-3 text-sm leading-6 text-amber-900">{detail!.disclosures.subscription}</p></div></div>}{tab === "activity" && <div className="rounded-xl border border-slate-100 bg-[#fbfcfe] p-5"><p className="font-bold text-[#17223b]">Recorded account activity</p><div className="mt-4 space-y-4"><ActivityLine icon={Building2} title="Customer account created" date={formatDate(account.createdAt)}/><ActivityLine icon={CheckCircle2} title="Customer account last updated" date={formatDate(account.updatedAt)}/></div><p className="mt-5 text-xs leading-5 text-slate-500">A unified customer activity feed is not yet available. This panel only shows source-backed account timestamps.</p></div>}</div>
      </section>
      {showRemoval && <CustomerRemovalDialog account={account} pending={removeCustomer.isPending} error={removeCustomer.error?.message} onClose={() => setShowRemoval(false)} onSubmit={(deletionCode, reason) => removeCustomer.mutate({ source: "billing", accountId: account.id, businessNameConfirmation: account.businessName, deletionCode, reason })} />}
    </>}
  </AdminCommandShell>;
}

export function AdminSettingsWorkspace() {
  return <AdminCommandShell activeHref="/flowsites-admin-settings" title="Settings" subtitle="Operational controls and protected integrations."><section className="grid gap-4 lg:grid-cols-3"><SettingsCard icon={Bot} title="Cue integrations" body="Manage read-only Cue credentials and audit access." href="/flowsites-admin-integrations"/><SettingsCard icon={Phone} title="Cue telephone" body="Review voice integration readiness and credentials." href="/flowsites-admin-cue-telephone"/><SettingsCard icon={CalendarDays} title="Scheduling" body="Manage staff scheduling and availability." href="/flowsites-admin-scheduling"/></section></AdminCommandShell>;
}

function CustomerRemovalDialog({ account, pending, error, onClose, onSubmit }: { account: { id: number; businessName: string; clientEmail: string; stripeSubscriptionId?: string | null; stripeCustomerId?: string | null }; pending: boolean; error?: string; onClose: () => void; onSubmit: (deletionCode: string, reason: string) => void }) {
  const [deletionCode, setDeletionCode] = useState("");
  const [reason, setReason] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSubmit(deletionCode, reason); };
  return <div role="dialog" aria-modal="true" aria-labelledby="customer-removal-title" className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/35 p-4" onMouseDown={event => { if (event.target === event.currentTarget && !pending) onClose(); }}>
    <form onSubmit={submit} className="w-full max-w-lg rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl">
      <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-700"><Trash2 size={18}/></span><div><h2 id="customer-removal-title" className="font-bold text-slate-950">Remove customer from active CRM</h2><p className="mt-1 text-sm leading-6 text-slate-600">This revokes portal access and hides the account from active CRM views. Invoices, Stripe IDs, and the audit record remain retained.</p></div></div>
      <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">If this account has a live Stripe subscription, cancel it in Stripe first. This action will not cancel subscriptions or erase payment history.</div>
      <div className="mt-5 space-y-4"><label className="block text-xs font-bold text-slate-600">Customer to remove<input readOnly value={account.businessName} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700"/></label><label className="block text-xs font-bold text-slate-600">Deletion code<input required value={deletionCode} onChange={event => setDeletionCode(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50" autoComplete="off"/></label><label className="block text-xs font-bold text-slate-600">Reason<textarea required minLength={3} value={reason} onChange={event => setReason(event.target.value)} className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50" placeholder="Why is this customer being removed?"/></label></div>
      {error && <p className="mt-4 text-sm font-semibold text-rose-700">{error}</p>}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={pending} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600">Cancel</button><button type="submit" disabled={pending || deletionCode.length === 0 || reason.trim().length < 3} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white disabled:opacity-50">{pending && <Loader2 size={15} className="animate-spin"/>}<Trash2 size={15}/> Remove customer</button></div>
    </form>
  </div>;
}

function DetailFact({ icon: Icon, label, value, note }: { icon: typeof CircleDollarSign; label: string; value: string; note: string }) { return <div className="rounded-xl border border-slate-100 bg-[#fbfcfe] p-5"><Icon size={19} className="text-[#1269e8]"/><p className="mt-5 text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-[#14213f]">{value}</p><p className="mt-2 text-xs leading-5 text-slate-500">{note}</p></div>; }
function ActivityLine({ icon: Icon, title, date }: { icon: typeof Building2; title: string; date: string }) { return <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-[#1269e8]"><Icon size={16}/></span><div><p className="text-sm font-bold text-slate-700">{title}</p><p className="text-xs text-slate-500">{date}</p></div></div>; }
function SettingsCard({ icon: Icon, title, body, href }: { icon: typeof Bot; title: string; body: string; href: string }) { return <Link href={href} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_26px_rgba(31,58,94,0.045)] transition hover:-translate-y-0.5 hover:border-blue-200"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-[#1269e8]"><Icon size={20}/></span><p className="mt-6 font-bold text-[#14213f]">{title}</p><p className="mt-2 text-sm leading-6 text-slate-500">{body}</p><p className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#1269e8]">Open <ArrowUpRight size={15}/></p></Link>; }
function LoadingRows() { return <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div>; }
function ErrorBlock({ text, onRetry }: { text: string; onRetry: () => void }) { return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center"><p className="font-bold text-rose-900">This workspace could not load.</p><p className="mt-2 text-sm text-rose-700">{text}</p><button onClick={onRetry} className="mt-4 rounded-lg bg-rose-700 px-3 py-2 text-sm font-bold text-white">Try again</button></div>; }
function EmptyState({ label }: { label: string }) { return <div className="py-12 text-center"><p className="font-semibold text-slate-600">{label}</p><p className="mt-1 text-sm text-slate-400">Change the active filters or add a source-backed record.</p></div>; }
function FolderIcon(props: ComponentProps<typeof BriefcaseBusiness>) { return <BriefcaseBusiness {...props} />; }
