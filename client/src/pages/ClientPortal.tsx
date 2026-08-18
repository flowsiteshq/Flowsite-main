import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  Globe, BarChart3, Zap, Search, Users, Image, FileText, BookOpen,
  CreditCard, Receipt, Shield, Settings, Bell, ChevronDown, ExternalLink,
  Edit3, RefreshCw, Monitor, Smartphone, TrendingUp, Eye, MousePointer,
  Clock, Activity, CheckCircle2, AlertCircle, MessageSquare, Headphones,
  BookMarked, Sparkles, ArrowRight, Rocket, Lock, Wifi, HardDrive, Server,
  ChevronRight, MoreHorizontal, Plus, Send, Loader2, Calendar, Check,
  ShoppingCart, X, ChevronUp, MessageSquarePlus, MousePointer2, Copy, Code2,
  Github,
} from "lucide-react";
import { CORE_ADDONS, AUTO_ADDONS, INDUSTRY_ADDONS, ALL_ADDONS, fmt, type AddOn } from "@/lib/addons";
import { HeatmapTab } from "@/components/HeatmapTab";

// ─── Build stages ─────────────────────────────────────────────────────────────
const STAGES = [
  { id: 0, key: "onboarding",  label: "Onboarding",        desc: "Gathering your goals, brand assets, and content" },
  { id: 1, key: "design",      label: "Design",             desc: "Crafting your visual identity and page layouts" },
  { id: 2, key: "development", label: "Development",        desc: "Building your site with all features and integrations" },
  { id: 3, key: "review",      label: "Review",             desc: "Your site is ready for your feedback" },
  { id: 4, key: "revisions",   label: "Revisions",          desc: "Applying your requested changes" },
  { id: 5, key: "launch",      label: "Launch",             desc: "Going live — final checks and DNS setup" },
  { id: 6, key: "maintenance", label: "Live & Maintained",  desc: "Your site is live and we're keeping it running" },
];

const PRIORITY_CONFIG = {
  low:    { label: "Low",    color: "bg-blue-50 text-blue-600 border-blue-200" },
  medium: { label: "Medium", color: "bg-amber-50 text-amber-600 border-amber-200" },
  high:   { label: "High",   color: "bg-red-50 text-red-600 border-red-200" },
};

