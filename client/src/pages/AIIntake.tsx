/**
 * FlowSites — AI Intake Wizard
 * Conversational multi-step intake triggered from the homepage prompt bar.
 * Dark theme, smooth slide transitions, collects project details → submits as lead.
 */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles, Globe, Building2, Target, DollarSign, Phone, Mail, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
interface IntakeData {
  initialPrompt: string;
  hasDomain: string;
  domainUrl: string;
  businessType: string;
  businessTypeOther: string;
  primaryGoal: string;
  budget: string;
  timeline: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
}

// ── Step definitions ──────────────────────────────────────────────────────────
const BUSINESS_TYPES = [
  { value: "hair_salon", label: "Hair Salon" },
  { value: "martial_arts", label: "Martial Arts" },
  { value: "gym_fitness", label: "Gym & Fitness" },
  { value: "counseling", label: "Counseling & Wellness" },
  { value: "dental", label: "Dental Office" },
  { value: "home_services", label: "Home Services" },
  { value: "embroidery", label: "Embroidery / Apparel" },
  { value: "financial", label: "Financial Services" },
  { value: "ecommerce", label: "E-Commerce / Online Store" },
  { value: "other", label: "Other" },
];

const GOALS = [
  { value: "more_leads", label: "Get more leads" },
  { value: "book_appointments", label: "Book more appointments" },
  { value: "collect_payments", label: "Collect payments online" },
  { value: "brand_presence", label: "Build brand presence" },
  { value: "automate_followups", label: "Automate follow-ups" },
  { value: "all_of_above", label: "All of the above" },
];

const BUDGETS = [
  { value: "under_1500", label: "Under $1,500" },
  { value: "1500_3000", label: "$1,500 – $3,000" },
  { value: "3000_5000", label: "$3,000 – $5,000" },
  { value: "5000_plus", label: "$5,000+" },
  { value: "not_sure", label: "Not sure yet" },
];

const TIMELINES = [
  { value: "asap", label: "ASAP" },
  { value: "1_month", label: "Within 1 month" },
  { value: "2_3_months", label: "2–3 months" },
  { value: "flexible", label: "Flexible" },
];

// ── Animation variants ────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

