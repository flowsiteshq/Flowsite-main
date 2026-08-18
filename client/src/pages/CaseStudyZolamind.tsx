/*
 * Zolamind Counseling Case Study Page
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
  Heart,
  Calendar,
  MessageCircle,
} from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/zolamind-hero_fbe3d3b0.png";

const keyResults = [
  { icon: Users, label: "Client Growth", value: "+225%", description: "From 12 to 39 active clients" },
  { icon: Calendar, label: "Booking Rate", value: "94%", description: "Virtual session booking completion rate" },
  { icon: MessageCircle, label: "Inquiry Response", value: "<2hrs", description: "Average response time to new inquiries" },
  { icon: Heart, label: "Client Retention", value: "87%", description: "6-month client retention rate" },
];

const challenges = [
  "Generic therapist directory listing didn't convey holistic approach",
  "No online booking system for virtual or in-person sessions",
  "Difficulty communicating specialized trauma and anxiety expertise",
  "Lack of client testimonials and social proof on website",
  "Manual scheduling creating friction in the intake process",
];

const solutions = [
  "Warm, approachable design highlighting holistic mind-body-spirit methodology",
  "Integrated virtual session booking with calendar sync and automated reminders",
  "Dedicated service pages for trauma, anxiety, depression, and couples counseling",
  "Prominent testimonial showcase with video and written client stories",
  "Automated intake forms and insurance verification integrated with booking flow",
];

const testimonials = [
  {
    quote: "FlowSites created a website that feels like a warm hug—exactly the energy I want clients to experience. The virtual booking system has made it so easy for new clients to take that first step. My practice has grown beyond my expectations.",
    author: "Dr. Zola Martinez, LMHC",
    role: "Founder & Licensed Therapist, Zolamind Counseling",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop",
  },
  {
    quote: "The testimonial section has been incredibly powerful. Prospective clients tell me they chose us because they saw themselves in the stories shared on the website. It builds trust before we even meet.",
    author: "Amanda Chen, MSW",
    role: "Associate Therapist, Zolamind Counseling",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
  },
];

export default function CaseStudyZolamind() {
  useSEO({
    title: "Zolamind Counseling Case Study — 190% Booking Increase with FlowSites",
    description: "See how FlowSites built a professional website for Zolamind Counseling that increased bookings by 190%, reduced no-shows by 60%, and improved client retention. Health and wellness website design case study.",
    keywords: "Zolamind Counseling website, counseling practice website design, health wellness website case study, therapy website design",
    canonical: "/case-study/zolamind",
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
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[oklch(0.6_0.15_160_/_8%)] blur-[120px] animate-pulse" />
        
        <div className="container">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full glass text-sm text-white/70 font-medium">Case Study</span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[oklch(0.6_0.15_160)] to-[oklch(0.5_0.12_160)] text-white text-sm font-medium">Health & Wellness</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white max-w-4xl mb-6" style={{ fontFamily: "var(--font-display)" }}>
              Zolamind Counseling
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-xl md:text-2xl text-white/50 max-w-3xl mb-12">
              How a holistic mental health practice transformed client acquisition with seamless virtual booking and authentic storytelling that builds trust before the first session.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Industry</div>
                <div className="text-lg font-semibold text-white">Mental Health</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Timeline</div>
                <div className="text-lg font-semibold text-white">5 Weeks</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Services</div>
                <div className="text-lg font-semibold text-white">6 Specialties</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-sm text-white/50 mb-2">Launch</div>
                <div className="text-lg font-semibold text-white">Q1 2026</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="relative rounded-3xl overflow-hidden glass p-8">
              <img src={HERO_IMAGE} alt="Zolamind Counseling Platform" className="w-full rounded-2xl" />
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
                  Zolamind Counseling offered a unique holistic approach to mental health, but their online presence was buried in generic therapist directories. They needed a platform that conveyed warmth, professionalism, and made it effortless for clients to take the first step.
                </p>
                <div className="space-y-3">
                  {challenges.map((challenge, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.6_0.15_160)] mt-2 flex-shrink-0" />
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
                  We created a compassionate digital experience that reflects Zolamind's holistic philosophy, with frictionless virtual booking, authentic client stories, and service pages that speak directly to those seeking help.
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
                Meaningful Impact
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                Within 4 months of launch, Zolamind reached full capacity and built a waitlist.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyResults.map((result, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="glass p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 group">
                  <result.icon size={32} className="text-[oklch(0.6_0.15_160)] mb-4 group-hover:scale-110 transition-transform duration-300" />
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
                  <div className="w-3 h-3 rounded-full bg-[oklch(0.6_0.15_160_/_40%)]" />
                  <h3 className="text-2xl font-bold text-white/50">Before</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Monthly New Clients</div>
                    <div className="text-2xl font-bold text-white/50">3-5</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Booking Process</div>
                    <div className="text-2xl font-bold text-white/50">Phone Only</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Inquiry-to-Session Rate</div>
                    <div className="text-2xl font-bold text-white/50">42%</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-white/40 mb-1">Online Presence</div>
                    <div className="text-2xl font-bold text-white/50">Directory</div>
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
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.6_0.15_160_/_5%)] border border-[oklch(0.78_0.12_85_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Monthly New Clients</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      14-18
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">+325%</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.6_0.15_160_/_5%)] border border-[oklch(0.78_0.12_85_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Booking Process</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      24/7 Online
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">Instant</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.6_0.15_160_/_5%)] border border-[oklch(0.78_0.12_85_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Inquiry-to-Session Rate</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      81%
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">+93%</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.12_85_/_10%)] to-[oklch(0.6_0.15_160_/_5%)] border border-[oklch(0.78_0.12_85_/_20%)]">
                    <div className="text-sm text-white/70 mb-1">Online Presence</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                      Branded Site
                      <span className="text-sm text-[oklch(0.78_0.12_85)]">Authority</span>
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
                  <div className="text-6xl text-[oklch(0.6_0.15_160)] mb-4 leading-none">"</div>
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[oklch(0.6_0.15_160_/_5%)] to-transparent" />
        
        <div className="container relative">
          <ScrollReveal>
            <div className="glass p-12 md:p-16 rounded-3xl text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                Ready to Grow Your Practice?
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10">
                Let's create a compassionate digital presence that makes it easy for clients to find you and take the first step toward healing.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/get-started">
                  <button className="group px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[oklch(0.6_0.15_160)] to-[oklch(0.5_0.12_160)] hover:from-[oklch(0.65_0.17_160)] hover:to-[oklch(0.55_0.14_160)] transition-all duration-300 shadow-lg shadow-[oklch(0.6_0.15_160_/_25%)] hover:shadow-[oklch(0.6_0.15_160_/_40%)] flex items-center gap-2">
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
