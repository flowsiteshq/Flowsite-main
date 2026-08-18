import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSEO } from "@/hooks/useSEO";
import ScrollReveal from "@/components/ScrollReveal";
import { Link, useParams } from "wouter";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  Clock,
  Smartphone,
  ArrowRight,
  Copy,
  Globe,
  TrendingUp,
  Zap,
  Shield,
} from "lucide-react";

// Industry benchmarks for service businesses
const BENCHMARKS = {
  performance: 52,
  seo: 71,
  accessibility: 68,
  bestPractices: 75,
};

export default function AnalyzerResults() {
  const params = useParams<{ shareId: string }>();
  const shareId = params.shareId ?? "";
  const [copied, setCopied] = useState(false);

  useSEO({
    title: "Website Analysis Report | FlowSites",
    description: "View a detailed website performance, SEO, and conversion analysis report powered by Google PageSpeed Insights.",
    canonical: `/analyzer/results/${shareId}`,
  });

  const { data: result, isLoading, error } = trpc.analyzer.getByShareId.useQuery(
    { shareId },
    { enabled: !!shareId, retry: false }
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

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

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="pt-32 pb-12 bg-[oklch(0.97_0.002_260)] border-b border-[oklch(0.90_0.004_260)]">
        <div className="container">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <span className="tag tag-red mb-4 inline-block">Website Report</span>
              <h1
                className="text-3xl md:text-4xl font-bold text-[oklch(0.08_0.005_260)] leading-[1.15]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {isLoading ? "Loading Report…" : error ? "Report Not Found" : "Website Analysis Report"}
              </h1>
              {result && (
                <p className="mt-3 text-[oklch(0.52_0.22_25)] font-medium flex items-center justify-center gap-2">
                  <Globe size={15} />
                  {result.url}
                </p>
              )}
              {result && (
                <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-sm font-medium text-[oklch(0.52_0.22_25)] hover:text-[oklch(0.45_0.20_25)] transition-colors"
                  >
                    {copied ? (
                      <><CheckCircle2 size={14} /> Copied!</>
                    ) : (
                      <><Copy size={14} /> Copy shareable link</>
                    )}
                  </button>
                  <span className="text-[oklch(0.80_0.004_260)]">·</span>
                  <Link href="/analyzer" className="text-sm text-[oklch(0.45_0.006_260)] hover:text-[oklch(0.20_0.005_260)] underline transition-colors">
                    Analyze your site
                  </Link>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Loading */}
      {isLoading && (
        <section className="py-20">
          <div className="container flex justify-center">
            <div className="flex items-center gap-3 text-[oklch(0.45_0.006_260)]">
              <div className="w-5 h-5 border-2 border-[oklch(0.52_0.22_25_/_30%)] border-t-[oklch(0.52_0.22_25)] rounded-full animate-spin" />
              Loading report…
            </div>
          </div>
        </section>
      )}

      {/* Error */}
      {error && !isLoading && (
        <section className="py-20">
          <div className="container max-w-lg mx-auto text-center">
            <div className="agency-card rounded-2xl p-10">
              <AlertCircle size={40} className="text-[oklch(0.52_0.22_25)] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[oklch(0.08_0.005_260)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Report Not Found
              </h2>
              <p className="text-[oklch(0.45_0.008_260)] mb-6">
                This report link may have expired or the ID is incorrect.
              </p>
              <Link href="/analyzer">
                <button className="btn-red">Analyze a Website <ArrowRight size={15} /></button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {result && (
        <section className="py-16">
          <div className="container">

            {/* Overall Score Card */}
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
                    <p className="text-[oklch(0.45_0.008_260)] text-sm mt-0.5">
                      Analyzed on {new Date(result.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <Link href="/analyzer">
                    <button className="text-sm text-[oklch(0.45_0.006_260)] hover:text-[oklch(0.20_0.005_260)] transition-colors underline">
                      Analyze another site
                    </button>
                  </Link>
                </div>

                {/* Benchmark comparison */}
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
                      <div className="text-lg font-bold text-[oklch(0.15_0.005_260)]" style={{ fontFamily: "var(--font-display)" }}>
                        {result.loadTime}s
                      </div>
                    </div>
                  </div>
                  <div className="bg-[oklch(0.97_0.002_260)] rounded-xl p-4 flex items-center gap-3">
                    <Smartphone size={18} className="text-[oklch(0.52_0.22_25)]" />
                    <div>
                      <div className="text-xs text-[oklch(0.55_0.006_260)]">Mobile Score</div>
                      <div className="text-lg font-bold text-[oklch(0.15_0.005_260)]" style={{ fontFamily: "var(--font-display)" }}>
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
            {result.recommendations && result.recommendations.length > 0 && (
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
            )}

            {/* CTA */}
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

          </div>
        </section>
      )}
    </div>
  );
}
