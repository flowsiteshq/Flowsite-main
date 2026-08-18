/*
 * BlueTide Financial Case Study Page
 * Design: "Liquid Glass" — Dark Premium Glassmorphism
 * Detailed case study with challenges, solutions, results, and testimonials
 */

import { Link } from "wouter";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Users,
  Clock,
  Target,
  Shield,
  DollarSign,
} from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/bluetide-mockup_cd2c111d.png";

const keyResults = [
  { icon: Users, label: "Consultation Requests", value: "+310%", description: "Increase in free consultation bookings within 60 days of launch" },
  { icon: TrendingUp, label: "Organic Traffic", value: "+185%", description: "Growth in organic search visitors from SEO-optimized content" },
  { icon: Clock, label: "Avg. Time on Site", value: "4m 38s", description: "Visitors deeply engage with educational financial content" },
  { icon: DollarSign, label: "Lead Quality", value: "68%", description: "Of new leads pre-qualified via the Rule of 72 education funnel" },
];

const challenges = [
  "No digital presence to capture leads from families and professionals seeking tax-advantaged strategies",
  "Complex financial products (IUL, tax-free retirement) that required clear, jargon-free explanation",
  "Difficulty building trust and credibility online in a highly regulated financial services industry",
  "No automated system to nurture leads from first contact to booked consultation",
  "Competitors with established websites dominating local search results",
];

const solutions = [
  "Built a professional, trust-first website with clear licensing credentials and client testimonials prominently displayed",
  "Designed an education-first content architecture — Rule of 72, IUL explainers, and tax strategy guides — to pre-qualify leads",
  "Integrated a consultation booking funnel with automated follow-up sequences to nurture prospects",
  "Implemented local SEO strategy targeting wealth management and insurance keywords in the target market",
  "Created service-specific landing pages for IUL, Tax-Free Retirement, Asset Protection, and Legacy Planning",
];

const testimonials = [
  {
    quote: "FlowSites built exactly what we needed — a website that educates first and sells second. Our clients arrive at consultations already understanding IUL and tax-free retirement strategies. The quality of conversations has completely changed.",
    author: "Dr. Oscar Atumah",
    role: "Founder, BlueTide Financial",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    quote: "Within two months of launching our new site, we had more consultation requests than the previous six months combined. The booking funnel and follow-up automation have been game-changers for our practice.",
    author: "BlueTide Financial",
    role: "Client Success Story",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
  },
];

const beforeItems = [
  "No website — relying entirely on word-of-mouth referrals",
  "No way for prospects to learn about IUL or tax-free retirement before a call",
  "Manual follow-up process with no automation",
  "Zero visibility in local search results",
  "No trust signals or social proof for new prospects",
];

const afterItems = [
  "Professional, conversion-optimized website at bluetidefinancial.com",
  "Education-first content architecture that pre-qualifies leads automatically",
  "Automated consultation booking with follow-up email sequences",
  "Page 1 rankings for target financial services keywords in local market",
  "Prominent licensing credentials, testimonials, and trust badges throughout",
];

