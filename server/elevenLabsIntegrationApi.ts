import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import { ENV } from "./_core/env";
import {
  createVoicePhoneLead,
  recordVoiceCallSummary,
  updateVoicePhoneLead,
  verifyVoiceApiKey,
  VOICE_LEAD_WRITE_SCOPE,
} from "./voiceIntegration";

const leadStatus = z.enum(["new", "contacted", "in_progress", "proposal_sent", "won", "lost"]);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const createLeadSchema = z.object({
  providerCallId: z.string().trim().min(3).max(191),
  contactName: z.string().trim().min(1).max(255).optional(),
  businessName: z.string().trim().min(1).max(255),
  businessType: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320).optional(),
  phone: z.string().trim().min(7).max(50),
  website: z.string().trim().url().max(500).optional(),
  primaryGoal: z.string().trim().min(1).max(2000),
  timeline: z.string().trim().min(1).max(100).optional(),
  summary: z.string().trim().min(1).max(2000).optional(),
  followUpDate: isoDate.optional(),
}).strict();

const updateLeadSchema = z.object({
  providerCallId: z.string().trim().min(3).max(191),
  businessName: z.string().trim().min(1).max(255).optional(),
  businessType: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().max(320).optional(),
  phone: z.string().trim().min(7).max(50).optional(),
  website: z.string().trim().url().max(500).optional(),
  primaryGoal: z.string().trim().min(1).max(2000).optional(),
  status: leadStatus.optional(),
  followUpDate: isoDate.nullable().optional(),
}).strict().refine((input) => Object.keys(input).some((key) => key !== "providerCallId"), {
  message: "At least one allowlisted lead field is required.",
});

const summarySchema = z.object({
  providerCallId: z.string().trim().min(3).max(191),
  leadId: z.number().int().positive().optional(),
  phone: z.string().trim().min(7).max(50).optional(),
  summary: z.string().trim().min(1).max(2000),
  followUpDate: isoDate.optional(),
}).strict();

