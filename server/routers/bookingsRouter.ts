import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

async function requireActiveTech(ctx: any) {
  const { getDb } = await import("../db");
  const { technicians } = await import("../../drizzle/schema");
  const { eq, or } = await import("drizzle-orm");
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
  // Allow Manus owner / admin user
  if (ctx.user.openId === process.env.OWNER_OPEN_ID) return null;
  const rows = await db
    .select()
    .from(technicians)
    .where(eq(technicians.openId, ctx.user.openId))
    .limit(1);
  if (!rows[0] || rows[0].status !== "active") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not an active staff member" });
  }
  return rows[0];
}

async function rawQuery(sql: string, params: unknown[] = []) {
  const { getDb } = await import("../db");
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
  // Access underlying mysql2 connection via drizzle's internal client
  const client = (db as any).$client ?? (db as any).client;
  const [rows] = await client.execute(sql, params);
  return rows as any[];
}

export const bookingsRouter = router({
  // Stats summary for header cards
  stats: protectedProcedure.query(async ({ ctx }) => {
    await requireActiveTech(ctx);
    const rows = await rawQuery(
      `SELECT 
        COUNT(*) as total,
        SUM(status = 'pending') as pending,
        SUM(status = 'claimed') as claimed,
        SUM(status = 'confirmed') as confirmed,
        SUM(status = 'completed') as completed,
        SUM(status = 'cancelled') as cancelled,
        SUM(status = 'no_show') as no_show
       FROM bookings_queue`
    );
    return rows[0];
  }),

  // List all bookings with optional status filter
  list: protectedProcedure
    .input(z.object({ status: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      await requireActiveTech(ctx);
      let sql = `
        SELECT bq.*, 
               t.name as claimedByName, t.email as claimedByEmail
        FROM bookings_queue bq
        LEFT JOIN technicians t ON t.id = bq.claimedByTechnicianId
      `;
      const params: unknown[] = [];
      if (input.status && input.status !== "all") {
        sql += " WHERE bq.status = ?";
        params.push(input.status);
      }
      sql += " ORDER BY bq.createdAt DESC";
      return await rawQuery(sql, params);
    }),

  // Add a new booking to the queue
  add: protectedProcedure
    .input(
      z.object({
        prospectName: z.string().min(1),
        prospectEmail: z.string().email(),
        prospectPhone: z.string().optional(),
        businessName: z.string().optional(),
        businessType: z.string().optional(),
        source: z.string().optional(),
        notes: z.string().optional(),
        preferredDate: z.string().optional(),
        preferredTime: z.string().optional(),
        timezone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await requireActiveTech(ctx);
      await rawQuery(
        `INSERT INTO bookings_queue 
          (prospectName, prospectEmail, prospectPhone, businessName, businessType, source, notes, preferredDate, preferredTime, timezone, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          input.prospectName,
          input.prospectEmail,
          input.prospectPhone || null,
          input.businessName || null,
          input.businessType || null,
          input.source || "marketing",
          input.notes || null,
          input.preferredDate || null,
          input.preferredTime || null,
          input.timezone || "America/Chicago",
        ]
      );
      const rows = await rawQuery(
        "SELECT bq.*, t.name as claimedByName FROM bookings_queue bq LEFT JOIN technicians t ON t.id = bq.claimedByTechnicianId ORDER BY bq.id DESC LIMIT 1"
      );
      return rows[0];
    }),

  // Rep claims a booking
  claim: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const tech = await requireActiveTech(ctx);
      // For Manus owner, find their technician record by email
      let techId: number | null = tech?.id ?? null;
      if (techId === null && ctx.user?.email) {
        const rows = await rawQuery(
          "SELECT id FROM technicians WHERE email = ? AND status = 'active' LIMIT 1",
          [ctx.user.email]
        );
        if (rows[0]) techId = rows[0].id;
      }
      if (!techId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No active technician record found for your account." });
      }

      const existing = await rawQuery("SELECT * FROM bookings_queue WHERE id = ?", [input.bookingId]);
      if (!existing[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found." });
      if (existing[0].status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This booking has already been claimed." });
      }

      await rawQuery(
        "UPDATE bookings_queue SET status = 'claimed', claimedByTechnicianId = ?, claimedAt = NOW() WHERE id = ?",
        [techId, input.bookingId]
      );
      const rows = await rawQuery(
        "SELECT bq.*, t.name as claimedByName FROM bookings_queue bq LEFT JOIN technicians t ON t.id = bq.claimedByTechnicianId WHERE bq.id = ?",
        [input.bookingId]
      );
      return rows[0];
    }),

  // Update booking status
  updateStatus: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        status: z.enum(["pending", "claimed", "confirmed", "completed", "cancelled", "no_show"]),
        repNotes: z.string().optional(),
        scheduledAt: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await requireActiveTech(ctx);
      const completedAt = input.status === "completed" ? new Date() : null;
      await rawQuery(
        `UPDATE bookings_queue 
         SET status = ?, 
             repNotes = COALESCE(?, repNotes),
             scheduledAt = COALESCE(?, scheduledAt),
             completedAt = COALESCE(?, completedAt),
             updatedAt = NOW()
         WHERE id = ?`,
        [
          input.status,
          input.repNotes || null,
          input.scheduledAt ? new Date(input.scheduledAt) : null,
          completedAt,
          input.bookingId,
        ]
      );
      const rows = await rawQuery(
        "SELECT bq.*, t.name as claimedByName FROM bookings_queue bq LEFT JOIN technicians t ON t.id = bq.claimedByTechnicianId WHERE bq.id = ?",
        [input.bookingId]
      );
      return rows[0];
    }),

  // Release a booking back to pending
  unclaim: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await requireActiveTech(ctx);
      await rawQuery(
        "UPDATE bookings_queue SET status = 'pending', claimedByTechnicianId = NULL, claimedAt = NULL WHERE id = ?",
        [input.bookingId]
      );
      return { success: true };
    }),

  // Delete a booking
  delete: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await requireActiveTech(ctx);
      await rawQuery("DELETE FROM bookings_queue WHERE id = ?", [input.bookingId]);
      return { success: true };
    }),
});
