# FlowSites AI Sales & Marketing Automation — Phase 1 Baseline

**Status:** audit complete; no autonomous customer outreach, payment changes, or production release authorized by this document.

## What exists today

FlowSites already captures most public website, contact, and AI-intake requests in `wizard_submissions`. The internal CRM supports manual lead status updates, notes, assignment, and follow-up dates. Cue has a separate bearer-key integration that can **read a reduced lead record only**; it cannot write, message, change status, or access billing.

The product also has manual 800.com SMS and limited transactional email/SMS paths. These are not a production sales-automation engine.

## Required safety boundary

The new automation program must not send an email, SMS, voicemail, social message, or create a Stripe payment/subscription until a future phase has implemented and validated all of the following:

- Channel-specific consent evidence, optional consent collection, STOP/opt-out/suppression handling, and quiet-hours rules.
- A canonical lead/contact model with deduplication and a combined activity history.
- Durable campaign, template, enrollment, action, retry, and audit records.
- Per-channel sending adapters with verified webhook signatures and idempotency.
- Human approval rules for sensitive or high-value actions.
- A staging/test-mode verification plan that produces no live charges or unsolicited customer communication.

## Billing and deployment boundary

Stripe recurring billing and webhook reconciliation are not verified end to end. Automated sales work must not rely on recurring billing state until Stripe customer/subscription persistence, webhook event idempotency, payment-failure handling, and reconciliation have been implemented and tested in Stripe test mode.

Railway release state and migration history need reconciliation before deploying data-model changes. The Free Website Program migration is intentionally recorded as an additive SQL artifact and has **not** been applied by this workstream.

## Phase 2 delivered in the development branch

The branch introduces `/free-website`, a transparent Free Website Program landing page with:

- No-upfront-fee language and clear monthly-plan/12-month commitment disclosure.
- Four proposed plan cards that do not start checkout or subscriptions.
- A structured request form that creates a canonical CRM lead and a linked program-request record.
- Optional SMS marketing consent with timestamp and disclosure-version storage.
- Explicit disclosure that Cue chat is not yet an active automated sales chat.

The associated data model and request router are source-complete but must remain unpublished until the approved migration/deployment preflight is complete.

## Next build phases

1. Reconcile schema migrations and establish a safe staging/production migration runbook.
2. Build and verify the Free Website Program staff preview workflow and checklist.
3. Create consent, preference, suppression, and activity-timeline foundations.
4. Add human-approved messaging and staff assignment—not autonomous outreach.
5. Implement AI assistance as draft/scoring/recommendation support with full audit logging.
