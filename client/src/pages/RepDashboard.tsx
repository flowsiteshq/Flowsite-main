/**
 * RepDashboard — Sales Rep Portal
 * Design: Dark glassmorphism, crimson accent, consistent with FlowSites brand
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Users,
  DollarSign,
  PlusCircle,
  Send,
  MessageSquare,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  UserCircle,
  TrendingUp,
  Mail,
  Phone,
  PhoneCall,
  Trophy,
  Globe,
  MapPin,
  Building2,
  Loader2,
  Tag,
  Plus,
  Inbox,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { ColdCallScriptPanel } from "@/components/ColdCallScriptPanel";

// ─── Logo ─────────────────────────────────────────────────────────────────────
const LOGO_URL = "/flowsites-logo.png";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt$(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const show = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };
  return { toast, show };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RepDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast, show: showToast } = useToast();

  // Profile
  const { data: profile, isLoading: profileLoading } = trpc.technician.repGetProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Role (for tab gating)
  const { data: myRole } = trpc.technician.getMyRole.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const techRole = myRole?.role ?? profile?.role ?? "sales_rep";

  // Clients
  const { data: clients = [], isLoading: clientsLoading, refetch: refetchClients } =
    trpc.technician.repGetMyClients.useQuery(undefined, { enabled: isAuthenticated });

  // Pool clients (opportunities claimed from the pool)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: poolClients = [], isLoading: poolClientsLoading } =
    (trpc.opportunity as any).repGetMyPoolClients?.useQuery(undefined, { enabled: isAuthenticated }) ?? { data: [], isLoading: false };

  // Commissions
  const { data: commData, isLoading: commLoading } = trpc.technician.repGetMyCommissions.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Active tab — default depends on role
  const [activeTab, setActiveTab] = useState<"clients" | "create" | "commissions" | "scripts" | "leads" | "pool" | "messages">("clients");

  // ── Available Leads (opportunity pool) ─────────────────────────────────────
  const { data: availablePool = [], isLoading: poolLoading, refetch: refetchPool } =
    trpc.opportunity.repGetAvailablePool.useQuery(undefined, { enabled: isAuthenticated });

  const claimMutation = trpc.opportunity.claim.useMutation({
    onSuccess: () => { refetchPool(); showToast("Lead claimed! Check My Clients.", "success"); },
    onError: (err) => showToast(err.message, "error"),
  });

  // ── Messages ────────────────────────────────────────────────────────────────
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [msgInput, setMsgInput] = useState("");

  const { data: msgClients = [], isLoading: msgClientsLoading } =
    trpc.technician.repGetClientsForMessaging.useQuery(undefined, { enabled: isAuthenticated && activeTab === "messages" });

  type MsgClient = { accountId: number; clientName: string; businessName: string; projectId: number; unreadCount: number; lastMessage: string | null; lastMessageAt: Date | null; lastMessageRole: string | null };

  const selectedMsgClient = (msgClients as MsgClient[]).find((c) => c.projectId === selectedProjectId) ?? (msgClients as MsgClient[])[0] ?? null;
  const effectiveProjectId = selectedMsgClient?.projectId ?? null;

  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } =
    trpc.technician.repGetMessages.useQuery(
      { projectId: effectiveProjectId! },
      { enabled: !!effectiveProjectId && activeTab === "messages", refetchInterval: 8000 }
    );

  const sendMsgMutation = trpc.technician.repSendMessage.useMutation({
    onSuccess: () => { setMsgInput(""); refetchMessages(); },
    onError: (err) => showToast(err.message, "error"),
  });

  // ── Add Lead state ──────────────────────────────────────────────────────────
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [addLeadForm, setAddLeadForm] = useState({
    businessName: "",
    businessType: "other",
    nicheTag: "",
    email: "",
    phone: "",
    website: "",
    primaryGoal: "",
    source: "cold_call" as "website" | "cold_call" | "referral" | "social" | "partner" | "other",
    adminNotes: "",
  });

  const addLeadMutation = (trpc.admin.addLead as any).useMutation({
    onSuccess: () => {
      setShowAddLeadModal(false);
      setAddLeadForm({ businessName: "", businessType: "other", nicheTag: "", email: "", phone: "", website: "", primaryGoal: "", source: "cold_call", adminNotes: "" });
      showToast("Lead added to the pipeline!", "success");
    },
    onError: (err: { message: string }) => showToast(err.message, "error"),
  });

  // ── Create client form state ────────────────────────────────────────────────
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    businessName: "",
    websiteUrl: "",
    monthlyPriceDollars: "",
    billingStartDate: "",
    planName: "",
    notes: "",
  });
  const [createResult, setCreateResult] = useState<{
    clientAccountId: number;
    invoiceUrl: string | null;
    portalUrl: string;
    shareToken: string | null;
    invoiceNumber: string | null;
  } | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const createMutation = trpc.technician.repCreateClient.useMutation({
    onSuccess: (data) => {
      setCreateResult(data);
      setEmailSent(false);
      setSmsSent(false);
      showToast("Client account created successfully!", "success");
      refetchClients();
    },
    onError: (err) => showToast(err.message, "error"),
  });

  const sendEmailMutation = trpc.technician.repSendWelcomeEmail.useMutation({
    onSuccess: () => {
      setEmailSent(true);
      showToast("Welcome email sent!", "success");
    },
    onError: (err) => showToast(err.message, "error"),
  });

  const sendSmsMutation = trpc.technician.repSendWelcomeSMS.useMutation({
    onSuccess: () => {
      setSmsSent(true);
      showToast("Welcome SMS sent!", "success");
    },
    onError: (err) => showToast(err.message, "error"),
  });

  // ── Expanded client row ─────────────────────────────────────────────────────
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.07 0.005 260)" }}>
        <div className="w-8 h-8 border-2 border-[oklch(0.5_0.2_25)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to the rep login page
    window.location.href = "/rep-login";
    return null;
  }

  if (profile === null || profile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "oklch(0.07 0.005 260)" }}>
        <div className="glass rounded-2xl p-10 max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 text-[oklch(0.5_0.2_25)]" size={48} />
          <h2 className="text-2xl font-bold text-white mb-3">Not a Sales Rep</h2>
          <p className="text-white/60 mb-6">
            Your account is not linked to a FlowSites sales rep profile. Please contact your admin to get set up.
          </p>
          <a href="/" className="text-[oklch(0.5_0.2_25)] hover:underline text-sm">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (profile.status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "oklch(0.07 0.005 260)" }}>
        <div className="glass rounded-2xl p-10 max-w-md text-center">
          <Clock className="mx-auto mb-4 text-[oklch(0.78_0.12_85)]" size={48} />
          <h2 className="text-2xl font-bold text-white mb-3">Account Pending Activation</h2>
          <p className="text-white/60 mb-6">
            Your rep account status is <strong className="text-white">{profile.status}</strong>. Please wait for an admin to activate your account.
          </p>
          <a href="/" className="text-[oklch(0.5_0.2_25)] hover:underline text-sm">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName || !form.clientEmail || !form.businessName || !form.monthlyPriceDollars) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    createMutation.mutate({
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      clientPhone: form.clientPhone || undefined,
      businessName: form.businessName,
      websiteUrl: form.websiteUrl || undefined,
      monthlyPriceDollars: parseFloat(form.monthlyPriceDollars),
      billingStartDate: form.billingStartDate || undefined,
      planName: form.planName || undefined,
      notes: form.notes || undefined,
    });
  };

  const resetForm = () => {
    setForm({
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      businessName: "",
      websiteUrl: "",
      monthlyPriceDollars: "",
      billingStartDate: "",
      planName: "",
      notes: "",
    });
    setCreateResult(null);
    setEmailSent(false);
    setSmsSent(false);
    setCustomMessage("");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => showToast(`${label} copied!`, "success"));
  };

  const commissions = commData?.commissions ?? [];
  const totalPending = commData?.totalPendingCents ?? 0;
  const totalPaid = commData?.totalPaidCents ?? 0;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.07 0.005 260)", fontFamily: "Inter, sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all ${
            toast.type === "success" ? "bg-[oklch(0.45_0.18_145)]" : "bg-[oklch(0.45_0.22_25)]"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-white/10"
        style={{ background: "oklch(0.09 0.005 260 / 0.95)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/">
              <img
                src="/flowsites-logo.png"
                alt="FlowSites"
                style={{ height: 36 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </a>
            <span className="text-white/30 text-lg">|</span>
            <span className="text-white/70 text-sm font-medium">Rep Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass">
              <UserCircle size={16} className="text-[oklch(0.5_0.2_25)]" />
              <span className="text-white/80 text-sm">{profile.name}</span>
              <span className="text-white/40 text-xs">· {profile.commissionRate}% commission</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ml-1 ${
                techRole === "admin" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                techRole === "manager" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                techRole === "technician" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                "bg-violet-500/20 text-violet-400 border-violet-500/30"
              }`}>
                {techRole === "sales_rep" ? "Sales Rep" : techRole === "technician" ? "Technician" : techRole === "manager" ? "Manager" : "Admin"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: Users,
              label: "My Clients",
              value: clients.length,
              color: "oklch(0.5_0.2_25)",
            },
            {
              icon: TrendingUp,
              label: "Pending Commission",
              value: fmt$(totalPending),
              color: "oklch(0.78_0.12_85)",
            },
            {
              icon: DollarSign,
              label: "Commission Paid",
              value: fmt$(totalPaid),
              color: "oklch(0.6_0.15_145)",
            },
            {
              icon: CheckCircle2,
              label: "Commission Rate",
              value: `${profile.commissionRate}%`,
              color: "oklch(0.6_0.15_220)",
            },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={16} style={{ color: stat.color }} />
                <span className="text-white/50 text-xs">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tab Bar — filtered by role */}
        {/* sales_rep: My Clients, Create Client, Commissions, Scripts */}
        {/* technician: My Clients, Commissions, Scripts (no Create Client) */}
        {/* manager/admin: all tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl glass w-fit flex-wrap">
          {([
            { key: "clients", label: "My Clients", roles: ["sales_rep", "technician", "team_lead", "manager", "admin"] },
            { key: "pool", label: "Available Leads", icon: Inbox, roles: ["sales_rep", "team_lead", "manager", "admin"] },
            { key: "messages", label: "Messages", icon: MessageSquare, roles: ["sales_rep", "technician", "team_lead", "manager", "admin"] },
            { key: "leads", label: "Add Lead", roles: ["sales_rep", "team_lead", "manager", "admin"] },
            { key: "create", label: "Create Client", roles: ["sales_rep", "team_lead", "manager", "admin"] },
            { key: "commissions", label: "Commissions", roles: ["sales_rep", "manager", "admin"] },
            { key: "scripts", label: "Scripts", icon: PhoneCall, roles: ["sales_rep", "technician", "team_lead", "manager", "admin"] },
          ] as const).filter((tab) => (tab.roles as readonly string[]).includes(techRole)).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[oklch(0.5_0.2_25)] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {"icon" in tab && <tab.icon size={13} />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: My Clients ── */}
        {activeTab === "clients" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">My Clients</h2>
              <button
                onClick={() => setActiveTab("create")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.5_0.2_25)] text-white text-sm font-medium hover:bg-[oklch(0.55_0.22_25)] transition-colors"
              >
                <PlusCircle size={15} />
                New Client
              </button>
            </div>

            {/* ── Pool Clients Section ── */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-[oklch(0.78_0.12_85)]" />
                <h3 className="text-base font-semibold text-white">Pool Clients</h3>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-[oklch(0.78_0.12_85_/_20%)] text-[oklch(0.78_0.12_85)] text-xs font-medium">
                  {poolClients.length}
                </span>
              </div>
              {poolClientsLoading ? (
                <div className="text-center py-8 text-white/40">Loading pool clients…</div>
              ) : poolClients.length === 0 ? (
                <div className="glass rounded-xl p-8 text-center">
                  <Trophy size={36} className="mx-auto mb-3 text-white/20" />
                  <p className="text-white/50 text-sm">No pool clients yet. Claim companies from the Opportunity Pool to earn commissions.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {poolClients.map((opp: { id: number; businessName: string; businessType?: string | null; estimatedMonthlyCents: number; confirmedPayoutCents?: number | null; claimedByName?: string | null; claimedAt?: string | Date | null; payoutConfirmedAt?: string | Date | null; websiteUrl?: string | null; location?: string | null; description?: string | null; source?: string | null; status?: string | null }) => {
                    const expectedPayout = Math.round(opp.estimatedMonthlyCents * 0.15);
                    const isConfirmed = opp.confirmedPayoutCents !== null && opp.confirmedPayoutCents !== undefined;
                    return (
                      <div key={opp.id} className="glass rounded-xl p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Building2 size={14} className="text-white/40 shrink-0" />
                              <span className="text-white font-semibold truncate">{opp.businessName}</span>
                              <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                                opp.status === "converted"
                                  ? "bg-[oklch(0.45_0.15_145_/_30%)] text-[oklch(0.7_0.15_145)]"
                                  : "bg-[oklch(0.78_0.12_85_/_20%)] text-[oklch(0.78_0.12_85)]"
                              }`}>
                                {opp.status === "converted" ? "Converted" : "Claimed"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                              {opp.businessType && (
                                <span className="flex items-center gap-1 text-xs text-white/50">
                                  <Building2 size={11} /> {opp.businessType}
                                </span>
                              )}
                              {opp.location && (
                                <span className="flex items-center gap-1 text-xs text-white/50">
                                  <MapPin size={11} /> {opp.location}
                                </span>
                              )}
                              {opp.websiteUrl && (
                                <a
                                  href={opp.websiteUrl.startsWith("http") ? opp.websiteUrl : `https://${opp.websiteUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-[oklch(0.5_0.2_25)] hover:underline"
                                >
                                  <Globe size={11} /> {opp.websiteUrl}
                                </a>
                              )}
                            </div>
                            {opp.claimedAt && (
                              <p className="text-xs text-white/30 mt-2">Claimed {fmtDate(opp.claimedAt)}</p>
                            )}
                          </div>

                          {/* Payout panel */}
                          <div className="shrink-0 text-right space-y-2">
                            <div>
                              <div className="text-xs text-white/40 uppercase tracking-wide mb-0.5">Expected Payout</div>
                              <div className="text-lg font-bold text-[oklch(0.78_0.12_85)]">{fmt$(expectedPayout)}</div>
                              <div className="text-xs text-white/30">15% of {fmt$(opp.estimatedMonthlyCents)}/mo</div>
                            </div>
                            <div>
                              <div className="text-xs text-white/40 uppercase tracking-wide mb-0.5">Confirmed Payout</div>
                              {isConfirmed ? (
                                <div className="text-lg font-bold text-[oklch(0.7_0.15_145)]">
                                  {fmt$(opp.confirmedPayoutCents!)}
                                  <span className="ml-1 text-xs font-normal text-[oklch(0.7_0.15_145_/_70%)]">
                                    ✓ Confirmed
                                  </span>
                                </div>
                              ) : (
                                <div className="text-sm text-white/30 italic">Pending admin confirmation</div>
                              )}
                              {opp.payoutConfirmedAt && (
                                <div className="text-xs text-white/30">{fmtDate(opp.payoutConfirmedAt)}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-[oklch(0.5_0.2_25)]" />
              <h3 className="text-base font-semibold text-white">Direct Clients</h3>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-[oklch(0.5_0.2_25_/_20%)] text-[oklch(0.5_0.2_25)] text-xs font-medium">
                {clients.length}
              </span>
            </div>

            {clientsLoading ? (
              <div className="text-center py-12 text-white/40">Loading clients…</div>
            ) : clients.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Users size={48} className="mx-auto mb-4 text-white/20" />
                <p className="text-white/50 mb-4">No clients yet. Create your first client to get started.</p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="px-5 py-2.5 rounded-lg bg-[oklch(0.5_0.2_25)] text-white text-sm font-medium hover:bg-[oklch(0.55_0.22_25)] transition-colors"
                >
                  Create First Client
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map((client) => {
                  const expanded = expandedClientId === client.id;
                  const inv = client.latestInvoice;
                  return (
                    <div key={client.id} className="glass rounded-xl overflow-hidden">
                      <button
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                        onClick={() => setExpandedClientId(expanded ? null : client.id)}
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-10 h-10 rounded-full bg-[oklch(0.5_0.2_25_/_20%)] flex items-center justify-center flex-shrink-0">
                            <span className="text-[oklch(0.5_0.2_25)] font-bold text-sm">
                              {client.clientName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-medium">{client.clientName}</div>
                            <div className="text-white/50 text-sm">{client.businessName}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <div className="text-white font-semibold">{fmt$(client.monthlyPriceCents)}/mo</div>
                            <div className="text-white/40 text-xs">{client.invoiceCount} invoice{client.invoiceCount !== 1 ? "s" : ""}</div>
                          </div>
                          {inv && (
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                inv.status === "paid"
                                  ? "bg-[oklch(0.45_0.15_145_/_30%)] text-[oklch(0.7_0.15_145)]"
                                  : inv.status === "open"
                                  ? "bg-[oklch(0.78_0.12_85_/_20%)] text-[oklch(0.78_0.12_85)]"
                                  : "bg-white/10 text-white/50"
                              }`}
                            >
                              {inv.status === "paid" ? "Paid" : inv.status === "open" ? "Unpaid" : inv.status}
                            </span>
                          )}
                          {expanded ? (
                            <ChevronUp size={16} className="text-white/40" />
                          ) : (
                            <ChevronDown size={16} className="text-white/40" />
                          )}
                        </div>
                      </button>

                      {expanded && (
                        <div className="border-t border-white/10 px-5 py-4 grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-white/60">
                              <Mail size={13} />
                              <span>{client.clientEmail}</span>
                            </div>
                            {client.clientPhone && (
                              <div className="flex items-center gap-2 text-white/60">
                                <Phone size={13} />
                                <span>{client.clientPhone}</span>
                              </div>
                            )}
                            {client.websiteUrl && (
                              <div className="flex items-center gap-2 text-white/60">
                                <ExternalLink size={13} />
                                <a
                                  href={client.websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-white transition-colors"
                                >
                                  {client.websiteUrl}
                                </a>
                              </div>
                            )}
                            <div className="text-white/40 text-xs mt-2">
                              Billing start: {fmtDate(client.billingStartDate)}
                            </div>
                          </div>

                          {inv && (
                            <div className="space-y-2">
                              <div className="text-white/40 text-xs uppercase tracking-wide">Latest Invoice</div>
                              <div className="text-white font-medium">{inv.invoiceNumber}</div>
                              <div className="text-white/60 text-sm">
                                {fmt$(inv.totalAmountCents)} · Due {fmtDate(inv.dueDate)}
                              </div>
                              {inv.shareToken && (
                                <div className="flex gap-2 mt-2">
                                  <a
                                    href={`/invoice/${inv.shareToken}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-white/70 hover:text-white text-xs transition-colors"
                                  >
                                    <ExternalLink size={12} />
                                    View Invoice
                                  </a>
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        `${window.location.origin}/invoice/${inv.shareToken}`,
                                        "Invoice link"
                                      )
                                    }
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-white/70 hover:text-white text-xs transition-colors"
                                  >
                                    <Copy size={12} />
                                    Copy Link
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Create Client ── */}
        {activeTab === "create" && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Create New Client</h2>

            {!createResult ? (
              <form onSubmit={handleCreate} className="glass rounded-2xl p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-xs mb-1.5">
                      Client Name <span className="text-[oklch(0.5_0.2_25)]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.clientName}
                      onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                      placeholder="John Smith"
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[oklch(0.5_0.2_25)] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1.5">
                      Business Name <span className="text-[oklch(0.5_0.2_25)]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      placeholder="Smith Martial Arts"
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[oklch(0.5_0.2_25)] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-xs mb-1.5">
                      Email <span className="text-[oklch(0.5_0.2_25)]">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.clientEmail}
                      onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                      placeholder="john@smithma.com"
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[oklch(0.5_0.2_25)] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={form.clientPhone}
                      onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                      placeholder="(555) 000-0000"
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[oklch(0.5_0.2_25)] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-xs mb-1.5">
                      Monthly Price ($) <span className="text-[oklch(0.5_0.2_25)]">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={form.monthlyPriceDollars}
                      onChange={(e) => setForm({ ...form, monthlyPriceDollars: e.target.value })}
                      placeholder="297"
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[oklch(0.5_0.2_25)] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1.5">Billing Start Date</label>
                    <input
                      type="date"
                      value={form.billingStartDate}
                      onChange={(e) => setForm({ ...form, billingStartDate: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[oklch(0.5_0.2_25)] transition-colors"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-xs mb-1.5">Website URL</label>
                    <input
                      type="url"
                      value={form.websiteUrl}
                      onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                      placeholder="https://smithma.com"
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[oklch(0.5_0.2_25)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1.5">Plan Name</label>
                    <input
                      type="text"
                      value={form.planName}
                      onChange={(e) => setForm({ ...form, planName: e.target.value })}
                      placeholder="Growth Plan"
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[oklch(0.5_0.2_25)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 text-xs mb-1.5">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Any additional notes about this client…"
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[oklch(0.5_0.2_25)] transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 py-3 rounded-xl bg-[oklch(0.5_0.2_25)] text-white font-semibold text-sm hover:bg-[oklch(0.55_0.22_25)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {createMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        <PlusCircle size={16} />
                        Create Client Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* ── Success State ── */
              <div className="space-y-5">
                <div className="glass rounded-2xl p-6 border border-[oklch(0.5_0.15_145_/_30%)]">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="text-[oklch(0.6_0.15_145)]" size={24} />
                    <h3 className="text-white font-semibold text-lg">Client Created Successfully!</h3>
                  </div>

                  <div className="space-y-3">
                    {createResult.invoiceUrl && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div>
                          <div className="text-white/50 text-xs mb-0.5">Invoice URL</div>
                          <div className="text-white/80 text-sm font-mono truncate max-w-xs">
                            {createResult.invoiceUrl}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-3 flex-shrink-0">
                          <a
                            href={createResult.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg glass text-white/60 hover:text-white transition-colors"
                            title="Open invoice"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            onClick={() => copyToClipboard(createResult.invoiceUrl!, "Invoice URL")}
                            className="p-2 rounded-lg glass text-white/60 hover:text-white transition-colors"
                            title="Copy URL"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div>
                        <div className="text-white/50 text-xs mb-0.5">Client Portal Setup Link</div>
                        <div className="text-white/80 text-sm font-mono truncate max-w-xs">
                          {createResult.portalUrl}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(createResult.portalUrl, "Portal URL")}
                        className="p-2 rounded-lg glass text-white/60 hover:text-white transition-colors ml-3 flex-shrink-0"
                        title="Copy URL"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Send Communications */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4">Send Welcome Communications</h3>

                  <div className="mb-4">
                    <label className="block text-white/60 text-xs mb-1.5">Custom Message (optional)</label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Add a personal note to include in the email/SMS…"
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[oklch(0.5_0.2_25)] transition-colors resize-none"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        sendEmailMutation.mutate({
                          clientAccountId: createResult.clientAccountId,
                          invoiceUrl: createResult.invoiceUrl ?? undefined,
                          portalUrl: createResult.portalUrl,
                          customMessage: customMessage || undefined,
                        })
                      }
                      disabled={sendEmailMutation.isPending || emailSent}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                        emailSent
                          ? "bg-[oklch(0.45_0.15_145_/_30%)] text-[oklch(0.7_0.15_145)] cursor-default"
                          : "bg-white/10 text-white hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      {sendEmailMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : emailSent ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Send size={16} />
                      )}
                      {emailSent ? "Email Sent!" : "Send Welcome Email"}
                    </button>

                    <button
                      onClick={() =>
                        sendSmsMutation.mutate({
                          clientAccountId: createResult.clientAccountId,
                          invoiceUrl: createResult.invoiceUrl ?? undefined,
                          portalUrl: createResult.portalUrl,
                          customMessage: customMessage || undefined,
                        })
                      }
                      disabled={sendSmsMutation.isPending || smsSent || !form.clientPhone}
                      title={!form.clientPhone ? "Client has no phone number" : undefined}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                        smsSent
                          ? "bg-[oklch(0.45_0.15_145_/_30%)] text-[oklch(0.7_0.15_145)] cursor-default"
                          : !form.clientPhone
                          ? "bg-white/5 text-white/30 cursor-not-allowed"
                          : "bg-white/10 text-white hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      {sendSmsMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : smsSent ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <MessageSquare size={16} />
                      )}
                      {smsSent ? "SMS Sent!" : !form.clientPhone ? "No Phone on File" : "Send Welcome SMS"}
                    </button>
                  </div>
                </div>

                <button
                  onClick={resetForm}
                  className="w-full py-3 rounded-xl glass text-white/70 hover:text-white text-sm font-medium transition-colors"
                >
                  Create Another Client
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Commissions ── */}
        {activeTab === "commissions" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">My Commissions</h2>

            {/* Summary cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="glass rounded-xl p-5">
                <div className="text-white/50 text-xs mb-1">Pending Payout</div>
                <div className="text-3xl font-bold text-[oklch(0.78_0.12_85)]">{fmt$(totalPending)}</div>
                <div className="text-white/40 text-xs mt-1">
                  {commissions.filter((c) => c.status === "pending").length} commission(s) awaiting payment
                </div>
              </div>
              <div className="glass rounded-xl p-5">
                <div className="text-white/50 text-xs mb-1">Total Earned (Paid)</div>
                <div className="text-3xl font-bold text-[oklch(0.6_0.15_145)]">{fmt$(totalPaid)}</div>
                <div className="text-white/40 text-xs mt-1">
                  {commissions.filter((c) => c.status === "paid").length} commission(s) paid
                </div>
              </div>
            </div>

            {commLoading ? (
              <div className="text-center py-12 text-white/40">Loading commissions…</div>
            ) : commissions.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <DollarSign size={48} className="mx-auto mb-4 text-white/20" />
                <p className="text-white/50">No commissions yet. Commissions are earned when a referred client pays their first invoice.</p>
              </div>
            ) : (
              <div className="glass rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-5 py-3 text-white/40 font-medium">Client</th>
                      <th className="text-right px-5 py-3 text-white/40 font-medium">Amount</th>
                      <th className="text-center px-5 py-3 text-white/40 font-medium">Status</th>
                      <th className="text-right px-5 py-3 text-white/40 font-medium hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((comm) => (
                      <tr key={comm.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-5 py-3">
                          <div className="text-white font-medium">{comm.clientName}</div>
                          <div className="text-white/40 text-xs">{comm.businessName}</div>
                        </td>
                        <td className="px-5 py-3 text-right text-white font-semibold">
                          {fmt$(comm.commissionAmountCents)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              comm.status === "paid"
                                ? "bg-[oklch(0.45_0.15_145_/_30%)] text-[oklch(0.7_0.15_145)]"
                                : "bg-[oklch(0.78_0.12_85_/_20%)] text-[oklch(0.78_0.12_85)]"
                            }`}
                          >
                            {comm.status === "paid" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                            {comm.status === "paid" ? "Paid" : "Pending"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-white/40 hidden sm:table-cell">
                          {fmtDate(comm.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 p-4 rounded-xl glass border border-white/5">
              <p className="text-white/40 text-xs leading-relaxed">
                <strong className="text-white/60">Commission Policy:</strong> You earn a {profile.commissionRate}% one-time commission on the first invoice payment for each client you refer. Commissions are paid out by your admin after the client's payment clears. Recurring monthly payments do not generate additional commissions.
              </p>
            </div>
          </div>
        )}

        {/* ── Tab: Scripts ── */}
        {activeTab === "scripts" && (
          <ColdCallScriptPanel isDark={true} />
        )}

        {/* ── Tab: Available Leads (Opportunity Pool) ── */}
        {activeTab === "pool" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Available Leads</h2>
                <p className="text-white/50 text-sm mt-1">Unclaimed leads you can pick up and convert into clients.</p>
              </div>
              <button onClick={() => refetchPool()} className="flex items-center gap-2 px-3 py-2 rounded-lg glass text-white/60 hover:text-white text-sm transition-all">
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>
            {poolLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-[oklch(0.5_0.2_25)]" /></div>
            ) : availablePool.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center border border-white/5">
                <Inbox size={40} className="mx-auto mb-4 text-white/20" />
                <h3 className="text-white font-semibold mb-2">No available leads right now</h3>
                <p className="text-white/40 text-sm">Check back soon — new leads are added regularly.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availablePool.map((lead: { id: number; businessName: string; businessType?: string | null; city?: string | null; state?: string | null; website?: string | null; notes?: string | null; addedAt?: string | null; websiteUrl?: string | null; location?: string | null }) => (
                  <div key={lead.id} className="glass rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 size={14} className="text-[oklch(0.5_0.2_25)] flex-shrink-0" />
                          <span className="text-white font-semibold truncate">{lead.businessName}</span>
                          {lead.businessType && (
                            <span className="px-2 py-0.5 rounded-full bg-white/8 text-white/50 text-xs flex-shrink-0">{lead.businessType}</span>
                          )}
                        </div>
                        {(lead.city || lead.state) && (
                          <div className="flex items-center gap-1 text-white/40 text-xs mb-1">
                            <MapPin size={11} />
                            {[lead.city, lead.state].filter(Boolean).join(", ")}
                          </div>
                        )}
                        {lead.website && (
                          <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[oklch(0.5_0.2_25)] text-xs hover:underline">
                            <Globe size={11} />{lead.website}
                          </a>
                        )}
                        {lead.notes && <p className="text-white/40 text-xs mt-2 line-clamp-2">{lead.notes}</p>}
                      </div>
                      <button
                        onClick={() => claimMutation.mutate({ opportunityId: lead.id })}
                        disabled={claimMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white text-sm font-semibold transition-all disabled:opacity-50 flex-shrink-0"
                      >
                        {claimMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
                        Claim
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Messages ── */}
        {activeTab === "messages" && (
          <div className="flex gap-4 h-[600px]">
            {/* Client list */}
            <div className="w-64 flex-shrink-0 glass rounded-xl overflow-hidden flex flex-col border border-white/5">
              <div className="px-4 py-3 border-b border-white/8">
                <h3 className="text-white font-semibold text-sm">Clients</h3>
              </div>
              {msgClientsLoading ? (
                <div className="flex-1 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-white/30" /></div>
              ) : msgClients.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-4 text-center">
                  <p className="text-white/30 text-xs">No clients yet</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {(msgClients as MsgClient[]).map((c) => (
                    <button
                      key={c.projectId}
                      onClick={() => setSelectedProjectId(c.projectId)}
                      className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                        (selectedProjectId ?? (msgClients as MsgClient[])[0]?.projectId) === c.projectId ? "bg-white/8" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium truncate">{c.clientName}</span>
                        {(c.unreadCount ?? 0) > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[oklch(0.5_0.2_25)] text-white text-[10px] font-bold flex-shrink-0">{c.unreadCount}</span>
                        )}
                      </div>
                      {c.businessName && <p className="text-white/40 text-xs truncate mt-0.5">{c.businessName}</p>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Message thread */}
            <div className="flex-1 glass rounded-xl flex flex-col border border-white/5 overflow-hidden">
              {!effectiveProjectId ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare size={36} className="mx-auto mb-3 text-white/20" />
                    <p className="text-white/30 text-sm">Select a client to view messages</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="px-5 py-3 border-b border-white/8 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-sm">{selectedMsgClient?.clientName ?? "Client"}</h3>
                      {selectedMsgClient?.businessName && <p className="text-white/40 text-xs">{selectedMsgClient.businessName}</p>}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-white/30" /></div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center py-8 text-white/30 text-sm">No messages yet — say hello!</div>
                    ) : (
                      (messages as { id: number; senderRole: string; message: string; createdAt: string | Date }[]).map((m) => (
                        <div key={m.id} className={`flex ${m.senderRole === "client" ? "justify-start" : "justify-end"}`}>
                          <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                            m.senderRole === "client"
                              ? "bg-white/10 text-white rounded-tl-sm"
                              : "bg-[oklch(0.5_0.2_25)] text-white rounded-tr-sm"
                          }`}>
                            <p>{m.message}</p>
                            <p className="text-[10px] opacity-50 mt-1 text-right">{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-white/8 flex gap-2">
                    <input
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && msgInput.trim() && effectiveProjectId) {
                          e.preventDefault();
                          sendMsgMutation.mutate({ projectId: effectiveProjectId, message: msgInput.trim() });
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/8 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[oklch(0.5_0.2_25_/_50%)]"
                    />
                    <button
                      onClick={() => {
                        if (msgInput.trim() && effectiveProjectId) {
                          sendMsgMutation.mutate({ projectId: effectiveProjectId, message: msgInput.trim() });
                        }
                      }}
                      disabled={sendMsgMutation.isPending || !msgInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white transition-all disabled:opacity-40"
                    >
                      {sendMsgMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Add Lead ── */}
        {activeTab === "leads" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Add a Lead</h2>
                <p className="text-white/50 text-sm mt-1">Submit a new prospect to the pipeline for follow-up.</p>
              </div>
              <button
                onClick={() => setShowAddLeadModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white text-sm font-semibold transition-all shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)]"
              >
                <Plus size={15} />
                New Lead
              </button>
            </div>

            {/* Info card */}
            <div className="glass rounded-2xl p-8 text-center border border-white/5">
              <Tag size={40} className="mx-auto mb-4 text-[oklch(0.5_0.2_25_/_60%)]" />
              <h3 className="text-white font-semibold text-lg mb-2">Submit a Cold Lead</h3>
              <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
                Found a business with a poor website? Add them here and the admin team will follow up. Include as much detail as possible — website URL, phone, and notes about their current site.
              </p>
              <button
                onClick={() => setShowAddLeadModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white text-sm font-semibold transition-all"
              >
                <Plus size={15} />
                Add New Lead
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Lead Modal ── */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl p-6 max-w-lg w-full shadow-2xl border max-h-[90vh] overflow-y-auto" style={{ background: "oklch(0.12 0.01 260)", borderColor: "rgba(255,255,255,0.12)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Add New Lead</h3>
              <button onClick={() => setShowAddLeadModal(false)} className="text-white/40 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-white/50">Business Name *</label>
                <input
                  type="text"
                  value={addLeadForm.businessName}
                  onChange={e => setAddLeadForm(f => ({ ...f, businessName: e.target.value }))}
                  placeholder="e.g. Tiger Martial Arts"
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-white/25"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-white/50">Business Type</label>
                  <select
                    value={addLeadForm.businessType}
                    onChange={e => setAddLeadForm(f => ({ ...f, businessType: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none bg-white/5 border border-white/10 text-white focus:border-white/25"
                  >
                    <option value="martial_arts">Martial Arts</option>
                    <option value="fitness">Fitness / Gym</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="health_wellness">Health &amp; Wellness</option>
                    <option value="service">Service Business</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-white/50">Niche Tag</label>
                  <select
                    value={addLeadForm.nicheTag}
                    onChange={e => setAddLeadForm(f => ({ ...f, nicheTag: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none bg-white/5 border border-white/10 text-white focus:border-white/25"
                  >
                    <option value="">— No tag —</option>
                    <option value="martial_arts">Martial Arts</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="fitness">Fitness</option>
                    <option value="self_defense">Self Defense</option>
                    <option value="health_wellness">Health &amp; Wellness</option>
                    <option value="salon">Salon / Spa</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-white/50">Source</label>
                <select
                  value={addLeadForm.source}
                  onChange={e => setAddLeadForm(f => ({ ...f, source: e.target.value as typeof addLeadForm.source }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none bg-white/5 border border-white/10 text-white focus:border-white/25"
                >
                  <option value="cold_call">Cold Call</option>
                  <option value="referral">Referral</option>
                  <option value="website">Website</option>
                  <option value="social">Social Media</option>
                  <option value="partner">Partner</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-white/50">Email *</label>
                  <input
                    type="email"
                    value={addLeadForm.email}
                    onChange={e => setAddLeadForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="owner@business.com"
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-white/50">Phone</label>
                  <input
                    type="tel"
                    value={addLeadForm.phone}
                    onChange={e => setAddLeadForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="(555) 000-0000"
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-white/25"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-white/50">Website URL</label>
                <input
                  type="url"
                  value={addLeadForm.website}
                  onChange={e => setAddLeadForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://theirbadwebsite.com"
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-white/25"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-white/50">Notes</label>
                <textarea
                  value={addLeadForm.adminNotes}
                  onChange={e => setAddLeadForm(f => ({ ...f, adminNotes: e.target.value }))}
                  placeholder="Website issues, call notes, context..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-white/25"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  if (!addLeadForm.businessName.trim() || !addLeadForm.email.trim()) {
                    showToast("Business name and email are required", "error");
                    return;
                  }
                  addLeadMutation.mutate({
                    businessName: addLeadForm.businessName.trim(),
                    businessType: addLeadForm.businessType,
                    nicheTag: addLeadForm.nicheTag || null,
                    email: addLeadForm.email.trim(),
                    phone: addLeadForm.phone.trim() || undefined,
                    website: addLeadForm.website.trim() || undefined,
                    primaryGoal: addLeadForm.primaryGoal.trim() || undefined,
                    source: addLeadForm.source,
                    adminNotes: addLeadForm.adminNotes.trim() || undefined,
                  });
                }}
                disabled={addLeadMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {addLeadMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : <><Plus size={14} /> Add Lead</>}
              </button>
              <button
                onClick={() => setShowAddLeadModal(false)}
                className="px-4 py-2.5 rounded-xl text-white/60 hover:text-white text-sm font-medium transition-all bg-white/5 hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
