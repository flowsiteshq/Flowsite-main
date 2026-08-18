import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  noIndex?: boolean;
  jsonLd?: object | object[];
}

const DEFAULT_TITLE = "FlowSites | Martial Arts & Service Business Web Design Agency";
const DEFAULT_DESCRIPTION =
  "FlowSites builds high-converting websites for martial arts schools, fitness studios, and service businesses. Native DojoFlow CRM integration, automated lead capture, and enrollment-focused design. 150+ sites launched.";
const DEFAULT_OG_IMAGE =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031545745/urOWhqfyIrKAoifg.png";
const SITE_NAME = "FlowSites";
const CANONICAL_BASE = "https://www.flow-sites.com";

export function useSEO({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  canonical,
  twitterTitle,
  twitterDescription,
  noIndex = false,
  jsonLd,
}: SEOProps = {}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | FlowSites`
      : DEFAULT_TITLE;
    const metaDesc = description || DEFAULT_DESCRIPTION;
    const metaOgTitle = ogTitle || title || DEFAULT_TITLE;
    const metaOgDesc = ogDescription || description || DEFAULT_DESCRIPTION;
    const metaOgImage = ogImage || DEFAULT_OG_IMAGE;
    const metaTwitterTitle = twitterTitle || ogTitle || title || DEFAULT_TITLE;
    const metaTwitterDesc = twitterDescription || description || DEFAULT_DESCRIPTION;

    // Title
    document.title = fullTitle;

    // Helper to set/create meta tags
    const setMeta = (selector: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const attr = selector.startsWith('meta[name')
          ? "name"
          : selector.startsWith('meta[property')
          ? "property"
          : "name";
        const val = selector.match(/["']([^"']+)["']/)?.[1] || "";
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // Core meta
    setMeta('meta[name="description"]', metaDesc);
    if (keywords) setMeta('meta[name="keywords"]', keywords);
    setMeta('meta[name="robots"]', noIndex ? "noindex,nofollow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");

    // Open Graph
    setMeta('meta[property="og:title"]', metaOgTitle);
    setMeta('meta[property="og:description"]', metaOgDesc);
    setMeta('meta[property="og:image"]', metaOgImage);
    setMeta('meta[property="og:type"]', ogType);
    setMeta('meta[property="og:site_name"]', SITE_NAME);
    setMeta('meta[property="og:url"]', canonical ? `${CANONICAL_BASE}${canonical}` : window.location.href);

    // Twitter Card
    setMeta('meta[name="twitter:card"]', "summary_large_image");
    setMeta('meta[name="twitter:title"]', metaTwitterTitle);
    setMeta('meta[name="twitter:description"]', metaTwitterDesc);
    setMeta('meta[name="twitter:image"]', metaOgImage);
    setMeta('meta[name="twitter:site"]', "@FlowSites");

    // Canonical
    if (canonical) {
      setLink("canonical", `${CANONICAL_BASE}${canonical}`);
    }

    // JSON-LD structured data
    const existingJsonLd = document.querySelectorAll('script[data-seo="json-ld"]');
    existingJsonLd.forEach((el) => el.remove());

    const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
    schemas.forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "json-ld");
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      // Restore defaults on unmount
      document.title = DEFAULT_TITLE;
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogType, canonical, twitterTitle, twitterDescription, noIndex, jsonLd]);
}

// Predefined JSON-LD schemas
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://www.flow-sites.com/#organization",
  name: "FlowSites",
  url: "https://www.flow-sites.com",
  logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031545745/gMsOiiuXbDHSbeWO.png",
  description:
    "FlowSites is a premium web design agency specializing in high-converting websites for martial arts schools, fitness studios, and service businesses with native DojoFlow CRM integration.",
  foundingDate: "2023",
  areaServed: "US",
  serviceType: [
    "Web Design",
    "Web Development",
    "CRM Integration",
    "DojoFlow Integration",
    "Lead Generation",
    "Martial Arts Website Design",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    url: "https://www.flow-sites.com/contact",
    availableLanguage: "English",
  },
  sameAs: [
    "https://www.flow-sites.com",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.flow-sites.com/#website",
  url: "https://www.flow-sites.com",
  name: "FlowSites",
  description: "Premium web design agency for martial arts schools and service businesses",
  publisher: {
    "@id": "https://www.flow-sites.com/#organization",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.flow-sites.com/?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export const homepageFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What's included in your web design pricing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "All FlowSites packages include custom website design, mobile-responsive development, DojoFlow CRM integration, contact forms with CRM sync, SEO foundation setup, and post-launch support. Starter starts at $1,497, Growth at $2,997, and Authority at $4,997.",
      },
    },
    {
      "@type": "Question",
      name: "How long does it take to build a martial arts website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most FlowSites projects are completed within 2-4 weeks from kickoff to launch. The timeline depends on the package size, content readiness, and revision cycles. We provide a detailed project timeline during onboarding.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to use DojoFlow CRM to work with FlowSites?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "While we specialize in DojoFlow integration and it's our recommended CRM for martial arts schools, we can integrate with other CRM platforms as well. Contact us to discuss your specific needs.",
      },
    },
    {
      "@type": "Question",
      name: "What makes FlowSites different from other web design agencies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FlowSites specializes exclusively in martial arts schools, fitness studios, and service businesses. We build enrollment-focused websites with native DojoFlow CRM integration, automated follow-up sequences, and lead tracking — not generic websites. Our 90-day performance guarantee ensures your site generates measurably more leads.",
      },
    },
    {
      "@type": "Question",
      name: "Can FlowSites help with content and copywriting?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, all FlowSites packages include professional copywriting tailored to your school's unique programs, instructor credentials, and target audience. We write conversion-focused copy that speaks directly to prospective students and parents.",
      },
    },
    {
      "@type": "Question",
      name: "What if I need changes after my website launches?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "All packages include post-launch support (30 days for Starter, 90 days for Growth and Authority). We also offer ongoing maintenance and optimization retainers for clients who want continuous improvement.",
      },
    },
  ],
};
