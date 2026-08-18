import { Link } from "wouter";
import ScrollReveal from "@/components/ScrollReveal";
import { useSEO } from "@/hooks/useSEO";
import { Palette, GitBranch, Plug, Cog, TrendingUp, ArrowRight, Check } from "lucide-react";

const services = [
  {
    icon: Palette,
    title: "Website Design",
    tagline: "Conversion-first design that builds trust",
    description:
      "We design premium, mobile-first websites engineered to convert visitors into leads. Every layout decision, color choice, and CTA placement is backed by conversion data and best practices for service businesses.",
    features: [
      "Custom design tailored to your brand",
      "Mobile-first responsive layouts",
      "Conversion-optimized page structures",
      "Fast-loading, SEO-friendly architecture",
      "Accessibility-compliant design",
      "Premium UI with modern aesthetics",
    ],
  },
  {
    icon: GitBranch,
    title: "Funnel Design",
    tagline: "Turn traffic into enrolled students",
    description:
      "We build multi-step enrollment funnels that guide prospects from awareness to action. Landing pages, trial offers, scheduling flows — each step is designed to reduce friction and increase conversions.",
    features: [
      "Multi-step enrollment funnels",
      "Trial class offer pages",
      "Scheduling & booking integration",
      "Social proof & urgency elements",
      "A/B testing frameworks",
      "Exit-intent capture systems",
    ],
  },
  {
    icon: Plug,
    title: "CRM Integration",
    tagline: "Seamless DojoFlow connection",
    description:
      "Your website plugs directly into DojoFlow CRM. Every form submission, every lead, every interaction is automatically captured and synced — giving you full visibility into your enrollment pipeline.",
    features: [
      "Native DojoFlow API integration",
      "Automatic lead capture & sync",
      "Pipeline stage automation",
      "Custom field mapping",
      "Real-time data synchronization",
      "Contact deduplication",
    ],
  },
  {
    icon: Cog,
    title: "Automation Setup",
    tagline: "Never lose a lead again",
    description:
      "We configure automated workflows that follow up with every lead instantly. Email sequences, SMS reminders, task assignments — all triggered automatically based on prospect behavior.",
    features: [
      "Automated email sequences",
      "SMS follow-up workflows",
      "Lead scoring & prioritization",
      "Task auto-assignment",
      "Behavior-triggered automations",
      "Appointment reminder systems",
    ],
  },
  {
    icon: TrendingUp,
    title: "Ongoing Optimization",
    tagline: "Continuous improvement, measurable results",
    description:
      "Launch is just the beginning. We monitor performance, analyze conversion data, and continuously optimize your site and funnels to maximize enrollment rates month after month.",
    features: [
      "Monthly performance reporting",
      "Conversion rate optimization",
      "Heatmap & session analysis",
      "Content & copy refinement",
      "Technical performance tuning",
      "Strategic growth consulting",
    ],
  },
];

