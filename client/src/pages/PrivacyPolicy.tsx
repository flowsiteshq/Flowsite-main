import { Link } from "wouter";

const LAST_UPDATED = "April 28, 2026";
const COMPANY = "FlowSites Agency LLC";
const EMAIL = "hello@flow-sites.com";
const PHONE = "(281) 503-8903";
const WEBSITE = "flow-sites.com";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[oklch(0.07_0.005_260)] text-white">
      {/* Hero */}
      <div className="bg-[oklch(0.10_0.008_260)] border-b border-white/10">
        <div className="container py-16 md:py-20">
          <p className="text-[oklch(0.5_0.2_25)] text-sm font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-white/50 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-16 max-w-4xl">
        <div className="prose prose-invert prose-lg max-w-none space-y-10">

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-white/70 leading-relaxed">
              {COMPANY} ("FlowSites," "we," "us," or "our") operates the website{" "}
              <span className="text-white">{WEBSITE}</span> and provides web design, development, CRM integration,
              and digital marketing services. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our website or engage our services. Please read this
              policy carefully. If you disagree with its terms, please discontinue use of our site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              We collect information you provide directly to us, information collected automatically when you
              use our site, and information from third-party sources.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 pr-6 text-white/60 font-semibold uppercase tracking-wide text-xs">Category</th>
                    <th className="text-left py-3 pr-6 text-white/60 font-semibold uppercase tracking-wide text-xs">Examples</th>
                    <th className="text-left py-3 text-white/60 font-semibold uppercase tracking-wide text-xs">How Collected</th>
                  </tr>
                </thead>
                <tbody className="text-white/70">
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-6 font-medium text-white">Identity & Contact</td>
                    <td className="py-3 pr-6">Name, email, phone number, business name</td>
                    <td className="py-3">Contact forms, onboarding, client portal</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-6 font-medium text-white">Payment</td>
                    <td className="py-3 pr-6">Billing address, last 4 digits of card (via Stripe)</td>
                    <td className="py-3">Stripe checkout — we never store full card numbers</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-6 font-medium text-white">Usage Data</td>
                    <td className="py-3 pr-6">Pages visited, time on site, referring URL</td>
                    <td className="py-3">Automatically via cookies and analytics</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-6 font-medium text-white">Device & Technical</td>
                    <td className="py-3 pr-6">IP address, browser type, operating system</td>
                    <td className="py-3">Automatically via server logs</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 font-medium text-white">Communications</td>
                    <td className="py-3 pr-6">Emails, messages, project feedback</td>
                    <td className="py-3">Directly from you via email or client portal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-white/70 leading-relaxed">
              We use the information we collect to deliver and improve our services, process payments, communicate
              with you about your project, send invoices and billing reminders, respond to inquiries, comply with
              legal obligations, and prevent fraud. We do not sell your personal information to third parties.
              We may use aggregated, anonymized data for analytics and business improvement purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Cookies and Tracking Technologies</h2>
            <p className="text-white/70 leading-relaxed">
              Our website uses cookies and similar tracking technologies to enhance your browsing experience,
              analyze site traffic, and understand where our visitors come from. You may instruct your browser
              to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept
              cookies, some portions of our site may not function properly. We use session cookies (which expire
              when you close your browser) and persistent cookies (which remain on your device until deleted or
              they expire).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Sharing Your Information</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              We may share your information with trusted third-party service providers who assist us in operating
              our website and conducting our business, provided those parties agree to keep this information
              confidential. These include:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-2">
              <li><span className="text-white font-medium">Stripe</span> — payment processing</li>
              <li><span className="text-white font-medium">Resend / email providers</span> — transactional email delivery</li>
              <li><span className="text-white font-medium">DojoFlow / CRM platforms</span> — as part of integration services you request</li>
              <li><span className="text-white font-medium">Analytics providers</span> — aggregated, anonymized usage data</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-4">
              We may also disclose your information when required by law, to enforce our site policies, or to
              protect our rights, property, or safety or that of others.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
            <p className="text-white/70 leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in
              this Privacy Policy, unless a longer retention period is required or permitted by law. Client
              account data is retained for a minimum of seven (7) years for tax and legal compliance purposes.
              You may request deletion of your data at any time by contacting us at{" "}
              <a href={`mailto:${EMAIL}`} className="text-[oklch(0.5_0.2_25)] hover:underline">{EMAIL}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Security</h2>
            <p className="text-white/70 leading-relaxed">
              We implement commercially reasonable technical and organizational security measures to protect
              your personal information from unauthorized access, alteration, disclosure, or destruction.
              All payment processing is handled by Stripe, which is PCI DSS compliant. Our client portal
              uses SSL/TLS encryption for all data in transit. However, no method of transmission over the
              internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Your Rights</h2>
            <p className="text-white/70 leading-relaxed">
              Depending on your jurisdiction, you may have the right to access, correct, or delete your
              personal information; object to or restrict our processing of your data; and receive a
              portable copy of your data. To exercise any of these rights, please contact us at{" "}
              <a href={`mailto:${EMAIL}`} className="text-[oklch(0.5_0.2_25)] hover:underline">{EMAIL}</a>.
              We will respond to your request within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
            <p className="text-white/70 leading-relaxed">
              Our services are not directed to individuals under the age of 18. We do not knowingly collect
              personal information from children. If you become aware that a child has provided us with
              personal information, please contact us and we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
            <p className="text-white/70 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page with an updated "Last updated" date. Your
              continued use of our services after any changes constitutes your acceptance of the new policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
            <p className="text-white/70 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="mt-4 p-6 rounded-xl bg-white/5 border border-white/10 text-white/70 space-y-1">
              <p className="font-semibold text-white">{COMPANY}</p>
              <p><a href={`mailto:${EMAIL}`} className="text-[oklch(0.5_0.2_25)] hover:underline">{EMAIL}</a></p>
              <p>{PHONE}</p>
              <p>{WEBSITE}</p>
            </div>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-sm text-white/40">
          <Link href="/terms-of-service" className="hover:text-white/70 transition-colors">Terms of Service</Link>
          <Link href="/refund-policy" className="hover:text-white/70 transition-colors">Refund Policy</Link>
          <Link href="/" className="hover:text-white/70 transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
