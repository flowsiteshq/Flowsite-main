/**
 * IndustryLanding — Reusable landing page component for each industry vertical.
 * Inspired by packthemats.com: bold hero, multiple photos throughout, tech stack, CTA.
 */
import { Link } from "wouter";
import { leadCaptureHref } from "@/lib/leadCapture";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Bot,
  Clock,
  CalendarDays,
  CreditCard,
  MessageSquare,
  BarChart3,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  Shield,
  Smartphone,
  Globe,
  Bell,
  TrendingUp,
  Lock,
  Mail,
  AlertCircle,
  Phone,
} from "lucide-react";

export interface IndustryConfig {
  slug: string;
  name: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImage?: string;
  galleryImages?: string[]; // 2–3 mid-page photos
  splitImage?: string;      // right-side split section image
  accentColor: string; // oklch value
  painPoints: { icon: string; title: string; desc: string }[];
  techFeatures: TechFeature[];
  results: { stat: string; label: string }[];
  testimonial?: { quote: string; name: string; business: string };
  ctaHeadline: string;
  ctaSubtext: string;
}

export interface TechFeature {
  icon: React.ElementType;
  category: string;
  title: string;
  description: string;
  bullets: string[];
  badge?: string;
}

// ─── Shared Tech Stack ────────────────────────────────────────────────────────
export const CORE_TECH_FEATURES: TechFeature[] = [
  {
    icon: Bot,
    category: "AI & Automation",
    title: "AI Sales Chatbot",
    description:
      "A 24/7 AI assistant lives on your website — answering questions, booking appointments, and sending enrollment links while you sleep.",
    bullets: [
      "Books appointments automatically",
      "Answers pricing & FAQ questions instantly",
      "Sends enrollment links & digital waivers",
      "Voice-enabled: tap to talk",
      "Remembers returning visitors",
    ],
    badge: "Most Popular",
  },
  {
    icon: Clock,
    category: "Business Automation",
    title: "Open/Close Automation",
    description:
      "Your website shows real-time open/closed status, next open time, and holiday hours — automatically synced with your schedule.",
    bullets: [
      "Live \"Open Now\" / \"Closed\" badge on your site",
      "Auto-updates based on your hours",
      "Holiday & special hours support",
      "\"Opens in X hours\" countdown",
      "Reduces \"are you open?\" calls by 80%",
    ],
  },
  {
    icon: CalendarDays,
    category: "Scheduling",
    title: "Advanced Class & Appointment Scheduling",
    description:
      "Real-time availability, AI-recommended time slots, and urgency logic that drives bookings — all embedded directly in your website.",
    bullets: [
      "Real-time class availability display",
      "\"Only 3 spots left\" urgency triggers",
      "AI-recommended slots based on age & goals",
      "Instant confirmation emails & SMS",
      "Syncs with your existing calendar",
    ],
  },
  {
    icon: CreditCard,
    category: "Enrollment & Payments",
    title: "AI Enrollment Engine",
    description:
      "One-click sign-up with Stripe payments, digital waivers, and automatic account creation — turning website visitors into paying members in under 2 minutes.",
    bullets: [
      "One-click enrollment with Stripe",
      "Digital waivers & e-signatures",
      "Auto account creation in your CRM",
      "Recurring billing & failed payment recovery",
      "Membership upgrade & downgrade flows",
    ],
  },
  {
    icon: MessageSquare,
    category: "Lead Nurturing",
    title: "SMS + Email Automation",
    description:
      "Instant follow-ups the moment a lead fills out a form. Drip campaigns, missed lead recovery, and re-engagement sequences — all on autopilot.",
    bullets: [
      "Instant SMS follow-up within 60 seconds",
      "Automated email drip sequences",
      "Missed lead recovery campaigns",
      "Re-engagement for cold leads",
      "DojoFlow CRM integration",
    ],
  },
  {
    icon: BarChart3,
    category: "Analytics",
    title: "Heatmaps & Behavior Tracking",
    description:
      "See exactly where visitors click, how far they scroll, and where they drop off — so you can optimize every page for maximum conversions.",
    bullets: [
      "Click heatmaps on every page",
      "Scroll depth tracking",
      "Drop-off funnel analysis",
      "A/B testing for offers & CTAs",
      "Monthly conversion reports",
    ],
  },
  {
    icon: Users,
    category: "Member Experience",
    title: "Member Portal & Dashboard",
    description:
      "Give your members a branded portal to view their progress, book classes, pay invoices, and stay engaged — all from your website.",
    bullets: [
      "Personal progress & attendance tracking",
      "Online class booking & cancellation",
      "Invoice & payment history",
      "Achievement badges & milestones",
      "Mobile-optimized experience",
    ],
  },
  {
    icon: TrendingUp,
    category: "Business Intelligence",
    title: "Analytics & Revenue Dashboard",
    description:
      "A real-time dashboard showing revenue, retention rate, dropout %, and at-risk members — so you always know the health of your business.",
    bullets: [
      "Revenue & MRR tracking",
      "Student retention & dropout rates",
      "At-risk member alerts",
      "Average tuition & LTV metrics",
      "Staff performance tracking",
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function IndustryLanding({ config }: { config: IndustryConfig }) {
  const accent = config.accentColor;

  return (
    <div className="bg-white">

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — Full-width industry photo with bold overlay text
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        {/* Background photo */}
        {config.heroImage ? (
          <div className="absolute inset-0">
            <img
              src={config.heroImage}
              alt={config.name}
              className="w-full h-full object-cover object-center"
            />
            {/* Strong bottom-up gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[oklch(0.08_0.005_260)]" />
        )}

        <div className="container relative z-10 pb-20 pt-48">
          <ScrollReveal>
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border"
              style={{
                color: accent,
                borderColor: `${accent.replace(")", " / 40%)")}`,
                background: `${accent.replace(")", " / 12%)")}`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
              FlowSites for {config.name}
            </span>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.0] tracking-tight max-w-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {config.heroHeadline.split("||").map((part, i) =>
                i % 2 === 0 ? (
                  <span key={i}>{part}</span>
                ) : (
                  <span key={i} style={{ color: accent }}>{part}</span>
                )
              )}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="mt-6 text-lg md:text-xl text-white/65 max-w-2xl leading-relaxed">
              {config.heroSubheadline}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href={leadCaptureHref({ intent: `Discuss a ${config.name} website` })}>
                <button
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 shadow-xl"
                  style={{
                    background: accent,
                    boxShadow: `0 8px 30px ${accent.replace(")", " / 40%)")}`,
                  }}
                >
                  Schedule a Free Call <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/portfolio">
                <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white/80 hover:text-white border border-white/25 hover:border-white/50 backdrop-blur-sm transition-all duration-300">
                  See Our Work
                </button>
              </Link>
            </div>
          </ScrollReveal>

          {/* Hero stats bar */}
          <ScrollReveal delay={0.4}>
            <div className="mt-16 flex flex-wrap gap-10 border-t border-white/15 pt-8">
              {config.results.map((r) => (
                <div key={r.label}>
                  <div
                    className="text-4xl font-bold"
                    style={{ color: accent, fontFamily: "var(--font-display)" }}
                  >
                    {r.stat}
                  </div>
                  <div className="text-sm text-white/50 mt-1">{r.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          GALLERY STRIP — 2–3 photos showing the industry in action
      ══════════════════════════════════════════════════════════════════════ */}
      {config.galleryImages && config.galleryImages.length > 0 && (
        <section className="py-0 overflow-hidden">
          <div className="flex gap-0 h-[380px] md:h-[480px]">
            {config.galleryImages.map((img, i) => (
              <div
                key={i}
                className="flex-1 relative overflow-hidden"
                style={{ minWidth: 0 }}
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                {/* subtle dark edge vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PAIN POINTS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[oklch(0.97_0.002_260)]">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="tag tag-red mb-3 inline-block">Sound Familiar?</span>
              <h2
                className="text-3xl md:text-4xl font-bold text-[oklch(0.08_0.005_260)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                The Problems Holding Your {config.name} Business Back
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {config.painPoints.map((p, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="agency-card rounded-2xl p-6 h-full">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                    <AlertCircle size={20} className="text-red-500" />
                  </div>
                  <h3
                    className="font-bold text-[oklch(0.15_0.005_260)] mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-sm text-[oklch(0.50_0.006_260)] leading-relaxed">{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SPLIT SECTION — Photo left, copy right (or vice versa)
      ══════════════════════════════════════════════════════════════════════ */}
      {config.splitImage && (
        <section className="py-0 overflow-hidden">
          <div className="flex flex-col md:flex-row min-h-[520px]">
            {/* Photo */}
            <div className="md:w-1/2 relative min-h-[320px] md:min-h-0">
              <img
                src={config.splitImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            {/* Copy */}
            <div
              className="md:w-1/2 flex items-center px-10 py-16 md:py-20"
              style={{ background: `oklch(0.97 0.005 260)` }}
            >
              <div className="max-w-lg">
                <ScrollReveal>
                  <span
                    className="text-xs font-bold uppercase tracking-widest mb-4 block"
                    style={{ color: accent }}
                  >
                    Built for {config.name}
                  </span>
                  <h2
                    className="text-3xl md:text-4xl font-bold text-[oklch(0.12_0.005_260)] leading-tight mb-6"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    A Website That Works as Hard as You Do
                  </h2>
                  <p className="text-[oklch(0.42_0.006_260)] leading-relaxed mb-8">
                    Most websites are digital brochures. Yours will be a 24/7 sales machine — capturing leads, booking appointments, processing payments, and nurturing prospects while you focus on what you do best.
                  </p>
                  <div className="space-y-3">
                    {[
                      "Converts visitors into paying customers automatically",
                      "Integrates with your existing tools & CRM",
                      "Mobile-first, lightning fast, SEO-optimized",
                      "Results in 90 days or we work for free",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 size={16} style={{ color: accent }} className="shrink-0" />
                        <span className="text-sm text-[oklch(0.30_0.005_260)]">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={leadCaptureHref({ intent: `Get a ${config.name} strategy call` })}>
                    <button
                      className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                      style={{ background: accent }}
                    >
                      Get a Free Strategy Call <ArrowRight size={16} />
                    </button>
                  </Link>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TECH STACK
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="tag tag-red mb-3 inline-block">The Technology</span>
              <h2
                className="text-3xl md:text-5xl font-bold text-[oklch(0.08_0.005_260)] max-w-3xl mx-auto leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Every Tool You Need,{" "}
                <span style={{ color: accent }}>Built Into Your Website</span>
              </h2>
              <p className="mt-4 text-lg text-[oklch(0.45_0.008_260)] max-w-2xl mx-auto">
                We don't just build websites. We build{" "}
                <strong>revenue systems</strong> — packed with AI, automation, and
                conversion technology that works 24/7.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-5 max-w-5xl mx-auto">
            {(config.techFeatures || CORE_TECH_FEATURES).map((feature, i) => (
              <ScrollReveal key={i} delay={i * 0.04}>
                <div className="agency-card rounded-2xl p-8 relative overflow-hidden">
                  {feature.badge && (
                    <span
                      className="absolute top-5 right-5 text-xs font-bold px-3 py-1 rounded-full text-white"
                      style={{ background: accent }}
                    >
                      {feature.badge}
                    </span>
                  )}
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-72 shrink-0">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: `${accent.replace(")", " / 10%)")}` }}
                      >
                        <feature.icon size={22} style={{ color: accent }} />
                      </div>
                      <span
                        className="text-xs font-bold uppercase tracking-widest mb-2 block"
                        style={{ color: accent }}
                      >
                        {feature.category}
                      </span>
                      <h3
                        className="text-xl font-bold text-[oklch(0.10_0.005_260)] mb-3 leading-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {feature.title}
                      </h3>
                      <p className="text-sm text-[oklch(0.45_0.006_260)] leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                      {feature.bullets.map((b, j) => (
                        <div key={j} className="flex items-start gap-2.5">
                          <CheckCircle2
                            size={15}
                            className="shrink-0 mt-0.5"
                            style={{ color: accent }}
                          />
                          <span className="text-sm text-[oklch(0.30_0.005_260)]">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          WHAT YOU GET SUMMARY
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ background: `oklch(0.97 0.005 260)` }}>
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl font-bold text-[oklch(0.12_0.005_260)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Your Website Becomes a{" "}
                <span style={{ color: accent }}>Complete Business System</span>
              </h2>
              <p className="mt-4 text-[oklch(0.45_0.006_260)] max-w-xl mx-auto">
                When you combine all of this, your "website" is no longer just a website.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Globe, label: "Website" },
              { icon: Bot, label: "AI Assistant" },
              { icon: Users, label: "CRM" },
              { icon: CalendarDays, label: "Scheduler" },
              { icon: CreditCard, label: "Billing" },
              { icon: MessageSquare, label: "Messaging" },
              { icon: BarChart3, label: "Analytics" },
              { icon: Shield, label: "Security" },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.04}>
                  <div
                    className="rounded-2xl p-5 text-center border bg-white shadow-sm"
                  style={{
                    background: `${accent.replace(")", " / 6%)")}`,
                    borderColor: `${accent.replace(")", " / 20%)")}`,
                  }}
                >
                  <item.icon size={24} className="mx-auto mb-2" style={{ color: accent }} />
                  <div className="text-sm font-semibold text-[oklch(0.25_0.005_260)]">{item.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TESTIMONIAL
      ══════════════════════════════════════════════════════════════════════ */}
      {config.testimonial && (
        <section className="py-20 bg-[oklch(0.97_0.002_260)]">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center">
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill="oklch(0.78 0.12 85)" color="oklch(0.78 0.12 85)" />
                  ))}
                </div>
                <blockquote
                  className="text-2xl md:text-3xl font-bold text-[oklch(0.12_0.005_260)] leading-snug mb-6"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  "{config.testimonial.quote}"
                </blockquote>
                <p className="text-[oklch(0.45_0.006_260)] font-medium">
                  — {config.testimonial.name},{" "}
                  <span style={{ color: accent }}>{config.testimonial.business}</span>
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <h2
                className="text-3xl md:text-5xl font-bold text-[oklch(0.08_0.005_260)] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {config.ctaHeadline}
              </h2>
              <p className="mt-5 text-lg text-[oklch(0.45_0.008_260)] leading-relaxed">
                {config.ctaSubtext}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={leadCaptureHref({ intent: `Schedule a ${config.name} strategy call` })}>
                  <button
                    className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-base font-bold text-white transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
                    style={{
                      background: accent,
                      boxShadow: `0 8px 30px ${accent.replace(")", " / 35%)")}`,
                    }}
                  >
                    Schedule a Free Call <ArrowRight size={18} />
                  </button>
                </Link>
                <Link href={leadCaptureHref({ intent: `See ${config.name} website pricing` })}>
                  <button className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-base font-semibold text-[oklch(0.25_0.005_260)] border-2 border-[oklch(0.85_0.004_260)] hover:border-[oklch(0.70_0.004_260)] transition-all duration-300">
                    See Pricing
                  </button>
                </Link>
              </div>
              <p className="mt-5 text-sm text-[oklch(0.60_0.005_260)]">
                No contracts. No setup fees. 100% risk-free — results in 90 days or we work for free.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