// ── Main component ────────────────────────────────────────────────────────────
export default function AIIntake() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<IntakeData>({
    initialPrompt: "",
    hasDomain: "",
    domainUrl: "",
    businessType: "",
    businessTypeOther: "",
    primaryGoal: "",
    budget: "",
    timeline: "",
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
  });

  const submitMutation = trpc.wizard.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  // Keep the originating public CTA with the written request in the lead record.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get("q") || "";
    const intent = params.get("intent") || "";
    const context = [prompt, intent ? `Requested next step: ${intent}` : ""].filter(Boolean).join("\n");
    if (context) setData(d => ({ ...d, initialPrompt: context }));
  }, []);

  const totalSteps = 7; // 0-indexed: 0=domain, 1=biz type, 2=goal, 3=budget, 4=timeline, 5=contact, 6=done

  const goNext = () => {
    setDirection(1);
    setStep(s => Math.min(s + 1, totalSteps - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 0));
  };

  const set = (field: keyof IntakeData, value: string) =>
    setData(d => ({ ...d, [field]: value }));

  const handleSubmit = () => {
    if (!data.email || !data.phone || !data.businessName) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitMutation.mutate({
      businessName: data.businessName,
      businessType: data.businessType || "other",
      businessTypeOther: data.businessTypeOther,
      website: data.domainUrl || undefined,
      phone: data.phone,
      email: data.email,
      colorScheme: "not_specified",
      primaryGoal: data.primaryGoal || "not_specified",
      timeline: data.timeline || "flexible",
      budget: data.budget || "not_sure",
      additionalNotes: data.initialPrompt ? `Initial prompt: "${data.initialPrompt}"` : undefined,
    });
  };

  const progress = ((step + 1) / totalSteps) * 100;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f6f9ff] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-[#6c47ff]/20 border border-[#6c47ff]/40 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#6c47ff]" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">You're all set!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            We've received your project details. Our team will reach out to <span className="text-slate-900 font-semibold">{data.email}</span> within 24 hours to discuss your website.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl bg-[#6c47ff] text-white font-semibold hover:bg-[#7c57ff] transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f9ff] flex flex-col text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/90 backdrop-blur">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#6c47ff]" />
          <span className="text-slate-700 text-sm font-semibold">FlowSites AI</span>
        </div>
        <div className="text-slate-400 text-sm">{step + 1} / {totalSteps}</div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-slate-200">
        <motion.div
          className="h-full bg-gradient-to-r from-[#6c47ff] to-[#a78bfa]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Initial prompt echo */}
      {data.initialPrompt && step === 0 && (
        <div className="mx-auto mt-8 px-4 max-w-xl w-full">
          <div className="flex items-start gap-3 bg-white border border-slate-200 shadow-sm rounded-2xl px-4 py-3">
            <div className="w-7 h-7 rounded-full bg-[#6c47ff]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-[#a78bfa]" />
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">You said</p>
              <p className="text-slate-700 text-sm">"{data.initialPrompt}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Step 0: Domain */}
              {step === 0 && (
                <StepWrapper
                  icon={<Globe className="w-6 h-6 text-[#6c47ff]" />}
                  question="Do you already have a domain or website URL?"
                  subtitle="This helps us understand where you're starting from."
                >
                  <div className="flex flex-col gap-3">
                    {[
                      { value: "yes", label: "Yes, I have a domain" },
                      { value: "no", label: "No, I need one" },
                      { value: "not_sure", label: "Not sure" },
                    ].map(opt => (
                      <ChoiceButton
                        key={opt.value}
                        selected={data.hasDomain === opt.value}
                        onClick={() => { set("hasDomain", opt.value); setTimeout(goNext, 300); }}
                        label={opt.label}
                      />
                    ))}
                    {data.hasDomain === "yes" && (
                      <motion.input
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        type="text"
                        placeholder="e.g. mybusiness.com"
                        value={data.domainUrl}
                        onChange={e => set("domainUrl", e.target.value)}
                        className="mt-2 w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6c47ff]/60 text-sm"
                      />
                    )}
                  </div>
                </StepWrapper>
              )}

              {/* Step 1: Business type */}
              {step === 1 && (
                <StepWrapper
                  icon={<Building2 className="w-6 h-6 text-[#6c47ff]" />}
                  question="What type of business do you have?"
                  subtitle="We specialize in service businesses of all kinds."
                >
                  <div className="grid grid-cols-2 gap-2.5">
                    {BUSINESS_TYPES.map(opt => (
                      <ChoiceButton
                        key={opt.value}
                        selected={data.businessType === opt.value}
                        onClick={() => { set("businessType", opt.value); if (opt.value !== "other") setTimeout(goNext, 300); }}
                        label={opt.label}
                        compact
                      />
                    ))}
                  </div>
                  {data.businessType === "other" && (
                    <motion.input
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="text"
                      placeholder="Describe your business..."
                      value={data.businessTypeOther}
                      onChange={e => set("businessTypeOther", e.target.value)}
                      className="mt-3 w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6c47ff]/60 text-sm"
                    />
                  )}
                </StepWrapper>
              )}

              {/* Step 2: Primary goal */}
              {step === 2 && (
                <StepWrapper
                  icon={<Target className="w-6 h-6 text-[#6c47ff]" />}
                  question="What's your primary goal for your website?"
                  subtitle="We'll design everything around what matters most to you."
                >
                  <div className="flex flex-col gap-3">
                    {GOALS.map(opt => (
                      <ChoiceButton
                        key={opt.value}
                        selected={data.primaryGoal === opt.value}
                        onClick={() => { set("primaryGoal", opt.value); setTimeout(goNext, 300); }}
                        label={opt.label}
                      />
                    ))}
                  </div>
                </StepWrapper>
              )}

              {/* Step 3: Budget */}
              {step === 3 && (
                <StepWrapper
                  icon={<DollarSign className="w-6 h-6 text-[#6c47ff]" />}
                  question="What's your budget range?"
                  subtitle="No pressure — this just helps us recommend the right package."
                >
                  <div className="flex flex-col gap-3">
                    {BUDGETS.map(opt => (
                      <ChoiceButton
                        key={opt.value}
                        selected={data.budget === opt.value}
                        onClick={() => { set("budget", opt.value); setTimeout(goNext, 300); }}
                        label={opt.label}
                      />
                    ))}
                  </div>
                </StepWrapper>
              )}

              {/* Step 4: Timeline */}
              {step === 4 && (
                <StepWrapper
                  icon={<ArrowRight className="w-6 h-6 text-[#6c47ff]" />}
                  question="When do you need your website?"
                  subtitle="We'll prioritize your project accordingly."
                >
                  <div className="flex flex-col gap-3">
                    {TIMELINES.map(opt => (
                      <ChoiceButton
                        key={opt.value}
                        selected={data.timeline === opt.value}
                        onClick={() => { set("timeline", opt.value); setTimeout(goNext, 300); }}
                        label={opt.label}
                      />
                    ))}
                  </div>
                </StepWrapper>
              )}

              {/* Step 5: Contact info */}
              {step === 5 && (
                <StepWrapper
                  icon={<User className="w-6 h-6 text-[#6c47ff]" />}
                  question="Last step — how do we reach you?"
                  subtitle="We'll send a personalized proposal to your inbox."
                >
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-slate-500 text-xs mb-1.5 block">Business Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Sunrise Fitness Studio"
                        value={data.businessName}
                        onChange={e => set("businessName", e.target.value)}
                        className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6c47ff]/60 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 text-xs mb-1.5 block">Your Name</label>
                      <input
                        type="text"
                        placeholder="First & Last Name"
                        value={data.ownerName}
                        onChange={e => set("ownerName", e.target.value)}
                        className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6c47ff]/60 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 text-xs mb-1.5 block">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          placeholder="you@yourbusiness.com"
                          value={data.email}
                          onChange={e => set("email", e.target.value)}
                          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6c47ff]/60 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-500 text-xs mb-1.5 block">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          placeholder="(555) 000-0000"
                          value={data.phone}
                          onChange={e => set("phone", e.target.value)}
                          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6c47ff]/60 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </StepWrapper>
              )}

              {/* Step 6: Review & submit */}
              {step === 6 && (
                <StepWrapper
                  icon={<Sparkles className="w-6 h-6 text-[#6c47ff]" />}
                  question="Ready to build your website?"
                  subtitle="Here's a summary of what you told us."
                >
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 mb-6 space-y-3 text-sm">
                    <SummaryRow label="Business" value={data.businessName} />
                    <SummaryRow label="Type" value={BUSINESS_TYPES.find(b => b.value === data.businessType)?.label || data.businessTypeOther || "—"} />
                    <SummaryRow label="Goal" value={GOALS.find(g => g.value === data.primaryGoal)?.label || "—"} />
                    <SummaryRow label="Budget" value={BUDGETS.find(b => b.value === data.budget)?.label || "—"} />
                    <SummaryRow label="Timeline" value={TIMELINES.find(t => t.value === data.timeline)?.label || "—"} />
                    <SummaryRow label="Domain" value={data.hasDomain === "yes" ? (data.domainUrl || "Yes") : data.hasDomain === "no" ? "Needs one" : "Not sure"} />
                    <SummaryRow label="Contact" value={data.email} />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6c47ff] to-[#8b5cf6] text-white font-semibold text-base hover:from-[#7c57ff] hover:to-[#9c6cf6] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitMutation.isPending ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> Let's Build It</>
                    )}
                  </button>
                </StepWrapper>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : <div />}

            {/* Manual next for steps that don't auto-advance */}
            {(step === 0 && data.hasDomain === "yes") ||
             (step === 1 && data.businessType === "other") ||
             step === 5 ? (
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6c47ff] text-white text-sm font-semibold hover:bg-[#7c57ff] transition-colors"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : <div />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StepWrapper({ icon, question, subtitle, children }: {
  icon: React.ReactNode;
  question: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#6c47ff]/15 border border-[#6c47ff]/25 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-2 leading-tight">{question}</h2>
      <p className="text-slate-500 text-sm mb-7">{subtitle}</p>
      {children}
    </div>
  );
}

function ChoiceButton({ label, selected, onClick, compact = false }: {
  label: string;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? "rgba(108,71,255,0.10)" : "#ffffff",
        border: selected ? "1px solid rgba(108,71,255,0.45)" : "1px solid #e2e8f0",
        borderLeft: selected ? "3px solid #6c47ff" : "1px solid #e2e8f0",
        boxShadow: selected ? "0 8px 20px rgba(108,71,255,0.10)" : "0 1px 2px rgba(15,23,42,0.03)",
        transition: "all 0.18s ease",
      }}
      className={`
        ${compact ? "py-3 px-4 text-sm" : "py-3.5 px-4 text-sm"}
        w-full rounded-xl text-left font-medium flex items-center justify-between
        ${selected ? "text-slate-900" : "text-slate-600 hover:text-slate-900"}
      `}
    >
      <span className="tracking-wide">{label}</span>
      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-5 h-5 rounded-full bg-[#6c47ff] flex items-center justify-center flex-shrink-0"
        >
          <Check className="w-3 h-3 text-white" />
        </motion.div>
      )}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-800 font-medium text-right max-w-[60%] truncate">{value || "—"}</span>
    </div>
  );
}
