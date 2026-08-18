/**
 * FlowSites Admin CRM Dashboard
 * Full-screen immersive CRM — no public nav/footer
 * Features: Leads vs Customers distinction, multi-select deletion, status management
 */

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { CORE_ADDONS, AUTO_ADDONS, INDUSTRY_ADDONS, fmt } from "@/lib/addons";
import KnowledgeCenter from "@/pages/KnowledgeCenter";
import AddOnPricingTab from "@/components/AddOnPricingTab";
import { getTZFromPhone, getLocalTimeInfo, type CallStatus } from "@/lib/timezones";
import { SmsButton, SmsModal } from "@/components/SmsModal";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  LogOut,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Mail,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  Shield,
  RefreshCw,
  Search,
  Filter,
  ClipboardList,
  Trash2,
  UserCheck,
  UserX,
  SquareCheck,
  Square,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  Zap,
  BarChart3,
  ExternalLink,
  Link2,
  Sun,
  Moon,
  PhoneCall,
  ChevronRight,
  Handshake,
  PlusCircle,
  Edit3,
  Ban,
  StickyNote,
  UserPlus,
  ArrowRightCircle,
  Tag,
  Eye,
  Bell,
  CheckSquare,
  X,
  Save,
  FolderPlus,
  Smartphone,
  Loader2,
  Trophy,
  Lock,
  FileText,
  Plus,
  Pencil,
  Package,
  Layers,
  Cpu,
  Building,
  Inbox,
  BookOpen as BookOpenIcon,
  Receipt,
  CalendarCheck,
  CalendarClock,
  PhoneOutgoing,
  Github,
  PlusSquare,
  Minus,
} from "lucide-react";

