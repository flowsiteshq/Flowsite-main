/*
 * PolicyPilot Case Study Page
 * Design: "Liquid Glass" — Dark Premium Glassmorphism
 * Detailed case study with Nana Banana human-touch illustrations
 */

import { Link } from "wouter";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  Target,
  Zap,
  MessageSquare,
} from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/policypilot-mockup-aezabRRzohgw49RmzESpqN.webp";
const TEAM_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/policypilot-team-UTtrJkwdUhBpwnhrUHFRX4.webp";
const AGENT_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/policypilot-hero-KmfpYgSsVuBVg8tBvgXi5T.webp";
const RESULT_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/policypilot-result-U78D9HgGUagx5JiTMP9PJR.webp";

const keyResults = [
  { icon: Users, label: "Trial Signups", value: "+340%", description: "Free trial registrations in first 60 days post-launch" },
  { icon: Target, label: "Page Conversion", value: "18.4%", description: "Visitor-to-trial signup rate on the new landing page" },
  { icon: MessageSquare, label: "Demo Bookings", value: "+220%", description: "Qualified demo calls booked through the site" },
  { icon: TrendingUp, label: "MRR Growth", value: "+285%", description: "Monthly recurring revenue increase within 90 days" },
];

const challenges = [
  "Generic SaaS template that failed to communicate the insurance-specific value proposition",
  "No clear conversion funnel — visitors left without understanding the product",
  "Pricing page had high bounce rate with no objection-handling copy",
  "No social proof or testimonials to build trust with insurance agency owners",
  "Mobile experience was broken, losing 60%+ of mobile traffic",
];

const solutions = [
  "Purpose-built insurance agency landing page with industry-specific messaging and visuals",
  "Conversion-focused funnel: hero → features → how it works → pricing → trial CTA",
  "Objection-handling pricing section with FAQs, feature comparison, and risk-reversal copy",
  "Testimonials section with real agency owner quotes and results-driven social proof",
  "Fully responsive mobile-first design with fast load times and optimized CTAs",
];

const testimonials = [
  {
    quote: "Our old website looked like every other SaaS tool. FlowSites rebuilt it around our actual customers — insurance agents — and the difference was immediate. Trial signups tripled in the first two months.",
    author: "Marcus Rivera",
    role: "Co-Founder, PolicyPilot",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/policypilot-hero-KmfpYgSsVuBVg8tBvgXi5T.webp",
    isIllustration: true,
  },
  {
    quote: "The new pricing page alone paid for the entire project. FlowSites added the right copy, the right comparisons, and the right trust signals. Our demo-to-close rate went up 40% because prospects arrive better informed.",
    author: "Priya Nair",
    role: "Head of Growth, PolicyPilot",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/policypilot-result-U78D9HgGUagx5JiTMP9PJR.webp",
    isIllustration: true,
  },
];

