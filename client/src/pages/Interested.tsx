import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowRight, Zap, Target, BarChart3, Loader2 } from "lucide-react";
import { Link } from "wouter";

const LOGO_URL = "/flowsites-logo.png";

const benefits = [
  {
    icon: Zap,
    title: "Get Online Fast",
    description: "Professional website built and launched in as little as 7–14 days.",
  },
  {
    icon: Target,
    title: "Built to Convert",
    description: "Every page engineered to turn visitors into paying customers.",
  },
  {
    icon: BarChart3,
    title: "Starting at $499",
    description: "Affordable packages for every stage of your business growth.",
  },
];

export default function Interested() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    website: "",
  });

  const submitOptin = trpc.marketing.submitOptin.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitOptin.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone,
      businessName: form.businessName,
      website: form.website || undefined,
      source: "email_blast",
    });
  };

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.005_260)] text-white flex flex-col">
      {/* Navbar */}
      <header className="w-full py-5 px-6 flex items-center justify-between border-b border-white/10">
        <Link href="/">
          <span className="text-xl font-bold tracking-tight text-white cursor-pointer">
            Flow<span className="text-[oklch(0.5_0.2_25)]">Sites</span>
          </span>
        </Link>
        <a
          href="tel:+12815038903"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          (281) 503-8903
        </a>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-stretch">
        {/* Left: Value Prop */}
        <div className="lg:w-1/2 flex flex-col justify-center px-8 py-16 lg:px-16 xl:px-24 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full bg-[oklch(0.5_0.2_25_/_8%)] blur-[120px] pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[oklch(0.5_0.2_25_/_15%)] border border-[oklch(0.5_0.2_25_/_30%)] mb-6">
              <div className="w-2 h-2 rounded-full bg-[oklch(0.5_0.2_25)] animate-pulse" />
              <span className="text-xs font-medium text-[oklch(0.7_0.15_25)]">Limited spots available</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)" }}>
              Yes, I Want a Website That{" "}
              <span className="text-[oklch(0.5_0.2_25)]">Actually Works</span>
            </h1>

            <p className="text-lg text-white/60 mb-10 leading-relaxed">
              Tell us about your business and we'll reach out personally to discuss how FlowSites can help you get more customers — starting at just <strong className="text-white">$499</strong>.
            </p>

            <div className="space-y-5">
              {benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[oklch(0.5_0.2_25_/_15%)] border border-[oklch(0.5_0.2_25_/_25%)] flex items-center justify-center flex-shrink-0">
                    <b.icon size={18} className="text-[oklch(0.6_0.18_25)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{b.title}</p>
                    <p className="text-sm text-white/50 mt-0.5">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Trusted by</p>
              <div className="flex items-center gap-6 flex-wrap">
                {["MyDojo MA", "Yaeger SDA", "Zolamind", "Bluetide Financial", "PolicyPilot"].map((name) => (
                  <span key={name} className="text-sm text-white/50 font-medium">{name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:w-1/2 flex items-center justify-center px-6 py-16 lg:px-16 xl:px-24 bg-white/[0.02] border-l border-white/10">
          {submitted ? (
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-[oklch(0.5_0.2_25_/_15%)] border border-[oklch(0.5_0.2_25_/_30%)] flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={36} className="text-[oklch(0.6_0.18_25)]" />
              </div>
              <h2 className="text-3xl font-bold mb-4">You're on the list!</h2>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                Thanks for your interest! A member of the FlowSites team will reach out to you personally within <strong className="text-white">24 hours</strong> to discuss your project.
              </p>
              <p className="text-white/40 text-sm mb-8">
                In the meantime, feel free to explore our work and see what we've built for businesses like yours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/portfolio">
                  <Button className="bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white px-6">
                    View Our Portfolio
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="border-white/20 text-white/70 hover:text-white hover:border-white/40 px-6">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Get Started Today</h2>
                <p className="text-white/50 text-sm">Fill out the form below and we'll be in touch within 24 hours.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-white/80 text-sm font-medium">
                    Your Name <span className="text-[oklch(0.5_0.2_25)]">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="John Smith"
                    value={form.name}
                    onChange={handleChange}
                    className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[oklch(0.5_0.2_25_/_60%)] focus:ring-[oklch(0.5_0.2_25_/_20%)] h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="businessName" className="text-white/80 text-sm font-medium">
                    Business Name <span className="text-[oklch(0.5_0.2_25)]">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    placeholder="Acme Martial Arts"
                    value={form.businessName}
                    onChange={handleChange}
                    className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[oklch(0.5_0.2_25_/_60%)] focus:ring-[oklch(0.5_0.2_25_/_20%)] h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-white/80 text-sm font-medium">
                    Phone Number <span className="text-[oklch(0.5_0.2_25)]">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="(555) 123-4567"
                    value={form.phone}
                    onChange={handleChange}
                    className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[oklch(0.5_0.2_25_/_60%)] focus:ring-[oklch(0.5_0.2_25_/_20%)] h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-white/80 text-sm font-medium">
                    Email Address <span className="text-[oklch(0.5_0.2_25)]">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="john@yourbusiness.com"
                    value={form.email}
                    onChange={handleChange}
                    className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[oklch(0.5_0.2_25_/_60%)] focus:ring-[oklch(0.5_0.2_25_/_20%)] h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="website" className="text-white/80 text-sm font-medium">
                    Current Website <span className="text-white/30 text-xs font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    type="text"
                    placeholder="www.yourbusiness.com"
                    value={form.website}
                    onChange={handleChange}
                    className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[oklch(0.5_0.2_25_/_60%)] focus:ring-[oklch(0.5_0.2_25_/_20%)] h-11"
                  />
                </div>

                {submitOptin.error && (
                  <p className="text-red-400 text-sm">{submitOptin.error.message}</p>
                )}

                <Button
                  type="submit"
                  disabled={submitOptin.isPending}
                  className="w-full h-12 bg-gradient-to-r from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] hover:from-[oklch(0.55_0.22_25)] hover:to-[oklch(0.45_0.2_25)] text-white font-semibold text-base shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)] transition-all duration-300"
                >
                  {submitOptin.isPending ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Yes, I'm Interested!
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-white/30">
                  No spam. No obligation. We'll reach out personally within 24 hours.
                </p>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 px-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-white/30">© 2026 FlowSites. All rights reserved.</p>
        <p className="text-xs text-white/30">
          Questions? Call us at{" "}
          <a href="tel:+12815038903" className="text-white/50 hover:text-white transition-colors">
            (281) 503-8903
          </a>
        </p>
      </footer>
    </div>
  );
}
