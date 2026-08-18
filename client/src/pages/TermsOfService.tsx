import { Link } from "wouter";

const LAST_UPDATED = "April 28, 2026";
const COMPANY = "FlowSites Agency LLC";
const EMAIL = "hello@flow-sites.com";
const PHONE = "(281) 503-8903";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[oklch(0.07_0.005_260)] text-white">
      {/* Hero */}
      <div className="bg-[oklch(0.10_0.008_260)] border-b border-white/10">
        <div className="container py-16 md:py-20">
          <p className="text-[oklch(0.5_0.2_25)] text-sm font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-white/50 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-16 max-w-4xl">
        <div className="space-y-10">

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p className="text-white/70 leading-relaxed">
              By accessing or using the website at flow-sites.com or engaging {COMPANY} ("FlowSites," "we,"
              "us," or "our") for any services, you agree to be bound by these Terms of Service and our
              Privacy Policy. If you do not agree to these terms, please do not use our website or services.
              These terms apply to all visitors, clients, and others who access or use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Services</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              FlowSites provides web design, web development, CRM integration (including DojoFlow), marketing
              automation, SEO, and related digital services. The specific scope, deliverables, timeline, and
              pricing for each engagement are defined in a separate Service Agreement or Statement of Work
              ("SOW") agreed upon by both parties before work begins.
            </p>
            <p className="text-white/70 leading-relaxed">
              We reserve the right to refuse service to anyone for any reason at any time. We may modify,
              suspend, or discontinue any service or feature at any time with reasonable notice to active clients.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Client Responsibilities</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              To enable us to deliver your project on time and to the agreed standard, you agree to:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 pr-6 text-white/60 font-semibold uppercase tracking-wide text-xs">Responsibility</th>
                    <th className="text-left py-3 text-white/60 font-semibold uppercase tracking-wide text-xs">Details</th>
                  </tr>
                </thead>
                <tbody className="text-white/70">
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-6 font-medium text-white">Timely Content</td>
                    <td className="py-3">Provide all required text, images, logos, and brand assets within the agreed timeline.</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-6 font-medium text-white">Feedback & Approvals</td>
                    <td className="py-3">Respond to review requests and provide consolidated feedback within 5 business days.</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-6 font-medium text-white">Accurate Information</td>
                    <td className="py-3">Ensure all content, claims, and information provided to us is accurate and lawful.</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-6 font-medium text-white">Access & Credentials</td>
                    <td className="py-3">Provide necessary access to hosting, domain registrar, CRM, and other platforms as needed.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 font-medium text-white">Payment</td>
                    <td className="py-3">Pay all invoices by the due date as specified in your Service Agreement.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-white/70 leading-relaxed mt-4">
              Project delays caused by late content delivery, slow feedback, or failure to provide required
              access are not the responsibility of FlowSites and may result in revised timelines or additional
              fees.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Payment Terms</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              All fees are as specified in your Service Agreement or SOW. Unless otherwise agreed in writing:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-2">
              <li>A deposit (typically 50% of the project total) is due before work begins.</li>
              <li>The remaining balance is due upon project completion, prior to final delivery or site launch.</li>
              <li>Monthly retainer and hosting fees are billed in advance on the 1st of each month.</li>
              <li>Invoices not paid within the due date are subject to a <span className="text-white font-medium">15% late fee</span> applied to the outstanding balance.</li>
              <li>Clients who pay their monthly invoice before the 1st of the billing month receive a <span className="text-white font-medium">5% early-pay discount</span>.</li>
              <li>Annual prepayment receives a <span className="text-white font-medium">15% discount</span> on the total annual amount.</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-4">
              All payments are processed securely through Stripe. We accept all major credit and debit cards.
              Prices are in US Dollars (USD) and do not include applicable taxes unless stated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Upon receipt of full payment for a project, FlowSites assigns to the client all rights, title,
              and interest in the custom design and code created specifically for that project ("Deliverables"),
              excluding any pre-existing FlowSites frameworks, templates, tools, or third-party components.
            </p>
            <p className="text-white/70 leading-relaxed">
              FlowSites retains the right to display the completed work in our portfolio and marketing materials
              unless the client requests otherwise in writing. The client represents and warrants that all
              content, images, and materials provided to FlowSites are owned by or licensed to the client and
              do not infringe any third-party intellectual property rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Confidentiality</h2>
            <p className="text-white/70 leading-relaxed">
              Both parties agree to keep confidential any proprietary or sensitive information shared during
              the engagement, including but not limited to business strategies, customer data, pricing, and
              technical specifications. This obligation survives termination of the service relationship for
              a period of three (3) years.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Termination</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Either party may terminate a service engagement with 30 days' written notice. Upon termination:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-2">
              <li>All outstanding invoices for work completed to date become immediately due and payable.</li>
              <li>FlowSites will deliver all completed work and project files within 14 business days of final payment.</li>
              <li>Deposits are non-refundable once work has commenced (see Refund Policy for full details).</li>
              <li>Recurring monthly services (hosting, maintenance) terminate at the end of the current billing period.</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-4">
              FlowSites may terminate services immediately and without notice if the client engages in
              fraudulent activity, fails to pay overdue invoices after 30 days, or violates these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
            <p className="text-white/70 leading-relaxed">
              To the maximum extent permitted by applicable law, FlowSites shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, including but not limited
              to loss of profits, data, goodwill, or business interruption, arising out of or in connection
              with our services or these Terms. Our total liability to you for any claim arising from our
              services shall not exceed the total fees paid by you to FlowSites in the three (3) months
              preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-white/70 leading-relaxed">
              Our services are provided "as is" and "as available" without warranties of any kind, either
              express or implied, including but not limited to implied warranties of merchantability, fitness
              for a particular purpose, or non-infringement. We do not warrant that our services will be
              uninterrupted, error-free, or that any defects will be corrected. We make no guarantees
              regarding specific business outcomes, lead generation results, or search engine rankings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law</h2>
            <p className="text-white/70 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of
              Texas, United States, without regard to its conflict of law provisions. Any disputes arising
              under these Terms shall be subject to the exclusive jurisdiction of the courts located in
              Texas. You consent to personal jurisdiction in such courts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to Terms</h2>
            <p className="text-white/70 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will provide notice of significant
              changes by updating the "Last updated" date at the top of this page and, for active clients,
              by email notification. Your continued use of our services after changes become effective
              constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact</h2>
            <p className="text-white/70 leading-relaxed">
              Questions about these Terms of Service? Contact us:
            </p>
            <div className="mt-4 p-6 rounded-xl bg-white/5 border border-white/10 text-white/70 space-y-1">
              <p className="font-semibold text-white">{COMPANY}</p>
              <p><a href={`mailto:${EMAIL}`} className="text-[oklch(0.5_0.2_25)] hover:underline">{EMAIL}</a></p>
              <p>{PHONE}</p>
            </div>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-sm text-white/40">
          <Link href="/privacy-policy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
          <Link href="/refund-policy" className="hover:text-white/70 transition-colors">Refund Policy</Link>
          <Link href="/" className="hover:text-white/70 transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
