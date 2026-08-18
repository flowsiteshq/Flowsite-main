import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[oklch(0.5_0.2_25_/_6%)] blur-[120px]" />

      <div className="container relative z-10 text-center">
        <div className="text-8xl md:text-9xl font-bold text-gradient-red mb-4" style={{ fontFamily: "var(--font-display)" }}>
          404
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Page Not Found
        </h1>
        <p className="text-white/40 text-lg mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] hover:from-[oklch(0.55_0.22_25)] hover:to-[oklch(0.45_0.2_25)] transition-all duration-300 shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)]"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
