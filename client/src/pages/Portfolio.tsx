import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";

const myDojo = {
  name: "MyDojo Martial Arts",
  description:
    "A modern, high-converting website for a martial arts school with class schedules, trial sign-ups, and online enrollment.",
  image:
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/mydojo-hero_ba21ac04.png",
  alt: "MyDojo Martial Arts website preview across desktop and mobile",
  href: "/case-study/mydojo",
};

const supportingProjects = [
  {
    name: "DojoFlow",
    description:
      "A dojo management CRM for class scheduling, member records, billing, and automated communications.",
    image: "/dojoflow-dashboard-landscape.webp",
    alt: "DojoFlow dashboard with financial, athlete, and class management views",
    href: "/case-study/dojoflow",
  },
  {
    name: "Zolamind Counseling",
    description:
      "A warm, professional website for a counseling practice with service details, online booking, and a calming, modern design.",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/zolamind-hero_fbe3d3b0.png",
    alt: "Zolamind Counseling website preview",
    href: "/case-study/zolamind",
  },
] as const;

function ProjectLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-blue-700 transition-colors hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
    >
      View Case Study
      <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

export default function Portfolio() {
  useSEO({
    title: "Our Work | FlowSites",
    description:
      "Explore FlowSites websites and software for enrollment, booking, CRM, and automation.",
    canonical: "/portfolio",
  });

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="relative overflow-hidden bg-[#071b3a] pb-9 pt-20 sm:pb-11 sm:pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_45%,rgba(16,125,255,0.92),transparent_38%),linear-gradient(110deg,#07152e_0%,#0b2c61_54%,#0c79ed_100%)] opacity-95" />
        <div className="container relative">
          <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-blue-200">
            Our Work
          </p>
          <h1 className="max-w-[1180px] text-[2.65rem] font-black leading-[0.98] tracking-[-0.06em] text-white sm:text-5xl lg:text-[4.1rem]">
            Websites and software we&apos;ve built.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-blue-50/85 sm:text-lg">
            Website design, booking, CRM, and automation.
          </p>
        </div>
      </section>

      <main className="container py-7 sm:py-10">
        <article className="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-[#eaf3ff] shadow-[0_22px_60px_rgba(7,45,100,0.12)]">
          <div className="grid items-center lg:grid-cols-[0.82fr_1.18fr]">
            <div className="order-2 p-7 sm:p-9 lg:order-1 lg:pr-12">
              <span className="mb-6 block h-1 w-11 rounded-full bg-blue-600" aria-hidden="true" />
              <h2 className="text-3xl font-black leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-[2.6rem]">
                {myDojo.name}
              </h2>
              <p className="mt-5 max-w-xl text-[1.02rem] leading-7 text-slate-700">
                {myDojo.description}
              </p>
              <div className="mt-8">
                <ProjectLink href={myDojo.href} />
              </div>
            </div>
            <div className="order-1 min-h-[15rem] overflow-hidden sm:min-h-[19rem] lg:order-2 lg:min-h-[20rem]">
              <img
                src={myDojo.image}
                alt={myDojo.alt}
                className="h-full w-full object-cover object-top"
                loading="eager"
              />
            </div>
          </div>
        </article>

        <div className="mt-7 grid items-stretch gap-6 md:grid-cols-2">
          {supportingProjects.map((project) => (
            <article
              key={project.name}
              className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_42px_rgba(15,23,42,0.08)]"
            >
              <div className="aspect-video w-full overflow-hidden bg-slate-100 ring-1 ring-inset ring-black/[0.04]">
                <img
                  src={project.image}
                  alt={project.alt}
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-1 flex-col p-7 sm:p-8">
                <h2 className="text-2xl font-black tracking-[-0.045em] text-slate-950 sm:text-3xl">
                  {project.name}
                </h2>
                <p className="mt-3 text-[0.98rem] leading-7 text-slate-600">
                  {project.description}
                </p>
                <div className="mt-auto pt-6">
                  <ProjectLink href={project.href} />
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-14 rounded-[1.25rem] bg-[#071b3a] px-7 py-9 text-white shadow-[0_18px_50px_rgba(7,27,58,0.18)] sm:px-10 sm:py-11 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <h2 className="text-3xl font-black tracking-[-0.045em] sm:text-4xl">
              Let&apos;s build your website
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-blue-50/80">
              A modern, high-performing website for your business, practice, or organization.
            </p>
          </div>
          <Link
            href="/#packages"
            className="mt-7 inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#071b3a] lg:mt-0"
          >
            View Website Plans
            <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    </div>
  );
}
