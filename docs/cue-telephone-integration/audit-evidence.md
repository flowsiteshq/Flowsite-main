# Cue Telephone Integration — Audit Evidence

## Scope and guardrails

The public FlowSites number is **+1 888-933-3010**. This audit does not port, cancel, replace, disconnect, forward, or otherwise modify that number. It does not purchase telephone services, create a paid provider resource, place a call, or activate an agent.

## 800.com account audit status

- On 2026-10-27, both the sandbox browser and the connected browser reached the 800.com sign-in screen at `https://app.800.com/`; neither session had an active 800.com login.
- The account-specific forwarding destination, business hours, voicemail, recording setting, call-routing rules, and any SIP capability are therefore **not yet verified**. They must be read from the signed-in 800.com dashboard before selecting an architecture.
- 800.com’s public forwarding documentation says a number can forward to one or multiple destinations using Standard, Simultaneous, Sequential, Geo, or Voicemail routing; it also exposes forwarding hours, caller-ID choice, and ring time. The documentation describes forwarding numbers, but does not by itself establish SIP capability for this FlowSites account.

## Verified ElevenLabs options

- ElevenLabs Agents supports SIP trunk imports when the carrier/PBX is SIP-compatible. Its documented requirements include administrator access to the SIP configuration, supported codecs, and (for production) TCP or TLS transport; TLS and encrypted media are the recommended posture.
- ElevenLabs’ native Twilio option supports inbound calls only for Twilio-purchased/provisioned numbers. A verified caller ID is outbound-only. Therefore, the FlowSites 800.com number cannot be treated as an inbound ElevenLabs number through the Twilio-native integration unless a separate Twilio number or SIP-capable path is verified.
- ElevenLabs supports `transfer_to_number` for phone calls through Twilio or SIP. A transfer target must be independently verified and must not point back into the same 800.com forward route.
- ElevenLabs post-call webhooks use HMAC authentication through the `ElevenLabs-Signature` header. Its SDK `constructEvent(rawBody, sigHeader, secret)` validates signature and timestamp. Retries may deliver identical payloads, so the consumer must deduplicate on the conversation/event ID.
- ElevenLabs webhook tools support secret bearer-token headers and other auth methods. The FlowSites agent will use a dedicated service key rather than an admin session, database credential, or the existing Cue read-only key.

## Decision tree before changing live routing

1. If the signed-in 800.com account demonstrates a documented, supported SIP trunk option compatible with ElevenLabs, use a staged SIP test path.
2. If it only supports forwarding to standard telephone numbers, use a separate approved receiving number connected to ElevenLabs for a closed test. Do not alter +1 888-933-3010 until that test has passed.
3. If neither is available, retain existing routing and obtain a provider-supported integration path. Do not improvise a SIP configuration.

## Sources

- [800.com forwarding guide](https://support.800.com/en-us/hc/articles/31424313022349-how-to-set-up-call-forwarding)
- [ElevenLabs SIP trunking](https://elevenlabs.io/docs/eleven-agents/phone-numbers/sip-trunking)
- [ElevenLabs Twilio native integration](https://elevenlabs.io/docs/eleven-agents/phone-numbers/twilio-integration/native-integration)
- [ElevenLabs transfer to number](https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools/transfer-to-number)
- [ElevenLabs post-call webhooks](https://elevenlabs.io/docs/eleven-agents/workflows/post-call-webhooks)
- [ElevenLabs webhooks](https://elevenlabs.io/docs/eleven-api/resources/webhooks)
- [ElevenLabs webhook tools](https://elevenlabs.io/docs/eleven-agents/customization/tools/webhook-tools)
