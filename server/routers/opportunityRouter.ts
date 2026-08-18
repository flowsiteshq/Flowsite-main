import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";

async function requireAdmin(ctx: any) {
  const token =
    ctx.req.cookies?.admin_session ||
    (ctx.req.headers["x-admin-token"] as string | undefined);
  if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  const { getAdminSession } = await import("../db");
  const session = await getAdminSession(token);
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
}

async function requireTechnician(ctx: any) {
  const { getDb } = await import("../db");
  const { technicians } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
  const rows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
  if (!rows[0] || rows[0].status !== "active") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not an active sales rep" });
  }
  return rows[0];
}

export const opportunityRouter = router({
  list: publicProcedure.query(async () => {
    const { getDb } = await import("../db");
    const { opportunityPool, technicians } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const opps = await db.select().from(opportunityPool);
    // Attach rep name for claimed items
    const techIds = Array.from(new Set(opps.map((o) => o.claimedByTechnicianId).filter(Boolean))) as number[];
    let techMap: Record<number, string> = {};
    if (techIds.length > 0) {
      const techRows = await db.select().from(technicians);
      techRows.forEach((t) => { techMap[t.id] = t.name; });
    }
    return opps.map((o) => ({
      ...o,
      claimedByRepName: o.claimedByTechnicianId ? (techMap[o.claimedByTechnicianId] ?? null) : null,
    }));
  }),

  /** Rep: get all available (unclaimed) opportunities in the pool */
  repGetAvailablePool: publicProcedure.query(async ({ ctx }) => {
    await requireTechnician(ctx);
    const { getDb } = await import("../db");
    const { opportunityPool } = await import("../../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    return await db
      .select()
      .from(opportunityPool)
      .where(and(eq(opportunityPool.status, "available"), eq(opportunityPool.isActive, 1)))
      .orderBy(opportunityPool.createdAt);
  }),

  /** Rep: get all opportunities they have claimed */
  repGetMyPoolClients: publicProcedure.query(async ({ ctx }) => {
    const tech = await requireTechnician(ctx);
    const { getDb } = await import("../db");
    const { opportunityPool } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    return await db
      .select()
      .from(opportunityPool)
      .where(eq(opportunityPool.claimedByTechnicianId, tech.id));
  }),

  claim: publicProcedure
    .input(z.object({ opportunityId: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      const tech = await requireTechnician(ctx);
      const { getDb } = await import("../db");
      const { opportunityPool } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const rows = await db.select().from(opportunityPool).where(eq(opportunityPool.id, input.opportunityId)).limit(1);
      if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Opportunity not found" });
      if (rows[0].claimedByTechnicianId !== null) {
        throw new TRPCError({ code: "CONFLICT", message: "This opportunity has already been claimed." });
      }
      await db.update(opportunityPool).set({ claimedByTechnicianId: tech.id, claimedAt: new Date(), status: "claimed" }).where(eq(opportunityPool.id, input.opportunityId));
      return { success: true };
    }),

  unclaim: publicProcedure
    .input(z.object({ opportunityId: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      await requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { opportunityPool } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db.update(opportunityPool).set({ claimedByTechnicianId: null, claimedAt: null, status: "available" }).where(eq(opportunityPool.id, input.opportunityId));
      return { success: true };
    }),

  /** Admin: confirm payout for a claimed opportunity */
  adminConfirmPayout: publicProcedure
    .input(z.object({
      opportunityId: z.number().int(),
      confirmedPayoutCents: z.number().int().min(0),
    }))
    .mutation(async ({ input, ctx }) => {
      await requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { opportunityPool } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db.update(opportunityPool).set({
        confirmedPayoutCents: input.confirmedPayoutCents,
        payoutConfirmedAt: new Date(),
        status: "converted",
      }).where(eq(opportunityPool.id, input.opportunityId));
      return { success: true };
    }),

  /** Admin/owner: get all pool opportunities claimed by the owner themselves (uses OWNER_OPEN_ID) */
  adminGetMyPoolClients: publicProcedure.query(async ({ ctx }) => {
    await requireAdmin(ctx);
    const { getDb } = await import("../db");
    const { opportunityPool, technicians } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const { ENV } = await import("../_core/env");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    // Find the owner's technician record by OWNER_OPEN_ID
    const ownerOpenId = ENV.ownerOpenId;
    if (!ownerOpenId) {
      // If no owner openId configured, return all claimed opps (admin owns them)
      return await db.select().from(opportunityPool).where(eq(opportunityPool.status, "claimed"));
    }
    const techRows = await db.select().from(technicians).where(eq(technicians.openId, ownerOpenId)).limit(1);
    if (!techRows[0]) {
      // Owner has no technician record yet — return empty
      return [];
    }
    const myTechId = techRows[0].id;
    return await db
      .select()
      .from(opportunityPool)
      .where(eq(opportunityPool.claimedByTechnicianId, myTechId));
  }),

  adminCreate: publicProcedure
    .input(z.object({
      businessName: z.string().min(1),
      websiteUrl: z.string().optional(),
      businessType: z.string().optional(),
      location: z.string().optional(),
      description: z.string().optional(),
      estimatedMonthlyCents: z.number().int().default(4900),
      source: z.string().default("manual"),
      adminNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { opportunityPool } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [result] = await db.insert(opportunityPool).values({ ...input, status: "available", isActive: 1 });
      return { success: true, id: (result as any).insertId };
    }),

  adminDelete: publicProcedure
    .input(z.object({ opportunityId: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      await requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { opportunityPool } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db.delete(opportunityPool).where(eq(opportunityPool.id, input.opportunityId));
      return { success: true };
    }),

  adminUpdate: publicProcedure
    .input(z.object({
      opportunityId: z.number().int(),
      businessName: z.string().min(1).optional(),
      websiteUrl: z.string().optional(),
      businessType: z.string().optional(),
      description: z.string().optional(),
      estimatedMonthlyCents: z.number().int().optional(),
      adminNotes: z.string().optional(),
      status: z.enum(["available", "claimed", "converted", "inactive"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { opportunityPool } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const { opportunityId, ...updates } = input;
      await db.update(opportunityPool).set(updates).where(eq(opportunityPool.id, opportunityId));
      return { success: true };
    }),
});
