import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, Phone, Search, LogIn } from "lucide-react";

const industries = [
  { href: "/industries/martial-arts", label: "Martial Arts" },
  { href: "/industries/gyms-fitness", label: "Gyms & Fitness" },
  { href: "/industries/roofing", label: "Roofing" },
  { href: "/industries/contractors", label: "Contractors" },
  { href: "/industries/med-spas", label: "Med Spas" },
  { href: "/industries/insurance", label: "Insurance" },
  { href: "/industries/restaurants", label: "Restaurants" },
  { href: "/industries/rv-parks", label: "RV Parks" },
  { href: "/industries/ecommerce", label: "E-Commerce" },
];

const PHONE = "281-503-8903";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/analyzer", label: "Analyzer" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [mobileIndustriesOpen, setMobileIndustriesOpen] = useState(false);
  const [location] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIndustriesOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIndustriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isIndustryActive = location.startsWith("/industries");

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: "#fff",
        borderBottom: isScrolled ? "1px solid #e5e7eb" : "1px solid #f3f4f6",
        boxShadow: isScrolled ? "0 1px 12px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <nav className="max-w-[1280px] mx-auto flex items-center min-h-[80px] py-2 px-5 gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 mr-2">
          <img
            src="/flowsites-logo.png"
            alt="FlowSites"
            className="h-12 sm:h-14 w-auto object-contain drop-shadow-sm"
          />
          <span className="ml-2.5 text-[17px] font-bold text-gray-900 tracking-tight hidden sm:block">
            FlowSites
          </span>
        </Link>

        {/* Search bar — Dribbble style */}
        <div
          className="hidden md:flex items-center gap-2 flex-1 max-w-xs rounded-full px-4 py-2 mx-2"
          style={{
            background: "#f3f4f6",
            border: "1px solid #e5e7eb",
          }}
        >
          <Search size={14} className="text-gray-400 shrink-0" />
          <span className="text-sm text-gray-400 truncate">Search industries, services...</span>
        </div>

        {/* Desktop Nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                location === link.href
                  ? "text-gray-900 bg-gray-100"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Industries Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIndustriesOpen(!industriesOpen)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isIndustryActive
                  ? "text-gray-900 bg-gray-100"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Industries
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${industriesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {industriesOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-52 rounded-2xl overflow-hidden z-50 py-1.5"
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                }}
              >
                {industries.map((industry) => (
                  <Link
                    key={industry.href}
                    href={industry.href}
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    {industry.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3 shrink-0 ml-auto">
          <a
            href={`tel:${PHONE}`}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Phone size={13} />
            {PHONE}
          </a>
          <a
            href={getGoogleLoginUrl("/client-portal")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 border border-gray-200 hover:border-gray-400 hover:text-gray-900 transition-all"
          >
            <LogIn size={14} />
            Log In
          </a>
          <Link
            href="/schedule"
            className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
              boxShadow: "0 2px 10px rgba(59,130,246,0.35)",
            }}
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden ml-auto p-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div
          className="md:hidden border-t border-gray-100"
          style={{ background: "#fff" }}
        >
          <div className="max-w-[1280px] mx-auto py-4 px-5 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium py-2.5 px-3 rounded-xl transition-colors ${
                  location === link.href
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Industries Accordion */}
            <button
              onClick={() => setMobileIndustriesOpen(!mobileIndustriesOpen)}
              className={`flex items-center justify-between text-sm font-medium py-2.5 px-3 rounded-xl transition-colors ${
                isIndustryActive
                  ? "text-gray-900 bg-gray-100"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Industries
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${mobileIndustriesOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobileIndustriesOpen && (
              <div className="pl-4 flex flex-col gap-0.5">
                {industries.map((industry) => (
                  <Link
                    key={industry.href}
                    href={industry.href}
                    className="flex items-center text-sm py-2.5 px-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    {industry.label}
                  </Link>
                ))}
              </div>
            )}

          <div className="mt-2 flex flex-col gap-2">
            <a
              href={`tel:${PHONE}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Phone size={14} />
              {PHONE}
            </a>
            <a
              href={getGoogleLoginUrl("/client-portal")}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200"
            >
              <LogIn size={14} />
              Log In
            </a>
            <a
              href={getGoogleLoginUrl("/")}
              className="flex items-center justify-center py-3 px-5 rounded-full text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
              }}
            >
              Sign Up with Google
            </a>
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
