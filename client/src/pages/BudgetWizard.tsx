import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  DollarSign,
  Zap,
  Building2,
  Utensils,
  Scissors,
  Shield,
  Home,
  Dumbbell,
  X,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  ClipboardList,
  RefreshCw,
  CreditCard,
  Calendar,
  Server,
  HeadphonesIcon,
  ShieldCheck,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { trpc } from "@/lib/trpc";

// ─── Subscription Tiers ───────────────────────────────────────────────────────

const SUBSCRIPTION_TIERS = [
  {
    id: "essential",
    name: "Essential",
    price: 99,
    description: "Hosting, uptime monitoring & basic support",
    includes: [
      "Managed website hosting",
      "SSL certificate & security updates",
      "Monthly performance monitoring",
      "Email support (48-hr response)",
      "Platform & plugin updates",
    ],
    color: "oklch(0.55_0.15_240)",
    gradient: "from-[oklch(0.55_0.15_240_/_15%)] to-[oklch(0.55_0.15_240_/_5%)]",
  },
  {
    id: "growth",
    name: "Growth",
    price: 149,
    description: "Everything in Essential + priority support & analytics",
    includes: [
      "Everything in Essential",
      "Priority email & chat support (24-hr)",
      "Monthly analytics report",
      "Minor content updates (up to 1 hr/mo)",
      "CRM & integration upkeep",
      "Backup & restore service",
    ],
    color: "oklch(0.5_0.2_25)",
    gradient: "from-[oklch(0.5_0.2_25_/_15%)] to-[oklch(0.5_0.2_25_/_5%)]",
  },
  {
    id: "premium",
    name: "Premium",
    price: 249,
    description: "Full-service upkeep for automation-heavy sites",
    includes: [
      "Everything in Growth",
      "Same-day priority support",
      "Automation & workflow monitoring",
      "Monthly strategy check-in call",
      "Content updates (up to 2 hrs/mo)",
      "Manus platform & AI upkeep",
      "Advanced integration maintenance",
    ],
    color: "oklch(0.78_0.12_85)",
    gradient: "from-[oklch(0.78_0.12_85_/_15%)] to-[oklch(0.78_0.12_85_/_5%)]",
  },
];

function getRecommendedTierIndex(packageId: string | null, autoAddons: Set<string>): number {
  if (packageId === "bos" || packageId === "conversion") return 2;
  if (packageId === "growth" || autoAddons.size > 0) return 1;
  return 0;
}

// ─── Types ───────────────────────────────────────────────────────────────────

type PriceRange = { min: number; max: number };

interface AddOn {
  id: string;
  label: string;
  price: PriceRange;
  description?: string;
}

interface BasePackage {
  id: string;
  name: string;
  tagline: string;
  price: PriceRange;
  features: string[];
  color: string;
  recommended?: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { id: "martial_arts", label: "Martial Arts / Gym / Fitness", icon: Dumbbell, color: "oklch(0.5_0.2_25)" },
  { id: "restaurant", label: "Restaurant / Café / Bakery", icon: Utensils, color: "oklch(0.65_0.18_60)" },
  { id: "salon", label: "Salon / Spa / Wellness", icon: Scissors, color: "oklch(0.65_0.15_320)" },
  { id: "insurance", label: "Insurance / Finance / Legal", icon: Shield, color: "oklch(0.55_0.15_240)" },
  { id: "real_estate", label: "Real Estate / Construction", icon: Home, color: "oklch(0.6_0.15_140)" },
  { id: "general", label: "Other Service Business", icon: Building2, color: "oklch(0.6_0.08_260)" },
];

const BASE_PACKAGES: BasePackage[] = [
  {
    id: "launch",
    name: "Launch Site",
    tagline: "Get online and start capturing leads",
    price: { min: 599, max: 599 },
    features: [
      "4–5 polished pages (Home, About, Services, Contact)",
      "Mobile-optimized design",
      "Basic lead capture form",
      "Core SEO setup",
      "Social media links",
      "Google Maps embed",
      "Basic call-to-action sections",
      "1 industry-specific section",
    ],
    color: "from-[oklch(0.3_0.05_260_/_60%)] to-[oklch(0.2_0.03_260_/_40%)]",
  },
  {
    id: "growth",
    name: "Growth Site",
    tagline: "Convert more visitors into paying clients",
    price: { min: 1299, max: 1999 },
    features: [
      "Everything in Launch",
      "Custom homepage sections",
      "Gallery / portfolio section",
      "Testimonials section",
      "Blog, events, menu, or services pages",
      "Advanced forms",
      "Stronger conversion structure",
    ],
    color: "from-[oklch(0.45_0.12_25_/_60%)] to-[oklch(0.3_0.08_25_/_40%)]",
    recommended: true,
  },
  {
    id: "conversion",
    name: "Conversion Site",
    tagline: "A full growth system, not just a website",
    price: { min: 2500, max: 4500 },
    features: [
      "Everything in Growth",
      "CRM integration",
      "Booking & appointment flow",
      "Automation sequences",
      "SMS / email follow-up",
      "Lead capture landing pages",
      "Advanced lead pipeline",
    ],
    color: "from-[oklch(0.55_0.15_85_/_60%)] to-[oklch(0.35_0.1_85_/_40%)]",
  },
  {
    id: "bos",
    name: "Business Operating System",
    tagline: "Platform-level power for scaling businesses",
    price: { min: 5000, max: 15000 },
    features: [
      "Everything in Conversion",
      "Admin dashboard",
      "Client / member portal",
      "Stripe payments",
      "Staff roles & access",
      "Kiosk / check-in system",
      "Advanced custom workflows",
      "Platform-style functionality",
    ],
    color: "from-[oklch(0.5_0.18_280_/_60%)] to-[oklch(0.3_0.12_280_/_40%)]",
  },
];

