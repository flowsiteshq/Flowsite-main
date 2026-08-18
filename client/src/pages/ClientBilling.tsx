import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  LayoutDashboard, BarChart2, Gauge, Search, Users, Image, FileText,
  BookOpen, CreditCard, Receipt, Globe, Settings, LogIn, Building2,
  AlertTriangle, Bell, ExternalLink, RefreshCw, Monitor, Smartphone,
  TrendingUp, TrendingDown, Shield, CheckCircle,
  MessageSquare, Upload, Trash2, Eye, DollarSign, ChevronRight,
  ArrowUpRight, Wifi, Lock, HardDrive, Activity, Headphones, BookMarked,
  Sparkles,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

const NAV_ITEMS = [
  { id: "overview",     label: "My Website",        icon: LayoutDashboard },
  { id: "analytics",    label: "Analytics",          icon: BarChart2 },
  { id: "performance",  label: "Performance",        icon: Gauge },
  { id: "seo",          label: "SEO",                icon: Search },
  { id: "leads",        label: "Leads",              icon: Users },
  { id: "media",        label: "Media",              icon: Image },
  { id: "pages",        label: "Pages",              icon: FileText },
  { id: "blog",         label: "Blog",               icon: BookOpen },
  { id: "payments",     label: "Payments",           icon: CreditCard },
  { id: "invoices",     label: "Invoices",           icon: Receipt },
  { id: "domains",      label: "Domains & Security", icon: Globe },
  { id: "settings",     label: "Settings",           icon: Settings },
];

const TRAFFIC_DATA = [
  { name: "Organic Search", value: 45.2, color: "#6366f1" },
  { name: "Direct",         value: 28.1, color: "#8b5cf6" },
  { name: "Referral",       value: 15.3, color: "#a78bfa" },
  { name: "Social Media",   value: 7.8,  color: "#c4b5fd" },
  { name: "Email",          value: 3.6,  color: "#ddd6fe" },
];

const SPARKLINE_SETS = [
  [10,14,12,18,22,19,25,28,24,30,35,32,38],
  [8,11,9,14,17,15,20,22,18,24,28,26,31],
  [3,5,4,7,9,8,12,14,11,16,19,17,22],
  [120,145,132,158,172,165,180,195,178,210,225,215,240],
];

const PERF_CHART = [
  { day: "May 1", views: 1200, visitors: 480 },
  { day: "May 2", views: 980,  visitors: 390 },
  { day: "May 3", views: 1450, visitors: 580 },
  { day: "May 4", views: 1100, visitors: 440 },
  { day: "May 5", views: 1680, visitors: 670 },
  { day: "May 6", views: 1320, visitors: 528 },
  { day: "May 7", views: 1560, visitors: 624 },
];

const TOP_PAGES = [
  { path: "/",         views: 8456, visitors: 4231, pct: 100 },
  { path: "/services", views: 4231, visitors: 2123, pct: 50  },
  { path: "/about",    views: 2123, visitors: 1023, pct: 25  },
  { path: "/contact",  views: 1234, visitors: 768,  pct: 15  },
  { path: "/blog",     views: 1023, visitors: 432,  pct: 12  },
];

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const W = 80, H = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CircleScore({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 28, circ = 2 * Math.PI * r, dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#f1f5f9" strokeWidth="5" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">
          {score}
        </span>
      </div>
      <span className="text-xs text-gray-500 text-center leading-tight">{label}</span>
    </div>
  );
}

