import crypto from "crypto";
import { and, desc, eq, isNull, lt } from "drizzle-orm";
import type { wizardSubmissions } from "../drizzle/schema";

export const CUE_LEAD_SCOPE = "leads:read" as const;
export const CUE_API_KEY_PREFIX = "fs_cue_";

export type CueLead = {
  id: number;
  businessName: string;
  businessType: string;
  website: string | null;
  contact: {
    email: string;
    phone: string;
  };
  inquiry: {
    primaryGoal: string;
    timeline: string;
    source: string | null;
    nicheTag: string | null;
  };
  status: string;
  followUpDate: string | null;
  createdAt: Date;
  statusUpdatedAt: Date;
};

export function hashCueApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export function createCueApiKey(): { rawKey: string; keyPrefix: string; tokenHash: string } {
  const rawKey = `${CUE_API_KEY_PREFIX}${crypto.randomBytes(32).toString("base64url")}`;
  return {
    rawKey,
    keyPrefix: rawKey.slice(0, CUE_API_KEY_PREFIX.length + 12),
    tokenHash: hashCueApiKey(rawKey),
  };
}

/**
 * This is the only shape returned to Cue. In particular, internal admin notes,
 * budget, styling preferences, reference sites, assignment records, and all
 * billing/customer data stay out of the integration response.
 */
export function toCueLead(lead: typeof wizardSubmissions.$inferSelect): CueLead {
  return {
    id: lead.id,
    businessName: lead.businessName,
    businessType: lead.businessType,
    website: lead.website ?? null,
    contact: {
      email: lead.email,
      phone: lead.phone,
    },
    inquiry: {
      primaryGoal: lead.primaryGoal,
      timeline: lead.timeline,
      source: lead.source ?? null,
      nicheTag: lead.nicheTag ?? null,
    },
    status: lead.status,
    followUpDate: lead.followUpDate ?? null,
    createdAt: lead.createdAt,
    statusUpdatedAt: lead.statusUpdatedAt,
  };
}

export type CueLeadQuery = {
  limit: number;
  cursor?: number;
  status?: "new" | "contacted" | "in_progress" | "proposal_sent" | "won" | "lost";
};

export async function verifyCueApiKey(rawKey: string) {
  if (!rawKey.startsWith(CUE_API_KEY_PREFIX)) return null;

  const { getDb } = await import("./db");
  const { cueIntegrationKeys } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const tokenHash = hashCueApiKey(rawKey);
  const [key] = await db
    .select()
    .from(cueIntegrationKeys)
    .where(and(eq(cueIntegrationKeys.tokenHash, tokenHash), isNull(cueIntegrationKeys.revokedAt)))
    .limit(1);

  if (!key || (key.expiresAt && key.expiresAt <= new Date())) return null;

  await db
    .update(cueIntegrationKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(cueIntegrationKeys.id, key.id));

  return key;
}

export async function getCueLeads(query: CueLeadQuery) {
  const { getDb } = await import("./db");
  const { wizardSubmissions } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];
  if (query.cursor) conditions.push(lt(wizardSubmissions.id, query.cursor));
  if (query.status) conditions.push(eq(wizardSubmissions.status, query.status));

  const rows = await db
    .select()
    .from(wizardSubmissions)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(wizardSubmissions.id))
    .limit(query.limit + 1);

  const hasMore = rows.length > query.limit;
  const page = hasMore ? rows.slice(0, query.limit) : rows;
  const lastLead = page.at(-1);

  return {
    leads: page.map(toCueLead),
    nextCursor: hasMore && lastLead ? String(lastLead.id) : null,
  };
}

export async function logCueLeadRead(input: {
  keyId: number;
  resultCount: number;
  requestId: string;
}) {
  const { getDb } = await import("./db");
  const { cueIntegrationAuditLogs } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) return;

  await db.insert(cueIntegrationAuditLogs).values({
    keyId: input.keyId,
    eventType: "leads_read",
    resultCount: input.resultCount,
    requestId: input.requestId,
  });
}
