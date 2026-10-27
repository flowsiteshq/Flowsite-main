# Cue Telephone Integration — Audit Evidence

## Scope and guardrails

The public FlowSites number is **+1 888-933-3010**. This audit does not port, cancel, replace, disconnect, forward, or otherwise modify that number. It does not purchase telephone services, create a paid provider resource, place a call, or activate an agent.

## 800.com account audit status

- On 2026-10-27, a read-only signed-in audit verified that **+1 888-933-3010** is labeled **Flowsites**, active, and uses its own number settings rather than a call flow. No account setting was saved during the audit.
- The current route is **Standard Forwarding** to one existing U.S. forwarding destination. The destination itself is intentionally not written to source control. No extensions are enabled, and no welcome greeting or whisper notice is configured.
- Call recording and call transcription appear enabled for the number. 800 Intelligence (800.com’s own AI call companion) is not enabled. The current account cannot configure 800.com AI Agents without an upgrade; the displayed offer was $99/month billed annually, plus taxes and usage fees. No plan upgrade or purchase was initiated.
- SMS is **unverified**. There are no missed-call text-backs, keyword responses, business-hours auto replies, or general auto replies. Placeholder notification fields were visible but do not confirm that any voicemail or SMS notification recipient is configured.
- The number settings expose Standard, Simultaneous, Sequential, Geo, Voicemail, and In-App-Calling routing. No compatible SIP trunk setting was shown in this account’s number UI. The active business hours and voicemail enablement were not conclusively visible in the read-only review and remain to be confirmed before any test plan.
- 800.com’s public forwarding documentation says a number can forward to one or multiple destinations using Standard, Simultaneous, Sequential, Geo, or Voicemail routing; it also exposes forwarding hours, caller-ID choice, and ring time. The documentation describes forwarding numbers, but does not by itself establish SIP capability for this FlowSites account.

## Verified ElevenLabs options

- ElevenLabs Agents supports SIP trunk imports when the carrier/PBX is SIP-compatible. Its documented requirements include administrator access to the SIP configuration, supported codecs, and (for production) TCP or TLS transport; TLS and encrypted media are the recommended posture.
- ElevenLabs’ native Twilio option supports inbound calls only for Twilio-purchased/provisioned numbers. A verified caller ID is outbound-only. Therefore, the FlowSites 800.com number cannot be treated as an inbound ElevenLabs number through the Twilio-native integration unless a separate Twilio number or SIP-capable path is verified.
- ElevenLabs supports `transfer_to_number` for phone calls through Twilio or SIP. A transfer target must be independently verified and must not point back into the same 800.com forward route.
- ElevenLabs post-call webhooks use HMAC authentication through the `ElevenLabs-Signature` header. Its SDK `constructEvent(rawBody, sigHeader, secret)` validates signature and timestamp. Retries may deliver identical payloads, so the consumer must deduplicate on the conversation/event ID.
- ElevenLabs webhook tools support secret bearer-token headers and other auth methods. The FlowSites agent will use a dedicated service key rather than an admin session, database credential, or the existing Cue read-only key.

## Decision tree before changing live routing

1. The current number UI did not demonstrate a compatible SIP trunk. Do **not** treat this account as SIP-ready based on the public documentation alone.
2. Use a separate approved receiving number connected to ElevenLabs for a closed test. Do not alter +1 888-933-3010 until that test has passed and the active business-hour/voicemail behavior is confirmed.
3. If neither is available, retain existing routing and obtain a provider-supported integration path. Do not improvise a SIP configuration.

## Sources

- [800.com forwarding guide](https://support.800.com/en-us/hc/articles/31424313022349-how-to-set-up-call-forwarding)
- [ElevenLabs SIP trunking](https://elevenlabs.io/docs/eleven-agents/phone-numbers/sip-trunking)
- [ElevenLabs Twilio native integration](https://elevenlabs.io/docs/eleven-agents/phone-numbers/twilio-integration/native-integration)
- [ElevenLabs transfer to number](https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools/transfer-to-number)
- [ElevenLabs post-call webhooks](https://elevenlabs.io/docs/eleven-agents/workflows/post-call-webhooks)
- [ElevenLabs webhooks](https://elevenlabs.io/docs/eleven-api/resources/webhooks)
- [ElevenLabs webhook tools](https://elevenlabs.io/docs/eleven-agents/customization/tools/webhook-tools)
