import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LogIn, Menu, Phone, X } from "lucide-react";
import { leadCaptureHref } from "@/lib/leadCapture";

const PHONE = "281-503-8903";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#packages", label: "Website Packages" },
  { href: "/ai-services", label: "AI Services" },
  { href: "/ai-video-studio", label: "AI Video Studio" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setIsMobileOpen(false), [location]);

  const navLinkClass = (href: string) => `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    (href === "/" ? location === "/" : location === href)
      ? "bg-slate-100 text-slate-950"
      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
  }`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur transition-shadow" style={{ borderBottom: "1px solid #f1f5f9", boxShadow: isScrolled ? "0 1px 12px rgba(15,23,42,0.07)" : "none" }}>
      <nav className="mx-auto flex min-h-[76px] max-w-[1280px] items-center gap-3 px-5 py-2">
        <Link href="/" className="mr-1 flex shrink-0 items-center gap-2">
          <img src="/flowsites-logo-transparent.png" alt="FlowSites" className="h-11 w-auto object-contain sm:h-12" />
          <span className="hidden text-[17px] font-bold tracking-tight text-slate-950 sm:block">FlowSites</span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {navLinks.map(link => <Link key={link.label} href={link.href} className={navLinkClass(link.href)}>{link.label}</Link>)}
        </div>

        <div className="ml-auto hidden items-center gap-2.5 lg:flex">
          <a href={`tel:${PHONE}`} className="flex items-center gap-1.5 px-1 text-sm font-medium text-slate-500 transition hover:text-slate-950"><Phone size={13} />{PHONE}</a>
          <a href={getGoogleLoginUrl("/client-portal")} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"><LogIn size={14} />Log in</a>
          <Link href="/client-billing" className="inline-flex h-10 items-center rounded-xl px-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950">Client portal</Link>
          <Link href={leadCaptureHref({ intent: "Start a FlowSites website project" })} className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]">Get started</Link>
        </div>

        <button onClick={() => setIsMobileOpen(open => !open)} className="ml-auto rounded-lg p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 lg:hidden" aria-label="Toggle menu">
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {isMobileOpen && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-1 px-5 py-4">
            {navLinks.map(link => <Link key={link.label} href={link.href} className={navLinkClass(link.href)}>{link.label}</Link>)}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
              <a href={getGoogleLoginUrl("/client-portal")} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"><LogIn size={14} />Log in</a>
              <Link href="/client-billing" className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700">Client portal</Link>
              <Link href={leadCaptureHref({ intent: "Start a FlowSites website project" })} className="col-span-2 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-600/20">Get started</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function getGoogleLoginUrl(returnTo = "/") {
  const origin = window.location.origin;
  return `/api/auth/google?origin=${encodeURIComponent(origin)}&returnTo=${encodeURIComponent(returnTo)}`;
}
