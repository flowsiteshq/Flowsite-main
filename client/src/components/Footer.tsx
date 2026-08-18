import { Link } from "wouter";
import { Mail, Phone } from "lucide-react";

const companyLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/analyzer", label: "Analyzer" },
  { href: "/contact", label: "Contact" },
];

const serviceLinks = [
  { label: "Website Design", href: "/services" },
  { label: "Funnel Design", href: "/services" },
  { label: "CRM Integration", href: "/services" },
  { label: "Automation Setup", href: "/services" },
  { label: "SEO & Performance", href: "/services" },
  { label: "Client Portal", href: "/client-billing" },
];

const industries = [
  "Martial Arts & Fitness",
  "Restaurants & Cafés",
  "Salons & Spas",
  "Health & Wellness",
  "Real Estate",
  "Insurance & Finance",
];

const linkClass = "text-sm text-slate-500 transition-colors hover:text-blue-600";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-900">
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-10">
          <div className="md:col-span-3">
            <Link href="/" className="mb-5 flex items-center gap-3">
              <img src="/flowsites-logo.png" alt="FlowSites" className="h-12 w-auto rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200" />
              <span className="text-lg font-bold tracking-tight text-slate-900">FlowSites</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-500">
              We build high-converting websites for service businesses — fully integrated with your CRM and automated from day one.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <a href="mailto:hello@flow-sites.com" className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-blue-600"><Mail size={13} />hello@flow-sites.com</a>
              <a href="tel:+12815038903" className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-blue-600"><Phone size={13} />(281) 503-8903</a>
            </div>
          </div>

          <div className="hidden md:block md:col-span-1" />

          <FooterColumn title="Company">
            {companyLinks.map((link) => <Link key={link.href} href={link.href} className={linkClass}>{link.label}</Link>)}
          </FooterColumn>
          <FooterColumn title="Services">
            {serviceLinks.map((link) => <Link key={link.label} href={link.href} className={linkClass}>{link.label}</Link>)}
          </FooterColumn>
          <FooterColumn title="Industries">
            {industries.map((industry) => <Link key={industry} href="/ai-intake?intent=Explore%20industry%20website" className={linkClass}>{industry}</Link>)}
          </FooterColumn>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} FlowSites. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Link href="/privacy-policy" className="text-xs text-slate-400 transition-colors hover:text-blue-600">Privacy Policy</Link>
            <Link href="/terms-of-service" className="text-xs text-slate-400 transition-colors hover:text-blue-600">Terms of Service</Link>
            <Link href="/refund-policy" className="text-xs text-slate-400 transition-colors hover:text-blue-600">Refund Policy</Link>
            <Link href="/client-billing" className="text-xs text-slate-400 transition-colors hover:text-blue-600">Client Portal</Link>
            <Link href="/flowsites-admin-dashboard" className="text-xs text-slate-400 transition-colors hover:text-blue-600">Admin</Link>
            <p className="text-xs text-slate-400">Built with <span className="text-blue-600">precision</span></p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="md:col-span-2">
      <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">{title}</h4>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
