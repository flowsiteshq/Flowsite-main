import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

// ─── helpers ──────────────────────────────────────────────────────────────────

async function adminOnly(ctx: { user: { role: string; openId: string } }) {
  // 1. Manus OAuth owner/admin user
  if (ctx.user.role === "admin") return;
  // 2. Technician with admin role (e.g. Joseph who logs in via Manus OAuth)
  const { getDb } = await import("../db");
  const { technicians } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const db = await getDb();
  if (db) {
    const rows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
    const tech = rows[0];
    if (tech && tech.status === "active" && tech.role === "admin") return;
  }
  throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
}

// ─── router ───────────────────────────────────────────────────────────────────

export const partnerRouter = router({
  // ── Admin: create a partner account ───────────────────────────────────────
  adminCreatePartner: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        companyName: z.string().optional(),
        commissionRate: z.number().int().min(1).max(100).default(15),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      adminOnly(ctx);
      const { getDb } = await import("../db");
      const { partners } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const existing = await db.select().from(partners).where(eq(partners.email, input.email)).limit(1);
      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "A partner with this email already exists." });
      }

      const [result] = await db.insert(partners).values({
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        companyName: input.companyName ?? null,
        commissionRate: input.commissionRate,
        notes: input.notes ?? null,
        status: "active",
      });
      const partnerId = (result as { insertId: number }).insertId;

      return { success: true, partnerId };
    }),

  // ── Admin: list all partners ───────────────────────────────────────────────
  adminListPartners: protectedProcedure.query(async ({ ctx }) => {
    adminOnly(ctx);
    const { getDb } = await import("../db");
    const { partners, technicianCommissions, clientAccounts } = await import("../../drizzle/schema");
    const { eq, desc, sql } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const allPartners = await db.select().from(partners).orderBy(desc(partners.createdAt));

    const result = await Promise.all(
      allPartners.map(async (partner) => {
        const commRows = await db
          .select()
          .from(technicianCommissions)
          .where(eq(technicianCommissions.partnerId, partner.id));
        const totalEarned = commRows.reduce((s, r) => s + r.netCommissionCents, 0);
        const totalPending = commRows.filter((r) => r.status === "pending").reduce((s, r) => s + r.netCommissionCents, 0);
        const totalPaid = commRows.filter((r) => r.status === "paid").reduce((s, r) => s + r.netCommissionCents, 0);
        const clientCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(clientAccounts)
          .where(eq(clientAccounts.assignedPartnerId, partner.id));
        return {
          ...partner,
          totalEarned,
          totalPending,
          totalPaid,
          clientCount: Number(clientCount[0]?.count ?? 0),
        };
      })
    );

    return result;
  }),

  // ── Admin: update partner ──────────────────────────────────────────────────
  adminUpdatePartner: protectedProcedure
    .input(
      z.object({
        partnerId: z.number().int(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        companyName: z.string().optional(),
        commissionRate: z.number().int().min(1).max(100).optional(),
        notes: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      adminOnly(ctx);
      const { getDb } = await import("../db");
      const { partners } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const { partnerId, ...fields } = input;
      const updateData: Record<string, unknown> = {};
      if (fields.name !== undefined) updateData.name = fields.name;
      if (fields.email !== undefined) updateData.email = fields.email;
      if (fields.phone !== undefined) updateData.phone = fields.phone;
      if (fields.companyName !== undefined) updateData.companyName = fields.companyName;
      if (fields.commissionRate !== undefined) updateData.commissionRate = fields.commissionRate;
      if (fields.notes !== undefined) updateData.notes = fields.notes;
      if (fields.status !== undefined) updateData.status = fields.status;

      await db.update(partners).set(updateData).where(eq(partners.id, partnerId));
      return { success: true };
    }),

  // ── Admin: assign partner to a client account ──────────────────────────────
  adminAssignPartner: protectedProcedure
    .input(z.object({ clientAccountId: z.number().int(), partnerId: z.number().int().nullable() }))
    .mutation(async ({ ctx, input }) => {
      adminOnly(ctx);
      const { getDb } = await import("../db");
      const { clientAccounts } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db
        .update(clientAccounts)
        .set({ assignedPartnerId: input.partnerId })
        .where(eq(clientAccounts.id, input.clientAccountId));
      return { success: true };
    }),

  // ── Admin: get partner commission ledger ───────────────────────────────────
  adminGetPartnerCommissions: protectedProcedure
    .input(z.object({ partnerId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      adminOnly(ctx);
      const { getDb } = await import("../db");
      const { technicianCommissions, clientAccounts } = await import("../../drizzle/schema");
      const { eq, desc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const rows = await db
        .select({
          commission: technicianCommissions,
          businessName: clientAccounts.businessName,
          clientName: clientAccounts.clientName,
        })
        .from(technicianCommissions)
        .leftJoin(clientAccounts, eq(technicianCommissions.clientAccountId, clientAccounts.id))
        .where(eq(technicianCommissions.partnerId, input.partnerId))
        .orderBy(desc(technicianCommissions.createdAt));

      return rows;
    }),

  // ── Admin: get all partner commissions (for admin overview) ────────────────
  adminGetAllPartnerCommissions: protectedProcedure.query(async ({ ctx }) => {
    adminOnly(ctx);
    const { getDb } = await import("../db");
    const { technicianCommissions, partners, clientAccounts } = await import("../../drizzle/schema");
    const { eq, desc } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    return db
      .select({
        commission: technicianCommissions,
        partnerName: partners.name,
        partnerEmail: partners.email,
        clientBusiness: clientAccounts.businessName,
        clientName: clientAccounts.clientName,
      })
      .from(technicianCommissions)
      .leftJoin(partners, eq(technicianCommissions.partnerId, partners.id))
      .leftJoin(clientAccounts, eq(technicianCommissions.clientAccountId, clientAccounts.id))
      .where(eq(technicianCommissions.commissionType, "partner"))
      .orderBy(desc(technicianCommissions.createdAt));
  }),

  // ── Admin: mark partner commission as paid ─────────────────────────────────
  adminMarkPartnerCommissionPaid: protectedProcedure
    .input(z.object({ commissionId: z.number().int(), adminNotes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      adminOnly(ctx);
      const { getDb } = await import("../db");
      const { technicianCommissions } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db
        .update(technicianCommissions)
        .set({ status: "paid", paidAt: new Date(), adminNotes: input.adminNotes ?? null })
        .where(eq(technicianCommissions.id, input.commissionId));

      return { success: true };
    }),

  // ── Admin: apply chargeback (deducts from both rep and partner commissions) ─
  adminApplyChargeback: protectedProcedure
    .input(
      z.object({
        invoiceId: z.number().int(),
        chargebackAmountCents: z.number().int().positive(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      adminOnly(ctx);
      const { getDb } = await import("../db");
      const { technicianCommissions } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Find all commissions tied to this invoice
      const commissions = await db
        .select()
        .from(technicianCommissions)
        .where(eq(technicianCommissions.invoiceId, input.invoiceId));

      if (commissions.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No commissions found for this invoice." });
      }

      // For each commission, calculate the proportional chargeback deduction
      // The chargeback deduction = (commissionRate% of chargebackAmountCents)
      for (const comm of commissions) {
        const deduction = Math.round((comm.commissionRate / 100) * input.chargebackAmountCents);
        const newDeductionTotal = comm.chargebackDeductionCents + deduction;
        // Net commission cannot go below zero
        const newNet = Math.max(0, comm.commissionAmountCents - newDeductionTotal);
        const note = input.reason
          ? `Chargeback: ${input.reason}. Deducted $${(deduction / 100).toFixed(2)}.`
          : `Chargeback applied. Deducted $${(deduction / 100).toFixed(2)}.`;
        const existingNotes = comm.adminNotes ? `${comm.adminNotes}\n${note}` : note;

        await db
          .update(technicianCommissions)
          .set({
            chargebackDeductionCents: newDeductionTotal,
            netCommissionCents: newNet,
            adminNotes: existingNotes,
          })
          .where(eq(technicianCommissions.id, comm.id));
      }

      return { success: true, commissionsAffected: commissions.length };
    }),
});

// ─── Shared helper: create dual commissions on invoice payment ─────────────────
// Call this from clientBillingRouter whenever an invoice is marked as paid.
export async function createDualCommissions(
  db: Awaited<ReturnType<typeof import("../db").getDb>>,
  invoiceId: number,
  clientAccountId: number,
  invoiceAmountCents: number
) {
  if (!db) return;
  const { technicianCommissions, clientAccounts, technicians, partners } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  // Load the client account to find assigned rep and partner
  const [account] = await db
    .select()
    .from(clientAccounts)
    .where(eq(clientAccounts.id, clientAccountId))
    .limit(1);
  if (!account) return;

  const commissionsToInsert: {
    commissionType: "rep" | "partner";
    technicianId: number | null;
    partnerId: number | null;
    clientAccountId: number;
    invoiceId: number;
    commissionRate: number;
    invoiceAmountCents: number;
    commissionAmountCents: number;
    chargebackDeductionCents: number;
    netCommissionCents: number;
    status: "pending";
  }[] = [];

  // Rep commission (15% to assigned technician)
  if (account.assignedTechnicianId) {
    const [tech] = await db
      .select({ commissionRate: technicians.commissionRate })
      .from(technicians)
      .where(eq(technicians.id, account.assignedTechnicianId))
      .limit(1);
    if (tech) {
      const rate = tech.commissionRate;
      const amount = Math.round((rate / 100) * invoiceAmountCents);
      commissionsToInsert.push({
        commissionType: "rep",
        technicianId: account.assignedTechnicianId,
        partnerId: null,
        clientAccountId,
        invoiceId,
        commissionRate: rate,
        invoiceAmountCents,
        commissionAmountCents: amount,
        chargebackDeductionCents: 0,
        netCommissionCents: amount,
        status: "pending",
      });
    }
  }

  // Partner commission (15% to assigned partner)
  if (account.assignedPartnerId) {
    const [partner] = await db
      .select({ commissionRate: partners.commissionRate })
      .from(partners)
      .where(eq(partners.id, account.assignedPartnerId))
      .limit(1);
    if (partner) {
      const rate = partner.commissionRate;
      const amount = Math.round((rate / 100) * invoiceAmountCents);
      commissionsToInsert.push({
        commissionType: "partner",
        technicianId: null,
        partnerId: account.assignedPartnerId,
        clientAccountId,
        invoiceId,
        commissionRate: rate,
        invoiceAmountCents,
        commissionAmountCents: amount,
        chargebackDeductionCents: 0,
        netCommissionCents: amount,
        status: "pending",
      });
    }
  }

  if (commissionsToInsert.length > 0) {
    await db.insert(technicianCommissions).values(commissionsToInsert);
  }
}
