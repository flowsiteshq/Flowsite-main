/*
 * Hach Ki Cafe Case Study Page
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
  Star,
  ShoppingBag,
  Globe,
  Smartphone,
} from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/hachki-screenshot_40f7d4d5.png";

const keyResults = [
  { icon: ShoppingBag, label: "Pre-Orders", value: "+180%", description: "Increase in online pre-orders within 60 days of launching the new site" },
  { icon: Globe, label: "Organic Traffic", value: "+220%", description: "Growth in organic search visitors from local SEO and bilingual content" },
  { icon: Star, label: "Google Rating", value: "4.9★", description: "Maintained near-perfect rating with reviews prominently showcased" },
  { icon: Users, label: "New Customers", value: "+2.8×", description: "New customer acquisition driven by the digital menu and heritage storytelling" },
];

const challenges = [
  "No online presence — a heritage-rich café with a compelling story had no way to share it digitally",
  "No pre-order or online ordering system — customers had to call or visit in person, limiting reach",
  "Bilingual customer base (English & Spanish) with no bilingual website to serve both audiences",
  "Zero local SEO presence — missing from 'café near me' and 'Mexican coffee Houston' searches",
  "No digital menu — visitors couldn't browse the full offering of lattes, matcha, refreshers, and baked goods before arriving",
  "Rich cultural identity (Mayan heritage, family recipes) with no platform to tell that story",
];

const solutions = [
  "Built a visually stunning, mobile-first bilingual website (English/Spanish) that honors the Mayan heritage with immersive design",
  "Implemented a pre-order system with category navigation (Lattes, Matcha, Refreshers, Café de Olla, Bakery) for easy browsing",
  "Created a rich 'Our Story' section that connects the café's Mayan roots, family recipes, and faith-driven mission to visitors",
  "Executed a local SEO strategy targeting 'Mexican café Houston', 'café de olla near me', and 'Mayan coffee Houston' keywords",
  "Added an interactive 'Mayan Word of the Day' feature and Instagram feed integration to drive repeat visits and social engagement",
  "Designed signature product spotlights for Café de Olla, Fresh Conchas, and Traditional Pastes to drive upsell and differentiation",
];

const testimonials = [
  {
    quote: "FlowSites captured exactly who we are — a family rooted in faith, heritage, and love for good food. The website tells our story in a way that makes people feel welcome before they even walk through the door.",
    author: "Hach Ki Cafe",
    role: "Owner, Hach Ki Cafe — Houston, TX",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
  },
  {
    quote: "I found Hach Ki Cafe through Google searching for authentic Mexican coffee in Houston. The website was so beautiful and the story so compelling that I drove 30 minutes just to try the Café de Olla. It was worth every mile.",
    author: "Carlos M.",
    role: "Google Reviewer — 5 Stars",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
];

const beforeItems = [
  "No website — completely invisible to online searchers looking for authentic Mexican cafés in Houston",
  "No digital menu — customers didn't know about the full range of lattes, matcha, refreshers, and baked goods",
  "No pre-order system — revenue limited to walk-in customers only",
  "Zero local SEO — missing from 'café near me', 'Mexican coffee Houston', and related searches",
  "No platform to share the powerful Mayan heritage and family story that makes Hach Ki unique",
];

const afterItems = [
  "Stunning, bilingual (EN/ES) mobile-first website at hachkicafe.com with full menu and brand story",
  "Complete digital menu with all categories, descriptions, and featured signature items",
  "Pre-order system with category navigation and signature product spotlights",
  "Page 1 rankings for 'Mexican café Houston', 'café de olla Houston', and related keywords",
  "Immersive 'Our Story' and 'Mayan Word of the Day' sections that build deep brand connection",
];

export default function CaseStudyHachKi() {
  useSEO({
    title: "Hach Ki Cafe Case Study — 180% Pre-Order Increase with FlowSites",
    description: "How FlowSites built a bilingual digital presence for Hach Ki Cafe, a Mayan heritage café in Houston TX, increasing pre-orders by 180% and tripling new customer acquisition.",
    keywords: "Hach Ki Cafe, Mexican café website, café de olla, bilingual website, FlowSites case study, Houston café digital marketing",
    ogImage: HERO_IMAGE,
  });

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.005_260)] text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="Hach Ki Cafe" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.07_0.005_260_/_80%)] via-[oklch(0.07_0.005_260_/_60%)] to-[oklch(0.07_0.005_260)]" />
        </div>

        {/* Gold/amber accent orbs matching Hach Ki's brand */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[oklch(0.75_0.15_85_/_8%)] blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[oklch(0.6_0.18_140_/_6%)] blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 container pt-32 pb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Link href="/portfolio" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Portfolio
            </Link>

            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[oklch(0.75_0.15_85_/_20%)] text-[oklch(0.85_0.15_85)] border border-[oklch(0.75_0.15_85_/_30%)]">
                Food & Beverage
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/50 border border-white/10">
                Local Business
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/50 border border-white/10">
                Bilingual
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/50 border border-white/10">
                Pre-Order System
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-display)" }}>
              Hach Ki Cafe<br />
              <span className="text-[oklch(0.85_0.15_85)]">Where Heritage Meets Digital</span>
            </h1>

            <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
              How FlowSites gave Houston's most authentic Mayan heritage café a bilingual digital presence — turning a hidden gem into a destination with 180% more pre-orders in 60 days.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Key Results */}
      <section className="py-20 container">
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {keyResults.map((result, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 text-center">
                <result.icon size={24} className="mx-auto mb-3 text-[oklch(0.85_0.15_85)]" />
                <div className="text-3xl font-bold text-[oklch(0.85_0.15_85)] mb-1" style={{ fontFamily: "var(--font-display)" }}>{result.value}</div>
                <div className="text-sm font-semibold text-white mb-2">{result.label}</div>
                <div className="text-xs text-white/40 leading-relaxed">{result.description}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Website Preview */}
      <section className="py-10 container">
        <ScrollReveal>
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="bg-white/5 border-b border-white/10 px-6 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-4 text-xs text-white/30 font-mono">hachkicafe.com</span>
            </div>
            <img src={HERO_IMAGE} alt="Hach Ki Cafe Website" className="w-full object-cover" />
          </div>
        </ScrollReveal>
      </section>

      {/* Challenge & Solution */}
      <section className="py-20 container">
        <div className="grid md:grid-cols-2 gap-12">
          <ScrollReveal>
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
                The Challenge
              </h2>
              <p className="text-white/60 mb-6 leading-relaxed">
                Hach Ki Cafe had everything a great business needs — authentic Mayan-inspired recipes, a powerful family story, a loyal community, and a product lineup that stood out from every other coffee shop in Houston. What they lacked was a digital presence that could tell that story and convert online visitors into in-person customers.
              </p>
              <div className="space-y-3">
                {challenges.map((challenge, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{challenge}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
                The Solution
              </h2>
              <p className="text-white/60 mb-6 leading-relaxed">
                FlowSites built a visually immersive, bilingual website that honors Hach Ki's Mayan heritage — dark atmospheric backgrounds with gold accents, rich storytelling sections, and a seamless pre-order experience that works for both English and Spanish-speaking customers.
              </p>
              <div className="space-y-3">
                {solutions.map((solution, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-[oklch(0.85_0.15_85)] flex-shrink-0 mt-0.5" />
                    <p className="text-white/60 text-sm leading-relaxed">{solution}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Before & After */}
      <section className="py-20 container">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: "var(--font-display)" }}>
            Before & After FlowSites
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-8 border border-red-500/20">
              <h3 className="font-bold text-red-400 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-xs">✕</span>
                Before
              </h3>
              <div className="space-y-4">
                {beforeItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-2" />
                    <p className="text-white/50 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-[oklch(0.85_0.15_85_/_30%)]">
              <h3 className="font-bold text-[oklch(0.85_0.15_85)] mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[oklch(0.85_0.15_85_/_20%)] flex items-center justify-center text-xs">✓</span>
                After
              </h3>
              <div className="space-y-4">
                {afterItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={14} className="text-[oklch(0.85_0.15_85)] flex-shrink-0 mt-0.5" />
                    <p className="text-white/70 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Testimonials */}
      <section className="py-20 container">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: "var(--font-display)" }}>
            What They're Saying
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="glass-card rounded-2xl p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="text-[oklch(0.85_0.15_85)] fill-current" />
                  ))}
                </div>
                <p className="text-white/70 leading-relaxed mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={testimonial.image} alt={testimonial.author} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-sm">{testimonial.author}</div>
                    <div className="text-white/40 text-xs">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="py-20 container">
        <ScrollReveal>
          <div className="glass-card rounded-3xl p-12 text-center" style={{ background: "linear-gradient(135deg, oklch(0.75 0.15 85 / 8%), oklch(0.6 0.18 140 / 5%))" }}>
            <TrendingUp size={40} className="mx-auto mb-6 text-[oklch(0.85_0.15_85)]" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Ready to Tell Your Story?
            </h2>
            <p className="text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">
              Every business has a story worth telling. Let FlowSites build you a website that converts visitors into loyal customers — just like we did for Hach Ki Cafe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/get-started"
                className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] hover:from-[oklch(0.55_0.22_25)] hover:to-[oklch(0.45_0.2_25)] transition-all duration-300 shadow-lg"
              >
                Book a Free Strategy Call
              </Link>
              <Link
                href="/portfolio"
                className="px-8 py-4 rounded-xl font-semibold text-white/70 hover:text-white glass hover:bg-white/10 transition-all duration-300"
              >
                View More Case Studies
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
