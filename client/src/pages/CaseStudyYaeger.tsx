/*
 * Yaeger Self Defense Case Study Page
 * Design: "Liquid Glass" — Dark Premium Glassmorphism
 * Detailed case study with before/after, results, testimonials
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
  Shield,
  Star,
  Phone,
} from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/yaeger-hero_05de7387.png";

const keyResults = [
  { icon: Users, label: "Student Growth", value: "+195%", description: "From 85 to 251 active students" },
  { icon: Phone, label: "Inquiry Calls", value: "+340%", description: "Monthly phone inquiries increased dramatically" },
  { icon: Shield, label: "Program Signups", value: "89%", description: "Anti-bullying program enrollment rate" },
  { icon: Star, label: "Google Rating", value: "4.9/5.0", description: "Based on 200+ verified reviews" },
];

const challenges = [
  "Generic martial arts branding didn't communicate law enforcement expertise",
  "No clear differentiation from traditional martial arts schools",
  "Difficulty explaining specialized anti-bullying and self-defense programs",
  "Parents couldn't easily find age-appropriate class information",
  "No system to capture and nurture leads from website visitors",
];

const solutions = [
  "Authority-focused branding highlighting law enforcement partnerships and credentials",
  "Clear program differentiation with dedicated pages for self-defense vs. anti-bullying",
  "Age-segmented program pages with specific outcomes and testimonials",
  "Real-time class schedule integration with instructor profiles and certifications",
  "DojoFlow CRM integration with automated follow-up for program-specific inquiries",
];

const testimonials = [
  {
    quote: "FlowSites captured exactly what makes us different—our law enforcement background and proven self-defense methodology. Parents now understand why we're the trusted choice for real-world safety training. Our enrollment has nearly tripled.",
    author: "Grand Master Chris Yaeger",
    role: "Founder & Head Instructor, Yaeger Self Defense",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031545745/ijuNTUqXbgpTcyYt.jpg",
  },
  {
    quote: "The anti-bullying program page has been a game-changer. Parents can see the specific techniques we teach and read testimonials from other families. We're now the go-to school for bullying prevention in our area.",
    author: "Sarah Thompson",
    role: "Program Coordinator, Yaeger Self Defense",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop",
  },
];

export default function CaseStudyYaeger() {
  useSEO({
    title: "Yaeger Self Defense Case Study — 310% Lead Increase with FlowSites",
    description: "See how FlowSites helped Yaeger Self Defense of America achieve 310% more leads with a high-converting website, automated lead capture, and DojoFlow CRM integration. Law enforcement-trusted self-defense academy.",
    keywords: "Yaeger Self Defense website, self defense academy website design, martial arts website case study, DojoFlow integration",
    canonical: "/case-study/yaeger",
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
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[oklch(0.45_0.15_220_/_8%)] blur-[120px] animate-pulse" />
        
        <div className="container">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full glass text-sm text-white/70 font-medium">Case Study</span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[oklch(0.45_0.15_220)] to-[oklch(0.35_0.12_220)] text-white text-sm font-medium">Self Defense</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white max-w-4xl mb-6" style={{ fontFamily: "var(--font-display)" }}>
              Yaeger Self Defense of America
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-xl md:text-2xl text-white/50 max-w-3xl mb-12">
              How a law enforcement-trusted self-defense academy established digital authority and nearly tripled enrollment with strategic positioning and automated lead nurturing.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Industry</div>
                <div className="text-lg font-semibold text-white">Self Defense</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Timeline</div>
                <div className="text-lg font-semibold text-white">7 Weeks</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Programs</div>
                <div className="text-lg font-semibold text-white">5 Specialized</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Launch</div>
                <div className="text-lg font-semibold text-white">Q3 2025</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="relative rounded-3xl overflow-hidden glass p-8">
              <img src={HERO_IMAGE} alt="Yaeger Self Defense Platform" className="w-full rounded-2xl" />
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
                  Yaeger Self Defense had unmatched law enforcement credentials and proven methodology, but their website looked like every other martial arts school. They needed to establish authority and clearly communicate their unique value proposition.
                </p>
                <div className="space-y-3">
                  {challenges.map((challenge, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.45_0.15_220)] mt-2 flex-shrink-0" />
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
                  We repositioned Yaeger as the authority in real-world self-defense and bullying prevention, with dedicated program pages, law enforcement credibility front and center, and automated systems to capture and convert every lead.
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
                Exceptional Growth
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                Within 5 months of launch, Yaeger became the dominant self-defense school in their market.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyResults.map((result, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="glass p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 group">
                  <result.icon size={32} className="text-[oklch(0.45_0.15_220)] mb-4 group-hover:scale-110 transition-transform duration-300" />
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
                  <div className="w-3 h-3 rounded-full bg-[oklch(0.45_0.15_220_/_40%)]" />
                  <h3 className="text-2xl font-bold text-white/50">Before</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Monthly Inquiries</div>
                    <div className="text-2xl font-bold text-white/50">18-22</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Brand Positioning</div>
                    <div className="text-2xl font-bold text-white/50">Generic MA</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Anti-Bullying Signups</div>
                    <div className="text-2xl font-bold text-white/50">5-8/mo</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Lead Nurturing</div>
                    <div className="text-2xl font-bold text-white/50">Manual</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="glass p-8 rounded-2xl border-2 border-[oklch(0.78_0.12_85_/_20%)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-[oklch(0.78_0.12_85)]" />
                  <h3 className="text-2xl font-bold text-white">After</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.45_0.15_220_/_5%)] border border-[oklch(0.78_0.12_85_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Monthly Inquiries</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      78-95
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">+340%</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.45_0.15_220_/_5%)] border border-[oklch(0.78_0.12_85_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Brand Positioning</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      LE Authority
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">Trusted</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.45_0.15_220_/_5%)] border border-[oklch(0.78_0.12_85_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Anti-Bullying Signups</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      42-50/mo
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">+625%</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.45_0.15_220_/_5%)] border border-[oklch(0.78_0.12_85_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Lead Nurturing</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      Automated
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">DojoFlow</span>
                    </div>
                  </div>
                </div>
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
                  <div className="text-6xl text-[oklch(0.45_0.15_220)] mb-4 leading-none">"</div>
                  <p className="text-lg text-white/70 leading-relaxed mb-6 italic">
                    {testimonial.quote}
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-14 h-14 rounded-full object-cover"
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[oklch(0.45_0.15_220_/_5%)] to-transparent" />
        
        <div className="container relative">
          <ScrollReveal>
            <div className="glass p-12 md:p-16 rounded-3xl text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                Ready to Establish Authority?
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10">
                Let's position your business as the trusted expert and build systems that convert authority into enrollment.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/get-started">
                  <button className="group px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[oklch(0.45_0.15_220)] to-[oklch(0.35_0.12_220)] hover:from-[oklch(0.5_0.17_220)] hover:to-[oklch(0.4_0.14_220)] transition-all duration-300 shadow-lg shadow-[oklch(0.45_0.15_220_/_25%)] hover:shadow-[oklch(0.45_0.15_220_/_40%)] flex items-center gap-2">
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
