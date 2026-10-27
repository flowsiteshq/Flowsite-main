import crypto from "crypto";
import { and, eq, isNull } from "drizzle-orm";

export const VOICE_LEAD_WRITE_SCOPE = "phone_leads:write" as const;
export const VOICE_API_KEY_PREFIX = "fs_voice_";
export const VOICE_PROVIDER = "elevenlabs" as const;

export type VoiceLeadCreateInput = {
  providerCallId: string;
  contactName?: string;
  businessName: string;
  businessType: string;
  email?: string;
  phone: string;
  website?: string;
  primaryGoal: string;
  timeline?: string;
  summary?: string;
  followUpDate?: string;
};

export type VoiceLeadUpdateInput = {
  leadId: number;
  providerCallId: string;
  businessName?: string;
  businessType?: string;
  email?: string;
  phone?: string;
  website?: string;
  primaryGoal?: string;
  status?: "new" | "contacted" | "in_progress" | "proposal_sent" | "won" | "lost";
  followUpDate?: string | null;
};

export function hashVoiceApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export function createVoiceApiKey(): { rawKey: string; keyPrefix: string; tokenHash: string } {
  const rawKey = `${VOICE_API_KEY_PREFIX}${crypto.randomBytes(32).toString("base64url")}`;
  return {
    rawKey,
    keyPrefix: rawKey.slice(0, VOICE_API_KEY_PREFIX.length + 12),
    tokenHash: hashVoiceApiKey(rawKey),
  };
}

export function normalizeVoicePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 7) return `+${digits}`;
  throw new Error("A valid phone number is required.");
}

export function safeVoiceSummary(value: string | undefined): string | null {
  if (!value) return null;
  const collapsed = value.replace(/\s+/g, " ").trim();
  if (!collapsed) return null;
  return collapsed.slice(0, 2000);
}

function fallbackPhoneLeadEmail(providerCallId: string): string {
  const safeId = providerCallId.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80) || "unknown";
  return `phone-lead-${safeId}@lead.flowsites.invalid`;
}

export async function verifyVoiceApiKey(rawKey: string) {
  if (!rawKey.startsWith(VOICE_API_KEY_PREFIX)) return null;

  const { getDb } = await import("./db");
  const { voiceIntegrationKeys } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [key] = await db
    .select()
    .from(voiceIntegrationKeys)
    .where(and(eq(voiceIntegrationKeys.tokenHash, hashVoiceApiKey(rawKey)), isNull(voiceIntegrationKeys.revokedAt)))
    .limit(1);

  if (!key || (key.expiresAt && key.expiresAt <= new Date()) || key.scope !== VOICE_LEAD_WRITE_SCOPE) return null;

  await db.update(voiceIntegrationKeys).set({ lastUsedAt: new Date() }).where(eq(voiceIntegrationKeys.id, key.id));
  return key;
}

export async function createVoicePhoneLead(input: VoiceLeadCreateInput) {
  const { getDb } = await import("./db");
  const { leadNotes, voiceCallEvents, wizardSubmissions } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const providerEventId = `tool:${input.providerCallId}:lead`;
  const [existingEvent] = await db
    .select()
    .from(voiceCallEvents)
    .where(eq(voiceCallEvents.providerEventId, providerEventId))
    .limit(1);

  if (existingEvent) {
    return { leadId: existingEvent.leadId, created: false, duplicate: true };
  }

  const normalizedPhone = normalizeVoicePhone(input.phone);
  const [leadResult] = await db.insert(wizardSubmissions).values({
    businessName: input.businessName.trim(),
    businessType: input.businessType.trim(),
    contactName: input.contactName?.trim() || undefined,
    website: input.website?.trim() || undefined,
    phone: normalizedPhone,
    email: input.email?.trim() || fallbackPhoneLeadEmail(input.providerCallId),
    colorScheme: "not_specified",
    primaryGoal: input.primaryGoal.trim(),
    timeline: input.timeline?.trim() || "flexible",
    additionalNotes: "Created from a Cue phone conversation. No automated follow-up was sent.",
    source: "ai_voice",
    status: "new",
    createdAt: new Date(),
    statusUpdatedAt: new Date(),
  });
  const leadId = Number((leadResult as { insertId: number }).insertId);
  const summary = safeVoiceSummary(input.summary);

  await db.insert(voiceCallEvents).values({
    provider: VOICE_PROVIDER,
    providerEventId,
    providerCallId: input.providerCallId,
    eventType: "tool_phone_lead_created",
    leadId,
    normalizedPhone,
    summary,
    source: "agent_tool",
    receivedAt: new Date(),
  });

  if (summary) {
    await db.insert(leadNotes).values({
      leadId,
      content: `Cue phone-call summary: ${summary}`,
      authorName: "Cue AI (recorded)",
      createdAt: new Date(),
    });
  }

  if (input.followUpDate) {
    await db
      .update(wizardSubmissions)
      .set({ followUpDate: input.followUpDate, statusUpdatedAt: new Date() })
      .where(eq(wizardSubmissions.id, leadId));
  }

  return { leadId, created: true, duplicate: false };
}

