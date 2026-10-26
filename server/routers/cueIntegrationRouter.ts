import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createCueApiKey, CUE_LEAD_SCOPE } from "../cueIntegration";
import { ENV } from "../_core/env";
import type { TrpcContext } from "../_core/context";
import { publicProcedure, router } from "../_core/trpc";

async function requireCueIntegrationAdmin(ctx: TrpcContext): Promise<void> {
  const { getAdminSession, getDb } = await import("../db");
  const adminToken = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
  if (adminToken && await getAdminSession(adminToken)) return;

  const emailToken = ctx.req.cookies?.email_session_id;
  if (emailToken) {
    const { emailAuthSessions } = await import("../../drizzle/schema");
    const db = await getDb();
    if (db) {
      const [session] = await db
        .select()
        .from(emailAuthSessions)
        .where(eq(emailAuthSessions.sessionToken, emailToken))
        .limit(1);
      if (session && session.isAdmin === 1 && session.expiresAt > new Date()) return;
    }
  }

  if (ctx.user?.openId) {
    if (ctx.user.role === "admin" || ctx.user.openId === ENV.ownerOpenId) return;
    const { technicians } = await import("../../drizzle/schema");
    const db = await getDb();
    if (db) {
      const [technician] = await db
        .select()
        .from(technicians)
        .where(eq(technicians.openId, ctx.user.openId))
        .limit(1);
      if (technician?.status === "active" && technician.role === "admin") return;
    }
  }

  throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
}

const keyLabelSchema = z.string().trim().min(2).max(80);

export const cueIntegrationRouter = router({
  listKeys: publicProcedure.query(async ({ ctx }) => {
    await requireCueIntegrationAdmin(ctx);
    const { getDb } = await import("../db");
    const { cueIntegrationKeys } = await import("../../drizzle/schema");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    return await db
      .select({
        id: cueIntegrationKeys.id,
        label: cueIntegrationKeys.label,
        keyPrefix: cueIntegrationKeys.keyPrefix,
        scope: cueIntegrationKeys.scope,
        createdByOpenId: cueIntegrationKeys.createdByOpenId,
        createdAt: cueIntegrationKeys.createdAt,
        lastUsedAt: cueIntegrationKeys.lastUsedAt,
        expiresAt: cueIntegrationKeys.expiresAt,
        revokedAt: cueIntegrationKeys.revokedAt,
      })
      .from(cueIntegrationKeys)
      .orderBy(desc(cueIntegrationKeys.createdAt));
  }),

  createKey: publicProcedure
    .input(z.object({ label: keyLabelSchema }))
    .mutation(async ({ ctx, input }) => {
      await requireCueIntegrationAdmin(ctx);
      const { getDb } = await import("../db");
      const { cueIntegrationKeys } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const generated = createCueApiKey();
      const [result] = await db.insert(cueIntegrationKeys).values({
        label: input.label,
        keyPrefix: generated.keyPrefix,
        tokenHash: generated.tokenHash,
        scope: CUE_LEAD_SCOPE,
        createdByOpenId: ctx.user?.openId ?? null,
      });

      return {
        id: Number((result as { insertId: number }).insertId),
        key: generated.rawKey,
        keyPrefix: generated.keyPrefix,
        scope: CUE_LEAD_SCOPE,
      };
    }),

  revokeKey: publicProcedure
    .input(z.object({ keyId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await requireCueIntegrationAdmin(ctx);
      const { getDb } = await import("../db");
      const { cueIntegrationKeys } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db
        .update(cueIntegrationKeys)
        .set({ revokedAt: new Date() })
        .where(eq(cueIntegrationKeys.id, input.keyId));
      return { success: true };
    }),
});
