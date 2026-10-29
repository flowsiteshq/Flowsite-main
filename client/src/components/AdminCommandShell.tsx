import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  Bot,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  CircleDollarSign,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  UsersRound,
  X,
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "/flowsites-admin-dashboard", icon: LayoutDashboard },
  { label: "Customers", href: "/flowsites-admin-customers", icon: UsersRound },
  { label: "Billing", href: "/flowsites-admin-billing", icon: CircleDollarSign },
  { label: "Leads", href: "/flowsites-admin-leads", icon: BriefcaseBusiness },
  { label: "Cue AI", href: "/flowsites-admin-cue-telephone", icon: Bot },
  { label: "Projects", href: "/flowsites-admin-projects", icon: FolderKanban },
  { label: "Knowledge Center", href: "/flowsites-admin-knowledge", icon: BookOpen },
  { label: "Settings", href: "/flowsites-admin-settings", icon: Settings },
] as const;

function SearchGroup<T extends { id: number }>({ label, items, href, primary, secondary, onSelect }: {
  label: string;
  items: T[];
  href: (item: T) => string;
  primary: (item: T) => string | null;
  secondary: (item: T) => string | null;
  onSelect: () => void;
}) {
  if (!items.length) return null;
  return <div className="py-1"><p className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>{items.map(item => <Link key={`${label}-${item.id}`} href={href(item)} onClick={onSelect} className="block rounded-lg px-2 py-2 hover:bg-slate-50"><p className="truncate text-sm font-semibold text-slate-700">{primary(item) || "Record"}</p><p className="truncate text-xs text-slate-500">{secondary(item) || "No additional detail"}</p></Link>)}</div>;
}

export function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}

export function AdminCommandGuard({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const verify = trpc.admin.verify.useQuery(undefined, { retry: false });

  useEffect(() => {
    if (!verify.isLoading && !verify.data?.authenticated) {
      window.location.href = getLoginUrl("/flowsites-admin-dashboard");
    }
  }, [verify.isLoading, verify.data?.authenticated, navigate]);

  if (verify.isLoading) {
    return <div className="min-h-screen bg-[#f5f8fc] grid place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-100 border-t-[#1269e8]" /></div>;
  }
  if (!verify.data?.authenticated) return null;
  return <>{children}</>;
}

export function AdminCommandShell({
  activeHref,
  title,
  subtitle,
  children,
  actions,
}: {
  activeHref: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [, navigate] = useLocation();
  const searchTerm = globalSearch.trim();
  const searchResults = trpc.adminCommandCenter.globalSearch.useQuery({ query: searchTerm }, { enabled: searchTerm.length >= 2, retry: false });
  const logout = trpc.admin.logout.useMutation({
    onSuccess: () => navigate("/flowsites-admin-secret"),
  });

  return (
    <AdminCommandGuard>
      <div className="min-h-screen bg-[#f5f8fc] text-[#17223b]">
        {open && <button aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" />}
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-gray-200 bg-white text-gray-900 transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
          <div className="flex items-center justify-between px-6 pt-7 pb-6">
            <Link href="/flowsites-admin-dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
              <img src="/flowsites-logo-transparent.png" alt="FlowSites" className="h-10 w-auto" />
              <span className="sr-only">FlowSites Admin</span>
            </Link>
            <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 lg:hidden" aria-label="Close navigation"><X size={18} /></button>
          </div>
          <nav className="flex-1 px-3" aria-label="Admin primary navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activeHref === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`mb-1 flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition ${active ? "border-black bg-black text-white" : "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}>
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-100 p-4">
            <Link href="/flowsites-admin-video-orders" className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"><FileText size={17} /> Video orders</Link>
            <a href="mailto:hello@flow-sites.com?subject=FlowSites%20Admin%20Support" className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"><Settings size={17} /> Help &amp; Support</a>
            <button onClick={() => logout.mutate()} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900">
              Sign out <ChevronRight size={16} />
            </button>
          </div>
        </aside>
        <div className="lg:pl-[240px]">
          <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur lg:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open navigation"><Menu size={21} /></button>
              <div className="min-w-0"><h1 className="truncate text-xl font-bold tracking-[-0.03em] text-[#13213f] sm:text-2xl">{title}</h1><p className="hidden text-sm text-slate-500 sm:block">{subtitle}</p></div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {actions}
              <div className="relative hidden sm:block"><form onSubmit={(event) => { event.preventDefault(); navigate(`/flowsites-admin-customers${searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : ""}`); }} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[#f8fafc] px-3 py-2"><Search size={15} className="text-slate-400" /><input aria-label="Search customers, invoices, leads" value={globalSearch} onChange={event => setGlobalSearch(event.target.value)} placeholder="Search customers, invoices, leads" className="w-36 bg-transparent text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400 lg:w-56" /></form>{searchTerm.length >= 2 && <div className="absolute right-0 mt-2 max-h-[360px] w-[360px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl"><p className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Search results</p>{searchResults.isLoading ? <p className="px-2 py-3 text-sm text-slate-500">Searching records…</p> : <><SearchGroup label="Customers" items={searchResults.data?.customers ?? []} onSelect={() => setGlobalSearch("")} href={(item) => `/flowsites-admin-customers/${item.id}`} primary={(item) => item.businessName} secondary={(item) => `${item.clientName} · ${item.clientEmail}`} /><SearchGroup label="Invoices" items={searchResults.data?.invoices ?? []} onSelect={() => setGlobalSearch("")} href={(item) => `/flowsites-admin-billing?q=${encodeURIComponent(item.invoiceNumber)}`} primary={(item) => item.invoiceNumber} secondary={(item) => item.businessName || "Historical account"} /><SearchGroup label="Leads" items={searchResults.data?.leads ?? []} onSelect={() => setGlobalSearch("")} href={(item) => `/flowsites-admin-leads?q=${encodeURIComponent(item.businessName)}`} primary={(item) => item.businessName} secondary={(item) => item.contactName || item.email} />{!searchResults.data?.customers.length && !searchResults.data?.invoices.length && !searchResults.data?.leads.length && <p className="px-2 py-3 text-sm text-slate-500">No matching customers, invoices, or leads.</p>}</>}</div>}</div>
              <button type="button" aria-label="Notifications" title="Notifications will appear here when operational alerts are connected." className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-[#1269e8]"><Bell size={18}/><span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-rose-500" /></button>
              <div className="relative"><button type="button" onClick={() => setUserMenuOpen(value => !value)} aria-expanded={userMenuOpen} className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-slate-100"><span className="grid h-8 w-8 place-items-center rounded-full bg-black text-xs font-extrabold text-white">AD</span><span className="hidden text-sm font-bold text-[#17223b] md:inline">Admin</span><ChevronRight size={15} className={`hidden text-slate-400 transition md:block ${userMenuOpen ? "rotate-90" : ""}`} /></button>{userMenuOpen && <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><Link href="/flowsites-admin-settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Settings size={16}/>Settings &amp; integrations</Link><Link href="/flowsites-admin-knowledge" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><BookOpen size={16}/>Knowledge Center</Link><button onClick={() => logout.mutate()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50">Sign out</button></div>}</div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1540px] px-4 py-6 sm:px-7 lg:px-9 lg:py-8">{children}</main>
        </div>
      </div>
    </AdminCommandGuard>
  );
}
