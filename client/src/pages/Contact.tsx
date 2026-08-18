import { useState } from "react";
import { Link } from "wouter";
import ScrollReveal from "@/components/ScrollReveal";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";
import { Send, Phone, Mail, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface FormData {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  lookingFor: string;
}

export default function Contact() {
  useSEO({
    title: "Contact FlowSites — Free Website Strategy Session",
    description:
      "Ready to build a high-converting website for your service business? Contact FlowSites for a free strategy session.",
    canonical: "/contact",
  });

  const [formData, setFormData] = useState<FormData>({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    lookingFor: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Message sent! We'll be in touch within 24 hours.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send message. Please try again.");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      name: formData.name,
      businessName: formData.businessName,
      email: formData.email,
      phone: formData.phone,
      lookingFor: formData.lookingFor,
    });
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[oklch(0.97_0.002_260)] border-b border-[oklch(0.90_0.004_260)]">
        <div className="container">
          <ScrollReveal>
            <div className="max-w-2xl">
              <span className="tag tag-red mb-4 inline-block">Get In Touch</span>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-[oklch(0.08_0.005_260)] leading-[1.1]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Let's Build Something{" "}
                <span className="text-[oklch(0.52_0.22_25)]">That Converts</span>
              </h1>
              <p className="mt-6 text-lg text-[oklch(0.45_0.008_260)] leading-relaxed">
                Schedule a free strategy call or send us a message. We'll review your current setup and show you exactly how we can help you grow.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            {/* Left: Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <ScrollReveal>
                <div>
                  <h2
                    className="text-2xl font-bold text-[oklch(0.08_0.005_260)] mb-6"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Contact Information
                  </h2>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[oklch(0.52_0.22_25_/_8%)] flex items-center justify-center shrink-0">
                        <Mail size={18} className="text-[oklch(0.52_0.22_25)]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[oklch(0.55_0.008_260)] uppercase tracking-widest mb-1">Email</p>
                        <a
                          href="mailto:hello@flow-sites.com"
                          className="text-[oklch(0.20_0.006_260)] hover:text-[oklch(0.52_0.22_25)] transition-colors font-medium"
                        >
                          hello@flow-sites.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[oklch(0.52_0.22_25_/_8%)] flex items-center justify-center shrink-0">
                        <Phone size={18} className="text-[oklch(0.52_0.22_25)]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[oklch(0.55_0.008_260)] uppercase tracking-widest mb-1">Phone / Text</p>
                        <a
                          href="tel:+12815038903"
                          className="text-[oklch(0.20_0.006_260)] hover:text-[oklch(0.52_0.22_25)] transition-colors font-medium"
                        >
                          (281) 503-8903
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[oklch(0.52_0.22_25_/_8%)] flex items-center justify-center shrink-0">
                        <Clock size={18} className="text-[oklch(0.52_0.22_25)]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[oklch(0.55_0.008_260)] uppercase tracking-widest mb-1">Hours</p>
                        <p className="text-[oklch(0.20_0.006_260)] font-medium">Mon–Fri, 9am–5pm CST</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="agency-card rounded-2xl p-7">
                  <h3
                    className="font-bold text-[oklch(0.08_0.005_260)] mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Prefer to book directly?
                  </h3>
                  <p className="text-sm text-[oklch(0.45_0.008_260)] mb-5 leading-relaxed">
                    Skip the form and pick a time that works for you. We'll review your site before the call.
                  </p>
                  <Link href="/schedule">
                    <button className="btn-red w-full justify-center">
                      Schedule a Call <ArrowRight size={15} />
                    </button>
                  </Link>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <div className="space-y-3">
                  {[
                    "Free 30-minute strategy session",
                    "No pushy sales tactics",
                    "Response within 24 hours",
                    "Honest audit of your current site",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-[oklch(0.52_0.22_25)] shrink-0" />
                      <span className="text-sm text-[oklch(0.35_0.006_260)]">{item}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <ScrollReveal delay={0.1}>
                <div className="agency-card rounded-2xl p-8 md:p-10">
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-[oklch(0.52_0.22_25_/_10%)] flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 size={32} className="text-[oklch(0.52_0.22_25)]" />
                      </div>
                      <h3
                        className="text-2xl font-bold text-[oklch(0.08_0.005_260)] mb-3"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Message Received!
                      </h3>
                      <p className="text-[oklch(0.45_0.008_260)] leading-relaxed max-w-sm mx-auto">
                        Thanks for reaching out. We'll review your info and get back to you within 24 hours with next steps.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <h2
                          className="text-xl font-bold text-[oklch(0.08_0.005_260)] mb-1"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          Send Us a Message
                        </h2>
                        <p className="text-sm text-[oklch(0.55_0.008_260)]">We'll get back to you within 24 hours.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[oklch(0.30_0.006_260)] mb-1.5">
                            Your Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Smith"
                            className="w-full px-4 py-3 rounded-xl bg-[oklch(0.97_0.002_260)] border border-[oklch(0.88_0.004_260)] text-[oklch(0.15_0.005_260)] placeholder-[oklch(0.70_0.005_260)] text-sm focus:outline-none focus:border-[oklch(0.52_0.22_25_/_50%)] focus:ring-2 focus:ring-[oklch(0.52_0.22_25_/_15%)] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[oklch(0.30_0.006_260)] mb-1.5">
                            Business Name
                          </label>
                          <input
                            type="text"
                            name="businessName"
                            required
                            value={formData.businessName}
                            onChange={handleChange}
                            placeholder="Your Academy"
                            className="w-full px-4 py-3 rounded-xl bg-[oklch(0.97_0.002_260)] border border-[oklch(0.88_0.004_260)] text-[oklch(0.15_0.005_260)] placeholder-[oklch(0.70_0.005_260)] text-sm focus:outline-none focus:border-[oklch(0.52_0.22_25_/_50%)] focus:ring-2 focus:ring-[oklch(0.52_0.22_25_/_15%)] transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[oklch(0.30_0.006_260)] mb-1.5">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@yourbusiness.com"
                            className="w-full px-4 py-3 rounded-xl bg-[oklch(0.97_0.002_260)] border border-[oklch(0.88_0.004_260)] text-[oklch(0.15_0.005_260)] placeholder-[oklch(0.70_0.005_260)] text-sm focus:outline-none focus:border-[oklch(0.52_0.22_25_/_50%)] focus:ring-2 focus:ring-[oklch(0.52_0.22_25_/_15%)] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[oklch(0.30_0.006_260)] mb-1.5">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(555) 123-4567"
                            className="w-full px-4 py-3 rounded-xl bg-[oklch(0.97_0.002_260)] border border-[oklch(0.88_0.004_260)] text-[oklch(0.15_0.005_260)] placeholder-[oklch(0.70_0.005_260)] text-sm focus:outline-none focus:border-[oklch(0.52_0.22_25_/_50%)] focus:ring-2 focus:ring-[oklch(0.52_0.22_25_/_15%)] transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[oklch(0.30_0.006_260)] mb-1.5">
                          What Are You Looking For?
                        </label>
                        <select
                          name="lookingFor"
                          required
                          value={formData.lookingFor}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-[oklch(0.97_0.002_260)] border border-[oklch(0.88_0.004_260)] text-[oklch(0.15_0.005_260)] text-sm focus:outline-none focus:border-[oklch(0.52_0.22_25_/_50%)] focus:ring-2 focus:ring-[oklch(0.52_0.22_25_/_15%)] transition-all"
                        >
                          <option value="">Select an option...</option>
                          <option value="new-website">New Website Design</option>
                          <option value="redesign">Website Redesign</option>
                          <option value="crm-integration">CRM Integration</option>
                          <option value="funnel-design">Funnel Design</option>
                          <option value="automation">Automation Setup</option>
                          <option value="full-package">Full Package (Everything)</option>
                          <option value="other">Other / Not Sure</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="w-full py-3.5 rounded-full text-sm font-semibold text-white bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.20_25)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {submitMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Send Message
                          </>
                        )}
                      </button>
                      <p className="text-center text-[oklch(0.65_0.006_260)] text-xs">
                        Your information is secure and will never be shared with third parties.
                      </p>
                    </form>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
