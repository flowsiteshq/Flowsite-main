/*
 * MyDojo Martial Arts Case Study Page
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
  Target,
  Zap,
  Calendar,
} from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/mydojo-hero_ba21ac04.png";

const keyResults = [
  { icon: Users, label: "Student Enrollment", value: "+285%", description: "Increased from 180 to 693 active students" },
  { icon: Target, label: "Lead Conversion", value: "42%", description: "From website visitor to trial class signup" },
  { icon: Calendar, label: "Trial-to-Member", value: "68%", description: "Industry-leading trial class conversion rate" },
  { icon: TrendingUp, label: "Revenue Growth", value: "+310%", description: "Monthly recurring revenue increase" },
];

const challenges = [
  "Outdated website not mobile-friendly, losing mobile traffic",
  "Manual lead tracking in spreadsheets causing follow-up delays",
  "No automated enrollment funnel for different age groups",
  "Difficulty showcasing multiple locations and programs",
  "Lack of integration between website and CRM system",
];

const solutions = [
  "Modern mobile-first responsive design with program-specific landing pages",
  "Direct DojoFlow CRM integration with automated lead capture and routing",
  "Age-segmented enrollment funnels with tailored messaging for each program",
  "Multi-location support with location-specific class schedules and instructors",
  "Automated email and SMS follow-up sequences triggered by user actions",
];

const testimonials = [
  {
    quote: "FlowSites didn't just build us a website—they built us an enrollment machine. We've tripled our student base in 8 months, and the automated follow-ups mean we never lose a lead. Best investment we've ever made.",
    author: "Master Vincent Holmes",
    role: "Owner & Head Instructor, MyDojo Martial Arts",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/vincent-holmes_3d76c71a.jpg",
  },
  {
    quote: "The program-specific landing pages are genius. Parents can instantly find the right class for their child's age, and the trial class booking is seamless. Our conversion rate has never been higher.",
    author: "Jennifer Martinez",
    role: "Program Director, MyDojo Martial Arts",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
  },
];

export default function CaseStudyMyDojo() {
  useSEO({
    title: "MyDojo Martial Arts Case Study — 285% Student Enrollment Increase",
    description: "See how FlowSites built a high-converting website for MyDojo Martial Arts with DojoFlow CRM integration, automated enrollment funnels, and program-specific landing pages. Results: +285% enrollment, 42% lead conversion rate.",
    keywords: "MyDojo Martial Arts website case study, martial arts enrollment funnel, DojoFlow integration results, martial arts website design results",
    canonical: "/case-study/mydojo",
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
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] text-white text-sm font-medium">Martial Arts</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white max-w-4xl mb-6" style={{ fontFamily: "var(--font-display)" }}>
              MyDojo Martial Arts
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-xl md:text-2xl text-white/50 max-w-3xl mb-12">
              How a multi-location martial arts academy tripled student enrollment with automated funnels and seamless DojoFlow integration.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Industry</div>
                <div className="text-lg font-semibold text-white">Martial Arts</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Timeline</div>
                <div className="text-lg font-semibold text-white">6 Weeks</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Locations</div>
                <div className="text-lg font-semibold text-white">3 Studios</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Launch</div>
                <div className="text-lg font-semibold text-white">Q2 2025</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="relative rounded-3xl overflow-hidden glass p-8">
              <img src={HERO_IMAGE} alt="MyDojo Martial Arts Platform" className="w-full rounded-2xl" />
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
                  MyDojo Martial Arts had three thriving locations but their outdated website was holding them back. Manual lead tracking, no mobile optimization, and zero automation meant they were losing qualified students daily.
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
                  We built a modern, mobile-first platform with program-specific landing pages, full DojoFlow integration, and automated enrollment funnels that nurture leads from first visit to black belt.
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
                Transformative Results
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                Within 6 months of launch, MyDojo saw explosive growth across all key metrics.
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
                    <div className="text-sm text-white/40 mb-1">Monthly New Students</div>
                    <div className="text-2xl font-bold text-white/50">12-15</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Lead Response Time</div>
                    <div className="text-2xl font-bold text-white/50">24-48hrs</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Mobile Traffic Conversion</div>
                    <div className="text-2xl font-bold text-white/50">8%</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Lead Tracking Method</div>
                    <div className="text-2xl font-bold text-white/50">Spreadsheets</div>
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
                    <div className="text-sm text-white/70 mb-1">Monthly New Students</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      58-65
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">+385%</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.5_0.2_25_/_5%)] border border-[oklch(0.78_0.12_85_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Lead Response Time</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      Instant
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">Automated</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.5_0.2_25_/_5%)] border border-[oklch(0.78_0.12_85_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Mobile Traffic Conversion</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      39%
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">+388%</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.5_0.2_25_/_5%)] border border-[oklch(0.78_0.12_85_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Lead Tracking Method</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      DojoFlow CRM
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">Integrated</span>
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
                Ready to Grow Your Academy?
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10">
                Let's build an enrollment system that turns your website into your best salesperson.
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
