import IndustryLanding, { CORE_TECH_FEATURES, IndustryConfig } from "@/components/IndustryLanding";

const config: IndustryConfig = {
  slug: "roofing",
  name: "Roofing",
  tagline: "More storm leads. More booked jobs. Less chasing.",
  heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-hero-roofing-hafDcn6zQXY6naNw2JwoAn.webp",
  galleryImages: [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-gallery-roofing-1-VfkfM3cS8BYZW8hadrRsiv.webp",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-hero-roofing-hafDcn6zQXY6naNw2JwoAn.webp",
  ],
  splitImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-gallery-roofing-1-VfkfM3cS8BYZW8hadrRsiv.webp",
  heroHeadline: "A Roofing Website That ||Books Jobs|| While You're on the Roof",
  heroSubheadline:
    "We build AI-powered websites for roofing companies that capture storm leads, book inspections automatically, and follow up with every prospect — so you never miss a job again.",
  accentColor: "oklch(0.52 0.18 55)",
  painPoints: [
    {
      icon: "—",
      title: "Missing Storm Leads at Peak Hours",
      desc: "After a hailstorm hits, homeowners are calling every roofer in town. If you're on a job and can't answer, they call your competitor. That's $8,000–$25,000 per job walking away.",
    },
    {
      icon: "—",
      title: "Slow Quote Turnaround Losing You Jobs",
      desc: "Homeowners want a quote fast. If you take 24–48 hours to respond, they've already signed with someone else. The first roofer to respond wins 78% of the time.",
    },
    {
      icon: "—",
      title: "No System to Manage Insurance Leads",
      desc: "Insurance claim jobs require follow-up, documentation, and timing. Without an automated system, leads fall through the cracks during the approval process.",
    },
    {
      icon: "—",
      title: "Canvassing Costs Are Eating Your Margin",
      desc: "Door-to-door canvassing after storms is expensive and inconsistent. A website that captures inbound storm leads costs a fraction of a canvassing team.",
    },
    {
      icon: "—",
      title: "No Reviews or Referral System",
      desc: "You do great work but don't have a system to collect reviews or generate referrals. 87% of homeowners check reviews before hiring a contractor.",
    },
    {
      icon: "—",
      title: "Seasonal Revenue Swings",
      desc: "Summer is slammed, winter is slow. Without a lead nurturing system to keep prospects warm year-round, you're always starting from zero in the off-season.",
    },
  ],
  techFeatures: CORE_TECH_FEATURES.map((f) => {
    if (f.title === "Advanced Class & Appointment Scheduling") {
      return {
        ...f,
        title: "Inspection & Estimate Scheduling",
        bullets: [
          "Online roof inspection booking 24/7",
          "AI-recommended appointment windows",
          "Automated confirmation + reminder texts",
          "Photo upload for remote assessments",
          "Syncs with your crew calendar",
        ],
      };
    }
    if (f.title === "AI Enrollment Engine") {
      return {
        ...f,
        title: "Lead Capture & Quote Engine",
        bullets: [
          "Storm damage lead capture forms",
          "Instant AI-generated preliminary estimates",
          "Insurance claim documentation upload",
          "Digital proposal e-signatures",
          "Deposit collection with Stripe",
        ],
      };
    }
    if (f.title === "Member Portal & Dashboard") {
      return {
        ...f,
        title: "Customer Project Portal",
        bullets: [
          "Project progress photo updates",
          "Material selection & approval",
          "Invoice & payment history",
          "Warranty documentation storage",
          "Review request automation",
        ],
      };
    }
    return f;
  }),
  results: [
    { stat: "5min", label: "Lead response time (AI)" },
    { stat: "72hrs", label: "Site live after kickoff" },
    { stat: "5×", label: "More storm leads captured" },
    { stat: "$0", label: "Missed calls cost you" },
  ],
  testimonial: {
    quote:
      "After the last hailstorm, our website captured 47 leads in 3 days while we were slammed on jobs. The AI booked 31 inspections automatically. That's over $400k in potential revenue we would have missed.",
    name: "Mike Thornton",
    business: "Thornton Roofing & Restoration",
  },
  ctaHeadline: "Ready to Never Miss Another Storm Lead?",
  ctaSubtext:
    "Schedule a free 30-minute strategy call. We'll audit your current website, show you exactly how many leads you're losing, and build a system that captures every one.",
};

export default function RoofingPage() {
  return <IndustryLanding config={config} />;
}