const STATUS_CONFIG = {
  new: { label: "New", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  contacted: { label: "Contacted", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  in_progress: { label: "In Progress", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  proposal_sent: { label: "Proposal Sent", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  won: { label: "Won ✓", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  lost: { label: "Lost", color: "bg-red-500/20 text-red-300 border-red-500/30" },
} as const;

type Status = keyof typeof STATUS_CONFIG;

const QUOTE_STATUS_CONFIG = {
  new: { label: "New", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  contacted: { label: "Contacted", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  proposal_sent: { label: "Proposal Sent", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  won: { label: "Won", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  lost: { label: "Lost", color: "bg-red-500/20 text-red-300 border-red-500/30" },
} as const;

type QuoteStatus = keyof typeof QUOTE_STATUS_CONFIG;

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Displays the lead's local time derived from their phone area code.
 * Updates every 60 seconds. Color-coded by call-friendliness.
 */
function LeadLocalTime({ phone, isDark, compact = false }: { phone?: string | null; isDark: boolean; compact?: boolean }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!phone) return null;
  const tzInfo = getTZFromPhone(phone);
  if (!tzInfo) return null;

  const { time, status } = getLocalTimeInfo(tzInfo.tz);
  // suppress re-render warning — `now` drives the recalculation
  void now;

  const statusStyles: Record<CallStatus, { badge: string; dot: string; tooltip: string }> = {
    good:   { badge: isDark ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-400", tooltip: "Good time to call" },
    early:  { badge: isDark ? "bg-amber-500/15 border-amber-500/25 text-amber-300"   : "bg-amber-50 border-amber-200 text-amber-700",   dot: "bg-amber-400",  tooltip: "Early / late — call with care" },
    late:   { badge: isDark ? "bg-amber-500/15 border-amber-500/25 text-amber-300"   : "bg-amber-50 border-amber-200 text-amber-700",   dot: "bg-amber-400",  tooltip: "Early / late — call with care" },
    closed: { badge: isDark ? "bg-red-500/15 border-red-500/25 text-red-300"         : "bg-red-50 border-red-200 text-red-700",         dot: "bg-red-400",    tooltip: "Outside business hours" },
  };
  const s = statusStyles[status];

  if (compact) {
    // Inline badge for collapsed card row — just time + TZ label
    return (
      <span
        title={`${tzInfo.name} · ${s.tooltip}`}
        className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${s.badge}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
        {time} <span className="opacity-60">{tzInfo.label}</span>
      </span>
    );
  }

  // Full badge for expanded action bar
  return (
    <span
      title={`${tzInfo.name} · ${s.tooltip}`}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border ${s.badge}`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${s.dot}`} />
      {time} <span className="opacity-60">{tzInfo.label}</span>
    </span>
  );
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"leads" | "customers" | "quotes" | "projects" | "changes" | "messages" | "upgrades" | "billing" | "invoices" | "team" | "scripts" | "partners" | "analytics" | "opportunities" | "addons" | "smsInbox" | "knowledgeCenter" | "bookings">("leads");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterNiche, setFilterNiche] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | string | null>(null);
  const [expandedQuoteId, setExpandedQuoteId] = useState<number | null>(null);
  const [pagesCustomerAccountId, setPagesCustomerAccountId] = useState<number | null>(null);

  // Multi-select state for leads
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Lead editing state
  const [editingLeadId, setEditingLeadId] = useState<number | null>(null);
  const [leadEditForm, setLeadEditForm] = useState<{
    adminNotes: string;
    source: string;
    followUpDate: string;
    assignedTechnicianId: string;
    assignedPartnerId: string;
    nicheTag: string;
  }>({ adminNotes: "", source: "", followUpDate: "", assignedTechnicianId: "", assignedPartnerId: "", nicheTag: "" });

  // Bulk status update state
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<string>("contacted");

  // Convert lead to client state
  const [convertingLeadId, setConvertingLeadId] = useState<number | null>(null);
  const [convertForm, setConvertForm] = useState({
    monthlyPriceCents: 4900,
    billingStartDate: "",
    planName: "Monthly Retainer",
    assignedTechnicianId: "",
    assignedPartnerId: "",
  });

  // Add Lead manually state
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

  // Convert quote to client state
  const [convertingQuoteId, setConvertingQuoteId] = useState<number | null>(null);
  const [quoteConvertForm, setQuoteConvertForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    businessName: "",
    websiteUrl: "",
    monthlyPriceCents: 9900,
    billingStartDate: "",
    adminNotes: "",
  });

  // Load OAuth session FIRST — verifyQuery must wait for this to avoid race condition
  const { user: oauthUser, loading: oauthLoading } = useAuth();
  const verifyQuery = trpc.admin.verify.useQuery(undefined, { retry: false });
  // Fetch opportunity pool count at top level so sidebar badge is always live
  const { data: opportunityCountData } = trpc.opportunity.list.useQuery(undefined, {
    enabled: !!verifyQuery.data?.authenticated,
    select: (data) => data.filter((o) => o.status === "available").length,
  });
  const leadsQuery = trpc.admin.getLeads.useQuery(undefined, {
    retry: false,
    enabled: !!verifyQuery.data?.authenticated,
  });
  const logoutMutation = trpc.admin.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem("admin_session_token");
      navigate("/flowsites-admin-secret");
    },
  });

  const utils = trpc.useUtils();
  const updateStatus = trpc.admin.updateLeadStatus.useMutation({
    onSuccess: () => utils.admin.getLeads.invalidate(),
  });

  const deleteLead = trpc.admin.deleteLead.useMutation({
    onSuccess: () => {
      utils.admin.getLeads.invalidate();
      setSelectedIds(new Set());
    },
  });

  const deleteLeadsBulk = trpc.admin.deleteLeadsBulk.useMutation({
    onSuccess: () => {
      utils.admin.getLeads.invalidate();
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
    },
  });

  const updateLead = trpc.admin.updateLead.useMutation({
    onSuccess: () => {
      utils.admin.getLeads.invalidate();
      setEditingLeadId(null);
      toast.success("Lead updated!");
    },
    onError: (e) => toast.error(e.message),
  });

  const bulkUpdateLeadStatus = trpc.admin.bulkUpdateLeadStatus.useMutation({
    onSuccess: (data) => {
      utils.admin.getLeads.invalidate();
      setSelectedIds(new Set());
      setShowBulkStatusModal(false);
      toast.success(`Updated ${data.updated} leads`);
    },
    onError: (e) => toast.error(e.message),
  });

  const addLeadMutation = trpc.admin.addLead.useMutation({
    onSuccess: () => {
      utils.admin.getLeads.invalidate();
      setShowAddLeadModal(false);
      setAddLeadForm({ businessName: "", businessType: "other", nicheTag: "", email: "", phone: "", website: "", primaryGoal: "", source: "cold_call", adminNotes: "" });
      toast.success("Lead added!");
    },
    onError: (e) => toast.error(e.message),
  });

  // Lead notes state
  const [notesLeadId, setNotesLeadId] = useState<number | null>(null);
  const [newNoteText, setNewNoteText] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminTrpc = trpc as any;

  const leadNotesQueryDirect = adminTrpc.admin.getLeadNotes.useQuery(
    { leadId: notesLeadId! },
    { enabled: notesLeadId !== null, retry: false }
  );

  const addLeadNote = adminTrpc.admin.addLeadNote.useMutation({
    onSuccess: () => {
      adminTrpc.useUtils().admin.getLeadNotes.invalidate({ leadId: notesLeadId! });
      setNewNoteText("");
      toast.success("Note added!");
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const deleteLeadNote = adminTrpc.admin.deleteLeadNote.useMutation({
    onSuccess: () => adminTrpc.useUtils().admin.getLeadNotes.invalidate({ leadId: notesLeadId! }),
    onError: (e: { message: string }) => toast.error(e.message),
  });

  // convertLeadToClient is a query (prefills the create-client form with lead data)
  const convertLeadPrefillQuery = trpc.admin.convertLeadToClient.useQuery(
    { id: convertingLeadId! },
    {
      enabled: convertingLeadId !== null,
      retry: false,
    }
  );

  // When prefill data arrives, populate the convert form
  useEffect(() => {
    if (convertLeadPrefillQuery.data && convertingLeadId !== null) {
      const d = convertLeadPrefillQuery.data;
      setConvertForm((prev) => ({
        ...prev,
        assignedTechnicianId: d.assignedTechnicianId ? String(d.assignedTechnicianId) : "",
        assignedPartnerId: d.assignedPartnerId ? String(d.assignedPartnerId) : "",
      }));
    }
  }, [convertLeadPrefillQuery.data, convertingLeadId]);

  const createAccountFromLead = trpc.clientBilling.adminCreateAccount.useMutation({
    onSuccess: () => {
      utils.admin.getLeads.invalidate();
      accountsQueryMain.refetch();
      setConvertingLeadId(null);
      toast.success("Lead converted to client!");
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const quotesQuery = trpc.budgetQuote.adminList.useQuery(undefined, {
    retry: false,
    enabled: !!verifyQuery.data?.authenticated,
  });
  const updateQuoteStatus = trpc.budgetQuote.adminUpdateStatus.useMutation({
    onSuccess: () => utils.budgetQuote.adminList.invalidate(),
  });
  const convertQuoteToClient = trpc.budgetQuote.convertToClient.useMutation({
    onSuccess: () => {
      utils.budgetQuote.adminList.invalidate();
      accountsQueryMain.refetch();
      setConvertingQuoteId(null);
      toast.success("Quote converted to client account!");
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const projectsQuery = trpc.adminProjects.list.useQuery(undefined, {
    retry: false,
    enabled: !!verifyQuery.data?.authenticated,
  });
  const changeRequestsQuery = trpc.adminProjects.listChangeRequests.useQuery(undefined, {
    retry: false,
    enabled: !!verifyQuery.data?.authenticated,
  });
  const updateChangeRequest = trpc.adminProjects.updateChangeRequest.useMutation({
    onSuccess: () => utils.adminProjects.listChangeRequests.invalidate(),
  });
  const updateProject = trpc.adminProjects.update.useMutation({
    onSuccess: () => utils.adminProjects.list.invalidate(),
  });
  const resendWelcomeSms = trpc.adminProjects.resendWelcomeSms.useMutation({
    onSuccess: () => toast.success("Welcome SMS resent successfully!"),
    onError: (err) => toast.error(err.message || "Failed to resend SMS"),
  });
  const sendPortalInvite = trpc.clientPortalAuth.sendInvite.useMutation({
    onSuccess: () => toast.success("Portal invite sent! Client will receive an email to set up their password."),
    onError: (err) => toast.error(err.message || "Failed to send portal invite"),
  });
  const generateImpersonationToken = trpc.clientPortal.adminGenerateImpersonationToken.useMutation({
    onSuccess: (data) => {
      const previewUrl = `${window.location.origin}/portal?adminPreview=${data.token}`;
      window.open(previewUrl, "_blank");
    },
    onError: (err) => toast.error(err.message || "Failed to generate preview link"),
  });
  const createProject = trpc.adminProjects.create.useMutation({
    onSuccess: () => utils.adminProjects.list.invalidate(),
  });

  const syncFromCustomers = trpc.adminProjects.syncFromCustomers.useMutation({
    onSuccess: (data) => {
      utils.adminProjects.list.invalidate();
      toast.success(data.message);
    },
    onError: (err) => toast.error(err.message),
  });

  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);
  const [expandedChangeId, setExpandedChangeId] = useState<number | null>(null);
  // GitHub repos editing state: projectId -> [{label, url}]
  const [reposEditing, setReposEditing] = useState<Record<number, { label: string; url: string }[]>>({});
  const [reposExpanded, setReposExpanded] = useState<Record<number, boolean>>({}); // track open/closed per project

  const upgradeRequestsQuery = trpc.adminProjects.listUpgradeRequests.useQuery(undefined, {
    retry: false,
    enabled: !!verifyQuery.data?.authenticated,
  });
  const updateUpgradeRequest = trpc.adminProjects.updateUpgradeRequest.useMutation({
    onSuccess: () => utils.adminProjects.listUpgradeRequests.invalidate(),
  });
  const [expandedUpgradeId, setExpandedUpgradeId] = useState<number | null>(null);

  // Team / Technician state
  // Client accounts — needed for Customers tab AND Billing tab
  const accountsQueryMain = trpc.clientBilling.adminListAccounts.useQuery(undefined, {
    retry: false,
    enabled: !!verifyQuery.data?.authenticated,
  });

  const techniciansQuery = trpc.technician.adminGetTechnicians.useQuery(undefined, {
    retry: false,
    enabled: !!verifyQuery.data?.authenticated,
  });
  const commissionsQuery = trpc.technician.adminGetCommissions.useQuery(undefined, {
    retry: false,
    enabled: !!verifyQuery.data?.authenticated,
  });
  const inviteTechMutation = trpc.technician.adminInviteTechnician.useMutation({
    onSuccess: () => {
      utils.technician.adminGetTechnicians.invalidate();
      setShowInviteForm(false);
      setInviteForm({ name: "", email: "", commissionRate: 15, notes: "", role: "sales_rep" });
      toast.success("Invite sent!");
    },
    onError: (e) => toast.error(e.message),
  });
  const markCommPaidMutation = trpc.technician.adminMarkCommissionPaid.useMutation({
    onSuccess: () => utils.technician.adminGetCommissions.invalidate(),
  });
  const deactivateTechMutation = trpc.technician.adminDeactivateTechnician.useMutation({
    onSuccess: () => utils.technician.adminGetTechnicians.invalidate(),
  });
  const resendInviteMutation = trpc.technician.adminResendInvite.useMutation({
    onSuccess: (_, vars) => {
      toast.success("Invite resent successfully!");
      utils.technician.adminGetTechnicians.invalidate();
    },
    onError: (e) => toast.error(e.message || "Failed to resend invite"),
  });
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", commissionRate: 15, notes: "", role: "sales_rep" as "sales_rep" | "technician" | "manager" | "team_lead" | "admin" });
  const updateTechRoleMutation = trpc.technician.adminUpdateTechnicianRole.useMutation({
    onSuccess: () => utils.technician.adminGetTechnicians.invalidate(),
    onError: (e) => toast.error(e.message),
  });
  const [teamSubTab, setTeamSubTab] = useState<"reps" | "commissions">("reps");

  // Partners
  const partnersQuery = trpc.partner.adminListPartners.useQuery(undefined, {
    retry: false,
    enabled: !!verifyQuery.data?.authenticated,
  });
  const allPartnerCommissionsQuery = trpc.partner.adminGetAllPartnerCommissions.useQuery(undefined, {
    retry: false,
    enabled: !!verifyQuery.data?.authenticated,
  });
  const createPartnerMutation = trpc.partner.adminCreatePartner.useMutation({
    onSuccess: () => {
      utils.partner.adminListPartners.invalidate();
      setShowCreatePartnerForm(false);
      setPartnerForm({ name: "", email: "", phone: "", companyName: "", commissionRate: 15, notes: "" });
      toast.success("Partner created!");
    },
    onError: (e) => toast.error(e.message),
  });
  const markPartnerCommPaidMutation = trpc.partner.adminMarkPartnerCommissionPaid.useMutation({
    onSuccess: () => utils.partner.adminGetAllPartnerCommissions.invalidate(),
  });
  const deactivatePartnerMutation = trpc.partner.adminUpdatePartner.useMutation({
    onSuccess: () => utils.partner.adminListPartners.invalidate(),
  });
  const [showCreatePartnerForm, setShowCreatePartnerForm] = useState(false);
  const [partnerForm, setPartnerForm] = useState({ name: "", email: "", phone: "", companyName: "", commissionRate: 15, notes: "" });
  const [partnerSubTab, setPartnerSubTab] = useState<"partners" | "commissions">("partners");
  const [selectedMessageProjectId, setSelectedMessageProjectId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const messagesQuery = trpc.clientPortal.adminGetMessages.useQuery(
    { projectId: selectedMessageProjectId! },
    { enabled: selectedMessageProjectId !== null, refetchInterval: 5000 }
  );
  const sendAdminMessage = trpc.clientPortal.adminSendMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      utils.clientPortal.adminGetMessages.invalidate({ projectId: selectedMessageProjectId! });
    },
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Always open the CRM in the bright workspace. The toggle still works for
  // the active visit, but an old browser preference cannot restore dark mode.
  const [dashboardTheme, setDashboardTheme] = useState<"dark" | "light">("light");
  // Sync CSS variable context on mount and when theme changes
  useEffect(() => {
    if (dashboardTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dashboardTheme]);
  const toggleDashboardTheme = () => {
    setDashboardTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      // Sync the global CSS variable context so semantic classes (bg-card, text-muted-foreground, etc.) resolve correctly
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({ clientName: "", clientEmail: "", clientPhone: "", businessName: "", packageName: "", setupFee: "", monthlyPrice: "", estimatedLaunchDate: "", websiteDomain: "" });
  const [newProjectError, setNewProjectError] = useState("");

  // Redirect to appropriate login if not authenticated
  useEffect(() => {
    if (verifyQuery.isLoading) return;
    if (!verifyQuery.data?.authenticated) {
      if (oauthUser) {
        // They have a Manus OAuth session but aren't a technician — send to admin password
        navigate("/flowsites-admin-secret");
      } else {
        // No session at all — send to Manus OAuth login (reps use Manus OAuth)
        window.location.href = getLoginUrl("/flowsites-admin-dashboard");
      }
    }
  }, [verifyQuery.data, verifyQuery.isLoading, oauthUser, navigate]);

  if (verifyQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[oklch(0.07_0.005_260)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (!verifyQuery.data?.authenticated) return null;

  const allLeads = leadsQuery.data ?? [];

  // Distinction: Customers = status "won" (paid), Leads = everything else
  const wonLeads = allLeads.filter((l) => l.status === "won");
  const leads = allLeads.filter((l) => l.status !== "won");

  // Client accounts from billing system — these are the real paying customers
  const clientAccountsList = accountsQueryMain.data ?? [];

  // Build a unified customers list:
  // 1. All client_accounts (billing system customers)
  // 2. Plus any won leads whose email isn't already in client_accounts
  const clientAccountEmails = new Set(clientAccountsList.map((a) => a.clientEmail.toLowerCase()));
  const wonLeadsNotInBilling = wonLeads.filter((l) => !clientAccountEmails.has(l.email.toLowerCase()));

  // Normalise both sources into a common shape for the Customers tab
  type CustomerRow = {
    id: string;
    businessName: string;
    email: string;
    phone: string;
    source: "billing" | "lead";
    plan: string;
    monthlyPrice: string;
    status: string;
    createdAt: Date | string;
    websiteUrl?: string;
    // lead-only
    businessType?: string;
    budget?: string;
    timeline?: string;
    primaryGoal?: string;
    statusUpdatedAt?: Date | string;
  };

  const billingCustomers: CustomerRow[] = clientAccountsList.map((a) => ({
    id: `acct-${a.id}`,
    businessName: a.businessName,
    email: a.clientEmail,
    phone: a.clientPhone ?? "",
    source: "billing",
    plan: a.billingCycle === "annual" ? "Annual" : "Monthly",
    monthlyPrice: `$${(a.monthlyPriceCents / 100).toFixed(0)}/mo`,
    status: a.status,
    createdAt: a.createdAt,
    websiteUrl: a.websiteUrl ?? undefined,
  }));

  const leadCustomers: CustomerRow[] = wonLeadsNotInBilling.map((l) => ({
    id: `lead-${l.id}`,
    businessName: l.businessName,
    email: l.email,
    phone: l.phone,
    source: "lead",
    plan: "—",
    monthlyPrice: l.budget ?? "—",
    status: "won",
    createdAt: l.createdAt,
    businessType: l.businessType,
    budget: l.budget ?? undefined,
    timeline: l.timeline,
    primaryGoal: l.primaryGoal,
    statusUpdatedAt: l.statusUpdatedAt,
  }));

  const customers: CustomerRow[] = [...billingCustomers, ...leadCustomers];

  // Stats for leads tab
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const inProgress = leads.filter((l) => ["in_progress", "contacted", "proposal_sent"].includes(l.status)).length;
  const totalCustomers = customers.length;

  // Niche tag config
  const NICHE_TAGS: Record<string, { label: string; color: string; darkColor: string }> = {
    martial_arts: { label: "Martial Arts", color: "bg-red-50 border-red-200 text-red-700", darkColor: "bg-red-500/15 border-red-500/25 text-red-300" },
    restaurant: { label: "Restaurant", color: "bg-orange-50 border-orange-200 text-orange-700", darkColor: "bg-orange-500/15 border-orange-500/25 text-orange-300" },
    fitness: { label: "Fitness", color: "bg-green-50 border-green-200 text-green-700", darkColor: "bg-green-500/15 border-green-500/25 text-green-300" },
    self_defense: { label: "Self Defense", color: "bg-purple-50 border-purple-200 text-purple-700", darkColor: "bg-purple-500/15 border-purple-500/25 text-purple-300" },
    health_wellness: { label: "Health & Wellness", color: "bg-teal-50 border-teal-200 text-teal-700", darkColor: "bg-teal-500/15 border-teal-500/25 text-teal-300" },
    salon: { label: "Salon / Spa", color: "bg-pink-50 border-pink-200 text-pink-700", darkColor: "bg-pink-500/15 border-pink-500/25 text-pink-300" },
    hospitality: { label: "Hospitality", color: "bg-amber-50 border-amber-200 text-amber-700", darkColor: "bg-amber-500/15 border-amber-500/25 text-amber-300" },
    other: { label: "Other", color: "bg-gray-50 border-gray-200 text-gray-600", darkColor: "bg-white/8 border-white/15 text-white/50" },
  };

  // Filter & search for leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !search ||
      lead.businessName.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.businessType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;
    const matchesNiche = filterNiche === "all" || (lead as any).nicheTag === filterNiche;
    return matchesSearch && matchesStatus && matchesNiche;
  });
  const sortedLeads = [...filteredLeads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Filter & search for customers
  const filteredCustomers = customers.filter((c) => {
    return (
      !search ||
      c.businessName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedLeads.map((l) => l.id)));
    }
  };

  const pendingUpgrades = (upgradeRequestsQuery.data ?? []).filter((r: { status: string }) => r.status === "pending").length;

  // Role-based tab visibility:
  // admin/owner: all tabs
  // manager: all except Partners, Billing
  // team_lead: all except Billing, Analytics, Partners
  // sales_rep: everything except Billing (financial settings), Team (adding reps), Partners (partner commissions)
  // technician: Projects, Messages, Change Requests, Upgrades, Scripts
  const ALL_TABS = [
    { key: "leads" as const, label: "Leads", count: leads.length, icon: UserX, color: "text-blue-400", roles: ["admin", "team_lead", "manager", "sales_rep"] },
    { key: "customers" as const, label: "Customers", count: customers.length, icon: UserCheck, color: "text-emerald-400", roles: ["admin", "team_lead", "manager", "sales_rep"] },
    { key: "quotes" as const, label: "Budget Quotes", count: (quotesQuery.data ?? []).length, icon: DollarSign, color: "text-yellow-400", roles: ["admin", "team_lead", "manager", "sales_rep"] },
    { key: "projects" as const, label: "Projects", count: (projectsQuery.data ?? []).length, icon: BarChart3, color: "text-purple-400", roles: ["admin", "team_lead", "manager", "technician", "sales_rep"] },
    { key: "changes" as const, label: "Change Requests", count: (changeRequestsQuery.data ?? []).length, icon: ClipboardList, color: "text-orange-400", roles: ["admin", "team_lead", "manager", "technician", "sales_rep"] },
    { key: "messages" as const, label: "Messages", count: null, icon: MessageSquare, color: "text-sky-400", roles: ["admin", "team_lead", "manager", "technician", "sales_rep"] },
    { key: "upgrades" as const, label: "Upgrades", count: pendingUpgrades, icon: Zap, color: "text-pink-400", badge: pendingUpgrades > 0, roles: ["admin", "team_lead", "manager", "technician", "sales_rep"] },
    { key: "billing" as const, label: "Billing", count: null, icon: CreditCard, color: "text-emerald-400", roles: ["admin"] },
    { key: "invoices" as const, label: "Invoices", count: null, icon: Receipt, color: "text-yellow-400", roles: ["admin", "manager", "sales_rep"] },
    { key: "team" as const, label: "Team", count: null, icon: Users, color: "text-violet-400", roles: ["admin", "team_lead", "manager"] },
    { key: "scripts" as const, label: "Scripts", count: null, icon: PhoneCall, color: "text-amber-400", roles: ["admin", "team_lead", "manager", "sales_rep", "technician"] },
    { key: "partners" as const, label: "Partners", count: null, icon: Handshake, color: "text-teal-400", roles: ["admin"] },
    { key: "analytics" as const, label: "Analytics", count: null, icon: TrendingUp, color: "text-indigo-400", roles: ["admin", "manager", "sales_rep"] },
    { key: "opportunities" as const, label: "Opportunity Pool", count: opportunityCountData ?? null, icon: Trophy, color: "text-yellow-400", roles: ["admin", "team_lead", "manager", "sales_rep"] },
    { key: "addons" as const, label: "Add-On Pricing", count: null, icon: Package, color: "text-rose-400", roles: ["admin", "team_lead", "manager", "sales_rep", "technician"] },
    { key: "smsInbox" as const, label: "SMS Inbox", count: null, icon: Inbox, color: "text-cyan-400", roles: ["admin", "team_lead", "manager", "sales_rep"] },
    { key: "knowledgeCenter" as const, label: "Knowledge Center", count: null, icon: BookOpenIcon, color: "text-lime-400", roles: ["admin", "team_lead", "manager", "sales_rep", "technician"] },
    { key: "bookings" as const, label: "Confirmed Bookings", count: null, icon: CalendarCheck, color: "text-teal-400", roles: ["admin", "team_lead", "manager", "sales_rep"] },
  ];
  // Role-based tab filtering: admin password session sees all tabs,
  // technicians via Manus OAuth see only their allowed tabs.
  const verifiedTechRole = verifyQuery.data?.techRole ?? "admin";
  const TABS = verifiedTechRole === "admin"
    ? ALL_TABS
    : ALL_TABS.filter(tab => (tab.roles as string[]).includes(verifiedTechRole));

  // The CRM is intentionally a bright workspace. Old saved preferences remain
  // harmless, but cannot return any workflow to the previous dark canvas.
  const isDark = false;

  return (
    <div className={`min-h-screen flex ${isDark ? "bg-[oklch(0.065_0.005_260)] text-white" : "bg-[#f5f5f5] text-gray-900"}`}>
      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* ── Left Sidebar ── */}
      <aside className={`w-64 flex-shrink-0 flex flex-col fixed top-0 left-0 h-screen z-50 border-r transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 ${isDark ? "bg-[#111113] border-white/8" : "bg-white border-gray-200"}`}>
        {/* Logo / Brand */}
        <div className={`px-5 py-5 border-b flex items-start justify-between ${isDark ? "border-white/8" : "border-gray-100"}`}>
          <div>
            <img
              src="/flowsites-logo.png"
              alt="FlowSites"
              className="h-20 w-auto"
            />
            <p className={`text-[10px] mt-1.5 font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>CRM Dashboard</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`lg:hidden mt-1 p-1.5 rounded-lg ${isDark ? "text-white/40 hover:text-white hover:bg-white/8" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
          >
            <X size={18} />
          </button>
        </div>
        {/* Quick Stats */}
        <div className={`px-4 py-4 border-b ${isDark ? "border-white/8" : "border-gray-100"}`}>
          <div className="grid grid-cols-3 gap-2">
            <div className={`rounded-lg p-2.5 text-center ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
              <div className={`text-lg font-bold leading-none ${isDark ? "text-white" : "text-gray-900"}`}>{totalLeads}</div>
              <div className={`text-[10px] mt-1 font-medium ${isDark ? "text-white/35" : "text-gray-400"}`}>Leads</div>
            </div>
            <div className={`rounded-lg p-2.5 text-center ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
              <div className={`text-lg font-bold leading-none ${isDark ? "text-white" : "text-gray-900"}`}>{totalCustomers}</div>
              <div className={`text-[10px] mt-1 font-medium ${isDark ? "text-white/35" : "text-gray-400"}`}>Clients</div>
            </div>
            <div className={`rounded-lg p-2.5 text-center ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
              <div className={`text-lg font-bold leading-none ${isDark ? "text-white" : "text-gray-900"}`}>{inProgress}</div>
              <div className={`text-[10px] mt-1 font-medium ${isDark ? "text-white/35" : "text-gray-400"}`}>Active</div>
            </div>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className={`text-[10px] font-semibold uppercase tracking-widest px-3 mb-3 ${isDark ? "text-white/25" : "text-gray-400"}`}>Navigation</div>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearch(""); setFilterStatus("all"); setSelectedIds(new Set()); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all text-sm font-medium text-left ${
                activeTab === tab.key
                  ? isDark ? "bg-white text-black" : "bg-black text-white"
                  : isDark ? "text-white/50 hover:text-white hover:bg-white/6" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <tab.icon size={16} className={activeTab === tab.key ? (isDark ? "text-black" : "text-white") : (isDark ? "text-white/40" : "text-gray-400")} />
              <span className="flex-1">{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center ${
                  tab.badge
                    ? isDark ? "bg-white text-black" : "bg-black text-white"
                    : activeTab === tab.key
                    ? isDark ? "bg-black/20 text-black" : "bg-white/20 text-white"
                    : isDark ? "bg-white/8 text-white/40" : "bg-gray-100 text-gray-500"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
        {/* Sidebar Footer */}
        <div className={`px-3 py-4 border-t ${isDark ? "border-white/8" : "border-gray-100"}`}>
          <Link
            href="/flowsites-admin-scheduling"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all text-sm font-medium ${isDark ? "text-white/50 hover:text-white hover:bg-white/6" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
          >
            <Calendar size={16} className={isDark ? "text-white/40" : "text-gray-400"} />
            Scheduling
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium">
              <Sun size={15} />
              <span className="text-xs">Bright workspace</span>
            </div>
            <button
              onClick={() => leadsQuery.refetch()}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${isDark ? "text-white/40 hover:text-white hover:bg-white/6" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`}
              title="Refresh"
            >
              <RefreshCw size={15} className={leadsQuery.isFetching ? "animate-spin" : ""} />
            </button>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mt-1 transition-all text-sm font-medium ${isDark ? "text-white/40 hover:text-white hover:bg-white/6" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content Area (offset by sidebar on desktop) ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Section Title Bar */}
        <div className={`sticky top-0 z-40 px-4 sm:px-8 py-4 sm:py-5 border-b flex items-center justify-between gap-3 ${isDark ? "bg-[#0f0f11] border-white/8" : "bg-[#f5f5f5] border-gray-200"}`}>
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden flex-shrink-0 p-2 rounded-xl transition-all ${isDark ? "text-white/60 hover:text-white hover:bg-white/8" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect y="3" width="20" height="2" rx="1" />
                <rect y="9" width="20" height="2" rx="1" />
                <rect y="15" width="20" height="2" rx="1" />
              </svg>
            </button>
            <div className="min-w-0">
              <h2 className={`text-lg sm:text-2xl font-bold tracking-tight truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                {TABS.find(t => t.key === activeTab)?.label ?? "Dashboard"}
              </h2>
              <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? "text-white/35" : "text-gray-400"}`}>
                {activeTab === "leads" && `${totalLeads} total leads`}
              </p>
            </div>
          </div>
          {activeTab === "leads" && (
            <button
              onClick={() => setShowAddLeadModal(true)}
              className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white transition-all shadow-md"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add Lead</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>

      {/* ── Main Content ── */}
      <main className="flex-1 px-4 sm:px-8 py-5 sm:py-7 overflow-auto">

        {/* ─── LEADS TAB ─────────────────────────────────────────────────────── */}
        {activeTab === "leads" && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total Leads", value: totalLeads, icon: Users, color: "text-blue-400", bg: "from-blue-500/10 to-blue-500/5" },
                { label: "New Inquiries", value: newLeads, icon: Clock, color: "text-yellow-400", bg: "from-yellow-500/10 to-yellow-500/5" },
                { label: "In Pipeline", value: inProgress, icon: TrendingUp, color: "text-purple-400", bg: "from-purple-500/10 to-purple-500/5" },
                { label: "Converted", value: totalCustomers, icon: CheckCircle2, color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-500/5" },
              ].map((stat) => (
                <div key={stat.label} className={`bg-gradient-to-br ${stat.bg} rounded-xl p-4 ${isDark ? "border border-white/8" : "border border-gray-200 bg-white shadow-sm"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-white/40" : "text-gray-500"}`}>{stat.label}</span>
                    <stat.icon size={14} className={stat.color} />
                  </div>
                  <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`} style={{ fontFamily: "var(--font-display)" }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Toolbar: search + filter + bulk actions */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-gray-400"}`} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by business, email, or type..."
                  className={`w-full rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none transition-all ${isDark ? "bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:border-white/20" : "bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-400"}`}
                />
              </div>
              <div className="relative">
                <Filter size={12} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-gray-400"}`} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`rounded-xl pl-8 pr-7 py-2 text-sm focus:outline-none appearance-none cursor-pointer ${isDark ? "bg-white/5 border border-white/10 text-white focus:border-white/20" : "bg-white border border-gray-200 text-gray-900 focus:border-gray-400"}`}
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(STATUS_CONFIG)
                    .filter(([key]) => key !== "won")
                    .map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                </select>
                <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/30" : "text-gray-400"}`} />
              </div>
              <div className="relative">
                <Tag size={12} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-gray-400"}`} />
                <select
                  value={filterNiche}
                  onChange={(e) => setFilterNiche(e.target.value)}
                  className={`rounded-xl pl-8 pr-7 py-2 text-sm focus:outline-none appearance-none cursor-pointer ${isDark ? "bg-white/5 border border-white/10 text-white focus:border-white/20" : "bg-white border border-gray-200 text-gray-900 focus:border-gray-400"}`}
                >
                  <option value="all">All Niches</option>
                  {Object.entries(NICHE_TAGS).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/30" : "text-gray-400"}`} />
              </div>

              {/* Bulk action buttons */}
              {selectedIds.size > 0 && (
                <>
                  <button
                    onClick={() => setShowBulkStatusModal(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-semibold ${isDark ? "bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25" : "bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100"}`}
                  >
                    <CheckSquare size={14} />
                    Update {selectedIds.size} status
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-all text-sm font-semibold"
                  >
                    <Trash2 size={14} />
                    Delete {selectedIds.size}
                  </button>
                </>
              )}
            </div>

            {/* Select all row */}
            {sortedLeads.length > 0 && (
              <div className="flex items-center gap-3 mb-3 px-1">
                <button
                  onClick={toggleSelectAll}
                  className={`flex items-center gap-2 text-xs transition-colors ${isDark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-700"}`}
                >
                  {selectedIds.size === sortedLeads.length && sortedLeads.length > 0
                    ? <SquareCheck size={14} className="text-[oklch(0.5_0.2_25)]" />
                    : <Square size={14} className={isDark ? "text-white/30" : "text-gray-400"} />
                  }
                  {selectedIds.size === sortedLeads.length && sortedLeads.length > 0 ? "Deselect all" : "Select all"}
                </button>
                <span className={`text-xs ${isDark ? "text-white/20" : "text-gray-400"}`}>{sortedLeads.length} lead{sortedLeads.length !== 1 ? "s" : ""}</span>
              </div>
            )}

            {/* Leads List */}
            {leadsQuery.isLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className={`w-8 h-8 border-2 rounded-full animate-spin ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-500"}`} />
              </div>
            ) : sortedLeads.length === 0 ? (
              <div className="text-center py-24">
                <Users size={36} className={`mx-auto mb-4 ${isDark ? "text-white/15" : "text-gray-300"}`} />
                <p className={`text-base font-medium ${isDark ? "text-white/35" : "text-gray-500"}`}>
                  {leads.length === 0 ? "No leads yet" : "No leads match your filters"}
                </p>
                <p className={`text-sm mt-2 ${isDark ? "text-white/20" : "text-gray-400"}`}>
                  {leads.length === 0
                    ? "Submissions from the Get Started wizard will appear here"
                    : "Try adjusting your search or filter"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedLeads.map((lead) => {
                  const isExpanded = expandedId === lead.id;
                  const isSelected = selectedIds.has(lead.id);
                  const statusCfg = STATUS_CONFIG[lead.status as Status] ?? STATUS_CONFIG.new;

                  return (
                    <div
                      key={lead.id}
                      className={`rounded-xl border overflow-hidden transition-all duration-200 ${
                        isSelected
                          ? "bg-[oklch(0.5_0.2_25_/_8%)] border-[oklch(0.5_0.2_25_/_35%)]"
                          : isDark ? "bg-white/3 border-white/8 hover:border-white/15" : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleSelect(lead.id)}
                          className={`flex-shrink-0 transition-colors ${isDark ? "text-white/30 hover:text-white/70" : "text-gray-300 hover:text-gray-600"}`}
                        >
                          {isSelected
                            ? <SquareCheck size={16} className="text-[oklch(0.5_0.2_25)]" />
                            : <Square size={16} />
                          }
                        </button>

                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[oklch(0.5_0.2_25_/_30%)] to-[oklch(0.35_0.18_25_/_20%)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {lead.businessName.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{lead.businessName}</span>
                            <span className={`text-xs ${isDark ? "text-white/25" : "text-gray-300"}`}>·</span>
                            <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>{lead.businessType}</span>
                            {(lead as any).nicheTag && NICHE_TAGS[(lead as any).nicheTag] && (
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? NICHE_TAGS[(lead as any).nicheTag].darkColor : NICHE_TAGS[(lead as any).nicheTag].color}`}>
                                {NICHE_TAGS[(lead as any).nicheTag].label}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className={`text-xs flex items-center gap-1 ${isDark ? "text-white/35" : "text-gray-500"}`}><Mail size={10} />{lead.email}</span>
                            <span className={`text-xs flex items-center gap-1 ${isDark ? "text-white/35" : "text-gray-500"}`}><Phone size={10} />{lead.phone}</span>
                            <LeadLocalTime phone={lead.phone} isDark={isDark} compact />
                            <span className={`text-xs flex items-center gap-1 ${isDark ? "text-white/25" : "text-gray-400"}`}><Calendar size={10} />{formatDate(lead.createdAt)}</span>
                          </div>
                        </div>

                        {/* Status + actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={lead.status}
                              onChange={(e) => updateStatus.mutate({ id: lead.id, status: e.target.value as Status })}
                              className={`text-xs font-medium px-2.5 py-1 rounded-lg border appearance-none cursor-pointer pr-6 ${statusCfg.color} bg-transparent focus:outline-none`}
                            >
                              {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                                <option key={key} value={key} className="bg-white text-gray-900">{label}</option>
                              ))}
                            </select>
                            <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                          </div>
                          <button
                            onClick={() => {
                              if (confirm(`Delete lead "${lead.businessName}"? This cannot be undone.`)) {
                                deleteLead.mutate({ id: lead.id });
                              }
                            }}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center hover:text-red-400 hover:bg-red-500/10 transition-all ${isDark ? "text-white/20" : "text-gray-300"}`}
                            title="Delete lead"
                          >
                            <Trash2 size={13} />
                          </button>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/5 transition-all ${isDark ? "text-white/20 hover:text-white/60" : "text-gray-400 hover:text-gray-700"}`}
                          >
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className={`border-t px-4 py-4 ${isDark ? "border-white/8 bg-white/2" : "border-gray-100 bg-gray-50/50"}`}>
                          {/* Source + Follow-up badges row */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {(lead as any).source && (
                              <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${isDark ? "bg-teal-500/15 border border-teal-500/25 text-teal-300" : "bg-teal-50 border border-teal-200 text-teal-700"}`}>
                                <Tag size={10} />
                                {(lead as any).source.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                              </span>
                            )}
                            {(lead as any).followUpDate && (
                              <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${new Date((lead as any).followUpDate) < new Date() ? (isDark ? "bg-red-500/15 border border-red-500/25 text-red-300" : "bg-red-50 border border-red-200 text-red-700") : (isDark ? "bg-amber-500/15 border border-amber-500/25 text-amber-300" : "bg-amber-50 border border-amber-200 text-amber-700")}`}>
                                <Bell size={10} />
                                Follow-up: {new Date((lead as any).followUpDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            )}
                            {(lead as any).assignedTechnicianId && (
                              <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${isDark ? "bg-violet-500/15 border border-violet-500/25 text-violet-300" : "bg-violet-50 border border-violet-200 text-violet-700"}`}>
                                <UserPlus size={10} />
                                Rep: {(techniciansQuery.data ?? []).find((t: any) => t.id === (lead as any).assignedTechnicianId)?.name ?? "Assigned"}
                              </span>
                            )}
                            {(lead as any).assignedPartnerId && (
                              <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${isDark ? "bg-teal-500/15 border border-teal-500/25 text-teal-300" : "bg-teal-50 border border-teal-200 text-teal-700"}`}>
                                <Handshake size={10} />
                                Partner: {(partnersQuery.data ?? []).find((p: any) => p.id === (lead as any).assignedPartnerId)?.name ?? "Assigned"}
                              </span>
                            )}
                          </div>

                          {/* Admin notes */}
                          {(lead as any).adminNotes && editingLeadId !== lead.id && (
                            <div className={`mb-3 p-3 rounded-lg text-xs ${isDark ? "bg-amber-500/8 border border-amber-500/20 text-amber-200/80" : "bg-amber-50 border border-amber-200 text-amber-800"}`}>
                              <div className={`flex items-center gap-1 mb-1 font-semibold text-[10px] uppercase tracking-wider ${isDark ? "text-amber-400/60" : "text-amber-600"}`}>
                                <StickyNote size={9} /> Admin Notes
                              </div>
                              {(lead as any).adminNotes}
                            </div>
                          )}

                          {/* Inline edit form */}
                          {editingLeadId === lead.id && (
                            <div className={`mb-4 p-3 rounded-xl border space-y-3 ${isDark ? "bg-white/3 border-white/10" : "bg-white border-gray-200 shadow-sm"}`}>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Source</label>
                                  <select
                                    value={leadEditForm.source}
                                    onChange={(e) => setLeadEditForm(f => ({ ...f, source: e.target.value }))}
                                    className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                                  >
                                    <option value="">— Select source —</option>
                                    <option value="website">Website</option>
                                    <option value="cold_call">Cold Call</option>
                                    <option value="referral">Referral</option>
                                    <option value="social">Social Media</option>
                                    <option value="partner">Partner</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                                <div>
                                  <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Follow-up Date</label>
                                  <input
                                    type="date"
                                    value={leadEditForm.followUpDate}
                                    onChange={(e) => setLeadEditForm(f => ({ ...f, followUpDate: e.target.value }))}
                                    className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                                  />
                                </div>
                                <div>
                                  <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Assign Rep</label>
                                  <select
                                    value={leadEditForm.assignedTechnicianId}
                                    onChange={(e) => setLeadEditForm(f => ({ ...f, assignedTechnicianId: e.target.value }))}
                                    className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                                  >
                                    <option value="">— Unassigned —</option>
                                    {(techniciansQuery.data ?? []).filter((t: any) => t.status === "active").map((t: any) => (
                                      <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Assign Partner</label>
                                  <select
                                    value={leadEditForm.assignedPartnerId}
                                    onChange={(e) => setLeadEditForm(f => ({ ...f, assignedPartnerId: e.target.value }))}
                                    className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                                  >
                                    <option value="">— Unassigned —</option>
                                    {(partnersQuery.data ?? []).filter((p: any) => p.status === "active").map((p: any) => (
                                      <option key={p.id} value={p.id}>{p.name}{p.companyName ? ` (${p.companyName})` : ""}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                                <div>
                                  <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Niche Tag</label>
                                  <select
                                    value={leadEditForm.nicheTag}
                                    onChange={(e) => setLeadEditForm(f => ({ ...f, nicheTag: e.target.value }))}
                                    className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                                  >
                                    <option value="">— No tag —</option>
                                    {Object.entries(NICHE_TAGS).map(([key, { label }]) => (
                                      <option key={key} value={key}>{label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="sm:col-span-2">
                                  <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Admin Notes</label>
                                  <textarea
                                    value={leadEditForm.adminNotes}
                                    onChange={(e) => setLeadEditForm(f => ({ ...f, adminNotes: e.target.value }))}
                                    rows={3}
                                    placeholder="Internal notes about this lead…"
                                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none resize-none ${isDark ? "bg-white/5 border border-white/10 text-white placeholder:text-white/25" : "bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400"}`}
                                  />
                                </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => (updateLead.mutate as any)({
                                    id: lead.id,
                                    adminNotes: leadEditForm.adminNotes || undefined,
                                    source: (leadEditForm.source as any) || null,
                                    followUpDate: leadEditForm.followUpDate || null,
                                    assignedTechnicianId: leadEditForm.assignedTechnicianId ? Number(leadEditForm.assignedTechnicianId) : null,
                                    assignedPartnerId: leadEditForm.assignedPartnerId ? Number(leadEditForm.assignedPartnerId) : null,
                                    nicheTag: leadEditForm.nicheTag || null,
                                  })}
                                  disabled={updateLead.isPending}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-xs font-semibold disabled:opacity-50"
                                >
                                  <Save size={12} /> {updateLead.isPending ? "Saving…" : "Save Changes"}
                                </button>
                                <button
                                  onClick={() => setEditingLeadId(null)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs ${isDark ? "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10" : "bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200"}`}
                                >
                                  <X size={12} /> Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Lead detail fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {lead.website && (
                              <DetailItem icon={Globe} label="Current Website" value={lead.website} isLink />
                            )}
                            <DetailItem icon={DollarSign} label="Budget" value={lead.budget || "Not specified"} />
                            <DetailItem icon={Clock} label="Timeline" value={lead.timeline} />
                            {lead.colorScheme && (
                              <DetailItem icon={Filter} label="Color Scheme" value={lead.colorScheme} />
                            )}
                            {lead.primaryGoal && (
                              <div className="md:col-span-2 lg:col-span-3">
                                <DetailItem icon={TrendingUp} label="Primary Goal" value={lead.primaryGoal} multiline />
                              </div>
                            )}
                            {lead.currentChallenges && (
                              <div className="md:col-span-2 lg:col-span-3">
                                <DetailItem icon={XCircle} label="Current Challenges" value={lead.currentChallenges} multiline />
                              </div>
                            )}
                            {lead.designStyle && (
                              <div className="md:col-span-2 lg:col-span-3">
                                <DetailItem icon={CheckCircle2} label="Design Style" value={lead.designStyle} multiline />
                              </div>
                            )}
                            {lead.referenceWebsites && (
                              <div className="md:col-span-2 lg:col-span-3">
                                <DetailItem icon={Globe} label="Reference Websites" value={lead.referenceWebsites} multiline />
                              </div>
                            )}
                            {lead.additionalNotes && (
                              <div className="md:col-span-2 lg:col-span-3">
                                <DetailItem icon={Mail} label="Additional Notes" value={lead.additionalNotes} multiline />
                              </div>
                            )}
                          </div>
                          <div className={`flex flex-wrap gap-2 mt-4 pt-3 border-t ${isDark ? "border-white/8" : "border-gray-200"}`}>
                            <a
                              href={`mailto:${lead.email}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[oklch(0.5_0.2_25_/_15%)] border border-[oklch(0.5_0.2_25_/_25%)] text-[oklch(0.65_0.2_25)] hover:bg-[oklch(0.5_0.2_25_/_25%)] transition-all text-xs font-medium"
                            >
                              <Mail size={12} /> Email
                            </a>
                            <a
                              href={`tel:${lead.phone}`}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium ${isDark ? "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10" : "bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200"}`}
                            >
                              <Phone size={12} /> Call
                            </a>
                            {lead.phone && (
                              <SmsButton
                                contactName={lead.businessName}
                                contactPhone={lead.phone}
                                leadId={lead.id}
                              />
                            )}
                            <LeadLocalTime phone={lead.phone} isDark={isDark} />
                            <button
                              onClick={() => {
                                setEditingLeadId(editingLeadId === lead.id ? null : lead.id);
                                setLeadEditForm({
                                  adminNotes: (lead as any).adminNotes ?? "",
                                  source: (lead as any).source ?? "",
                                  followUpDate: (lead as any).followUpDate ?? "",
                                  assignedTechnicianId: (lead as any).assignedTechnicianId ? String((lead as any).assignedTechnicianId) : "",
                                  assignedPartnerId: (lead as any).assignedPartnerId ? String((lead as any).assignedPartnerId) : "",
                                  nicheTag: (lead as any).nicheTag ?? "",
                                });
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium ${isDark ? "bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20" : "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"}`}
                            >
                              <StickyNote size={12} /> {editingLeadId === lead.id ? "Cancel Edit" : "Edit / Notes"}
                            </button>
                            <button
                              onClick={() => {
                                setConvertingLeadId(lead.id);
                                setConvertForm({ monthlyPriceCents: 4900, billingStartDate: "", planName: "Monthly Retainer", assignedTechnicianId: "", assignedPartnerId: "" });
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 transition-all text-xs font-medium"
                            >
                              <ArrowRightCircle size={12} /> Convert to Client
                            </button>
                            <button
                              onClick={() => {
                                if (notesLeadId === lead.id) {
                                  setNotesLeadId(null);
                                } else {
                                  setNotesLeadId(lead.id);
                                  setNewNoteText("");
                                }
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium ${
                                notesLeadId === lead.id
                                  ? (isDark ? "bg-blue-500/20 border border-blue-500/30 text-blue-300" : "bg-blue-100 border border-blue-300 text-blue-700")
                                  : (isDark ? "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10" : "bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200")
                              }`}
                            >
                              <StickyNote size={12} /> Notes
                            </button>
                          </div>

                          {/* ─── Inline Notes Panel ─── */}
                          {notesLeadId === lead.id && (
                            <div className={`mt-3 rounded-xl border p-4 space-y-3 ${isDark ? "bg-white/3 border-white/10" : "bg-white border-gray-200 shadow-sm"}`}>
                              <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-white/40" : "text-gray-500"}`}>
                                <StickyNote size={12} /> Activity Notes
                              </div>

                              {/* Add note input */}
                              <div className="flex gap-2">
                                <textarea
                                  value={newNoteText}
                                  onChange={(e) => setNewNoteText(e.target.value)}
                                  placeholder="Add a note — call outcome, next steps, context..."
                                  rows={2}
                                  className={`flex-1 rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${isDark ? "bg-white/5 border border-white/10 text-white placeholder-white/25" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400"}`}
                                />
                                <button
                                  disabled={!newNoteText.trim() || addLeadNote.isPending}
                                  onClick={() => addLeadNote.mutate({ leadId: lead.id, content: newNoteText.trim() })}
                                  className="self-end px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-medium flex items-center gap-1"
                                >
                                  {addLeadNote.isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                  Add
                                </button>
                              </div>

                              {/* Notes list */}
                              {leadNotesQueryDirect.isLoading ? (
                                <div className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}>Loading notes...</div>
                              ) : (leadNotesQueryDirect.data ?? []).length === 0 ? (
                                <div className={`text-xs italic ${isDark ? "text-white/25" : "text-gray-400"}`}>No notes yet. Add the first one above.</div>
                              ) : (
                                <div className="space-y-2">
                                  {(leadNotesQueryDirect.data as any[]).map((note: any) => (
                                    <div key={note.id} className={`rounded-lg p-3 text-xs group relative ${isDark ? "bg-white/4 border border-white/8" : "bg-gray-50 border border-gray-100"}`}>
                                      <div className={`flex items-center justify-between mb-1.5`}>
                                        <span className={`font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>{note.authorName}</span>
                                        <div className="flex items-center gap-2">
                                          <span className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-400"}`}>
                                            {new Date(note.createdAt).toLocaleString()}
                                          </span>
                                          <button
                                            onClick={() => deleteLeadNote.mutate({ noteId: note.id })}
                                            className={`opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300`}
                                          >
                                            <Trash2 size={11} />
                                          </button>
                                        </div>
                                      </div>
                                      <p className={`leading-relaxed whitespace-pre-wrap ${isDark ? "text-white/70" : "text-gray-700"}`}>{note.content}</p>
                                    </div>
                                  ))}
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

            {/* Bulk Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[oklch(0.12_0.01_260)] border border-white/15 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                      <AlertTriangle size={18} className="text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base">Delete {selectedIds.size} leads?</h3>
                      <p className="text-white/40 text-xs">This action cannot be undone.</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm mb-5">
                    You are about to permanently delete <span className="text-white font-semibold">{selectedIds.size} lead record{selectedIds.size !== 1 ? "s" : ""}</span>. All associated data will be removed.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => deleteLeadsBulk.mutate({ ids: Array.from(selectedIds) })}
                      disabled={deleteLeadsBulk.isPending}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-sm font-semibold disabled:opacity-50"
                    >
                      {deleteLeadsBulk.isPending ? "Deleting…" : `Delete ${selectedIds.size} leads`}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Status Update Modal */}
            {showBulkStatusModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className={`rounded-2xl p-6 max-w-sm w-full shadow-2xl border ${isDark ? "bg-[oklch(0.12_0.01_260)] border-white/15" : "bg-white border-gray-200"}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                      <CheckSquare size={18} className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>Update {selectedIds.size} leads</h3>
                      <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>Set the same status for all selected leads</p>
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-white/40" : "text-gray-500"}`}>New Status</label>
                    <div className="relative">
                      <select
                        value={bulkTargetStatus}
                        onChange={(e) => setBulkTargetStatus(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2.5 text-sm appearance-none focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-gray-50 border border-gray-200 text-gray-900"}`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/30" : "text-gray-400"}`} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => bulkUpdateLeadStatus.mutate({ ids: Array.from(selectedIds), status: bulkTargetStatus as any })}
                      disabled={bulkUpdateLeadStatus.isPending}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all text-sm font-semibold disabled:opacity-50"
                    >
                      {bulkUpdateLeadStatus.isPending ? "Updating…" : `Update ${selectedIds.size} leads`}
                    </button>
                    <button
                      onClick={() => setShowBulkStatusModal(false)}
                      className={`px-4 py-2.5 rounded-xl transition-all text-sm ${isDark ? "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10" : "bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200"}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Convert Lead to Client Modal */}
            {convertingLeadId !== null && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl border ${isDark ? "bg-[oklch(0.12_0.01_260)] border-white/15" : "bg-white border-gray-200"}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                      <ArrowRightCircle size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>Convert Lead to Client</h3>
                      <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>
                        {convertLeadPrefillQuery.data ? `${convertLeadPrefillQuery.data.clientName} — ${convertLeadPrefillQuery.data.clientEmail}` : "Loading lead data…"}
                      </p>
                    </div>
                  </div>
                  {convertLeadPrefillQuery.isLoading ? (
                    <div className="flex justify-center py-6"><RefreshCw size={20} className="animate-spin text-emerald-400" /></div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Plan Name</label>
                          <input
                            type="text"
                            value={convertForm.planName}
                            onChange={(e) => setConvertForm(f => ({ ...f, planName: e.target.value }))}
                            className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Monthly Price ($)</label>
                          <input
                            type="number"
                            value={convertForm.monthlyPriceCents / 100}
                            onChange={(e) => setConvertForm(f => ({ ...f, monthlyPriceCents: Math.round(parseFloat(e.target.value || "0") * 100) }))}
                            className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Billing Start Date</label>
                          <input
                            type="date"
                            value={convertForm.billingStartDate}
                            onChange={(e) => setConvertForm(f => ({ ...f, billingStartDate: e.target.value }))}
                            className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Assign Rep</label>
                          <select
                            value={convertForm.assignedTechnicianId}
                            onChange={(e) => setConvertForm(f => ({ ...f, assignedTechnicianId: e.target.value }))}
                            className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                          >
                            <option value="">— Unassigned —</option>
                            {(techniciansQuery.data ?? []).filter((t: any) => t.status === "active").map((t: any) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => {
                            if (!convertLeadPrefillQuery.data) return;
                            const d = convertLeadPrefillQuery.data;
                            createAccountFromLead.mutate({
                              clientName: d.clientName,
                              clientEmail: d.clientEmail,
                              clientPhone: d.clientPhone,
                              businessName: d.businessName,
                              websiteUrl: d.websiteUrl,
                              monthlyPriceCents: convertForm.monthlyPriceCents,
                              billingStartDate: convertForm.billingStartDate || new Date().toISOString().slice(0, 10),
                              adminNotes: convertForm.planName ? `Plan: ${convertForm.planName}` : undefined,
                            });
                          }}
                          disabled={createAccountFromLead.isPending || !convertLeadPrefillQuery.data}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-semibold disabled:opacity-50"
                        >
                          {createAccountFromLead.isPending ? "Converting…" : "Convert to Client"}
                        </button>
                        <button
                          onClick={() => setConvertingLeadId(null)}
                          className={`px-4 py-2.5 rounded-xl transition-all text-sm ${isDark ? "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10" : "bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200"}`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── ADD LEAD MODAL ─────────────────────────────────────────────── */}
        {showAddLeadModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`rounded-2xl p-6 max-w-lg w-full shadow-2xl border max-h-[90vh] overflow-y-auto ${isDark ? "bg-[oklch(0.12_0.01_260)] border-white/15" : "bg-white border-gray-200"}`}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[oklch(0.5_0.2_25_/_15%)] border border-[oklch(0.5_0.2_25_/_30%)] flex items-center justify-center">
                    <Plus size={18} className="text-[oklch(0.5_0.2_25)]" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>Add New Lead</h3>
                    <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>Manually add a cold lead to the pipeline</p>
                  </div>
                </div>
                <button onClick={() => setShowAddLeadModal(false)} className={`p-1.5 rounded-lg transition-all ${isDark ? "text-white/40 hover:text-white hover:bg-white/8" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}>
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${isDark ? "text-white/50" : "text-gray-500"}`}>Business Name *</label>
                  <input
                    type="text"
                    value={addLeadForm.businessName}
                    onChange={e => setAddLeadForm(f => ({ ...f, businessName: e.target.value }))}
                    placeholder="e.g. Tiger Martial Arts"
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-white/25" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400"}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${isDark ? "text-white/50" : "text-gray-500"}`}>Business Type</label>
                    <select
                      value={addLeadForm.businessType}
                      onChange={e => setAddLeadForm(f => ({ ...f, businessType: e.target.value }))}
                      className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white focus:border-white/25" : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-gray-400"}`}
                    >
                      <option value="martial_arts">Martial Arts</option>
                      <option value="fitness">Fitness / Gym</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="hospitality">Hospitality</option>
                      <option value="health_wellness">Health & Wellness</option>
                      <option value="service">Service Business</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${isDark ? "text-white/50" : "text-gray-500"}`}>Source</label>
                    <select
                      value={addLeadForm.source}
                      onChange={e => setAddLeadForm(f => ({ ...f, source: e.target.value as typeof addLeadForm.source }))}
                      className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white focus:border-white/25" : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-gray-400"}`}
                    >
                      <option value="cold_call">Cold Call</option>
                      <option value="referral">Referral</option>
                      <option value="website">Website</option>
                      <option value="social">Social Media</option>
                      <option value="partner">Partner</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${isDark ? "text-white/50" : "text-gray-500"}`}>Niche Tag</label>
                  <select
                    value={addLeadForm.nicheTag}
                    onChange={e => setAddLeadForm(f => ({ ...f, nicheTag: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white focus:border-white/25" : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-gray-400"}`}
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${isDark ? "text-white/50" : "text-gray-500"}`}>Email *</label>
                    <input
                      type="email"
                      value={addLeadForm.email}
                      onChange={e => setAddLeadForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="owner@business.com"
                      className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-white/25" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400"}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${isDark ? "text-white/50" : "text-gray-500"}`}>Phone</label>
                    <input
                      type="tel"
                      value={addLeadForm.phone}
                      onChange={e => setAddLeadForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="(555) 000-0000"
                      className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-white/25" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400"}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${isDark ? "text-white/50" : "text-gray-500"}`}>Website URL</label>
                  <input
                    type="url"
                    value={addLeadForm.website}
                    onChange={e => setAddLeadForm(f => ({ ...f, website: e.target.value }))}
                    placeholder="https://theirbadwebsite.com"
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-white/25" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400"}`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-semibold uppercase tracking-wider mb-1.5 block ${isDark ? "text-white/50" : "text-gray-500"}`}>Admin Notes</label>
                  <textarea
                    value={addLeadForm.adminNotes}
                    onChange={e => setAddLeadForm(f => ({ ...f, adminNotes: e.target.value }))}
                    placeholder="Website issues, call notes, context..."
                    rows={3}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none resize-none ${isDark ? "bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-white/25" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400"}`}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => {
                    if (!addLeadForm.businessName.trim() || !addLeadForm.email.trim()) {
                      toast.error("Business name and email are required");
                      return;
                    }
                    (addLeadMutation.mutate as any)({
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
                  className={`px-4 py-2.5 rounded-xl text-sm transition-all ${isDark ? "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10" : "bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200"}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── CUSTOMERS TAB ─────────────────────────────────────────────────── */}
        {activeTab === "customers" && (
          <>
            {/* Customer stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {[
                { label: "Total Customers", value: customers.length, icon: UserCheck, color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-500/5" },
                { label: "Active Projects", value: (projectsQuery.data ?? []).length, icon: BarChart3, color: "text-purple-400", bg: "from-purple-500/10 to-purple-500/5" },
                { label: "Monthly Revenue (MRR)", value: `$${((accountsQueryMain.data ?? []).filter((a: any) => a.status === "active").reduce((s: number, a: any) => s + (a.monthlyPriceCents ?? 0), 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mo`, icon: DollarSign, color: "text-yellow-400", bg: "from-yellow-500/10 to-yellow-500/5" },
              ].map((stat) => (
                <div key={stat.label} className={`bg-gradient-to-br ${stat.bg} rounded-xl p-4 ${isDark ? "border border-white/8" : "border border-gray-200 bg-white shadow-sm"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-white/40" : "text-gray-500"}`}>{stat.label}</span>
                    <stat.icon size={14} className={stat.color} />
                  </div>
                  <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`} style={{ fontFamily: "var(--font-display)" }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

             {/* Search */}
            <div className="relative mb-4">
              <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-gray-400"}`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers..."
                className={`w-full rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none transition-all ${isDark ? "bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:border-white/20" : "bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-400"}`}
              />
            </div>
            {(leadsQuery.isLoading || accountsQueryMain.isLoading) ? (
              <div className="flex items-center justify-center py-24">
                <div className={`w-8 h-8 border-2 rounded-full animate-spin ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-600"}`} />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-24">
                <UserCheck size={36} className={`mx-auto mb-4 ${isDark ? "text-white/15" : "text-gray-300"}`} />
                <p className={`text-base font-medium ${isDark ? "text-white/35" : "text-gray-500"}`}>No customers yet</p>
                <p className={`text-sm mt-2 ${isDark ? "text-white/20" : "text-gray-400"}`}>Clients added in Billing or leads marked "Won" will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCustomers.map((customer) => {
                  const isExpanded = expandedId === customer.id;
                  return (
                    <div
                      key={customer.id}
                      className={`rounded-xl border overflow-hidden transition-all ${isDark ? "border-emerald-500/15 bg-emerald-500/5 hover:border-emerald-500/25" : "border-emerald-200 bg-emerald-50 hover:border-emerald-300"}`}
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        {/* Avatar with customer badge */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${isDark ? "bg-gradient-to-br from-emerald-500/30 to-emerald-500/15 text-emerald-300" : "bg-emerald-100 text-emerald-700"}`}>
                            {customer.businessName.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                            <CheckCircle2 size={9} className="text-white" />
                          </div>
                        </div>

                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : customer.id)}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{customer.businessName}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border-emerald-300"}`}>
                              CUSTOMER
                            </span>
                            {customer.source === "billing" ? (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${isDark ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-blue-100 text-blue-700 border-blue-300"}`}>BILLING</span>
                            ) : (
                              <span className={`text-xs ${isDark ? "text-white/35" : "text-gray-500"}`}>{customer.businessType}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className={`text-xs flex items-center gap-1 ${isDark ? "text-white/35" : "text-gray-500"}`}><Mail size={10} />{customer.email}</span>
                            <span className={`text-xs flex items-center gap-1 ${isDark ? "text-white/35" : "text-gray-500"}`}><Phone size={10} />{customer.phone}</span>
                            <span className={`text-xs flex items-center gap-1 ${isDark ? "text-white/25" : "text-gray-400"}`}><CreditCard size={10} />{customer.monthlyPrice}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                            customer.status === "active" || customer.status === "won"
                              ? isDark ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-300" : "bg-emerald-100 border border-emerald-300 text-emerald-700"
                              : customer.status === "past_due"
                              ? isDark ? "bg-red-500/15 border border-red-500/25 text-red-300" : "bg-red-100 border border-red-300 text-red-700"
                              : isDark ? "bg-white/8 border border-white/10 text-white/50" : "bg-gray-100 border border-gray-300 text-gray-600"
                          }`}>
                            {customer.status === "won" ? "Won" : customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                          </span>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : customer.id)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isDark ? "text-white/20 hover:text-white/60" : "text-gray-400 hover:text-gray-700"}`}
                          >
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className={`border-t px-4 py-4 ${isDark ? "border-emerald-500/10 bg-white/2" : "border-emerald-100 bg-white"}`}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {customer.websiteUrl && (
                              <DetailItem icon={Globe} label="Website" value={customer.websiteUrl} isLink />
                            )}
                            {customer.source === "billing" ? (
                              <DetailItem icon={DollarSign} label="Monthly Price" value={customer.monthlyPrice} />
                            ) : (
                              <DetailItem icon={DollarSign} label="Budget" value={customer.budget ?? "Not specified"} />
                            )}
                            {customer.timeline && (
                              <DetailItem icon={Clock} label="Timeline" value={customer.timeline} />
                            )}
                            {customer.primaryGoal && (
                              <div className="md:col-span-2 lg:col-span-3">
                                <DetailItem icon={TrendingUp} label="Primary Goal" value={customer.primaryGoal} multiline />
                              </div>
                            )}
                          </div>
                          <div className={`flex gap-2 mt-4 pt-3 border-t flex-wrap ${isDark ? "border-white/8" : "border-gray-100"}`}>
                            <a
                              href={`mailto:${customer.email}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 hover:bg-emerald-500/25 transition-all text-xs font-medium"
                            >
                              <Mail size={12} /> Email Customer
                            </a>
                            <a
                              href={`tel:${customer.phone}`}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium ${isDark ? "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10" : "bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-200"}`}
                            >
                              <Phone size={12} /> Call
                            </a>
                            {customer.phone && (
                              <SmsButton
                                contactName={customer.businessName ?? customer.email}
                                contactPhone={customer.phone}
                              />
                            )}
                            <button
                              onClick={() => {
                                // Pre-fill the new project form with this customer's data
                                setNewProject({
                                  clientName: customer.businessName ?? "",
                                  clientEmail: customer.email ?? "",
                                  clientPhone: customer.phone ?? "",
                                  businessName: customer.businessName ?? "",
                                  packageName: "",
                                  setupFee: "",
                                  monthlyPrice: customer.source === "billing" ? customer.monthlyPrice.replace(/[^0-9]/g, "") : "",
                                  estimatedLaunchDate: "",
                                  websiteDomain: customer.websiteUrl ?? "",
                                });
                                setActiveTab("projects");
                                setShowNewProjectForm(true);
                                setExpandedId(null);
                                // Scroll to top so the form is visible
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${isDark ? "bg-blue-500/15 border border-blue-500/25 text-blue-300 hover:bg-blue-500/25" : "bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100"}`}
                            >
                              <FolderPlus size={12} /> Create Project
                            </button>
                            {customer.source === "billing" && (() => {
                              const acctId = parseInt(customer.id.replace("acct-", ""), 10);
                              return (
                                <button
                                  onClick={() => setPagesCustomerAccountId(pagesCustomerAccountId === acctId ? null : acctId)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                                    pagesCustomerAccountId === acctId
                                      ? isDark ? "bg-indigo-500/30 border border-indigo-500/50 text-indigo-200" : "bg-indigo-100 border border-indigo-300 text-indigo-700"
                                      : isDark ? "bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/25" : "bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                                  }`}
                                >
                                  <FileText size={12} /> {pagesCustomerAccountId === acctId ? "Hide Pages" : "Manage Pages"}
                                </button>
                              );
                            })()}
                          </div>
                          {customer.source === "billing" && pagesCustomerAccountId === parseInt(customer.id.replace("acct-", ""), 10) && (
                            <AdminPagesPanel
                              isDark={isDark}
                              clientAccountId={parseInt(customer.id.replace("acct-", ""), 10)}
                              clientName={customer.businessName}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ─── BUDGET QUOTES TAB ─────────────────────────────────────────────── */}
        {activeTab === "quotes" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total Quotes", value: (quotesQuery.data ?? []).length, icon: ClipboardList, color: "text-blue-400" },
                { label: "New Quotes", value: (quotesQuery.data ?? []).filter((q) => q.status === "new").length, icon: Clock, color: "text-yellow-400" },
                { label: "Won", value: (quotesQuery.data ?? []).filter((q) => q.status === "won").length, icon: CheckCircle2, color: "text-green-400" },
                { label: "Avg Monthly", value: `$${Math.round((quotesQuery.data ?? []).reduce((s, q) => s + q.monthlyPrice, 0) / Math.max((quotesQuery.data ?? []).length, 1))}`, icon: DollarSign, color: "text-purple-400" },
              ].map((stat) => (
                <div key={stat.label} className={`rounded-xl p-4 ${isDark ? "bg-white/4 border border-white/8" : "bg-white border border-gray-200 shadow-sm"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-white/40" : "text-gray-500"}`}>{stat.label}</span>
                    <stat.icon size={14} className={stat.color} />
                  </div>
                  <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`} style={{ fontFamily: "var(--font-display)" }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {quotesQuery.isLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className={`w-8 h-8 border-2 rounded-full animate-spin ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-600"}`} />
              </div>
            ) : (quotesQuery.data ?? []).length === 0 ? (
              <div className="text-center py-24">
                <DollarSign size={36} className={`mx-auto mb-4 ${isDark ? "text-white/15" : "text-gray-300"}`} />
                <p className={`text-base font-medium ${isDark ? "text-white/35" : "text-gray-500"}`}>No budget quotes yet</p>
                <p className={`text-sm mt-2 ${isDark ? "text-white/20" : "text-gray-400"}`}>Quotes saved from the Budget Wizard will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(quotesQuery.data ?? []).map((quote) => {
                  const isExpanded = expandedQuoteId === quote.id;
                  const qStatus = QUOTE_STATUS_CONFIG[quote.status as QuoteStatus] ?? QUOTE_STATUS_CONFIG.new;
                  const buildRange = quote.buildCostMin === quote.buildCostMax
                    ? `$${quote.buildCostMin.toLocaleString()}`
                    : `$${quote.buildCostMin.toLocaleString()} – $${quote.buildCostMax.toLocaleString()}`;
                  const addons = [
                    ...JSON.parse(quote.coreAddons || "[]"),
                    ...JSON.parse(quote.autoAddons || "[]"),
                    ...JSON.parse(quote.industryAddons || "[]"),
                  ] as string[];
                  return (
                    <div key={quote.id} className={`rounded-xl border overflow-hidden transition-all ${isDark ? "bg-white/3 border-white/8 hover:border-white/15" : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"}`}>
                      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedQuoteId(isExpanded ? null : quote.id)}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${isDark ? "bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 text-yellow-300" : "bg-yellow-50 text-yellow-700"}`}>
                          {(quote.prospectName ?? quote.industry ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{quote.prospectName ?? "Anonymous"}</span>
                            <span className={`text-xs ${isDark ? "text-white/25" : "text-gray-300"}`}>·</span>
                            <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>{quote.industry}</span>
                            <span className={`text-xs ${isDark ? "text-white/25" : "text-gray-300"}`}>·</span>
                            <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>{quote.basePackage}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className="text-yellow-500 text-xs font-bold">{buildRange}</span>
                            <span className="text-[oklch(0.5_0.2_25)] text-xs font-bold">${quote.monthlyPrice}/mo</span>
                            {quote.prospectEmail && <span className={`text-xs flex items-center gap-1 ${isDark ? "text-white/35" : "text-gray-500"}`}><Mail size={10} />{quote.prospectEmail}</span>}
                            <span className={`text-xs flex items-center gap-1 ${isDark ? "text-white/25" : "text-gray-400"}`}><Calendar size={10} />{formatDate(quote.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <select
                              value={quote.status}
                              onChange={(e) => updateQuoteStatus.mutate({ id: quote.id, status: e.target.value as QuoteStatus })}
                              className={`text-xs font-medium px-2.5 py-1 rounded-lg border appearance-none cursor-pointer pr-6 ${qStatus.color} bg-transparent focus:outline-none`}
                            >
                              {Object.entries(QUOTE_STATUS_CONFIG).map(([key, { label }]) => (
                                <option key={key} value={key} className="bg-white text-gray-900">{label}</option>
                              ))}
                            </select>
                            <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                          </div>
                          <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""} ${isDark ? "text-white/25" : "text-gray-400"}`} />
                        </div>
                      </div>
                      {isExpanded && (
                        <div className={`border-t p-4 ${isDark ? "border-white/8 bg-white/2" : "border-gray-100 bg-gray-50"}`}>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            <DetailItem icon={DollarSign} label="Build Cost" value={buildRange} />
                            <DetailItem icon={RefreshCw} label="Monthly Plan" value={`${quote.subscriptionTier} — $${quote.monthlyPrice}/mo`} />
                            <DetailItem icon={Calendar} label="Payment Plan" value={quote.paymentPlan === "full" ? "Pay in Full" : quote.paymentPlan === "6mo" ? "6-Month Plan" : "12-Month Plan"} />
                          </div>
                          {addons.length > 0 && (
                            <div className="mb-3">
                              <p className={`text-xs uppercase tracking-wider mb-2 ${isDark ? "text-white/35" : "text-gray-400"}`}>Add-ons ({addons.length})</p>
                              <div className="flex flex-wrap gap-1.5">
                                {addons.map((a) => (
                                  <span key={a} className={`text-xs px-2 py-0.5 rounded-lg border ${isDark ? "bg-white/6 border-white/10 text-white/50" : "bg-gray-100 border-gray-200 text-gray-600"}`}>{a}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className={`flex gap-2 pt-3 border-t flex-wrap ${isDark ? "border-white/8" : "border-gray-100"}`}>
                              {quote.prospectEmail && (
                                <a href={`mailto:${quote.prospectEmail}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[oklch(0.5_0.2_25_/_15%)] border border-[oklch(0.5_0.2_25_/_25%)] text-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.5_0.2_25_/_25%)] transition-all text-xs font-medium">
                                  <Mail size={12} /> Email
                                </a>
                              )}
                              {quote.prospectPhone && (
                                <a href={`tel:${quote.prospectPhone}`} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium ${isDark ? "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10" : "bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-200"}`}>
                                  <Phone size={12} /> Call
                                </a>
                              )}
                              {quote.status !== "won" && (
                                <button
                                  onClick={() => {
                                    setConvertingQuoteId(quote.id);
                                    setQuoteConvertForm({
                                      clientName: quote.prospectName ?? "",
                                      clientEmail: quote.prospectEmail ?? "",
                                      clientPhone: quote.prospectPhone ?? "",
                                      businessName: quote.prospectName ?? quote.industry,
                                      websiteUrl: "",
                                      monthlyPriceCents: quote.monthlyPrice * 100,
                                      billingStartDate: new Date().toISOString().slice(0, 10),
                                      adminNotes: `Converted from Budget Quote — ${quote.basePackage} (${quote.industry})`,
                                    });
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all text-xs font-semibold"
                                >
                                  <UserPlus size={12} /> Convert to Customer
                                </button>
                              )}
                              {quote.status === "won" && (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500/70 text-xs font-medium">
                                  <CheckCircle2 size={12} /> Converted
                                </span>
                              )}
                            </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── CONVERT QUOTE TO CUSTOMER MODAL ──────────────────────────────── */}
        {convertingQuoteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
            <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDark ? "bg-[oklch(0.1_0.01_260)] border-white/10" : "bg-white border-gray-200"}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>Convert Quote to Customer</h3>
                <button onClick={() => setConvertingQuoteId(null)} className={`text-xs px-2 py-1 rounded-lg ${isDark ? "text-white/40 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}>✕</button>
              </div>
              <div className="space-y-3 mb-4">
                {([
                  { key: "clientName", label: "Client Name *", type: "text", placeholder: "John Smith" },
                  { key: "clientEmail", label: "Client Email *", type: "email", placeholder: "john@example.com" },
                  { key: "clientPhone", label: "Phone", type: "text", placeholder: "+1 555-000-0000" },
                  { key: "businessName", label: "Business Name *", type: "text", placeholder: "Smith Martial Arts" },
                  { key: "websiteUrl", label: "Website URL", type: "text", placeholder: "https://smithmartialarts.com" },
                ] as const).map((field) => (
                  <div key={field.key}>
                    <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={quoteConvertForm[field.key]}
                      onChange={(e) => setQuoteConvertForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                    />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Monthly Price ($)</label>
                    <input
                      type="number"
                      value={quoteConvertForm.monthlyPriceCents / 100}
                      onChange={(e) => setQuoteConvertForm(f => ({ ...f, monthlyPriceCents: Math.round(parseFloat(e.target.value || "0") * 100) }))}
                      className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Billing Start</label>
                    <input
                      type="date"
                      value={quoteConvertForm.billingStartDate}
                      onChange={(e) => setQuoteConvertForm(f => ({ ...f, billingStartDate: e.target.value }))}
                      className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Admin Notes</label>
                  <input
                    type="text"
                    value={quoteConvertForm.adminNotes}
                    onChange={(e) => setQuoteConvertForm(f => ({ ...f, adminNotes: e.target.value }))}
                    className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (!quoteConvertForm.clientName || !quoteConvertForm.clientEmail || !quoteConvertForm.businessName) {
                      toast.error("Client name, email, and business name are required.");
                      return;
                    }
                    convertQuoteToClient.mutate({
                      quoteId: convertingQuoteId,
                      clientName: quoteConvertForm.clientName,
                      clientEmail: quoteConvertForm.clientEmail,
                      clientPhone: quoteConvertForm.clientPhone || undefined,
                      businessName: quoteConvertForm.businessName,
                      websiteUrl: quoteConvertForm.websiteUrl || undefined,
                      monthlyPriceCents: quoteConvertForm.monthlyPriceCents,
                      billingStartDate: quoteConvertForm.billingStartDate || undefined,
                      adminNotes: quoteConvertForm.adminNotes || undefined,
                    });
                  }}
                  disabled={convertQuoteToClient.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-semibold disabled:opacity-50"
                >
                  {convertQuoteToClient.isPending ? "Converting…" : "Convert to Customer"}
                </button>
                <button
                  onClick={() => setConvertingQuoteId(null)}
                  className={`px-4 py-2.5 rounded-xl transition-all text-sm ${isDark ? "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10" : "bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200"}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── CLIENT PROJECTS TAB ───────────────────────────────────────────── */}
        {activeTab === "projects" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Client Projects</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (confirm("Import all customers who don't already have a project? This will create a project for each one.")) {
                      syncFromCustomers.mutate();
                    }
                  }}
                  disabled={syncFromCustomers.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-500/25 transition-all disabled:opacity-50"
                  title="Import all customers who don't have a project yet"
                >
                  {syncFromCustomers.isPending ? (
                    <><Loader2 size={12} className="animate-spin" /> Syncing…</>
                  ) : (
                    <><RefreshCw size={12} /> Sync Customers</>  
                  )}
                </button>
                <button
                  onClick={() => setShowNewProjectForm(!showNewProjectForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[oklch(0.5_0.2_25_/_15%)] border border-[oklch(0.5_0.2_25_/_30%)] text-[oklch(0.65_0.2_25)] text-xs font-semibold hover:bg-[oklch(0.5_0.2_25_/_25%)] transition-all"
                >
                  + New Project
                </button>
              </div>
            </div>

            {showNewProjectForm && (
              <div className={`mb-5 p-5 rounded-xl border ${isDark ? "bg-white/4 border-white/10" : "bg-white border-gray-200 shadow-sm"}`}>
                <h3 className={`font-semibold mb-4 text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Create New Client Project</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {([
                    { key: "clientName", label: "Client Name *", placeholder: "John Smith" },
                    { key: "clientEmail", label: "Client Email *", placeholder: "john@example.com" },
                    { key: "clientPhone", label: "Phone", placeholder: "+1 555-000-0000" },
                    { key: "businessName", label: "Business Name *", placeholder: "Smith Martial Arts" },
                    { key: "websiteDomain", label: "Website Domain", placeholder: "smithmartialarts.com" },
                    { key: "packageName", label: "Package", placeholder: "Growth" },
                    { key: "setupFee", label: "One-Time Setup Fee ($)", placeholder: "3499" },
                    { key: "monthlyPrice", label: "Monthly Retainer ($)", placeholder: "199" },
                    { key: "estimatedLaunchDate", label: "Est. Launch Date", placeholder: "2026-04-15" },
                  ] as const).map((field) => (
                    <div key={field.key}>
                      <label className={`block text-[10px] mb-1 uppercase tracking-wider ${isDark ? "text-white/40" : "text-gray-500"}`}>{field.label}</label>
                      <input
                        type="text"
                        value={newProject[field.key]}
                        onChange={(e) => setNewProject((p) => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:border-white/20" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-400"}`}
                      />
                    </div>
                  ))}
                </div>
                {newProjectError && <p className="text-red-400 text-xs mb-3">{newProjectError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNewProjectError("");
                      if (!newProject.clientName || !newProject.clientEmail || !newProject.businessName) {
                        setNewProjectError("Client name, email, and business name are required.");
                        return;
                      }
                      createProject.mutate({
                        clientName: newProject.clientName,
                        clientEmail: newProject.clientEmail,
                        clientPhone: newProject.clientPhone || undefined,
                        businessName: newProject.businessName,
                        websiteDomain: newProject.websiteDomain || undefined,
                        packageName: newProject.packageName || undefined,
                        setupFee: newProject.setupFee ? parseInt(newProject.setupFee) : undefined,
                        monthlyPrice: newProject.monthlyPrice ? parseInt(newProject.monthlyPrice) : undefined,
                        estimatedLaunchDate: newProject.estimatedLaunchDate || undefined,
                      }, {
                        onSuccess: (data) => {
                          setShowNewProjectForm(false);
                          setNewProject({ clientName: "", clientEmail: "", clientPhone: "", businessName: "", packageName: "", setupFee: "", monthlyPrice: "", estimatedLaunchDate: "", websiteDomain: "" });
                          alert(`Project created!\n\nClient access token:\n${data.accessToken}\n\nShare this link with the client:\nhttps://flow-sites.com/portal?token=${data.accessToken}`);
                        },
                      });
                    }}
                    disabled={createProject.isPending}
                    className="px-4 py-2 rounded-lg bg-[oklch(0.5_0.2_25)] text-white text-sm font-semibold hover:bg-[oklch(0.55_0.22_25)] transition-all disabled:opacity-50"
                  >
                    {createProject.isPending ? "Creating…" : "Create Project"}
                  </button>
                  <button onClick={() => setShowNewProjectForm(false)} className={`px-4 py-2 rounded-lg text-sm transition-all ${isDark ? "bg-white/5 text-white/50 hover:bg-white/10" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {projectsQuery.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className={`w-8 h-8 border-2 rounded-full animate-spin ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-600"}`} />
              </div>
            ) : (projectsQuery.data ?? []).length === 0 ? (
              <div className={`text-center py-16 text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}>No client projects yet. Create one above.</div>
            ) : (
              <div className="space-y-2">
                {(projectsQuery.data ?? []).map((proj) => {
                  const isExpanded = expandedProjectId === proj.id;
                  const STAGE_LABELS = ["Onboarding","Design","Development","Review","Revisions","Launch","Maintenance"];
                  return (
                    <div key={proj.id} className={`rounded-xl border overflow-hidden ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200 shadow-sm"}`}>
                      <button
                        className={`w-full p-4 text-left flex items-start justify-between gap-4 transition-all ${isDark ? "hover:bg-white/2" : "hover:bg-gray-50"}`}
                        onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{proj.businessName}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 border border-blue-500/25 capitalize">{proj.status}</span>
                          </div>
                          <p className={`text-xs ${isDark ? "text-white/35" : "text-gray-500"}`}>{proj.clientName} · {proj.clientEmail}</p>
                          <p className={`text-xs mt-0.5 ${isDark ? "text-white/25" : "text-gray-400"}`}>Stage: {STAGE_LABELS[proj.currentStage ?? 0]} ({proj.stageProgress ?? 0}%)</p>
                        </div>
                        <div className={`text-xs flex-shrink-0 ${isDark ? "text-white/25" : "text-gray-400"}`}>{new Date(proj.createdAt).toLocaleDateString()}</div>
                      </button>
                      {isExpanded && (
                        <div className={`px-4 pb-4 border-t pt-4 space-y-3 ${isDark ? "border-white/8" : "border-gray-100 bg-gray-50"}`}>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <div>
                              <label className={`block text-[10px] mb-1 ${isDark ? "text-white/35" : "text-gray-500"}`}>Stage</label>
                              <select value={proj.currentStage ?? 0} onChange={(e) => updateProject.mutate({ id: proj.id, currentStage: parseInt(e.target.value) })} className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}>
                                {STAGE_LABELS.map((s, i) => <option key={i} value={i}>{s}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className={`block text-[10px] mb-1 ${isDark ? "text-white/35" : "text-gray-500"}`}>Progress %</label>
                              <input type="number" min={0} max={100} defaultValue={proj.stageProgress ?? 0} onBlur={(e) => updateProject.mutate({ id: proj.id, stageProgress: parseInt(e.target.value) || 0 })} className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`} />
                            </div>
                            <div>
                              <label className={`block text-[10px] mb-1 ${isDark ? "text-white/35" : "text-gray-500"}`}>Status</label>
                              <select value={proj.status} onChange={(e) => updateProject.mutate({ id: proj.id, status: e.target.value as any })} className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}>
                                {["onboarding","design","development","review","revisions","launch","maintenance","paused"].map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className={`block text-[10px] mb-1 ${isDark ? "text-white/35" : "text-gray-500"}`}>Live Site URL (Deployment)</label>
                              <input type="text" defaultValue={proj.websiteDomain ?? ""} onBlur={(e) => updateProject.mutate({ id: proj.id, websiteDomain: e.target.value || undefined })} placeholder="https://stylistfactory.com" className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`} />
                              {proj.websiteDomain && (
                                <a href={proj.websiteDomain.startsWith('http') ? proj.websiteDomain : `https://${proj.websiteDomain}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline mt-0.5 inline-block">↗ Open live site</a>
                              )}
                            </div>
                            <div>
                              <label className={`block text-[10px] mb-1 ${isDark ? "text-white/35" : "text-gray-500"}`}>Preview URL</label>
                              <input type="text" defaultValue={proj.previewUrl ?? ""} onBlur={(e) => updateProject.mutate({ id: proj.id, previewUrl: e.target.value || undefined })} placeholder="https://preview.example.com" className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`} />
                              {proj.previewUrl && (
                                <a href={proj.previewUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline mt-0.5 inline-block">↗ Open preview</a>
                              )}
                            </div>
                          </div>
                          {/* GitHub Repositories Section */}
                          <div className={`rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"}`}>
                            <button
                              type="button"
                              onClick={() => {
                                const isOpen = reposExpanded[proj.id];
                                if (!isOpen && !reposEditing[proj.id]) {
                                  // Initialize from project data
                                  let repos: { label: string; url: string }[] = [];
                                  try { repos = proj.githubRepos ? JSON.parse(proj.githubRepos) : []; } catch {}
                                  setReposEditing(prev => ({ ...prev, [proj.id]: repos }));
                                }
                                setReposExpanded(prev => ({ ...prev, [proj.id]: !isOpen }));
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-2 text-[11px] font-medium ${isDark ? "text-white/60 hover:text-white/80" : "text-gray-600 hover:text-gray-800"}`}
                            >
                              <span className="flex items-center gap-1.5"><Github size={12} /> GitHub Repositories {reposEditing[proj.id]?.length ? `(${reposEditing[proj.id].length})` : proj.githubRepos ? `(${(() => { try { return JSON.parse(proj.githubRepos).length; } catch { return 0; } })()})` : ""}</span>
                              <ChevronDown size={12} className={`transition-transform ${reposExpanded[proj.id] ? "rotate-180" : ""}`} />
                            </button>
                            {reposExpanded[proj.id] && (
                              <div className={`px-2.5 pb-2.5 border-t ${isDark ? "border-white/8" : "border-gray-100"}`}>
                                <div className="space-y-1.5 mt-2">
                                  {(reposEditing[proj.id] ?? []).map((repo, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        value={repo.label}
                                        onChange={(e) => setReposEditing(prev => {
                                          const arr = [...(prev[proj.id] ?? [])];
                                          arr[idx] = { ...arr[idx], label: e.target.value };
                                          return { ...prev, [proj.id]: arr };
                                        })}
                                        placeholder="Label (e.g. Admin Panel)"
                                        className={`flex-1 rounded px-2 py-1 text-[11px] focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                                      />
                                      <input
                                        type="text"
                                        value={repo.url}
                                        onChange={(e) => setReposEditing(prev => {
                                          const arr = [...(prev[proj.id] ?? [])];
                                          arr[idx] = { ...arr[idx], url: e.target.value };
                                          return { ...prev, [proj.id]: arr };
                                        })}
                                        placeholder="https://github.com/org/repo"
                                        className={`flex-[2] rounded px-2 py-1 text-[11px] focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setReposEditing(prev => {
                                          const arr = (prev[proj.id] ?? []).filter((_, i) => i !== idx);
                                          return { ...prev, [proj.id]: arr };
                                        })}
                                        className={`p-1 rounded ${isDark ? "text-red-400/60 hover:text-red-400" : "text-red-400 hover:text-red-600"}`}
                                      ><Minus size={12} /></button>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    type="button"
                                    onClick={() => setReposEditing(prev => ({
                                      ...prev,
                                      [proj.id]: [...(prev[proj.id] ?? []), { label: "", url: "" }]
                                    }))}
                                    className={`flex items-center gap-1 text-[11px] ${isDark ? "text-emerald-400/70 hover:text-emerald-400" : "text-emerald-600 hover:text-emerald-700"}`}
                                  ><PlusSquare size={12} /> Add Repo</button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const repos = reposEditing[proj.id] ?? [];
                                      const cleaned = repos.filter(r => r.label.trim() || r.url.trim());
                                      updateProject.mutate({ id: proj.id, githubRepos: JSON.stringify(cleaned) });
                                      toast.success("GitHub repos saved!");
                                    }}
                                    className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded ${isDark ? "bg-blue-500/15 text-blue-300 border border-blue-500/25 hover:bg-blue-500/25" : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"}`}
                                  ><Save size={12} /> Save Repos</button>
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <label className={`block text-[10px] mb-1 ${isDark ? "text-white/35" : "text-gray-500"}`}>Message to Client</label>
                            <textarea defaultValue={proj.clientMessage ?? ""} onBlur={(e) => updateProject.mutate({ id: proj.id, clientMessage: e.target.value || undefined })} placeholder="Shown on the client's portal dashboard" rows={2} className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none resize-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`} />
                          </div>
                          {/* Action buttons */}
                          <div className={`pt-2 border-t flex flex-wrap gap-2 ${isDark ? "border-white/8" : "border-gray-100"}`}>
                            {proj.clientPhone ? (
                              <button
                                onClick={() => resendWelcomeSms.mutate({ projectId: proj.id })}
                                disabled={resendWelcomeSms.isPending}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  isDark
                                    ? "bg-purple-500/15 text-purple-300 border border-purple-500/25 hover:bg-purple-500/25 disabled:opacity-50"
                                    : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 disabled:opacity-50"
                                }`}
                              >
                                <Smartphone size={12} />
                                {resendWelcomeSms.isPending ? "Sending…" : "Resend Welcome SMS"}
                              </button>
                            ) : (
                              <span className={`text-[10px] italic ${isDark ? "text-white/25" : "text-gray-400"}`}>No phone on file — SMS unavailable</span>
                            )}
                            {proj.clientEmail && (
                              <button
                                onClick={() => sendPortalInvite.mutate({ clientEmail: proj.clientEmail!, clientName: proj.clientName ?? undefined, origin: window.location.origin })}
                                disabled={sendPortalInvite.isPending}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  isDark
                                    ? "bg-blue-500/15 text-blue-300 border border-blue-500/25 hover:bg-blue-500/25 disabled:opacity-50"
                                    : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50"
                                }`}
                              >
                                <Mail size={12} />
                                {sendPortalInvite.isPending ? "Sending…" : "Send Portal Invite"}
                              </button>
                            )}
                            <button
                              onClick={() => generateImpersonationToken.mutate({ projectId: proj.id })}
                              disabled={generateImpersonationToken.isPending}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isDark
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-50"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"
                              }`}
                            >
                              <Eye size={12} />
                              {generateImpersonationToken.isPending ? "Opening…" : "View Client Portal"}
                            </button>
                          </div>
                          <div className={`pt-2 border-t ${isDark ? "border-white/8" : "border-gray-100"}`}>
                            <p className={`text-[10px] ${isDark ? "text-white/25" : "text-gray-400"}`}>Access token: <span className={`font-mono ${isDark ? "text-white/40" : "text-gray-600"}`}>{proj.accessToken}</span></p>
                            {proj.accessToken && (
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className={`text-[10px] ${isDark ? "text-white/25" : "text-gray-400"}`}>Portal link:</p>
                                <a
                                  href={`https://flow-sites.com/portal?token=${proj.accessToken}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-[oklch(0.5_0.2_25)] hover:underline font-mono truncate max-w-[220px]"
                                >
                                  flow-sites.com/portal?token={proj.accessToken}
                                </a>
                                <button
                                  onClick={() => { navigator.clipboard.writeText(`https://flow-sites.com/portal?token=${proj.accessToken}`); toast.success('Portal link copied!'); }}
                                  className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? "bg-white/8 text-white/50 hover:bg-white/15" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                  title="Copy portal link"
                                >
                                  Copy
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── CHANGE REQUESTS TAB ───────────────────────────────────────────── */}
        {activeTab === "changes" && (
          <div>
            <h2 className={`font-bold mb-5 ${isDark ? "text-white" : "text-gray-900"}`}>Client Change Requests</h2>
            {changeRequestsQuery.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className={`w-8 h-8 border-2 rounded-full animate-spin ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-600"}`} />
              </div>
            ) : (changeRequestsQuery.data ?? []).length === 0 ? (
              <div className={`text-center py-16 text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}>No change requests yet.</div>
            ) : (
              <div className="space-y-2">
                {(changeRequestsQuery.data ?? []).map((req) => {
                  const isExpanded = expandedChangeId === req.id;
                  const PRIORITY_COLORS: Record<string, string> = {
                    low: "bg-blue-500/15 text-blue-300 border-blue-500/25",
                    medium: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
                    high: "bg-red-500/15 text-red-300 border-red-500/25",
                  };
                  const CR_STATUS_COLORS: Record<string, string> = {
                    pending: "bg-gray-500/15 text-gray-300 border-gray-500/25",
                    in_review: "bg-blue-500/15 text-blue-300 border-blue-500/25",
                    approved: "bg-green-500/15 text-green-300 border-green-500/25",
                    in_progress: "bg-purple-500/15 text-purple-300 border-purple-500/25",
                    completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
                    declined: "bg-red-500/15 text-red-300 border-red-500/25",
                  };
                  return (
                    <div key={req.id} className={`rounded-xl border overflow-hidden ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200 shadow-sm"}`}>
                      <button className={`w-full p-4 text-left flex items-start justify-between gap-4 transition-all ${isDark ? "hover:bg-white/2" : "hover:bg-gray-50"}`} onClick={() => setExpandedChangeId(isExpanded ? null : req.id)}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${CR_STATUS_COLORS[req.status] ?? CR_STATUS_COLORS.pending}`}>{req.status.replace("_", " ")}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[req.priority] ?? PRIORITY_COLORS.medium}`}>{req.priority}</span>
                          </div>
                          <p className={`font-medium text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>{req.title}</p>
                          <p className={`text-xs mt-0.5 ${isDark ? "text-white/35" : "text-gray-500"}`}>{req.project?.businessName ?? "Unknown"} · {req.clientName ?? "Client"}</p>
                        </div>
                        <div className={`text-xs flex-shrink-0 ${isDark ? "text-white/25" : "text-gray-400"}`}>{new Date(req.createdAt).toLocaleDateString()}</div>
                      </button>
                      {isExpanded && (
                        <div className={`px-4 pb-4 border-t pt-4 space-y-3 ${isDark ? "border-white/8" : "border-gray-100 bg-gray-50"}`}>
                          <div>
                            <p className={`text-[10px] mb-1 ${isDark ? "text-white/35" : "text-gray-500"}`}>Description</p>
                            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? "text-white/70" : "text-gray-700"}`}>{req.description}</p>
                          </div>
                          {req.pageSection && <p className={`text-xs ${isDark ? "text-white/35" : "text-gray-500"}`}>Section: {req.pageSection}</p>}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className={`block text-[10px] mb-1 ${isDark ? "text-white/35" : "text-gray-500"}`}>Status</label>
                              <select value={req.status} onChange={(e) => updateChangeRequest.mutate({ id: req.id, status: e.target.value as any })} className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}>
                                {["pending","in_review","approved","in_progress","completed","declined"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className={`block text-[10px] mb-1 ${isDark ? "text-white/35" : "text-gray-500"}`}>Est. Hours</label>
                              <input type="number" min={0} defaultValue={req.estimatedHours ?? ""} onBlur={(e) => updateChangeRequest.mutate({ id: req.id, estimatedHours: parseInt(e.target.value) || undefined })} className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`} />
                            </div>
                          </div>
                          <div>
                            <label className={`block text-[10px] mb-1 ${isDark ? "text-white/35" : "text-gray-500"}`}>Response to Client</label>
                            <textarea defaultValue={req.adminResponse ?? ""} onBlur={(e) => updateChangeRequest.mutate({ id: req.id, adminResponse: e.target.value || undefined })} placeholder="This message will be shown to the client" rows={2} className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none resize-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── FEATURE UPGRADES TAB ──────────────────────────────────────────── */}
        {activeTab === "upgrades" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Feature Upgrade Requests</h2>
              <span className={`text-xs ${isDark ? "text-white/35" : "text-gray-500"}`}>{(upgradeRequestsQuery.data ?? []).length} total</span>
            </div>
            {upgradeRequestsQuery.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className={`w-6 h-6 border-2 rounded-full animate-spin ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-600"}`} />
              </div>
            ) : (upgradeRequestsQuery.data ?? []).length === 0 ? (
              <div className={`text-center py-16 text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}>No upgrade requests yet.</div>
            ) : (
              (upgradeRequestsQuery.data ?? []).map((req: any) => {
                const isExpanded = expandedUpgradeId === req.id;
                const UPGRADE_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
                  pending:     { label: "Pending Review",  color: "bg-gray-500/15 text-gray-300 border-gray-500/25" },
                  quoted:      { label: "Quoted",          color: "bg-blue-500/15 text-blue-300 border-blue-500/25" },
                  approved:    { label: "Approved",        color: "bg-green-500/15 text-green-300 border-green-500/25" },
                  in_progress: { label: "In Progress",     color: "bg-purple-500/15 text-purple-300 border-purple-500/25" },
                  completed:   { label: "Completed",       color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
                  declined:    { label: "Declined",        color: "bg-red-500/15 text-red-300 border-red-500/25" },
                };
                const statusCfg = UPGRADE_STATUS_CONFIG[req.status] ?? UPGRADE_STATUS_CONFIG.pending;
                return (
                  <div key={req.id} className={`rounded-xl border overflow-hidden ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200 shadow-sm"}`}>
                    <button className={`w-full p-4 text-left flex items-start justify-between gap-4 transition-all ${isDark ? "hover:bg-white/2" : "hover:bg-gray-50"}`} onClick={() => setExpandedUpgradeId(isExpanded ? null : req.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusCfg.color}`}>{statusCfg.label}</span>
                          <span className="text-xs text-yellow-500 font-semibold">${req.featurePrice}</span>
                        </div>
                        <p className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{req.featureLabel}</p>
                        <p className={`text-xs mt-0.5 ${isDark ? "text-white/35" : "text-gray-500"}`}>{req.businessName ?? "Unknown"} · {new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                      <ChevronDown size={14} className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""} ${isDark ? "text-white/25" : "text-gray-400"}`} />
                    </button>
                    {isExpanded && (
                      <div className={`px-4 pb-4 border-t pt-4 space-y-3 ${isDark ? "border-white/8" : "border-gray-100 bg-gray-50"}`}>
                        {req.clientNotes && (
                          <div>
                            <p className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${isDark ? "text-white/35" : "text-gray-500"}`}>Client Notes</p>
                            <p className={`text-sm leading-relaxed ${isDark ? "text-white/70" : "text-gray-700"}`}>{req.clientNotes}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={`block text-[10px] mb-1 ${isDark ? "text-white/35" : "text-gray-500"}`}>Status</label>
                            <select value={req.status} onChange={e => updateUpgradeRequest.mutate({ id: req.id, status: e.target.value as any })} className={`w-full rounded-lg px-2.5 py-1.5 text-sm focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}>
                              {["pending","quoted","approved","in_progress","completed","declined"].map(s => (
                                <option key={s} value={s}>{UPGRADE_STATUS_CONFIG[s]?.label ?? s}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={`block text-[10px] mb-1 ${isDark ? "text-white/35" : "text-gray-500"}`}>Agreed Price ($)</label>
                            <input type="number" defaultValue={req.agreedPrice ?? req.featurePrice} onBlur={e => updateUpgradeRequest.mutate({ id: req.id, agreedPrice: Number(e.target.value) })} className={`w-full rounded-lg px-2.5 py-1.5 text-sm focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`} />
                          </div>
                        </div>
                        <div>
                          <label className={`block text-[10px] mb-1 ${isDark ? "text-white/35" : "text-gray-500"}`}>Response to Client</label>
                          <textarea defaultValue={req.adminResponse ?? ""} onBlur={e => updateUpgradeRequest.mutate({ id: req.id, adminResponse: e.target.value })} rows={2} placeholder="e.g. We've reviewed your request and the agreed price is $X." className={`w-full rounded-lg px-2.5 py-1.5 text-sm focus:outline-none resize-none ${isDark ? "bg-white/5 border border-white/10 text-white placeholder:text-white/25" : "bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400"}`} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ─── MESSAGES TAB ──────────────────────────────────────────────────── */}
        {activeTab === "billing" && (
          <AdminBillingPanel isDark={isDark} />
        )}
        {/* ─── INVOICES TAB ──────────────────────────────────────────────────── */}
        {activeTab === "invoices" && (
          <AdminInvoicesPanel isDark={isDark} />
        )}
        {/* ─── TEAM TAB ──────────────────────────────────────────────────────── */}
        {activeTab === "team" && (
          <div className="space-y-4">
            {/* Header */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200"}`}>
              <div>
                <h2 className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Sales Team</h2>
                <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>Invite reps and track 15% first-payment commissions</p>
              </div>
              <button
                onClick={() => setShowInviteForm(true)}
                className="px-4 py-2 rounded-lg bg-[oklch(0.5_0.2_25)] text-white text-xs font-semibold hover:bg-[oklch(0.55_0.22_25)] transition-colors"
              >
                + Invite Team Member
              </button>
            </div>

            {/* Invite Form */}
            {showInviteForm && (
              <div className={`p-4 rounded-xl border ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200"}`}>
                <h3 className={`text-xs font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Invite New Team Member</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-[10px] font-medium mb-1 block ${isDark ? "text-white/50" : "text-gray-500"}`}>Name *</label>
                    <input
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Full name"
                      className={`w-full px-3 py-2 rounded-lg text-xs border ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/25" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] font-medium mb-1 block ${isDark ? "text-white/50" : "text-gray-500"}`}>Email *</label>
                    <input
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="rep@example.com"
                      className={`w-full px-3 py-2 rounded-lg text-xs border ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/25" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] font-medium mb-1 block ${isDark ? "text-white/50" : "text-gray-500"}`}>Role</label>
                    <select
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm(p => ({ ...p, role: e.target.value as typeof inviteForm.role }))}
                      className={`w-full px-3 py-2 rounded-lg text-xs border ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                    >
                      <option value="sales_rep">Sales Rep</option>
                      <option value="technician">Technician</option>
                      <option value="manager">Manager</option>
                      <option value="team_lead">Team Lead</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-[10px] font-medium mb-1 block ${isDark ? "text-white/50" : "text-gray-500"}`}>Commission Rate (%)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={inviteForm.commissionRate}
                      onChange={(e) => setInviteForm(p => ({ ...p, commissionRate: Number(e.target.value) }))}
                      className={`w-full px-3 py-2 rounded-lg text-xs border ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={`text-[10px] font-medium mb-1 block ${isDark ? "text-white/50" : "text-gray-500"}`}>Notes (optional)</label>
                    <input
                      value={inviteForm.notes}
                      onChange={(e) => setInviteForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Internal notes..."
                      className={`w-full px-3 py-2 rounded-lg text-xs border ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/25" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => inviteTechMutation.mutate(inviteForm)}
                    disabled={inviteTechMutation.isPending || !inviteForm.name || !inviteForm.email}
                    className="px-4 py-2 rounded-lg bg-[oklch(0.5_0.2_25)] text-white text-xs font-semibold hover:bg-[oklch(0.55_0.22_25)] disabled:opacity-50 transition-colors"
                  >
                    {inviteTechMutation.isPending ? "Sending..." : "Send Invite"}
                  </button>
                  <button
                    onClick={() => setShowInviteForm(false)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border ${isDark ? "border-white/10 text-white/50 hover:text-white" : "border-gray-200 text-gray-500 hover:text-gray-900"}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Sub-tabs */}
            <div className="flex gap-1">
              {(["reps", "commissions"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTeamSubTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    teamSubTab === t
                      ? "bg-[oklch(0.5_0.2_25_/_20%)] text-[oklch(0.7_0.2_25)] border border-[oklch(0.5_0.2_25_/_30%)]"
                      : isDark ? "text-white/40 hover:text-white/70" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "reps" ? "Sales Reps" : "Commissions"}
                </button>
              ))}
            </div>

            {/* Sales Reps list */}
            {teamSubTab === "reps" && (
              <div className="space-y-2">
                {techniciansQuery.isLoading ? (
                  <div className="text-center py-8"><div className={`w-5 h-5 border-2 rounded-full animate-spin mx-auto ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-600"}`} /></div>
                ) : (techniciansQuery.data ?? []).length === 0 ? (
                  <div className={`text-center py-12 rounded-xl border ${isDark ? "border-white/8 text-white/30" : "border-gray-200 text-gray-400"}`}>
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No sales reps yet. Invite your first rep above.</p>
                  </div>
                ) : (
                  (techniciansQuery.data ?? []).map((tech) => (
                    <div key={tech.id} className={`p-4 rounded-xl border ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200"}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-violet-400 text-xs font-bold">{tech.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className={`text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{tech.name}</p>
                            <p className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-500"}`}>{tech.email}</p>
                            {tech.notes && <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}>{tech.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Role badge + change dropdown */}
                          <select
                            value={tech.role ?? "sales_rep"}
                            onChange={(e) => updateTechRoleMutation.mutate({ technicianId: tech.id, role: e.target.value as "sales_rep" | "technician" | "manager" | "team_lead" | "admin" })}
                            className={`text-[9px] px-2 py-0.5 rounded border font-medium cursor-pointer ${
                              tech.role === "admin" ? "bg-red-500/15 text-red-400 border-red-500/25" :
                              tech.role === "team_lead" ? "bg-amber-500/15 text-amber-400 border-amber-500/25" :
                              tech.role === "manager" ? "bg-purple-500/15 text-purple-400 border-purple-500/25" :
                              tech.role === "technician" ? "bg-blue-500/15 text-blue-400 border-blue-500/25" :
                              "bg-violet-500/15 text-violet-400 border-violet-500/25"
                            } ${isDark ? "bg-transparent" : "bg-white"}`}
                          >
                            <option value="sales_rep">Sales Rep</option>
                            <option value="technician">Technician</option>
                            <option value="manager">Manager</option>
                            <option value="team_lead">Team Lead</option>
                            <option value="admin">Admin</option>
                          </select>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${
                            tech.status === "active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" :
                            tech.status === "invited" ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" :
                            "bg-gray-500/15 text-gray-400 border-gray-500/25"
                          }`}>{tech.status}</span>
                          {tech.status !== "inactive" && (
                            <button
                              onClick={() => deactivateTechMutation.mutate({ technicianId: tech.id })}
                              className={`text-[9px] px-2 py-0.5 rounded border ${isDark ? "border-white/10 text-white/30 hover:text-red-400 hover:border-red-500/30" : "border-gray-200 text-gray-400 hover:text-red-500"}`}
                            >Deactivate</button>
                          )}
                          {tech.status !== "active" && (
                            <button
                              onClick={() => resendInviteMutation.mutate({ technicianId: tech.id })}
                              disabled={resendInviteMutation.isPending}
                              className={`text-[9px] px-2 py-0.5 rounded border ${isDark ? "border-blue-500/30 text-blue-400 hover:bg-blue-500/15" : "border-blue-200 text-blue-500 hover:bg-blue-50"}`}
                            >{resendInviteMutation.isPending ? "Sending…" : "Resend Invite"}</button>
                          )}
                        </div>
                      </div>
                      <div className={`grid grid-cols-4 gap-3 mt-3 pt-3 border-t ${isDark ? "border-white/5" : "border-gray-100"}`}>
                        <div>
                          <p className={`text-[9px] uppercase tracking-wider mb-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}>Commission Rate</p>
                          <p className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{tech.commissionRate}%</p>
                        </div>
                        <div>
                          <p className={`text-[9px] uppercase tracking-wider mb-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}>Clients</p>
                          <p className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{tech.clientCount}</p>
                        </div>
                        <div>
                          <p className={`text-[9px] uppercase tracking-wider mb-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}>Pending</p>
                          <p className="text-xs font-bold text-yellow-400">${((tech.totalPending ?? 0) / 100).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className={`text-[9px] uppercase tracking-wider mb-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}>Paid Out</p>
                          <p className="text-xs font-bold text-emerald-400">${((tech.totalPaid ?? 0) / 100).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Commissions list */}
            {teamSubTab === "commissions" && (
              <div className="space-y-2">
                {commissionsQuery.isLoading ? (
                  <div className="text-center py-8"><div className={`w-5 h-5 border-2 rounded-full animate-spin mx-auto ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-600"}`} /></div>
                ) : (commissionsQuery.data ?? []).length === 0 ? (
                  <div className={`text-center py-12 rounded-xl border ${isDark ? "border-white/8 text-white/30" : "border-gray-200 text-gray-400"}`}>
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No commissions yet.</p>
                  </div>
                ) : (
                  (commissionsQuery.data ?? []).map((row) => (
                    <div key={row.commission.id} className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200"}`}>
                      <div>
                        <p className={`text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{row.techName ?? "Unknown Rep"}</p>
                        <p className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-500"}`}>{row.clientBusiness ?? row.clientName ?? "—"}</p>
                        <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-400"}`}>{new Date(row.commission.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}>${(row.commission.commissionAmountCents / 100).toFixed(2)}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                            row.commission.status === "paid" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-yellow-500/15 text-yellow-400 border-yellow-500/25"
                          }`}>{row.commission.status}</span>
                        </div>
                        {row.commission.status === "pending" && (
                          <button
                            onClick={() => markCommPaidMutation.mutate({ commissionId: row.commission.id })}
                            className="text-[9px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                          >Mark Paid</button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── SCRIPTS TAB ─────────────────────────────────────────────────── */}
        {activeTab === "scripts" && <ColdCallScriptPanel isDark={isDark} />}

        {/* ─── PARTNERS TAB ────────────────────────────────────────────────── */}
        {activeTab === "partners" && (
          <div className="space-y-4">
            {/* Sub-tabs */}
            <div className={`flex gap-1 p-1 rounded-lg w-fit ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
              {(["partners", "commissions"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setPartnerSubTab(t)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                    partnerSubTab === t
                      ? isDark ? "bg-teal-500/20 text-teal-300 border border-teal-500/30" : "bg-teal-100 text-teal-700 border border-teal-200"
                      : isDark ? "text-white/40 hover:text-white/70" : "text-gray-500 hover:text-gray-700"
                  }`}
                >{t === "commissions" ? "Partner Commissions" : "Partner Accounts"}</button>
              ))}
            </div>

            {/* ── Partners list ── */}
            {partnerSubTab === "partners" && (
              <div className="space-y-3">
                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className={`rounded-xl p-4 border ${isDark ? "bg-teal-500/8 border-teal-500/15" : "bg-teal-50 border-teal-200"}`}>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 ${isDark ? "text-teal-400/60" : "text-teal-600"}`}>Total Partners</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-teal-300" : "text-teal-700"}`}>{(partnersQuery.data ?? []).length}</p>
                  </div>
                  <div className={`rounded-xl p-4 border ${isDark ? "bg-teal-500/8 border-teal-500/15" : "bg-teal-50 border-teal-200"}`}>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 ${isDark ? "text-teal-400/60" : "text-teal-600"}`}>Active Partners</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-teal-300" : "text-teal-700"}`}>{(partnersQuery.data ?? []).filter(p => p.status === "active").length}</p>
                  </div>
                  <div className={`rounded-xl p-4 border ${isDark ? "bg-teal-500/8 border-teal-500/15" : "bg-teal-50 border-teal-200"}`}>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 ${isDark ? "text-teal-400/60" : "text-teal-600"}`}>Pending Payouts</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-teal-300" : "text-teal-700"}`}>
                      ${((allPartnerCommissionsQuery.data ?? []).filter(r => r.commission.status === "pending").reduce((s, r) => s + r.commission.netCommissionCents, 0) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Add partner button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowCreatePartnerForm(v => !v)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isDark ? "bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30" : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}
                  >
                    <PlusCircle size={13} /> Add Partner
                  </button>
                </div>

                {/* Create partner form */}
                {showCreatePartnerForm && (
                  <div className={`rounded-xl p-5 border space-y-3 ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200 shadow-sm"}`}>
                    <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>New Partner Account</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { key: "name", label: "Full Name *", type: "text" },
                        { key: "email", label: "Email *", type: "email" },
                        { key: "phone", label: "Phone", type: "tel" },
                        { key: "companyName", label: "Company Name", type: "text" },
                      ] as const).map(({ key, label, type }) => (
                        <div key={key}>
                          <label className={`block text-[10px] font-medium mb-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>{label}</label>
                          <input
                            type={type}
                            value={partnerForm[key]}
                            onChange={e => setPartnerForm(f => ({ ...f, [key]: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg text-xs border outline-none ${
                              isDark ? "bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-teal-500/50" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-teal-400"
                            }`}
                          />
                        </div>
                      ))}
                      <div>
                        <label className={`block text-[10px] font-medium mb-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>Commission Rate (%)</label>
                        <input
                          type="number" min={1} max={100}
                          value={partnerForm.commissionRate}
                          onChange={e => setPartnerForm(f => ({ ...f, commissionRate: Number(e.target.value) }))}
                          className={`w-full px-3 py-2 rounded-lg text-xs border outline-none ${
                            isDark ? "bg-white/5 border-white/10 text-white focus:border-teal-500/50" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-teal-400"
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[10px] font-medium mb-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>Notes</label>
                        <input
                          type="text"
                          value={partnerForm.notes}
                          onChange={e => setPartnerForm(f => ({ ...f, notes: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg text-xs border outline-none ${
                            isDark ? "bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-teal-500/50" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-teal-400"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowCreatePartnerForm(false)} className={`px-4 py-2 rounded-lg text-xs ${isDark ? "text-white/40 hover:text-white/60" : "text-gray-500 hover:text-gray-700"}`}>Cancel</button>
                      <button
                        onClick={() => createPartnerMutation.mutate(partnerForm)}
                        disabled={createPartnerMutation.isPending}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
                      >{createPartnerMutation.isPending ? "Creating..." : "Create Partner"}</button>
                    </div>
                  </div>
                )}

                {/* Partners list */}
                {partnersQuery.isLoading ? (
                  <div className="flex justify-center py-8"><div className={`w-6 h-6 border-2 rounded-full animate-spin ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-500"}`} /></div>
                ) : (partnersQuery.data ?? []).length === 0 ? (
                  <div className="text-center py-12">
                    <Handshake size={32} className={`mx-auto mb-3 ${isDark ? "text-white/15" : "text-gray-300"}`} />
                    <p className={isDark ? "text-white/30 text-sm" : "text-gray-400 text-sm"}>No partners yet. Add your first partner above.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(partnersQuery.data ?? []).map((partner) => (
                      <div key={partner.id} className={`rounded-xl p-4 border ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200 shadow-sm"}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                              isDark ? "bg-teal-500/20 text-teal-300" : "bg-teal-100 text-teal-700"
                            }`}>{partner.name.charAt(0).toUpperCase()}</div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{partner.name}</p>
                                {partner.companyName && <span className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-400"}`}>· {partner.companyName}</span>}
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                  partner.status === "active"
                                    ? isDark ? "bg-teal-500/15 text-teal-300 border-teal-500/25" : "bg-teal-50 text-teal-700 border-teal-200"
                                    : isDark ? "bg-red-500/15 text-red-300 border-red-500/25" : "bg-red-50 text-red-700 border-red-200"
                                }`}>{partner.status}</span>
                              </div>
                              <div className={`flex items-center gap-3 mt-0.5 text-[10px] ${isDark ? "text-white/35" : "text-gray-400"}`}>
                                <span>{partner.email}</span>
                                {partner.phone && <span>{partner.phone}</span>}
                                <span className={`font-semibold ${isDark ? "text-teal-400" : "text-teal-600"}`}>{partner.commissionRate}% commission</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            <div>
                              <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-400"}`}>Clients</p>
                              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{partner.clientCount}</p>
                            </div>
                            <div>
                              <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-400"}`}>Pending</p>
                              <p className={`text-sm font-bold text-amber-400`}>${(partner.totalPending / 100).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-400"}`}>Paid Out</p>
                              <p className={`text-sm font-bold text-emerald-400`}>${(partner.totalPaid / 100).toFixed(2)}</p>
                            </div>
                            {partner.status === "active" ? (
                              <button
                                onClick={() => deactivatePartnerMutation.mutate({ partnerId: partner.id, status: "inactive" })}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] border transition-all ${
                                  isDark ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                }`}
                              ><Ban size={10} /> Deactivate</button>
                            ) : (
                              <button
                                onClick={() => deactivatePartnerMutation.mutate({ partnerId: partner.id, status: "active" })}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] border transition-all ${
                                  isDark ? "bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/20" : "bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100"
                                }`}
                              ><CheckCircle2 size={10} /> Reactivate</button>
                            )}
                          </div>
                        </div>
                        {partner.notes && (
                          <p className={`mt-2 text-[10px] pl-12 ${isDark ? "text-white/30" : "text-gray-400"}`}>{partner.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Partner commissions ledger ── */}
            {partnerSubTab === "commissions" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className={`rounded-xl p-4 border ${isDark ? "bg-amber-500/8 border-amber-500/15" : "bg-amber-50 border-amber-200"}`}>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 ${isDark ? "text-amber-400/60" : "text-amber-600"}`}>Pending Payouts</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                      ${((allPartnerCommissionsQuery.data ?? []).filter(r => r.commission.status === "pending").reduce((s, r) => s + r.commission.netCommissionCents, 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className={`rounded-xl p-4 border ${isDark ? "bg-emerald-500/8 border-emerald-500/15" : "bg-emerald-50 border-emerald-200"}`}>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 ${isDark ? "text-emerald-400/60" : "text-emerald-600"}`}>Total Paid Out</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                      ${((allPartnerCommissionsQuery.data ?? []).filter(r => r.commission.status === "paid").reduce((s, r) => s + r.commission.netCommissionCents, 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className={`rounded-xl p-4 border ${isDark ? "bg-red-500/8 border-red-500/15" : "bg-red-50 border-red-200"}`}>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 ${isDark ? "text-red-400/60" : "text-red-600"}`}>Chargeback Deductions</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-red-300" : "text-red-700"}`}>
                      ${((allPartnerCommissionsQuery.data ?? []).reduce((s, r) => s + r.commission.chargebackDeductionCents, 0) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                {allPartnerCommissionsQuery.isLoading ? (
                  <div className="flex justify-center py-8"><div className={`w-6 h-6 border-2 rounded-full animate-spin ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-500"}`} /></div>
                ) : (allPartnerCommissionsQuery.data ?? []).length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign size={32} className={`mx-auto mb-3 ${isDark ? "text-white/15" : "text-gray-300"}`} />
                    <p className={isDark ? "text-white/30 text-sm" : "text-gray-400 text-sm"}>No partner commissions yet. They will appear here when invoices are paid.</p>
                  </div>
                ) : (
                  <div className={`rounded-xl border overflow-hidden ${isDark ? "border-white/8" : "border-gray-200"}`}>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className={isDark ? "bg-white/4 text-white/40" : "bg-gray-50 text-gray-500"}>
                          <th className="text-left px-4 py-3 font-medium">Partner</th>
                          <th className="text-left px-4 py-3 font-medium">Client</th>
                          <th className="text-right px-4 py-3 font-medium">Invoice</th>
                          <th className="text-right px-4 py-3 font-medium">Rate</th>
                          <th className="text-right px-4 py-3 font-medium">Commission</th>
                          <th className="text-right px-4 py-3 font-medium">Chargeback</th>
                          <th className="text-right px-4 py-3 font-medium">Net</th>
                          <th className="text-right px-4 py-3 font-medium">Status</th>
                          <th className="text-right px-4 py-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
                        {(allPartnerCommissionsQuery.data ?? []).map((row) => (
                          <tr key={row.commission.id} className={isDark ? "hover:bg-white/2" : "hover:bg-gray-50"}>
                            <td className={`px-4 py-3 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{row.partnerName ?? "—"}</td>
                            <td className={`px-4 py-3 ${isDark ? "text-white/60" : "text-gray-600"}`}>{row.clientBusiness ?? row.clientName ?? "—"}</td>
                            <td className={`px-4 py-3 text-right ${isDark ? "text-white/60" : "text-gray-600"}`}>${(row.commission.invoiceAmountCents / 100).toFixed(2)}</td>
                            <td className={`px-4 py-3 text-right ${isDark ? "text-white/60" : "text-gray-600"}`}>{row.commission.commissionRate}%</td>
                            <td className={`px-4 py-3 text-right font-medium ${isDark ? "text-teal-300" : "text-teal-700"}`}>${(row.commission.commissionAmountCents / 100).toFixed(2)}</td>
                            <td className={`px-4 py-3 text-right ${row.commission.chargebackDeductionCents > 0 ? "text-red-400" : isDark ? "text-white/30" : "text-gray-300"}`}>
                              {row.commission.chargebackDeductionCents > 0 ? `-$${(row.commission.chargebackDeductionCents / 100).toFixed(2)}` : "—"}
                            </td>
                            <td className={`px-4 py-3 text-right font-bold ${isDark ? "text-white" : "text-gray-900"}`}>${(row.commission.netCommissionCents / 100).toFixed(2)}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                row.commission.status === "paid"
                                  ? isDark ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : isDark ? "bg-amber-500/15 text-amber-300 border-amber-500/25" : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>{row.commission.status}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {row.commission.status === "pending" && (
                                <button
                                  onClick={() => markPartnerCommPaidMutation.mutate({ commissionId: row.commission.id })}
                                  className={`text-[10px] px-2 py-1 rounded border transition-all ${
                                    isDark ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/25" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  }`}
                                >Mark Paid</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── ANALYTICS TAB ─────────────────────────────────────────────── */}
        {activeTab === "analytics" && (
          <AnalyticsPanel isDark={isDark} />
        )}

        {activeTab === "messages" && (
          <div className="flex gap-4 h-[calc(100vh-160px)]">
            {/* Project list */}
            <div className="w-64 flex-shrink-0 overflow-y-auto space-y-1.5">
              <h3 className={`text-[10px] font-semibold uppercase tracking-wider mb-3 ${isDark ? "text-white/35" : "text-gray-500"}`}>Projects</h3>
              {(projectsQuery.data ?? []).map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => setSelectedMessageProjectId(proj.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
                    selectedMessageProjectId === proj.id
                      ? "bg-[oklch(0.5_0.2_25_/_15%)] border-[oklch(0.5_0.2_25_/_35%)] text-[oklch(0.5_0.2_25)]"
                      : isDark ? "bg-white/3 border-white/8 text-white/50 hover:text-white hover:bg-white/6" : "bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-semibold text-xs truncate">{proj.businessName}</p>
                  <p className="text-[10px] opacity-50 truncate mt-0.5">{proj.clientName}</p>
                </button>
              ))}
              {(projectsQuery.data ?? []).length === 0 && (
                <p className={`text-xs text-center py-8 ${isDark ? "text-white/25" : "text-gray-400"}`}>No projects yet</p>
              )}
            </div>

            {/* Message thread */}
            <div className={`flex-1 flex flex-col rounded-xl border overflow-hidden ${isDark ? "bg-white/2 border-white/8" : "bg-white border-gray-200"}`}>
              {!selectedMessageProjectId ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className={`text-sm ${isDark ? "text-white/25" : "text-gray-400"}`}>Select a project to view messages</p>
                </div>
              ) : (
                <>
                  <div className={`px-4 py-3 border-b ${isDark ? "border-white/8" : "border-gray-100"}`}>
                    <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      {(projectsQuery.data ?? []).find((p) => p.id === selectedMessageProjectId)?.businessName ?? "Project"}
                    </p>
                    <p className={`text-xs ${isDark ? "text-white/35" : "text-gray-500"}`}>Client conversation thread</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                    {messagesQuery.isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className={`w-6 h-6 border-2 rounded-full animate-spin ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-600"}`} />
                      </div>
                    ) : (messagesQuery.data ?? []).length === 0 ? (
                      <p className={`text-sm text-center py-8 ${isDark ? "text-white/25" : "text-gray-400"}`}>No messages yet. Start the conversation!</p>
                    ) : (
                      (messagesQuery.data ?? []).map((msg: any) => (
                        <div key={msg.id} className={`flex ${msg.senderRole === "staff" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] px-3 py-2.5 rounded-xl text-sm ${
                            msg.senderRole === "staff"
                              ? "bg-[oklch(0.5_0.2_25_/_15%)] border border-[oklch(0.5_0.2_25_/_35%)] text-[oklch(0.45_0.2_25)]"
                              : isDark ? "bg-white/6 border border-white/12 text-white/90" : "bg-gray-100 border border-gray-200 text-gray-800"
                          }`}>
                            <p className="text-[10px] opacity-40 mb-1">{msg.senderName} · {new Date(msg.createdAt).toLocaleString()}</p>
                            <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className={`p-3 border-t flex gap-2 ${isDark ? "border-white/8" : "border-gray-100"}`}>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (newMessage.trim() && selectedMessageProjectId) {
                            sendAdminMessage.mutate({ projectId: selectedMessageProjectId, message: newMessage.trim() });
                          }
                        }
                      }}
                      placeholder="Type a message… (Enter to send)"
                      rows={2}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none ${isDark ? "bg-white/5 border border-white/10 text-white focus:border-white/25" : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-gray-400"}`}
                    />
                    <button
                      onClick={() => {
                        if (newMessage.trim() && selectedMessageProjectId) {
                          sendAdminMessage.mutate({ projectId: selectedMessageProjectId, message: newMessage.trim() });
                        }
                      }}
                      disabled={!newMessage.trim() || sendAdminMessage.isPending}
                      className="px-4 py-2 rounded-lg bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] disabled:opacity-40 text-white text-sm font-semibold transition-all self-end"
                    >
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {/* ─── SMS INBOX TAB ──────────────────────────────────────────────────── */}
        {activeTab === "smsInbox" && (
          <SmsInboxPanel isDark={isDark} leads={leads} customers={customers} />
        )}
        {/* ─── OPPORTUNITY POOL TAB ─────────────────────────────────────────── */}
        {activeTab === "opportunities" && (
          <OpportunityPoolPanel isDark={isDark} />
        )}
        {/* ─── ADD-ON PRICING TAB ──────────────────────────────────────────────── */}
            {/* ─── KNOWLEDGE CENTER TAB ─────────────────────────────────── */}
        {activeTab === "knowledgeCenter" && (
          <div className={isDark ? "" : "bg-[oklch(0.065_0.005_260)] rounded-2xl text-white -m-8 p-0"}>
            <KnowledgeCenter />
          </div>
        )}
        {activeTab === "addons" && (
          <AddOnPricingTab isDark={isDark} />
        )}
        {activeTab === "bookings" && (
          <BookingsPanel isDark={isDark} />
        )}
      </main>
      </div>
    </div>
  );
}

// ─── Opportunity Pool Panel ──────────────────────────────────────────────────
function OpportunityPoolPanel({ isDark }: { isDark: boolean }) {
  const utils = trpc.useUtils();
  const { data: opportunities, isLoading } = trpc.opportunity.list.useQuery();
  const claimMutation = trpc.opportunity.claim.useMutation({
    onSuccess: () => {
      toast.success("Opportunity claimed! You earn 15% commission on the first payment.");
      utils.opportunity.list.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });
  const unclaimMutation = trpc.opportunity.unclaim.useMutation({
    onSuccess: () => {
      toast.success("Opportunity released back to the pool.");
      utils.opportunity.list.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });
  const deleteMutation = trpc.opportunity.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Opportunity deleted.");
      utils.opportunity.list.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });
  const [confirmPayoutId, setConfirmPayoutId] = useState<number | null>(null);
  const [confirmPayoutAmount, setConfirmPayoutAmount] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const confirmPayoutMutation = (trpc.opportunity as any).adminConfirmPayout.useMutation({
    onSuccess: () => {
      toast.success("Payout confirmed and opportunity marked as converted.");
      utils.opportunity.list.invalidate();
      setConfirmPayoutId(null);
      setConfirmPayoutAmount("");
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOpp, setNewOpp] = useState({
    businessName: "",
    websiteUrl: "",
    businessType: "",
    location: "",
    description: "",
    estimatedMonthlyCents: 0,
    source: "portfolio" as const,
  });
  const createMutation = trpc.opportunity.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Opportunity added to the pool.");
      utils.opportunity.list.invalidate();
      setShowAddForm(false);
      setNewOpp({ businessName: "", websiteUrl: "", businessType: "", location: "", description: "", estimatedMonthlyCents: 0, source: "portfolio" });
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });
  // My personal pool earnings (owner's claimed opportunities)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: myPoolClients = [] } = (trpc.opportunity as any).adminGetMyPoolClients?.useQuery() ?? { data: [] };
   const myExpectedTotal = myPoolClients.reduce((sum: number, o: typeof myPoolClients[number]) => sum + Math.round((o.estimatedMonthlyCents ?? 0) * 0.15), 0);
  const myConfirmedTotal = myPoolClients.reduce((sum: number, o: typeof myPoolClients[number]) => sum + (o.confirmedPayoutCents ?? 0), 0);
  // Search, filter, pagination
  const [poolSearch, setPoolSearch] = useState("");
  const [poolFilterType, setPoolFilterType] = useState("all");
  const [poolPage, setPoolPage] = useState(1);
  const POOL_PAGE_SIZE = 50;

  type OppItem = NonNullable<typeof opportunities>[number];
  const available = (opportunities ?? []).filter((o: OppItem) => o.status === "available");
  const claimed = (opportunities ?? []).filter((o: OppItem) => o.status === "claimed");
  const converted = (opportunities ?? []).filter((o: OppItem) => o.status === "converted");

  // Unique business types for filter dropdown
  const poolBusinessTypes = Array.from(new Set(available.map((o: OppItem) => o.businessType).filter(Boolean))).sort() as string[];

  // Filtered available leads
  const filteredAvailable = available.filter((o: OppItem) => {
    const q = poolSearch.toLowerCase();
    const matchesSearch = !q ||
      (o.businessName ?? "").toLowerCase().includes(q) ||
      (o.websiteUrl ?? "").toLowerCase().includes(q) ||
      (o.location ?? "").toLowerCase().includes(q) ||
      (o.description ?? "").toLowerCase().includes(q);
    const matchesType = poolFilterType === "all" || o.businessType === poolFilterType;
    return matchesSearch && matchesType;
  });

  const poolTotalPages = Math.max(1, Math.ceil(filteredAvailable.length / POOL_PAGE_SIZE));
  const pagedAvailable = filteredAvailable.slice((poolPage - 1) * POOL_PAGE_SIZE, poolPage * POOL_PAGE_SIZE);

  const card = `rounded-xl border p-5 transition-all ${isDark ? "bg-white/3 border-white/10 hover:bg-white/5" : "bg-white border-gray-200 hover:shadow-md"}`;
  const label = `text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? "text-white/40" : "text-gray-400"}`;
  const bodyText = isDark ? "text-white/70" : "text-gray-600";
  const headText = isDark ? "text-white" : "text-gray-900";
  return (
    <div className="space-y-8">
      {/* ── My Pool Earnings ── */}
      <div className={`rounded-xl border p-5 ${isDark ? "bg-white/3 border-white/10" : "bg-white border-gray-200"}`}>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={16} className="text-amber-400" />
          <h3 className={`text-sm font-semibold ${headText}`}>My Pool Earnings</h3>
          <span className={`ml-auto text-xs ${bodyText}`}>{myPoolClients.length} client{myPoolClients.length !== 1 ? "s" : ""} claimed</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`rounded-lg p-4 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
            <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-400"}`}>Expected Payout (15%)</p>
            <p className="text-2xl font-bold text-amber-400">${(myExpectedTotal / 100).toFixed(2)}</p>
            <p className={`text-xs mt-0.5 ${bodyText}`}>per month</p>
          </div>
          <div className={`rounded-lg p-4 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
            <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-400"}`}>Confirmed Payout</p>
            <p className="text-2xl font-bold text-green-400">${(myConfirmedTotal / 100).toFixed(2)}</p>
            <p className={`text-xs mt-0.5 ${bodyText}`}>total confirmed</p>
          </div>
        </div>
        {myPoolClients.length > 0 ? (
          <div className="space-y-2">
            {myPoolClients.map((opp: { id: number; businessName: string; businessType?: string | null; estimatedMonthlyCents?: number | null; confirmedPayoutCents?: number | null; status?: string | null }) => (
              <div key={opp.id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${headText}`}>{opp.businessName}</p>
                  {opp.businessType && <p className={`text-xs truncate ${bodyText}`}>{opp.businessType}</p>}
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-3">
                  <div className="text-right">
                    <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>Expected</p>
                    <p className="text-sm font-semibold text-amber-400">${((opp.estimatedMonthlyCents ?? 0) * 0.15 / 100).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>Confirmed</p>
                    <p className={`text-sm font-semibold ${opp.confirmedPayoutCents ? "text-green-400" : isDark ? "text-white/30" : "text-gray-300"}`}>
                      {opp.confirmedPayoutCents ? `$${(opp.confirmedPayoutCents / 100).toFixed(2)}` : "—"}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    opp.status === "converted" ? "bg-green-500/20 text-green-400" :
                    opp.status === "claimed" ? (isDark ? "bg-white/8 text-white/50" : "bg-gray-100 text-gray-500") :
                    "bg-amber-500/20 text-amber-400"
                  }`}>{opp.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-sm text-center py-4 ${isDark ? "text-white/30" : "text-gray-400"}`}>
            You haven't claimed any opportunities yet. Claim companies from the pool below to earn 15% commission.
          </p>
        )}
      </div>
      {/* Header bar */}
      {/* Header bar + search/filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-sm">
            <span className={`font-semibold ${headText}`}>{available.length} available</span>
            <span className={bodyText}>{claimed.length} claimed</span>
            <span className={bodyText}>{converted.length} converted</span>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            <PlusCircle size={15} />
            Add Opportunity
          </button>
        </div>
        {/* Search + filter row */}
        <div className="flex gap-2 flex-wrap">
          <div className={`flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-lg border text-sm ${
            isDark ? "bg-white/5 border-white/15 text-white" : "bg-white border-gray-200 text-gray-900"
          }`}>
            <Search size={14} className={isDark ? "text-white/40" : "text-gray-400"} />
            <input
              type="text"
              placeholder="Search by name, URL, location…"
              value={poolSearch}
              onChange={(e) => { setPoolSearch(e.target.value); setPoolPage(1); }}
              className="bg-transparent outline-none flex-1 placeholder-current opacity-60"
            />
            {poolSearch && (
              <button onClick={() => { setPoolSearch(""); setPoolPage(1); }} className="opacity-50 hover:opacity-100">
                <X size={12} />
              </button>
            )}
          </div>
          <select
            value={poolFilterType}
            onChange={(e) => { setPoolFilterType(e.target.value); setPoolPage(1); }}
            className={`px-3 py-2 rounded-lg border text-sm ${
              isDark ? "bg-white/5 border-white/15 text-white" : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <option value="all">All types ({available.length})</option>
            {poolBusinessTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {/* Results summary */}
        {(poolSearch || poolFilterType !== "all") && (
          <p className={`text-xs ${bodyText}`}>
            Showing {filteredAvailable.length} of {available.length} leads
            {poolSearch && <> matching &ldquo;{poolSearch}&rdquo;</>}
            {poolFilterType !== "all" && <> in {poolFilterType}</>}
          </p>
        )}
      </div>
      {/* Add form */}
      {showAddForm && (
        <div className={`rounded-xl border p-5 space-y-4 ${isDark ? "bg-white/5 border-white/15" : "bg-gray-50 border-gray-200"}`}>
          <h3 className={`text-sm font-semibold ${headText}`}>New Opportunity</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              className={`col-span-2 px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-white/5 border-white/15 text-white placeholder-white/30" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`}
              placeholder="Business name *"
              value={newOpp.businessName}
              onChange={(e) => setNewOpp({ ...newOpp, businessName: e.target.value })}
            />
            <input
              className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-white/5 border-white/15 text-white placeholder-white/30" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`}
              placeholder="Website URL"
              value={newOpp.websiteUrl}
              onChange={(e) => setNewOpp({ ...newOpp, websiteUrl: e.target.value })}
            />
            <input
              className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-white/5 border-white/15 text-white placeholder-white/30" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`}
              placeholder="Business type (e.g. Martial Arts)"
              value={newOpp.businessType}
              onChange={(e) => setNewOpp({ ...newOpp, businessType: e.target.value })}
            />
            <input
              className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-white/5 border-white/15 text-white placeholder-white/30" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`}
              placeholder="Location"
              value={newOpp.location}
              onChange={(e) => setNewOpp({ ...newOpp, location: e.target.value })}
            />
            <input
              className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-white/5 border-white/15 text-white placeholder-white/30" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`}
              placeholder="Est. monthly value ($)"
              type="number"
              value={newOpp.estimatedMonthlyCents / 100 || ""}
              onChange={(e) => setNewOpp({ ...newOpp, estimatedMonthlyCents: Math.round(parseFloat(e.target.value || "0") * 100) })}
            />
            <textarea
              className={`col-span-2 px-3 py-2 rounded-lg border text-sm resize-none ${isDark ? "bg-white/5 border-white/15 text-white placeholder-white/30" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`}
              placeholder="Description"
              rows={2}
              value={newOpp.description}
              onChange={(e) => setNewOpp({ ...newOpp, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAddForm(false)} className={`px-4 py-2 rounded-lg text-sm border ${isDark ? "border-white/15 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-100"}`}>Cancel</button>
            <button
              disabled={!newOpp.businessName || createMutation.isPending}
              onClick={() => createMutation.mutate(newOpp)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 ${isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-gray-800"}`}
            >
              {createMutation.isPending ? "Adding..." : "Add to Pool"}
            </button>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className={`animate-spin ${isDark ? "text-white/30" : "text-gray-400"}`} />
        </div>
      )}
      {/* Available opportunities */}
      {filteredAvailable.length > 0 && (
        <div>
          <p className={label}>Available — Unclaimed ({filteredAvailable.length}{filteredAvailable.length !== available.length ? ` of ${available.length}` : ""})</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pagedAvailable.map((opp) => (
              <div key={opp.id} className={card}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className={`text-base font-semibold ${headText}`}>{opp.businessName}</h3>
                    {opp.businessType && <span className={`text-xs ${bodyText}`}>{opp.businessType}</span>}
                    {opp.location && <span className={`text-xs ${bodyText}`}> · {opp.location}</span>}
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${isDark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-500"}`}>Available</span>
                </div>
                {opp.description && <p className={`text-sm mb-3 line-clamp-2 ${bodyText}`}>{opp.description}</p>}
                <div className="flex items-center gap-3 mb-4">
                  {opp.websiteUrl && (
                    <a href={opp.websiteUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-xs hover:underline ${bodyText}`}>
                      <Globe size={12} /> {opp.websiteUrl.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                  {opp.estimatedMonthlyCents ? (
                    <span className={`text-xs font-medium ${isDark ? "text-white/50" : "text-gray-500"}`}>
                      ~${(opp.estimatedMonthlyCents / 100).toFixed(0)}/mo
                    </span>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => claimMutation.mutate({ opportunityId: opp.id })}
                    disabled={claimMutation.isPending}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 ${
                      isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    <Trophy size={14} />
                    Claim (15% commission)
                  </button>
                  <button
                    onClick={() => { if (confirm("Delete this opportunity?")) deleteMutation.mutate({ opportunityId: opp.id }); }}
                    className={`px-3 py-2 rounded-lg border text-sm transition-all ${isDark ? "border-white/10 text-white/30 hover:text-red-400 hover:border-red-400/30" : "border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination controls */}
          {poolTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPoolPage(1)}
                disabled={poolPage === 1}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-30 ${
                  isDark ? "border-white/15 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                First
              </button>
              <button
                onClick={() => setPoolPage(p => Math.max(1, p - 1))}
                disabled={poolPage === 1}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-30 ${
                  isDark ? "border-white/15 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                Prev
              </button>
              <span className={`text-xs px-3 py-1.5 rounded-lg ${
                isDark ? "bg-white/8 text-white/70" : "bg-gray-100 text-gray-600"
              }`}>
                Page {poolPage} of {poolTotalPages} &middot; {filteredAvailable.length} leads
              </span>
              <button
                onClick={() => setPoolPage(p => Math.min(poolTotalPages, p + 1))}
                disabled={poolPage === poolTotalPages}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-30 ${
                  isDark ? "border-white/15 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
              <button
                onClick={() => setPoolPage(poolTotalPages)}
                disabled={poolPage === poolTotalPages}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-30 ${
                  isDark ? "border-white/15 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                Last
              </button>
            </div>
          )}
        </div>
      )}
      {/* Claimed opportunities */}
      {claimed.length > 0 && (
        <div>
          <p className={label}>Claimed ({claimed.length})</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {claimed.map((opp) => (
              <div key={opp.id} className={`${card} opacity-75`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className={`text-base font-semibold ${headText}`}>{opp.businessName}</h3>
                    {opp.businessType && <span className={`text-xs ${bodyText}`}>{opp.businessType}</span>}
                  </div>
                  <span className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${isDark ? "bg-white/8 text-white/50" : "bg-gray-100 text-gray-500"}`}>
                    <Lock size={10} /> Claimed
                  </span>
                </div>
                {(opp as any).claimedByRepName && (
                  <p className={`text-sm mb-1 ${bodyText}`}>Rep: <span className="font-medium">{(opp as any).claimedByRepName}</span></p>
                )}
                {!((opp as any).claimedByRepName) && opp.claimedByTechnicianId && (
                  <p className={`text-sm mb-1 ${bodyText}`}>Rep ID: <span className="font-medium">{opp.claimedByTechnicianId}</span></p>
                )}
                {opp.claimedAt && (
                  <p className={`text-xs mb-2 ${isDark ? "text-white/30" : "text-gray-400"}`}>
                    Claimed {new Date(opp.claimedAt).toLocaleDateString()}
                  </p>
                )}
                {opp.websiteUrl && (
                  <a href={opp.websiteUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-xs mb-3 hover:underline ${bodyText}`}>
                    <Globe size={12} /> {opp.websiteUrl.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {/* Expected payout */}
                <div className={`flex items-center justify-between text-xs mb-3 px-3 py-2 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                  <span className={bodyText}>Expected payout (15%)</span>
                  <span className="font-semibold text-amber-400">${((opp.estimatedMonthlyCents ?? 0) * 0.15 / 100).toFixed(2)}</span>
                </div>
                {/* Confirm payout form */}
                {confirmPayoutId === opp.id ? (
                  <div className="space-y-2 mb-3">
                    <label className={`text-xs ${bodyText}`}>Confirmed payout amount ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={confirmPayoutAmount}
                      onChange={(e) => setConfirmPayoutAmount(e.target.value)}
                      placeholder={((opp.estimatedMonthlyCents ?? 0) * 0.15 / 100).toFixed(2)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-white/5 border-white/15 text-white placeholder-white/30" : "bg-white border-gray-300 text-gray-900"} focus:outline-none`}
                    />
                    <div className="flex gap-2">
                      <button
                        disabled={!confirmPayoutAmount || confirmPayoutMutation.isPending}
                        onClick={() => {
                          const cents = Math.round(parseFloat(confirmPayoutAmount) * 100);
                          if (!isNaN(cents) && cents >= 0) confirmPayoutMutation.mutate({ opportunityId: opp.id, confirmedPayoutCents: cents });
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {confirmPayoutMutation.isPending ? "Saving…" : "Confirm Payout"}
                      </button>
                      <button
                        onClick={() => { setConfirmPayoutId(null); setConfirmPayoutAmount(""); }}
                        className={`px-3 py-2 rounded-lg border text-xs ${isDark ? "border-white/10 text-white/50" : "border-gray-200 text-gray-500"}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setConfirmPayoutId(opp.id); setConfirmPayoutAmount(((opp.estimatedMonthlyCents ?? 0) * 0.15 / 100).toFixed(2)); }}
                    className="w-full px-3 py-2 rounded-lg bg-green-600/20 border border-green-600/30 text-green-400 text-xs font-medium hover:bg-green-600/30 transition-colors mb-2"
                  >
                    Confirm Payout
                  </button>
                )}
                <button
                  onClick={() => { if (confirm("Release this opportunity back to the pool?")) unclaimMutation.mutate({ opportunityId: opp.id }); }}
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-medium transition-all ${isDark ? "border-white/10 text-white/40 hover:bg-white/5 hover:text-white/70" : "border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600"}`}
                >
                  Release back to pool
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {!isLoading && available.length === 0 && claimed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Trophy size={32} className={isDark ? "text-white/20" : "text-gray-300"} />
          <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>No opportunities in the pool yet.</p>
          <button onClick={() => setShowAddForm(true)} className={`text-sm font-medium underline ${isDark ? "text-white/50" : "text-gray-500"}`}>Add the first one</button>
        </div>
      )}
    </div>
  );
}

// ─── Cold Call Script Panel (re-exported from shared component) ─────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ColdCallScriptPanel({ isDark }: { isDark: boolean }) {
  const [openSection, setOpenSection] = useState<string | null>("opening");

  const sections = [
    {
      id: "opening",
      emoji: "☎️",
      title: "Opening — Pattern Interrupt",
      color: "text-sky-300",
      border: "border-sky-500/25",
      bg: "bg-sky-500/8",
      content: (
        <div className="space-y-3">
          <div className={`rounded-xl p-4 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
            <p className={`text-sm leading-relaxed font-medium italic ${isDark ? "text-white/90" : "text-gray-800"}`}>
              "Hey, is this [Name]—quick question, are you currently taking on new clients right now?"
            </p>
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? "text-white/45" : "text-gray-500"}`}>
            Pause. Let them answer. This hooks them into a business conversation, not a sales pitch.
          </p>
        </div>
      ),
    },
    {
      id: "hook",
      emoji: "🔥",
      title: "Problem Hook — The Money Line",
      color: "text-orange-300",
      border: "border-orange-500/25",
      bg: "bg-orange-500/8",
      content: (
        <div className="space-y-3">
          <div className={`rounded-xl p-4 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
            <p className={`text-sm leading-relaxed font-medium italic ${isDark ? "text-white/90" : "text-gray-800"}`}>
              "Got it—so this is exactly why I called… most service businesses we talk to are getting leads, but they're losing 30–50% of them because their website doesn't follow up or capture properly."
            </p>
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? "text-white/45" : "text-gray-500"}`}>
            Let that sit. People will mentally check if it's true.
          </p>
        </div>
      ),
    },
    {
      id: "value",
      emoji: "💡",
      title: "Value Position — What You Actually Do",
      color: "text-yellow-300",
      border: "border-yellow-500/25",
      bg: "bg-yellow-500/8",
      content: (
        <div className="space-y-3">
          <div className={`rounded-xl p-4 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
            <p className={`text-sm leading-relaxed font-medium italic ${isDark ? "text-white/90" : "text-gray-800"}`}>
              "We don't just build websites—we build what's basically a client enrollment system. It captures leads, automatically follows up by text/email, and feeds directly into your CRM so nothing slips through."
            </p>
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? "text-white/45" : "text-gray-500"}`}>
            Aligns directly with the offer: CRM integration + automated follow-ups.
          </p>
        </div>
      ),
    },
    {
      id: "diff",
      emoji: "⚔️",
      title: "Differentiation — Why You're Not Like Everyone Else",
      color: "text-red-300",
      border: "border-red-500/25",
      bg: "bg-red-500/8",
      content: (
        <div className="space-y-3">
          <div className={`rounded-xl p-4 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
            <p className={`text-sm leading-relaxed font-medium italic ${isDark ? "text-white/90" : "text-gray-800"}`}>
              "Most agencies build something that looks nice… we build something that actually converts visitors into paying clients consistently."
            </p>
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? "text-white/45" : "text-gray-500"}`}>
            You're reframing them from design → revenue.
          </p>
        </div>
      ),
    },
    {
      id: "qualify",
      emoji: "🎯",
      title: "Qualifying Question — Expose the Gap",
      color: "text-emerald-300",
      border: "border-emerald-500/25",
      bg: "bg-emerald-500/8",
      content: (
        <div className="space-y-3">
          <div className={`rounded-xl p-4 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
            <p className={`text-sm leading-relaxed font-medium italic ${isDark ? "text-white/90" : "text-gray-800"}`}>
              "Let me ask you—right now, when someone visits your website… do they get followed up with automatically, or does it depend on you or your team?"
            </p>
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? "text-white/45" : "text-gray-500"}`}>
            This exposes the gap instantly.
          </p>
        </div>
      ),
    },
    {
      id: "close",
      emoji: "💥",
      title: "Micro-Close — Book the Call",
      color: "text-purple-300",
      border: "border-purple-500/25",
      bg: "bg-purple-500/8",
      content: (
        <div className="space-y-3">
          <div className={`rounded-xl p-4 space-y-3 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
            <p className={`text-sm leading-relaxed font-medium italic ${isDark ? "text-white/90" : "text-gray-800"}`}>
              "That's exactly the gap we fix. I can show you in about 10 minutes how businesses like yours are turning their site into a 24/7 sales machine."
            </p>
            <p className={`text-sm leading-relaxed font-medium italic ${isDark ? "text-white/90" : "text-gray-800"}`}>
              "Would it be easier later today or tomorrow for a quick walkthrough?"
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "objection_interest",
      emoji: "🧠",
      title: "Objection: \"Not Interested\"",
      color: "text-pink-300",
      border: "border-pink-500/25",
      bg: "bg-pink-500/8",
      content: (
        <div className="space-y-3">
          <p className={`text-xs ${isDark ? "text-white/55" : "text-gray-500"}`}>Don't retreat—pivot.</p>
          <div className={`rounded-xl p-4 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
            <p className={`text-sm leading-relaxed font-medium italic ${isDark ? "text-white/90" : "text-gray-800"}`}>
              "Totally get it—quick question before I let you go… if your website could bring you even 5–10 extra clients a month automatically, would that be worth looking at?"
            </p>
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? "text-white/45" : "text-gray-500"}`}>
            Now they're thinking in results, not cost.
          </p>
        </div>
      ),
    },
    {
      id: "objection_website",
      emoji: "🧨",
      title: "Objection: \"We Already Have a Website\"",
      color: "text-amber-300",
      border: "border-amber-500/25",
      bg: "bg-amber-500/8",
      content: (
        <div className="space-y-3">
          <p className={`text-xs ${isDark ? "text-white/55" : "text-gray-500"}`}>Perfect. That's actually your best lead.</p>
          <div className={`rounded-xl p-4 space-y-3 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
            <p className={`text-sm leading-relaxed font-medium italic ${isDark ? "text-white/90" : "text-gray-800"}`}>
              "Yeah—that's actually who we help the most. Most of our clients already had a site… it just wasn't converting or following up."
            </p>
            <p className={`text-sm leading-relaxed font-medium italic ${isDark ? "text-white/90" : "text-gray-800"}`}>
              "We usually find 2–3 quick fixes that increase leads almost immediately—want me to show you?"
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "power_close",
      emoji: "🧲",
      title: "Power Close — Stronger Version",
      color: "text-teal-300",
      border: "border-teal-500/25",
      bg: "bg-teal-500/8",
      content: (
        <div className="space-y-3">
          <div className={`rounded-xl p-4 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
            <p className={`text-sm leading-relaxed font-medium italic ${isDark ? "text-white/90" : "text-gray-800"}`}>
              "Worst case—you get a free breakdown of where your website is leaking leads. Best case—you add a consistent flow of new clients without spending more on ads."
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-8">
      {/* Header */}
      <div className={`p-5 rounded-2xl border ${
        isDark ? "bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-200"
      }`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <PhoneCall size={18} className="text-amber-300" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`} style={{ fontFamily: "var(--font-display)" }}>
              Cold Call Script
            </h2>
            <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>High-Conversion Version · FlowSites Sales</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "Websites → ❌", sub: "Boring commodity" },
            { label: "Enrollment System → ✅", sub: "Valuable & specific" },
            { label: "Design → ❌  Automation → ✅", sub: "Revenue machine" },
          ].map((tip) => (
            <div key={tip.label} className={`rounded-xl p-3 ${isDark ? "bg-white/5 border border-white/8" : "bg-white/60 border border-amber-200"}`}>
              <p className={`text-xs font-semibold ${isDark ? "text-white/80" : "text-gray-700"}`}>{tip.label}</p>
              <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/35" : "text-gray-500"}`}>{tip.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tone Guide */}
      <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${
        isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200"
      }`}>
        <span className="text-lg">⚡</span>
        <div>
          <p className={`text-xs font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}>Tone Guide</p>
          <p className={`text-[11px] ${isDark ? "text-white/40" : "text-gray-500"}`}>
            Don't sound like a salesperson — sound like a <strong className={isDark ? "text-white/60" : "text-gray-700"}>consultant</strong>, a <strong className={isDark ? "text-white/60" : "text-gray-700"}>problem finder</strong>, someone who sees revenue leaks everywhere.
          </p>
        </div>
      </div>

      {/* Script Sections */}
      <div className="space-y-2">
        {sections.map((section, idx) => {
          const isOpen = openSection === section.id;
          return (
            <div
              key={section.id}
              className={`rounded-xl border overflow-hidden transition-all ${
                isOpen ? `${section.bg} ${section.border}` : isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200"
              }`}
            >
              <button
                onClick={() => setOpenSection(isOpen ? null : section.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-base flex-shrink-0">{section.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-semibold ${
                    isOpen ? section.color : isDark ? "text-white/70" : "text-gray-700"
                  }`}>
                    <span className={`text-[10px] font-bold mr-2 ${
                      isDark ? "text-white/25" : "text-gray-400"
                    }`}>{String(idx + 1).padStart(2, "0")}</span>
                    {section.title}
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className={`flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? `rotate-90 ${section.color}` : isDark ? "text-white/20" : "text-gray-400"
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  isLink,
  multiline,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  isLink?: boolean;
  multiline?: boolean;
}) {
  return (
    <div className="bg-white/4 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={11} className="text-white/25" />
        <span className="text-white/35 text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      {isLink ? (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[oklch(0.6_0.22_25)] hover:text-[oklch(0.7_0.22_25)] text-xs break-all transition-colors"
        >
          {value}
        </a>
      ) : (
        <p className={`text-white/75 text-xs ${multiline ? "whitespace-pre-wrap" : "truncate"}`}>
          {value}
        </p>
      )}
    </div>
  );
}

// ─── Analytics Panel ──────────────────────────────────────────────────────────
function AnalyticsPanel({ isDark }: { isDark: boolean }) {
  const accountsQuery = trpc.clientBilling.adminListAccounts.useQuery();
  const invoicesQuery = trpc.clientBilling.adminListInvoices.useQuery();
  const repCommissionsQuery = trpc.technician.adminGetCommissions.useQuery();
  const partnerCommissionsQuery = trpc.partner.adminGetAllPartnerCommissions.useQuery();

  const accounts = accountsQuery.data ?? [];
  const invoices = invoicesQuery.data ?? [];
  const repComms = (repCommissionsQuery.data ?? []) as any[];
  const partnerComms = (partnerCommissionsQuery.data ?? []) as any[];

  // MRR from active accounts
  const mrr = accounts.filter(a => a.status === "active").reduce((s, a) => s + a.monthlyPriceCents, 0);
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(a => a.status === "active").length;
  const pastDueAccounts = accounts.filter(a => a.status === "past_due").length;

  // Invoice stats
  const paidInvoices = invoices.filter(i => i.status === "paid");
  const openInvoices = invoices.filter(i => i.status === "open" || i.status === "overdue");
  const totalCollected = paidInvoices.reduce((s, i) => s + i.totalAmountCents, 0);
  const totalOutstanding = openInvoices.reduce((s, i) => s + i.totalAmountCents, 0);

  // Commission stats
  const pendingRepComms = repComms.filter(c => c.status === "pending").reduce((s: number, c: any) => s + c.netCommissionCents, 0);
  const pendingPartnerComms = partnerComms.filter(c => c.status === "pending").reduce((s: number, c: any) => s + c.netCommissionCents, 0);
  const totalCommissionsOwed = pendingRepComms + pendingPartnerComms;

  // Recent paid invoices (last 6)
  const recentPaid = paidInvoices
    .sort((a, b) => new Date(b.paidAt ?? b.createdAt).getTime() - new Date(a.paidAt ?? a.createdAt).getTime())
    .slice(0, 6);

  function fmt(cents: number) { return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

  const card = isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm";
  const label = isDark ? "text-white/40" : "text-gray-500";
  const value = isDark ? "text-white" : "text-gray-900";
  const sub = isDark ? "text-white/25" : "text-gray-400";
  const row = isDark ? "bg-white/3 border-white/8" : "bg-gray-50 border-gray-200";

  const isLoading = accountsQuery.isLoading || invoicesQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`w-6 h-6 border-2 rounded-full animate-spin ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-600"}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Monthly Recurring Revenue", value: fmt(mrr), sub: `${activeAccounts} active accounts`, color: "text-emerald-400" },
          { label: "Total Collected", value: fmt(totalCollected), sub: `${paidInvoices.length} paid invoices`, color: "text-blue-400" },
          { label: "Outstanding Balance", value: fmt(totalOutstanding), sub: `${openInvoices.length} open invoices`, color: totalOutstanding > 0 ? "text-orange-400" : "text-emerald-400" },
          { label: "Commissions Owed", value: fmt(totalCommissionsOwed), sub: `Rep: ${fmt(pendingRepComms)} · Partner: ${fmt(pendingPartnerComms)}`, color: "text-purple-400" },
        ].map(stat => (
          <div key={stat.label} className={`border rounded-xl p-4 ${card}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${label}`}>{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className={`text-[10px] mt-1 ${sub}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Account Health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Clients", value: totalAccounts, color: value },
          { label: "Active", value: activeAccounts, color: "text-emerald-400" },
          { label: "Past Due", value: pastDueAccounts, color: pastDueAccounts > 0 ? "text-orange-400" : value },
          { label: "Paused / Cancelled", value: accounts.filter(a => a.status === "paused" || a.status === "cancelled").length, color: value },
        ].map(stat => (
          <div key={stat.label} className={`border rounded-xl p-4 ${card}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${label}`}>{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Top Clients by MRR */}
      <div className={`border rounded-xl p-4 ${card}`}>
        <h3 className={`text-xs font-semibold mb-3 ${value}`}>Top Clients by Monthly Value</h3>
        <div className="space-y-2">
          {accounts
            .filter(a => a.status === "active")
            .sort((a, b) => b.monthlyPriceCents - a.monthlyPriceCents)
            .slice(0, 8)
            .map(acc => (
              <div key={acc.id} className={`flex items-center justify-between p-2.5 rounded-lg border ${row}`}>
                <div>
                  <p className={`text-xs font-semibold ${value}`}>{acc.businessName}</p>
                  <p className={`text-[10px] ${label}`}>{acc.clientEmail}</p>
                </div>
                <p className={`text-sm font-bold text-emerald-400`}>{fmt(acc.monthlyPriceCents)}<span className={`text-[10px] font-normal ${label}`}>/mo</span></p>
              </div>
            ))}
          {accounts.filter(a => a.status === "active").length === 0 && (
            <p className={`text-xs text-center py-4 ${sub}`}>No active accounts yet.</p>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className={`border rounded-xl p-4 ${card}`}>
        <h3 className={`text-xs font-semibold mb-3 ${value}`}>Recent Payments</h3>
        <div className="space-y-2">
          {recentPaid.length === 0 ? (
            <p className={`text-xs text-center py-4 ${sub}`}>No payments recorded yet.</p>
          ) : recentPaid.map(inv => (
            <div key={inv.id} className={`flex items-center justify-between p-2.5 rounded-lg border ${row}`}>
              <div>
                <p className={`text-xs font-semibold ${value}`}>{(inv as any).account?.businessName ?? "Unknown"}</p>
                <p className={`text-[10px] ${label}`}>{inv.invoiceNumber} · {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</p>
              </div>
              <p className={`text-sm font-bold text-emerald-400`}>{fmt(inv.totalAmountCents)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Admin Billing Panel ──────────────────────────────────────────────────────
function AdminBillingPanel({ isDark }: { isDark: boolean }) {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [newAccount, setNewAccount] = useState({
    clientName: "", clientEmail: "", clientPhone: "", businessName: "",
    websiteUrl: "", monthlyPriceCents: 4900, billingStartDate: "", adminNotes: "",
  });
  // billingStartDate is stored as MM/DD/YYYY in the form, converted to YYYY-MM-DD before sending
  function parseDateMMDDYYYY(val: string): string {
    // Accept MM/DD/YYYY and convert to YYYY-MM-DD
    const m = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return "";
    const [, mm, dd, yyyy] = m;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  const [newInvoice, setNewInvoice] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth(); // 0-indexed
    const periodStart = `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m + 1, 0).getDate();
    const periodEnd = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const due = new Date(y, m + 1, 1); // 1st of next month
    const dueDate = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-01`;
    return { periodStart, periodEnd, dueDate, discountType: "none" as "none" | "early_pay" | "annual", notes: "" };
  });
  // Line items for multi-item invoice
  const [invoiceLineItems, setInvoiceLineItems] = useState<Array<{ description: string; quantity: number; unitAmountCents: number }>>([]);
  // Preset items agents can quick-add
  const INVOICE_PRESETS = [
    { label: "Monthly Hosting & Maintenance", unitAmountCents: 0, useMonthly: true },
    { label: "Code Transfer", unitAmountCents: 60000 },
    { label: "Add-On Page", unitAmountCents: 29900 },
    { label: "SEO Setup", unitAmountCents: 49900 },
    { label: "Automation Setup", unitAmountCents: 39900 },
    { label: "Custom Feature", unitAmountCents: 0 },
  ] as const;
  function addPresetItem(preset: { label: string; unitAmountCents: number; useMonthly?: boolean }, monthlyPriceCents: number) {
    setInvoiceLineItems(prev => [...prev, {
      description: preset.label,
      quantity: 1,
      unitAmountCents: (preset as any).useMonthly ? monthlyPriceCents : preset.unitAmountCents,
    }]);
  }
  function removeLineItem(idx: number) {
    setInvoiceLineItems(prev => prev.filter((_, i) => i !== idx));
  }
  function updateLineItem(idx: number, field: "description" | "quantity" | "unitAmountCents", value: string | number) {
    setInvoiceLineItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }
  function lineItemsTotal(items: typeof invoiceLineItems) {
    return items.reduce((sum, item) => sum + item.quantity * item.unitAmountCents, 0);
  }

  const accountsQuery = trpc.clientBilling.adminListAccounts.useQuery();
  const accountDetailQuery = trpc.clientBilling.adminGetAccount.useQuery(
    { accountId: selectedAccountId! },
    { enabled: selectedAccountId !== null }
  );
  const techniciansQuery = trpc.technician.adminGetTechnicians.useQuery();
  const partnersQuery = trpc.partner.adminListPartners.useQuery();

  const createAccountMutation = trpc.clientBilling.adminCreateAccount.useMutation({
    onSuccess: () => { accountsQuery.refetch(); setShowCreateAccount(false); setNewAccount({ clientName: "", clientEmail: "", clientPhone: "", businessName: "", websiteUrl: "", monthlyPriceCents: 4900, billingStartDate: "", adminNotes: "", assignedTechnicianId: undefined, assignedPartnerId: undefined } as any); },
  });
  function handleCreateAccount() {
    const isoDate = newAccount.billingStartDate ? parseDateMMDDYYYY(newAccount.billingStartDate) : "";
    if (newAccount.billingStartDate && !isoDate) {
      alert("Invalid date format. Please use MM/DD/YYYY (e.g. 05/01/2026)");
      return;
    }
    createAccountMutation.mutate({ ...newAccount, billingStartDate: isoDate || undefined });
  }

  const createInvoiceMutation = trpc.clientBilling.adminCreateInvoice.useMutation({
    onSuccess: () => { accountDetailQuery.refetch(); setShowCreateInvoice(false); },
  });

  const markPaidMutation = trpc.clientBilling.adminMarkInvoicePaid.useMutation({
    onSuccess: () => accountDetailQuery.refetch(),
  });

  const applyLateMutation = trpc.clientBilling.adminApplyLateFee.useMutation({
    onSuccess: () => accountDetailQuery.refetch(),
  });

  const voidInvoiceMutation = trpc.clientBilling.adminVoidInvoice.useMutation({
    onSuccess: () => accountDetailQuery.refetch(),
    onError: (e) => toast.error(e.message),
  });

  const updateAccountMutation = trpc.clientBilling.adminUpdateAccount.useMutation({
    onSuccess: () => { accountsQuery.refetch(); accountDetailQuery.refetch(); },
  });

  const assignToSelfMutation = trpc.clientBilling.adminAssignToSelf.useMutation({
    onSuccess: () => {
      accountDetailQuery.refetch();
      toast.success("Account linked to your login. You can now view it in the client dashboard.");
    },
    onError: (e) => toast.error(e.message),
  });

  const accounts = accountsQuery.data ?? [];
  const detail = accountDetailQuery.data;

  function formatCents(c: number) { return `$${(c / 100).toFixed(2)}`; }
  function fmtDate(d: string | null | undefined) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }

  const STATUS_COLORS: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    paused: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
    past_due: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    open: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    overdue: "bg-red-500/15 text-red-400 border-red-500/30",
    draft: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-160px)]">
      {/* Left: Client account list */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-white/35" : "text-gray-500"}`}>Client Accounts</h3>
          <button
            onClick={() => setShowCreateAccount(true)}
            className="text-[10px] text-[oklch(0.6_0.2_25)] hover:text-[oklch(0.7_0.2_25)] font-semibold"
          >+ New</button>
        </div>
        <div className="overflow-y-auto space-y-1.5 flex-1">
          {accountsQuery.isLoading ? (
            <div className={`py-8 text-center text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}>Loading…</div>
          ) : accounts.length === 0 ? (
            <div className={`py-8 text-center text-xs ${isDark ? "text-white/25" : "text-gray-400"}`}>No client accounts yet.</div>
          ) : accounts.map(acc => (
            <button
              key={acc.id}
              onClick={() => setSelectedAccountId(acc.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
                selectedAccountId === acc.id
                  ? "bg-[oklch(0.5_0.2_25_/_15%)] border-[oklch(0.5_0.2_25_/_35%)] " + (isDark ? "text-white" : "text-gray-900")
                  : isDark ? "bg-white/3 border-white/8 text-white/50 hover:text-white hover:bg-white/6" : "bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-xs truncate">{acc.businessName}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[acc.status] ?? ""}`}>{acc.status}</span>
              </div>
              <p className="text-[10px] opacity-50 truncate mt-0.5">{formatCents(acc.monthlyPriceCents)}/mo · {acc.clientEmail}</p>
            </button>
          ))}
        </div>

        {/* Create Account Form */}
        {showCreateAccount && (
          <div className={`border rounded-xl p-4 space-y-2.5 ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
            <p className={`text-xs font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>New Client Account</p>
            {[
              { label: "Business Name *", key: "businessName" as const },
              { label: "Client Name *", key: "clientName" as const },
              { label: "Email *", key: "clientEmail" as const },
              { label: "Phone", key: "clientPhone" as const },
              { label: "Website URL", key: "websiteUrl" as const },
            ].map(f => (
              <input
                key={f.key}
                placeholder={f.label}
                value={newAccount[f.key]}
                onChange={e => setNewAccount(prev => ({ ...prev, [f.key]: e.target.value }))}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white focus:border-white/25" : "bg-white border border-gray-300 text-gray-900 focus:border-gray-400"}`}
              />
            ))}
            <div>
              <label className={`text-[10px] block mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Billing Start Date (MM/DD/YYYY)</label>
              <input
                placeholder="e.g. 05/01/2026"
                value={newAccount.billingStartDate}
                onChange={e => setNewAccount(prev => ({ ...prev, billingStartDate: e.target.value }))}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white focus:border-white/25" : "bg-white border border-gray-300 text-gray-900 focus:border-gray-400"}`}
              />
              {newAccount.billingStartDate && (
                <p className={`text-[10px] mt-0.5 ${parseDateMMDDYYYY(newAccount.billingStartDate) ? 'text-emerald-400' : 'text-red-400'}`}>
                  {parseDateMMDDYYYY(newAccount.billingStartDate) ? `→ ${parseDateMMDDYYYY(newAccount.billingStartDate)}` : 'Invalid format — use MM/DD/YYYY'}
                </p>
              )}
            </div>
            <div>
              <label className={`text-[10px] block mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Monthly Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="49.00"
                value={(newAccount.monthlyPriceCents / 100).toFixed(2)}
                onChange={e => setNewAccount(prev => ({ ...prev, monthlyPriceCents: Math.round(Number(e.target.value) * 100) }))}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white focus:border-white/25" : "bg-white border border-gray-300 text-gray-900 focus:border-gray-400"}`}
              />
              <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/30" : "text-gray-500"}`}>= {formatCents(newAccount.monthlyPriceCents)}/mo</p>
            </div>
            {/* Rep assignment */}
            <div>
              <label className={`text-[10px] block mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Assign Rep (optional)</label>
              <select
                value={(newAccount as any).assignedTechnicianId ?? ""}
                onChange={e => setNewAccount(prev => ({ ...prev, assignedTechnicianId: e.target.value ? Number(e.target.value) : undefined } as any))}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white focus:border-white/25" : "bg-white border border-gray-300 text-gray-900"}`}
              >
                <option value="">— Unassigned —</option>
                {(techniciansQuery.data ?? []).filter((t: any) => t.status === "active").map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            {/* Partner assignment */}
            <div>
              <label className={`text-[10px] block mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Assign Partner (optional)</label>
              <select
                value={(newAccount as any).assignedPartnerId ?? ""}
                onChange={e => setNewAccount(prev => ({ ...prev, assignedPartnerId: e.target.value ? Number(e.target.value) : undefined } as any))}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white focus:border-white/25" : "bg-white border border-gray-300 text-gray-900"}`}
              >
                <option value="">— Unassigned —</option>
                {(partnersQuery.data ?? []).filter((p: any) => p.status === "active").map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}{p.companyName ? ` (${p.companyName})` : ""}</option>
                ))}
              </select>
            </div>
            {createAccountMutation.error && (
              <p className="text-red-400 text-[10px] px-1">{createAccountMutation.error.message}</p>
            )}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCreateAccount}
                disabled={createAccountMutation.isPending || !newAccount.businessName || !newAccount.clientName || !newAccount.clientEmail}
                className="flex-1 py-1.5 rounded-lg bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] disabled:opacity-40 text-white text-xs font-semibold"
              >
                {createAccountMutation.isPending ? "Creating…" : "Create"}
              </button>
              <button onClick={() => setShowCreateAccount(false)} className={`flex-1 py-1.5 rounded-lg text-xs ${isDark ? "bg-white/5 hover:bg-white/10 text-white/60" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Right: Account detail */}
      <div className="flex-1 overflow-y-auto">
        {!selectedAccountId ? (
          <div className="flex items-center justify-center h-full">
            <p className={`text-sm ${isDark ? "text-white/25" : "text-gray-400"}`}>Select a client account to view details</p>
          </div>
        ) : accountDetailQuery.isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className={`w-6 h-6 border-2 rounded-full animate-spin ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-600"}`} />
          </div>
        ) : detail ? (
          <div className="space-y-4">
            {/* Account header */}
            <div className={`border rounded-xl p-4 ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200 shadow-sm"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>{detail.account.businessName}</h2>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>{detail.account.clientName} · {detail.account.clientEmail}</p>
                  {detail.account.websiteUrl && (
                    <a href={detail.account.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[oklch(0.6_0.2_25)] text-xs hover:underline mt-0.5 block">
                      {detail.account.websiteUrl}
                    </a>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{formatCents(detail.account.monthlyPriceCents)}<span className={`text-xs font-normal ${isDark ? "text-white/40" : "text-gray-400"}`}>/mo</span></p>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${STATUS_COLORS[detail.account.status] ?? ""}`}>{detail.account.status}</span>
                </div>
              </div>
              {detail.account.inviteToken && !detail.account.inviteAccepted && (
                <div className="mt-3 p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-[10px] font-medium mb-1">Invite Link (not yet accepted)</p>
                  <p className={`text-[10px] break-all mb-2 ${isDark ? "text-white/60" : "text-gray-600"}`}>{window.location.origin}/accept-invite?token={detail.account.inviteToken}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/accept-invite?token=${detail.account.inviteToken}`);
                      toast.success("Invite link copied to clipboard!");
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30 transition-colors"
                  >
                    Copy Invite Link
                  </button>
                </div>
              )}
              {detail.account.inviteAccepted && (
                <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-emerald-400 text-[10px] font-medium">✓ Client has accepted invite and linked their account</p>
                </div>
              )}
              {/* Assign Rep */}
              <div className="mt-3">
                <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>Assigned Rep</p>
                <div className="flex items-center gap-2">
                  <select
                    defaultValue={detail.account.assignedTechnicianId ?? ""}
                    key={`rep-${detail.account.id}-${detail.account.assignedTechnicianId}`}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      updateAccountMutation.mutate({ accountId: detail.account.id, assignedTechnicianId: val });
                    }}
                    className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                  >
                    <option value="">— Unassigned —</option>
                    {(techniciansQuery.data ?? []).filter((t: any) => t.status === "active").map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                    ))}
                  </select>
                  {detail.account.assignedTechnicianId && (
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${isDark ? "bg-violet-500/15 border border-violet-500/25 text-violet-300" : "bg-violet-50 border border-violet-200 text-violet-700"}`}>
                      {(techniciansQuery.data ?? []).find((t: any) => t.id === detail.account.assignedTechnicianId)?.name ?? "Assigned"}
                    </span>
                  )}
                </div>
              </div>
              {/* Admin: Assign to my account */}
              <div className="mt-2">
                <button
                  onClick={() => {
                    if (confirm(`Link account "${detail.account.businessName}" to your own login? This lets you view it in the client dashboard.`)) {
                      assignToSelfMutation.mutate({ accountId: detail.account.id });
                    }
                  }}
                  disabled={assignToSelfMutation.isPending}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-300 hover:bg-blue-500/25 transition-colors disabled:opacity-40"
                >
                  {assignToSelfMutation.isPending ? "Linking…" : "🔗 Assign to My Account (Admin Test)"}
                </button>
              </div>

              {/* Quick status change */}
              <div className="mt-3 flex gap-2">
                {(["active", "paused", "past_due", "cancelled"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => updateAccountMutation.mutate({ accountId: detail.account.id, status: s })}
                    className={`text-[10px] px-2 py-1 rounded border transition-all ${
                      detail.account.status === s
                        ? STATUS_COLORS[s]
                        : isDark ? "bg-white/3 border-white/10 text-white/40 hover:text-white/70" : "bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Invoices */}
            <div className={`border rounded-xl p-4 ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200 shadow-sm"}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Invoices</h3>
                <button
                  onClick={() => setShowCreateInvoice(true)}
                  className="text-[10px] text-[oklch(0.6_0.2_25)] hover:text-[oklch(0.7_0.2_25)] font-semibold"
                >+ New Invoice</button>
              </div>

              {showCreateInvoice && (
                <div className={`border rounded-xl p-3 mb-3 space-y-3 ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                  <p className={`text-[10px] font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Create Invoice — {detail.account.businessName}</p>

                  {/* Date fields */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Period Start", key: "periodStart" as const },
                      { label: "Period End", key: "periodEnd" as const },
                      { label: "Due Date", key: "dueDate" as const },
                    ].map(f => (
                      <div key={f.key}>
                        <p className={`text-[9px] mb-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>{f.label}</p>
                        <input
                          type="date"
                          value={newInvoice[f.key]}
                          onChange={e => setNewInvoice(prev => ({ ...prev, [f.key]: e.target.value }))}
                          className={`w-full rounded-lg px-2 py-1.5 text-[10px] focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white focus:border-white/25 [color-scheme:dark]" : "bg-white border border-gray-300 text-gray-900"}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Discount */}
                  <div className="flex items-center gap-2">
                    <p className={`text-[9px] ${isDark ? "text-white/40" : "text-gray-500"}`}>Discount:</p>
                    <select
                      value={newInvoice.discountType}
                      onChange={e => setNewInvoice(prev => ({ ...prev, discountType: e.target.value as any }))}
                      className={`rounded-lg px-2 py-1 text-[10px] focus:outline-none ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-300 text-gray-900"}`}
                    >
                      <option value="none">No Discount</option>
                      <option value="early_pay">5% Early Pay</option>
                      <option value="annual">15% Annual</option>
                    </select>
                  </div>

                  {/* Quick-add presets */}
                  <div>
                    <p className={`text-[9px] font-semibold mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>QUICK ADD</p>
                    <div className="flex flex-wrap gap-1">
                      {INVOICE_PRESETS.map(preset => (
                        <button
                          key={preset.label}
                          onClick={() => addPresetItem(preset as any, detail.account.monthlyPriceCents)}
                          className={`text-[9px] px-2 py-1 rounded-md border font-medium transition-colors ${
                            preset.label === "Code Transfer"
                              ? "bg-[oklch(0.5_0.2_25_/_20%)] border-[oklch(0.5_0.2_25_/_40%)] text-[oklch(0.7_0.2_25)] hover:bg-[oklch(0.5_0.2_25_/_35%)]"
                              : isDark ? "bg-white/5 border-white/15 text-white/60 hover:bg-white/10" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          + {preset.label}{preset.label === "Code Transfer" ? " ($600)" : ""}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Line items table */}
                  {invoiceLineItems.length > 0 && (
                    <div>
                      <p className={`text-[9px] font-semibold mb-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>LINE ITEMS</p>
                      <div className="space-y-1">
                        {invoiceLineItems.map((item, idx) => (
                          <div key={idx} className={`flex items-center gap-1.5 p-1.5 rounded-lg ${isDark ? "bg-white/5" : "bg-white border border-gray-200"}`}>
                            <input
                              value={item.description}
                              onChange={e => updateLineItem(idx, "description", e.target.value)}
                              placeholder="Description"
                              className={`flex-1 text-[10px] bg-transparent focus:outline-none ${isDark ? "text-white placeholder-white/30" : "text-gray-900 placeholder-gray-400"}`}
                            />
                            <input
                              type="number" min="1"
                              value={item.quantity}
                              onChange={e => updateLineItem(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                              className={`w-10 text-center text-[10px] rounded bg-transparent focus:outline-none ${isDark ? "text-white" : "text-gray-900"}`}
                            />
                            <span className={`text-[9px] ${isDark ? "text-white/40" : "text-gray-400"}`}>×</span>
                            <input
                              type="number" min="0" step="0.01"
                              value={(item.unitAmountCents / 100).toFixed(2)}
                              onChange={e => updateLineItem(idx, "unitAmountCents", Math.round(parseFloat(e.target.value || "0") * 100))}
                              className={`w-16 text-right text-[10px] rounded bg-transparent focus:outline-none ${isDark ? "text-white" : "text-gray-900"}`}
                            />
                            <span className={`text-[9px] font-medium w-14 text-right ${isDark ? "text-white/60" : "text-gray-600"}`}>{formatCents(item.quantity * item.unitAmountCents)}</span>
                            <button onClick={() => removeLineItem(idx)} className="text-red-400 hover:text-red-300 text-[10px] ml-1">×</button>
                          </div>
                        ))}
                      </div>
                      {/* Total */}
                      <div className={`flex justify-between items-center mt-2 pt-2 border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
                        <span className={`text-[9px] ${isDark ? "text-white/40" : "text-gray-500"}`}>
                          {newInvoice.discountType !== "none" && `Subtotal: ${formatCents(lineItemsTotal(invoiceLineItems))} → `}
                          {newInvoice.discountType === "early_pay" && `After -5%: `}
                          {newInvoice.discountType === "annual" && `After -15%: `}
                        </span>
                        <span className={`text-[11px] font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                          Total: {formatCents(
                            newInvoice.discountType === "early_pay" ? Math.round(lineItemsTotal(invoiceLineItems) * 0.95)
                            : newInvoice.discountType === "annual" ? Math.round(lineItemsTotal(invoiceLineItems) * 0.85)
                            : lineItemsTotal(invoiceLineItems)
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Add blank row */}
                  <button
                    onClick={() => setInvoiceLineItems(prev => [...prev, { description: "", quantity: 1, unitAmountCents: 0 }])}
                    className={`text-[9px] font-medium ${isDark ? "text-white/40 hover:text-white/60" : "text-gray-400 hover:text-gray-600"}`}
                  >+ Add custom line item</button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        createInvoiceMutation.mutate({
                          clientAccountId: detail.account.id,
                          ...newInvoice,
                          items: invoiceLineItems.length > 0 ? invoiceLineItems : undefined,
                        });
                        setInvoiceLineItems([]);
                      }}
                      disabled={createInvoiceMutation.isPending || !newInvoice.periodStart || !newInvoice.dueDate}
                      className="flex-1 py-1.5 rounded-lg bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] disabled:opacity-40 text-white text-[10px] font-semibold"
                    >
                      {createInvoiceMutation.isPending ? "Creating…" : `Create Invoice${invoiceLineItems.length > 0 ? ` (${invoiceLineItems.length} item${invoiceLineItems.length > 1 ? "s" : ""})` : ""}`}
                    </button>
                    <button
                      onClick={() => { setShowCreateInvoice(false); setInvoiceLineItems([]); }}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] ${isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-gray-600"}`}
                    >Cancel</button>
                  </div>
                </div>
              )}

              {detail.invoices.length === 0 ? (
                <p className={`text-xs text-center py-4 ${isDark ? "text-white/25" : "text-gray-400"}`}>No invoices yet.</p>
              ) : (
                <div className="space-y-2">
                  {detail.invoices.map(inv => (
                    <div key={inv.id} className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? "bg-white/3 border-white/8" : "bg-gray-50 border-gray-200"}`}>
                      <div>
                        <p className={`text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{inv.invoiceNumber}</p>
                        <p className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-500"}`}>{fmtDate(inv.periodStart)} – {fmtDate(inv.periodEnd)} · Due {fmtDate(inv.dueDate)}</p>
                        <div className="flex gap-1.5 mt-1">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[inv.status] ?? ""}`}>{inv.status}</span>
                          {inv.discountType !== "none" && <span className="text-[9px] px-1.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{inv.discountType === "early_pay" ? "-5%" : "-15%"}</span>}
                          {inv.lateFeeCents > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded border bg-red-500/10 text-red-400 border-red-500/20">+15% late</span>}
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <p className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{formatCents(inv.totalAmountCents)}</p>
                        <div className="flex gap-1">
                          {/* View Invoice — opens the public invoice page */}
                          {inv.shareToken && (
                            <a
                              href={`/invoice/${inv.shareToken}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[9px] px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                              title="View invoice"
                            >
                              <ExternalLink className="w-2.5 h-2.5" /> View
                            </a>
                          )}
                          {/* Copy shareable link */}
                          {inv.shareToken && (
                            <button
                              onClick={() => {
                                const url = `${window.location.origin}/invoice/${inv.shareToken}`;
                                navigator.clipboard.writeText(url).then(() => toast.success("Invoice link copied!"));
                              }}
                              className="inline-flex items-center gap-1 text-[9px] px-2 py-1 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
                              title="Copy shareable link"
                            >
                              <Link2 className="w-2.5 h-2.5" /> Copy Link
                            </button>
                          )}
                          {inv.status !== "paid" && inv.status !== "void" && (
                            <>
                              <button
                                onClick={() => markPaidMutation.mutate({ invoiceId: inv.id })}
                                className="text-[9px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                              >Mark Paid</button>
                              {inv.status !== "overdue" && (
                                <button
                                  onClick={() => applyLateMutation.mutate({ invoiceId: inv.id })}
                                  className="text-[9px] px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                                >Late Fee</button>
                              )}
                              <button
                                onClick={() => {
                                  if (window.confirm(`Void invoice #${inv.invoiceNumber}? This cannot be undone.`)) {
                                    voidInvoiceMutation.mutate({ invoiceId: inv.id });
                                  }
                                }}
                                disabled={voidInvoiceMutation.isPending}
                                className="text-[9px] px-2 py-1 rounded bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border border-gray-500/30 disabled:opacity-40"
                              >Void</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Media */}
            <div className={`border rounded-xl p-4 ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200 shadow-sm"}`}>
              <h3 className={`text-xs font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Client Media ({detail.media.length} files)</h3>
              {detail.media.length === 0 ? (
                <p className={`text-xs text-center py-4 ${isDark ? "text-white/25" : "text-gray-400"}`}>No media uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {detail.media.map(m => (
                    <div key={m.id} className={`relative rounded-lg overflow-hidden aspect-square border group ${isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"}`}>
                      {m.mediaType === "photo" ? (
                        <img src={m.fileUrl} alt={m.fileName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className={`text-[10px] text-center px-1 truncate ${isDark ? "text-white/30" : "text-gray-500"}`}>{m.fileName}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="text-white text-[10px] underline">View</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Admin Pages Panel ────────────────────────────────────────────────────────
function AdminPagesPanel({ isDark, clientAccountId, clientName }: { isDark: boolean; clientAccountId: number; clientName: string }) {
  const utils = trpc.useUtils();
  const { data: pages, isLoading } = trpc.clientBilling.adminGetPages.useQuery({ clientAccountId });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", path: "", description: "", status: "live" as "live" | "draft" | "in_progress", sortOrder: 0 });

  const addPage = trpc.clientBilling.adminAddPage.useMutation({
    onSuccess: () => { utils.clientBilling.adminGetPages.invalidate({ clientAccountId }); setShowAddForm(false); setForm({ title: "", path: "", description: "", status: "live", sortOrder: 0 }); toast.success("Page added"); },
    onError: (e) => toast.error(e.message),
  });
  const updatePage = trpc.clientBilling.adminUpdatePage.useMutation({
    onSuccess: () => { utils.clientBilling.adminGetPages.invalidate({ clientAccountId }); setEditingPageId(null); toast.success("Page updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deletePage = trpc.clientBilling.adminDeletePage.useMutation({
    onSuccess: () => { utils.clientBilling.adminGetPages.invalidate({ clientAccountId }); toast.success("Page deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const statusConfig = {
    live:        { label: "Live",        cls: isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border-emerald-300" },
    draft:       { label: "Draft",       cls: isDark ? "bg-white/10 text-white/50 border-white/15" : "bg-gray-100 text-gray-600 border-gray-300" },
    in_progress: { label: "In Progress", cls: isDark ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-amber-100 text-amber-700 border-amber-300" },
  };

  const inputCls = `w-full px-3 py-2 rounded-lg text-xs border outline-none transition-all ${isDark ? "bg-white/5 border-white/15 text-white placeholder-white/30 focus:border-indigo-400/60" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400"}`;
  const selectCls = `px-3 py-2 rounded-lg text-xs border outline-none transition-all ${isDark ? "bg-white/5 border-white/15 text-white focus:border-indigo-400/60" : "bg-white border-gray-200 text-gray-900 focus:border-indigo-400"}`;

  return (
    <div className={`mt-3 rounded-xl border p-4 ${isDark ? "bg-indigo-500/5 border-indigo-500/20" : "bg-indigo-50 border-indigo-200"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={14} className={isDark ? "text-indigo-300" : "text-indigo-600"} />
          <span className={`text-sm font-semibold ${isDark ? "text-indigo-200" : "text-indigo-800"}`}>
            Pages — {clientName}
          </span>
          {pages && <span className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}>({pages.length})</span>}
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingPageId(null); }}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${isDark ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30" : "bg-indigo-100 border border-indigo-300 text-indigo-700 hover:bg-indigo-200"}`}
        >
          <Plus size={11} /> Add Page
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className={`mb-3 p-3 rounded-lg border ${isDark ? "bg-white/3 border-white/10" : "bg-white border-gray-200"}`}>
          <p className={`text-xs font-semibold mb-2 ${isDark ? "text-white/60" : "text-gray-600"}`}>New Page</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input className={inputCls} placeholder="Title (e.g. Home)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <input className={inputCls} placeholder="Path (e.g. /about)" value={form.path} onChange={e => setForm(f => ({ ...f, path: e.target.value }))} />
          </div>
          <input className={`${inputCls} mb-2`} placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex items-center gap-2">
            <select className={selectCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as "live" | "draft" | "in_progress" }))}>
              <option value="live">Live</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
            </select>
            <input type="number" className={`${inputCls} w-24`} placeholder="Order" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
            <button
              onClick={() => addPage.mutate({ clientAccountId, ...form })}
              disabled={!form.title || !form.path || addPage.isPending}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {addPage.isPending ? "Adding…" : "Add"}
            </button>
            <button onClick={() => setShowAddForm(false)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${isDark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-600"}`}>Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className={`w-5 h-5 border-2 rounded-full animate-spin ${isDark ? "border-white/20 border-t-indigo-400" : "border-gray-200 border-t-indigo-600"}`} />
        </div>
      ) : !pages || pages.length === 0 ? (
        <p className={`text-xs text-center py-4 ${isDark ? "text-white/25" : "text-gray-400"}`}>No pages yet. Click "Add Page" to create the first one.</p>
      ) : (
        <div className="space-y-2">
          {pages.map(page => {
            const sc = statusConfig[page.status as keyof typeof statusConfig] ?? statusConfig.live;
            const isEditing = editingPageId === page.id;
            return (
              <div key={page.id} className={`rounded-lg border p-3 ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200"}`}>
                {isEditing ? (
                  <EditPageForm
                    isDark={isDark}
                    page={page}
                    onSave={(data) => updatePage.mutate({ id: page.id, ...data })}
                    onCancel={() => setEditingPageId(null)}
                    isPending={updatePage.isPending}
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold truncate ${isDark ? "text-white/80" : "text-gray-800"}`}>{page.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${sc.cls}`}>{sc.label}</span>
                      </div>
                      <span className={`text-[10px] font-mono ${isDark ? "text-white/30" : "text-gray-400"}`}>{page.path}</span>
                      {page.description && <p className={`text-[10px] mt-0.5 truncate ${isDark ? "text-white/35" : "text-gray-500"}`}>{page.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setEditingPageId(page.id)} className={`p-1.5 rounded-lg transition-all ${isDark ? "text-white/30 hover:text-white/70 hover:bg-white/8" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}><Pencil size={12} /></button>
                      <button onClick={() => { if (confirm(`Delete "${page.title}"?`)) deletePage.mutate({ id: page.id }); }} className={`p-1.5 rounded-lg transition-all ${isDark ? "text-red-400/50 hover:text-red-400 hover:bg-red-500/10" : "text-red-400 hover:text-red-600 hover:bg-red-50"}`}><Trash2 size={12} /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EditPageForm({
  isDark, page, onSave, onCancel, isPending,
}: {
  isDark: boolean;
  page: { title: string; path: string; description: string | null; status: string; sortOrder: number };
  onSave: (data: { title: string; path: string; description: string; status: "live" | "draft" | "in_progress"; sortOrder: number }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    title: page.title,
    path: page.path,
    description: page.description ?? "",
    status: page.status as "live" | "draft" | "in_progress",
    sortOrder: page.sortOrder,
  });
  const inputCls = `w-full px-3 py-2 rounded-lg text-xs border outline-none transition-all ${isDark ? "bg-white/5 border-white/15 text-white placeholder-white/30 focus:border-indigo-400/60" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400"}`;
  const selectCls = `px-3 py-2 rounded-lg text-xs border outline-none transition-all ${isDark ? "bg-white/5 border-white/15 text-white focus:border-indigo-400/60" : "bg-white border-gray-200 text-gray-900 focus:border-indigo-400"}`;
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" />
        <input className={inputCls} value={form.path} onChange={e => setForm(f => ({ ...f, path: e.target.value }))} placeholder="Path" />
      </div>
      <input className={`${inputCls} mb-2`} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
      <div className="flex items-center gap-2">
        <select className={selectCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as "live" | "draft" | "in_progress" }))}>
          <option value="live">Live</option>
          <option value="draft">Draft</option>
          <option value="in_progress">In Progress</option>
        </select>
        <input type="number" className={`${inputCls} w-20`} value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} placeholder="Order" />
        <button onClick={() => onSave(form)} disabled={!form.title || !form.path || isPending} className="px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all">
          {isPending ? "Saving…" : "Save"}
        </button>
        <button onClick={onCancel} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${isDark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-600"}`}>Cancel</button>
      </div>
    </div>
  );
}

// ─── SMS Inbox Panel ─────────────────────────────────────────────────────────
function SmsInboxPanel({
  isDark,
  leads,
  customers,
}: {
  isDark: boolean;
  leads: Array<{ id: number; businessName: string; phone: string | null }>;
  customers: Array<{ id: string; businessName: string; phone: string }>;
}) {
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");
  const [smsOpen, setSmsOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "unread">("all");

  const inboxQuery = trpc.communications.getInbox.useQuery(
    { limit: 200, onlyInbound: filterMode === "unread" },
    { refetchInterval: 30_000 }
  );

  const inbox = inboxQuery.data ?? [];

  // Build a phone → name lookup from leads and customers
  const nameByPhone = new Map<string, string>();
  for (const l of leads) {
    if (l.phone) {
      const key = l.phone.replace(/\D/g, "").slice(-10);
      if (!nameByPhone.has(key)) nameByPhone.set(key, l.businessName);
    }
  }
  for (const c of customers) {
    if (c.phone) {
      const key = c.phone.replace(/\D/g, "").slice(-10);
      if (!nameByPhone.has(key)) nameByPhone.set(key, c.businessName);
    }
  }

  function getContactName(phone: string) {
    const key = phone.replace(/\D/g, "").slice(-10);
    return nameByPhone.get(key) ?? phone;
  }

  function formatRelative(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  type InboxEntry = NonNullable<typeof inboxQuery.data>[number];
  const totalUnread = inbox.reduce((sum: number, e: InboxEntry) => sum + e.unreadCount, 0);

  return (
    <div className="flex gap-0 h-[calc(100vh-160px)]">
      {/* Left panel: conversation list */}
      <div className={`w-80 flex-shrink-0 flex flex-col border-r ${isDark ? "border-white/8" : "border-gray-200"}`}>
        {/* Header */}
        <div className={`px-4 py-3 border-b ${isDark ? "border-white/8" : "border-gray-100"}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Inbox size={16} className="text-cyan-400" />
              <h2 className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>SMS Inbox</h2>
              {totalUnread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                  {totalUnread}
                </span>
              )}
            </div>
            <button
              onClick={() => inboxQuery.refetch()}
              className={`p-1 rounded transition-all ${isDark ? "text-white/30 hover:text-white/70" : "text-gray-400 hover:text-gray-700"}`}
              title="Refresh"
            >
              <RefreshCw size={13} className={inboxQuery.isFetching ? "animate-spin" : ""} />
            </button>
          </div>
          {/* Filter toggle */}
          <div className={`flex rounded-lg overflow-hidden border text-xs ${isDark ? "border-white/10" : "border-gray-200"}`}>
            {(["all", "unread"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`flex-1 py-1 font-medium capitalize transition-all ${
                  filterMode === mode
                    ? isDark ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-100 text-cyan-700"
                    : isDark ? "text-white/40 hover:text-white/70" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {mode === "unread" ? `Unread${totalUnread > 0 ? ` (${totalUnread})` : ""}` : "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {inboxQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className={`w-6 h-6 border-2 rounded-full animate-spin ${isDark ? "border-white/20 border-t-white/60" : "border-gray-200 border-t-gray-600"}`} />
            </div>
          ) : inbox.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Inbox size={32} className={`mb-3 ${isDark ? "text-white/15" : "text-gray-300"}`} />
              <p className={`text-sm font-medium ${isDark ? "text-white/40" : "text-gray-500"}`}>
                {filterMode === "unread" ? "No unread replies" : "No messages yet"}
              </p>
              <p className={`text-xs mt-1 ${isDark ? "text-white/25" : "text-gray-400"}`}>
                {filterMode === "unread" ? "All caught up!" : "Send a text from a lead or customer card to get started."}
              </p>
            </div>
          ) : (
            inbox.map((entry: InboxEntry) => {
              const name = getContactName(entry.contactPhone);
              const isSelected = selectedPhone === entry.contactPhone;
              return (
                <button
                  key={entry.contactPhone}
                  onClick={() => {
                    setSelectedPhone(entry.contactPhone);
                    setSelectedName(name);
                    setSmsOpen(true);
                  }}
                  className={`w-full text-left px-4 py-3 border-b transition-all ${
                    isDark ? "border-white/5" : "border-gray-50"
                  } ${
                    isSelected
                      ? isDark ? "bg-cyan-500/10 border-l-2 border-l-cyan-500" : "bg-cyan-50 border-l-2 border-l-cyan-500"
                      : isDark ? "hover:bg-white/4" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className={`text-xs font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>{name}</p>
                        {entry.unreadCount > 0 && (
                          <span className="flex-shrink-0 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                            {entry.unreadCount > 9 ? "9+" : entry.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate ${isDark ? "text-white/40" : "text-gray-500"}`}>
                        {entry.lastDirection === "outbound" ? "You: " : ""}
                        {entry.lastMessage}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/25" : "text-gray-400"}`}>
                        {entry.contactPhone}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-400"}`}>
                        {formatRelative(entry.lastMessageAt)}
                      </p>
                      <div className={`mt-1 w-2 h-2 rounded-full mx-auto ${
                        entry.lastDirection === "inbound" ? "bg-cyan-400" : isDark ? "bg-white/15" : "bg-gray-300"
                      }`} title={entry.lastDirection === "inbound" ? "Last message was inbound" : "Last message was outbound"} />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel: conversation thread */}
      <div className={`flex-1 flex flex-col ${isDark ? "bg-white/1" : "bg-gray-50"}`}>
        {!selectedPhone ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-white border border-gray-200"}`}>
              <MessageSquare size={28} className={isDark ? "text-white/20" : "text-gray-300"} />
            </div>
            <p className={`text-sm font-medium ${isDark ? "text-white/40" : "text-gray-500"}`}>Select a conversation</p>
            <p className={`text-xs ${isDark ? "text-white/20" : "text-gray-400"}`}>Choose a contact from the left to view the full thread</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Contact header */}
            <div className={`px-5 py-3 border-b flex items-center justify-between ${isDark ? "border-white/8 bg-white/2" : "border-gray-200 bg-white"}`}>
              <div>
                <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{selectedName}</p>
                <p className={`text-xs ${isDark ? "text-white/35" : "text-gray-500"}`}>{selectedPhone}</p>
              </div>
              <button
                onClick={() => setSmsOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-all flex items-center gap-1.5"
              >
                <MessageSquare size={12} />
                Open Thread
              </button>
            </div>
            {/* Placeholder message */}
            <div className="flex-1 flex items-center justify-center">
              <p className={`text-sm ${isDark ? "text-white/25" : "text-gray-400"}`}>
                Click "Open Thread" to view and reply to this conversation
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SmsModal for selected contact */}
      {selectedPhone && (
        <SmsModal
          open={smsOpen}
          onClose={() => setSmsOpen(false)}
          contactName={selectedName}
          contactPhone={selectedPhone}
        />
      )}
    </div>
  );
}

// ─── Admin Invoices Panel ──────────────────────────────────────────────────────
function AdminInvoicesPanel({ isDark }: { isDark: boolean }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [repFilter, setRepFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const invoicesQuery = trpc.clientBilling.adminListInvoices.useQuery();
  const markPaidMutation = trpc.clientBilling.adminMarkInvoicePaid.useMutation({
    onSuccess: () => { invoicesQuery.refetch(); toast.success("Invoice marked as paid. Commission recorded."); },
    onError: (e: { message: string }) => toast.error(e.message),
  });

   const invoices = invoicesQuery.data ?? [];
  const uniqueReps = Array.from(new Set(invoices.filter(i => i.repName).map(i => i.repName as string))).sort();
  const filtered = invoices.filter(inv => {
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchRep = repFilter === "all" || inv.repName === repFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (inv.account?.businessName ?? "").toLowerCase().includes(q) ||
      (inv.account?.clientName ?? "").toLowerCase().includes(q) ||
      (inv.repName ?? "").toLowerCase().includes(q) ||
      (inv.invoiceNumber ?? "").toLowerCase().includes(q);
    return matchStatus && matchRep && matchSearch;
  });

  // Summary stats
  const totalInvoiced = invoices.reduce((s, i) => s + i.totalAmountCents, 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.totalAmountCents, 0);
  const totalCommission = invoices
    .filter(i => i.status === "paid" && i.commissionAmountCents)
    .reduce((s, i) => s + (i.commissionAmountCents ?? 0), 0);
  const pendingCount = invoices.filter(i => i.status === "open" || i.status === "overdue").length;

  function fmt$(cents: number) { return `$${(cents / 100).toFixed(2)}`; }
  function fmtDate(d: string | null | undefined) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const STATUS_BADGE: Record<string, string> = {
    paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    open: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    overdue: "bg-red-500/15 text-red-400 border-red-500/30",
    draft: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    void: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  const COMMISSION_BADGE: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    voided: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Invoiced", value: fmt$(totalInvoiced), icon: FileText, color: "text-blue-400" },
          { label: "Total Collected", value: fmt$(totalPaid), icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Rep Commissions Earned", value: fmt$(totalCommission), icon: DollarSign, color: "text-yellow-400" },
          { label: "Pending / Overdue", value: String(pendingCount), icon: AlertTriangle, color: "text-orange-400" },
        ].map(card => (
          <div key={card.label} className={`p-4 rounded-xl border ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-1">
              <card.icon size={14} className={card.color} />
              <span className={`text-[10px] font-medium uppercase tracking-wider ${isDark ? "text-white/40" : "text-gray-500"}`}>{card.label}</span>
            </div>
            <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap items-center gap-2 p-3 rounded-xl border ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200"}`}>
        <div className={`flex items-center gap-1.5 flex-1 min-w-[180px] px-2.5 py-1.5 rounded-lg border text-xs ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}>
          <Search size={12} className="opacity-40 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search client, rep, invoice #…"
            className="bg-transparent outline-none flex-1 min-w-0"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["all", "open", "paid", "overdue", "draft", "void"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all capitalize ${
                statusFilter === s
                  ? "bg-[oklch(0.5_0.2_25)] border-[oklch(0.5_0.2_25)] text-white"
                  : isDark ? "bg-white/5 border-white/10 text-white/50 hover:text-white" : "bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-900"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
         </div>
        {uniqueReps.length > 0 && (
          <select
            value={repFilter}
            onChange={e => setRepFilter(e.target.value)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-gray-100 border-gray-200 text-gray-700"}`}
          >
            <option value="all">All Reps</option>
            {uniqueReps.map(rep => (
              <option key={rep} value={rep}>{rep}</option>
            ))}
          </select>
        )}
      </div>
      {/* Table */}
      <div className={`rounded-xl border overflow-hidden ${isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-200"}`}>
        {invoicesQuery.isLoading ? (
          <div className={`py-16 text-center text-sm ${isDark ? "text-white/25" : "text-gray-400"}`}>Loading invoices…</div>
        ) : filtered.length === 0 ? (
          <div className={`py-16 text-center text-sm ${isDark ? "text-white/25" : "text-gray-400"}`}>No invoices found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={`border-b ${isDark ? "border-white/8 bg-white/2" : "border-gray-100 bg-gray-50"}`}>
                  {["Invoice #", "Client", "Sent By (Rep)", "Date", "Due", "Amount", "Status", "Commission", "Commission Status", "Actions"].map(h => (
                    <th key={h} className={`px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider ${isDark ? "text-white/30" : "text-gray-500"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => {
                  const commRate = inv.commissionRate ?? 15;
                  const commAmt = inv.commissionAmountCents ?? Math.round(inv.totalAmountCents * commRate / 100);
                  return (
                    <tr
                      key={inv.id}
                      className={`border-b transition-colors ${isDark ? "border-white/5 hover:bg-white/3" : "border-gray-50 hover:bg-gray-50"} ${i % 2 === 0 ? "" : isDark ? "bg-white/1" : "bg-gray-50/50"}`}
                    >
                      <td className={`px-3 py-2.5 font-mono font-semibold ${isDark ? "text-white/70" : "text-gray-700"}`}>
                        {inv.invoiceNumber ?? `INV-${inv.id}`}
                      </td>
                      <td className={`px-3 py-2.5 ${isDark ? "text-white/80" : "text-gray-800"}`}>
                        <p className="font-semibold">{inv.account?.businessName ?? "—"}</p>
                        <p className={`text-[10px] ${isDark ? "text-white/35" : "text-gray-400"}`}>{inv.account?.clientName ?? ""}</p>
                      </td>
                      <td className={`px-3 py-2.5 ${isDark ? "text-white/70" : "text-gray-700"}`}>
                        {inv.repName ? (
                          <div>
                            <p className="font-medium">{inv.repName}</p>
                            <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-400"}`}>{inv.repEmail ?? ""}</p>
                          </div>
                        ) : (
                          <span className={isDark ? "text-white/25" : "text-gray-300"}>—</span>
                        )}
                      </td>
                      <td className={`px-3 py-2.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>{fmtDate(inv.createdAt as unknown as string)}</td>
                      <td className={`px-3 py-2.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>{fmtDate(inv.dueDate)}</td>
                      <td className={`px-3 py-2.5 font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{fmt$(inv.totalAmountCents)}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize ${STATUS_BADGE[inv.status] ?? ""}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className={`px-3 py-2.5 font-semibold ${inv.repName ? (isDark ? "text-yellow-400" : "text-yellow-600") : (isDark ? "text-white/20" : "text-gray-300")}`}>
                        {inv.repName ? `${fmt$(commAmt)} (${commRate}%)` : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        {inv.repName ? (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize ${COMMISSION_BADGE[inv.commissionStatus ?? "pending"] ?? COMMISSION_BADGE.pending}`}>
                            {inv.commissionStatus ?? (inv.status === "paid" ? "pending" : "—")}
                          </span>
                        ) : (
                          <span className={isDark ? "text-white/20" : "text-gray-300"}>—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {inv.status !== "paid" && inv.status !== "void" && (
                          <button
                            onClick={() => markPaidMutation.mutate({ invoiceId: inv.id })}
                            disabled={markPaidMutation.isPending}
                            className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors font-semibold"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Confirmed Bookings Panel ────────────────────────────────────────────────
const BOOKING_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "text-yellow-300",  bg: "bg-yellow-500/15 border-yellow-500/30" },
  claimed:   { label: "Claimed",   color: "text-blue-300",    bg: "bg-blue-500/15 border-blue-500/30" },
  confirmed: { label: "Confirmed", color: "text-teal-300",    bg: "bg-teal-500/15 border-teal-500/30" },
  completed: { label: "Completed", color: "text-green-300",   bg: "bg-green-500/15 border-green-500/30" },
  cancelled: { label: "Cancelled", color: "text-red-300",     bg: "bg-red-500/15 border-red-500/30" },
  no_show:   { label: "No Show",   color: "text-orange-300",  bg: "bg-orange-500/15 border-orange-500/30" },
};

function BookingsPanel({ isDark }: { isDark: boolean }) {
  const utils = trpc.useUtils();
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [repNotes, setRepNotes] = useState<Record<number, string>>({});
  const [scheduledAt, setScheduledAt] = useState<Record<number, string>>({});

  const [addForm, setAddForm] = useState({
    prospectName: "",
    prospectEmail: "",
    prospectPhone: "",
    businessName: "",
    businessType: "",
    source: "marketing",
    notes: "",
    preferredDate: "",
    preferredTime: "",
  });

  const { data: stats } = trpc.bookings.stats.useQuery();
  const { data: bookings, isLoading } = trpc.bookings.list.useQuery({ status: statusFilter });

  const addMutation = trpc.bookings.add.useMutation({
    onSuccess: () => {
      utils.bookings.list.invalidate();
      utils.bookings.stats.invalidate();
      setShowAddModal(false);
      setAddForm({ prospectName: "", prospectEmail: "", prospectPhone: "", businessName: "", businessType: "", source: "marketing", notes: "", preferredDate: "", preferredTime: "" });
      toast.success("Booking added to the queue!");
    },
    onError: (e) => toast.error(e.message),
  });

  const claimMutation = trpc.bookings.claim.useMutation({
    onSuccess: () => {
      utils.bookings.list.invalidate();
      utils.bookings.stats.invalidate();
      toast.success("Booking claimed! You're now responsible for this call.");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateStatusMutation = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      utils.bookings.list.invalidate();
      utils.bookings.stats.invalidate();
      toast.success("Booking updated.");
    },
    onError: (e) => toast.error(e.message),
  });

  const unclaimMutation = trpc.bookings.unclaim.useMutation({
    onSuccess: () => {
      utils.bookings.list.invalidate();
      utils.bookings.stats.invalidate();
      toast.success("Booking released back to the queue.");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.bookings.delete.useMutation({
    onSuccess: () => {
      utils.bookings.list.invalidate();
      utils.bookings.stats.invalidate();
      toast.success("Booking deleted.");
    },
    onError: (e) => toast.error(e.message),
  });

  const cardBase = isDark
    ? "bg-white/5 border border-white/10 rounded-xl"
    : "bg-white border border-gray-200 rounded-xl shadow-sm";

  const statCards = [
    { label: "Total", value: stats?.total ?? 0, color: "text-white" },
    { label: "Pending", value: stats?.pending ?? 0, color: "text-yellow-400" },
    { label: "Claimed", value: stats?.claimed ?? 0, color: "text-blue-400" },
    { label: "Confirmed", value: stats?.confirmed ?? 0, color: "text-teal-400" },
    { label: "Completed", value: stats?.completed ?? 0, color: "text-green-400" },
    { label: "No Show", value: stats?.no_show ?? 0, color: "text-orange-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Confirmed Bookings
          </h2>
          <p className={`text-sm mt-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>
            Inbound appointment requests from marketing — reps can claim and confirm calls.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Booking
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className={`${cardBase} p-3 text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className={`text-xs mt-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "claimed", "confirmed", "completed", "cancelled", "no_show"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              statusFilter === s
                ? "bg-teal-600 text-white"
                : isDark
                ? "bg-white/5 text-white/60 hover:bg-white/10"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-teal-400" size={28} />
        </div>
      ) : !bookings?.length ? (
        <div className={`${cardBase} p-12 text-center`}>
          <CalendarCheck size={40} className={`mx-auto mb-3 ${isDark ? "text-white/20" : "text-gray-300"}`} />
          <p className={isDark ? "text-white/40" : "text-gray-400"}>
            {statusFilter === "all" ? "No bookings yet. Add one from marketing leads." : `No ${statusFilter.replace("_", " ")} bookings.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b: any) => {
            const sc = BOOKING_STATUS_CONFIG[b.status] ?? BOOKING_STATUS_CONFIG.pending;
            const isExpanded = expandedId === b.id;
            return (
              <div key={b.id} className={`${cardBase} overflow-hidden`}>
                {/* Row */}
                <div
                  className={`flex items-center gap-4 p-4 cursor-pointer ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"} transition-colors`}
                  onClick={() => setExpandedId(isExpanded ? null : b.id)}
                >
                  <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${isDark ? "bg-teal-500/20" : "bg-teal-100"}`}>
                    <CalendarClock size={18} className="text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{b.prospectName}</span>
                      {b.businessName && (
                        <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>· {b.businessName}</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                    </div>
                    <div className={`flex items-center gap-3 mt-1 text-xs ${isDark ? "text-white/40" : "text-gray-400"} flex-wrap`}>
                      <span className="flex items-center gap-1"><Mail size={11} />{b.prospectEmail}</span>
                      {b.prospectPhone && <span className="flex items-center gap-1"><Phone size={11} />{b.prospectPhone}</span>}
                      {b.source && <span className="flex items-center gap-1"><Tag size={11} />{b.source}</span>}
                      {b.claimedByName && <span className="flex items-center gap-1"><UserCheck size={11} />Claimed by {b.claimedByName}</span>}
                      <span className="flex items-center gap-1"><Calendar size={11} />{new Date(b.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {b.status === "pending" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); claimMutation.mutate({ bookingId: b.id }); }}
                        disabled={claimMutation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <PhoneOutgoing size={13} />
                        Claim
                      </button>
                    )}
                    <ChevronDown size={16} className={`${isDark ? "text-white/30" : "text-gray-400"} transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className={`border-t ${isDark ? "border-white/10 bg-white/3" : "border-gray-100 bg-gray-50"} p-4 space-y-4`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-xs font-medium mb-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>Preferred Date / Time</p>
                        <p className={`text-sm ${isDark ? "text-white/80" : "text-gray-700"}`}>
                          {b.preferredDate || "—"} {b.preferredTime ? `at ${b.preferredTime}` : ""}
                          {b.timezone ? ` (${b.timezone})` : ""}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs font-medium mb-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>Business Type</p>
                        <p className={`text-sm ${isDark ? "text-white/80" : "text-gray-700"}`}>{b.businessType || "—"}</p>
                      </div>
                      {b.notes && (
                        <div className="sm:col-span-2">
                          <p className={`text-xs font-medium mb-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>Notes</p>
                          <p className={`text-sm ${isDark ? "text-white/80" : "text-gray-700"}`}>{b.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Rep notes + schedule */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`text-xs font-medium block mb-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>Rep Notes</label>
                        <textarea
                          value={repNotes[b.id] ?? b.repNotes ?? ""}
                          onChange={(e) => setRepNotes((prev) => ({ ...prev, [b.id]: e.target.value }))}
                          rows={2}
                          className={`w-full text-sm rounded-lg px-3 py-2 resize-none ${isDark ? "bg-white/5 border border-white/10 text-white placeholder-white/30" : "bg-white border border-gray-200 text-gray-800"}`}
                          placeholder="Add your notes..."
                        />
                      </div>
                      <div>
                        <label className={`text-xs font-medium block mb-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>Scheduled Call Time</label>
                        <input
                          type="datetime-local"
                          value={scheduledAt[b.id] ?? (b.scheduledAt ? new Date(b.scheduledAt).toISOString().slice(0, 16) : "")}
                          onChange={(e) => setScheduledAt((prev) => ({ ...prev, [b.id]: e.target.value }))}
                          className={`w-full text-sm rounded-lg px-3 py-2 ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-gray-200 text-gray-800"}`}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                      {["confirmed", "completed", "cancelled", "no_show"].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatusMutation.mutate({
                            bookingId: b.id,
                            status: s as any,
                            repNotes: repNotes[b.id],
                            scheduledAt: scheduledAt[b.id],
                          })}
                          disabled={updateStatusMutation.isPending}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                            b.status === s
                              ? "ring-2 ring-teal-400"
                              : ""
                          } ${isDark ? "bg-white/10 hover:bg-white/20 text-white/80" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
                        >
                          Mark {s.replace("_", " ")}
                        </button>
                      ))}
                      {b.status === "claimed" && (
                        <button
                          onClick={() => unclaimMutation.mutate({ bookingId: b.id })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark ? "bg-white/5 hover:bg-white/10 text-white/50" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}
                        >
                          Release
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm("Delete this booking?")) deleteMutation.mutate({ bookingId: b.id });
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl ${isDark ? "bg-[oklch(0.12_0.005_260)] border border-white/10" : "bg-white border border-gray-200"} p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Add Booking to Queue</h3>
              <button onClick={() => setShowAddModal(false)} className={isDark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-700"}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Prospect Name *", key: "prospectName", type: "text", placeholder: "Full name" },
                { label: "Email *", key: "prospectEmail", type: "email", placeholder: "email@example.com" },
                { label: "Phone", key: "prospectPhone", type: "tel", placeholder: "(555) 000-0000" },
                { label: "Business Name", key: "businessName", type: "text", placeholder: "Business name" },
                { label: "Business Type", key: "businessType", type: "text", placeholder: "e.g. Martial Arts, Fitness Studio" },
                { label: "Preferred Date", key: "preferredDate", type: "date", placeholder: "" },
                { label: "Preferred Time", key: "preferredTime", type: "time", placeholder: "" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className={`text-xs font-medium block mb-1 ${isDark ? "text-white/60" : "text-gray-600"}`}>{label}</label>
                  <input
                    type={type}
                    value={(addForm as any)[key]}
                    onChange={(e) => setAddForm((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className={`w-full text-sm rounded-lg px-3 py-2 ${isDark ? "bg-white/5 border border-white/10 text-white placeholder-white/30" : "bg-gray-50 border border-gray-200 text-gray-800"}`}
                  />
                </div>
              ))}
              <div>
                <label className={`text-xs font-medium block mb-1 ${isDark ? "text-white/60" : "text-gray-600"}`}>Source</label>
                <select
                  value={addForm.source}
                  onChange={(e) => setAddForm((p) => ({ ...p, source: e.target.value }))}
                  className={`w-full text-sm rounded-lg px-3 py-2 ${isDark ? "bg-white/5 border border-white/10 text-white" : "bg-gray-50 border border-gray-200 text-gray-800"}`}
                >
                  {["marketing", "social_media", "referral", "cold_outreach", "website", "ad_campaign", "other"].map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`text-xs font-medium block mb-1 ${isDark ? "text-white/60" : "text-gray-600"}`}>Notes</label>
                <textarea
                  value={addForm.notes}
                  onChange={(e) => setAddForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  placeholder="Any context or notes..."
                  className={`w-full text-sm rounded-lg px-3 py-2 resize-none ${isDark ? "bg-white/5 border border-white/10 text-white placeholder-white/30" : "bg-gray-50 border border-gray-200 text-gray-800"}`}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${isDark ? "bg-white/5 hover:bg-white/10 text-white/70" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
              >
                Cancel
              </button>
              <button
                onClick={() => addMutation.mutate(addForm)}
                disabled={addMutation.isPending || !addForm.prospectName || !addForm.prospectEmail}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {addMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add to Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
