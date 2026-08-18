import { Link } from "wouter";
import { ArrowLeft, ExternalLink, CheckCircle2, TrendingUp, Globe, Leaf } from "lucide-react";

const SCREENSHOT_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/greenbahamas-screenshot_484f7d66.png";

const results = [
  { metric: "+340%", label: "Organic Traffic Growth" },
  { metric: "2.1×", label: "Investor Inquiries" },
  { metric: "+85%", label: "Page Speed Score" },
  { metric: "#1", label: "Google: 'Sustainable Construction Bahamas'" },
];

const deliverables = [
  "Mission-driven brand identity & visual language",
  "Full-stack website with bilingual content support",
  "Investor & partner inquiry capture system",
  "Project showcase with interactive timeline",
  "SEO optimization for Bahamian & Caribbean markets",
  "Mobile-first, hurricane-resilient content architecture",
  "Integration with Construction X ecosystem",
  "Performance-optimized image & media delivery",
];

export default function CaseStudyGreenBahamas() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.07 0.005 260)" }}
    >
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={SCREENSHOT_URL}
            alt="Green Bahamas Life website"
            className="w-full h-full object-cover object-top opacity-35"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, oklch(0.07 0.005 260 / 40%), oklch(0.07 0.005 260 / 95%))",
            }}
          />
        </div>

        <div className="relative z-10 container pb-16 pt-32">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to Portfolio
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: "oklch(0.25 0.12 145 / 30%)",
                color: "oklch(0.75 0.18 145)",
                border: "1px solid oklch(0.45 0.15 145 / 30%)",
              }}
            >
              Sustainability & Construction
            </span>
            <span className="text-white/30 text-xs">greenbahamas.life</span>
          </div>

          <h1
            className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Green Bahamas Life
          </h1>
          <p className="text-white/50 text-lg max-w-2xl leading-relaxed">
            A mission-driven digital platform for Construction X's sustainable graphene-enhanced
            concrete initiative — bringing emission-free, hurricane-proof homes to the Bahamas
            through 3D printing technology.
          </p>

          <a
            href="https://greenbahamas.life"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 text-sm font-medium transition-colors"
            style={{ color: "oklch(0.72 0.18 145)" }}
          >
            Visit Live Site
            <ExternalLink size={13} />
          </a>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 border-y border-white/5" style={{ background: "oklch(0.09 0.006 260)" }}>
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {results.map((r) => (
              <div key={r.metric} className="text-center">
                <div
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    background:
                      "linear-gradient(to right, oklch(0.72 0.18 145), oklch(0.82 0.14 145))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {r.metric}
                </div>
                <div className="text-white/40 text-sm">{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-16">
            {/* Left: Story */}
            <div className="md:col-span-7 space-y-10">
              <div>
                <h2
                  className="text-2xl font-bold text-white mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  The Challenge
                </h2>
                <p className="text-white/50 leading-relaxed">
                  Construction X was pioneering a revolutionary approach to sustainable housing in the
                  Bahamas — graphene-enhanced concrete structures that are emission-free, hurricane-proof,
                  and built with 3D printing technology. But their digital presence didn't match the
                  ambition of the mission. They needed a platform that could attract investors, educate
                  the public, and position them as the definitive leader in sustainable Caribbean construction.
                </p>
              </div>

              <div>
                <h2
                  className="text-2xl font-bold text-white mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Our Approach
                </h2>
                <p className="text-white/50 leading-relaxed mb-4">
                  We built a mission-driven brand platform that leads with impact. The visual language
                  draws from the natural beauty of the Bahamas — deep ocean blues, lush greens, and
                  warm sunlight — while communicating the technical precision and innovation of graphene
                  construction technology.
                </p>
                <p className="text-white/50 leading-relaxed">
                  The site was architected to serve multiple audiences simultaneously: investors seeking
                  ROI data and project timelines, government partners evaluating sustainability credentials,
                  and future homeowners imagining their hurricane-proof dream home.
                </p>
              </div>

              {/* Website Screenshot */}
              <div className="rounded-2xl overflow-hidden border border-white/8">
                <div
                  className="flex items-center gap-2 px-4 py-3 border-b border-white/5"
                  style={{ background: "oklch(0.10 0.006 260)" }}
                >
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/15" />
                    <div className="w-3 h-3 rounded-full bg-white/15" />
                    <div className="w-3 h-3 rounded-full bg-white/15" />
                  </div>
                  <span className="text-white/30 text-xs ml-2">greenbahamas.life</span>
                </div>
                <img
                  src={SCREENSHOT_URL}
                  alt="Green Bahamas Life website screenshot"
                  className="w-full"
                />
              </div>

              <div>
                <h2
                  className="text-2xl font-bold text-white mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  The Result
                </h2>
                <p className="text-white/50 leading-relaxed">
                  Within 90 days of launch, Green Bahamas Life ranked #1 on Google for "sustainable
                  construction Bahamas" and "graphene concrete Caribbean." Investor inquiries more than
                  doubled, and the platform became the primary tool for Construction X's outreach to
                  Bahamian government agencies and international sustainability partners.
                </p>
              </div>
            </div>

            {/* Right: Details */}
            <div className="md:col-span-5 space-y-8">
              {/* Client Info */}
              <div
                className="rounded-2xl p-6 border border-white/8"
                style={{ background: "oklch(0.09 0.006 260)" }}
              >
                <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                  Project Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/40">Client</span>
                    <span className="text-white/70">Construction X</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Industry</span>
                    <span className="text-white/70">Sustainable Construction</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Location</span>
                    <span className="text-white/70">Nassau, Bahamas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Package</span>
                    <span className="text-white/70">Conversion Site</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Timeline</span>
                    <span className="text-white/70">4 weeks</span>
                  </div>
                </div>
              </div>

              {/* Deliverables */}
              <div
                className="rounded-2xl p-6 border border-white/8"
                style={{ background: "oklch(0.09 0.006 260)" }}
              >
                <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                  What We Delivered
                </h3>
                <ul className="space-y-2.5">
                  {deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/50">
                      <CheckCircle2
                        size={14}
                        className="shrink-0 mt-0.5"
                        style={{ color: "oklch(0.65 0.18 145)" }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Testimonial */}
              <div
                className="rounded-2xl p-6 border"
                style={{
                  background: "oklch(0.10 0.008 145 / 20%)",
                  borderColor: "oklch(0.45 0.15 145 / 20%)",
                }}
              >
                <Leaf size={20} className="mb-3" style={{ color: "oklch(0.65 0.18 145)" }} />
                <p className="text-white/60 text-sm leading-relaxed italic mb-4">
                  "FlowSites understood our mission immediately. They built a platform that doesn't
                  just look great — it actively works to bring investors and partners to our door.
                  The results have exceeded every expectation."
                </p>
                <div>
                  <p className="text-white/70 text-sm font-medium">Construction X Team</p>
                  <p className="text-white/35 text-xs">Green Bahamas Life Initiative</p>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/get-started"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-sm font-semibold text-white transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.24 25), oklch(0.43 0.20 25))",
                  boxShadow: "0 4px 24px oklch(0.52 0.22 25 / 25%)",
                }}
              >
                <TrendingUp size={15} />
                Schedule a Call for Your Project
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