const CORE_ADDONS: AddOn[] = [
  { id: "extra_page", label: "Extra Page", price: { min: 75, max: 75 }, description: "Each additional page beyond base" },
  { id: "custom_homepage_section", label: "Custom Homepage Section", price: { min: 150, max: 350 } },
  { id: "faq_section", label: "FAQ Section", price: { min: 75, max: 75 } },
  { id: "testimonials_section", label: "Testimonials Section", price: { min: 99, max: 99 } },
  { id: "gallery_portfolio", label: "Gallery / Portfolio", price: { min: 125, max: 250 } },
  { id: "blog_setup", label: "Blog Setup", price: { min: 199, max: 299 } },
  { id: "careers_page", label: "Careers Page", price: { min: 199, max: 199 } },
  { id: "multi_location", label: "Multi-Location Setup", price: { min: 199, max: 199 }, description: "+$75 per extra location" },
  { id: "advanced_contact_form", label: "Advanced Contact Form", price: { min: 125, max: 125 } },
  { id: "lead_capture_landing", label: "Lead Capture Landing Page", price: { min: 149, max: 249 } },
  { id: "booking_form", label: "Booking / Appointment Request Form", price: { min: 149, max: 299 } },
  { id: "newsletter_signup", label: "Newsletter Signup Integration", price: { min: 99, max: 99 } },
  { id: "events_page", label: "Events Page", price: { min: 125, max: 199 } },
  { id: "promo_banner", label: "Promo Banner / Pop-Up Campaign", price: { min: 75, max: 149 } },
  { id: "google_reviews", label: "Google Reviews Embed", price: { min: 99, max: 99 } },
  { id: "photo_video_gallery", label: "Photo / Video Gallery", price: { min: 149, max: 149 } },
  { id: "basic_chat_widget", label: "Basic Chat Widget", price: { min: 99, max: 99 } },
  { id: "ai_chatbot", label: "AI Chatbot", price: { min: 399, max: 999 } },
];

const AUTOMATION_ADDONS: AddOn[] = [
  { id: "crm_dashboard", label: "CRM / Lead Dashboard", price: { min: 299, max: 799 } },
  { id: "kanban_pipeline", label: "Kanban Sales Pipeline", price: { min: 599, max: 899 } },
  { id: "sms_followup", label: "Automated SMS Follow-Up", price: { min: 199, max: 499 } },
  { id: "email_automation", label: "Email Automation", price: { min: 199, max: 499 } },
  { id: "missed_call_textback", label: "Missed-Call Text Back Setup", price: { min: 199, max: 349 } },
  { id: "appointment_reminders", label: "Appointment Reminder System", price: { min: 249, max: 399 } },
  { id: "staff_notifications", label: "Staff Notification Alerts", price: { min: 149, max: 299 } },
  { id: "custom_workflows", label: "Custom Workflow Automations", price: { min: 299, max: 999 } },
  { id: "third_party_integration", label: "Third-Party Integration Setup", price: { min: 249, max: 249 }, description: "Per integration" },
  { id: "stripe_payments", label: "Stripe Payment Setup", price: { min: 299, max: 499 } },
  { id: "membership_subscription", label: "Membership / Subscription Setup", price: { min: 399, max: 799 } },
  { id: "client_portal", label: "Client Portal / Member Portal", price: { min: 799, max: 1500 } },
  { id: "admin_dashboard", label: "Admin Dashboard", price: { min: 1500, max: 1500 }, description: "Custom — starting at $1,500" },
  { id: "kiosk_checkin", label: "Kiosk / Check-In System", price: { min: 999, max: 999 }, description: "Starting at $999" },
  { id: "role_based_access", label: "Role-Based Staff Access", price: { min: 299, max: 599 } },
];

