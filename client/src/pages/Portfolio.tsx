import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";

const featuredProjects = [
  {
    name: "MyDojo Martial Arts",
    description:
      "A modern enrollment website for a martial arts school, with class schedules, trial sign-ups, and a clearer path from first visit to first class.",
    features: ["Trial enrollment", "Class schedules"],
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/mydojo-hero_ba21ac04.png",
    alt: "MyDojo Martial Arts website preview across desktop and mobile",
    href: "/case-study/mydojo",
    linkLabel: "View Case Study",
    lead: true,
  },
  {
    name: "DojoFlow",
    description:
      "A focused product experience for a dojo operations platform, showing the tools teams use for classes, members, billing, and follow-up.",
    features: ["Class operations", "Lead management"],
    image: "/dojoflow-platform-preview.webp",
    alt: "DojoFlow operations platform preview",
    href: "/case-study/dojoflow",
    linkLabel: "View Case Study",
    lead: false,
  },
  {
    name: "Zolamind Counseling",
    description:
      "A calm, professional counseling website that makes services easy to understand and gives prospective clients a direct path to booking.",
    features: ["Online booking", "Service discovery"],
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/zolamind-hero_fbe3d3b0.png",
    alt: "Zolamind Counseling website preview",
    href: "/case-study/zolamind",
    linkLabel: "View Case Study",
    lead: false,
  },
] as const;

export default function Portfolio() {
  useSEO({
    title: "Our Work | FlowSites",
    description:
      "Explore FlowSites websites and software for enrollment, booking, CRM, and automation.",
    canonical: "/portfolio",
  });

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="relative overflow-hidden bg-[#071b3a] py-20 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_45%,rgba(16,125,255,0.92),transparent_38%),linear-gradient(110deg,#07152e_0%,#0b2c61_54%,#0c79ed_100%)] opacity-95" />
        <div className="container relative">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
              Our Work
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
              Websites and software we&apos;ve built.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-50/85 sm:text-xl">
              Website design, booking, CRM, and automation for businesses that need their digital presence to do more.
            </p>
          </div>
        </div>
      </section>

      <main className="container py-10 sm:py-16">
        <div className="space-y-8">
          {featuredProjects.map((project, index) => (
            <div key={project.name}>
              <article
                className={
                  project.lead
                    ? "overflow-hidden rounded-[1.5rem] border border-blue-100 bg-[#eaf3ff] shadow-[0_18px_50px_rgba(7,45,100,0.10)]"
                    : "overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.07)]"
                }
              >
                <div
                  className={
                    project.lead
                      ? "grid items-center lg:grid-cols-[0.8fr_1.2fr]"
                      : "grid items-stretch md:grid-cols-2"
                  }
                >
                  <div className={project.lead ? "order-2 p-7 sm:p-10 lg:order-1" : "order-2 flex flex-col p-6 sm:p-8 md:order-1"}>
                    <span className="mb-5 block h-1 w-11 rounded-full bg-blue-600" aria-hidden="true" />
                    <h2 className="text-3xl font-black leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl">
                      {project.name}
                    </h2>
                    <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
                      {project.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {project.features.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={project.href}
                      className="group mt-8 inline-flex w-fit items-center gap-2 text-sm font-bold text-blue-700 transition-colors hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
                    >
                      {project.linkLabel}
                      <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <div className={project.lead ? "order-1 min-h-[18rem] overflow-hidden lg:order-2 lg:min-h-[28rem]" : "order-1 min-h-[15rem] overflow-hidden md:min-h-[20rem]"}>
                    <img
                      src={project.image}
                      alt={project.alt}
                      className="h-full w-full object-cover object-top"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>

        <section className="mt-20 rounded-[1.5rem] bg-[#071b3a] px-7 py-10 text-white shadow-[0_18px_50px_rgba(7,27,58,0.18)] sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">Your next project</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
              Let&apos;s build your website
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-blue-50/80">
              A modern, high-performing website for your business, practice, or organization.
            </p>
          </div>
          <Link
            href="/#packages"
            className="mt-8 inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#071b3a] lg:mt-0"
          >
            View Website Plans
            <ArrowRight size={17} />
          </Link>
        </section>

        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-5 text-slate-500">
          The published gallery currently includes projects with approved imagery and complete case-study destinations. Additional project cards remain unpublished until their screenshots are matched and approved.
        </p>
      </main>
    </div>
  );
}
