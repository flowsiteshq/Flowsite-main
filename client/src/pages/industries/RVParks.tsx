import IndustryLanding, { CORE_TECH_FEATURES, IndustryConfig } from "@/components/IndustryLanding";

const config: IndustryConfig = {
  slug: "rv-parks",
  name: "RV Parks & Campgrounds",
  tagline: "More reservations. Fewer no-shows. Happier guests.",
  heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-hero-rvpark-gk9G2QaGx7Aw93zZNS9wgc.webp",
  galleryImages: [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-gallery-rvpark-1-VFRgPK4auZafSAdqujyEXG.webp",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-hero-rvpark-gk9G2QaGx7Aw93zZNS9wgc.webp",
  ],
  splitImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/industry-gallery-rvpark-1-VFRgPK4auZafSAdqujyEXG.webp",
  heroHeadline: "An RV Park Website That ||Fills Every Site|| Year-Round",
  heroSubheadline:
    "We build AI-powered websites for RV parks and campgrounds that take online reservations, reduce no-shows, and keep guests coming back — 24/7, without a front desk phone ringing off the hook.",
  accentColor: "oklch(0.52 0.18 145)",
  painPoints: [
    {
      icon: "—",
      title: "Phone-Only Reservations Losing You Bookings",
      desc: "RVers plan their trips at 10pm on a Sunday. If you don't have online booking, they're booking the park down the road that does. You're losing reservations every single night.",
    },
    {
      icon: "—",
      title: "No-Shows Leaving Sites Empty",
      desc: "A no-show on a peak weekend is $100–$200 in lost revenue per night. Without automated deposit collection and reminder sequences, no-shows are costing you thousands per season.",
    },
    {
      icon: "—",
      title: "Seasonal Revenue Swings",
      desc: "Summer is packed, shoulder season is empty. Without a system to market to your past guests and fill off-peak sites, you're leaving significant revenue on the table.",
    },
    {
      icon: "—",
      title: "Guests Don't Know What Amenities You Have",
      desc: "Your park has a pool, dog park, and fire pits — but guests don't know until they arrive. A well-designed website with amenity showcases converts browsers into bookers.",
    },
    {
      icon: "—",
      title: "No System to Collect Reviews",
      desc: "RVers trust reviews more than any other factor when choosing a park. If you're not automatically requesting reviews after checkout, you're falling behind parks that do.",
    },
    {
      icon: "—",
      title: "Manual Check-In Process",
      desc: "Guests arrive at 9pm and your office is closed. Without a digital check-in system, they're frustrated before they've even set up camp. That's a 1-star review waiting to happen.",
    },
  ],
  techFeatures: CORE_TECH_FEATURES.map((f) => {
    if (f.title === "Advanced Class & Appointment Scheduling") {
      return {
        ...f,
        title: "Online Reservation & Site Booking",
        bullets: [
          "Real-time site availability calendar",
          "Site type filtering (full hookup, pull-through, tent)",
          "Multi-night reservation with pricing",
          "Seasonal & long-term stay booking",
          "Automated confirmation + check-in instructions",
        ],
      };
    }
    if (f.title === "AI Enrollment Engine") {
      return {
        ...f,
        title: "Reservation & Payment Engine",
        bullets: [
          "Online deposit & full payment collection",
          "Digital registration & vehicle info forms",
          "Pet & add-on service booking",
          "Cancellation & refund policy enforcement",
          "Group & rally reservation management",
        ],
      };
    }
    if (f.title === "Member Portal & Dashboard") {
      return {
        ...f,
        title: "Guest Portal & Loyalty Program",
        bullets: [
          "Reservation history & upcoming stays",
          "Digital check-in & site assignment",
          "Loyalty points & returning guest discounts",
          "Amenity information & park map",
          "Review & feedback submission",
        ],
      };
    }
    return f;
  }),
  results: [
    { stat: "95%", label: "Occupancy rate peak season" },
    { stat: "72hrs", label: "Site live after kickoff" },
    { stat: "80%", label: "Reduction in no-shows" },
    { stat: "3×", label: "More returning guests" },
  ],
  testimonial: {
    quote:
      "We added online booking and within 30 days we were 40% more booked than the same period last year. The automated review requests got us from 47 Google reviews to 180 in one season.",
    name: "Gary & Linda Hoffman",
    business: "Lakeview RV Resort",
  },
  ctaHeadline: "Ready to Fill Every Site and Stop Losing Reservations?",
  ctaSubtext:
    "Schedule a free 30-minute strategy call. We'll audit your current website, show you exactly how many reservations you're missing, and build a system that fills your park year-round.",
};

export default function RVParksPage() {
  return <IndustryLanding config={config} />;
}
