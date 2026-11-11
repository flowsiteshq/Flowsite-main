/**
 * FlowSites — Simplified 3-Step Onboarding
 * Step 1: Business Info
 * Step 2: Choose Package
 * Step 3: Payment Plan → Checkout
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, Loader2, Zap, Rocket, Crown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";

// ── Types ──────────────────────────────────────────────────────────────────────
type WebsitePackageKey = "pay_save" | "launch_now";
type PaymentPlan = "package";

interface FormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  goals: string;
  tier: WebsitePackageKey | null;
  paymentPlan: PaymentPlan | null;
}

// ── Packages ──────────────────────────────────────────────────────────────────
const PACKAGES = [
  { key: "pay_save" as WebsitePackageKey, Icon: Zap, name: "Pay & Save", tagline: "$499 one-time setup + $49/month", buildPrice: 499, monthlyPrice: 49, initialPrice: 548, commitment: "Month-to-month service", contractualTotal: null, features: ["Same five-page professional website", "Mobile optimization", "Contact forms and basic SEO", "Hosting, SSL, backups, and routine maintenance"], highlighted: false },
  { key: "launch_now" as WebsitePackageKey, Icon: Rocket, name: "Launch Now", tagline: "$0 setup + $99/month", buildPrice: 0, monthlyPrice: 99, initialPrice: 99, commitment: "12-month minimum commitment", contractualTotal: 1188, features: ["Same five-page professional website", "Mobile optimization", "Contact forms and basic SEO", "Hosting, SSL, backups, and routine maintenance"], highlighted: true },
];

const INDUSTRIES = [
  "Martial Arts & Fitness", "Restaurant & Café", "Salon & Spa",
  "Health & Wellness", "Real Estate", "Insurance & Finance",
  "Law Firm", "Home Services", "Dental / Medical", "Other",
];

const STEPS = ["Business Info", "Choose Package", "Payment Plan"];

// ── Component ─────────────────────────────────────────────────────────────────
export default function GetStarted() {
  useSEO({ title: "Get Started — FlowSites", description: "Tell us about your business and we'll build a site that converts." });
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    businessName: "", ownerName: "", email: "", phone: "",
    website: "", industry: "", goals: "",
    tier: (new URLSearchParams(window.location.search).get("package") as WebsitePackageKey | null) || null, paymentPlan: null,
  });

  const submitWizard = trpc.wizard.submit.useMutation();
  const createCheckout = trpc.stripe.createCheckout.useMutation();

  const update = (field: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const canAdvance = () => {
    if (step === 1) return !!(form.businessName && form.ownerName && form.email && form.phone && form.industry);
    if (step === 2) return !!form.tier;
    if (step === 3) return !!form.paymentPlan;
    return false;
  };

  const handleSubmit = async () => {
    if (!form.tier || !form.paymentPlan) return;
    setLoading(true);
    try {
      await submitWizard.mutateAsync({
        businessName: form.businessName,
        businessType: form.industry,
        email: form.email,
        phone: form.phone,
        website: form.website || "",
        primaryGoal: form.goals || "Grow my business online",
        colorScheme: "TBD",
        timeline: "TBD",
        budget: form.tier || "launch",
        additionalNotes: `Website package: ${form.tier} | Initial payment: ${selectedPkg?.initialPrice} | Monthly: ${selectedPkg?.monthlyPrice} | ${selectedPkg?.commitment}`,
      });

      const result = await createCheckout.mutateAsync({
        websitePackage: form.tier as "pay_save" | "launch_now",
        origin: window.location.origin,
      });

      if (result?.url) {
        window.open(result.url, "_blank");
        toast.success("Redirecting to secure checkout...");
        navigate("/");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedPkg = PACKAGES.find((p) => p.key === form.tier);

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.002_260)] flex flex-col">
      {/* Top Bar */}
      <header className="h-16 border-b border-[oklch(0.88_0.005_260)] bg-white flex items-center px-6 justify-between shrink-0">
        <Link href="/">
          <img
            src="/flowsites-logo-transparent.png"
            alt="FlowSites"
            className="h-14 w-auto"
          />
        </Link>
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={n} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${active ? "text-[oklch(0.52_0.22_25)]" : done ? "text-[oklch(0.50_0.008_260)]" : "text-[oklch(0.70_0.006_260)]"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${active ? "bg-[oklch(0.52_0.22_25)] text-white" : done ? "bg-[oklch(0.88_0.005_260)] text-[oklch(0.40_0.005_260)]" : "border border-[oklch(0.80_0.005_260)] text-[oklch(0.70_0.006_260)]"}`}>
                    {done ? <Check size={10} /> : n}
                  </div>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-px ${step > n ? "bg-[oklch(0.52_0.22_25)]" : "bg-[oklch(0.85_0.005_260)]"}`} />
                )}
              </div>
            );
          })}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Business Info ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h1 className="text-3xl font-bold text-[oklch(0.10_0.005_260)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  Tell us about your business
                </h1>
                <p className="text-[oklch(0.50_0.008_260)] mb-8">We'll use this to build a site that fits your brand and goals.</p>

                <div className="bg-white rounded-2xl border border-[oklch(0.88_0.005_260)] p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-[oklch(0.20_0.005_260)]">Business Name *</Label>
                      <Input
                        placeholder="e.g. McHolmes Martial Arts"
                        value={form.businessName}
                        onChange={(e) => update("businessName", e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-[oklch(0.20_0.005_260)]">Your Name *</Label>
                      <Input
                        placeholder="e.g. Marcus Holmes"
                        value={form.ownerName}
                        onChange={(e) => update("ownerName", e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-[oklch(0.20_0.005_260)]">Email Address *</Label>
                      <Input
                        type="email"
                        placeholder="you@yourbusiness.com"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-[oklch(0.20_0.005_260)]">Phone Number *</Label>
                      <Input
                        type="tel"
                        placeholder="(555) 000-0000"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-[oklch(0.20_0.005_260)]">Current Website</Label>
                      <Input
                        placeholder="yoursite.com (optional)"
                        value={form.website}
                        onChange={(e) => update("website", e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-[oklch(0.20_0.005_260)]">Industry *</Label>
                      <select
                        value={form.industry}
                        onChange={(e) => update("industry", e.target.value)}
                        className="w-full h-11 rounded-lg border border-[oklch(0.88_0.005_260)] bg-white px-3 text-sm text-[oklch(0.20_0.005_260)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.52_0.22_25_/_30%)]"
                      >
                        <option value="">Select your industry</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-[oklch(0.20_0.005_260)]">What are your main goals?</Label>
                    <Textarea
                      placeholder="e.g. Get more leads, increase online bookings, replace our outdated site..."
                      value={form.goals}
                      onChange={(e) => update("goals", e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Choose Package ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h1 className="text-3xl font-bold text-[oklch(0.10_0.005_260)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Choose your website package</h1>
                <p className="text-[oklch(0.50_0.008_260)] mb-8">Both options include the same professional website features.</p>
                <div className="grid grid-cols-1 gap-4">{PACKAGES.map((pkg) => { const selected = form.tier === pkg.key; return <button key={pkg.key} onClick={() => update("tier", pkg.key)} className={`w-full text-left rounded-2xl border-2 p-6 transition-all ${selected ? "border-[oklch(0.52_0.22_25)] bg-[oklch(0.52_0.22_25_/_4%)]" : "border-[oklch(0.88_0.005_260)] bg-white hover:border-[oklch(0.52_0.22_25_/_50%)]"}`}><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selected ? "bg-[oklch(0.52_0.22_25)] text-white" : "bg-[oklch(0.95_0.003_260)] text-[oklch(0.52_0.22_25)]"}`}><pkg.Icon size={18} /></div><div><div className="flex items-center gap-2"><span className="font-bold text-lg text-[oklch(0.10_0.005_260)]">{pkg.name}</span>{pkg.highlighted && <span className="text-[10px] font-bold uppercase tracking-wider bg-[oklch(0.52_0.22_25)] text-white px-2 py-0.5 rounded-full">Recommended</span>}</div><p className="text-sm text-[oklch(0.50_0.008_260)] mt-1">{pkg.tagline}</p></div></div><div className="text-right shrink-0"><div className="text-2xl font-bold text-[oklch(0.10_0.005_260)]">${pkg.initialPrice}</div><div className="text-xs text-[oklch(0.50_0.008_260)]">initial payment</div><div className="text-sm font-semibold text-[oklch(0.52_0.22_25)] mt-1">${pkg.monthlyPrice}/mo</div></div></div><div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">{pkg.features.map(f => <span key={f} className="flex items-center gap-1 text-xs text-[oklch(0.40_0.006_260)]"><Check size={11} className="text-[oklch(0.52_0.22_25)]" />{f}</span>)}</div></button>; })}</div>
              </motion.div>
            )}
            {/* ── Step 3: Confirm terms ── */}
            {step === 3 && selectedPkg && (
              <motion.div key="step3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h1 className="text-3xl font-bold text-[oklch(0.10_0.005_260)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Review your package</h1><p className="text-[oklch(0.50_0.008_260)] mb-8">Confirm the pricing and service terms before secure Stripe checkout.</p>
                <div className="rounded-2xl border border-[oklch(0.88_0.005_260)] bg-white p-6"><div className="flex items-center justify-between gap-4"><div><div className="font-bold text-xl text-[oklch(0.10_0.005_260)]">{selectedPkg.name}</div><div className="mt-1 text-sm text-[oklch(0.50_0.008_260)]">{selectedPkg.commitment}</div></div><button onClick={() => setStep(2)} className="text-xs text-[oklch(0.52_0.22_25)] hover:underline">Change</button></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[oklch(0.97_0.002_260)] p-4"><div className="text-xs text-[oklch(0.50_0.008_260)]">Due at signup</div><div className="mt-1 text-2xl font-bold">${selectedPkg.initialPrice}</div><div className="mt-1 text-xs text-[oklch(0.50_0.008_260)]">{selectedPkg.buildPrice ? `$${selectedPkg.buildPrice} setup + first $${selectedPkg.monthlyPrice} month` : "$0 setup fee"}</div></div><div className="rounded-xl bg-[oklch(0.97_0.002_260)] p-4"><div className="text-xs text-[oklch(0.50_0.008_260)]">Then monthly</div><div className="mt-1 text-2xl font-bold">${selectedPkg.monthlyPrice}</div><div className="mt-1 text-xs text-[oklch(0.50_0.008_260)]">Recurring service</div></div><div className="rounded-xl bg-[oklch(0.97_0.002_260)] p-4"><div className="text-xs text-[oklch(0.50_0.008_260)]">Contract total</div><div className="mt-1 text-sm font-bold">{selectedPkg.contractualTotal ? `$${selectedPkg.contractualTotal.toLocaleString()} over 12 months` : "Month to month"}</div></div></div><p className="mt-4 text-xs leading-5 text-[oklch(0.50_0.008_260)]">Both packages include the same five-page website, mobile optimization, contact forms, basic SEO, hosting, SSL, backups, and routine maintenance. Pay & Save may be cancelled month to month. Launch Now has a 12-month minimum commitment; cancellation terms are shown before checkout and in the service agreement.</p><label className="mt-6 flex items-start gap-3 rounded-xl border border-[oklch(0.88_0.005_260)] p-4"><input type="checkbox" checked={form.paymentPlan === "package"} onChange={e => update("paymentPlan", e.target.checked ? "package" : "")} className="mt-1" /><span className="text-sm leading-6 text-[oklch(0.35_0.006_260)]">I understand the initial payment, recurring monthly price, included services, and applicable service commitment shown above. Any cancellation and ownership terms will be provided in the written service agreement.</span></label></div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="gap-2">
                <ArrowLeft size={16} /> Back
              </Button>
            ) : (
              <Link href="/">
                <Button variant="outline" className="gap-2"><ArrowLeft size={16} /> Home</Button>
              </Link>
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
                className="gap-2 bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.20_25)] text-white"
              >
                Continue <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canAdvance() || loading}
                className="gap-2 bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.20_25)] text-white px-8"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <>Submit & Pay <ArrowRight size={16} /></>}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