function bearerToken(req: Request): string | null {
  const header = req.header("authorization");
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function toolHeaders(res: Response) {
  res.set({
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  });
}

function unauthorized(res: Response) {
  return res.status(401).json({ error: { code: "invalid_voice_key", message: "A valid scoped voice integration key is required." } });
}

async function requireVoiceKey(req: Request, res: Response) {
  const rawKey = bearerToken(req);
  if (!rawKey) {
    unauthorized(res);
    return null;
  }
  const key = await verifyVoiceApiKey(rawKey);
  if (!key || key.scope !== VOICE_LEAD_WRITE_SCOPE) {
    unauthorized(res);
    return null;
  }
  return key;
}

function invalidRequest(res: Response, error: z.ZodError) {
  return res.status(400).json({
    error: {
      code: "invalid_request",
      message: "The request contains invalid or unsupported fields.",
      details: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    },
  });
}

/**
 * External machine endpoints for an ElevenLabs Agent webhook tool. They are
 * intentionally not tRPC procedures: only an fs_voice_ service credential can
 * call them, accepted fields are allowlisted, and no outbound action is run.
 */
export function registerElevenLabsIntegrationToolRoutes(app: Express) {
  app.post("/api/integrations/elevenlabs/tools/phone-leads", async (req, res) => {
    toolHeaders(res);
    try {
      if (!(await requireVoiceKey(req, res))) return;
      const parsed = createLeadSchema.safeParse(req.body);
      if (!parsed.success) return invalidRequest(res, parsed.error);
      const result = await createVoicePhoneLead(parsed.data);
      return res.status(result.created ? 201 : 200).json({ data: result, access: { scope: VOICE_LEAD_WRITE_SCOPE } });
    } catch (error) {
      console.error("[ElevenLabs integration] phone lead creation failed:", error);
      return res.status(500).json({ error: { code: "service_unavailable", message: "Voice lead intake is temporarily unavailable." } });
    }
  });

  app.patch("/api/integrations/elevenlabs/tools/phone-leads/:leadId", async (req, res) => {
    toolHeaders(res);
    try {
      if (!(await requireVoiceKey(req, res))) return;
      const leadId = z.coerce.number().int().positive().safeParse(req.params.leadId);
      if (!leadId.success) return res.status(400).json({ error: { code: "invalid_lead", message: "A valid lead ID is required." } });
      const parsed = updateLeadSchema.safeParse(req.body);
      if (!parsed.success) return invalidRequest(res, parsed.error);
      const result = await updateVoicePhoneLead({ ...parsed.data, leadId: leadId.data });
      return res.json({ data: result, access: { scope: VOICE_LEAD_WRITE_SCOPE } });
    } catch (error) {
      console.error("[ElevenLabs integration] phone lead update failed:", error);
      return res.status(500).json({ error: { code: "service_unavailable", message: "Voice lead update is temporarily unavailable." } });
    }
  });

  app.post("/api/integrations/elevenlabs/tools/calls/:providerCallId/summary", async (req, res) => {
    toolHeaders(res);
    try {
      if (!(await requireVoiceKey(req, res))) return;
      const providerCallId = z.string().trim().min(3).max(191).safeParse(req.params.providerCallId);
      if (!providerCallId.success) return res.status(400).json({ error: { code: "invalid_call", message: "A valid provider call ID is required." } });
      const parsed = summarySchema.safeParse({ ...req.body, providerCallId: req.body?.providerCallId ?? providerCallId.data });
      if (!parsed.success) return invalidRequest(res, parsed.error);
      if (parsed.data.providerCallId !== providerCallId.data) return res.status(400).json({ error: { code: "invalid_call", message: "The call ID must match the request path." } });
      const result = await recordVoiceCallSummary({
        providerEventId: `tool:${providerCallId.data}:summary`,
        providerCallId: providerCallId.data,
        leadId: parsed.data.leadId,
        phone: parsed.data.phone,
        summary: parsed.data.summary,
        source: "agent_tool",
      });
      return res.status(result.stored ? 201 : 200).json({ data: result, access: { scope: VOICE_LEAD_WRITE_SCOPE } });
    } catch (error) {
      console.error("[ElevenLabs integration] call summary failed:", error);
      return res.status(500).json({ error: { code: "service_unavailable", message: "Voice call summary is temporarily unavailable." } });
    }
  });
}

const postCallWebhookSchema = z.object({
  type: z.literal("post_call_transcription"),
  event_timestamp: z.coerce.number().int().positive(),
  data: z.object({
    conversation_id: z.string().trim().min(1).max(191),
    analysis: z.object({ transcript_summary: z.string().trim().max(2000).optional() }).optional(),
    metadata: z.object({ phone_call: z.object({ external_number: z.string().trim().max(50).optional() }).optional() }).optional(),
  }).passthrough(),
}).passthrough();

/**
 * Signed post-call webhook. Raw-body parsing and HMAC/timestamp verification
 * are registered before the app's general JSON middleware. The ElevenLabs SDK
 * verifies the documented ElevenLabs-Signature header; duplicate deliveries are
 * deduplicated through providerEventId in the event ledger.
 */
export async function elevenLabsPostCallWebhookHandler(req: Request, res: Response) {
  const signature = req.header("elevenlabs-signature");
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
  if (!ENV.elevenLabsWebhookSecret) {
    return res.status(503).json({ error: "webhook_not_configured" });
  }
  if (!rawBody || !signature) {
    return res.status(401).json({ error: "invalid_signature" });
  }

  let event: unknown;
  try {
    const client = new ElevenLabsClient({ apiKey: ENV.elevenLabsApiKey || "webhook-verification-only" });
    event = await client.webhooks.constructEvent(rawBody, signature, ENV.elevenLabsWebhookSecret);
  } catch (error) {
    console.error("[ElevenLabs integration] webhook signature verification failed:", error);
    return res.status(401).json({ error: "invalid_signature" });
  }

  const parsed = postCallWebhookSchema.safeParse(event);
  if (!parsed.success) return res.status(400).json({ error: "unsupported_event" });

  try {
    const callId = parsed.data.data.conversation_id;
    const result = await recordVoiceCallSummary({
      providerEventId: `webhook:${callId}:post_call_transcription`,
      providerCallId: callId,
      phone: parsed.data.data.metadata?.phone_call?.external_number,
      summary: parsed.data.data.analysis?.transcript_summary,
      source: "signed_webhook",
      eventTimestamp: new Date(parsed.data.event_timestamp * 1000),
    });
    return res.status(200).json({ received: true, duplicate: result.duplicate });
  } catch (error) {
    console.error("[ElevenLabs integration] verified webhook storage failed:", error);
    return res.status(500).json({ error: "temporary_storage_failure" });
  }
}