export async function updateVoicePhoneLead(input: VoiceLeadUpdateInput) {
  const { getDb } = await import("./db");
  const { voiceCallEvents, wizardSubmissions } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const providerEventId = `tool:${input.providerCallId}:lead-update:${input.leadId}`;
  const [existingEvent] = await db
    .select()
    .from(voiceCallEvents)
    .where(eq(voiceCallEvents.providerEventId, providerEventId))
    .limit(1);
  if (existingEvent) return { leadId: input.leadId, updated: false, duplicate: true };

  const updates: Record<string, unknown> = { statusUpdatedAt: new Date() };
  if (input.businessName) updates.businessName = input.businessName.trim();
  if (input.businessType) updates.businessType = input.businessType.trim();
  if (input.email) updates.email = input.email.trim();
  if (input.phone) updates.phone = normalizeVoicePhone(input.phone);
  if (input.website !== undefined) updates.website = input.website.trim() || null;
  if (input.primaryGoal) updates.primaryGoal = input.primaryGoal.trim();
  if (input.status) updates.status = input.status;
  if (input.followUpDate !== undefined) updates.followUpDate = input.followUpDate;

  await db.update(wizardSubmissions).set(updates).where(eq(wizardSubmissions.id, input.leadId));
  await db.insert(voiceCallEvents).values({
    provider: VOICE_PROVIDER,
    providerEventId,
    providerCallId: input.providerCallId,
    eventType: "tool_phone_lead_updated",
    leadId: input.leadId,
    normalizedPhone: input.phone ? normalizeVoicePhone(input.phone) : null,
    source: "agent_tool",
    receivedAt: new Date(),
  });

  return { leadId: input.leadId, updated: true, duplicate: false };
}

export async function recordVoiceCallSummary(input: {
  providerEventId: string;
  providerCallId: string;
  leadId?: number | null;
  phone?: string | null;
  summary?: string;
  source: "agent_tool" | "signed_webhook";
  eventTimestamp?: Date | null;
}) {
  const { getDb } = await import("./db");
  const { leadNotes, voiceCallEvents } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [existingEvent] = await db
    .select()
    .from(voiceCallEvents)
    .where(eq(voiceCallEvents.providerEventId, input.providerEventId))
    .limit(1);
  if (existingEvent) return { stored: false, duplicate: true, leadId: existingEvent.leadId };

  const normalizedPhone = input.phone ? normalizeVoicePhone(input.phone) : null;
  const summary = safeVoiceSummary(input.summary);
  await db.insert(voiceCallEvents).values({
    provider: VOICE_PROVIDER,
    providerEventId: input.providerEventId,
    providerCallId: input.providerCallId,
    eventType: "call_summary",
    leadId: input.leadId ?? null,
    normalizedPhone,
    summary,
    source: input.source,
    eventTimestamp: input.eventTimestamp ?? null,
    receivedAt: new Date(),
  });

  if (input.leadId && summary) {
    await db.insert(leadNotes).values({
      leadId: input.leadId,
      content: `Cue phone-call summary: ${summary}`,
      authorName: "Cue AI (recorded)",
      createdAt: new Date(),
    });
  }

  return { stored: true, duplicate: false, leadId: input.leadId ?? null };
}
