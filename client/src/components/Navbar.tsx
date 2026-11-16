import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Menu, X } from "lucide-react";

const serviceLinks = [
  { href: "/services", label: "Website Design" },
  { href: "/ai-services", label: "AI Business Automation" },
  { href: "/ai-video-studio", label: "AI Video Studio" },
];

const primaryLinks = [
  { href: "/#packages", label: "Pricing" },
  { href: "/portfolio", label: "Our Work" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [location] = useLocation();
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsServicesOpen(false);
        setIsMobileServicesOpen(false);
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!servicesRef.current?.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsServicesOpen(false);
    setIsMobileServicesOpen(false);
  }, [location]);

  const isActive = (href: string) => {
    if (href === "/#packages") return location === "/";
    return location === href || location.startsWith(`${href}/`);
  };

  const linkClass = (href: string) =>
    `inline-flex h-10 items-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
      isActive(href)
        ? "text-slate-950"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
    }`;

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
    setIsMobileServicesOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <nav
        className="mx-auto flex h-[72px] w-full max-w-[1280px] items-center gap-4 px-5 sm:px-7 lg:gap-6"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          aria-label="FlowSites home"
        >
          <img
            src="/flowsites-logo-transparent.png"
            alt="FlowSites"
            className="h-11 w-auto object-contain"
          />
          <span className="hidden text-[17px] font-bold tracking-tight text-slate-950 sm:block">
            FlowSites
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex">
          <div ref={servicesRef} className="relative">
            <button
              type="button"
              className={`${linkClass("/services")} gap-1`}
              aria-expanded={isServicesOpen}
              aria-haspopup="menu"
              onClick={() => setIsServicesOpen((open) => !open)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setIsServicesOpen(true);
                }
              }}
            >
              Services
              <ChevronDown
                size={15}
                aria-hidden="true"
                className={`transition-transform ${isServicesOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isServicesOpen && (
              <div
                className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10"
                role="menu"
              >
                {serviceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    className="flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:bg-blue-50 focus-visible:outline-none"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto hidden shrink-0 items-center gap-4 lg:flex">
          <Link
            href="/client-billing"
            className="whitespace-nowrap text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Log in
          </Link>
          <Link
            href="/free-website"
            className="inline-flex h-10 items-center whitespace-nowrap rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Get a Free Website
          </Link>
        </div>

        <Link
          href="/free-website"
          className="ml-auto inline-flex h-9 shrink-0 items-center rounded-lg bg-blue-600 px-3 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:hidden"
        >
          Free Website
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileOpen((open) => !open)}
          className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 lg:hidden"
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileOpen}
          aria-controls="mobile-navigation"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {isMobileOpen && (
        <div id="mobile-navigation" className="border-t border-slate-100 bg-white lg:hidden">
          <div className="mx-auto flex max-w-[1280px] flex-col px-5 py-3 sm:px-7">
            <button
              type="button"
              onClick={() => setIsMobileServicesOpen((open) => !open)}
              className="flex min-h-11 items-center justify-between rounded-lg px-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-expanded={isMobileServicesOpen}
            >
              <span>Services</span>
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={`transition-transform ${isMobileServicesOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isMobileServicesOpen && (
              <div className="ml-3 border-l border-slate-200 pl-3" role="menu">
                {serviceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    role="menuitem"
                    className="flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={linkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/client-billing"
              onClick={closeMobileMenu}
              className="inline-flex h-10 items-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
