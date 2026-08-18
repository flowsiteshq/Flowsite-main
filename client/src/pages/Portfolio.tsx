import { useState } from "react";
import { Link } from "wouter";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const categories = ["All", "Martial Arts", "Health & Wellness", "Self Defense", "Insurance Tech", "AI SaaS", "Real Estate Tech", "Food & Beverage", "Construction Tech", "Sustainability", "E-Commerce", "Non-Profit", "Salon & Beauty"];

const caseStudyMap: Record<string, string> = {
  "MyDojo Martial Arts": "/case-study/mydojo",
  "Yaeger Self Defense of America": "/case-study/yaeger",
  "Zolamind Counseling": "/case-study/zolamind",
  "PolicyPilot": "/case-study/policypilot",
  "DojoFlow": "/case-study/dojoflow",
  "HomeUp Services": "/case-study/homeup",
  "BlueTide Financial": "/case-study/bluetide",
  "Don Bar Bakery": "/case-study/donbar",
  "GrapheneX by Construction X": "/case-study/graphenex",
  "Green Bahamas Life": "/case-study/greenbahamas",
  "Hach Ki Cafe": "/case-study/hachki",
};

const projects = [
  {
    name: "MyDojo Martial Arts",
    url: "mydojoma.com",
    category: "Martial Arts",
    description: "Multi-location martial arts academy with DojoFlow integration, automated enrollment funnels, and program-specific landing pages for all ages.",
    results: [{ label: "Lead Increase", value: "+240%" }, { label: "Conversion Rate", value: "8.3%" }, { label: "Enrollment Growth", value: "+180%" }],
    services: ["Website Design", "CRM Integration", "Funnel Design", "Automation"],
    mockup: "https://private-us-east-1.manuscdn.com/sessionFile/579xV04TUt9Agk1PR0jUAG/sandbox/07IPB0oapb2IycTekyhHOD-img-1_1770829641000_na1fn_bXlkb2pvbWEtbW9ja3Vw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNTc5eFYwNFRVdDlBZ2sxUFIwalVBRy9zYW5kYm94LzA3SVBCMG9hcGIySXljVGVreWhIT0QtaW1nLTFfMTc3MDgyOTY0MTAwMF9uYTFmbl9iWGxrYjJwdmJXRXRiVzlqYTNWdy5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=ZilKLQ7j~SLWXI4a~wqBHWALoW88NuxTkA~QfP34hSIOTCbo9eJKAj9M6DD60By1UTSUnTCN2JAs0ZJE1VMeM0q55hOJQ5JQhTWDMG6jR0xbvh5P7uq5dHW2CEQD7u5N-5EKx4dk~AciCD80vGK-AeAekoaz82wYb5yOTfqLR3njcAjrvAUYWaBT3SQu0Ud6xLYTz9b9LYMvGUOQzj8zOkC~aloxo0mYByNTSJgRFCtx1xC2ZuVh3zRIJw1w2iMtqHm3xQIVH3HUK9UWPE8cSjM2J8A1I2MKFJAMxhaS4jmOX75hJBA~wkZyeLEfn3rCXvEvQhNBAehgooNF~FBg0w__",
  },
  {
    name: "Yaeger Self Defense of America",
    url: "yaegerssda.com",
    category: "Self Defense",
    description: "Law enforcement-trusted self-defense academy with anti-bullying programs, real-time class schedules, and automated lead capture.",
    results: [{ label: "Lead Increase", value: "+310%" }, { label: "Conversion Rate", value: "9.1%" }, { label: "Cost Per Lead", value: "-45%" }],
    services: ["Website Design", "CRM Integration", "Automation Setup"],
    mockup: "https://private-us-east-1.manuscdn.com/sessionFile/579xV04TUt9Agk1PR0jUAG/sandbox/07IPB0oapb2IycTekyhHOD-img-2_1770829715000_na1fn_eWFlZ2Vyc3NkYS1tb2NrdXA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNTc5eFYwNFRVdDlBZ2sxUFIwalVBRy9zYW5kYm94LzA3SVBCMG9hcGIySXljVGVreWhIT0QtaW1nLTJfMTc3MDgyOTcxNTAwMF9uYTFmbl9lV0ZsWjJWeWMzTmtZUzF0YjJOcmRYQS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=sk3hhFjuAUl4oVKLVtFXxTlgCy7ZfzWUIJnEQ3DDa0pyfCCHnG43XlXbPc6jMD2onh6A09cEV6gxbwC~SEFmoWADeK~Zyl~z8-3WFOGhdGDSKKELecMg615wOsD-DMoAisHYsq-6vX1pJ-7gROuoF-QA3W5Ql2Ttx5BpjjVdq63gBFudtoy4jJIsl3U6tVX78SDeImAwPUh1hi85ZBol7ef0IMWqaenqrsD-EajDNRNyy~BrM~rcBgCtxoCZ3Mxl1ytn1YMW5gkZuvxvgJcIw06g9Zn~-eAEGVFgzYCsEqQwnKkY8~OR51FyAK9rwp7t8b7C5bKJBjaqd1Va6lWzIw__",
  },
  {
    name: "Zolamind Counseling",
    url: "zolamindcounseling.com",
    category: "Health & Wellness",
    description: "Licensed mental health counseling practice with holistic approach, virtual session booking, and client testimonial showcase.",
    results: [{ label: "Bookings Increase", value: "+190%" }, { label: "Organic Traffic", value: "+145%" }, { label: "Client Retention", value: "+32%" }],
    services: ["Website Design", "Booking Integration", "SEO Strategy"],
    mockup: "https://private-us-east-1.manuscdn.com/sessionFile/579xV04TUt9Agk1PR0jUAG/sandbox/07IPB0oapb2IycTekyhHOD-img-3_1770829645000_na1fn_em9sYW1pbmQtbW9ja3Vw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNTc5eFYwNFRVdDlBZ2sxUFIwalVBRy9zYW5kYm94LzA3SVBCMG9hcGIySXljVGVreWhIT0QtaW1nLTNfMTc3MDgyOTY0NTAwMF9uYTFmbl9lbTlzWVcxcGJtUXRiVzlqYTNWdy5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Jq7G75KFqqZk9cxbU67ydN0uTtu6a92enPbiw51pfsSzognFDs17FjYydO82WAhv3C6cpPf3fIl5U1HJXWnsABbLYfaF6FQY1mEdzjFqat0H6zDXjFIMYcBHDSA5J1nUaY964l~~PEmzxhu2XpS6Ndtbd457ZOxdX9yN1IKngZdrsvtEc1muVcOxN4orwvfW40STNP1DSF5UENftZfmsa76Wt3iftXlG4TBCfd0r-R1bnqnvEceLY~K3Nc04m12XL5Q9~kaxHKQo62yjjcwJH9KMTEVTJ2At2fUnYsuTPVQh9XLIwMj35cVpLlsBEteWXfAQmZUcQpIZHz6Q~IxOqQ__",
  },
  {
    name: "PolicyPilot",
    url: "policypilot.life",
    category: "Insurance Tech",
    description: "AI-powered insurance comparison platform that helps users find the best coverage in minutes. Built with a modern SaaS aesthetic and conversion-focused onboarding.",
    results: [{ label: "User Signups", value: "+420%" }, { label: "Conversion Rate", value: "12.4%" }, { label: "Bounce Rate", value: "-38%" }],
    services: ["SaaS Design", "Onboarding Funnel", "SEO", "CRM Integration"],
    mockup: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/policypilot-mockup-aezabRRzohgw49RmzESpqN.webp",
  },
  {
    name: "DojoFlow",
    url: "dojo-flow.ai",
    category: "AI SaaS",
    description: "The leading CRM platform built specifically for martial arts schools. We built their marketing site and lead capture system from the ground up.",
    results: [{ label: "Trial Signups", value: "+380%" }, { label: "Demo Requests", value: "+290%" }, { label: "Organic Traffic", value: "+210%" }],
    services: ["SaaS Marketing Site", "Lead Funnel", "SEO", "Automation"],
    mockup: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/dojoflow-hero-AdXSRFP2c2a4zAmpq8sKwr.webp",
  },
  {
    name: "HomeUp Services",
    url: "tryhomeupservices.com",
    category: "Real Estate Tech",
    description: "On-demand home services platform connecting homeowners with trusted local contractors. Built a trust-first platform with instant booking and real-time tracking.",
    results: [{ label: "Bookings", value: "+350%" }, { label: "Organic Traffic", value: "+230%" }, { label: "Repeat Customers", value: "+45%" }],
    services: ["Platform Design", "Booking System", "Local SEO", "CRM Integration"],
    mockup: "https://private-us-east-1.manuscdn.com/sessionFile/579xV04TUt9Agk1PR0jUAG/sandbox/tyTCaZV85XmARvQgIfxEhX-img-1_1770837348000_na1fn_aG9tZXVwLW1vY2t1cA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNTc5eFYwNFRVdDlBZ2sxUFIwalVBRy9zYW5kYm94L3R5VENhWlY4NVhtQVJ2UWdJZnhFaFgtaW1nLTFfMTc3MDgzNzM0ODAwMF9uYTFmbl9hRzl0WlhWd0xXMXZZMnQxY0EucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=rIuqB3bBiuYhu5eEHcn0Rmgmy-4oR1-25RWCglPj5ei0qlmx~mZhkRU~GhQcz4Fc53ezf9b2MOeGJC4rH919fAamcz8TjAaDaTlt-1icFvHjoKIs3oVP0BJRTMrRgFD6AziZ1CyjUwE4b4ztKwjUxiiWsjqzd0tfrqSH96f5K9tv8koBVlEY4RvMnybco6ba6lZlbPAuCYa1BabJAEhPuvSvx05dYW06QmY~2kPTT4UqARdM1sfjsqwVFWXgALLIIFNznIUOZwbN7iGcQydfGGcev~Mzn-KDma7zWRaZf2kAjx8piJoJi3IJPwheNJf-MVbn6WM5aneugfv3bS~idQ__",
  },
  {
    name: "BlueTide Financial",
    url: "bluetidefinancial.com",
    category: "Insurance Tech",
    description: "Licensed financial services firm offering life insurance, annuities, and retirement planning. Built a trust-first, education-led digital presence from scratch.",
    results: [{ label: "Consultation Requests", value: "+310%" }, { label: "Organic Traffic", value: "+185%" }, { label: "Lead Quality", value: "68%" }],
    services: ["Website Design", "SEO Strategy", "Consultation Funnel", "Content Architecture"],
    mockup: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/bluetide-mockup_cd2c111d.png",
  },
  {
    name: "Don Bar Bakery",
    url: "donbarbakery.com",
    category: "Food & Beverage",
    description: "Authentic Mexican panadería in Tomball, TX. Built a vibrant, mobile-first website with full digital menu, online ordering, and local SEO.",
    results: [{ label: "Online Orders", value: "+240%" }, { label: "Organic Traffic", value: "+195%" }, { label: "New Customers", value: "+3.1×" }],
    services: ["Website Design", "Digital Menu", "Local SEO", "Online Ordering"],
    mockup: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/donbar-mockup_bd0a99f3.png",
  },
  {
    name: "GrapheneX by Construction X",
    url: "graphenex.net",
    category: "Construction Tech",
    description: "Graphene-enhanced concrete and polymer solutions. Bold industrial-tech website showcasing the federally verified 30% PSI breakthrough and driving B2B leads.",
    results: [{ label: "B2B Leads", value: "+340%" }, { label: "Organic Traffic", value: "+280%" }, { label: "Market Reach", value: "Nationwide" }],
    services: ["Website Design", "B2B Lead Funnel", "Technical SEO", "Content Strategy"],
    mockup: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/graphenex-mockup_7c1844ae.png",
  },
  {
    name: "Green Bahamas Life",
    url: "greenbahamas.life",
    category: "Sustainability",
    description: "Sustainable graphene-enhanced concrete initiative for the Bahamas. Mission-driven platform attracting investors, government partners, and future homeowners.",
    results: [{ label: "Organic Traffic", value: "+340%" }, { label: "Investor Inquiries", value: "2.1×" }, { label: "Page Speed", value: "+85%" }],
    services: ["Brand Identity", "Investor Platform", "SEO", "CRM Integration"],
    mockup: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/greenbahamas-screenshot_484f7d66.png",
  },
  {
    name: "Aladdin Kebab Grill",
    url: "aladdinkebob.com",
    category: "Food & Beverage",
    description: "Authentic Pakistani and Middle Eastern kebabs, curries, and wraps in Tomball, TX. 5-star rated with 72+ Google reviews. Built a warm, photo-rich site with full menu, gallery, and contact integration.",
    results: [{ label: "Online Visibility", value: "+210%" }, { label: "Google Reviews", value: "5.0 ★" }, { label: "New Customers", value: "+2.4×" }],
    services: ["Website Design", "Menu Integration", "Local SEO", "Google Business"],
    mockup: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/donbar-mockup_bd0a99f3.png",
  },
  {
    name: "Stitched with Love",
    url: "stitchedshop.store",
    category: "E-Commerce",
    description: "Premium custom embroidery and printing for businesses, teams, and brands — 10K+ orders delivered, no minimums, nationwide shipping. Built a conversion-first e-commerce experience with instant price calculator.",
    results: [{ label: "Online Orders", value: "+310%" }, { label: "Avg Order Value", value: "+28%" }, { label: "Repeat Buyers", value: "+55%" }],
    services: ["E-Commerce Design", "Price Calculator", "Order System", "SEO"],
    mockup: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/bluetide-mockup_cd2c111d.png",
  },
  {
    name: "ASLS Foundation",
    url: "aslsfoundation.org",
    category: "Non-Profit",
    description: "Non-profit creating pathways to independence for adults with intellectual and developmental disabilities through ASPECTRUM Village, vocational training, and community integration. Built an accessible, donation-optimized platform.",
    results: [{ label: "Donation Conversions", value: "+180%" }, { label: "Organic Traffic", value: "+220%" }, { label: "Volunteer Signups", value: "+3×" }],
    services: ["Non-Profit Design", "Donation Portal", "Accessibility", "SEO"],
    mockup: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/policypilot-mockup-aezabRRzohgw49RmzESpqN.webp",
  },
  {
    name: "Stylist Factory",
    url: "stylistfactory.com",
    category: "Salon & Beauty",
    description: "Premium salon and beauty services platform with online booking, stylist profiles, service menus, and a monthly app subscription. Built for growth with automated client follow-ups and loyalty features.",
    results: [{ label: "Bookings Increase", value: "+260%" }, { label: "Client Retention", value: "+40%" }, { label: "App Subscribers", value: "Active" }],
    services: ["Salon Website", "Booking System", "App Integration", "CRM Setup"],
    mockup: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/greenbahamas-screenshot_484f7d66.png",
  },
];

