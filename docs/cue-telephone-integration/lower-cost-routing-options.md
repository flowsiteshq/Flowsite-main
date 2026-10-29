# Lower-Cost Cue Telephone Routing Options

**Date:** October 27, 2026

The existing FlowSites public number, **+1 888-933-3010**, is active in 800.com on the legacy Unlimited plan at **$59/month**. The 800.com number-management screen explicitly lists **SIP** as an available call-forwarding destination type alongside a number, user, AI agent, and call flow.

## Recommended: direct 800.com SIP to ElevenLabs

Keep the existing 800.com plan and connect its SIP destination to the existing ElevenLabs Cue agent. This retains the public FlowSites number and removes the need for Twilio, a new public number, or the 800.com Complete upgrade.

Expected routing:

```text
Caller → +1 888-933-3010 on 800.com → SIP destination → ElevenLabs Cue agent
```

ElevenLabs documents a SIP trunk route for existing numbers. Its required SIP destination format includes an identifier, for example:

```text
sip:+18889333010@sip.rtc.elevenlabs.io:5061;transport=tls
```

The number must first be imported as a SIP trunk in ElevenLabs and assigned to Cue. Production should use TLS and one of the documented compatible codecs. No 800.com forwarding route will be changed until the ElevenLabs SIP number is imported, assigned to Cue, and its rollback destination is recorded.

## Cost comparison

The current 800.com account does not offer a lower native AI Agent tier. Its live account page offers only the **Complete** plan, currently shown as **$119/month** monthly or **$99/month billed annually**, plus taxes and fees. It includes 500 agent minutes and charges $0.60/minute overage.

ElevenLabs lists these lower-cost agent tiers:

- **Free / pay-as-you-go:** $0/month, 15 included call minutes, then $0.08/minute.
- **Starter:** $6/month, 75 included call minutes, then $0.08/minute.
- **Creator:** $22/month, 275 included call minutes, then $0.08/minute.

External language-model usage is billed at cost by ElevenLabs and varies by selected model. The recommended initial production tier is **ElevenLabs Starter at $6/month**, with a spending limit set before live forwarding is changed. The existing 800.com plan remains unchanged.

## Safety controls before live assignment

Before changing the live FlowSites route, configure the SIP trunk in ElevenLabs, attach it to Cue, confirm the agent’s AI disclosure and human escalation script, record the current 800.com forwarding destination for rollback, and agree on a single low-risk inbound verification call. If the test fails, immediately restore the existing 800.com destination.

## Sources

- [ElevenLabs SIP trunking documentation](https://elevenlabs.io/docs/eleven-agents/phone-numbers/sip-trunking)
- [ElevenAgents pricing](https://elevenlabs.io/pricing/agents)
- [800.com call forwarding documentation](https://support.800.com/en-us/hc/articles/360030706272-configuring-call-forwarding-settings)
- [800.com native AI Agent plans](https://www.800.com/ai-agents/plans)
