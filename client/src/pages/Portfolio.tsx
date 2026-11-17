import { ExternalLink, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";

type Project = {
  name: string;
  domain: string;
  description: string;
  image: string;
  caseStudy: string;
  imageAlt: string;
  fit?: "contain" | "cover";
  featured?: boolean;
};

const projects: Project[] = [
  {
    name: "MyDojo Martial Arts",
    domain: "mydojoma.com",
    description: "A bold, conversion-focused website for a martial arts academy with programs, schedules, and trial enrollment.",
    image: "/portfolio/mydojo-live.png",
    caseStudy: "/case-study/mydojo",
    imageAlt: "MyDojo Martial Arts website screenshot",
    featured: true,
  },
  {
    name: "DojoFlow",
    domain: "dojo-flow.ai",
    description: "A focused SaaS platform experience for managing martial arts studios, members, classes, and billing.",
    image: "/dojoflow-dashboard-landscape.webp",
    caseStudy: "/case-study/dojoflow",
    imageAlt: "DojoFlow dashboard showing attendance, members, and upcoming classes",
    fit: "contain",
  },
  {
    name: "Zolamind Counseling",
    domain: "zolamindcounseling.com",
    description: "A calm, welcoming website for a counseling practice with clear services and an approachable booking path.",
    image: "/portfolio/zolamind-live.png",
    caseStudy: "/case-study/zolamind",
    imageAlt: "Zolamind Counseling website screenshot",
  },
  {
    name: "Don Bar Bakery",
    domain: "donbarbakery.com",
    description: "A warm, photo-led bakery website that brings the menu, story, and ordering journey together.",
    image: "/portfolio/donbar-live.png",
    caseStudy: "/case-study/donbar",
    imageAlt: "Don Bar Bakery website screenshot",
  },
  {
    name: "Green Bahamas Life",
    domain: "greenbahamas.life",
    description: "A mission-driven digital presence for a sustainability initiative connecting community, investment, and impact.",
    image: "/portfolio/greenbahamas-live.png",
    caseStudy: "/case-study/greenbahamas",
    imageAlt: "Green Bahamas Life website screenshot",
  },
];

function BrowserFrame({ project }: { project: Project }) {
  return (
    <div className="overflow-hidden rounded-[1rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(7,27,58,0.10)]">
      <div className="flex h-10 items-center gap-2 border-b border-slate-200 bg-white px-4" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff6257]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <div className="ml-3 flex min-w-0 flex-1 items-center justify-center rounded-md bg-slate-50 px-3 py-1 text-[10px] font-medium text-slate-500">
          <span className="truncate">{project.domain}</span>
        </div>
      </div>
      <div className="flex aspect-[16/9] items-center justify-center overflow-hidden bg-[#eef3f8]">
        <img
          src={project.image}
          alt={project.imageAlt}
          className={`h-full w-full ${project.fit === "contain" ? "object-contain p-0" : "object-cover"}`}
          loading="lazy"
        />
      </div>
    </div>
  );
}

export default function Portfolio() {
  useSEO({
    title: "Our Work — FlowSites",
    description: "Explore the websites and software built by FlowSites.",
    canonical: "/portfolio",
  });

  return (
    <div className="min-h-screen bg-white text-[#071b3a]">
      <section className="border-b border-slate-200 bg-white pb-10 pt-24 sm:pb-14 sm:pt-28">
        <div className="container">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Our Work</p>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.065em] sm:text-7xl">
            Our work<span className="text-blue-600">.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Explore the websites and software built by FlowSites.
          </p>
        </div>
      </section>

      <main className="container py-10 sm:py-16">
        <div className="space-y-14 md:space-y-16">
          {projects.filter((project) => project.featured).map((project) => (
            <article key={project.name} className="group min-w-0">
              <BrowserFrame project={project} />
              <div className="px-1 pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-[-0.045em] text-[#071b3a] sm:text-3xl">
                      {project.name}
                    </h2>
                    <p className="mt-2 max-w-xl text-[0.98rem] leading-7 text-slate-600">
                      {project.description}
                    </p>
                  </div>
                  <ExternalLink className="mt-1 hidden shrink-0 text-blue-600 sm:block" size={18} aria-hidden="true" />
                </div>
                <Link
                  href={project.caseStudy}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-800"
                >
                  View project
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 md:gap-y-16">
            {projects.filter((project) => !project.featured).map((project) => (
              <article key={project.name} className="group min-w-0">
                <BrowserFrame project={project} />
                <div className="px-1 pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black tracking-[-0.045em] text-[#071b3a] sm:text-3xl">{project.name}</h2>
                      <p className="mt-2 max-w-xl text-[0.98rem] leading-7 text-slate-600">{project.description}</p>
                    </div>
                    <ExternalLink className="mt-1 hidden shrink-0 text-blue-600 sm:block" size={18} aria-hidden="true" />
                  </div>
                  <Link href={project.caseStudy} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-800">
                    View project
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <section className="bg-[#071b3a] px-6 py-12 text-white sm:py-14">
        <div className="container flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <h2 className="text-3xl font-black tracking-[-0.045em] sm:text-4xl">
            Let’s build your website<span className="text-blue-500">.</span>
          </h2>
          <Link
            href="/get-started"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/20 transition-colors hover:bg-blue-500"
          >
            View Website Plans
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}