export default function CaseStudyPolicyPilot() {
  useSEO({
    title: "PolicyPilot Case Study — 340% Trial Signup Increase for Insurance CRM",
    description: "See how FlowSites built a high-converting SaaS landing page for PolicyPilot, the AI-powered CRM for insurance agencies. Results: +340% trial signups, 18.4% conversion rate, +285% MRR growth.",
    keywords: "PolicyPilot case study, SaaS landing page design, insurance CRM website, high-converting SaaS website, FlowSites case study",
    canonical: "/case-study/policypilot",
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
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[oklch(0.5_0.2_220_/_8%)] blur-[120px] animate-pulse" />

        <div className="container">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full glass text-sm text-white/70 font-medium">Case Study</span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[oklch(0.45_0.18_220)] to-[oklch(0.55_0.2_200)] text-white text-sm font-medium">Insurance Tech</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white max-w-4xl mb-6" style={{ fontFamily: "var(--font-display)" }}>
              PolicyPilot
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-xl md:text-2xl text-white/50 max-w-3xl mb-12">
              How an AI-powered insurance CRM tripled trial signups with a purpose-built landing page engineered for conversion.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Industry</div>
                <div className="text-lg font-semibold text-white">Insurance SaaS</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Timeline</div>
                <div className="text-lg font-semibold text-white">3 Weeks</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Website</div>
                <div className="text-lg font-semibold text-white">policypilot.life</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Launch</div>
                <div className="text-lg font-semibold text-white">Q1 2026</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="relative rounded-3xl overflow-hidden glass p-8">
              <img src={HERO_IMAGE} alt="PolicyPilot Website on MacBook" className="w-full rounded-2xl" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Human Touch Section — Nana Banana Illustration */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <ScrollReveal>
              <div className="rounded-3xl overflow-hidden">
                <img
                  src={AGENT_IMAGE}
                  alt="Insurance agent using PolicyPilot CRM dashboard"
                  className="w-full h-80 object-cover rounded-3xl"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div>
                <span className="text-sm font-semibold text-[oklch(0.65_0.18_200)] uppercase tracking-widest">The Mission</span>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                  Built for Real Insurance Agents
                </h2>
                <p className="text-lg text-white/60 leading-relaxed">
                  PolicyPilot had a powerful product — an AI-driven CRM that captures Facebook Messenger leads, automates follow-ups, and manages the full pipeline for insurance agencies. What they needed was a website that spoke directly to the agents using it every day: busy, results-driven professionals who needed to see the value immediately.
                </p>
              </div>
            </ScrollReveal>
          </div>
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
                  PolicyPilot launched with a generic SaaS template that buried their unique value proposition. Insurance agency owners couldn't quickly understand why this CRM was built specifically for them — and the numbers showed it. High bounce rates, low trial signups, and a pricing page that confused more than it converted.
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
                  We rebuilt policypilot.life from the ground up as a conversion-first SaaS landing page. Every section was designed with one goal: get insurance agency owners to start their free trial. We led with industry-specific messaging, backed it with real results, and removed every friction point between "landing" and "signing up."
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

      {/* Team Celebration Image */}
      <section className="py-8 md:py-12 relative">
        <div className="container">
          <ScrollReveal>
            <div className="rounded-3xl overflow-hidden relative">
              <img
                src={TEAM_IMAGE}
                alt="PolicyPilot team celebrating growth metrics"
                className="w-full h-72 md:h-96 object-cover rounded-3xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.07_0.005_260_/_70%)] to-transparent rounded-3xl" />
              <div className="absolute bottom-8 left-8">
                <div className="glass px-6 py-4 rounded-2xl inline-block">
                  <p className="text-white font-semibold text-lg">The moment the numbers started climbing 📈</p>
                  <p className="text-white/60 text-sm mt-1">PolicyPilot team reacting to 60-day post-launch analytics</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Key Results Section */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute left-1/4 top-1/2 w-80 h-80 rounded-full bg-[oklch(0.45_0.18_220_/_6%)] blur-[100px]" />

        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Transformative Results
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                Within 60 days of the new site going live, PolicyPilot saw explosive growth across every key metric.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyResults.map((result, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="glass p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 group">
                  <result.icon size={32} className="text-[oklch(0.55_0.2_200)] mb-4 group-hover:scale-110 transition-transform duration-300" />
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

      {/* Before/After Comparison */}
      <section className="py-16 md:py-24 relative">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center" style={{ fontFamily: "var(--font-display)" }}>
              Before & After
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            <ScrollReveal>
              <div className="glass p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-[oklch(0.5_0.2_25_/_40%)]" />
                  <h3 className="text-2xl font-bold text-white/50">Before</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Monthly Trial Signups</div>
                    <div className="text-2xl font-bold text-white/50">28</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Landing Page Conversion</div>
                    <div className="text-2xl font-bold text-white/50">4.2%</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Mobile Bounce Rate</div>
                    <div className="text-2xl font-bold text-white/50">72%</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Demo Bookings / Month</div>
                    <div className="text-2xl font-bold text-white/50">9</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="glass p-8 rounded-2xl border-2 border-[oklch(0.55_0.2_200_/_30%)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-[oklch(0.55_0.2_200)]" />
                  <h3 className="text-2xl font-bold text-white">After</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.55_0.2_200_/_10%)] to-[oklch(0.45_0.18_220_/_5%)] border border-[oklch(0.55_0.2_200_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Monthly Trial Signups</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      123
                      <span className="text-sm text-[oklch(0.65_0.18_200)]">+340%</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.55_0.2_200_/_10%)] to-[oklch(0.45_0.18_220_/_5%)] border border-[oklch(0.55_0.2_200_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Landing Page Conversion</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      18.4%
                      <span className="text-sm text-[oklch(0.65_0.18_200)]">+338%</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.55_0.2_200_/_10%)] to-[oklch(0.45_0.18_220_/_5%)] border border-[oklch(0.55_0.2_200_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Mobile Bounce Rate</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      28%
                      <span className="text-sm text-[oklch(0.65_0.18_200)]">-61%</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.55_0.2_200_/_10%)] to-[oklch(0.45_0.18_220_/_5%)] border border-[oklch(0.55_0.2_200_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Demo Bookings / Month</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      29
                      <span className="text-sm text-[oklch(0.65_0.18_200)]">+220%</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Result Illustration */}
      <section className="py-8 md:py-12 relative">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <ScrollReveal delay={0.2}>
              <div>
                <span className="text-sm font-semibold text-[oklch(0.65_0.18_200)] uppercase tracking-widest">The Impact</span>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                  Leads on Autopilot
                </h2>
                <p className="text-lg text-white/60 leading-relaxed">
                  After the new site launched, PolicyPilot's customers started experiencing exactly what the product promised — leads flowing in automatically, pipelines filling up, and agencies reclaiming hours every week. The website now mirrors the product's core promise: set it up once and watch it work.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <a
                    href="https://policypilot.life"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[oklch(0.45_0.18_220)] to-[oklch(0.55_0.2_200)] hover:opacity-90 transition-all duration-300"
                  >
                    Visit policypilot.life
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="rounded-3xl overflow-hidden">
                <img
                  src={RESULT_IMAGE}
                  alt="Insurance agency owner enjoying automated lead flow from PolicyPilot"
                  className="w-full h-80 object-cover rounded-3xl"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center" style={{ fontFamily: "var(--font-display)" }}>
              What The Team Says
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="glass p-8 rounded-2xl">
                  <div className="text-6xl text-[oklch(0.55_0.2_200)] mb-4 leading-none">"</div>
                  <p className="text-lg text-white/70 leading-relaxed mb-6 italic">
                    {testimonial.quote}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-[oklch(0.45_0.18_220)] to-[oklch(0.55_0.2_200)] flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {testimonial.author.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.author}</div>
                      <div className="text-sm text-white/50">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[oklch(0.45_0.18_220_/_5%)] to-transparent" />

        <div className="container relative">
          <ScrollReveal>
            <div className="glass p-12 md:p-16 rounded-3xl text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                Ready to Build Your SaaS Landing Page?
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10">
                Whether you're a SaaS startup, a service business, or a martial arts school — we build websites that convert visitors into customers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/get-started">
                  <button className="group px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] hover:from-[oklch(0.55_0.22_25)] hover:to-[oklch(0.45_0.2_25)] transition-all duration-300 shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)] hover:shadow-[oklch(0.5_0.2_25_/_40%)] flex items-center gap-2">
                    Start Your Project
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="/portfolio">
                  <button className="px-8 py-4 rounded-xl text-base font-semibold text-white/80 hover:text-white glass hover:bg-white/10 transition-all duration-300">
                    View More Work
                  </button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