const INDUSTRY_ADDONS: Record<string, AddOn[]> = {
  martial_arts: [
    { id: "trial_class_form", label: "Trial Class Form", price: { min: 149, max: 149 } },
    { id: "program_pages", label: "Program Pages", price: { min: 75, max: 75 }, description: "Per page" },
    { id: "schedule_page", label: "Schedule Page", price: { min: 175, max: 300 } },
    { id: "program_finder_quiz", label: "Program Finder Quiz", price: { min: 399, max: 399 } },
    { id: "lead_pipeline", label: "Lead Pipeline", price: { min: 799, max: 799 } },
    { id: "sms_trial_reminders", label: "SMS Trial Reminders", price: { min: 299, max: 299 } },
    { id: "student_portal", label: "Student Portal", price: { min: 999, max: 999 } },
    { id: "attendance_tracking", label: "Attendance Tracking", price: { min: 499, max: 499 } },
    { id: "belt_milestone_tracking", label: "Belt / Milestone Tracking", price: { min: 399, max: 399 } },
    { id: "kiosk_checkin_ma", label: "Kiosk Check-In", price: { min: 999, max: 999 } },
  ],
  restaurant: [
    { id: "menu_page", label: "Menu Page", price: { min: 149, max: 149 } },
    { id: "online_ordering", label: "Online Ordering Integration", price: { min: 149, max: 299 } },
    { id: "reservation_form", label: "Reservation Form / Integration", price: { min: 149, max: 299 } },
    { id: "photo_gallery_rest", label: "Photo Gallery", price: { min: 149, max: 149 } },
    { id: "events_live_music", label: "Events / Live Music Page", price: { min: 125, max: 125 } },
    { id: "catering_inquiry", label: "Catering Inquiry Form", price: { min: 149, max: 149 } },
    { id: "gift_card_page", label: "Gift Card Page", price: { min: 125, max: 125 } },
    { id: "loyalty_signup", label: "Loyalty Signup Form", price: { min: 99, max: 99 } },
    { id: "promo_seasonal", label: "Promo Popups & Seasonal Banners", price: { min: 99, max: 99 } },
    { id: "multi_location_rest", label: "Multi-Location Restaurant Setup", price: { min: 199, max: 199 }, description: "+location fees" },
    { id: "review_integration", label: "Review Integration", price: { min: 99, max: 99 } },
    { id: "email_sms_capture", label: "Email / SMS Campaign Capture", price: { min: 149, max: 299 } },
  ],
  salon: [
    { id: "service_menu", label: "Service Menu Page", price: { min: 149, max: 149 } },
    { id: "appointment_booking", label: "Appointment Booking Integration", price: { min: 199, max: 399 } },
    { id: "staff_bios", label: "Staff / Team Bios", price: { min: 99, max: 199 } },
    { id: "service_detail_pages", label: "Treatment / Service Detail Pages", price: { min: 75, max: 75 }, description: "Per page" },
    { id: "before_after_gallery", label: "Before / After Gallery", price: { min: 149, max: 149 } },
    { id: "intake_form", label: "Intake / Consultation Form", price: { min: 149, max: 149 } },
    { id: "membership_packages", label: "Membership / Package Sales", price: { min: 299, max: 499 } },
    { id: "sms_reminders_salon", label: "SMS Reminders", price: { min: 249, max: 249 } },
    { id: "review_showcase", label: "Review Showcase", price: { min: 99, max: 99 } },
  ],
  insurance: [
    { id: "quote_request_form", label: "Quote Request Form", price: { min: 149, max: 149 } },
    { id: "consultation_booking", label: "Consultation Booking Flow", price: { min: 199, max: 199 } },
    { id: "lead_qualification_quiz", label: "Lead Qualification Quiz", price: { min: 299, max: 499 } },
    { id: "crm_integration_ins", label: "CRM Integration", price: { min: 299, max: 599 } },
    { id: "policy_service_pages", label: "Policy / Service Pages", price: { min: 75, max: 75 }, description: "Per page" },
    { id: "educational_blog", label: "Educational Blog Setup", price: { min: 199, max: 199 } },
    { id: "secure_document_upload", label: "Secure Document Upload Form", price: { min: 199, max: 399 } },
    { id: "ai_chatbot_ins", label: "AI Chatbot", price: { min: 499, max: 499 }, description: "Starting at $499" },
  ],
  real_estate: [
    { id: "listings_showcase", label: "Listings Showcase", price: { min: 299, max: 599 } },
    { id: "property_inquiry_forms", label: "Property Inquiry Forms", price: { min: 149, max: 149 } },
    { id: "consultation_valuation", label: "Consultation / Valuation Request Page", price: { min: 149, max: 149 } },
    { id: "financing_lead_capture", label: "Financing / Pre-Approval Lead Capture", price: { min: 149, max: 149 } },
    { id: "neighborhood_pages", label: "Neighborhood / Location Pages", price: { min: 75, max: 75 }, description: "Per page" },
    { id: "crm_integration_re", label: "CRM Integration", price: { min: 299, max: 599 } },
    { id: "gallery_video_walkthrough", label: "Gallery / Video Walkthrough Area", price: { min: 199, max: 199 } },
  ],
  general: [
    { id: "service_overview_page", label: "Service Overview Page", price: { min: 149, max: 149 } },
    { id: "team_bios_general", label: "Team / Staff Bios", price: { min: 99, max: 199 } },
    { id: "case_studies_page", label: "Case Studies / Results Page", price: { min: 149, max: 249 } },
    { id: "quote_request_general", label: "Quote / Estimate Request Form", price: { min: 149, max: 149 } },
    { id: "portfolio_showcase", label: "Portfolio / Work Showcase", price: { min: 125, max: 250 } },
    { id: "process_page", label: "Our Process / How It Works Page", price: { min: 99, max: 149 } },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(range: PriceRange): string {
  if (range.min === range.max) return `$${range.min.toLocaleString()}`;
  return `$${range.min.toLocaleString()} – $${range.max.toLocaleString()}`;
}

function formatPackagePrice(range: PriceRange): string {
  if (range.min === range.max) return `$${range.min.toLocaleString()}`;
  return `$${range.min.toLocaleString()}–$${range.max.toLocaleString()}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i < current
                ? "bg-[oklch(0.5_0.2_25)] text-white"
                : i === current
                ? "bg-white text-black ring-2 ring-[oklch(0.5_0.2_25)]"
                : "bg-white/10 text-white/40"
            }`}
          >
            {i < current ? <Check size={14} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`w-8 h-0.5 transition-all duration-300 ${i < current ? "bg-[oklch(0.5_0.2_25)]" : "bg-white/15"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function AddOnCard({ addon, selected, onToggle }: { addon: AddOn; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group ${
        selected
          ? "border-[oklch(0.5_0.2_25)] bg-[oklch(0.5_0.2_25_/_12%)]"
          : "border-white/10 bg-white/3 hover:border-white/25 hover:bg-white/5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold leading-tight ${selected ? "text-white" : "text-white/80"}`}>
              {addon.label}
            </span>
          </div>
          {addon.description && (
            <p className="text-xs text-white/40 mt-0.5">{addon.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-sm font-bold ${selected ? "text-[oklch(0.78_0.12_85)]" : "text-white/60"}`}>
            {formatPrice(addon.price)}
          </span>
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              selected ? "border-[oklch(0.5_0.2_25)] bg-[oklch(0.5_0.2_25)]" : "border-white/30"
            }`}
          >
            {selected && <Check size={11} className="text-white" />}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BudgetWizard() {
  useSEO({
    title: "Website Budget Wizard — FlowSites",
    description: "Build your custom website quote in minutes. Select your industry, package, and features to see a detailed budget breakdown.",
  });

  const [step, setStep] = useState(0);
  const [industry, setIndustry] = useState<string | null>(null);
  const [basePackage, setBasePackage] = useState<string | null>(null);
  const [selectedCoreAddons, setSelectedCoreAddons] = useState<Set<string>>(new Set());
  const [selectedAutoAddons, setSelectedAutoAddons] = useState<Set<string>>(new Set());
  const [selectedIndustryAddons, setSelectedIndustryAddons] = useState<Set<string>>(new Set());
  const [paymentPlan, setPaymentPlan] = useState<"full" | "6mo" | "12mo">("full");
  const [tierOverride, setTierOverride] = useState<number | null>(null);
  const [prospectName, setProspectName] = useState("");
  const [prospectEmail, setProspectEmail] = useState("");
  const [prospectPhone, setProspectPhone] = useState("");
  const [quoteSaved, setQuoteSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const saveQuote = trpc.budgetQuote.save.useMutation({
    onSuccess: () => setQuoteSaved(true),
    onError: (err) => setSaveError(err.message),
  });

  const TOTAL_STEPS = 5;

  // ── Computed totals ──
  const totals = useMemo(() => {
    const pkg = BASE_PACKAGES.find((p) => p.id === basePackage);
    let minTotal = pkg ? pkg.price.min : 0;
    let maxTotal = pkg ? pkg.price.max : 0;

    const allSelected = [
      ...Array.from(selectedCoreAddons).map((id) => CORE_ADDONS.find((a) => a.id === id)),
      ...Array.from(selectedAutoAddons).map((id) => AUTOMATION_ADDONS.find((a) => a.id === id)),
      ...Array.from(selectedIndustryAddons).map((id) => (industry ? INDUSTRY_ADDONS[industry]?.find((a) => a.id === id) : undefined)),
    ].filter(Boolean) as AddOn[];

    for (const addon of allSelected) {
      minTotal += addon.price.min;
      maxTotal += addon.price.max;
    }

    // Subscription tier
    const autoTierIndex = getRecommendedTierIndex(basePackage, selectedAutoAddons);
    const tierIndex = tierOverride !== null ? tierOverride : autoTierIndex;
    const subTier = SUBSCRIPTION_TIERS[tierIndex];

    // Payment plan
    const planMultiplier = paymentPlan === "6mo" ? 1.1 : paymentPlan === "12mo" ? 1.2 : 1;
    const planMin = Math.ceil((minTotal * planMultiplier) / (paymentPlan === "6mo" ? 6 : paymentPlan === "12mo" ? 12 : 1));
    const planMax = Math.ceil((maxTotal * planMultiplier) / (paymentPlan === "6mo" ? 6 : paymentPlan === "12mo" ? 12 : 1));

    return { minTotal, maxTotal, pkg, allSelected, subTier, tierIndex, planMin, planMax };
  }, [basePackage, selectedCoreAddons, selectedAutoAddons, selectedIndustryAddons, industry, paymentPlan, tierOverride]);

  const toggleAddon = (id: string, set: Set<string>, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  const canAdvance = () => {
    if (step === 0) return industry !== null;
    if (step === 1) return basePackage !== null;
    return true;
  };

  const industryLabel = INDUSTRIES.find((i) => i.id === industry)?.label ?? "";
  const industryAddons = industry ? INDUSTRY_ADDONS[industry] ?? [] : [];

  // ── Slide variants ──
  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };
  const [direction, setDirection] = useState(1);

  const goNext = () => { setDirection(1); setStep((s) => s + 1); };
  const goPrev = () => { setDirection(-1); setStep((s) => s - 1); };

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.005_260)] text-white">
      {/* Header */}
      <div className="relative border-b border-white/8 bg-[oklch(0.09_0.008_260_/_80%)] backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/">
            <span className="text-white/50 hover:text-white text-sm flex items-center gap-1 transition-colors">
              <ChevronLeft size={14} /> Back to FlowSites
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-[oklch(0.5_0.2_25)]" />
            <span className="text-sm font-semibold text-white/80">Website Budget Wizard</span>
          </div>
          {/* Live total pill */}
          {basePackage && (
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[oklch(0.78_0.12_85_/_12%)] border border-[oklch(0.78_0.12_85_/_30%)]">
                <DollarSign size={12} className="text-[oklch(0.78_0.12_85)]" />
                <span className="text-xs font-bold text-[oklch(0.78_0.12_85)]">
                  {totals.minTotal === totals.maxTotal
                    ? `$${totals.minTotal.toLocaleString()}`
                    : `$${totals.minTotal.toLocaleString()} – $${totals.maxTotal.toLocaleString()}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[oklch(0.5_0.2_25_/_12%)] border border-[oklch(0.5_0.2_25_/_30%)]">
                <RefreshCw size={11} className="text-[oklch(0.5_0.2_25)]" />
                <span className="text-xs font-bold text-[oklch(0.5_0.2_25)]">${totals.subTier.price}/mo</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <StepIndicator current={step} total={TOTAL_STEPS} />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ── STEP 0: Industry ── */}
            {step === 0 && (
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">What type of business are you?</h1>
                <p className="text-white/50 text-center mb-8">We'll tailor your feature options to your industry.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {INDUSTRIES.map((ind) => {
                    const Icon = ind.icon;
                    const isSelected = industry === ind.id;
                    return (
                      <button
                        key={ind.id}
                        onClick={() => setIndustry(ind.id)}
                        className={`p-5 rounded-2xl border text-left transition-all duration-200 group ${
                          isSelected
                            ? "border-[oklch(0.5_0.2_25)] bg-[oklch(0.5_0.2_25_/_10%)]"
                            : "border-white/10 bg-white/3 hover:border-white/25 hover:bg-white/5"
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                          style={{ background: `${ind.color}30`, border: `1px solid ${ind.color}50` }}
                        >
                          <Icon size={20} style={{ color: ind.color }} />
                        </div>
                        <div className="font-semibold text-sm text-white/90">{ind.label}</div>
                        {isSelected && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-[oklch(0.5_0.2_25)]">
                            <Check size={11} /> Selected
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 1: Base Package ── */}
            {step === 1 && (
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Choose your base package</h1>
                <p className="text-white/50 text-center mb-8">Start with a foundation. You'll add features next.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {BASE_PACKAGES.map((pkg) => {
                    const isSelected = basePackage === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        onClick={() => setBasePackage(pkg.id)}
                        className={`relative p-6 rounded-2xl border text-left transition-all duration-200 ${
                          isSelected
                            ? "border-[oklch(0.5_0.2_25)] ring-1 ring-[oklch(0.5_0.2_25_/_40%)]"
                            : "border-white/10 hover:border-white/25"
                        } bg-gradient-to-br ${pkg.color}`}
                      >
                        {pkg.recommended && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[oklch(0.5_0.2_25)] text-white text-xs font-bold">
                            Most Popular
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-bold text-lg text-white">{pkg.name}</div>
                            <div className="text-sm text-white/50 mt-0.5">{pkg.tagline}</div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 mt-0.5 transition-all ${
                            isSelected ? "border-[oklch(0.5_0.2_25)] bg-[oklch(0.5_0.2_25)]" : "border-white/30"
                          }`}>
                            {isSelected && <Check size={13} className="text-white" />}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-[oklch(0.78_0.12_85)] mb-4">
                          {formatPackagePrice(pkg.price)}
                        </div>
                        <ul className="space-y-1.5">
                          {pkg.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                              <Check size={13} className="text-[oklch(0.5_0.2_25)] mt-0.5 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 2: Core Add-Ons ── */}
            {step === 2 && (
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Core Website Add-Ons</h1>
                <p className="text-white/50 text-center mb-8">Pick any features you'd like to include. All are optional.</p>

                <div className="mb-8">
                  <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-5 h-0.5 bg-white/20" /> Website Features
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CORE_ADDONS.map((addon) => (
                      <AddOnCard
                        key={addon.id}
                        addon={addon}
                        selected={selectedCoreAddons.has(addon.id)}
                        onToggle={() => toggleAddon(addon.id, selectedCoreAddons, setSelectedCoreAddons)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Automation Add-Ons ── */}
            {step === 3 && (
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Business Automation Upgrades</h1>
                <p className="text-white/50 text-center mb-2">
                  Turn your website into a <span className="text-white font-semibold">growth system</span>.
                </p>
                <p className="text-white/40 text-center text-sm mb-8">CRM, automations, portals, payments, and more.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AUTOMATION_ADDONS.map((addon) => (
                    <AddOnCard
                      key={addon.id}
                      addon={addon}
                      selected={selectedAutoAddons.has(addon.id)}
                      onToggle={() => toggleAddon(addon.id, selectedAutoAddons, setSelectedAutoAddons)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 4: Industry-Specific Add-Ons ── */}
            {step === 4 && (
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
                  {industryLabel} Features
                </h1>
                <p className="text-white/50 text-center mb-8">
                  Industry-specific features built for your type of business.
                </p>
                {industryAddons.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {industryAddons.map((addon) => (
                      <AddOnCard
                        key={addon.id}
                        addon={addon}
                        selected={selectedIndustryAddons.has(addon.id)}
                        onToggle={() => toggleAddon(addon.id, selectedIndustryAddons, setSelectedIndustryAddons)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-white/40 py-16">No industry-specific add-ons for this category.</div>
                )}
              </div>
            )}

            {/* ── STEP 5: Summary ── */}
            {step === 5 && (
              <div>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[oklch(0.78_0.12_85_/_12%)] border border-[oklch(0.78_0.12_85_/_30%)] mb-4">
                    <Sparkles size={13} className="text-[oklch(0.78_0.12_85)]" />
                    <span className="text-sm font-semibold text-[oklch(0.78_0.12_85)]">Your Custom Quote</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">Here's your website investment</h1>
                  <p className="text-white/50">Based on your selections. Final pricing confirmed during your discovery call.</p>
                </div>

                {/* Two-column: Build Cost + Monthly */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Build cost */}
                  <div className="rounded-2xl border border-[oklch(0.78_0.12_85_/_30%)] bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.5_0.2_25_/_8%)] p-5 text-center">
                    <div className="text-xs text-white/40 mb-1 uppercase tracking-widest font-semibold">One-Time Build Cost</div>
                    <div className="text-3xl font-bold text-[oklch(0.78_0.12_85)]">
                      {totals.minTotal === totals.maxTotal
                        ? `$${totals.minTotal.toLocaleString()}`
                        : `$${totals.minTotal.toLocaleString()} – $${totals.maxTotal.toLocaleString()}`}
                    </div>
                    <div className="text-white/40 text-xs mt-1">Paid at project start</div>
                  </div>
                  {/* Monthly subscription */}
                  <div className="rounded-2xl border border-[oklch(0.5_0.2_25_/_40%)] bg-gradient-to-br from-[oklch(0.5_0.2_25_/_12%)] to-[oklch(0.5_0.2_25_/_4%)] p-5 text-center">
                    <div className="text-xs text-white/40 mb-1 uppercase tracking-widest font-semibold">{totals.subTier.name} Monthly Plan</div>
                    <div className="text-3xl font-bold text-[oklch(0.5_0.2_25)]">${totals.subTier.price}<span className="text-base font-normal text-white/40">/mo</span></div>
                    <div className="text-white/40 text-xs mt-1">{totals.subTier.description}</div>
                  </div>
                </div>

                {/* Monthly subscription details */}
                <div className="rounded-2xl border border-white/10 bg-white/3 p-5 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <RefreshCw size={14} className="text-[oklch(0.5_0.2_25)]" />
                    <span className="text-sm font-bold text-white">What's included in your ${totals.subTier.price}/mo plan</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {totals.subTier.includes.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <Check size={13} className="text-[oklch(0.5_0.2_25)] mt-0.5 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                  {/* Tier selector */}
                  <div className="mt-4 pt-4 border-t border-white/8">
                    <p className="text-xs text-white/40 mb-3">Adjust your monthly plan if needed:</p>
                    <div className="flex gap-2">
                      {SUBSCRIPTION_TIERS.map((tier, i) => (
                        <button
                          key={tier.id}
                          onClick={() => setTierOverride(i)}
                          className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                            totals.tierIndex === i
                              ? "border-[oklch(0.5_0.2_25)] bg-[oklch(0.5_0.2_25_/_15%)] text-white"
                              : "border-white/10 text-white/40 hover:border-white/25"
                          }`}
                        >
                          ${tier.price}/mo
                          <div className="font-normal opacity-70">{tier.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment Plan Toggle */}
                <div className="rounded-2xl border border-white/10 bg-white/3 p-5 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard size={14} className="text-[oklch(0.78_0.12_85)]" />
                    <span className="text-sm font-bold text-white">Build Cost Payment Plan</span>
                    <span className="ml-auto text-xs text-white/40">Spread your build cost over time</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "full" as const, label: "Pay in Full", sub: "Best value", extra: "" },
                      { id: "6mo" as const, label: "6-Month Plan", sub: "+10% total", extra: `` },
                      { id: "12mo" as const, label: "12-Month Plan", sub: "+20% total", extra: `` },
                    ].map((plan) => {
                      const isSelected = paymentPlan === plan.id;
                      let amountLabel = "";
                      if (plan.id === "full") {
                        amountLabel = totals.minTotal === totals.maxTotal
                          ? `$${totals.minTotal.toLocaleString()}`
                          : `$${totals.minTotal.toLocaleString()}–$${totals.maxTotal.toLocaleString()}`;
                      } else {
                        amountLabel = totals.planMin === totals.planMax
                          ? `$${totals.planMin.toLocaleString()}/mo`
                          : `$${totals.planMin.toLocaleString()}–$${totals.planMax.toLocaleString()}/mo`;
                      }
                      return (
                        <button
                          key={plan.id}
                          onClick={() => setPaymentPlan(plan.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-[oklch(0.78_0.12_85)] bg-[oklch(0.78_0.12_85_/_10%)]"
                              : "border-white/10 hover:border-white/25"
                          }`}
                        >
                          <div className={`text-xs font-bold mb-0.5 ${isSelected ? "text-[oklch(0.78_0.12_85)]" : "text-white/70"}`}>{plan.label}</div>
                          <div className="text-sm font-bold text-white">{amountLabel}</div>
                          <div className="text-xs text-white/40 mt-0.5">{plan.sub}</div>
                          {isSelected && <div className="mt-1"><Check size={11} className="text-[oklch(0.78_0.12_85)]" /></div>}
                        </button>
                      );
                    })}
                  </div>
                  {paymentPlan !== "full" && (
                    <p className="text-xs text-white/40 mt-3 flex items-start gap-1.5">
                      <Calendar size={11} className="mt-0.5 shrink-0" />
                      Payment plan pricing includes a small processing fee. Final terms confirmed during your discovery call.
                    </p>
                  )}
                </div>

                {/* Breakdown */}
                <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden mb-6">
                  <div className="px-5 py-3 border-b border-white/8 bg-white/3">
                    <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Itemized Breakdown</span>
                  </div>
                  <div className="divide-y divide-white/8">
                    {/* Base package */}
                    {totals.pkg && (
                      <div className="flex items-center justify-between px-5 py-3.5">
                        <div>
                          <span className="text-sm font-semibold text-white">{totals.pkg.name}</span>
                          <span className="ml-2 text-xs text-white/40 bg-white/8 px-2 py-0.5 rounded-full">Base Package</span>
                        </div>
                        <span className="text-sm font-bold text-[oklch(0.78_0.12_85)]">{formatPackagePrice(totals.pkg.price)}</span>
                      </div>
                    )}
                    {/* Add-ons */}
                    {totals.allSelected.map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between px-5 py-3">
                        <span className="text-sm text-white/70">{addon.label}</span>
                        <span className="text-sm font-semibold text-white/80">{formatPrice(addon.price)}</span>
                      </div>
                    ))}
                    {/* Total row */}
                    <div className="flex items-center justify-between px-5 py-4 bg-white/3">
                      <span className="text-sm font-bold text-white">Total Estimate</span>
                      <span className="text-base font-bold text-[oklch(0.78_0.12_85)]">
                        {totals.minTotal === totals.maxTotal
                          ? `$${totals.minTotal.toLocaleString()}`
                          : `$${totals.minTotal.toLocaleString()} – $${totals.maxTotal.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Prospect Contact Form */}
                <div className="rounded-2xl border border-white/10 bg-white/3 p-5 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardList size={14} className="text-[oklch(0.78_0.12_85)]" />
                    <span className="text-sm font-bold text-white">Save Your Quote</span>
                    <span className="ml-auto text-xs text-white/40">Optional — we'll email you a copy</span>
                  </div>
                  {quoteSaved ? (
                    <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-[oklch(0.5_0.2_25_/_15%)] border border-[oklch(0.5_0.2_25_/_40%)]">
                      <Check size={16} className="text-[oklch(0.5_0.2_25)]" />
                      <span className="text-sm text-white/80">Quote saved! Check your inbox for a summary email.</span>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Your name (optional)"
                          value={prospectName}
                          onChange={(e) => setProspectName(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                        />
                        <input
                          type="email"
                          placeholder="Email for quote copy"
                          value={prospectEmail}
                          onChange={(e) => setProspectEmail(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                        />
                        <input
                          type="tel"
                          placeholder="Phone (optional)"
                          value={prospectPhone}
                          onChange={(e) => setProspectPhone(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                      {saveError && (
                        <p className="text-xs text-red-400 mb-2">{saveError}</p>
                      )}
                      <button
                        onClick={() => {
                          setSaveError("");
                          saveQuote.mutate({
                            prospectName: prospectName || undefined,
                            prospectEmail: prospectEmail || undefined,
                            prospectPhone: prospectPhone || undefined,
                            industry: industry ?? "",
                            basePackage: basePackage ?? "",
                            coreAddons: Array.from(selectedCoreAddons),
                            autoAddons: Array.from(selectedAutoAddons),
                            industryAddons: Array.from(selectedIndustryAddons),
                            subscriptionTier: totals.subTier.id,
                            monthlyPrice: totals.subTier.price,
                            paymentPlan,
                            buildCostMin: totals.minTotal,
                            buildCostMax: totals.maxTotal,
                          });
                        }}
                        disabled={saveQuote.isPending}
                        className="w-full py-2.5 rounded-xl bg-[oklch(0.78_0.12_85_/_15%)] border border-[oklch(0.78_0.12_85_/_40%)] text-[oklch(0.78_0.12_85)] font-semibold text-sm hover:bg-[oklch(0.78_0.12_85_/_25%)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {saveQuote.isPending ? (
                          <><RefreshCw size={13} className="animate-spin" /> Saving...</>
                        ) : (
                          <><Check size={13} /> Save Quote & Get Email Summary</>
                        )}
                      </button>
                    </>
                  )}
                </div>

                {/* CTA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/get-started">
                    <button className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] text-white font-bold text-base hover:from-[oklch(0.55_0.22_25)] hover:to-[oklch(0.45_0.2_25)] transition-all shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)] flex items-center justify-center gap-2">
                      Get Started
                      <ArrowRight size={16} />
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      const buildCost = totals.minTotal === totals.maxTotal
                        ? `$${totals.minTotal.toLocaleString()}`
                        : `$${totals.minTotal.toLocaleString()} – $${totals.maxTotal.toLocaleString()}`;
                      const planLine = paymentPlan === "full"
                        ? `Payment: Pay in full (${buildCost})`
                        : `Payment Plan: ${paymentPlan === "6mo" ? "6" : "12"} monthly payments of $${totals.planMin === totals.planMax ? totals.planMin.toLocaleString() : `${totals.planMin.toLocaleString()}–${totals.planMax.toLocaleString()}`}/mo`;
                      const lines = [
                        `Website Budget Estimate — FlowSites`,
                        `Industry: ${industryLabel}`,
                        ``,
                        `Base Package: ${totals.pkg?.name} — ${totals.pkg ? formatPackagePrice(totals.pkg.price) : ""}`,
                        ...totals.allSelected.map((a) => `  + ${a.label} — ${formatPrice(a.price)}`),
                        ``,
                        `ONE-TIME BUILD COST: ${buildCost}`,
                        planLine,
                        ``,
                        `MONTHLY PLAN: ${totals.subTier.name} — $${totals.subTier.price}/mo`,
                        `Includes: ${totals.subTier.includes.join(", ")}`,
                        ``,
                        `Final pricing confirmed during discovery call.`,
                        `Book at: https://flow-sites.com/get-started`,
                      ].join("\n");
                      navigator.clipboard.writeText(lines).catch(() => {});
                      alert("Budget summary copied to clipboard!");
                    }}
                    className="w-full px-6 py-4 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-semibold text-base transition-all flex items-center justify-center gap-2"
                  >
                    Copy Summary to Clipboard
                  </button>
                </div>

                <p className="text-center text-white/30 text-xs mt-6">
                  Build cost is a one-time investment. Monthly plan ($99–$249/mo) covers hosting, upkeep, support, and platform maintenance.
                  Payment plan pricing includes a small processing fee. All pricing confirmed during your free discovery call.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/8">
          <button
            onClick={goPrev}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-semibold"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < TOTAL_STEPS && (
            <button
              onClick={goNext}
              disabled={!canAdvance()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[oklch(0.5_0.2_25)] text-white font-bold text-sm hover:bg-[oklch(0.55_0.22_25)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)]"
            >
              {step === TOTAL_STEPS - 1 ? "See My Quote" : "Continue"}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