export default function Services() {
  useSEO({
    title: "Web Design Services for Service Businesses | FlowSites",
    description:
      "Explore FlowSites' web design services: custom website design, DojoFlow CRM integration, automated lead capture, funnel-based design, and ongoing optimization.",
    canonical: "/services",
  });

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[oklch(0.97_0.002_260)] border-b border-[oklch(0.90_0.004_260)]">
        <div className="container">
          <ScrollReveal>
            <div className="max-w-3xl">
              <span className="tag tag-red mb-4 inline-block">Our Services</span>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-[oklch(0.08_0.005_260)] leading-[1.1]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Everything You Need to{" "}
                <span className="text-[oklch(0.52_0.22_25)]">Grow Online</span>
              </h1>
              <p className="mt-6 text-lg text-[oklch(0.45_0.008_260)] leading-relaxed max-w-2xl">
                From design to automation, we handle every piece of your digital growth system. Purpose-built for service businesses that want to scale.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/schedule">
                  <button className="btn-red">Schedule a Call <ArrowRight size={16} /></button>
                </Link>
                <Link href="/get-started">
                  <button className="btn-ghost">Get Started</button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Services List */}
      <section className="py-24">
        <div className="container">
          <div className="space-y-6">
            {services.map((service, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="agency-card rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-5">
                  {/* Left: Info */}
                  <div className="lg:col-span-3 p-8 md:p-10 lg:p-12">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-11 h-11 rounded-xl bg-[oklch(0.52_0.22_25_/_8%)] flex items-center justify-center">
                        <service.icon size={20} className="text-[oklch(0.52_0.22_25)]" />
                      </div>
                      <div>
                        <h2
                          className="text-xl font-bold text-[oklch(0.08_0.005_260)]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {service.title}
                        </h2>
                        <p className="text-sm text-[oklch(0.52_0.22_25)] font-medium">{service.tagline}</p>
                      </div>
                    </div>
                    <p className="text-[oklch(0.40_0.006_260)] leading-relaxed mb-6">{service.description}</p>
                    <Link
                      href="/schedule"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[oklch(0.52_0.22_25)] hover:text-[oklch(0.40_0.20_25)] transition-colors group"
                    >
                      Schedule a Call
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  {/* Right: Features */}
                  <div className="lg:col-span-2 p-8 md:p-10 lg:p-12 bg-[oklch(0.97_0.002_260)] border-t lg:border-t-0 lg:border-l border-[oklch(0.90_0.004_260)]">
                    <h4 className="text-xs font-semibold text-[oklch(0.55_0.008_260)] uppercase tracking-widest mb-5">
                      What's Included
                    </h4>
                    <ul className="space-y-3">
                      {service.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-[oklch(0.35_0.006_260)]">
                          <Check size={14} className="text-[oklch(0.52_0.22_25)] mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Banner */}
      <section className="py-20 bg-[oklch(0.97_0.002_260)] border-t border-[oklch(0.90_0.004_260)]">
        <div className="container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 mb-4">
                <Plug size={16} className="text-[oklch(0.52_0.22_25)]" />
                <span className="text-sm font-semibold text-[oklch(0.52_0.22_25)] uppercase tracking-widest">
                  Full Stack Integration
                </span>
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold text-[oklch(0.08_0.005_260)] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Your Website + DojoFlow ={" "}
                <span className="text-[oklch(0.52_0.22_25)]">Enrollment Machine</span>
              </h2>
              <p className="mt-4 text-[oklch(0.45_0.008_260)] leading-relaxed">
                Every form, every click, every lead — automatically captured, synced, and followed up. No manual data entry. No missed leads.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { step: "01", title: "Visitor Fills Form", desc: "A prospect submits your contact or trial form on your website." },
                { step: "02", title: "DojoFlow Syncs", desc: "The lead is instantly created in DojoFlow with all their details." },
                { step: "03", title: "Automation Fires", desc: "Email and SMS sequences launch automatically to nurture and close." },
              ].map((item) => (
                <div key={item.step} className="agency-card rounded-2xl p-7 text-center">
                  <div className="text-3xl font-bold text-[oklch(0.52_0.22_25_/_20%)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
                    {item.step}
                  </div>
                  <h3 className="font-bold text-[oklch(0.08_0.005_260)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-[oklch(0.45_0.008_260)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[oklch(0.10_0.005_260)]">
        <div className="container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Let's Build Your{" "}
                <span className="text-[oklch(0.65_0.22_25)]">Growth Engine</span>
              </h2>
              <p className="mt-6 text-white/60 text-lg leading-relaxed">
                Schedule a free strategy call. We'll audit your current setup and show you exactly how we can increase your enrollment.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link href="/schedule">
                  <button className="btn-red">Schedule a Call <ArrowRight size={16} /></button>
                </Link>
                <Link href="/get-started">
                  <button className="px-7 py-3.5 rounded-full font-semibold text-white/80 border border-white/20 hover:border-white/40 hover:text-white transition-all text-sm">
                    View Pricing
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
