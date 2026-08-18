/*
 * Don Bar Bakery Case Study Page
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

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/donbar-mockup_bd0a99f3.png";

const keyResults = [
  { icon: ShoppingBag, label: "Online Orders", value: "+240%", description: "Increase in online orders within 45 days of the new site launch" },
  { icon: Globe, label: "Organic Traffic", value: "+195%", description: "Growth in organic search visitors from local SEO optimization" },
  { icon: Star, label: "Google Rating", value: "5.0★", description: "Maintained perfect rating with 200+ reviews showcased on the site" },
  { icon: Users, label: "New Customers", value: "+3.1×", description: "New customer acquisition driven by the digital menu and online presence" },
];

const challenges = [
  "No online ordering system — customers had to visit in person or call, limiting reach beyond the immediate neighborhood",
  "Beautiful products with no digital showcase — the stunning pan dulce and food photography were invisible to online searchers",
  "No way to display the full menu digitally, causing missed opportunities from customers who didn't know the full offering",
  "Zero local SEO presence — competitors with basic websites were outranking Don Bar Bakery in Google searches",
  "No mechanism to collect and showcase the 200+ five-star reviews that loyal customers had left",
];

const solutions = [
  "Built a visually stunning, mobile-first website that showcases the full menu with professional food photography and pricing",
  "Implemented an online ordering flow with category navigation (Panadería, Breads, Breakfast, Lunch, Tacos) for easy browsing",
  "Created a Google Reviews integration section that prominently displays the 5.0-star rating and customer testimonials",
  "Executed a local SEO strategy targeting 'Mexican bakery Tomball TX', 'pan dulce near me', and 'conchas Tomball' keywords",
  "Added business hours, location map, and click-to-call functionality to convert mobile visitors into walk-in customers",
  "Designed a signature product spotlight for Conchas Rellenas to drive upsell and differentiate from competitors",
];

const testimonials = [
  {
    quote: "FlowSites transformed our business. Before, people only found us by driving past. Now we have customers coming from all over the Houston area because they found us online. The website is as beautiful as our pan dulce.",
    author: "Don Bar Bakery",
    role: "Owner, Don Bar & Bakery — Tomball, TX",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
  },
  {
    quote: "I found Don Bar Bakery through Google and drove 25 minutes to try their Conchas Rellenas. The website made it so easy — I could see the full menu, hours, and location before I left home. Best decision I ever made!",
    author: "Maria R.",
    role: "Google Reviewer — 5 Stars",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
];

const beforeItems = [
  "No website — completely invisible to online searchers in Tomball and surrounding areas",
  "No digital menu — customers didn't know about the full range of 30+ pan dulce varieties",
  "No online ordering — revenue limited to walk-in and phone customers only",
  "Zero Google Business optimization — missing from 'near me' searches",
  "No way to showcase 200+ five-star reviews to attract new customers",
];

const afterItems = [
  "Stunning, mobile-first website at donbarbakery.com with full menu and food photography",
  "Complete digital menu with 30+ items, descriptions, and pricing across all categories",
  "Online ordering system with category navigation and featured product spotlights",
  "Page 1 rankings for 'Mexican bakery Tomball', 'pan dulce Tomball TX', and related keywords",
  "Prominent 5.0-star Google Reviews section that builds instant trust with new visitors",
];

export default function CaseStudyDonBar() {
  useSEO({
    title: "Don Bar Bakery Case Study — 240% Online Order Increase with FlowSites",
    description: "How FlowSites built a stunning digital presence for Don Bar Bakery, increasing online orders by 240% and tripling new customer acquisition in Tomball, TX.",
    keywords: "Don Bar Bakery, Mexican bakery website, pan dulce online ordering, FlowSites case study, bakery digital marketing",
    ogImage: HERO_IMAGE,
  });

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.005_260)] text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="Don Bar Bakery Website" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.07_0.005_260_/_60%)] via-[oklch(0.07_0.005_260_/_40%)] to-[oklch(0.07_0.005_260)]" />
        </div>

        {/* Pink/magenta accent orbs matching Don Bar's brand */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[oklch(0.6_0.25_340_/_8%)] blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[oklch(0.5_0.2_25_/_6%)] blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 container pt-32 pb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Link href="/portfolio" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Portfolio
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[oklch(0.6_0.25_340_/_20%)] text-[oklch(0.8_0.2_340)] border border-[oklch(0.6_0.25_340_/_30%)]">
                Food & Bakery
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/50 border border-white/10">
                Local Business
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/50 border border-white/10">
                Online Ordering
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-display)" }}>
              Don Bar Bakery<br />
              <span className="text-[oklch(0.8_0.2_340)]">From Hidden Gem to Digital Destination</span>
            </h1>

            <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
              How FlowSites gave Tomball's most beloved Mexican panadería a digital presence as vibrant as their Conchas Rellenas — increasing online orders by 240% in 45 days.
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
                <result.icon size={24} className="mx-auto mb-3 text-[oklch(0.8_0.2_340)]" />
                <div className="text-3xl font-bold text-[oklch(0.8_0.2_340)] mb-1" style={{ fontFamily: "var(--font-display)" }}>{result.value}</div>
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
              <span className="ml-4 text-xs text-white/30 font-mono">donbarbakery.com</span>
            </div>
            <img src={HERO_IMAGE} alt="Don Bar Bakery Website" className="w-full object-cover" />
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
                Don Bar Bakery had everything a great business needs — authentic recipes, premium ingredients, a loyal community, and a perfect 5.0-star Google rating. What they lacked was a digital presence. Without a website, they were invisible to the thousands of Tomball-area residents searching for "Mexican bakery near me" every week.
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
                FlowSites built a visually stunning, mobile-first website that matches the warmth and vibrancy of Don Bar's brand — dark navy backgrounds with hot pink accents, rich food photography, and an intuitive menu layout that makes every item irresistible.
              </p>
              <div className="space-y-3">
                {solutions.map((solution, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-[oklch(0.8_0.2_340)] flex-shrink-0 mt-0.5" />
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
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400/60 flex-shrink-0 mt-2" />
                    <p className="text-white/50 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-8 border border-[oklch(0.6_0.25_340_/_30%)]">
              <h3 className="font-bold text-[oklch(0.8_0.2_340)] mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[oklch(0.6_0.25_340_/_20%)] flex items-center justify-center text-xs">✓</span>
                After FlowSites
              </h3>
              <div className="space-y-4">
                {afterItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={14} className="text-[oklch(0.8_0.2_340)] flex-shrink-0 mt-0.5" />
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
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} className="fill-[oklch(0.8_0.2_340)] text-[oklch(0.8_0.2_340)]" />
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
          <div className="glass-card rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Ready to Be the Next <span className="text-[oklch(0.5_0.2_25)]">Success Story?</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">
              Whether you're a local bakery, a service business, or a growing brand — FlowSites builds websites that work as hard as you do.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/get-started"
                className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] hover:from-[oklch(0.55_0.22_25)] hover:to-[oklch(0.45_0.2_25)] transition-all duration-300 shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)]"
              >
                Book a Strategy Call
              </Link>
              <Link
                href="/portfolio"
                className="px-8 py-4 rounded-xl font-semibold text-white/80 hover:text-white glass hover:bg-white/10 transition-all duration-300"
              >
                View More Work
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
