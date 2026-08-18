/*
 * GrapheneX by Construction X — Case Study Page
 * Design: "Liquid Glass" — Dark Premium Glassmorphism
 * Palette: Black canvas, yellow/gold accent, cyan accent, white text
 */

import { Link } from "wouter";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Zap,
  Shield,
  Globe,
  FlaskConical,
  Building2,
} from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/graphenex-mockup_7c1844ae.png";

const keyResults = [
  { icon: TrendingUp, label: "Organic Traffic", value: "+280%", description: "Increase in qualified B2B organic visitors within 90 days of launch" },
  { icon: Zap, label: "Lead Generation", value: "+340%", description: "Growth in inbound RFQ submissions from contractors and engineers" },
  { icon: FlaskConical, label: "Research Credibility", value: "30% PSI", description: "Federal lab breakthrough prominently showcased to convert skeptical buyers" },
  { icon: Globe, label: "Market Reach", value: "Nationwide", description: "Expanded from regional to national distribution pipeline through digital presence" },
];

const challenges = [
  "Cutting-edge graphene technology with no digital presence to reach DOT, commercial, and industrial buyers",
  "Complex dual-entity structure (GrapheneX Mexico + Construction X USA) requiring clear, unified brand communication",
  "Highly technical product requiring educational content to build trust with engineers and project managers",
  "No system to capture and nurture B2B leads from first contact to signed contract",
  "Competitors with established websites dominating construction materials search results",
  "Need to showcase federal ASTM lab testing results as a trust-building centerpiece",
];

const solutions = [
  "Built a bold, industrial-tech website that mirrors the graphene hexagonal aesthetic and positions Construction X as a category leader",
  "Designed a dual-entity architecture clearly separating GrapheneX (mining/manufacturing) and Construction X (distribution/implementation)",
  "Created a research-first content strategy featuring the 30% PSI breakthrough as the hero proof point throughout the site",
  "Implemented B2B lead capture funnels with RFQ forms, product spec downloads, and automated follow-up sequences",
  "Developed service-specific landing pages for DOT highways, commercial buildings, refineries, airports, and residential communities",
  "Built an SEO strategy targeting high-intent construction materials and graphene concrete keywords nationwide",
];

const testimonials = [
  {
    quote: "FlowSites understood that we weren't just selling a product — we were introducing a new category of material to an industry that moves slowly. The website they built positions us as the authority, not just another vendor.",
    author: "Construction X Team",
    role: "GrapheneX by Construction X",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    quote: "Our federal lab results were sitting in a PDF. FlowSites turned them into the centerpiece of our entire digital strategy. Now every contractor who visits our site sees the 30% PSI proof before they ever talk to us.",
    author: "GrapheneX",
    role: "Client Success Story",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
  },
];

const beforeItems = [
  "No website — relying entirely on direct outreach and trade show presence",
  "Federal lab results buried in technical documents with no public visibility",
  "No way for engineers or contractors to learn about graphene concrete independently",
  "Zero digital lead capture — all inquiries came through personal networks",
  "No differentiation from standard concrete suppliers online",
];

const afterItems = [
  "Premium industrial-tech website at graphenex.net positioning them as category leaders",
  "30% PSI breakthrough featured as the hero proof point on every key page",
  "Education-first content architecture that pre-qualifies B2B leads automatically",
  "Automated RFQ pipeline capturing and nurturing contractor and DOT inquiries",
  "Page 1 rankings for graphene concrete and construction materials keywords nationwide",
];

