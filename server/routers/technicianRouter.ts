import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { notifyOwner } from "../_core/notification";

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

// Technician role tiers — higher index = more access
const TECH_ROLE_TIER: Record<string, number> = {
  sales_rep: 1,
  technician: 2,
  manager: 3,
  team_lead: 3, // Same tier as manager but no financial data (enforced in UI)
  admin: 4,
};

/** Require the logged-in technician to have at least the given role tier */
async function requireTechRole(
  ctx: { user: { openId: string } },
  minRole: "sales_rep" | "technician" | "manager" | "team_lead" | "admin"
) {
  const { getDb } = await import("../db");
  const { technicians } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  const rows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
  const tech = rows[0];
  if (!tech || tech.status !== "active") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Not an active team member." });
  }
  const tier = TECH_ROLE_TIER[tech.role ?? "sales_rep"] ?? 0;
  const required = TECH_ROLE_TIER[minRole] ?? 99;
  if (tier < required) {
    throw new TRPCError({ code: "FORBIDDEN", message: `Requires ${minRole} role or higher.` });
  }
  return tech;
}

// ─── router ───────────────────────────────────────────────────────────────────

export const technicianRouter = router({
  // ── Admin: invite a new technician ─────────────────────────────────────────
  adminInviteTechnician: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        commissionRate: z.number().int().min(1).max(100).default(15),
        notes: z.string().optional(),
        role: z.enum(["sales_rep", "technician", "manager", "team_lead", "admin"]).default("sales_rep"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      adminOnly(ctx);
      const { getDb } = await import("../db");
      const { technicians, technicianInvites } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if already invited
      const existing = await db
        .select()
        .from(technicians)
        .where(eq(technicians.email, input.email))
        .limit(1);
      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A technician with this email already exists.",
        });
      }

      // Create technician record
      const [result] = await db.insert(technicians).values({
        name: input.name,
        email: input.email,
        commissionRate: input.commissionRate,
        notes: input.notes ?? null,
        role: input.role,
        status: "invited",
      });
      const technicianId = (result as { insertId: number }).insertId;

      // Create invite token (expires in 7 days)
      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await db.insert(technicianInvites).values({
        technicianId,
        token,
        email: input.email,
        expiresAt,
      });

      // Send invite email via Resend
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const inviteUrl = `https://flow-sites.com/accept-tech-invite?token=${token}`;
        await resend.emails.send({
          from: process.env.EMAIL_FROM_ADDRESS ?? "hello@flow-sites.com",
          to: input.email,
          subject: "You've been invited to FlowSites CRM",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
              <h2 style="color: #111; margin-bottom: 8px;">Welcome to FlowSites, ${input.name}!</h2>
              <p style="color: #555; line-height: 1.6;">
                You've been invited to join the FlowSites team as a sales representative.
                You'll earn a <strong>${input.commissionRate}% commission</strong> on the first payment of every client you bring in.
              </p>
              <p style="color: #555; line-height: 1.6;">Click the button below to accept your invite and set up your account:</p>
              <a href="${inviteUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
                Accept Invite
              </a>
              <p style="color: #999; font-size: 13px; margin-top: 24px;">
                This invite link expires in 7 days.
              </p>
            </div>
          `,
        });
      } catch (err) {
        console.error("[technicianRouter] Failed to send invite email:", err);
      }

      await notifyOwner({
        title: "New Technician Invited",
        content: `${input.name} (${input.email}) has been invited as a sales rep with ${input.commissionRate}% commission.`,
      });

      return { success: true, technicianId, token };
    }),

  // ── Accept invite ──────────────────────────────────────────────────────────
  acceptTechnicianInvite: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { technicians, technicianInvites } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const inviteRows = await db
        .select()
        .from(technicianInvites)
        .where(eq(technicianInvites.token, input.token))
        .limit(1);
      const invite = inviteRows[0];
      if (!invite) throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found." });
      if (invite.usedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "This invite has already been used." });
      if (new Date(invite.expiresAt) < new Date()) throw new TRPCError({ code: "BAD_REQUEST", message: "This invite has expired." });

      await db
        .update(technicians)
        .set({ openId: ctx.user.openId, userId: ctx.user.id, status: "active", joinedAt: new Date() })
        .where(eq(technicians.id, invite.technicianId));

      await db
        .update(technicianInvites)
        .set({ usedAt: new Date() })
        .where(eq(technicianInvites.id, invite.id));

      return { success: true };
    }),

  // ── Technician: get own profile ────────────────────────────────────────────
  getMyTechnicianProfile: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { technicians } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const rows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
    return rows[0] ?? null;
  }),

  // ── Technician: get own clients ────────────────────────────────────────────
  getMyClients: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { technicians, clientAccounts } = await import("../../drizzle/schema");
    const { eq, desc } = await import("drizzle-orm");
    const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const techRows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
    const tech = techRows[0];
    if (!tech) throw new TRPCError({ code: "FORBIDDEN", message: "Not a technician." });

    return db.select().from(clientAccounts).where(eq(clientAccounts.assignedTechnicianId, tech.id)).orderBy(desc(clientAccounts.createdAt));
  }),

  // ── Technician: get own commissions ───────────────────────────────────────
  getMyCommissions: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { technicians, technicianCommissions, clientAccounts } = await import("../../drizzle/schema");
    const { eq, desc } = await import("drizzle-orm");
    const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const techRows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
    const tech = techRows[0];
    if (!tech) throw new TRPCError({ code: "FORBIDDEN", message: "Not a technician." });

    const commissions = await db
      .select({
        commission: technicianCommissions,
        businessName: clientAccounts.businessName,
        clientName: clientAccounts.clientName,
      })
      .from(technicianCommissions)
      .leftJoin(clientAccounts, eq(technicianCommissions.clientAccountId, clientAccounts.id))
      .where(eq(technicianCommissions.technicianId, tech.id))
      .orderBy(desc(technicianCommissions.createdAt));

    const total = commissions.reduce((s, r) => s + r.commission.commissionAmountCents, 0);
    const pending = commissions.filter((r) => r.commission.status === "pending").reduce((s, r) => s + r.commission.commissionAmountCents, 0);
    const paid = commissions.filter((r) => r.commission.status === "paid").reduce((s, r) => s + r.commission.commissionAmountCents, 0);

    return { commissions, total, pending, paid };
  }),

  // ── Admin: list all technicians ────────────────────────────────────────────
  adminGetTechnicians: protectedProcedure.query(async ({ ctx }) => {
    adminOnly(ctx);
    const { getDb } = await import("../db");
    const { technicians, technicianCommissions, clientAccounts } = await import("../../drizzle/schema");
    const { eq, desc, sql } = await import("drizzle-orm");
    const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const techs = await db.select().from(technicians).orderBy(desc(technicians.createdAt));

    const result = await Promise.all(
      techs.map(async (tech) => {
        const commRows = await db.select().from(technicianCommissions).where(eq(technicianCommissions.technicianId, tech.id));
        const totalEarned = commRows.reduce((s, r) => s + r.commissionAmountCents, 0);
        const totalPending = commRows.filter((r) => r.status === "pending").reduce((s, r) => s + r.commissionAmountCents, 0);
        const totalPaid = commRows.filter((r) => r.status === "paid").reduce((s, r) => s + r.commissionAmountCents, 0);
        const clientCount = await db.select({ count: sql<number>`count(*)` }).from(clientAccounts).where(eq(clientAccounts.assignedTechnicianId, tech.id));
        return { ...tech, totalEarned, totalPending, totalPaid, clientCount: Number(clientCount[0]?.count ?? 0) };
      })
    );

    return result;
  }),

  // ── Admin: get all commissions ─────────────────────────────────────────────
  adminGetCommissions: protectedProcedure.query(async ({ ctx }) => {
    adminOnly(ctx);
    const { getDb } = await import("../db");
    const { technicians, technicianCommissions, clientAccounts } = await import("../../drizzle/schema");
    const { eq, desc } = await import("drizzle-orm");
    const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    return db
      .select({
        commission: technicianCommissions,
        techName: technicians.name,
        techEmail: technicians.email,
        clientBusiness: clientAccounts.businessName,
        clientName: clientAccounts.clientName,
      })
      .from(technicianCommissions)
      .leftJoin(technicians, eq(technicianCommissions.technicianId, technicians.id))
      .leftJoin(clientAccounts, eq(technicianCommissions.clientAccountId, clientAccounts.id))
      .orderBy(desc(technicianCommissions.createdAt));
  }),

  // ── Admin: mark commission as paid ────────────────────────────────────────
  adminMarkCommissionPaid: protectedProcedure
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

  // ── Admin: assign technician to a client ──────────────────────────────────
  adminAssignTechnician: protectedProcedure
    .input(z.object({ clientAccountId: z.number().int(), technicianId: z.number().int().nullable() }))
    .mutation(async ({ ctx, input }) => {
      adminOnly(ctx);
      const { getDb } = await import("../db");
      const { clientAccounts } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.update(clientAccounts).set({ assignedTechnicianId: input.technicianId }).where(eq(clientAccounts.id, input.clientAccountId));
      return { success: true };
    }),

  // ── Admin: resend invite ───────────────────────────────────────────────────
  adminResendInvite: protectedProcedure
    .input(z.object({ technicianId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      adminOnly(ctx);
      const { getDb } = await import("../db");
      const { technicians, technicianInvites } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const techRows = await db.select().from(technicians).where(eq(technicians.id, input.technicianId)).limit(1);
      const tech = techRows[0];
      if (!tech) throw new TRPCError({ code: "NOT_FOUND", message: "Technician not found." });

      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await db.insert(technicianInvites).values({ technicianId: tech.id, token, email: tech.email, expiresAt });

      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const inviteUrl = `https://flow-sites.com/accept-tech-invite?token=${token}`;
        await resend.emails.send({
          from: process.env.EMAIL_FROM_ADDRESS ?? "hello@flow-sites.com",
          to: tech.email,
          subject: "Your FlowSites CRM invite (resent)",
          html: `<div style="font-family: sans-serif; padding: 32px;"><h2>Hi ${tech.name},</h2><p>Here's your updated invite link:</p><a href="${inviteUrl}" style="display:inline-block;background:#dc2626;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Accept Invite</a><p style="color:#999;font-size:13px;margin-top:24px;">Expires in 7 days.</p></div>`,
        });
      } catch (err) {
        console.error("[technicianRouter] Failed to resend invite:", err);
      }

      return { success: true, token };
    }),

  // ── Rep: create a client account with recurring plan ──────────────────────
  repCreateClient: protectedProcedure
    .input(
      z.object({
        clientName: z.string().min(1),
        clientEmail: z.string().email(),
        clientPhone: z.string().optional(),
        businessName: z.string().min(1),
        websiteUrl: z.string().optional(),
        monthlyPriceDollars: z.number().positive(),
        billingStartDate: z.string().optional(), // YYYY-MM-DD
        planName: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { technicians, clientAccounts, clientInvoices } = await import("../../drizzle/schema");
      const { eq, count } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify caller is an active technician
      const techRows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
      const tech = techRows[0];
      if (!tech || tech.status !== "active") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only active sales reps can create client accounts." });
      }

      const crypto = await import("crypto");
      const inviteToken = crypto.randomBytes(32).toString("hex");
      const monthlyPriceCents = Math.round(input.monthlyPriceDollars * 100);

      const [result] = await db.insert(clientAccounts).values({
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone ?? null,
        businessName: input.businessName,
        websiteUrl: input.websiteUrl ?? null,
        monthlyPriceCents,
        billingStartDate: input.billingStartDate ?? null,
        adminNotes: input.notes ? `[Rep: ${tech.name}] ${input.notes}` : `Created by rep: ${tech.name}`,
        inviteToken,
        status: "active",
        assignedTechnicianId: tech.id,
      });

      const newId = (result as any).insertId as number;

      // Auto-generate first invoice
      let shareToken: string | null = null;
      let invoiceNumber: string | null = null;
      try {
        const billingStart = input.billingStartDate
          ? new Date(input.billingStartDate + "T12:00:00Z")
          : new Date();
        const priorMonthStart = new Date(Date.UTC(billingStart.getUTCFullYear(), billingStart.getUTCMonth() - 1, 1));
        const priorMonthEnd = new Date(Date.UTC(billingStart.getUTCFullYear(), billingStart.getUTCMonth(), 0));
        const periodStart = priorMonthStart.toISOString().slice(0, 10);
        const periodEnd = priorMonthEnd.toISOString().slice(0, 10);
        const dueDate = billingStart.toISOString().slice(0, 10);

        const [{ value: invoiceCount }] = await db.select({ value: count() }).from(clientInvoices);
        invoiceNumber = `INV-${new Date().getFullYear()}-${String(Number(invoiceCount) + 1).padStart(4, "0")}`;
        shareToken = crypto.randomBytes(32).toString("hex");

        await db.insert(clientInvoices).values({
          clientAccountId: newId,
          invoiceNumber,
          periodStart,
          periodEnd,
          dueDate,
          baseAmountCents: monthlyPriceCents,
          discountCents: 0,
          lateFeeCents: 0,
          totalAmountCents: monthlyPriceCents,
          discountType: "none",
          status: "open",
          shareToken,
          isRecurring: 1,
        });
      } catch (err) {
        console.error("[repCreateClient] Failed to auto-create first invoice:", err);
      }

      return {
        success: true,
        clientAccountId: newId,
        inviteToken,
        shareToken,
        invoiceNumber,
        invoiceUrl: shareToken ? `https://flow-sites.com/invoice/${shareToken}` : null,
        portalUrl: `https://flow-sites.com/accept-invite?token=${inviteToken}`,
      };
    }),

  // ── Rep: send welcome email to client ────────────────────────────────────
  repSendWelcomeEmail: protectedProcedure
    .input(
      z.object({
        clientAccountId: z.number().int(),
        invoiceUrl: z.string().optional(),
        portalUrl: z.string(),
        customMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { technicians, clientAccounts } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const techRows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
      const tech = techRows[0];
      if (!tech || tech.status !== "active") throw new TRPCError({ code: "FORBIDDEN" });

      const [account] = await db
        .select()
        .from(clientAccounts)
        .where(eq(clientAccounts.id, input.clientAccountId))
        .limit(1);
      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "Client account not found" });
      if (account.assignedTechnicianId !== tech.id) throw new TRPCError({ code: "FORBIDDEN", message: "Not your client" });

      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const monthlyAmount = `$${(account.monthlyPriceCents / 100).toFixed(2)}`;

      await resend.emails.send({
        from: process.env.EMAIL_FROM_ADDRESS ?? "hello@flow-sites.com",
        to: account.clientEmail,
        subject: `Welcome to FlowSites — Your Website is Ready, ${account.clientName}!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fff;">
            <img src="https://flow-sites.com/logo.png" alt="FlowSites" style="height: 48px; margin-bottom: 24px;" />
            <h2 style="color: #111; margin-bottom: 8px;">Welcome to FlowSites, ${account.clientName}!</h2>
            <p style="color: #555; line-height: 1.6;">
              Hi ${account.clientName}, your website management account for <strong>${account.businessName}</strong> has been set up.
              Your monthly plan is <strong>${monthlyAmount}/month</strong>.
            </p>
            ${input.customMessage ? `<p style="color: #555; line-height: 1.6; background: #f9f9f9; padding: 16px; border-radius: 8px; border-left: 4px solid #dc2626;">${input.customMessage}</p>` : ""}
            <div style="margin: 24px 0;">
              ${input.invoiceUrl ? `
              <p style="color: #555; line-height: 1.6;"><strong>Step 1: Pay Your First Invoice</strong></p>
              <a href="${input.invoiceUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 16px;">
                View &amp; Pay Invoice
              </a>
              ` : ""}
              <p style="color: #555; line-height: 1.6;"><strong>Step 2: Access Your Client Portal</strong></p>
              <a href="${input.portalUrl}" style="display: inline-block; background: #111; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Set Up Your Account
              </a>
            </div>
            <p style="color: #999; font-size: 13px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
              Questions? Reply to this email or call us at (281) 818-9288.<br/>
              &copy; ${new Date().getFullYear()} FlowSites Agency &bull; <a href="https://flow-sites.com" style="color: #dc2626;">flow-sites.com</a>
            </p>
          </div>
        `,
      });

      return { success: true };
    }),

  // ── Rep: send welcome SMS to client ──────────────────────────────────────
  repSendWelcomeSMS: protectedProcedure
    .input(
      z.object({
        clientAccountId: z.number().int(),
        invoiceUrl: z.string().optional(),
        portalUrl: z.string(),
        customMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { technicians, clientAccounts } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const techRows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
      const tech = techRows[0];
      if (!tech || tech.status !== "active") throw new TRPCError({ code: "FORBIDDEN" });

      const [account] = await db
        .select()
        .from(clientAccounts)
        .where(eq(clientAccounts.id, input.clientAccountId))
        .limit(1);
      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "Client account not found" });
      if (account.assignedTechnicianId !== tech.id) throw new TRPCError({ code: "FORBIDDEN", message: "Not your client" });

      if (!account.clientPhone) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Client has no phone number on file." });
      }

      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioFrom = process.env.TWILIO_FROM_NUMBER;

      if (!twilioAccountSid || !twilioAuthToken || !twilioFrom) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "SMS is not configured. Please add Twilio credentials in Settings." });
      }

      const monthlyAmount = `$${(account.monthlyPriceCents / 100).toFixed(2)}`;
      let smsBody = `Hi ${account.clientName}! Welcome to FlowSites. Your ${account.businessName} website plan (${monthlyAmount}/mo) is ready.`;
      if (input.invoiceUrl) smsBody += `\nPay your first invoice: ${input.invoiceUrl}`;
      smsBody += `\nSet up your portal: ${input.portalUrl}`;
      if (input.customMessage) smsBody += `\n${input.customMessage}`;
      smsBody += `\n- FlowSites (281) 818-9288`;

      // Normalize phone number to E.164
      let toPhone = account.clientPhone.replace(/\D/g, "");
      if (toPhone.length === 10) toPhone = "+1" + toPhone;
      else if (!toPhone.startsWith("+")) toPhone = "+" + toPhone;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
      const body = new URLSearchParams({
        To: toPhone,
        From: twilioFrom,
        Body: smsBody,
      });

      const response = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("[repSendWelcomeSMS] Twilio error:", errText);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send SMS. Check Twilio credentials." });
      }

      return { success: true };
    }),

  // ── Admin: deactivate technician ──────────────────────────────────────────
  adminDeactivateTechnician: protectedProcedure
    .input(z.object({ technicianId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      adminOnly(ctx);
      const { getDb } = await import("../db");
      const { technicians } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.update(technicians).set({ status: "inactive" }).where(eq(technicians.id, input.technicianId));
      return { success: true };
    }),

  // ── Get own technician role (for UI gating) ─────────────────────────────
  getMyRole: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { technicians } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
    const tech = rows[0];
    if (!tech || tech.status !== "active") return null;
    return { role: tech.role, name: tech.name, id: tech.id };
  }),

  // ── Admin: update technician role ────────────────────────────────────────
  adminUpdateTechnicianRole: protectedProcedure
    .input(z.object({
      technicianId: z.number().int(),
      role: z.enum(["sales_rep", "technician", "manager", "team_lead", "admin"]),
    }))
    .mutation(async ({ ctx, input }) => {
      adminOnly(ctx);
      const { getDb } = await import("../db");
      const { technicians } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.update(technicians).set({ role: input.role }).where(eq(technicians.id, input.technicianId));
      return { success: true };
    }),

  // ── Rep: get own profile ────────────────────────────────────────────────────
  repGetProfile: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { technicians } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const rows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
    if (!rows[0]) return null;
    return rows[0];
  }),

  // ── Rep: get own clients ──────────────────────────────────────────────────
  repGetMyClients: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { technicians, clientAccounts, clientInvoices } = await import("../../drizzle/schema");
    const { eq, count } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const techRows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
    const tech = techRows[0];
    if (!tech || tech.status !== "active") return [];

    const clients = await db
      .select()
      .from(clientAccounts)
      .where(eq(clientAccounts.assignedTechnicianId, tech.id));

    // Attach latest invoice info for each client
    const result = await Promise.all(
      clients.map(async (client) => {
        const invoices = await db
          .select()
          .from(clientInvoices)
          .where(eq(clientInvoices.clientAccountId, client.id))
          .orderBy(clientInvoices.createdAt);
        const latestInvoice = invoices[invoices.length - 1] ?? null;
        return {
          ...client,
          latestInvoice,
          invoiceCount: invoices.length,
        };
      })
    );

    return result;
  }),

  // ── Rep: get own commissions ───────────────────────────────────────────────
  repGetMyCommissions: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { technicians, technicianCommissions, clientAccounts } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const techRows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
    const tech = techRows[0];
    if (!tech) return { commissions: [], totalPendingCents: 0, totalPaidCents: 0 };

    const commissions = await db
      .select()
      .from(technicianCommissions)
      .where(eq(technicianCommissions.technicianId, tech.id))
      .orderBy(technicianCommissions.createdAt);

    const totalPendingCents = commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.commissionAmountCents, 0);
    const totalPaidCents = commissions
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + c.commissionAmountCents, 0);

    // Attach client name
    const enriched = await Promise.all(
      commissions.map(async (comm) => {
        const [account] = await db
          .select({ clientName: clientAccounts.clientName, businessName: clientAccounts.businessName })
          .from(clientAccounts)
          .where(eq(clientAccounts.id, comm.clientAccountId))
          .limit(1);
        return {
          ...comm,
          clientName: account?.clientName ?? "Unknown",
          businessName: account?.businessName ?? "",
        };
      })
    );

    return { commissions: enriched, totalPendingCents, totalPaidCents };
  }),

  /** Rep: get all their assigned clients that have a project (for messaging) */
  repGetClientsForMessaging: protectedProcedure.query(async ({ ctx }) => {
    const tech = await requireTechRole(ctx, "sales_rep");
    const { getDb } = await import("../db");
    const { clientAccounts, clientProjects, projectMessages } = await import("../../drizzle/schema");
    const { eq, and, desc, sql } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const clients = await db
      .select({
        accountId: clientAccounts.id,
        clientName: clientAccounts.clientName,
        businessName: clientAccounts.businessName,
        projectId: clientProjects.id,
      })
      .from(clientAccounts)
      .innerJoin(clientProjects, eq(clientProjects.clientEmail, clientAccounts.clientEmail))
      .where(eq(clientAccounts.assignedTechnicianId, tech.id));
    const enriched = await Promise.all(clients.map(async (c) => {
      const [unreadRow] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(projectMessages)
        .where(and(
          eq(projectMessages.projectId, c.projectId),
          eq(projectMessages.senderRole, "client"),
          eq(projectMessages.isRead, 0)
        ));
      const [lastMsgRow] = await db
        .select({ message: projectMessages.message, createdAt: projectMessages.createdAt, senderRole: projectMessages.senderRole })
        .from(projectMessages)
        .where(eq(projectMessages.projectId, c.projectId))
        .orderBy(desc(projectMessages.createdAt))
        .limit(1);
      return {
        ...c,
        unreadCount: Number(unreadRow?.count ?? 0),
        lastMessage: lastMsgRow?.message ?? null,
        lastMessageAt: lastMsgRow?.createdAt ?? null,
        lastMessageRole: lastMsgRow?.senderRole ?? null,
      };
    }));
    return enriched;
  }),

  /** Rep: get all messages for a specific client project */
  repGetMessages: protectedProcedure
    .input(z.object({ projectId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const tech = await requireTechRole(ctx, "sales_rep");
      const { getDb } = await import("../db");
      const { projectMessages, clientAccounts, clientProjects } = await import("../../drizzle/schema");
      const { eq, and, asc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const [project] = await db
        .select()
        .from(clientProjects)
        .innerJoin(clientAccounts, eq(clientAccounts.clientEmail, clientProjects.clientEmail))
        .where(and(eq(clientProjects.id, input.projectId), eq(clientAccounts.assignedTechnicianId, tech.id)))
        .limit(1);
      if (!project) throw new TRPCError({ code: "FORBIDDEN", message: "Project not found or not assigned to you" });
      await db
        .update(projectMessages)
        .set({ isRead: 1 })
        .where(and(eq(projectMessages.projectId, input.projectId), eq(projectMessages.senderRole, "client")));
      return db
        .select()
        .from(projectMessages)
        .where(eq(projectMessages.projectId, input.projectId))
        .orderBy(asc(projectMessages.createdAt));
    }),

  /** Rep: send a message to a client */
  repSendMessage: protectedProcedure
    .input(z.object({ projectId: z.number().int(), message: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const tech = await requireTechRole(ctx, "sales_rep");
      const { getDb } = await import("../db");
      const { projectMessages, clientAccounts, clientProjects } = await import("../../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const [project] = await db
        .select()
        .from(clientProjects)
        .innerJoin(clientAccounts, eq(clientAccounts.clientEmail, clientProjects.clientEmail))
        .where(and(eq(clientProjects.id, input.projectId), eq(clientAccounts.assignedTechnicianId, tech.id)))
        .limit(1);
      if (!project) throw new TRPCError({ code: "FORBIDDEN", message: "Project not found or not assigned to you" });
      await db.insert(projectMessages).values({
        projectId: input.projectId,
        senderRole: "staff",
        senderName: tech.name,
        message: input.message,
        isRead: 0,
      });
      return { success: true };
    }),
});