export default function CaseStudyBlueTide() {
  useSEO({
    title: "BlueTide Financial Case Study — 310% Consultation Increase with FlowSites",
    description: "See how FlowSites built a trust-first, education-led website for BlueTide Financial that increased consultation bookings by 310% and established their digital presence in the tax-advantaged wealth management space.",
    keywords: "BlueTide Financial website, financial advisor website design, IUL website, tax-free retirement website, wealth management website case study",
    canonical: "/case-study/bluetide",
  });

  return (
    <div className="overflow-hidden">
      {/* Back Button */}
      <div className="fixed top-24 left-8 z-50">
        <Link href="/portfolio">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/10 transition-all duration-300 text-white/70 hover:text-white">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Portfolio</span>
          </button>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 relative">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[oklch(0.45_0.15_240_/_8%)] blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[oklch(0.78_0.12_85_/_5%)] blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="container">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full glass text-sm text-white/70 font-medium">Case Study</span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[oklch(0.45_0.15_240)] to-[oklch(0.35_0.12_240)] text-white text-sm font-medium">Financial Services</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white max-w-4xl mb-6" style={{ fontFamily: "var(--font-display)" }}>
              BlueTide Financial
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-xl md:text-2xl text-white/50 max-w-3xl mb-12">
              Building a trust-first digital presence for a tax-advantaged wealth management firm — from zero online visibility to 310% more consultation bookings in 60 days.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Industry</div>
                <div className="text-lg font-semibold text-white">Financial Services</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Timeline</div>
                <div className="text-lg font-semibold text-white">6 Weeks</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Services</div>
                <div className="text-lg font-semibold text-white">Web + SEO + Funnel</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Launch</div>
                <div className="text-lg font-semibold text-white">Q1 2026</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="relative rounded-3xl overflow-hidden glass p-8">
              <img src={HERO_IMAGE} alt="BlueTide Financial Website" className="w-full rounded-2xl" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <ScrollReveal>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                  The Challenge
                </h2>
                <p className="text-lg text-white/60 leading-relaxed mb-8">
                  Dr. Oscar Atumah founded BlueTide Financial to give individuals, families, and business owners access to tax-advantaged financial strategies — but without a digital presence, the firm was invisible online. Complex products like Indexed Universal Life (IUL) and tax-free retirement strategies required a website that could educate prospects before the first conversation, not just collect contact forms.
                </p>
                <div className="space-y-3">
                  {challenges.map((challenge, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.5_0.2_25)] mt-2 flex-shrink-0" />
                      <p className="text-white/50">{challenge}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                  Our Solution
                </h2>
                <p className="text-lg text-white/60 leading-relaxed mb-8">
                  We built an education-first website that mirrors BlueTide's core philosophy — understand before you buy. The site simplifies IUL, tax-free retirement, and legacy planning through interactive content, the Rule of 72 calculator, and clear service pages. Every page is engineered to build trust and guide visitors toward a free consultation booking.
                </p>
                <div className="space-y-3">
                  {solutions.map((solution, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-[oklch(0.78_0.12_85)] mt-0.5 flex-shrink-0" />
                      <p className="text-white/70">{solution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Key Results Section */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute left-1/4 top-1/2 w-80 h-80 rounded-full bg-[oklch(0.78_0.12_85_/_6%)] blur-[100px]" />

        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Results That Speak
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                Within 60 days of launch, BlueTide Financial saw transformative growth across all key metrics.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyResults.map((result, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="glass p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 group">
                  <result.icon size={32} className="text-[oklch(0.5_0.2_25)] mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    {result.value}
                  </div>
                  <div className="text-sm font-semibold text-white/70 mb-3">{result.label}</div>
                  <div className="text-xs text-white/40 leading-relaxed">{result.description}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After Comparison */}
      <section className="py-16 md:py-24 relative">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center" style={{ fontFamily: "var(--font-display)" }}>
              Before &amp; After
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            <ScrollReveal>
              <div className="glass p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-[oklch(0.5_0.2_25_/_40%)]" />
                  <h3 className="text-xl font-bold text-white/60">Before FlowSites</h3>
                </div>
                <div className="space-y-4">
                  {beforeItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                      </div>
                      <p className="text-white/40 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="glass p-8 rounded-2xl border border-[oklch(0.78_0.12_85_/_20%)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-[oklch(0.78_0.12_85)]" />
                  <h3 className="text-xl font-bold text-white">After FlowSites</h3>
                </div>
                <div className="space-y-4">
                  {afterItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-[oklch(0.78_0.12_85)] flex-shrink-0 mt-0.5" />
                      <p className="text-white/70 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* What We Built Section */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute right-0 top-1/2 w-96 h-96 rounded-full bg-[oklch(0.45_0.15_240_/_6%)] blur-[120px]" />
        <div className="container">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-12 text-center" style={{ fontFamily: "var(--font-display)" }}>
              What We Built
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Trust Architecture",
                description: "Licensing credentials (NAA529684), client testimonials, and a clear 'no pressure, no jargon' brand voice woven throughout every page to build credibility with skeptical prospects.",
              },
              {
                icon: Target,
                title: "Education Funnel",
                description: "Interactive Rule of 72 calculator, IUL explainer pages, and tax-free retirement guides that educate visitors and position Dr. Atumah as the go-to expert before the first call.",
              },
              {
                icon: TrendingUp,
                title: "Consultation Booking System",
                description: "Integrated booking flow with automated email follow-ups, pre-call questionnaire, and calendar sync — turning website visitors into booked consultations on autopilot.",
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="glass p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 group h-full">
                  <item.icon size={36} className="text-[oklch(0.78_0.12_85)] mb-5 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
                    {item.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center" style={{ fontFamily: "var(--font-display)" }}>
              In Their Own Words
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="glass p-8 rounded-2xl h-full flex flex-col">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="w-4 h-4 rounded-full bg-[oklch(0.78_0.12_85)]" />
                    ))}
                  </div>
                  <p className="text-white/70 text-lg leading-relaxed mb-8 flex-1">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-white font-semibold">{testimonial.author}</div>
                      <div className="text-white/40 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[oklch(0.5_0.2_25_/_5%)] to-transparent" />
        <div className="container text-center relative z-10">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
              Ready to Build Your Digital Presence?
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10">
              Whether you're a financial advisor, insurance professional, or service business — we build websites that educate, build trust, and convert visitors into clients.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/get-started">
                <button className="px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] hover:from-[oklch(0.55_0.22_25)] hover:to-[oklch(0.45_0.2_25)] transition-all duration-300 shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)]">
                  Book a Free Strategy Call
                </button>
              </Link>
              <Link href="/portfolio">
                <button className="px-8 py-4 rounded-xl text-base font-semibold text-white/80 hover:text-white glass hover:bg-white/10 transition-all duration-300">
                  View More Work
                </button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