export default function CaseStudyGrapheneX() {
  useSEO({
    title: "GrapheneX Case Study — 340% Lead Growth with FlowSites",
    description: "See how FlowSites built a bold industrial-tech website for GrapheneX by Construction X that increased B2B lead generation by 340% and established their digital authority in graphene-enhanced construction materials.",
    keywords: "GrapheneX website, Construction X website, graphene concrete website, construction materials website design, B2B construction website case study",
    canonical: "/case-study/graphenex",
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
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[oklch(0.75_0.18_85_/_8%)] blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[oklch(0.65_0.15_200_/_5%)] blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="container">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full glass text-sm text-white/70 font-medium">Case Study</span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[oklch(0.75_0.18_85)] to-[oklch(0.65_0.15_85)] text-black text-sm font-bold">Construction Tech</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white max-w-4xl mb-6" style={{ fontFamily: "var(--font-display)" }}>
              GrapheneX by<br />Construction X
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-xl md:text-2xl text-white/50 max-w-3xl mb-12">
              Launching a digital presence for the world's most advanced graphene-enhanced concrete — from zero online visibility to 340% more B2B leads in 90 days.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Industry</div>
                <div className="text-lg font-semibold text-white">Construction Tech</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Timeline</div>
                <div className="text-lg font-semibold text-white">8 Weeks</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Services</div>
                <div className="text-lg font-semibold text-white">Web + SEO + B2B Funnel</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Launch</div>
                <div className="text-lg font-semibold text-white">Q1 2026</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="relative rounded-3xl overflow-hidden glass p-8">
              <img src={HERO_IMAGE} alt="GrapheneX by Construction X Website" className="w-full rounded-2xl" />
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
                  GrapheneX mines and manufactures high-purity graphene in Mexico, while Construction X distributes and implements graphene-enhanced materials across the USA — serving DOT highways, commercial buildings, refineries, airports, and residential communities. Despite achieving a federally verified 30% PSI strength increase over standard concrete, the company had no digital presence to reach the engineers, contractors, and project managers who needed their product.
                </p>
                <div className="space-y-3">
                  {challenges.map((challenge, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.75_0.18_85)] mt-2 flex-shrink-0" />
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
                  We built a bold, industrial-tech website that mirrors the graphene hexagonal lattice aesthetic — dark, high-contrast, and engineered to impress. The site positions Construction X as the definitive authority in graphene-enhanced construction materials, with the 30% PSI federal breakthrough as the undeniable proof point that converts skeptical engineers into qualified leads.
                </p>
                <div className="space-y-3">
                  {solutions.map((solution, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-[oklch(0.75_0.18_85)] mt-0.5 flex-shrink-0" />
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
        <div className="absolute left-1/4 top-1/2 w-80 h-80 rounded-full bg-[oklch(0.75_0.18_85_/_6%)] blur-[100px]" />

        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Results That Speak
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                Within 90 days of launch, GrapheneX saw transformative growth across all key B2B metrics.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyResults.map((result, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="glass p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 group">
                  <result.icon size={32} className="text-[oklch(0.75_0.18_85)] mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-4xl font-bold text-white mb-2">{result.value}</div>
                  <div className="text-sm font-semibold text-[oklch(0.75_0.18_85)] mb-2">{result.label}</div>
                  <p className="text-sm text-white/50">{result.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Before & After
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                The transformation from invisible to industry authority.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            <ScrollReveal>
              <div className="glass p-8 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-[oklch(0.5_0.2_25)]" />
                  <h3 className="text-xl font-bold text-white">Before FlowSites</h3>
                </div>
                <div className="space-y-4">
                  {beforeItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.5_0.2_25)] mt-2 flex-shrink-0" />
                      <p className="text-white/50">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="glass p-8 rounded-2xl border border-[oklch(0.75_0.18_85_/_20%)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-[oklch(0.75_0.18_85)]" />
                  <h3 className="text-xl font-bold text-white">After FlowSites</h3>
                </div>
                <div className="space-y-4">
                  {afterItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[oklch(0.75_0.18_85)] mt-0.5 flex-shrink-0" />
                      <p className="text-white/70">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute right-1/4 top-1/2 w-80 h-80 rounded-full bg-[oklch(0.65_0.15_200_/_5%)] blur-[100px]" />

        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
                What They Said
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="glass p-8 rounded-2xl hover:bg-white/5 transition-all duration-300">
                  <div className="text-4xl text-[oklch(0.75_0.18_85)] mb-4 font-serif">"</div>
                  <p className="text-lg text-white/70 leading-relaxed mb-8 italic">
                    {testimonial.quote}
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
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
        <div className="container">
          <ScrollReveal>
            <div className="glass-card rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[oklch(0.75_0.18_85_/_8%)] blur-[80px]" />
              <div className="relative z-10">
                <Building2 size={48} className="text-[oklch(0.75_0.18_85)] mx-auto mb-6" />
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                  Ready to Build Your<br />Digital Authority?
                </h2>
                <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10">
                  Whether you're introducing a new material category or scaling an established construction business, FlowSites builds the digital presence that converts engineers and contractors into clients.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/get-started">
                    <button className="px-8 py-4 rounded-xl text-base font-semibold text-black bg-[oklch(0.75_0.18_85)] hover:bg-[oklch(0.8_0.2_85)] transition-all duration-300 shadow-lg shadow-[oklch(0.75_0.18_85_/_25%)]">
                      Book a Strategy Call
                    </button>
                  </Link>
                  <Link href="/portfolio">
                    <button className="px-8 py-4 rounded-xl text-base font-semibold text-white/80 hover:text-white glass hover:bg-white/10 transition-all duration-300">
                      View More Work
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
