import IndustryLanding, { CORE_TECH_FEATURES, IndustryConfig } from "@/components/IndustryLanding";

const config: IndustryConfig = {
  slug: "contractors",
  name: "Contractors",
  tagline: "More qualified leads. Fewer tire-kickers. Better jobs.",
  heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-hero-contractors-QyXZ3RA3Hu5TTrx8qukuXv.webp",
  galleryImages: [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-hero-contractors-QyXZ3RA3Hu5TTrx8qukuXv.webp",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-gallery-roofing-1-VfkfM3cS8BYZW8hadrRsiv.webp",
  ],
  splitImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-hero-contractors-QyXZ3RA3Hu5TTrx8qukuXv.webp",
  heroHeadline: "A Contractor Website That ||Closes Projects|| Before You Even Pick Up the Phone",
  heroSubheadline:
    "We build AI-powered websites for general contractors, remodelers, and specialty trades that pre-qualify leads, book consultations, and send proposals automatically — so you only talk to serious buyers.",
  accentColor: "oklch(0.50 0.16 60)",
  painPoints: [
    {
      icon: "—",
      title: "Wasting Time on Tire-Kickers",
      desc: "You spend 2 hours driving to a consultation only to find out they have a $5,000 budget for a $40,000 kitchen remodel. An AI pre-qualification system filters these out before they reach you.",
    },
    {
      icon: "—",
      title: "Missing Calls While You're on the Job",
      desc: "You're on a job site, your phone rings, you can't answer. That's a $50,000+ project calling your competitor. An AI receptionist answers every call, every time.",
    },
    {
      icon: "—",
      title: "Slow Proposal Process Losing You Bids",
      desc: "The contractor who sends a professional proposal first wins the job. If you're still emailing PDFs 3 days later, you've already lost to someone with a better system.",
    },
    {
      icon: "—",
      title: "No Portfolio Showcasing Your Best Work",
      desc: "Homeowners want to see before-and-after photos of your work. A generic website with stock photos doesn't build the trust needed for a $50,000+ renovation decision.",
    },
    {
      icon: "—",
      title: "Referrals Are Your Only Lead Source",
      desc: "Referrals are great but unpredictable. When referrals dry up, so does your pipeline. You need a website that generates consistent inbound leads year-round.",
    },
    {
      icon: "—",
      title: "Clients Don't Know Your Project Status",
      desc: "Clients call you 3 times a week asking for updates. A client portal with photo updates and milestone tracking eliminates these calls and builds trust.",
    },
  ],
  techFeatures: CORE_TECH_FEATURES.map((f) => {
    if (f.title === "Advanced Class & Appointment Scheduling") {
      return {
        ...f,
        title: "Consultation & Site Visit Scheduling",
        bullets: [
          "Online consultation booking with pre-qualification",
          "Project scope & budget collection upfront",
          "AI-recommended time slots",
          "Automated confirmation + reminder texts",
          "Syncs with your project calendar",
        ],
      };
    }
    if (f.title === "AI Enrollment Engine") {
      return {
        ...f,
        title: "Lead Capture & Proposal Engine",
        bullets: [
          "Project inquiry forms with budget pre-qualification",
          "AI-generated ballpark estimate ranges",
          "Digital proposal with e-signature",
          "Deposit & milestone payment collection",
          "Change order management",
        ],
      };
    }
    if (f.title === "Member Portal & Dashboard") {
      return {
        ...f,
        title: "Client Project Portal",
        bullets: [
          "Project timeline & milestone tracking",
          "Daily progress photo updates",
          "Material selection & approval workflows",
          "Invoice & payment history",
          "Warranty & documentation storage",
        ],
      };
    }
    return f;
  }),
  results: [
    { stat: "3×", label: "More qualified leads" },
    { stat: "72hrs", label: "Site live after kickoff" },
    { stat: "60%", label: "Less time on tire-kickers" },
    { stat: "40%", label: "Higher close rate on bids" },
  ],
  testimonial: {
    quote:
      "The pre-qualification form alone saved me 10 hours a week. I only talk to homeowners who have real budgets now. My close rate went from 30% to 55% because I'm only meeting with serious buyers.",
    name: "Robert Chen",
    business: "Chen Premier Renovations",
  },
  ctaHeadline: "Ready to Only Talk to Serious Buyers?",
  ctaSubtext:
    "Schedule a free 30-minute strategy call. We'll audit your current website, show you how many qualified leads you're missing, and build a system that pre-qualifies every prospect before they reach you.",
};

export default function ContractorsPage() {
  return <IndustryLanding config={config} />;
}
