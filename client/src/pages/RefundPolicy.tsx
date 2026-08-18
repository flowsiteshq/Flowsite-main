import { Link } from "wouter";

const LAST_UPDATED = "April 28, 2026";
const COMPANY = "FlowSites Agency LLC";
const EMAIL = "hello@flow-sites.com";
const PHONE = "(281) 503-8903";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[oklch(0.07_0.005_260)] text-white">
      {/* Hero */}
      <div className="bg-[oklch(0.10_0.008_260)] border-b border-white/10">
        <div className="container py-16 md:py-20">
          <p className="text-[oklch(0.5_0.2_25)] text-sm font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Refund Policy</h1>
          <p className="text-white/50 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-16 max-w-4xl">
        <div className="space-y-10">

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-white/70 leading-relaxed">
              At {COMPANY} ("FlowSites"), we are committed to delivering high-quality web design and digital
              services. Because our work involves significant time, creative effort, and custom development,
              our refund policy reflects the nature of professional services rather than physical goods.
              Please read this policy carefully before engaging our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Project Deposits</h2>
            <p className="text-white/70 leading-relaxed">
              All project deposits are <span className="text-white font-semibold">non-refundable</span> once
              work has commenced. The deposit covers the initial discovery, strategy, design concepting, and
              project setup work performed before any deliverables are presented. If you cancel a project
              before work begins (i.e., within 48 hours of signing and before any discovery or design work
              has started), we will issue a full refund of the deposit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Project Milestone Payments</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Payments made at project milestones are non-refundable once the corresponding deliverable has
              been approved or deemed approved (see approval policy below). The following table summarizes
              refund eligibility by project stage:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 pr-6 text-white/60 font-semibold uppercase tracking-wide text-xs">Stage</th>
                    <th className="text-left py-3 pr-6 text-white/60 font-semibold uppercase tracking-wide text-xs">Refund Eligibility</th>
                    <th className="text-left py-3 text-white/60 font-semibold uppercase tracking-wide text-xs">Notes</th>
                  </tr>
                </thead>
                <tbody className="text-white/70">
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-6 font-medium text-white">Before work begins</td>
                    <td className="py-3 pr-6 text-green-400 font-medium">Full refund</td>
                    <td className="py-3">Within 48 hours of signing, no work started</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-6 font-medium text-white">Discovery & strategy</td>
                    <td className="py-3 pr-6 text-yellow-400 font-medium">Partial refund</td>
                    <td className="py-3">Deposit retained; unused portion of milestone refunded</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-6 font-medium text-white">Design in progress</td>
                    <td className="py-3 pr-6 text-yellow-400 font-medium">Partial refund</td>
                    <td className="py-3">Payment for completed work retained; unused portion refunded</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-6 font-medium text-white">Design approved</td>
                    <td className="py-3 pr-6 text-red-400 font-medium">No refund</td>
                    <td className="py-3">Approval (written or implied) is final</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 pr-6 font-medium text-white">Development complete</td>
                    <td className="py-3 pr-6 text-red-400 font-medium">No refund</td>
                    <td className="py-3">All milestone payments are non-refundable</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 font-medium text-white">Site launched</td>
                    <td className="py-3 pr-6 text-red-400 font-medium">No refund</td>
                    <td className="py-3">Project is complete and delivered</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Monthly Retainer & Hosting Fees</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Monthly service fees (including hosting, maintenance, and support retainers) are billed in
              advance and are <span className="text-white font-semibold">non-refundable</span> once the
              billing period has begun. This is because server resources, support availability, and
              maintenance work are reserved and allocated at the start of each billing cycle.
            </p>
            <p className="text-white/70 leading-relaxed">
              If you cancel your monthly services, cancellation takes effect at the end of the current
              billing period. You will continue to have access to all services through the end of the
              period for which you have paid. No prorated refunds are issued for mid-month cancellations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Add-On Services & Upgrades</h2>
            <p className="text-white/70 leading-relaxed">
              Payments for add-on services (such as additional pages, integrations, or the Monthly
              Optimization Package) are non-refundable once the service has been activated or work has
              begun. If you request an add-on and pay the associated invoice but decide to cancel before
              any work is started, please contact us within 24 hours of payment for a full refund
              consideration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Approval Policy</h2>
            <p className="text-white/70 leading-relaxed">
              A deliverable is considered approved when: (a) the client provides written approval via
              email or the client portal; or (b) the client does not provide feedback within 5 business
              days of delivery (deemed approved by silence). Once a deliverable is approved, no refund
              will be issued for that stage of the project. We strongly encourage clients to review all
              deliverables carefully before approving.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Revision Requests</h2>
            <p className="text-white/70 leading-relaxed">
              Rather than seeking a refund, clients are encouraged to use their included revision rounds
              to address any concerns with deliverables. Each project package includes a defined number
              of revision rounds as specified in your Service Agreement. Additional revisions beyond the
              included rounds are available at our standard hourly rate. Revision requests do not entitle
              a client to a refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Exceptions</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              We may, at our sole discretion, issue a partial or full refund in exceptional circumstances,
              including:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-2">
              <li>FlowSites is unable to deliver the agreed services due to circumstances within our control.</li>
              <li>A billing error results in a duplicate or incorrect charge.</li>
              <li>A technical failure on our part prevents service delivery for more than 7 consecutive days.</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-4">
              Refund exceptions are evaluated on a case-by-case basis and are not guaranteed. To request
              an exception, please contact us within 30 days of the charge.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. How to Request a Refund</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              To request a refund, please contact us with the following information:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 ml-2">
              <li>Your full name and business name</li>
              <li>Invoice number and date of payment</li>
              <li>Reason for the refund request</li>
              <li>Any supporting documentation</li>
            </ul>
            <p className="text-white/70 leading-relaxed mt-4">
              We will review your request and respond within 5 business days. Approved refunds are
              processed to the original payment method within 5–10 business days, depending on your
              card issuer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
            <p className="text-white/70 leading-relaxed">
              For refund requests or questions about this policy, please contact us:
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
          <Link href="/terms-of-service" className="hover:text-white/70 transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-white/70 transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
