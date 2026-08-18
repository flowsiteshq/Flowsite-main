/*
 * DojoFlow Case Study Page
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
  Brain,
} from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/dojoflow-hero-AdXSRFP2c2a4zAmpq8sKwr.webp";
const RESULTS_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/dojoflow-results-eEgyQbBixmZhs5Vxuv5e2W.webp";
const INTEGRATION_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/dojoflow-integration-9GFPBzzUDRiGLhteMYFPDK.webp";

const keyResults = [
  { icon: Users, label: "Demo Signups", value: "+410%", description: "Demo request submissions in first 90 days post-launch" },
  { icon: Target, label: "Trial Conversion", value: "22.7%", description: "Visitor-to-free-trial conversion rate on the new site" },
  { icon: Brain, label: "AI Feature Adoption", value: "+180%", description: "Users engaging with AI-powered features after site relaunch" },
  { icon: TrendingUp, label: "MRR Growth", value: "+320%", description: "Monthly recurring revenue growth within 120 days" },
];

const challenges = [
  "Existing website failed to communicate the AI-powered differentiation from legacy dojo management tools",
  "No clear onboarding funnel — school owners couldn't visualize how DojoFlow would fit their workflow",
  "Feature list was overwhelming with no prioritization or hierarchy for first-time visitors",
  "No integration showcase — the DojoFlow ↔ website connection story was completely absent",
  "Mobile experience was poor, losing a significant portion of school owner traffic",
];

const solutions = [
  "Purpose-built martial arts SaaS landing page leading with AI-powered enrollment automation messaging",
  "Visual 'How It Works' funnel showing the DojoFlow → website → student enrollment pipeline step-by-step",
  "Feature showcase prioritizing the highest-value capabilities: AI lead follow-up, automated billing, class scheduling",
  "Dedicated integration section demonstrating how DojoFlow connects to FlowSites-built websites in real time",
  "Mobile-first responsive design with sub-2-second load times and conversion-optimized CTAs throughout",
];

const testimonials = [
  {
    quote: "We had the best martial arts CRM on the market but our website didn't show it. FlowSites rebuilt our entire online presence around the AI story — and school owners finally get it. Our demo pipeline went from a trickle to a flood.",
    author: "Master Vincent Holmes",
    role: "Founder, DojoFlow & MyDojo Martial Arts",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/vincent-holmes_3d76c71a.jpg",
    isIllustration: false,
  },
  {
    quote: "The integration section FlowSites built was a game-changer. For the first time, school owners could see exactly how DojoFlow connects to their website and automates the entire enrollment process. That visual story closed deals for us.",
    author: "Tanya Okafor",
    role: "Head of Partnerships, DojoFlow",
    image: INTEGRATION_IMAGE,
    isIllustration: true,
  },
];

export default function CaseStudyDojoFlow() {
  useSEO({
    title: "DojoFlow Case Study — 410% Demo Growth for AI Martial Arts CRM",
    description: "See how FlowSites built a high-converting SaaS landing page for DojoFlow, the AI-powered CRM for martial arts schools. Results: +410% demo signups, 22.7% conversion rate, +320% MRR growth.",
    keywords: "DojoFlow case study, martial arts CRM website, AI dojo management software, high-converting SaaS website, FlowSites case study, DojoFlow integration",
    canonical: "/case-study/dojoflow",
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
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[oklch(0.5_0.2_25_/_8%)] blur-[120px] animate-pulse" />

        <div className="container">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full glass text-sm text-white/70 font-medium">Case Study</span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[oklch(0.45_0.2_25)] to-[oklch(0.55_0.22_15)] text-white text-sm font-medium">AI SaaS</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white max-w-4xl mb-6" style={{ fontFamily: "var(--font-display)" }}>
              DojoFlow
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-xl md:text-2xl text-white/50 max-w-3xl mb-12">
              How the AI-powered martial arts CRM turned its website into a demo-booking machine — and grew monthly recurring revenue by 320% in 120 days.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Industry</div>
                <div className="text-lg font-semibold text-white">AI SaaS / CRM</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Timeline</div>
                <div className="text-lg font-semibold text-white">4 Weeks</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Website</div>
                <div className="text-lg font-semibold text-white">dojo-flow.ai</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Launch</div>
                <div className="text-lg font-semibold text-white">Q1 2026</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="relative rounded-3xl overflow-hidden glass p-8">
              <img src={HERO_IMAGE} alt="DojoFlow school owner using AI CRM dashboard" className="w-full rounded-2xl" />
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
                  src={INTEGRATION_IMAGE}
                  alt="FlowSites and DojoFlow integration partnership"
                  className="w-full h-80 object-cover rounded-3xl"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div>
                <span className="text-sm font-semibold text-[oklch(0.65_0.2_25)] uppercase tracking-widest">The Partnership</span>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                  The CRM That Powers Our Clients
                </h2>
                <p className="text-lg text-white/60 leading-relaxed">
                  DojoFlow isn't just a client — it's the engine behind every martial arts website we build. As the official DojoFlow integration partner, FlowSites connects every website we create directly into DojoFlow's AI-powered CRM, creating a seamless pipeline from first website visit to enrolled student. Building DojoFlow's own website was a natural extension of that partnership.
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
                  DojoFlow had built the most advanced AI-powered CRM for martial arts schools — with automated lead follow-up, intelligent billing, and real-time class management. But their website told none of that story. School owners visiting the site couldn't differentiate DojoFlow from generic gym management tools, and the demo pipeline reflected it.
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
                  We rebuilt dojo-flow.ai as a conversion-first AI SaaS landing page. Every section was engineered to answer one question school owners have: "Will this actually help me enroll more students?" We led with the AI story, showed the integration pipeline visually, and made the path to a demo frictionless.
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

      {/* Key Results */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-[oklch(0.65_0.2_25)] uppercase tracking-widest">The Results</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                Numbers That Speak for Themselves
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {keyResults.map((result, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="glass p-8 rounded-3xl text-center group hover:bg-white/5 transition-all duration-300">
                  <result.icon size={28} className="text-[oklch(0.65_0.2_25)] mx-auto mb-4" />
                  <div className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    {result.value}
                  </div>
                  <div className="text-sm font-semibold text-white/70 mb-2">{result.label}</div>
                  <div className="text-xs text-white/40 leading-relaxed">{result.description}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.4}>
            <div className="rounded-3xl overflow-hidden glass p-6">
              <img src={RESULTS_IMAGE} alt="DojoFlow school owner celebrating enrollment growth" className="w-full rounded-2xl" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-[oklch(0.65_0.2_25)] uppercase tracking-widest">What They Said</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                In Their Own Words
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="glass p-8 rounded-3xl h-full flex flex-col">
                  <div className="text-3xl text-[oklch(0.5_0.2_25)] mb-6 font-serif">"</div>
                  <p className="text-white/70 leading-relaxed text-lg flex-1 mb-8">{t.quote}</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <img src={t.image} alt={t.author} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{t.author}</div>
                      <div className="text-sm text-white/50">{t.role}</div>
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
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="container text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
              Ready to Build Your<br />
              <span className="text-gradient-red">Enrollment Machine?</span>
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10">
              Join DojoFlow, PolicyPilot, and other fast-growing businesses that trust FlowSites to turn their website into their best sales tool.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <button className="group px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] hover:from-[oklch(0.55_0.22_25)] hover:to-[oklch(0.45_0.2_25)] transition-all duration-300 shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)] flex items-center gap-2">
                  Book a Free Strategy Call
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
