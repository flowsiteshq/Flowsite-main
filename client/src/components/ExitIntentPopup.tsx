/**
 * ExitIntentPopup — triggers when the user moves their cursor toward the browser chrome
 * to exit the page. Offers a free website analysis using PageSpeed Insights.
 *
 * Flow:
 *  Step 1 — Enter website URL
 *  Step 2 — Running analysis (loading state, 5-15s)
 *  Step 3 — Results + lead capture form (name, email, phone)
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  X,
  Globe,
  Zap,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  Loader2,
  BarChart3,
  Shield,
  Smartphone,
  Star,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnalysisResult {
  url: string;
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
  issues: Array<{ title: string; description: string; severity: "critical" | "warning" | "info" }>;
  recommendations: string[];
  loadTime: number;
  mobileScore: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500/15 border-emerald-500/25";
  if (score >= 60) return "bg-amber-500/15 border-amber-500/25";
  return "bg-red-500/15 border-red-500/25";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Good";
  if (score >= 60) return "Needs Work";
  return "Poor";
}

function ScoreCard({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) {
  return (
    <div className={`rounded-xl border p-3 flex flex-col items-center gap-1 ${scoreBg(score)}`}>
      <Icon size={16} className={scoreColor(score)} />
      <span className={`text-2xl font-bold ${scoreColor(score)}`}>{score}</span>
      <span className="text-xs text-white/50 text-center leading-tight">{label}</span>
      <span className={`text-[10px] font-semibold ${scoreColor(score)}`}>{scoreLabel(score)}</span>
    </div>
  );
}

// Paths where the exit-intent popup should never appear
const EXCLUDED_PATHS = [
  "/flowsites-admin",
  "/admin",
  "/login",
  "/rep-login",
  "/rep-dashboard",
  "/client-login",
  "/client-portal",
  "/portal",
  "/client-billing",
  "/client-setup",
  "/client-reset-password",
  "/accept-invite",
  "/accept-tech-invite",
  "/forgot-password",
  "/reset-password",
  "/invoice",
];

function isExcludedPath(pathname: string): boolean {
  return EXCLUDED_PATHS.some((p) => pathname.startsWith(p));
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState<"url" | "analyzing" | "results" | "thanks">("url");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const hasTriggered = useRef(false);

  const analyzeMutation = trpc.analyzer.analyze.useMutation();
  const submitLeadMutation = trpc.leads.captureExitIntent.useMutation();

  // ── Exit-intent detection ──────────────────────────────────────────────────
  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      // Check the CURRENT path at trigger time — not just at mount time.
      // This prevents the popup from firing after navigating to an excluded page
      // (the component is mounted at the app root and never unmounts).
      if (isExcludedPath(window.location.pathname)) return;
      // Only trigger when cursor moves toward the top of the viewport (toward browser chrome)
      if (e.clientY <= 10 && !hasTriggered.current && !dismissed) {
        hasTriggered.current = true;
        // Small delay so it doesn't feel jarring
        setTimeout(() => setVisible(true), 200);
      }
    },
    [dismissed]
  );

  useEffect(() => {
    // Don't show on mobile (no mouseleave equivalent)
    if (typeof window === "undefined" || window.innerWidth < 768) return;

    // Don't show if already dismissed this session
    const alreadyDismissed = sessionStorage.getItem("exit_popup_dismissed");
    if (alreadyDismissed) return;

    // Always attach the listener — the handler itself checks the current path
    // dynamically so it works correctly after SPA navigation.
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [handleMouseLeave]);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("exit_popup_dismissed", "1");
  };

  // ── URL validation ─────────────────────────────────────────────────────────
  const normalizeUrl = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
    return trimmed;
  };

  const handleAnalyze = async () => {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setUrlError("Please enter your website URL.");
      return;
    }
    try {
      new URL(normalized);
    } catch {
      setUrlError("Please enter a valid URL (e.g. yourbusiness.com)");
      return;
    }
    setUrlError("");
    setUrl(normalized);
    setStep("analyzing");

    try {
      const data = await analyzeMutation.mutateAsync({ url: normalized });
      setResult(data as AnalysisResult);
      setStep("results");
    } catch (e: any) {
      toast.error(e?.message ?? "Analysis failed. Please try again.");
      setStep("url");
    }
  };

  // ── Lead capture submission ────────────────────────────────────────────────
  const handleLeadSubmit = async () => {
    if (!leadForm.name.trim() || !leadForm.email.trim()) {
      toast.error("Please enter your name and email.");
      return;
    }
    setSubmitting(true);
    try {
      await submitLeadMutation.mutateAsync({
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone,
        website: result?.url ?? url,
        analysisScores: result ? {
          performance: result.performance,
          seo: result.seo,
          accessibility: result.accessibility,
          bestPractices: result.bestPractices,
          loadTime: result.loadTime,
          mobileScore: result.mobileScore,
        } : undefined,
      });
      setStep("thanks");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[oklch(0.12_0.005_260)]">
        {/* Red accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-600 via-red-500 to-red-700" />

        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* ── Step 1: URL Entry ── */}
        {step === "url" && (
          <div className="px-8 py-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <Search size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-0.5">Free Website Audit</p>
                <h2 className="text-xl font-bold text-white leading-tight">
                  Before you go — see how your site scores
                </h2>
              </div>
            </div>

            <p className="text-sm text-white/55 mb-6 leading-relaxed">
              Get an instant analysis of your website's performance, SEO, and mobile experience — completely free. Most sites have issues costing them leads every day.
            </p>

            <div className="flex gap-3 mb-2">
              {[
                { icon: Zap, label: "Speed Score" },
                { icon: BarChart3, label: "SEO Grade" },
                { icon: Smartphone, label: "Mobile Score" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex-1 rounded-xl bg-white/5 border border-white/8 px-3 py-2.5 flex flex-col items-center gap-1">
                  <Icon size={16} className="text-red-400" />
                  <span className="text-[11px] text-white/50 text-center">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">
                Your Website URL
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="yourbusiness.com"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setUrlError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/6 border border-white/12 text-white text-sm placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  Analyze <ArrowRight size={15} />
                </button>
              </div>
              {urlError && <p className="text-xs text-red-400 mt-1.5">{urlError}</p>}
            </div>

            <p className="text-[11px] text-white/30 mt-4 text-center">
              No signup required. Takes 10–15 seconds.
            </p>
          </div>
        )}

        {/* ── Step 2: Analyzing ── */}
        {step === "analyzing" && (
          <div className="px-8 py-12 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-2 border-red-500/20 flex items-center justify-center">
                <Loader2 size={36} className="text-red-400 animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-red-500/40 animate-ping" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Analyzing your website...</h3>
            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              Running performance, SEO, accessibility, and mobile tests on{" "}
              <span className="text-white/80 font-medium">{url}</span>
            </p>
            <div className="mt-6 space-y-2 w-full max-w-xs">
              {["Checking page speed", "Auditing SEO signals", "Testing mobile experience", "Scanning for issues"].map((item, i) => (
                <div key={item} className="flex items-center gap-3 text-sm text-white/40">
                  <div
                    className="w-4 h-4 rounded-full border border-red-500/40 flex items-center justify-center flex-shrink-0"
                    style={{ animation: `pulse 1s ease-in-out ${i * 0.3}s infinite` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Results + Lead Form ── */}
        {step === "results" && result && (
          <div className="px-8 py-7 max-h-[85vh] overflow-y-auto">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-1">Analysis Complete</p>
              <h3 className="text-lg font-bold text-white">Here's how your site scores</h3>
              <p className="text-xs text-white/40 mt-0.5 truncate">{result.url}</p>
            </div>

            {/* Score grid */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              <ScoreCard label="Performance" score={result.performance} icon={Zap} />
              <ScoreCard label="SEO" score={result.seo} icon={BarChart3} />
              <ScoreCard label="Accessibility" score={result.accessibility} icon={Shield} />
              <ScoreCard label="Best Practices" score={result.bestPractices} icon={Star} />
            </div>

            {/* Load time + mobile */}
            <div className="flex gap-3 mb-5">
              <div className="flex-1 rounded-xl bg-white/5 border border-white/8 px-4 py-3 flex items-center gap-3">
                <Zap size={16} className="text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-lg font-bold text-white">{result.loadTime.toFixed(1)}s</p>
                  <p className="text-[11px] text-white/40">Load Time</p>
                </div>
              </div>
              <div className="flex-1 rounded-xl bg-white/5 border border-white/8 px-4 py-3 flex items-center gap-3">
                <Smartphone size={16} className="text-sky-400 flex-shrink-0" />
                <div>
                  <p className={`text-lg font-bold ${scoreColor(result.mobileScore)}`}>{result.mobileScore}</p>
                  <p className="text-[11px] text-white/40">Mobile Score</p>
                </div>
              </div>
            </div>

            {/* Top issues */}
            {result.issues.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Top Issues Found</p>
                <div className="space-y-2">
                  {result.issues.slice(0, 3).map((issue, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-xl bg-white/4 border border-white/8 px-3 py-2.5">
                      {issue.severity === "critical" ? (
                        <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                      ) : issue.severity === "warning" ? (
                        <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Info size={14} className="text-sky-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-white/80">{issue.title}</p>
                        <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{issue.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lead capture */}
            <div className="rounded-xl bg-red-500/8 border border-red-500/20 px-5 py-4">
              <p className="text-sm font-semibold text-white mb-1">
                Want us to fix these issues for you?
              </p>
              <p className="text-xs text-white/50 mb-4 leading-relaxed">
                Get a free strategy call and we'll show you exactly how to turn your site into a lead machine.
              </p>
              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Your name"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/12 text-white text-sm placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/12 text-white text-sm placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
                />
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/6 border border-white/12 text-white text-sm placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
                />
                <button
                  onClick={handleLeadSubmit}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                  ) : (
                    <>Get My Free Strategy Call <ArrowRight size={15} /></>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-white/25 mt-3 text-center">No spam. We'll reach out within 24 hours.</p>
            </div>
          </div>
        )}

        {/* ── Step 4: Thank You ── */}
        {step === "thanks" && (
          <div className="px-8 py-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-5">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You're all set!</h3>
            <p className="text-sm text-white/55 max-w-xs leading-relaxed mb-6">
              We've received your request and will reach out within 24 hours with a personalized growth plan for your business.
            </p>
            <button
              onClick={dismiss}
              className="px-6 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-white text-sm font-medium transition-colors"
            >
              Continue browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