// ─── Pages Tab Component ─────────────────────────────────────────────────────
function PagesTab() {
  const { isAuthenticated } = useAuth();
  const { data: pages, isLoading } = trpc.clientBilling.getMyPages.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const [requestedPageId, setRequestedPageId] = useState<number | null>(null);

  function handleRequestEdit(pageId: number, pageTitle: string) {
    setRequestedPageId(pageId);
    toast.success(`Edit request sent for "${pageTitle}"! We'll reach out within 24 hours.`);
    setTimeout(() => setRequestedPageId(null), 3000);
  }

  const statusConfig = {
    live:        { label: "Live",        className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    draft:       { label: "Draft",       className: "bg-gray-50 text-gray-600 border border-gray-200" },
    in_progress: { label: "In Progress", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Website Pages</h2>
          <p className="text-gray-500 text-sm mt-1">Your website pages managed by FlowSites.</p>
        </div>
        {pages && pages.length > 0 && (
          <span className="text-sm text-gray-400">{pages.length} page{pages.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : !pages || pages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-gray-500 font-medium">No pages yet</p>
          <p className="text-gray-400 text-sm mt-1">Your website pages will appear here once they are set up.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pages.map((page) => {
            const status = statusConfig[page.status as keyof typeof statusConfig] ?? statusConfig.live;
            const isRequested = requestedPageId === page.id;
            return (
              <div
                key={page.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <h3 className="font-semibold text-gray-900 truncate">{page.title}</h3>
                    </div>
                    <p className="text-xs text-gray-400 font-mono truncate">{page.path}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                {page.description && (
                  <p className="text-sm text-gray-500 leading-relaxed">{page.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    {page.lastUpdated ? `Updated ${page.lastUpdated}` : ""}
                  </span>
                  <button
                    onClick={() => handleRequestEdit(page.id, page.title)}
                    disabled={isRequested}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                      isRequested
                        ? "bg-emerald-50 text-emerald-600 cursor-default"
                        : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    }`}
                  >
                    {isRequested ? "✓ Requested" : "Request Edit"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SnippetBox({ token }: { token: string }) {
  const snippet = `<script>\n(function(){\n  var sid=sessionStorage.getItem('_fs_sid');\n  if(!sid){sid=Math.random().toString(36).slice(2)+Date.now().toString(36);sessionStorage.setItem('_fs_sid',sid);}\n  var t='${token}';\n  fetch(window.location.origin+'/api/trpc/analytics.track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({json:{token:t,path:location.pathname,sessionId:sid,referrer:document.referrer,userAgent:navigator.userAgent,href:location.href}})}).catch(function(){});\n})();\n<\/script>`;
  return (
    <div>
      <pre className="bg-gray-50 rounded-xl p-4 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap break-all select-all border border-gray-100">{snippet}</pre>
      <button
        onClick={() => { navigator.clipboard.writeText(snippet); toast.success("Snippet copied!"); }}
        className="mt-3 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
      >
        Copy Snippet
      </button>
    </div>
  );
}

export default function ClientBilling() {
  const { user, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsRange, setAnalyticsRange] = useState<"7d" | "30d" | "90d">("30d");
  const [mobileView, setMobileView] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: account, isLoading: accountLoading } =
    trpc.clientBilling.getMyAccount.useQuery(undefined, { enabled: isAuthenticated });
  const { data: invoices, isLoading: invoicesLoading } =
    trpc.clientBilling.getMyInvoices.useQuery(undefined, { enabled: isAuthenticated });
  const { data: analyticsData, refetch: refetchPerf } =
    trpc.clientBilling.getSiteAnalytics.useQuery({ range: "6m" }, { enabled: isAuthenticated });
  const analyticsDays = analyticsRange === "7d" ? 7 : analyticsRange === "90d" ? 90 : 30;
  const { data: realStats, isLoading: statsLoading } =
    trpc.analytics.getStats.useQuery(
      { projectId: account?.projectId ?? 0, days: analyticsDays },
      { enabled: !!account?.projectId }
    );
  const { data: realTopPages } =
    trpc.analytics.getTopPages.useQuery(
      { projectId: account?.projectId ?? 0, days: analyticsDays },
      { enabled: !!account?.projectId }
    );
  const { data: realTrafficSources } =
    trpc.analytics.getTrafficSources.useQuery(
      { projectId: account?.projectId ?? 0, days: analyticsDays },
      { enabled: !!account?.projectId }
    );
  const { data: analyticsToken } =
    trpc.analytics.getToken.useQuery(
      { projectId: account?.projectId ?? 0 },
      { enabled: !!account?.projectId }
    );
  const { data: media, isLoading: mediaLoading, refetch: refetchMedia } =
    trpc.clientBilling.getMyMedia.useQuery(undefined, { enabled: isAuthenticated });
  const { refetch: refetchUpgrades } =
    trpc.clientBilling.getMyUpgradeRequests.useQuery(undefined, { enabled: isAuthenticated });

  const createCheckoutMutation = trpc.clientBilling.createInvoiceCheckout.useMutation({
    onSuccess: (data) => { if (data.checkoutUrl) window.open(data.checkoutUrl, "_blank"); },
    onError: (e) => toast.error(e.message),
  });
  const requestUpgrade = trpc.clientBilling.requestUpgrade.useMutation({
    onSuccess: (data, vars) => {
      if (data.shareToken) {
        toast.success(
          <span>Invoice created for "{vars.featureLabel}"!{" "}
            <a href={`/invoice/${data.shareToken}`} target="_blank" rel="noreferrer" className="underline font-semibold">Pay Now →</a>
          </span>,
          { duration: 8000 }
        );
      } else {
        toast.success(`Request sent for "${vars.featureLabel}"! We'll reach out within 24 hours.`);
      }
      refetchUpgrades();
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMediaMutation = trpc.clientBilling.deleteMyMedia.useMutation({
    onSuccess: () => { refetchMedia(); toast.success("File deleted"); },
    onError: (e) => toast.error(e.message),
  });
  const getUploadUrlMutation = trpc.clientBilling.getUploadUrl.useMutation();
  const confirmUploadMutation = trpc.clientBilling.confirmUpload.useMutation({
    onSuccess: () => refetchMedia(),
  });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const mediaType = file.type.startsWith("video/") ? "video" : "photo";
    setUploadingFile(true);
    try {
      const { mediaId, fileKey } = await getUploadUrlMutation.mutateAsync({
        fileName: file.name, mimeType: file.type, fileSizeBytes: file.size, mediaType,
      });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileKey", fileKey);
      const res = await fetch("/api/upload-media", { method: "POST", credentials: "include", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      await confirmUploadMutation.mutateAsync({ mediaId, fileUrl: url });
      toast.success(`${file.name} uploaded successfully`);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Upload failed");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /* ── Loading / auth gates ── */
  if (loading || accountLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 max-w-md w-full text-center p-10 border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Client Portal</h2>
          <p className="text-gray-500 mb-8">Sign in to access your website dashboard, analytics, invoices, and more.</p>
          <button
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-200"
            onClick={() => { window.location.href = getLoginUrl(); }}>
            <LogIn className="w-4 h-4 mr-2 inline" /> Sign In
          </button>
        </div>
      </div>
    );
  }
  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 max-w-md w-full text-center p-10 border border-gray-100">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Account Found</h2>
          <p className="text-gray-500 mb-4">
            Your account has not been set up yet. Contact{" "}
            <a href="mailto:support@flow-sites.com" className="text-indigo-600 underline">support@flow-sites.com</a>.
          </p>
        </div>
      </div>
    );
  }

  const openInvoices = (invoices ?? []).filter(i => i.status === "open" || i.status === "overdue");
  const totalOwed = openInvoices.reduce((s, i) => s + i.totalAmountCents, 0);
  const websiteUrl = account.websiteUrl || "yourwebsite.com";
  const businessName = account.businessName || account.clientName;
  const perf = { performance: 92, seo: 88, accessibility: 76, bestPractices: 90 };

  const recentActivity = [
    { icon: Users,    color: "text-blue-500 bg-blue-50",    label: "New lead captured",   sub: "Contact form submission",          time: "2h ago" },
    { icon: DollarSign, color: "text-green-500 bg-green-50", label: "Payment received",   sub: `Invoice · ${formatCents(account.monthlyPriceCents)}`, time: "5h ago" },
    { icon: Globe,    color: "text-indigo-500 bg-indigo-50", label: "Site published",      sub: websiteUrl,                         time: "2d ago"  },
    { icon: Receipt,  color: "text-orange-500 bg-orange-50", label: "Invoice generated",   sub: "Invoice #INV-2026-002",             time: "3d ago"  },
    { icon: Image,    color: "text-purple-500 bg-purple-50", label: "Media uploaded",      sub: "homepage-banner.jpg",              time: "4d ago"  },
  ];

  const aiSuggestions = [
    { icon: "🚀", text: "Your website speed improved by 18% this week" },
    { icon: "🔍", text: "3 SEO opportunities found" },
    { icon: "📈", text: "Homepage converting 22% better this week" },
    { icon: "⚠️",  text: "2 broken links detected on /services" },
  ];

  const kpiCards = [
    { label: "Page Views",  value: statsLoading ? "…" : (realStats?.totalViews ?? 0).toLocaleString(),    color: "#6366f1", idx: 0 },
    { label: "Visitors",   value: statsLoading ? "…" : (realStats?.totalVisitors ?? 0).toLocaleString(), color: "#8b5cf6", idx: 1 },
  ];

  const healthItems = [
    { icon: Lock,      label: "SSL Certificate", value: "Active",      ok: true },
    { icon: Globe,     label: "Domain",           value: "Connected",   ok: true },
    { icon: Activity,  label: "Uptime",           value: "100%",        ok: true },
    { icon: HardDrive, label: "Last Backup",      value: "Today 2:00 AM", ok: true },
    { icon: Wifi,      label: "CDN Status",       value: "Active",      ok: true },
    { icon: Shield,    label: "Security",         value: "Monitoring",  ok: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── Left Sidebar ── */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col fixed top-0 left-0 h-full z-30 shadow-sm">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">FlowSites</p>
              <p className="text-xs text-gray-400 mt-0.5">Client Portal</p>
            </div>
          </div>
        </div>
        {/* Site info */}
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Your Website</p>
          <p className="text-sm font-semibold text-gray-800 truncate">{businessName}</p>
          {account.websiteUrl && (
            <a href={`https://${websiteUrl}`} target="_blank" rel="noreferrer"
              className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 mt-0.5 truncate">
              {websiteUrl} <ExternalLink size={10} />
            </a>
          )}
        </div>
        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                  active
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}>
                <Icon size={16} className={active ? "text-indigo-600" : ""} />
                {item.label}
                {item.id === "invoices" && openInvoices.length > 0 && (
                  <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                    {openInvoices.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        {/* Upgrade CTA */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-2">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-bold text-gray-800 mb-1">Grow your business</p>
            <p className="text-xs text-gray-500 mb-3">Unlock more features and priority support.</p>
            <button onClick={() => setActiveTab("payments")}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all">
              Upgrade Plan
            </button>
          </div>
        </div>
        {/* User */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(user?.name || businessName || "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.name || businessName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || account.clientEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900">{businessName}</h1>
              {account.websiteUrl && (
                <a href={`https://${websiteUrl}`} target="_blank" rel="noreferrer"
                  className="text-sm text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                  {websiteUrl} <ExternalLink size={12} />
                </a>
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Website Mission Control · FlowSites</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-semibold text-gray-700">{formatCents(account.monthlyPriceCents)}/mo</span>
            <div className="relative w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors cursor-pointer">
              <Bell size={16} className="text-gray-500" />
              {openInvoices.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
              {(user?.name || businessName || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Website</h2>
                <p className="text-gray-500 text-sm mt-1">Overview of your website's performance and activity.</p>
              </div>

              {/* AI Insights Bar */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 flex items-center gap-4 overflow-x-auto">
                <Sparkles className="w-5 h-5 text-white shrink-0" />
                <div className="flex gap-6">
                  {aiSuggestions.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 shrink-0">
                      <span className="text-base">{s.icon}</span>
                      <span className="text-sm text-white/90 whitespace-nowrap">{s.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Website Preview + KPI Cards */}
              <div className="grid grid-cols-3 gap-6 items-stretch" style={{ height: 520 }}>
                {/* Preview */}
                <div className="col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                  {/* Browser chrome */}
                  <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 bg-white rounded-lg px-3 py-1.5 text-xs text-gray-500 border border-gray-200 flex items-center gap-2">
                      <Lock size={10} className="text-green-500" />
                      {websiteUrl}
                    </div>
                    <button onClick={() => setMobileView(false)}
                      className={`p-1.5 rounded-lg transition-colors ${!mobileView ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}>
                      <Monitor size={14} />
                    </button>
                    <button onClick={() => setMobileView(true)}
                      className={`p-1.5 rounded-lg transition-colors ${mobileView ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}>
                      <Smartphone size={14} />
                    </button>
                  </div>
                  {/* Preview frame — uses screenshot thumbnail to avoid X-Frame-Options blocks */}
                  <div className={`relative flex-1 min-h-0 bg-gray-50 ${mobileView ? "flex justify-center items-start py-6" : ""}`}>
                    {account.websiteUrl ? (
                      <div className={`relative overflow-hidden ${mobileView ? "w-52 rounded-2xl shadow-2xl border border-gray-200" : "w-full h-full"}`}>
                        <img
                          src={`/api/screenshot?url=https://${account.websiteUrl}`}
                          alt={`${account.websiteUrl} preview`}
                          className="w-full h-full" style={{ objectFit: 'fill' }}
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 to-purple-50"><svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='#a5b4fc' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><line x1='2' y1='12' x2='22' y2='12'/><path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/></svg><p style='font-size:12px;color:#9ca3af;text-align:center;padding:0 16px'>Preview loading...<br/><a href='https://${account.websiteUrl}' target='_blank' style='color:#6366f1'>Open live site</a></p></div>`;
                            }
                          }}
                        />
                        {!mobileView && (
                          <a
                            href={`https://${account.websiteUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 cursor-pointer"
                            title="Open live site"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                        <div className="text-center">
                          <Globe className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-400">Website preview will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Preview footer */}
                  <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Last updated: {formatDate(account.billingStartDate)}</p>
                    <div className="flex items-center gap-2">
                      {account.websiteUrl && (
                        <a href={`https://${websiteUrl}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                          <ExternalLink size={12} /> View Live Site
                        </a>
                      )}
                      <button onClick={() => setActiveTab("settings")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors">
                        Edit Website
                      </button>
                    </div>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="flex flex-col gap-4">
                  {kpiCards.map(kpi => (
                    <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-medium text-gray-500">{kpi.label}</p>
                        <span className="text-xs font-semibold flex items-center gap-0.5 text-emerald-600">
                          <TrendingUp size={11} /> Live
                        </span>
                      </div>
                      <p className="text-xl font-bold text-gray-900 mb-2">{kpi.value}</p>
                      <MiniSparkline data={SPARKLINE_SETS[kpi.idx]} color={kpi.color} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 2: Performance + Top Pages + Activity */}
              <div className="grid grid-cols-3 gap-6">
                {/* Performance */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-gray-900">Website Performance</h3>
                    <button onClick={() => refetchPerf()} className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                      <RefreshCw size={11} /> Refresh
                    </button>
                  </div>
                  <div className="flex justify-around mb-5">
                    <CircleScore score={perf.performance}   label="Performance"   color="#6366f1" />
                    <CircleScore score={perf.seo}           label="SEO"           color="#8b5cf6" />
                    <CircleScore score={perf.accessibility} label="Accessibility" color="#f59e0b" />
                    <CircleScore score={perf.bestPractices} label="Best Practices" color="#10b981" />
                  </div>
                  <div style={{ height: 120 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={realStats?.daily ?? []}>
                        <defs>
                          <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                        <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} fill="url(#perfGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Pages */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-gray-900">Top Pages</h3>
                    <button className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                      View all <ChevronRight size={11} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 grid grid-cols-3 gap-2 mb-3 font-medium uppercase tracking-wider">
                    <span>Page</span><span className="text-right">Views</span><span className="text-right">Visitors</span>
                  </div>
                  <div className="space-y-3">
                    {TOP_PAGES.map(p => (
                      <div key={p.path}>
                        <div className="grid grid-cols-3 gap-2 text-sm mb-1">
                          <span className="text-gray-700 font-medium truncate">{p.path}</span>
                          <span className="text-right text-gray-600">{p.views.toLocaleString()}</span>
                          <span className="text-right text-gray-600">{p.visitors.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${p.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
                    <button className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                      View all <ChevronRight size={11} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentActivity.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{item.label}</p>
                            <p className="text-xs text-gray-400 truncate">{item.sub}</p>
                          </div>
                          <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Row 3: Health + Traffic + Support */}
              <div className="grid grid-cols-3 gap-6">
                {/* Health */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <CheckCircle size={14} className="text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Your Website Health</h3>
                  </div>
                  <p className="text-xs text-emerald-600 font-medium mb-5">Great job! Your website is healthy and performing well.</p>
                  <div className="space-y-3">
                    {healthItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon size={13} className="text-gray-400" />
                            <span className="text-xs text-gray-600">{item.label}</span>
                          </div>
                          <span className={`text-xs font-semibold ${item.ok ? "text-emerald-600" : "text-red-500"}`}>{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => setActiveTab("domains")}
                    className="mt-5 w-full border border-gray-200 text-gray-600 text-xs font-medium py-2 rounded-xl hover:bg-gray-50 transition-colors">
                    View Settings
                  </button>
                </div>

                {/* Traffic Sources */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-5">Traffic Sources</h3>
                  <div className="flex items-center justify-center mb-5">
                    <div style={{ width: 160, height: 160 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={TRAFFIC_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                            {TRAFFIC_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {TRAFFIC_DATA.map(item => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                          <span className="text-xs text-gray-600">{item.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-800">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Support */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Need help with your website?</h3>
                  <p className="text-xs text-gray-500 mb-5">Our team is here to help you grow your online presence.</p>
                  <div className="flex-1 flex items-center justify-center mb-5">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center">
                      <Headphones className="w-10 h-10 text-indigo-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <a href="mailto:support@flow-sites.com"
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all">
                      <MessageSquare size={13} /> Contact Support
                    </a>
                    <button onClick={() => setActiveTab("settings")}
                      className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-600 text-xs font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                      <BookMarked size={13} /> View Knowledge Base
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── INVOICES TAB ── */}
          {activeTab === "invoices" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
                <p className="text-gray-500 text-sm mt-1">View and pay your invoices.</p>
              </div>
              {totalOwed > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-800 font-medium">
                    You have {openInvoices.length} outstanding invoice{openInvoices.length > 1 ? "s" : ""} totaling{" "}
                    <strong>{formatCents(totalOwed)}</strong>
                  </p>
                </div>
              )}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {invoicesLoading ? (
                  <div className="p-12 flex justify-center">
                    <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                ) : (invoices ?? []).length === 0 ? (
                  <div className="p-12 text-center text-gray-400 text-sm">No invoices yet.</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["Invoice", "Date", "Amount", "Status", ""].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(invoices ?? []).map(inv => (
                        <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">{inv.notes || inv.invoiceNumber}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(inv.dueDate)}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-800">{formatCents(inv.totalAmountCents)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              inv.status === "paid"    ? "bg-emerald-50 text-emerald-700" :
                              inv.status === "overdue" ? "bg-red-50 text-red-700" :
                              "bg-amber-50 text-amber-700"
                            }`}>
                              {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {(inv.status === "open" || inv.status === "overdue") && (
                              <button onClick={() => createCheckoutMutation.mutate({ invoiceId: inv.id })}
                                disabled={createCheckoutMutation.isPending}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 ml-auto">
                                Pay Now <ArrowUpRight size={12} />
                              </button>
                            )}
                            {inv.shareToken && (
                              <a href={`/invoice/${inv.shareToken}`} target="_blank" rel="noreferrer"
                                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 ml-auto mt-1">
                                View <ExternalLink size={11} />
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── MEDIA TAB ── */}
          {activeTab === "media" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
                  <p className="text-gray-500 text-sm mt-1">Upload and manage your website images and videos.</p>
                </div>
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50">
                  {uploadingFile
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Upload size={15} />}
                  Upload File
                </button>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
              </div>
              {mediaLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : (media ?? []).length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
                  <Image className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">No media uploaded yet. Click "Upload File" to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {(media ?? []).map(m => (
                    <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                      <div className="aspect-video bg-gray-50 relative overflow-hidden">
                        {m.mediaType === "photo"
                          ? <img src={m.fileUrl} alt={m.fileName} className="w-full h-full object-cover" />
                          : <video src={m.fileUrl} className="w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <a href={m.fileUrl} target="_blank" rel="noreferrer"
                            className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <Eye size={14} className="text-gray-700" />
                          </a>
                          <button onClick={() => deleteMediaMutation.mutate({ mediaId: m.id })}
                            className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors">
                            <Trash2 size={14} className="text-white" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-medium text-gray-700 truncate">{m.fileName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(m.createdAt?.toString())}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PAYMENTS TAB ── */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Plan & Upgrades</h2>
                <p className="text-gray-500 text-sm mt-1">Manage your plan and request additional features.</p>
              </div>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Current Plan</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {formatCents(account.monthlyPriceCents)}<span className="text-base font-normal text-gray-400">/mo</span>
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl border border-emerald-200">Active</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Business</p>
                    <p className="font-semibold text-gray-800">{businessName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Billing Start</p>
                    <p className="font-semibold text-gray-800">{formatDate(account.billingStartDate)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Status</p>
                    <p className="font-semibold text-emerald-600">Active</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                  <p className="text-gray-500 text-sm mt-1">Track your website's traffic and engagement.</p>
                </div>
                <div className="flex gap-2">
                  {(["7d", "30d", "90d"] as const).map(r => (
                    <button key={r} onClick={() => setAnalyticsRange(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        analyticsRange === r
                          ? "bg-indigo-600 text-white"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}>
                      {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
                    </button>
                  ))}
                </div>
              </div>
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs font-medium text-gray-500 mb-1">Page Views</p>
                  <p className="text-2xl font-bold text-gray-900">{statsLoading ? "…" : (realStats?.totalViews ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">Last {analyticsDays} days</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs font-medium text-gray-500 mb-1">Unique Visitors</p>
                  <p className="text-2xl font-bold text-gray-900">{statsLoading ? "…" : (realStats?.totalVisitors ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">Last {analyticsDays} days</p>
                </div>
              </div>

              {/* Traffic Overview chart */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-5">Traffic Overview</h3>
                {statsLoading ? (
                  <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>
                ) : (realStats?.daily ?? []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
                      <BarChart2 className="w-7 h-7 text-indigo-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">No data yet</p>
                    <p className="text-xs text-gray-400 max-w-xs">Add the tracking snippet to your website to start collecting real traffic data.</p>
                  </div>
                ) : (
                  <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={realStats?.daily ?? []}>
                        <defs>
                          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v: string) => v.slice(5)} />
                        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                        <Area type="monotone" dataKey="views" name="Page Views" stroke="#6366f1" strokeWidth={2} fill="url(#viewsGrad)" dot={false} />
                        <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#8b5cf6" strokeWidth={2} fill="url(#visitorsGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Top Pages */}
              {(realTopPages ?? []).length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Top Pages</h3>
                  <div className="space-y-3">
                    {(realTopPages ?? []).map((pg) => (
                      <div key={pg.path} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 font-medium truncate max-w-xs">{pg.path}</span>
                        <span className="text-gray-400 text-xs ml-4 shrink-0">{pg.views.toLocaleString()} views</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tracking Snippet */}
              {analyticsToken && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Tracking Snippet</h3>
                  <p className="text-xs text-gray-400 mb-4">Paste this snippet inside the <code className="bg-gray-100 px-1 rounded">&lt;head&gt;</code> tag of your website to start collecting real analytics.</p>
                  <SnippetBox token={analyticsToken.token} />
                </div>
              )}
            </div>
          )}

          {/* ── PAGES TAB ── */}
          {activeTab === "pages" && (
            <PagesTab />
          )}

          {/* ── PLACEHOLDER TABS ── */}
          {["performance", "seo", "leads", "blog", "domains", "settings"].includes(activeTab) && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {NAV_ITEMS.find(n => n.id === activeTab)?.label}
                </h2>
                <p className="text-gray-500 text-sm mt-1">This section is being set up for your account.</p>
              </div>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {(() => {
                    const item = NAV_ITEMS.find(n => n.id === activeTab);
                    const Icon = item?.icon ?? Settings;
                    return <Icon className="w-8 h-8 text-indigo-400" />;
                  })()}
                </div>
                <p className="text-gray-400 text-sm">
                  This feature is being set up for your account. Check back soon or contact support.
                </p>
                <button onClick={() => setActiveTab("overview")}
                  className="mt-6 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  ← Back to Overview
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
