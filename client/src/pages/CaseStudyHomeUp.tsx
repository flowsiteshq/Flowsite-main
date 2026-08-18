/*
 * HomeUp Services Case Study Page
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
  Clock,
  Target,
  Zap,
} from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/homeup-hero_840ee68f.png";

const keyResults = [
  { icon: Users, label: "User Signups", value: "+420%", description: "Increased from 2.4K to 12.5K monthly signups" },
  { icon: CheckCircle2, label: "Approval Rate", value: "92%", description: "Industry-leading approval success rate" },
  { icon: Clock, label: "Time to Approval", value: "<24hrs", description: "Down from 5-7 business days" },
  { icon: TrendingUp, label: "Conversion Rate", value: "34%", description: "From visitor to qualified application" },
];

const challenges = [
  "Complex multi-step approval process confusing users",
  "High abandonment rate on traditional credit-check forms",
  "Lack of transparency in approval timeline and requirements",
  "No mobile-optimized experience for on-the-go renters",
  "Difficulty communicating alternative approval pathways",
];

const solutions = [
  "Streamlined single-page application with progress indicators",
  "Alternative approval pathways prominently featured upfront",
  "Real-time status updates and transparent timeline communication",
  "Mobile-first responsive design with app-like experience",
  "Clear visual hierarchy guiding users to best approval option",
];

const testimonials = [
  {
    quote: "FlowSites completely transformed our digital presence. The new platform is intuitive, fast, and our approval rates have skyrocketed. We're now processing more applications in a day than we used to in a week.",
    author: "Marcus Chen",
    role: "Co-Founder & CEO, HomeUp Services",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    quote: "The mobile experience is phenomenal. Our users can now complete the entire application process from their phones in under 5 minutes. The conversion rate speaks for itself.",
    author: "Sarah Mitchell",
    role: "Head of Product, HomeUp Services",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
];

export default function CaseStudyHomeUp() {
  useSEO({
    title: "HomeUp Services Case Study — 420% User Signup Increase with FlowSites",
    description: "See how FlowSites built a high-converting platform for HomeUp Services that increased user signups by 420% with a streamlined onboarding experience and instant approval pathways.",
    keywords: "HomeUp Services website, real estate platform website design, service business website case study, platform development",
    canonical: "/case-study/homeup",
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
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[oklch(0.45_0.15_220)] to-[oklch(0.35_0.12_220)] text-white text-sm font-medium">Real Estate Tech</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white max-w-4xl mb-6" style={{ fontFamily: "var(--font-display)" }}>
              HomeUp Services
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-xl md:text-2xl text-white/50 max-w-3xl mb-12">
              Revolutionizing rental and home ownership access with a platform that removes traditional barriers and provides flexible approval pathways.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Industry</div>
                <div className="text-lg font-semibold text-white">Real Estate</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Timeline</div>
                <div className="text-lg font-semibold text-white">8 Weeks</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Services</div>
                <div className="text-lg font-semibold text-white">Full Platform</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Launch</div>
                <div className="text-lg font-semibold text-white">Q4 2025</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="relative rounded-3xl overflow-hidden glass p-8">
              <img src={HERO_IMAGE} alt="HomeUp Services Platform" className="w-full rounded-2xl" />
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
                  HomeUp Services needed to disrupt the traditional rental and home-buying market by creating a platform that removes credit barriers and provides alternative approval pathways. The existing process was slow, opaque, and excluded qualified renters and buyers.
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
                  We designed and built a modern, mobile-first platform that puts transparency and user experience first. The new system guides users through flexible approval options and provides real-time status updates.
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
                Within 90 days of launch, HomeUp Services saw transformative growth across all key metrics.
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
                    <div className="text-sm text-white/40 mb-1">Application Completion Rate</div>
                    <div className="text-2xl font-bold text-white/50">23%</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Average Processing Time</div>
                    <div className="text-2xl font-bold text-white/50">5-7 days</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Mobile Conversion</div>
                    <div className="text-2xl font-bold text-white/50">12%</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">User Satisfaction</div>
                    <div className="text-2xl font-bold text-white/50">3.2/5.0</div>
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
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.5_0.2_25_/_5%)] border border-[oklch(0.78_0.12_85_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Application Completion Rate</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      87%
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">+278%</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.5_0.2_25_/_5%)] border border-[oklch(0.78_0.12_85_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Average Processing Time</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      &lt;24hrs
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">-85%</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.5_0.2_25_/_5%)] border border-[oklch(0.78_0.12_85_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Mobile Conversion</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      41%
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">+242%</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.5_0.2_25_/_5%)] border border-[oklch(0.78_0.12_85_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">User Satisfaction</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      4.8/5.0
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">+50%</span>
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
                  <div className="text-6xl text-[oklch(0.5_0.2_25)] mb-4 leading-none">"</div>
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[oklch(0.5_0.2_25_/_5%)] to-transparent" />
        
        <div className="container relative">
          <ScrollReveal>
            <div className="glass p-12 md:p-16 rounded-3xl text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                Ready to Transform Your Business?
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10">
                Let's build a high-converting platform that drives real results for your business.
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