export default function Portfolio() {
  useSEO({
    title: "Portfolio — Websites We've Built for Service Businesses | FlowSites",
    description: "Browse FlowSites' portfolio of high-converting websites for martial arts schools, self-defense academies, counseling practices, and service businesses.",
    canonical: "/portfolio",
  });

  const [activeFilter, setActiveFilter] = useState("All");
  const filteredProjects = activeFilter === "All"
    ? projects
    : projects.filter((p) => p.category === activeFilter);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[oklch(0.97_0.002_260)] border-b border-[oklch(0.90_0.004_260)]">
        <div className="container">
          <ScrollReveal>
            <div className="max-w-3xl">
              <span className="tag tag-red mb-4 inline-block">Our Work</span>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-[oklch(0.08_0.005_260)] leading-[1.1]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                The Work{" "}
                <span className="text-[oklch(0.52_0.22_25)]">Speaks for Itself</span>
              </h1>
              <p className="mt-6 text-lg text-[oklch(0.45_0.008_260)] leading-relaxed max-w-2xl">
                Real websites. Real results. Every project is built to convert visitors into customers — with CRM integration and automation from day one.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="py-16">
        <div className="container">
          {/* Category Filter */}
          <ScrollReveal>
            <div className="flex flex-wrap gap-2 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFilter === cat
                      ? "bg-[oklch(0.52_0.22_25)] text-white shadow-sm"
                      : "bg-[oklch(0.95_0.002_260)] text-[oklch(0.40_0.006_260)] hover:bg-[oklch(0.90_0.004_260)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project, i) => (
              <ScrollReveal key={project.name} delay={i * 0.04}>
                <div className="agency-card rounded-2xl overflow-hidden flex flex-col h-full group">
                  {/* Mockup */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[oklch(0.95_0.002_260)]">
                    <img
                      src={project.mockup}
                      alt={`${project.name} website mockup`}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-[oklch(0.30_0.006_260)] shadow-sm">
                        {project.category}
                      </span>
                    </div>
                    <a
                      href={`https://${project.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-[oklch(0.40_0.006_260)] hover:text-[oklch(0.52_0.22_25)] transition-colors shadow-sm"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-3">
                      <h3
                        className="text-lg font-bold text-[oklch(0.08_0.005_260)] mb-1"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {project.name}
                      </h3>
                      <p className="text-sm text-[oklch(0.52_0.22_25)] font-medium">{project.url}</p>
                    </div>

                    <p className="text-sm text-[oklch(0.40_0.006_260)] leading-relaxed mb-5 flex-1">
                      {project.description}
                    </p>

                    {/* Results */}
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      {project.results.map((r) => (
                        <div key={r.label} className="bg-[oklch(0.97_0.002_260)] rounded-xl p-2.5 text-center">
                          <div
                            className="text-base font-bold text-[oklch(0.52_0.22_25)]"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {r.value}
                          </div>
                          <div className="text-[10px] text-[oklch(0.55_0.006_260)] mt-0.5 leading-tight">{r.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Services */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {project.services.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium bg-[oklch(0.93_0.003_260)] text-[oklch(0.40_0.006_260)]">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Case Study Link */}
                    {caseStudyMap[project.name] && (
                      <Link
                        href={caseStudyMap[project.name]}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[oklch(0.52_0.22_25)] hover:text-[oklch(0.40_0.20_25)] transition-colors group/link"
                      >
                        View Case Study
                        <ArrowRight size={13} className="group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
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
                Ready to Be{" "}
                <span className="text-[oklch(0.65_0.22_25)]">Our Next Success Story?</span>
              </h2>
              <p className="mt-6 text-white/60 text-lg leading-relaxed">
                Schedule a free strategy call. We'll show you exactly how we can build a site that converts like these.
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
