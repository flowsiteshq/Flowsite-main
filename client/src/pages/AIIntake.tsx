import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  Globe,
  Building2,
  Target,
  DollarSign,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Clock3,
  FileCheck2,
  CircleHelp,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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

const steps = [
  { label: "Starting point", caption: "Domain & website", icon: Globe },
  { label: "Your business", caption: "Industry & focus", icon: Building2 },
  { label: "Your goal", caption: "What success means", icon: Target },
  { label: "Investment", caption: "Budget range", icon: DollarSign },
  { label: "Timing", caption: "When to launch", icon: Clock3 },
  { label: "Contact", caption: "How to reach you", icon: User },
  { label: "Review", caption: "Confirm your details", icon: FileCheck2 },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -32 : 32, opacity: 0 }),
};

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
    onSuccess: () => setSubmitted(true),
    onError: () =>
      toast.error("We couldn't save your details. Please try again."),
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get("q") || "";
    const intent = params.get("intent") || "";
    const selectedPackage = params.get("package") || "";
    const context = [
      prompt,
      intent ? `Requested next step: ${intent}` : "",
      selectedPackage ? `Selected package: ${selectedPackage}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    if (context) setData(d => ({ ...d, initialPrompt: context }));
  }, []);

  const totalSteps = steps.length;
  const set = (field: keyof IntakeData, value: string) =>
    setData(d => ({ ...d, [field]: value }));
  const goNext = () => {
    setDirection(1);
    setStep(s => Math.min(s + 1, totalSteps - 1));
  };
  const goBack = () => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 0));
  };
  const choose = (field: keyof IntakeData, value: string, advance = true) => {
    set(field, value);
    if (advance) window.setTimeout(goNext, 220);
  };
  const handleSubmit = () => {
    if (!data.email || !data.phone || !data.businessName) {
      toast.error("Please add your business name, email, and phone number.");
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
      additionalNotes: data.initialPrompt
        ? `Initial prompt: "${data.initialPrompt}"`
        : undefined,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f8ff] px-5 py-10 text-slate-950 sm:flex sm:items-center sm:justify-center">
        <motion.div
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,35,80,0.12)] sm:p-12"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
            <Check size={30} strokeWidth={3} />
          </div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Request received
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            Your next chapter starts here.
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            Your details are saved. Choose a time to meet with FlowSites so we
            can review the next step for{" "}
            <strong className="text-slate-900">{data.businessName}</strong>.
          </p>
          <button
            onClick={() => {
              const params = new URLSearchParams({
                name: data.ownerName,
                email: data.email,
                phone: data.phone,
                business: data.businessName,
                notes: data.initialPrompt,
              });
              navigate(`/book-call?${params.toString()}`);
            }}
            className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Schedule your call <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate("/")}
            className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
          >
            Back to FlowSites
          </button>
        </motion.div>
      </div>
    );
  }

  const progress = ((step + 1) / totalSteps) * 100;
  return (
    <div className="min-h-screen bg-[#f6f9ff] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col lg:flex-row">
        <aside className="relative hidden w-[330px] shrink-0 overflow-hidden bg-[#071a3a] px-8 py-9 text-white lg:flex lg:flex-col">
          <div className="absolute -right-28 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-semibold text-blue-100 transition hover:text-white"
            >
              <ArrowLeft size={16} /> FlowSites
            </button>
            <p className="mt-16 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
              Website planning studio
            </p>
            <h1 className="mt-4 text-4xl font-black leading-[0.98] tracking-[-0.05em]">
              Let’s make your next move obvious.
            </h1>
            <p className="mt-5 text-sm leading-6 text-blue-100/75">
              Answer a few focused questions. We’ll use them to shape the right
              website direction for your business.
            </p>
          </div>
          <div className="relative mt-12 space-y-2">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const active = index === step;
              const complete = index < step;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition ${active ? "bg-white text-slate-950 shadow-lg" : "text-blue-100/60"}`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-blue-600 text-white" : complete ? "bg-blue-400/20 text-blue-200" : "bg-white/10"}`}
                  >
                    {complete ? (
                      <Check size={16} strokeWidth={3} />
                    ) : (
                      <Icon size={16} />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-bold ${active ? "text-slate-950" : "text-white/80"}`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-[11px] ${active ? "text-slate-500" : "text-blue-100/45"}`}
                    >
                      {item.caption}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="relative mt-auto rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck size={15} className="text-blue-300" /> No pressure,
              just a clear plan
            </div>
            <p className="mt-2 text-xs leading-5 text-blue-100/60">
              Your information is used to prepare your website recommendation.
            </p>
          </div>
        </aside>

        <main className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200/80 bg-white/85 px-5 py-4 backdrop-blur sm:px-8 lg:px-12">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950 lg:hidden"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div className="flex items-center gap-2 text-sm font-black tracking-tight text-slate-900 lg:ml-auto">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Sparkles size={15} />
              </span>
              FlowSites AI
            </div>
            <div className="text-right lg:ml-8">
              <p className="text-xs font-bold text-slate-950">
                Step {step + 1} of {totalSteps}
              </p>
              <p className="text-[11px] text-slate-400">{steps[step].label}</p>
            </div>
          </header>
          <div className="h-1 bg-slate-200">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-violet-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
          <div className="flex flex-1 items-start justify-center px-5 py-10 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div className="w-full max-w-2xl">
              {data.initialPrompt && step === 0 && (
                <div className="mb-7 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-950">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
                    Your starting point
                  </p>
                  <p className="mt-1 whitespace-pre-line leading-6">
                    {data.initialPrompt}
                  </p>
                </div>
              )}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  {step === 0 && (
                    <StepWrapper
                      icon={<Globe />}
                      eyebrow="Starting point"
                      question="Do you already have a domain or website?"
                      subtitle="No wrong answer. This simply tells us where to begin."
                    >
                      <div className="grid gap-3">
                        {[
                          {
                            value: "yes",
                            label: "Yes, I have a domain",
                            detail: "We’ll build from what you already own.",
                          },
                          {
                            value: "no",
                            label: "No, I need one",
                            detail:
                              "We’ll help you choose a strong starting point.",
                          },
                          {
                            value: "not_sure",
                            label: "I’m not sure yet",
                            detail: "We’ll figure it out together.",
                          },
                        ].map(o => (
                          <ChoiceButton
                            key={o.value}
                            label={o.label}
                            detail={o.detail}
                            selected={data.hasDomain === o.value}
                            onClick={() => choose("hasDomain", o.value)}
                          />
                        ))}
                      </div>
                      {data.hasDomain === "yes" && (
                        <Field
                          label="Your domain or website URL"
                          placeholder="mybusiness.com"
                          value={data.domainUrl}
                          onChange={v => set("domainUrl", v)}
                        />
                      )}
                    </StepWrapper>
                  )}
                  {step === 1 && (
                    <StepWrapper
                      icon={<Building2 />}
                      eyebrow="Your business"
                      question="What kind of business are you building?"
                      subtitle="This helps us tailor the structure, language, and calls to action."
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        {BUSINESS_TYPES.map(o => (
                          <ChoiceButton
                            key={o.value}
                            label={o.label}
                            selected={data.businessType === o.value}
                            onClick={() =>
                              choose(
                                "businessType",
                                o.value,
                                o.value !== "other"
                              )
                            }
                            compact
                          />
                        ))}
                      </div>
                      {data.businessType === "other" && (
                        <Field
                          label="Tell us a little more"
                          placeholder="Describe your business"
                          value={data.businessTypeOther}
                          onChange={v => set("businessTypeOther", v)}
                        />
                      )}
                    </StepWrapper>
                  )}
                  {step === 2 && (
                    <StepWrapper
                      icon={<Target />}
                      eyebrow="Your goal"
                      question="What should your website do better?"
                      subtitle="We’ll prioritize the experience around the outcome that matters most."
                    >
                      <div className="grid gap-3">
                        {GOALS.map(o => (
                          <ChoiceButton
                            key={o.value}
                            label={o.label}
                            selected={data.primaryGoal === o.value}
                            onClick={() => choose("primaryGoal", o.value)}
                          />
                        ))}
                      </div>
                    </StepWrapper>
                  )}
                  {step === 3 && (
                    <StepWrapper
                      icon={<DollarSign />}
                      eyebrow="Investment"
                      question="What range feels realistic right now?"
                      subtitle="This keeps our recommendation practical and aligned with your plans."
                    >
                      <div className="grid gap-3">
                        {BUDGETS.map(o => (
                          <ChoiceButton
                            key={o.value}
                            label={o.label}
                            selected={data.budget === o.value}
                            onClick={() => choose("budget", o.value)}
                          />
                        ))}
                      </div>
                    </StepWrapper>
                  )}
                  {step === 4 && (
                    <StepWrapper
                      icon={<Clock3 />}
                      eyebrow="Timing"
                      question="When would you like to launch?"
                      subtitle="We’ll use your timeline to set the right next step."
                    >
                      <div className="grid gap-3">
                        {TIMELINES.map(o => (
                          <ChoiceButton
                            key={o.value}
                            label={o.label}
                            selected={data.timeline === o.value}
                            onClick={() => choose("timeline", o.value)}
                          />
                        ))}
                      </div>
                    </StepWrapper>
                  )}
                  {step === 5 && (
                    <StepWrapper
                      icon={<User />}
                      eyebrow="Almost there"
                      question="Where should we send your recommendation?"
                      subtitle="A real person from FlowSites will review your details and follow up. No automated sales sequence."
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Business name *"
                          placeholder="Sunrise Fitness Studio"
                          value={data.businessName}
                          onChange={v => set("businessName", v)}
                        />
                        <Field
                          label="Your name"
                          placeholder="First & Last Name"
                          value={data.ownerName}
                          onChange={v => set("ownerName", v)}
                        />
                        <Field
                          icon={<Mail size={16} />}
                          label="Email address *"
                          placeholder="you@yourbusiness.com"
                          type="email"
                          value={data.email}
                          onChange={v => set("email", v)}
                        />
                        <Field
                          icon={<Phone size={16} />}
                          label="Phone number *"
                          placeholder="(555) 000-0000"
                          type="tel"
                          value={data.phone}
                          onChange={v => set("phone", v)}
                        />
                      </div>
                      <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500">
                        <ShieldCheck
                          size={15}
                          className="mt-0.5 shrink-0 text-blue-600"
                        />
                        Your details stay with FlowSites and are only used to
                        prepare your website conversation.
                      </div>
                    </StepWrapper>
                  )}
                  {step === 6 && (
                    <StepWrapper
                      icon={<FileCheck2 />}
                      eyebrow="Final review"
                      question="Ready to turn this into a plan?"
                      subtitle="Review your answers, then send them to the FlowSites team."
                    >
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                          <p className="text-sm font-bold text-slate-900">
                            Project snapshot
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            You can go back and change anything.
                          </p>
                        </div>
                        <div className="divide-y divide-slate-100 px-5">
                          {[
                            ["Business", data.businessName],
                            [
                              "Type",
                              BUSINESS_TYPES.find(
                                b => b.value === data.businessType
                              )?.label ||
                                data.businessTypeOther ||
                                "—",
                            ],
                            [
                              "Primary goal",
                              GOALS.find(g => g.value === data.primaryGoal)
                                ?.label || "—",
                            ],
                            [
                              "Budget",
                              BUDGETS.find(b => b.value === data.budget)
                                ?.label || "—",
                            ],
                            [
                              "Timeline",
                              TIMELINES.find(t => t.value === data.timeline)
                                ?.label || "—",
                            ],
                            [
                              "Domain",
                              data.hasDomain === "yes"
                                ? data.domainUrl || "Yes"
                                : data.hasDomain === "no"
                                  ? "Needs one"
                                  : "Not sure",
                            ],
                            ["Contact", data.email],
                          ].map(([label, value]) => (
                            <SummaryRow
                              key={label}
                              label={label}
                              value={value}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={handleSubmit}
                        disabled={submitMutation.isPending}
                        className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-base font-bold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitMutation.isPending ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />{" "}
                            Saving your plan...
                          </>
                        ) : (
                          <>
                            <Sparkles size={19} /> Send My Website Plan{" "}
                            <ArrowRight size={18} />
                          </>
                        )}
                      </button>
                      <p className="mt-3 text-center text-xs text-slate-400">
                        No payment is collected here. This is a free planning
                        conversation.
                      </p>
                    </StepWrapper>
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="mt-9 flex items-center justify-between">
                {step > 0 ? (
                  <button
                    onClick={goBack}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                ) : (
                  <span />
                )}
                {((step === 0 && data.hasDomain === "yes") ||
                  (step === 1 && data.businessType === "other") ||
                  step === 5) && (
                  <button
                    onClick={goNext}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Continue <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StepWrapper({
  icon,
  eyebrow,
  question,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  question: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
        {icon}
      </div>
      <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
        {eyebrow}
      </p>
      <h2 className="mt-3 max-w-xl text-3xl font-black leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-5xl">
        {question}
      </h2>
      <p className="mt-4 max-w-xl text-base leading-7 text-slate-500">
        {subtitle}
      </p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function ChoiceButton({
  label,
  detail,
  selected,
  onClick,
  compact = false,
}: {
  label: string;
  detail?: string;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`group flex w-full items-center justify-between rounded-2xl border text-left transition-all ${compact ? "min-h-[62px] px-4 py-3" : "min-h-[76px] px-5 py-4"} ${selected ? "border-blue-600 bg-blue-50 shadow-[0_10px_30px_rgba(37,99,235,0.12)]" : "border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"}`}
    >
      <span>
        <span
          className={`block font-bold ${selected ? "text-blue-950" : "text-slate-800"}`}
        >
          {label}
        </span>
        {detail && (
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            {detail}
          </span>
        )}
      </span>
      <span
        className={`ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 text-transparent group-hover:border-blue-300"}`}
      >
        <Check size={14} strokeWidth={3} />
      </span>
    </button>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <span className="relative block">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${icon ? "pl-10" : ""}`}
        />
      </span>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5 py-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[65%] truncate text-right text-sm font-bold text-slate-900">
        {value || "—"}
      </span>
    </div>
  );
}