const CR_STATUS_CONFIG = {
  pending:     { label: "Pending Review",  color: "bg-gray-100 text-gray-600 border-gray-200" },
  in_review:   { label: "In Review",       color: "bg-blue-50 text-blue-600 border-blue-200" },
  approved:    { label: "Approved",        color: "bg-green-50 text-green-600 border-green-200" },
  in_progress: { label: "In Progress",     color: "bg-purple-50 text-purple-600 border-purple-200" },
  completed:   { label: "Completed",       color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  declined:    { label: "Declined",        color: "bg-red-50 text-red-600 border-red-200" },
};

// ─── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80; const h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  const path = `M ${pts.join(" L ")}`;
  const area = `M ${pts[0]} L ${pts.join(" L ")} L ${w},${h} L 0,${h} Z`;
  const gradId = `sg-${color.replace("#", "")}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Circular Score ────────────────────────────────────────────────────────────
function CircularScore({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 28; const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">{score}</span>
      </div>
      <span className="text-xs text-gray-500 font-medium text-center leading-tight">{label}</span>
    </div>
  );
}

// ─── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let cumulative = 0;
  const r = 50; const cx = 60; const cy = 60;
  const paths = segments.map((seg) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += seg.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle); const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle); const y2 = cy + r * Math.sin(endAngle);
    const largeArc = seg.value / total > 0.5 ? 1 : 0;
    return (
      <path key={seg.label}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={seg.color} stroke="white" strokeWidth="2" />
    );
  });
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28">
      {paths}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#1f2937" fontSize="10" fontWeight="700">{total.toLocaleString()}</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fill="#6b7280" fontSize="7">Total Visits</text>
    </svg>
  );
}

// ─── Change Request Form ───────────────────────────────────────────────────────
function ChangeRequestForm({ onSuccess, projectId }: { onSuccess: () => void; projectId: number }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [pageSection, setPageSection] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitMutation = trpc.clientPortal.submitChangeRequest.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setTitle(""); setDescription(""); setPriority("medium"); setPageSection("");
      onSuccess();
      setTimeout(() => setSubmitted(false), 4000);
    },
    onError: (e) => setError(e.message),
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!title.trim() || title.length < 3) { setError("Title must be at least 3 characters."); return; }
    if (!description.trim() || description.length < 10) { setError("Description must be at least 10 characters."); return; }
    submitMutation.mutate({ projectId, title: title.trim(), description: description.trim(), priority, pageSection: pageSection.trim() || undefined });
  };
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <CheckCircle2 size={40} className="text-green-500" />
        <p className="text-gray-800 font-semibold text-lg">Request submitted!</p>
        <p className="text-gray-400 text-sm">We'll review it and get back to you shortly.</p>
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-500 text-xs font-semibold mb-1.5 uppercase tracking-wider">Request Title *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Update hero headline text"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-400 text-sm focus:outline-none focus:border-blue-400 transition-all" maxLength={255} />
      </div>
      <div>
        <label className="block text-gray-500 text-xs font-semibold mb-1.5 uppercase tracking-wider">Page / Section</label>
        <input type="text" value={pageSection} onChange={(e) => setPageSection(e.target.value)}
          placeholder="e.g. Homepage hero, About page, Contact form"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-400 text-sm focus:outline-none focus:border-blue-400 transition-all" />
      </div>
      <div>
        <label className="block text-gray-500 text-xs font-semibold mb-1.5 uppercase tracking-wider">Priority</label>
        <div className="flex gap-2">
          {(["low", "medium", "high"] as const).map((p) => (
            <button key={p} type="button" onClick={() => setPriority(p)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${priority === p ? PRIORITY_CONFIG[p].color : "bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-600"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-gray-500 text-xs font-semibold mb-1.5 uppercase tracking-wider">Description *</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe exactly what you'd like changed, added, or fixed. The more detail, the faster we can help."
          rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-400 text-sm focus:outline-none focus:border-blue-400 transition-all resize-none" />
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          <AlertCircle size={15} />{error}
        </div>
      )}
      <button type="submit" disabled={submitMutation.isPending}
        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
        {submitMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <><MessageSquarePlus size={16} /> Submit Request</>}
      </button>
    </form>
  );
}

// ─── Setup Fee Payment Card ──────────────────────────────────────────────────
function SetupFeeCard({ setupFee, projectId, adminPreviewToken, accessToken }: { setupFee: number; projectId: number; adminPreviewToken?: string; accessToken?: string }) {
  const checkoutMutation = trpc.clientPortalAuth.createSetupFeeCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    },
    onError: (err) => alert(`Payment error: ${err.message}`),
  });
  return (
    <div className="p-4 rounded-xl bg-red-50 border border-red-200">
      <p className="text-[11px] text-red-500 font-semibold uppercase tracking-wide mb-1">One-Time Setup Fee</p>
      <p className="text-2xl font-bold text-red-700">${setupFee.toLocaleString()}</p>
      <p className="text-xs text-red-500 mt-1">Outstanding balance</p>
      <button
        onClick={() => checkoutMutation.mutate({ projectId, origin: window.location.origin, adminPreviewToken, accessToken })}
        disabled={checkoutMutation.isPending}
        className="mt-3 w-full py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
      >
        {checkoutMutation.isPending ? (
          <><Loader2 size={13} className="animate-spin" /> Processing...</>
        ) : (
          <><CreditCard size={13} /> Pay Now — ${setupFee.toLocaleString()}</>
        )}
      </button>
    </div>
  );
}

// ─── Nav items ─────────────────────────────────────────────────────────────────
type NavId = "website" | "progress" | "analytics" | "heatmap" | "performance" | "seo" | "leads" | "media" | "pages" | "blog" | "payments" | "invoices" | "domains" | "messages" | "requests" | "new-request" | "add-features" | "settings";
const NAV_ITEMS: { id: NavId; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: "website",      label: "My Website",        icon: Globe },
  { id: "progress",     label: "Build Progress",     icon: Activity },
  { id: "analytics",    label: "Analytics",          icon: BarChart3 },
  { id: "heatmap",      label: "Click Heatmap",       icon: MousePointer2 },
  { id: "performance",  label: "Performance",        icon: Zap },
  { id: "seo",          label: "SEO",                icon: Search },
  { id: "leads",        label: "Leads",              icon: Users },
  { id: "media",        label: "Media",              icon: Image },
  { id: "pages",        label: "Pages",              icon: FileText },
  { id: "blog",         label: "Blog",               icon: BookOpen },
  { id: "payments",     label: "Payments",           icon: CreditCard },
  { id: "invoices",     label: "Invoices",           icon: Receipt },
  { id: "domains",      label: "Domains & Security", icon: Shield },
  { id: "messages",     label: "Messages",           icon: MessageSquare },
  { id: "requests",     label: "Change Requests",    icon: Edit3 },
  { id: "new-request",  label: "New Request",        icon: Plus },
  { id: "add-features", label: "Add Features",       icon: Sparkles },
  { id: "settings",     label: "Settings",           icon: Settings },
];

// ─── Static demo data ──────────────────────────────────────────────────────────
const SPARKLINE_VIEWS    = [3200,3800,3500,4100,3900,4500,4200,5100,4800,5400,5200,5800,6100,5900];
const SPARKLINE_VISITORS = [1200,1400,1300,1600,1500,1800,1700,2000,1900,2100,2000,2200,2400,2300];
const SPARKLINE_LEADS    = [18,22,19,25,23,28,26,31,29,34,32,37,40,38];
const SPARKLINE_SESSION  = [180,200,190,210,205,220,215,230,225,240,235,245,250,248];
const TOP_PAGES = [
  { page: "/",         views: 8456, visitors: 4231 },
  { page: "/services", views: 4231, visitors: 2123 },
  { page: "/about",    views: 2123, visitors: 1023 },
  { page: "/contact",  views: 1234, visitors: 768  },
  { page: "/blog",     views: 1023, visitors: 432  },
];
const ACTIVITY_ITEMS = [
  { icon: Users,      color: "#3b82f6", label: "New lead captured",    sub: "Contact form submission",  time: "May 6, 9:15 AM",  amount: null },
  { icon: CreditCard, color: "#10b981", label: "Payment received",      sub: "Invoice #INV-2026-001",    time: "May 6, 8:45 AM",  amount: "$199.00" },
  { icon: Globe,      color: "#8b5cf6", label: "Site published",        sub: "yourwebsite.com",          time: "May 5, 3:20 PM",  amount: null },
  { icon: Receipt,    color: "#f59e0b", label: "Invoice generated",     sub: "Invoice #INV-2026-002",    time: "May 5, 10:10 AM", amount: null },
  { icon: Image,      color: "#ec4899", label: "Media uploaded",        sub: "homepage-banner.jpg",      time: "May 4, 2:30 PM",  amount: null },
];
const TRAFFIC_SOURCES = [
  { label: "Organic Search", value: 45.2, color: "#3b82f6" },
  { label: "Direct",         value: 28.1, color: "#8b5cf6" },
  { label: "Referral",       value: 15.3, color: "#f59e0b" },
  { label: "Social Media",   value: 7.8,  color: "#10b981" },
  { label: "Email",          value: 3.6,  color: "#ec4899" },
];
const AI_SUGGESTIONS = [
  { icon: Zap,          color: "#3b82f6", text: "Your website speed improved by 18% this week" },
  { icon: Search,       color: "#8b5cf6", text: "3 new SEO opportunities detected on /services" },
  { icon: AlertCircle,  color: "#f59e0b", text: "2 broken links detected — click to fix" },
  { icon: TrendingUp,   color: "#10b981", text: "Homepage converting 22% better this week" },
];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ClientPortal() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  // Admin impersonation token (passed as ?adminPreview=<token> from admin dashboard)
  const adminPreviewToken = new URLSearchParams(window.location.search).get("adminPreview") ?? undefined;
  const isAdminPreview = !!adminPreviewToken;
  const adminPreviewQuery = trpc.clientPortal.getProjectByImpersonationToken.useQuery(
    { token: adminPreviewToken ?? "" },
    { enabled: isAdminPreview, retry: false }
  );
  // Portal session auth (email+password login via /client-login)
  const portalMeQuery = trpc.clientPortalAuth.me.useQuery(undefined, { enabled: !isAdminPreview, retry: false });
  const portalLogoutMutation = trpc.clientPortalAuth.logout.useMutation({
    onSuccess: () => { portalMeQuery.refetch(); window.location.href = "/client-login"; },
  });
  const isPortalAuth = !!portalMeQuery.data;
  const isAnyAuth = isAdminPreview || isAuthenticated || isPortalAuth;
  const [activeNav, setActiveNav] = useState<NavId>("website");
  const [mobileView, setMobileView] = useState(false);
  const [upgradeCart, setUpgradeCart] = useState<AddOn[]>([]);
  const [upgradeNotes, setUpgradeNotes] = useState("");
  const [upgradeSubmitted, setUpgradeSubmitted] = useState(false);
  const [upgradeFilter, setUpgradeFilter] = useState<"all" | "website" | "automation" | "industry">("all");
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [msgText, setMsgText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const refetchAll = () => {
    if (isPortalAuth) {
      utils.clientPortalAuth.getMyProjectBySession.invalidate();
      utils.clientPortalAuth.getChangeRequestsBySession.invalidate();
      utils.clientPortalAuth.getMessagesBySession.invalidate();
      utils.clientPortalAuth.getMyUpgradeRequestsBySession.invalidate();
    } else {
      utils.clientPortal.getMyProject.invalidate();
      utils.clientPortal.getChangeRequests.invalidate();
      utils.clientPortal.getMessages.invalidate();
      utils.clientPortal.getMyUpgradeRequests.invalidate();
    }
  };

  const urlToken = isAdminPreview ? undefined : (new URLSearchParams(window.location.search).get("token") ?? undefined);
  const claimMutation = trpc.clientPortal.claimProject.useMutation({
    onSuccess: () => {
      utils.clientPortal.getMyProject.invalidate();
      window.history.replaceState({}, "", "/portal");
    },
  });
  useEffect(() => {
    if (isAuthenticated && urlToken && !claimMutation.isPending && !claimMutation.isSuccess) {
      claimMutation.mutate({ token: urlToken });
    }
  }, [isAuthenticated, urlToken]);

  // Manus OAuth queries
  const oauthProjectQuery = trpc.clientPortal.getMyProject.useQuery(undefined, { enabled: !isAdminPreview && isAuthenticated, retry: false });
  const oauthChangeRequestsQuery = trpc.clientPortal.getChangeRequests.useQuery(
    { projectId: oauthProjectQuery.data?.id ?? 0 },
    { enabled: isAuthenticated && !!oauthProjectQuery.data?.id, retry: false }
  );
  const oauthUpgradeRequestsQuery = trpc.clientPortal.getMyUpgradeRequests.useQuery(
    { projectId: oauthProjectQuery.data?.id ?? 0 },
    { enabled: isAuthenticated && !!oauthProjectQuery.data?.id, retry: false }
  );
  const oauthMessagesQuery = trpc.clientPortal.getMessages.useQuery(
    { projectId: oauthProjectQuery.data?.id ?? 0 },
    { enabled: isAuthenticated && !!oauthProjectQuery.data?.id, refetchInterval: 15000 }
  );
  const oauthAnalyticsQuery = trpc.clientPortal.getAnalytics.useQuery(undefined, {
    enabled: isAuthenticated && !!oauthProjectQuery.data?.id,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Portal session queries
  const portalProjectQuery = trpc.clientPortalAuth.getMyProjectBySession.useQuery(undefined, { enabled: isPortalAuth, retry: false });
  const portalChangeRequestsQuery = trpc.clientPortalAuth.getChangeRequestsBySession.useQuery(
    { projectId: portalProjectQuery.data?.id ?? 0 },
    { enabled: isPortalAuth && !!portalProjectQuery.data?.id, retry: false }
  );
  const portalUpgradeRequestsQuery = trpc.clientPortalAuth.getMyUpgradeRequestsBySession.useQuery(
    { projectId: portalProjectQuery.data?.id ?? 0 },
    { enabled: isPortalAuth && !!portalProjectQuery.data?.id, retry: false }
  );
  const portalMessagesQuery = trpc.clientPortalAuth.getMessagesBySession.useQuery(
    { projectId: portalProjectQuery.data?.id ?? 0 },
    { enabled: isPortalAuth && !!portalProjectQuery.data?.id, refetchInterval: 15000 }
  );

  // Unified queries (admin preview > portal session > Manus OAuth)
  const projectQuery = isAdminPreview ? adminPreviewQuery : (isPortalAuth ? portalProjectQuery : oauthProjectQuery);
  const changeRequestsQuery = isPortalAuth ? portalChangeRequestsQuery : oauthChangeRequestsQuery;
  const upgradeRequestsQuery = isPortalAuth ? portalUpgradeRequestsQuery : oauthUpgradeRequestsQuery;
  const messagesQuery = isPortalAuth ? portalMessagesQuery : oauthMessagesQuery;
  const analyticsQuery = isPortalAuth
    ? ({ data: null, isLoading: false } as any)
    : oauthAnalyticsQuery;

  // Mutations — use session-based versions when portal auth
  const portalRequestUpgradeMutation = trpc.clientPortalAuth.requestFeatureUpgradeBySession.useMutation({
    onSuccess: () => utils.clientPortalAuth.getMyUpgradeRequestsBySession.invalidate(),
  });
  const oauthRequestUpgradeMutation = trpc.clientPortal.requestFeatureUpgrade.useMutation({
    onSuccess: () => utils.clientPortal.getMyUpgradeRequests.invalidate(),
  });
  const requestUpgradeMutation = isPortalAuth ? portalRequestUpgradeMutation : oauthRequestUpgradeMutation;

  const portalSendMessageMutation = trpc.clientPortalAuth.sendMessageBySession.useMutation({
    onSuccess: () => { setMsgText(""); utils.clientPortalAuth.getMessagesBySession.invalidate(); },
  });
  const oauthSendMessageMutation = trpc.clientPortal.sendMessage.useMutation({
    onSuccess: () => { setMsgText(""); utils.clientPortal.getMessages.invalidate(); },
  });
  const sendMessageMutation = isPortalAuth ? portalSendMessageMutation : oauthSendMessageMutation;

  // Invoices query (uses session or OAuth)
  const invoicesQuery = trpc.clientPortalAuth.getInvoicesBySession.useQuery(
    { projectId: projectQuery.data?.id ?? 0 },
    { enabled: !!projectQuery.data?.id, retry: false }
  );

  useEffect(() => {
    if (activeNav === "messages" && messagesQuery.data) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messagesQuery.data, activeNav]);

  // ── Memoized values (must be before any early returns to follow Rules of Hooks) ──
  const filteredAddons = useMemo((): AddOn[] => {
    if (upgradeFilter === "all") return ALL_ADDONS;
    if (upgradeFilter === "website") return CORE_ADDONS;
    if (upgradeFilter === "automation") return AUTO_ADDONS;
    return Object.values(INDUSTRY_ADDONS).flat();
  }, [upgradeFilter]);

  // ── Auth / loading gates ───────────────────────────────────────────────────
  const isLoading = (!isAdminPreview && (authLoading || portalMeQuery.isLoading)) || projectQuery.isLoading;
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse" />
          <p className="text-sm text-gray-400">Loading your portal…</p>
        </div>
      </div>
    );
  }
  if (!isAnyAuth) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Globe size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Client Portal</h2>
          <p className="text-gray-500 mb-6">Sign in to access your website dashboard</p>
          <Link href="/client-login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity w-full justify-center mb-3">
            Sign In with Email &amp; Password <ArrowRight size={16} />
          </Link>
          <p className="text-gray-400 text-sm mt-4">Not a client yet?{" "}
            <Link href="/get-started" className="text-blue-600 hover:underline">Get started here</Link>
          </p>
        </div>
      </div>
    );
  }
  const project = projectQuery.data;
  if (!project) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Rocket size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your project is being set up</h2>
          <p className="text-gray-500 mb-6">We're preparing your website dashboard. You'll receive an email once it's ready.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors">Back to Home</Link>
        </div>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const websiteUrl = project.websiteDomain
    ? (project.websiteDomain.startsWith("http") ? project.websiteDomain : `https://${project.websiteDomain}`)
    : project.previewUrl ?? null;
  const displayUrl = project.websiteDomain ?? project.previewUrl ?? "yourwebsite.com";
  const isLive = project.status === "maintenance";
  const planPrice = project.monthlyPrice ? `$${project.monthlyPrice.toLocaleString()}/mo` : null;
  const setupFeeOwed = (project.setupFee && project.setupFee > 0) ? project.setupFee : null;
  const displayName = isPortalAuth ? (portalMeQuery.data?.clientName ?? project.clientName ?? "Client") : (user?.name ?? project.clientName ?? "Client");
  const displayEmail = isPortalAuth ? (portalMeQuery.data?.clientEmail ?? project.clientEmail ?? "") : (user?.email ?? project.clientEmail ?? "");
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const changeRequests = changeRequestsQuery.data ?? [];
  const pendingCount = changeRequests.filter((r) => r.status === "pending" || r.status === "in_review").length;
  const messages = messagesQuery.data ?? [];
  const unreadMessages = messages.filter((m) => m.senderRole === "staff" && !m.isRead).length;
  const currentStageIdx = project.currentStage ?? 0;
  const stageProgress = project.stageProgress ?? 0;
  const upgradeRequests = upgradeRequestsQuery.data ?? [];
  const isInCart = (id: string) => upgradeCart.some((a) => a.id === id);
  const toggleCart = (addon: AddOn) => setUpgradeCart((prev) => isInCart(addon.id) ? prev.filter((a) => a.id !== addon.id) : [...prev, addon]);
  const cartTotal = upgradeCart.reduce((s, a) => s + a.price, 0);
  const handleSubmitUpgrades = () => {
    if (!project?.id || upgradeCart.length === 0) return;
    upgradeCart.forEach((addon) => {
      requestUpgradeMutation.mutate({ projectId: project.id, featureId: addon.id, featureLabel: addon.label, featurePrice: addon.price, clientNotes: upgradeNotes || undefined });
    });
    setUpgradeCart([]); setUpgradeNotes(""); setUpgradeSubmitted(true);
    setTimeout(() => setUpgradeSubmitted(false), 5000);
  };

  // ── Nav badge helper ───────────────────────────────────────────────────────
  const navBadge = (id: NavId) => {
    if (id === "messages" && unreadMessages > 0) return String(unreadMessages);
    if (id === "requests" && pendingCount > 0) return String(pendingCount);
    return undefined;
  };

  // ── Render content by nav ──────────────────────────────────────────────────
  const renderContent = () => {
    // ── MY WEBSITE (overview dashboard) ──────────────────────────────────────
    if (activeNav === "website") {
      return (
        <div className="space-y-5">
          {/* Row 1: Preview + KPIs */}
          <div className="flex gap-5">
            {/* Website Preview Hero */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 border border-gray-200 flex items-center gap-1.5">
                  <Lock size={10} className="text-green-500" />{displayUrl}
                </div>
                <button onClick={() => setMobileView(!mobileView)}
                  className={`p-1.5 rounded-lg transition-colors ${mobileView ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}>
                  {mobileView ? <Smartphone size={13} /> : <Monitor size={13} />}
                </button>
                <button onClick={refetchAll} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                  <RefreshCw size={13} />
                </button>
              </div>
              <div className={`relative bg-gray-100 overflow-hidden ${mobileView ? "flex justify-center py-4" : ""}`} style={{ height: "280px" }}>
                {websiteUrl ? (
                  <div className={`${mobileView ? "w-[375px] h-full rounded-xl overflow-hidden shadow-xl border border-gray-200" : "w-full h-full"}`}>
                    <iframe src={websiteUrl} className="w-full h-full border-0 pointer-events-none" title="Website Preview" loading="lazy" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-3">
                        <Globe size={24} className="text-blue-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600">Website preview</p>
                      <p className="text-xs text-gray-400 mt-1">Available once your site goes live</p>
                    </div>
                  </div>
                )}
                {websiteUrl && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-3">
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-gray-800 text-xs font-semibold shadow-lg hover:shadow-xl transition-shadow">
                      <ExternalLink size={12} /> View Live Site
                    </a>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-gray-800 text-xs font-semibold shadow-lg hover:shadow-xl transition-shadow">
                      <Edit3 size={12} /> Edit Website
                    </button>
                  </div>
                )}
              </div>
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
                <p className="text-xs text-gray-400">Last updated: {new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                <div className="flex items-center gap-2">
                  {websiteUrl && (
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      <ExternalLink size={11} /> View Live Site
                    </a>
                  )}
                  <button onClick={() => setActiveNav("requests")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    <Edit3 size={11} /> Request Edit
                  </button>
                  <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
                    <MoreHorizontal size={13} />
                  </button>
                </div>
              </div>
            </div>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3 w-[280px] shrink-0">
              {[
                { label: "Page Views",     value: "21,458", delta: "+12.5%", color: "#3b82f6", icon: Eye,          data: SPARKLINE_VIEWS },
                { label: "Visitors",       value: "8,145",  delta: "+8.3%",  color: "#8b5cf6", icon: Users,        data: SPARKLINE_VISITORS },
                { label: "Leads Captured", value: "142",    delta: "+15.8%", color: "#10b981", icon: MousePointer, data: SPARKLINE_LEADS },
                { label: "Avg. Session",   value: "3m 42s", delta: "+5.7%",  color: "#f59e0b", icon: Clock,        data: SPARKLINE_SESSION },
              ].map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.color + "18" }}>
                        <Icon size={13} style={{ color: kpi.color }} />
                      </div>
                      <span className="text-xs font-semibold text-green-500 flex items-center gap-0.5">
                        <TrendingUp size={11} />{kpi.delta}
                      </span>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 leading-none">{kpi.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{kpi.label}</p>
                    </div>
                    <Sparkline data={kpi.data} color={kpi.color} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-blue-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-800">AI Website Insights</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {AI_SUGGESTIONS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-start gap-2 bg-white/70 rounded-xl p-3 border border-white">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: s.color + "18" }}>
                      <Icon size={12} style={{ color: s.color }} />
                    </div>
                    <p className="text-xs text-gray-700 leading-snug">{s.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 2: Performance + Top Pages + Activity */}
          <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr 280px" }}>
            {/* Performance */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Website Performance</h3>
                <button className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-700" onClick={() => setActiveNav("performance")}>
                  View full report <ArrowRight size={11} />
                </button>
              </div>
              {analyticsQuery.isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={20} className="text-gray-300 animate-spin" />
                  <span className="ml-2 text-xs text-gray-400">Analyzing your website…</span>
                </div>
              ) : (
              <div className="flex items-center justify-around mb-5">
                <CircularScore score={analyticsQuery.data?.pagespeed?.performance ?? 0} label="Performance" color="#3b82f6" />
                <CircularScore score={analyticsQuery.data?.pagespeed?.seo ?? 0} label="SEO" color="#8b5cf6" />
                <CircularScore score={analyticsQuery.data?.pagespeed?.accessibility ?? 0} label="Accessibility" color="#f59e0b" />
                <CircularScore score={analyticsQuery.data?.pagespeed?.bestPractices ?? 0} label="Best Practices" color="#10b981" />
              </div>
              )}
              <div className="relative h-24 bg-gray-50 rounded-xl overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="perf-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,60 C30,55 60,45 90,40 C120,35 150,50 180,42 C210,34 240,25 270,20 L300,18 L300,80 L0,80 Z" fill="url(#perf-grad)" />
                  <path d="M0,60 C30,55 60,45 90,40 C120,35 150,50 180,42 C210,34 240,25 270,20 L300,18" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div className="absolute bottom-2 left-3 right-3 flex justify-between text-[10px] text-gray-400">
                  {["May 1","May 2","May 3","May 4","May 5","May 6","May 7"].map((d) => <span key={d}>{d}</span>)}
                </div>
              </div>
            </div>
            {/* Top Pages */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Top Pages</h3>
                <button className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-700" onClick={() => setActiveNav("pages")}>
                  View all <ArrowRight size={11} />
                </button>
              </div>
              <div className="grid grid-cols-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                <span>Page</span><span className="text-right">Views</span><span className="text-right">Visitors</span>
              </div>
              <div className="space-y-2">
                {TOP_PAGES.map((p) => (
                  <div key={p.page} className="grid grid-cols-3 items-center gap-2 px-1">
                    <span className="text-xs font-medium text-gray-700 truncate">{p.page}</span>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-xs font-semibold text-gray-800">{p.views.toLocaleString()}</span>
                      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(p.views / 8456) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 text-right">{p.visitors.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                {ACTIVITY_ITEMS.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: a.color + "18" }}>
                        <Icon size={13} style={{ color: a.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 leading-none">{a.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{a.sub}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {a.amount && <p className="text-xs font-bold text-green-500">{a.amount}</p>}
                        <p className="text-[10px] text-gray-400">{a.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 3: Health + Traffic + Support */}
          <div className="grid grid-cols-3 gap-5">
            {/* Health */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={16} className="text-green-500" />
                <h3 className="text-sm font-bold text-gray-900">Your Website Health</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">Great job! Your website is healthy and performing well.</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "SSL Certificate", value: "Active",     color: "text-green-500", icon: Lock },
                  { label: "Domain",           value: isLive ? "Connected" : "Pending", color: isLive ? "text-green-500" : "text-amber-500", icon: Globe },
                  { label: "Uptime",           value: "100%",      color: "text-green-500", icon: Wifi },
                  { label: "Last Backup",      value: "Today",     color: "text-gray-600",  icon: HardDrive },
                  { label: "CDN Status",       value: "Active",    color: "text-green-500", icon: Server },
                  { label: "Security",         value: "Monitored", color: "text-green-500", icon: Shield },
                ].map((h) => {
                  const Icon = h.icon;
                  return (
                    <div key={h.label} className="flex items-center gap-2">
                      <Icon size={12} className={h.color} />
                      <div>
                        <p className="text-[10px] text-gray-400 leading-none">{h.label}</p>
                        <p className={`text-xs font-semibold ${h.color} leading-tight`}>{h.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setActiveNav("domains")} className="w-full py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                View Settings
              </button>
            </div>
            {/* Traffic Sources */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Traffic Sources</h3>
              <div className="flex items-center gap-4">
                <DonutChart segments={TRAFFIC_SOURCES.map((s) => ({ label: s.label, value: Math.round(s.value * 214.58), color: s.color }))} />
                <div className="flex-1 space-y-2">
                  {TRAFFIC_SOURCES.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-xs text-gray-600 flex-1 truncate">{s.label}</span>
                      <span className="text-xs font-semibold text-gray-800">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Support */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <Headphones size={15} className="text-blue-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Need help?</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4 mt-1">Our team is here to help you grow your online presence.</p>
              <div className="space-y-2 mb-4">
                <button onClick={() => setActiveNav("messages")}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                  <MessageSquare size={13} /> Contact Support
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors">
                  <BookMarked size={13} /> View Knowledge Base
                </button>
                <button onClick={() => setActiveNav("add-features")}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors">
                  <Sparkles size={13} className="text-purple-500" /> Add Features
                </button>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xs font-semibold text-gray-700 mb-1">Website Recommendation</p>
                <p className="text-[11px] text-gray-500 leading-snug">Add a testimonials section to increase trust and conversions by up to 34%.</p>
                <button onClick={() => setActiveNav("new-request")} className="mt-2 text-xs text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-700">
                  Request it <ChevronRight size={11} />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── BUILD PROGRESS ────────────────────────────────────────────────────────
    if (activeNav === "progress") {
      const overallPct = Math.round(((currentStageIdx + stageProgress / 100) / STAGES.length) * 100);
      return (
        <div className="space-y-5">
          {project.clientMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Message from your team</p>
              <p className="text-sm text-gray-700 leading-relaxed">{project.clientMessage}</p>
            </div>
          )}
          {/* View Current Build Banner */}
          {project.previewUrl && (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Current Build Preview</p>
                <p className="text-sm font-bold text-white">Your site is ready to review</p>
                <p className="text-xs text-white/40 mt-0.5 font-mono truncate max-w-[260px]">{project.previewUrl}</p>
              </div>
              <a
                href={project.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                <ExternalLink size={14} />
                View Build
              </a>
            </div>
          )}
          {/* GitHub Repositories Section */}
          {(() => {
            let repos: { label: string; url: string }[] = [];
            try { repos = project.githubRepos ? JSON.parse(project.githubRepos) : []; } catch {}
            if (repos.length === 0) return null;
            return (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center">
                    <Github size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Code Repositories</h3>
                    <p className="text-xs text-gray-400">Your project's source code</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {repos.map((repo, idx) => (
                    <a
                      key={idx}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200 transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Github size={15} className="text-gray-600 shrink-0" />
                        <span className="text-sm font-medium text-gray-800 truncate">{repo.label}</span>
                      </div>
                      <ExternalLink size={13} className="text-gray-400 group-hover:text-gray-600 shrink-0 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Overall Progress</h2>
              <span className="text-sm text-gray-400">Stage {currentStageIdx + 1} of {STAGES.length}</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700"
                style={{ width: `${overallPct}%` }} />
            </div>
            <p className="text-xs text-gray-400">{overallPct}% complete</p>
          </div>
          <div className="space-y-3">
            {STAGES.map((stage, idx) => {
              const isDone = idx < currentStageIdx;
              const isActive = idx === currentStageIdx;
              return (
                <div key={stage.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 ${isActive ? "border-blue-200 ring-1 ring-blue-100" : "border-gray-100"}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDone ? "bg-green-100" : isActive ? "bg-blue-100" : "bg-gray-100"}`}>
                    {isDone ? <CheckCircle2 size={18} className="text-green-500" /> : isActive ? <Activity size={18} className="text-blue-500" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-semibold ${isDone ? "text-gray-400 line-through" : isActive ? "text-gray-900" : "text-gray-400"}`}>{stage.label}</p>
                      {isActive && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">In Progress</span>}
                      {isDone && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-600">Complete</span>}
                    </div>
                    <p className="text-xs text-gray-400">{stage.desc}</p>
                    {isActive && stageProgress > 0 && (
                      <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stageProgress}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── MESSAGES ──────────────────────────────────────────────────────────────
    if (activeNav === "messages") {
      return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Messages</h2>
            <p className="text-xs text-gray-400">Direct line to your FlowSites team</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messagesQuery.isLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 size={24} className="text-gray-300 animate-spin" /></div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No messages yet. Say hello!</p>
              </div>
            ) : messages.map((msg) => {
              const isClient = msg.senderRole === "client";
              return (
                <div key={msg.id} className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isClient ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                    {!isClient && <p className="text-[10px] font-semibold mb-1 text-gray-500">{msg.senderName}</p>}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    <p className={`text-[10px] mt-1.5 ${isClient ? "text-white/60" : "text-gray-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
            <textarea value={msgText} onChange={(e) => setMsgText(e.target.value)}
              placeholder="Type a message…" rows={2}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-400 text-sm resize-none focus:outline-none focus:border-blue-400 transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (msgText.trim() && project?.id) sendMessageMutation.mutate({ projectId: project.id, message: msgText.trim() });
                }
              }} />
            <button onClick={() => { if (msgText.trim() && project?.id) sendMessageMutation.mutate({ projectId: project.id, message: msgText.trim() }); }}
              disabled={!msgText.trim() || sendMessageMutation.isPending}
              className="self-end px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-all disabled:opacity-40 flex items-center gap-2">
              {sendMessageMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      );
    }

    // ── CHANGE REQUESTS ───────────────────────────────────────────────────────
    if (activeNav === "requests") {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Change Requests</h2>
            <button onClick={() => setActiveNav("new-request")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity">
              <Plus size={13} /> New Request
            </button>
          </div>
          {changeRequestsQuery.isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={24} className="text-gray-300 animate-spin" /></div>
          ) : changeRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 text-gray-400">
              <MessageSquarePlus size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No change requests yet.</p>
              <button onClick={() => setActiveNav("new-request")} className="mt-4 text-blue-600 text-sm hover:underline">Submit your first request →</button>
            </div>
          ) : changeRequests.map((req) => {
            const isExpanded = expandedRequest === req.id;
            const statusCfg = CR_STATUS_CONFIG[req.status as keyof typeof CR_STATUS_CONFIG] ?? CR_STATUS_CONFIG.pending;
            const priorityCfg = PRIORITY_CONFIG[req.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;
            return (
              <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-gray-50 transition-all"
                  onClick={() => setExpandedRequest(isExpanded ? null : req.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusCfg.color}`}>{statusCfg.label}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priorityCfg.color}`}>{priorityCfg.label} Priority</span>
                    </div>
                    <p className="text-gray-800 font-medium text-sm truncate">{req.title}</p>
                    {req.pageSection && <p className="text-gray-400 text-xs mt-0.5">{req.pageSection}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-gray-400 text-xs hidden sm:block">{new Date(req.createdAt).toLocaleDateString()}</span>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{req.description}</p>
                    </div>
                    {req.adminResponse && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Response from FlowSites</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{req.adminResponse}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // ── NEW REQUEST ───────────────────────────────────────────────────────────
    if (activeNav === "new-request") {
      return (
        <div className="max-w-xl">
          <h2 className="text-base font-bold text-gray-900 mb-5">Submit a Change Request</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <ChangeRequestForm projectId={project.id} onSuccess={() => { utils.clientPortal.getChangeRequests.invalidate(); setActiveNav("requests"); }} />
          </div>
        </div>
      );
    }

    // ── ADD FEATURES ──────────────────────────────────────────────────────────
    if (activeNav === "add-features") {
      if (upgradeSubmitted) {
        return (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Feature request submitted!</h2>
            <p className="text-gray-400 text-sm max-w-sm">We'll review your request and send you a quote within 1 business day.</p>
            <button onClick={() => setActiveNav("website")} className="mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
              Back to Dashboard
            </button>
          </div>
        );
      }
      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Add Features to Your Website</h2>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {(["all","website","automation","industry"] as const).map((f) => (
                <button key={f} onClick={() => setUpgradeFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${upgradeFilter === f ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                  {f === "all" ? "All" : f === "website" ? "Website" : f === "automation" ? "Automation" : "Industry"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAddons.map((addon) => {
              const inCart = isInCart(addon.id);
              return (
                <button key={addon.id} onClick={() => toggleCart(addon)}
                  className={`text-left p-4 rounded-2xl border transition-all ${inCart ? "border-blue-400 bg-blue-50 ring-1 ring-blue-200" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"}`}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{addon.label}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-bold text-blue-600">{fmt(addon.price)}</span>
                      {inCart && <Check size={13} className="text-blue-600" />}
                    </div>
                  </div>
                  {addon.description && <p className="text-xs text-gray-400">{addon.description}</p>}
                  <p className="text-xs text-gray-300 mt-1.5">{inCart ? "✓ Added to request" : "Click to add"}</p>
                </button>
              );
            })}
          </div>
          {upgradeCart.length > 0 && (
            <div className="sticky bottom-6 rounded-2xl border border-blue-200 bg-white shadow-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={16} className="text-blue-600" />
                  <span className="text-gray-800 font-semibold text-sm">{upgradeCart.length} feature{upgradeCart.length !== 1 ? "s" : ""} selected</span>
                </div>
                <span className="text-blue-600 font-bold">{fmt(cartTotal)}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {upgradeCart.map((a) => (
                  <span key={a.id} className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                    {a.label}
                    <button onClick={(e) => { e.stopPropagation(); toggleCart(a); }} className="text-blue-400 hover:text-blue-600 transition-colors"><X size={11} /></button>
                  </span>
                ))}
              </div>
              <textarea value={upgradeNotes} onChange={(e) => setUpgradeNotes(e.target.value)}
                placeholder="Optional: Any notes or context about what you need…"
                rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-400 text-sm resize-none focus:outline-none focus:border-blue-400 transition-all mb-3" />
              <button onClick={handleSubmitUpgrades} disabled={requestUpgradeMutation.isPending}
                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {requestUpgradeMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <><Sparkles size={16} /> Request These Features</>}
              </button>
              <p className="text-gray-400 text-xs text-center mt-2">We'll review and send you a quote within 1 business day</p>
            </div>
          )}
        </div>
      );
    }

    // ── ANALYTICS TAB ────────────────────────────────────────────────────────
    if (activeNav === "analytics") {
      const ps = analyticsQuery.data?.pagespeed;
      const activity = analyticsQuery.data?.activity;
      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Website Analytics</h2>
              <p className="text-xs text-gray-400 mt-0.5">Real-time performance data for your website</p>
            </div>
            <button onClick={() => utils.clientPortal.getAnalytics.invalidate()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              {analyticsQuery.isFetching ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Refresh
            </button>
          </div>

          {!analyticsQuery.data?.hasWebsite ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <Globe size={32} className="mx-auto mb-3 text-amber-400" />
              <h3 className="text-sm font-bold text-gray-800 mb-1">No website URL configured</h3>
              <p className="text-xs text-gray-500">Ask your FlowSites team to add your website URL to enable analytics.</p>
            </div>
          ) : analyticsQuery.isLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-3">
              <Loader2 size={28} className="text-blue-400 animate-spin" />
              <p className="text-sm text-gray-500">Analyzing your website… this takes 10–15 seconds</p>
            </div>
          ) : (
            <>
              {/* Score cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Performance", score: ps?.performance, color: "#3b82f6", bg: "bg-blue-50" },
                  { label: "SEO", score: ps?.seo, color: "#8b5cf6", bg: "bg-purple-50" },
                  { label: "Accessibility", score: ps?.accessibility, color: "#f59e0b", bg: "bg-amber-50" },
                  { label: "Best Practices", score: ps?.bestPractices, color: "#10b981", bg: "bg-green-50" },
                ].map((m) => {
                  const s = m.score ?? 0;
                  const grade = s >= 90 ? "Excellent" : s >= 70 ? "Good" : s >= 50 ? "Needs Work" : "Poor";
                  const gradeColor = s >= 90 ? "text-green-600" : s >= 70 ? "text-blue-600" : s >= 50 ? "text-amber-600" : "text-red-600";
                  return (
                    <div key={m.label} className={`${m.bg} rounded-2xl p-5 flex flex-col items-center gap-2`}>
                      <CircularScore score={s} label={m.label} color={m.color} />
                      <span className={`text-xs font-semibold ${gradeColor}`}>{grade}</span>
                    </div>
                  );
                })}
              </div>

              {/* Activity stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs text-gray-400 mb-1">Change Requests (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">{activity?.changeRequestsLast30Days ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-1">Submitted this month</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs text-gray-400 mb-1">Messages (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">{activity?.messagesLast30Days ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-1">Team communications</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs text-gray-400 mb-1">Load Time</p>
                  <p className="text-2xl font-bold text-gray-900">{ps?.loadTime != null ? `${ps.loadTime}s` : "—"}</p>
                  <p className="text-xs text-gray-400 mt-1">Time to interactive (mobile)</p>
                </div>
              </div>

              {/* Issues + Recommendations */}
              {ps && (ps.issues.length > 0 || ps.recommendations.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  {ps.issues.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <h3 className="text-sm font-bold text-gray-900 mb-3">Issues Found</h3>
                      <div className="space-y-3">
                        {ps.issues.map((issue: any, i: number) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              issue.severity === "critical" ? "bg-red-500" : issue.severity === "warning" ? "bg-amber-500" : "bg-blue-400"
                            }`} />
                            <div>
                              <p className="text-xs font-semibold text-gray-800">{issue.title}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">{issue.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {ps.recommendations.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <h3 className="text-sm font-bold text-gray-900 mb-3">Recommendations</h3>
                      <div className="space-y-2">
                        {ps.recommendations.map((rec: any, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 size={13} className="text-green-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-gray-700">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] text-gray-400 text-center">Last analyzed: {analyticsQuery.data?.analyzedAt ? new Date(analyticsQuery.data.analyzedAt).toLocaleString() : "N/A"} · Powered by Google PageSpeed Insights</p>
            </>
          )}
        </div>
      );
    }


    // ── HEATMAP TAB ──────────────────────────────────────────────────────────
    if (activeNav === "heatmap") {
      return <HeatmapTab projectId={project.id} />;
    }
    // ── PERFORMANCE TAB ──────────────────────────────────────────────────────
    if (activeNav === "performance") {
      const ps = analyticsQuery.data?.pagespeed;
      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Performance Report</h2>
              <p className="text-xs text-gray-400 mt-0.5">Google Lighthouse scores for your website</p>
            </div>
            <button onClick={() => utils.clientPortal.getAnalytics.invalidate()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              {analyticsQuery.isFetching ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Re-analyze
            </button>
          </div>

          {analyticsQuery.isLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-3">
              <Loader2 size={28} className="text-blue-400 animate-spin" />
              <p className="text-sm text-gray-500">Running Lighthouse analysis… this takes 10–15 seconds</p>
            </div>
          ) : !ps ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <Zap size={32} className="mx-auto mb-3 text-amber-400" />
              <h3 className="text-sm font-bold text-gray-800 mb-1">Analysis unavailable</h3>
              <p className="text-xs text-gray-500">No website URL configured or analysis failed. Contact your FlowSites team.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Performance", score: ps.performance, color: "#3b82f6", desc: "Page speed & Core Web Vitals" },
                  { label: "SEO", score: ps.seo, color: "#8b5cf6", desc: "Search engine optimization" },
                  { label: "Accessibility", score: ps.accessibility, color: "#f59e0b", desc: "WCAG compliance" },
                  { label: "Best Practices", score: ps.bestPractices, color: "#10b981", desc: "Modern web standards" },
                ].map((m) => {
                  const s = m.score ?? 0;
                  return (
                    <div key={m.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-3">
                      <CircularScore score={s} label={m.label} color={m.color} />
                      <p className="text-[11px] text-gray-400 text-center">{m.desc}</p>
                    </div>
                  );
                })}
              </div>
              {ps.loadTime != null && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Time to Interactive</h3>
                  <p className="text-3xl font-bold text-gray-900">{ps.loadTime}s <span className="text-sm font-normal text-gray-400">(mobile)</span></p>
                  <p className="text-xs text-gray-400 mt-1">{ps.loadTime <= 3 ? "✅ Fast — under 3 seconds" : ps.loadTime <= 6 ? "⚠️ Moderate — consider optimizing images and scripts" : "🔴 Slow — contact your FlowSites team to optimize"}</p>
                </div>
              )}
              {ps.issues.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Issues to Address</h3>
                  <div className="space-y-3">
                    {ps.issues.map((issue: any, i: number) => (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${
                        issue.severity === "critical" ? "bg-red-50 border border-red-100" : issue.severity === "warning" ? "bg-amber-50 border border-amber-100" : "bg-blue-50 border border-blue-100"
                      }`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          issue.severity === "critical" ? "bg-red-500" : issue.severity === "warning" ? "bg-amber-500" : "bg-blue-400"
                        }`} />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{issue.title}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{issue.description}</p>
                        </div>
                        <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          issue.severity === "critical" ? "bg-red-100 text-red-600" : issue.severity === "warning" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                        }`}>{issue.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[11px] text-gray-400 text-center">Last analyzed: {analyticsQuery.data?.analyzedAt ? new Date(analyticsQuery.data.analyzedAt).toLocaleString() : "N/A"} · Powered by Google PageSpeed Insights</p>
            </>
          )}
        </div>
      );
    }

    // ── INVOICES TAB ──────────────────────────────────────────────────────────
    if (activeNav === "invoices") {
      const invData = invoicesQuery.data;
      const setupFee = invData?.setupFee ?? project.setupFee ?? null;
      const monthlyPrice = invData?.monthlyPrice ?? project.monthlyPrice ?? null;
      const dbInvoices = invData?.invoices ?? [];
      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Billing & Invoices</h2>
            <p className="text-xs text-gray-400 mt-0.5">Your payment history and outstanding balances</p>
          </div>

          {/* Payment success/cancel banners */}
          {new URLSearchParams(window.location.search).get("payment") === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Payment received!</p>
                <p className="text-xs text-green-600">Your setup fee has been paid. Our team will be in touch shortly.</p>
              </div>
            </div>
          )}

          {/* Plan summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Plan</h3>
            <div className="grid grid-cols-2 gap-4">
              {setupFee && setupFee > 0 && (
                <SetupFeeCard
                  setupFee={setupFee}
                  projectId={project.id}
                  adminPreviewToken={adminPreviewToken}
                  accessToken={project.accessToken ?? undefined}
                />
              )}
              {monthlyPrice && monthlyPrice > 0 && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-[11px] text-blue-500 font-semibold uppercase tracking-wide mb-1">Monthly Retainer</p>
                  <p className="text-2xl font-bold text-blue-700">${monthlyPrice.toLocaleString()}<span className="text-sm font-normal text-blue-400">/mo</span></p>
                  {invData?.packageName && <p className="text-xs text-blue-500 mt-1">{invData.packageName} Package</p>}
                  <p className="text-xs text-blue-400 mt-1">Billed monthly</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice history */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Invoice History</h3>
            {invoicesQuery.isLoading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Loading invoices…</span>
              </div>
            ) : dbInvoices.length === 0 ? (
              <div className="text-center py-8">
                <Receipt size={28} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-400">No invoices yet. Your first invoice will appear here once billing begins.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dbInvoices.map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        inv.status === "paid" ? "bg-green-100" : inv.status === "overdue" ? "bg-red-100" : "bg-amber-100"
                      }`}>
                        <Receipt size={14} className={inv.status === "paid" ? "text-green-600" : inv.status === "overdue" ? "text-red-600" : "text-amber-600"} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{inv.invoiceNumber}</p>
                        <p className="text-[11px] text-gray-400">{inv.periodStart} – {inv.periodEnd}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        inv.status === "paid" ? "bg-green-100 text-green-600" : inv.status === "overdue" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                      }`}>{inv.status}</span>
                      <p className="text-sm font-bold text-gray-800">${(inv.totalAmountCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[11px] text-gray-400 text-center">Questions about your bill? <button onClick={() => setActiveNav("messages")} className="text-blue-500 hover:underline">Contact your FlowSites team</button></p>
        </div>
      );
    }

    // ── PLACEHOLDER SECTIONS ──────────────────────────────────────────────────
    const placeholderTitles: Partial<Record<NavId, string>> = {
      performance: "Performance (legacy)",
      seo: "SEO",
      leads: "Leads",
      media: "Media",
      pages: "Pages",
      blog: "Blog",
      payments: "Payments",
      domains: "Domains & Security",
      settings: "Settings",
    };
    const title = placeholderTitles[activeNav] ?? "Coming Soon";
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
          <Sparkles size={24} className="text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-400 text-sm max-w-sm">This section is coming soon. Contact your FlowSites team for more information.</p>
        <button onClick={() => setActiveNav("messages")}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          <MessageSquare size={14} /> Contact Support
        </button>
      </div>
    );
  };

  // ── Main layout ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#f5f6fa] overflow-hidden">
      {/* LEFT SIDEBAR */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Globe size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none truncate max-w-[120px]">{project.businessName}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Client Portal by FlowSites</p>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            const badge = navBadge(item.id);
            return (
              <button key={item.id} onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${active ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}>
                <Icon size={15} className={active ? "text-blue-500" : ""} />
                <span className="flex-1 text-left">{item.label}</span>
                {badge && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>
        {/* Upsell */}
        <div className="mx-3 mb-3 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-2">
            <Rocket size={14} className="text-white" />
          </div>
          <p className="text-xs font-semibold text-gray-800 mb-1">Grow your business</p>
          <p className="text-[11px] text-gray-500 mb-3 leading-snug">Upgrade your plan to unlock more features and priority support.</p>
          <button onClick={() => setActiveNav("add-features")}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity">
            Upgrade Plan
          </button>
        </div>
        {/* User */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate">{displayName}</p>
              <p className="text-[10px] text-gray-400 truncate">{displayEmail}</p>
            </div>
            {isPortalAuth && (
              <button
                onClick={() => portalLogoutMutation.mutate()}
                disabled={portalLogoutMutation.isPending}
                className="text-[10px] text-gray-400 hover:text-red-500 transition-colors shrink-0 ml-auto"
                title="Sign out"
              >
                {portalLogoutMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : "Sign out"}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP HEADER */}
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-4 shrink-0 shadow-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-bold text-gray-900">{NAV_ITEMS.find((n) => n.id === activeNav)?.label ?? "My Website"}</h1>
              {activeNav === "website" && websiteUrl && (
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  {displayUrl} <ExternalLink size={12} />
                </a>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeNav === "website" ? "Overview of your website's performance and activity." : project.businessName}
            </p>
          </div>
          {/* Status badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${isLive ? "bg-green-50 text-green-600 border border-green-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
            {isLive ? "Active" : project.status.replace(/_/g, " ")}
          </div>
          {planPrice && <div className="text-sm font-bold text-gray-700">{planPrice}</div>}
          {setupFeeOwed && (
            <button
              onClick={() => setActiveNav("invoices")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              ${setupFeeOwed.toLocaleString()} due — Pay Now
            </button>
          )}
          {/* Notifications */}
          <button className="relative w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Bell size={15} className="text-gray-500" />
            {(unreadMessages > 0 || pendingCount > 0) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadMessages + pendingCount}
              </span>
            )}
          </button>
          {/* Refresh */}
          <button onClick={refetchAll} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-400">
            <RefreshCw size={15} />
          </button>
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
            {initials}
          </div>
        </header>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {renderContent()}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
