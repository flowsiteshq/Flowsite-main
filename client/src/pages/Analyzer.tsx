import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ScrollReveal from "@/components/ScrollReveal";
import { trpc } from "@/lib/trpc";
import { useSEO } from "@/hooks/useSEO";
import {
  Search,
  Zap,
  Smartphone,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Globe,
  Clock,
  Shield,
  Eye,
  XCircle,
  Info,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Copy, ExternalLink } from "lucide-react";

export default function Analyzer() {
  useSEO({
    title: "Free Website Analyzer — Score Your Website | FlowSites",
    description:
      "Get a free instant analysis of your website's performance, SEO, mobile-friendliness, and conversion potential. Powered by Google PageSpeed Insights.",
    canonical: "/analyzer",
  });

  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [progressMessage, setProgressMessage] = useState(0);
  const [shareId, setShareId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [, navigate] = useLocation();

  // Industry benchmarks for service businesses
  const BENCHMARKS = {
    performance: 52,
    seo: 71,
    accessibility: 68,
    bestPractices: 75,
  };

  const saveResultMutation = trpc.analyzer.saveResult.useMutation();

  // Compute the normalized URL preview shown below the input
  const normalizedPreview = url.trim()
    ? /^https?:\/\//i.test(url.trim())
      ? url.trim()
      : `https://${url.trim()}`
    : "";

  // Basic validity check: must contain at least one dot and no spaces
  const isLikelyValid = (raw: string) => {
    const t = raw.trim();
    return t.includes(".") && !t.includes(" ");
  };

  const analyzeMutation = trpc.analyzer.analyze.useMutation();
  const isAnalyzing = analyzeMutation.isPending;

  const progressMessages = [
    "Analyzing performance metrics...",
    "Checking mobile responsiveness...",
    "Evaluating SEO optimization...",
    "Testing accessibility standards...",
    "Measuring page load speed...",
    "Reviewing best practices...",
    "Generating your report...",
  ];

  useEffect(() => {
    if (isAnalyzing) {
      setProgressMessage(0);
      const interval = setInterval(() => {
        setProgressMessage((prev) => (prev + 1) % progressMessages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const analyzeWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    // Inline validation: must look like a real domain
    if (!isLikelyValid(url)) {
      setUrlError("Please enter a valid domain, e.g. yourwebsite.com");
      return;
    }
    setUrlError("");
    // Auto-prepend https:// if no protocol is present
    const normalizedUrl = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    try {
      const data = await analyzeMutation.mutateAsync({ url: normalizedUrl });
      setShowEmailCapture(true);
      // Silently save to DB and get shareId
      try {
        const saved = await saveResultMutation.mutateAsync({
          url: data.url,
          performance: data.performance,
          seo: data.seo,
          accessibility: data.accessibility,
          bestPractices: data.bestPractices,
          mobileScore: data.mobileScore,
          loadTime: data.loadTime,
          issues: data.issues,
          recommendations: data.recommendations,
        });
        setShareId(saved.shareId);
        // Update URL to shareable link without full navigation
        window.history.replaceState(null, "", `/analyzer/results/${saved.shareId}`);
      } catch (saveErr) {
        console.warn("Could not save result:", saveErr);
      }
    } catch (error) {
      console.error("Analysis error:", error);
    }
  };

  const handleReset = () => {
    analyzeMutation.reset();
    setUrl("");
    setUrlError("");
    setShowEmailCapture(false);
    setShareId(null);
    setCopied(false);
    window.history.replaceState(null, "", "/analyzer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopyLink = () => {
    if (!shareId) return;
    const link = `${window.location.origin}/analyzer/results/${shareId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const result = analyzeMutation.data;
  const error = analyzeMutation.error;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-500";
    return "text-[oklch(0.52_0.22_25)]";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Good";
    if (score >= 60) return "Needs Work";
    return "Critical";
  };

  const getSeverityIcon = (severity: "critical" | "warning" | "info") => {
    if (severity === "critical") return <XCircle size={16} className="text-[oklch(0.52_0.22_25)] shrink-0 mt-0.5" />;
    if (severity === "warning") return <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />;
    return <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />;
  };

  const getSeverityBadge = (severity: "critical" | "warning" | "info") => {
    if (severity === "critical") return "bg-red-100 text-red-700";
    if (severity === "warning") return "bg-amber-100 text-amber-700";
    return "bg-blue-100 text-blue-700";
  };

  const features = [
    { icon: Zap, title: "Performance Score", desc: "Core Web Vitals, load time, and speed metrics" },
    { icon: TrendingUp, title: "SEO Analysis", desc: "Meta tags, headings, keywords, and indexability" },
    { icon: Smartphone, title: "Mobile Friendliness", desc: "Responsive design and mobile usability" },
    { icon: Shield, title: "Best Practices", desc: "Security, HTTPS, and web standards compliance" },
    { icon: Eye, title: "Accessibility", desc: "WCAG compliance and screen reader compatibility" },
    { icon: Globe, title: "Conversion Potential", desc: "CTA placement, trust signals, and UX quality" },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[oklch(0.97_0.002_260)] border-b border-[oklch(0.90_0.004_260)]">
        <div className="container">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <span className="tag tag-red mb-4 inline-block">Free Tool</span>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-[oklch(0.08_0.005_260)] leading-[1.1]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                How Does Your Website{" "}
                <span className="text-[oklch(0.52_0.22_25)]">Actually Score?</span>
              </h1>
              <p className="mt-6 text-lg text-[oklch(0.45_0.008_260)] leading-relaxed max-w-2xl mx-auto">
                Get an instant analysis of your website's performance, SEO, mobile-friendliness, and conversion potential — powered by Google PageSpeed Insights.
              </p>
            </div>
          </ScrollReveal>

          {/* Analyzer Form */}
          {!result && (
            <ScrollReveal delay={0.15}>
              <div className="mt-12 max-w-2xl mx-auto">
                <div className="agency-card rounded-2xl p-8">
                  <form onSubmit={analyzeWebsite}>
                    <Label
                      htmlFor="url"
                      className="text-sm font-semibold text-[oklch(0.25_0.006_260)] mb-2 block"
                    >
                      Enter Your Website URL
                    </Label>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Globe
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[oklch(0.60_0.006_260)]"
                          size={18}
                        />
                        <Input
                          id="url"
                          type="text"
                          placeholder="yourwebsite.com"
                          value={url}
                          onChange={(e) => { setUrl(e.target.value); setUrlError(""); }}
                          className={`pl-12 h-14 bg-[oklch(0.97_0.002_260)] border-[oklch(0.88_0.004_260)] text-[oklch(0.15_0.005_260)] placeholder:text-[oklch(0.65_0.005_260)] focus:border-[oklch(0.52_0.22_25_/_50%)] focus:ring-2 focus:ring-[oklch(0.52_0.22_25_/_15%)] ${urlError ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                          required
                          disabled={isAnalyzing}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isAnalyzing}
                        className="h-14 px-7 bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.20_25)] text-white font-semibold rounded-xl"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Search size={18} className="mr-2" />
                            Analyze
                          </>
                        )}
                      </Button>
                    </div>

                    {/* URL hint — shows resolved URL below input */}
                    {normalizedPreview && !isAnalyzing && !urlError && (
                      <p className="mt-2 text-xs text-[oklch(0.50_0.006_260)] flex items-center gap-1.5">
                        <Globe size={11} className="shrink-0 text-[oklch(0.60_0.006_260)]" />
                        Will analyze: <span className="font-medium text-[oklch(0.35_0.006_260)]">{normalizedPreview}</span>
                      </p>
                    )}

                    {/* Inline validation error */}
                    {urlError && (
                      <p className="mt-2 text-xs text-red-600 flex items-center gap-1.5">
                        <AlertCircle size={11} className="shrink-0" />
                        {urlError}
                      </p>
                    )}

                    {isAnalyzing && (
                      <div className="mt-5 p-5 rounded-xl bg-[oklch(0.52_0.22_25_/_5%)] border border-[oklch(0.52_0.22_25_/_15%)]">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <div className="w-11 h-11 rounded-full border-2 border-[oklch(0.52_0.22_25_/_20%)] border-t-[oklch(0.52_0.22_25)] animate-spin" />
                            <Clock
                              size={16}
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[oklch(0.52_0.22_25)]"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-[oklch(0.20_0.005_260)] text-sm mb-0.5">
                              Analyzing Your Website
                            </p>
                            <p className="text-[oklch(0.45_0.006_260)] text-sm">
                              {progressMessages[progressMessage]}
                            </p>
                            <p className="text-xs text-[oklch(0.60_0.005_260)] mt-1">
                              This may take 30–60 seconds while we run comprehensive tests.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200">
                        <div className="flex items-start gap-3">
                          <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-red-700 text-sm mb-1">
                              Analysis Temporarily Unavailable
                            </p>
                            <p className="text-red-600 text-sm">
                              {error.message.includes("Rate limit")
                                ? "We've hit the free tier rate limit for Google PageSpeed Insights. Please wait a few minutes and try again."
                                : error.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="mt-3 text-xs text-[oklch(0.60_0.005_260)] text-center">
                      Free analysis · No signup required · Powered by Google PageSpeed Insights
                    </p>
                  </form>
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* Features Grid (shown when no result) */}
      {!result && (
        <section className="py-20">
          <div className="container">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2
                  className="text-2xl md:text-3xl font-bold text-[oklch(0.08_0.005_260)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  What We Analyze
                </h2>
                <p className="mt-3 text-[oklch(0.45_0.008_260)]">
                  A comprehensive 6-point audit of your website's health
                </p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {features.map((f, i) => (
                <ScrollReveal key={f.title} delay={i * 0.05}>
                  <div className="agency-card rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-[oklch(0.52_0.22_25_/_8%)] flex items-center justify-center mx-auto mb-4">
                      <f.icon size={22} className="text-[oklch(0.52_0.22_25)]" />
                    </div>
                    <h3
                      className="font-bold text-[oklch(0.15_0.005_260)] mb-2"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {f.title}
                    </h3>
                    <p className="text-sm text-[oklch(0.50_0.006_260)] leading-relaxed">{f.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {result && (
        <section className="py-16">
          <div className="container">
            {/* Overall Score */}
            <ScrollReveal>
              <div className="agency-card rounded-2xl p-8 max-w-5xl mx-auto mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2
                      className="text-2xl font-bold text-[oklch(0.08_0.005_260)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Analysis Results
                    </h2>
                    <p className="text-[oklch(0.52_0.22_25)] text-sm font-medium mt-0.5">{result.url}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={handleReset}
                      className="text-sm text-[oklch(0.45_0.006_260)] hover:text-[oklch(0.20_0.005_260)] transition-colors underline"
                    >
                      Analyze another site
                    </button>
                    {shareId && (
                      <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-1.5 text-sm font-medium text-[oklch(0.52_0.22_25)] hover:text-[oklch(0.45_0.20_25)] transition-colors"
                      >
                        {copied ? (
                          <><CheckCircle2 size={14} /> Copied!</>
                        ) : (
                          <><Copy size={14} /> Copy shareable link</>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Benchmark comparison banner */}
                <div className="mb-5 p-4 rounded-xl bg-[oklch(0.97_0.002_260)] border border-[oklch(0.90_0.004_260)]">
                  <p className="text-xs font-semibold text-[oklch(0.40_0.006_260)] uppercase tracking-wide mb-3">vs. Service Business Industry Average</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {([
                      { label: "Performance", score: result.performance, bench: BENCHMARKS.performance },
                      { label: "SEO", score: result.seo, bench: BENCHMARKS.seo },
                      { label: "Accessibility", score: result.accessibility, bench: BENCHMARKS.accessibility },
                      { label: "Best Practices", score: result.bestPractices, bench: BENCHMARKS.bestPractices },
                    ] as const).map((item) => {
                      const diff = item.score - item.bench;
                      const isAbove = diff >= 0;
                      return (
                        <div key={item.label} className="text-center">
                          <div className="text-xs text-[oklch(0.50_0.006_260)] mb-1">{item.label}</div>
                          <div className={`text-sm font-bold ${isAbove ? "text-emerald-600" : "text-[oklch(0.52_0.22_25)]"}`}>
                            {isAbove ? "+" : ""}{diff} vs avg {item.bench}
                          </div>
                          <div className="w-full bg-[oklch(0.90_0.004_260)] rounded-full h-1.5 mt-1.5 relative">
                            <div
                              className={`h-1.5 rounded-full ${isAbove ? "bg-emerald-500" : "bg-[oklch(0.52_0.22_25)]"}`}
                              style={{ width: `${item.score}%` }}
                            />
                            {/* Benchmark marker */}
                            <div
                              className="absolute top-0 w-0.5 h-1.5 bg-[oklch(0.40_0.006_260)]"
                              style={{ left: `${item.bench}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Performance", score: result.performance },
                    { label: "SEO", score: result.seo },
                    { label: "Accessibility", score: result.accessibility },
                    { label: "Best Practices", score: result.bestPractices },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-xl p-4 text-center border ${getScoreBg(item.score)}`}
                    >
                      <div
                        className={`text-3xl font-bold mb-1 ${getScoreColor(item.score)}`}
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {item.score}
                      </div>
                      <div className="text-xs text-[oklch(0.45_0.006_260)] font-medium">{item.label}</div>
                      <div className={`text-xs mt-1 font-semibold ${getScoreColor(item.score)}`}>
                        {getScoreLabel(item.score)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[oklch(0.97_0.002_260)] rounded-xl p-4 flex items-center gap-3">
                    <Clock size={18} className="text-[oklch(0.52_0.22_25)]" />
                    <div>
                      <div className="text-xs text-[oklch(0.55_0.006_260)]">Time to Interactive</div>
                      <div
                        className="text-lg font-bold text-[oklch(0.15_0.005_260)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {result.loadTime}s
                      </div>
                    </div>
                  </div>
                  <div className="bg-[oklch(0.97_0.002_260)] rounded-xl p-4 flex items-center gap-3">
                    <Smartphone size={18} className="text-[oklch(0.52_0.22_25)]" />
                    <div>
                      <div className="text-xs text-[oklch(0.55_0.006_260)]">Mobile Score</div>
                      <div
                        className="text-lg font-bold text-[oklch(0.15_0.005_260)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {result.mobileScore}/100
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Issues */}
            {result.issues && result.issues.length > 0 && (
              <ScrollReveal delay={0.1}>
                <div className="agency-card rounded-2xl p-8 max-w-5xl mx-auto mb-6">
                  <h3
                    className="text-xl font-bold text-[oklch(0.08_0.005_260)] mb-5"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Issues Found
                  </h3>
                  <div className="space-y-3">
                    {result.issues.map((issue: { title: string; description: string; severity: "critical" | "warning" | "info" }, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-4 rounded-xl bg-[oklch(0.97_0.002_260)] border border-[oklch(0.90_0.004_260)]"
                      >
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-[oklch(0.15_0.005_260)] text-sm">{issue.title}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityBadge(issue.severity)}`}>
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-[oklch(0.45_0.006_260)] text-sm">{issue.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Recommendations */}
            <ScrollReveal delay={0.15}>
              <div className="agency-card rounded-2xl p-8 max-w-5xl mx-auto mb-6">
                <h3
                  className="text-xl font-bold text-[oklch(0.08_0.005_260)] mb-5"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {result.recommendations.map((rec: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-[oklch(0.35_0.006_260)] text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Sticky Re-analyze bar */}
            <div className="sticky bottom-6 z-40 flex justify-center pointer-events-none">
              <button
                onClick={handleReset}
                className="pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-full bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.20_25)] text-white text-sm font-semibold shadow-lg shadow-[oklch(0.52_0.22_25_/_30%)] transition-all hover:scale-105 active:scale-95"
              >
                <Search size={15} />
                Analyze Another Site
              </button>
            </div>

            {/* CTA */}
            {showEmailCapture && (
              <ScrollReveal delay={0.2}>
                <div className="max-w-3xl mx-auto text-center agency-card rounded-2xl p-10 border-2 border-[oklch(0.52_0.22_25_/_20%)]">
                  <h3
                    className="text-2xl font-bold text-[oklch(0.08_0.005_260)] mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Want a{" "}
                    <span className="text-[oklch(0.52_0.22_25)]">Custom Action Plan?</span>
                  </h3>
                  <p className="text-[oklch(0.45_0.008_260)] mb-7 leading-relaxed">
                    Let's discuss how we can fix these issues and turn your website into a lead-generating machine.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/schedule">
                      <button className="btn-red">
                        Schedule a Free Call <ArrowRight size={16} />
                      </button>
                    </Link>
                    <Link href="/portfolio">
                      <button className="btn-ghost">View Our Work</button>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
