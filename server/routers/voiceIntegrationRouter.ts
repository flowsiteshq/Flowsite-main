import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { ENV } from "../_core/env";
import type { TrpcContext } from "../_core/context";
import { publicProcedure, router } from "../_core/trpc";
import { createVoiceApiKey, VOICE_LEAD_WRITE_SCOPE } from "../voiceIntegration";

async function requireVoiceIntegrationAdmin(ctx: TrpcContext): Promise<void> {
  const { getAdminSession, getDb } = await import("../db");
  const adminToken = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
  if (adminToken && await getAdminSession(adminToken)) return;

  const emailToken = ctx.req.cookies?.email_session_id;
  if (emailToken) {
    const { emailAuthSessions } = await import("../../drizzle/schema");
    const db = await getDb();
    if (db) {
      const [session] = await db.select().from(emailAuthSessions).where(eq(emailAuthSessions.sessionToken, emailToken)).limit(1);
      if (session && session.isAdmin === 1 && session.expiresAt > new Date()) return;
    }
  }

  if (ctx.user?.openId) {
    if (ctx.user.role === "admin" || ctx.user.openId === ENV.ownerOpenId) return;
    const { technicians } = await import("../../drizzle/schema");
    const db = await getDb();
    if (db) {
      const [technician] = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
      if (technician?.status === "active" && technician.role === "admin") return;
    }
  }

  throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
}

const labelSchema = z.string().trim().min(2).max(80);

export const voiceIntegrationRouter = router({
  getReadiness: publicProcedure.query(async ({ ctx }) => {
    await requireVoiceIntegrationAdmin(ctx);
    return {
      provider: "ElevenLabs",
      status: "foundation_ready" as const,
      activeCalling: false,
      configured: {
        webhookSecret: Boolean(ENV.elevenLabsWebhookSecret),
        apiKey: Boolean(ENV.elevenLabsApiKey),
      },
      safeguards: [
        "Dedicated voice credential — separate from Cue read-only access",
        "Signed webhook required before post-call data is stored",
        "Idempotent provider event ledger",
        "No automatic outbound calls, messages, forwarding, or payments",
      ],
    };
  }),

  listKeys: publicProcedure.query(async ({ ctx }) => {
    await requireVoiceIntegrationAdmin(ctx);
    const { getDb } = await import("../db");
    const { voiceIntegrationKeys } = await import("../../drizzle/schema");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    return db
      .select({
        id: voiceIntegrationKeys.id,
        label: voiceIntegrationKeys.label,
        keyPrefix: voiceIntegrationKeys.keyPrefix,
        scope: voiceIntegrationKeys.scope,
        createdAt: voiceIntegrationKeys.createdAt,
        lastUsedAt: voiceIntegrationKeys.lastUsedAt,
        expiresAt: voiceIntegrationKeys.expiresAt,
        revokedAt: voiceIntegrationKeys.revokedAt,
      })
      .from(voiceIntegrationKeys)
      .orderBy(desc(voiceIntegrationKeys.createdAt));
  }),

  createKey: publicProcedure.input(z.object({ label: labelSchema })).mutation(async ({ ctx, input }) => {
    await requireVoiceIntegrationAdmin(ctx);
    const { getDb } = await import("../db");
    const { voiceIntegrationKeys } = await import("../../drizzle/schema");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const generated = createVoiceApiKey();
    const [result] = await db.insert(voiceIntegrationKeys).values({
      label: input.label,
      keyPrefix: generated.keyPrefix,
      tokenHash: generated.tokenHash,
      scope: VOICE_LEAD_WRITE_SCOPE,
      createdByOpenId: ctx.user?.openId ?? null,
    });

    return {
      id: Number((result as { insertId: number }).insertId),
      key: generated.rawKey,
      keyPrefix: generated.keyPrefix,
      scope: VOICE_LEAD_WRITE_SCOPE,
    };
  }),

  revokeKey: publicProcedure.input(z.object({ keyId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    await requireVoiceIntegrationAdmin(ctx);
    const { getDb } = await import("../db");
    const { voiceIntegrationKeys } = await import("../../drizzle/schema");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    await db.update(voiceIntegrationKeys).set({ revokedAt: new Date() }).where(eq(voiceIntegrationKeys.id, input.keyId));
    return { success: true };
  }),
});
