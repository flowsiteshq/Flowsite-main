import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { ENV } from "../_core/env";

/** Owner always has admin access regardless of the role column in the DB. */
async function requireAdmin(ctx: { user: { role: string; openId: string } | null }): Promise<void> {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  // 1. Manus OAuth owner/admin user
  if (ctx.user.role === "admin" || ctx.user.openId === ENV.ownerOpenId) return;
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
  throw new TRPCError({ code: "FORBIDDEN" });
}

/**
 * Client Billing & Media Router
 * Handles client accounts, invoices, media uploads, and admin management.
 */
export const clientBillingRouter = router({

  // ─── CLIENT: Get my account ──────────────────────────────────────────────────
  getMyAccount: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { clientAccounts } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const [account] = await db
      .select()
      .from(clientAccounts)
      .where(eq(clientAccounts.clientOpenId, ctx.user.openId))
      .limit(1);

    return account ?? null;
  }),

  // ─── CLIENT: Get my invoices ─────────────────────────────────────────────────
  getMyInvoices: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { clientAccounts, clientInvoices } = await import("../../drizzle/schema");
    const { eq, desc } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const [account] = await db
      .select()
      .from(clientAccounts)
      .where(eq(clientAccounts.clientOpenId, ctx.user.openId))
      .limit(1);

    if (!account) return [];

    return await db
      .select()
      .from(clientInvoices)
      .where(eq(clientInvoices.clientAccountId, account.id))
      .orderBy(desc(clientInvoices.createdAt));
  }),

  // ─── CLIENT: Get my media ────────────────────────────────────────────────────
  getMyMedia: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { clientAccounts, clientMedia } = await import("../../drizzle/schema");
    const { eq, desc } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const [account] = await db
      .select()
      .from(clientAccounts)
      .where(eq(clientAccounts.clientOpenId, ctx.user.openId))
      .limit(1);

    if (!account) return [];

    return await db
      .select()
      .from(clientMedia)
      .where(eq(clientMedia.clientAccountId, account.id))
      .orderBy(desc(clientMedia.createdAt));
  }),

  // ─── CLIENT: Delete my media file ────────────────────────────────────────────
  deleteMyMedia: protectedProcedure
    .input(z.object({ mediaId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { clientAccounts, clientMedia } = await import("../../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [account] = await db
        .select()
        .from(clientAccounts)
        .where(eq(clientAccounts.clientOpenId, ctx.user.openId))
        .limit(1);

      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });

      await db
        .delete(clientMedia)
        .where(and(eq(clientMedia.id, input.mediaId), eq(clientMedia.clientAccountId, account.id)));

      return { success: true };
    }),

  // ─── CLIENT: Upload media (get presigned URL) ─────────────────────────────────
  getUploadUrl: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      mimeType: z.string(),
      fileSizeBytes: z.number(),
      mediaType: z.enum(["photo", "video"]),
      caption: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { clientAccounts, clientMedia } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const { storagePut } = await import("../storage");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [account] = await db
        .select()
        .from(clientAccounts)
        .where(eq(clientAccounts.clientOpenId, ctx.user.openId))
        .limit(1);

      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "Account not found. Please contact support." });

      // Max file size: 100MB for video, 20MB for photos
      const maxBytes = input.mediaType === "video" ? 100 * 1024 * 1024 : 20 * 1024 * 1024;
      if (input.fileSizeBytes > maxBytes) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `File too large. Max size: ${input.mediaType === "video" ? "100MB" : "20MB"}` });
      }

      const suffix = crypto.randomBytes(8).toString("hex");
      const ext = input.fileName.split(".").pop() ?? "bin";
      const fileKey = `client-media/${account.id}/${suffix}.${ext}`;

      // Return the key and account ID so the client can upload directly
      // The actual upload happens client-side via a separate endpoint
      const [inserted] = await db
        .insert(clientMedia)
        .values({
          clientAccountId: account.id,
          fileKey,
          fileUrl: "", // will be updated after upload
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSizeBytes: input.fileSizeBytes,
          mediaType: input.mediaType,
          caption: input.caption ?? null,
          uploadedBy: "client",
        });

      const newId = (inserted as any).insertId as number;

      return { mediaId: newId, fileKey, accountId: account.id };
    }),

  // ─── CLIENT: Confirm upload and save URL ──────────────────────────────────────
  confirmUpload: protectedProcedure
    .input(z.object({ mediaId: z.number(), fileUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { clientAccounts, clientMedia } = await import("../../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [account] = await db
        .select()
        .from(clientAccounts)
        .where(eq(clientAccounts.clientOpenId, ctx.user.openId))
        .limit(1);

      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });

      await db
        .update(clientMedia)
        .set({ fileUrl: input.fileUrl })
        .where(and(eq(clientMedia.id, input.mediaId), eq(clientMedia.clientAccountId, account.id)));

      return { success: true };
    }),

  // ─── CLIENT: Accept invite and link account ───────────────────────────────────
  acceptInvite: protectedProcedure
    .input(z.object({ inviteToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { clientAccounts } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [account] = await db
        .select()
        .from(clientAccounts)
        .where(eq(clientAccounts.inviteToken, input.inviteToken))
        .limit(1);

      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired invite link." });
      if (account.inviteAccepted) throw new TRPCError({ code: "BAD_REQUEST", message: "This invite has already been used." });

      await db
        .update(clientAccounts)
        .set({ clientOpenId: ctx.user.openId, inviteAccepted: 1 })
        .where(eq(clientAccounts.id, account.id));

      return { success: true, businessName: account.businessName };
    }),

  // ─── CLIENT: Create Stripe checkout for invoice ───────────────────────────────
  createInvoiceCheckout: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { clientAccounts, clientInvoices } = await import("../../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [account] = await db
        .select()
        .from(clientAccounts)
        .where(eq(clientAccounts.clientOpenId, ctx.user.openId))
        .limit(1);
      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });

      const [invoice] = await db
        .select()
        .from(clientInvoices)
        .where(and(eq(clientInvoices.id, input.invoiceId), eq(clientInvoices.clientAccountId, account.id)))
        .limit(1);
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      if (invoice.status === "paid") throw new TRPCError({ code: "BAD_REQUEST", message: "Invoice already paid" });

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(ENV.stripeSecretKey, { apiVersion: "2026-02-25.clover" });

      const origin = ctx.req.headers.origin as string ?? "https://flow-sites.com";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: account.clientEmail,
        line_items: [{
          price_data: {
            currency: "usd",
            unit_amount: invoice.totalAmountCents,
            product_data: {
              name: `FlowSites Invoice ${invoice.invoiceNumber}`,
              description: `${account.businessName} — ${invoice.periodStart} to ${invoice.periodEnd}`,
            },
          },
          quantity: 1,
        }],
        allow_promotion_codes: false,
        client_reference_id: String(account.id),
        metadata: {
          invoiceId: String(invoice.id),
          clientAccountId: String(account.id),
          invoiceNumber: invoice.invoiceNumber,
        },
        success_url: `${origin}/client-billing?payment=success&invoice=${invoice.invoiceNumber}`,
        cancel_url: `${origin}/client-billing`,
      });

      return { checkoutUrl: session.url };
    }),

  // ─── ADMIN: List all client accounts ─────────────────────────────────────────
  adminListAccounts: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx);
    const { getDb } = await import("../db");
    const { clientAccounts } = await import("../../drizzle/schema");
    const { desc } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(clientAccounts).orderBy(desc(clientAccounts.createdAt));
  }),

  // ─── ADMIN: Get single account with invoices and media ────────────────────────
  adminGetAccount: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { clientAccounts, clientInvoices, clientMedia } = await import("../../drizzle/schema");
      const { eq, desc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [account] = await db.select().from(clientAccounts).where(eq(clientAccounts.id, input.accountId)).limit(1);
      if (!account) throw new TRPCError({ code: "NOT_FOUND" });

      const invoices = await db.select().from(clientInvoices).where(eq(clientInvoices.clientAccountId, input.accountId)).orderBy(desc(clientInvoices.createdAt));
      const media = await db.select().from(clientMedia).where(eq(clientMedia.clientAccountId, input.accountId)).orderBy(desc(clientMedia.createdAt));

      return { account, invoices, media };
    }),

  // ─── ADMIN: Create client account ────────────────────────────────────────────
  adminCreateAccount: protectedProcedure
    .input(z.object({
      clientName: z.string(),
      clientEmail: z.string().email(),
      clientPhone: z.string().optional(),
      businessName: z.string(),
      websiteUrl: z.string().optional(),
      monthlyPriceCents: z.number(),
      billingStartDate: z.string().optional(),
      adminNotes: z.string().optional(),
      assignedTechnicianId: z.number().int().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { clientAccounts, clientInvoices } = await import("../../drizzle/schema");
      const { count } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const inviteToken = crypto.randomBytes(32).toString("hex");

      const [result] = await db.insert(clientAccounts).values({
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone ?? null,
        businessName: input.businessName,
        websiteUrl: input.websiteUrl ?? null,
        monthlyPriceCents: input.monthlyPriceCents,
        billingStartDate: input.billingStartDate ?? null,
        adminNotes: input.adminNotes ?? null,
        inviteToken,
        status: "active",
        assignedTechnicianId: input.assignedTechnicianId ?? null,
      });

      const newId = (result as any).insertId as number;

      // ── Auto-generate first invoice ──────────────────────────────────────────
      try {
        // Invoice covers the month PRIOR to billing start date.
        // e.g. billing starts May 1 → first invoice covers Apr 1–30, due May 1
        const billingStart = input.billingStartDate
          ? new Date(input.billingStartDate + "T12:00:00Z")
          : new Date();
        // Period = month before billing start
        const priorMonthStart = new Date(Date.UTC(billingStart.getUTCFullYear(), billingStart.getUTCMonth() - 1, 1));
        const priorMonthEnd = new Date(Date.UTC(billingStart.getUTCFullYear(), billingStart.getUTCMonth(), 0));
        const periodStart = priorMonthStart.toISOString().slice(0, 10);
        const periodEnd = priorMonthEnd.toISOString().slice(0, 10);
        // Due date = billing start date itself
        const dueDate = billingStart.toISOString().slice(0, 10);

        const [{ value: invoiceCount }] = await db.select({ value: count() }).from(clientInvoices);
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Number(invoiceCount) + 1).padStart(4, "0")}`;
        const shareToken = crypto.randomBytes(32).toString("hex");

        await db.insert(clientInvoices).values({
          clientAccountId: newId,
          invoiceNumber,
          periodStart,
          periodEnd,
          dueDate,
          baseAmountCents: input.monthlyPriceCents,
          discountCents: 0,
          lateFeeCents: 0,
          totalAmountCents: input.monthlyPriceCents,
          discountType: "none",
          status: "open",
          shareToken,
        });
      } catch (invoiceErr) {
        // Non-fatal: account was created, invoice creation failed
        console.error("[adminCreateAccount] Failed to auto-create first invoice:", invoiceErr);
      }

      return { id: newId, inviteToken };
    }),

  // ─── ADMIN: Update client account ────────────────────────────────────────────
  adminUpdateAccount: protectedProcedure
    .input(z.object({
      accountId: z.number(),
      status: z.enum(["active", "paused", "cancelled", "past_due"]).optional(),
      monthlyPriceCents: z.number().optional(),
      billingCycle: z.enum(["monthly", "annual"]).optional(),
      adminNotes: z.string().optional(),
      websiteUrl: z.string().optional(),
      assignedTechnicianId: z.number().int().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { clientAccounts } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const updates: Record<string, any> = {};
      if (input.status !== undefined) updates.status = input.status;
      if (input.monthlyPriceCents !== undefined) updates.monthlyPriceCents = input.monthlyPriceCents;
      if (input.billingCycle !== undefined) updates.billingCycle = input.billingCycle;
      if (input.adminNotes !== undefined) updates.adminNotes = input.adminNotes;
      if (input.websiteUrl !== undefined) updates.websiteUrl = input.websiteUrl;
      if (input.assignedTechnicianId !== undefined) updates.assignedTechnicianId = input.assignedTechnicianId;

      await db.update(clientAccounts).set(updates).where(eq(clientAccounts.id, input.accountId));
      return { success: true };
    }),

  // ─── ADMIN: Create invoice for a client ──────────────────────────────────────
  adminCreateInvoice: protectedProcedure
    .input(z.object({
      clientAccountId: z.number(),
      periodStart: z.string(),
      periodEnd: z.string(),
      dueDate: z.string(),
      discountType: z.enum(["early_pay", "annual", "none"]).default("none"),
      notes: z.string().optional(),
      /** Line items — if provided, total is calculated from items sum. */
      items: z.array(z.object({
        description: z.string().min(1).max(255),
        quantity: z.number().int().min(1).default(1),
        unitAmountCents: z.number().int().min(0),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { clientAccounts, clientInvoices, invoiceItems } = await import("../../drizzle/schema");
      const { eq, count } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [account] = await db.select().from(clientAccounts).where(eq(clientAccounts.id, input.clientAccountId)).limit(1);
      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "Client account not found" });

      // Calculate amounts — if items provided, sum them; otherwise fall back to monthly price
      let base: number;
      let discountCents = 0;
      if (input.items && input.items.length > 0) {
        base = input.items.reduce((sum, item) => sum + item.quantity * item.unitAmountCents, 0);
      } else {
        base = account.monthlyPriceCents;
      }
      if (input.discountType === "early_pay") {
        discountCents = Math.round(base * account.earlyPayDiscountPct / 100);
      } else if (input.discountType === "annual") {
        discountCents = Math.round(base * account.annualDiscountPct / 100);
      }
      const total = base - discountCents;

      // Generate invoice number
      const [{ value: invoiceCount }] = await db.select({ value: count() }).from(clientInvoices);
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Number(invoiceCount) + 1).padStart(4, "0")}`;

      const shareToken = crypto.randomBytes(32).toString("hex");
      const [result] = await db.insert(clientInvoices).values({
        clientAccountId: input.clientAccountId,
        invoiceNumber,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        dueDate: input.dueDate,
        baseAmountCents: base,
        discountCents,
        lateFeeCents: 0,
        totalAmountCents: total,
        discountType: input.discountType,
        notes: input.notes ?? null,
        status: "open",
        shareToken,
      });
      const invoiceId = (result as any).insertId as number;

      // Insert line items if provided
      if (input.items && input.items.length > 0) {
        await db.insert(invoiceItems).values(
          input.items.map((item, idx) => ({
            invoiceId,
            description: item.description,
            quantity: item.quantity,
            unitAmountCents: item.unitAmountCents,
            amountCents: item.quantity * item.unitAmountCents,
            sortOrder: idx,
          }))
        );
      }

      return { id: invoiceId, invoiceNumber, shareToken };
    }),

  // ─── ADMIN: Apply late fee to invoice ────────────────────────────────────────
  adminApplyLateFee: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { clientInvoices, clientAccounts } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [invoice] = await db.select().from(clientInvoices).where(eq(clientInvoices.id, input.invoiceId)).limit(1);
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });

      const [account] = await db.select().from(clientAccounts).where(eq(clientAccounts.id, invoice.clientAccountId)).limit(1);
      if (!account) throw new TRPCError({ code: "NOT_FOUND" });

      const lateFeeCents = Math.round(invoice.baseAmountCents * account.lateFeePct / 100);
      const newTotal = invoice.baseAmountCents - invoice.discountCents + lateFeeCents;

      await db.update(clientInvoices).set({
        lateFeeCents,
        totalAmountCents: newTotal,
        status: "overdue",
      }).where(eq(clientInvoices.id, input.invoiceId));

      return { success: true, lateFeeCents, newTotal };
    }),

  // ─── ADMIN: List all invoices ─────────────────────────────────────────────────
  adminListInvoices: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx);
    const { getDb } = await import("../db");
    const { clientInvoices, clientAccounts, technicians, technicianCommissions } = await import("../../drizzle/schema");
    const { eq, desc } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const invoices = await db.select().from(clientInvoices).orderBy(desc(clientInvoices.createdAt));
    const accounts = await db.select().from(clientAccounts);
    const accountMap = new Map(accounts.map(a => [a.id, a]));

    // Load all technicians for rep name lookup
    const allTechs = await db.select().from(technicians);
    const techMap = new Map(allTechs.map(t => [t.id, t]));

    // Load all rep commissions keyed by invoiceId
    const allCommissions = await db
      .select()
      .from(technicianCommissions)
      .where(eq(technicianCommissions.commissionType, 'rep'));
    const commissionByInvoice = new Map(allCommissions.map(c => [c.invoiceId, c]));

    return invoices.map(inv => {
      const account = accountMap.get(inv.clientAccountId) ?? null;
      const repId = account?.assignedTechnicianId ?? null;
      const rep = repId ? (techMap.get(repId) ?? null) : null;
      const commission = commissionByInvoice.get(inv.id) ?? null;
      return {
        ...inv,
        account,
        repName: rep?.name ?? null,
        repEmail: rep?.email ?? null,
        repId,
        commissionRate: commission?.commissionRate ?? (rep?.commissionRate ?? null),
        commissionAmountCents: commission?.commissionAmountCents ?? null,
        commissionStatus: commission?.status ?? null,
        commissionPaidAt: commission?.paidAt ?? null,
      };
    });
  }),

  // ─── ADMIN: Upload media for a client ────────────────────────────────────────
  adminUploadMedia: protectedProcedure
    .input(z.object({
      clientAccountId: z.number(),
      fileKey: z.string(),
      fileUrl: z.string().url(),
      fileName: z.string(),
      mimeType: z.string(),
      fileSizeBytes: z.number(),
      mediaType: z.enum(["photo", "video"]),
      caption: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { clientMedia } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [result] = await db.insert(clientMedia).values({
        clientAccountId: input.clientAccountId,
        fileKey: input.fileKey,
        fileUrl: input.fileUrl,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSizeBytes: input.fileSizeBytes,
        mediaType: input.mediaType,
        caption: input.caption ?? null,
        uploadedBy: "admin",
      });

      return { id: (result as any).insertId };
    }),

   // ─── ADMIN: Delete media ──────────────────────────────────────────────────────
  adminDeleteMedia: protectedProcedure
    .input(z.object({ mediaId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { clientMedia } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(clientMedia).where(eq(clientMedia.id, input.mediaId));
      return { success: true };
    }),

  // ─── CLIENT: Get site analytics ───────────────────────────────────────────────
  // Fetches traffic data from SimilarWeb via the Manus Data API.
  // Provides real external traffic metrics: visits, bounce rate, traffic sources.
  getSiteAnalytics: protectedProcedure
    .input(z.object({
      range: z.enum(["3m", "6m", "12m"]).default("6m"),
    }))
    .query(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { clientAccounts } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const { callDataApi } = await import("../_core/dataApi");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [account] = await db
        .select()
        .from(clientAccounts)
        .where(eq(clientAccounts.clientOpenId, ctx.user.openId))
        .limit(1);

      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "No client account found" });

      const websiteUrl = account.websiteUrl;
      if (!websiteUrl) {
        return { hasData: false, domain: null, visits: [], bounceRate: [], trafficSources: [], totalVisits: 0, avgBounceRate: null };
      }

      // Normalize domain (strip protocol, www, trailing slash)
      const domain = websiteUrl.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "").split("/")[0];

      // Calculate date range
      const months = input.range === "3m" ? 3 : input.range === "12m" ? 12 : 6;
      const now = new Date();
      const endDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // last complete month
      const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - (months - 1), 1);
      const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`;
      const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}`;

      const swQuery = { country: "world", granularity: "monthly", main_domain_only: "false", start_date: startStr, end_date: endStr };
      const swPath = { domain };

      try {
        const [visitsRaw, bounceRaw, sourcesRaw] = await Promise.allSettled([
          callDataApi("Similarweb/get_visits_total", { query: swQuery, pathParams: swPath }),
          callDataApi("Similarweb/get_bounce_rate", { query: swQuery, pathParams: swPath }),
          callDataApi("Similarweb/get_traffic_sources_desktop", { query: swQuery, pathParams: swPath }),
        ]);

        // Parse visits
        const visitsData = visitsRaw.status === "fulfilled" ? (visitsRaw.value as any) : null;
        const visits: { date: string; visits: number }[] = (visitsData?.visits ?? []).map((v: any) => ({
          date: v.date.slice(0, 7), // YYYY-MM
          visits: Math.round(v.visits ?? 0),
        }));
        const totalVisits = visits.reduce((s, v) => s + v.visits, 0);

        // Parse bounce rate
        const bounceData = bounceRaw.status === "fulfilled" ? (bounceRaw.value as any) : null;
        const bounceRate: { date: string; rate: number | null }[] = (bounceData?.bounce_rate ?? []).map((b: any) => ({
          date: b.date.slice(0, 7),
          rate: b.bounce_rate != null ? Math.round(b.bounce_rate * 100) : null,
        }));
        const validBounces = bounceRate.filter(b => b.rate != null);
        const avgBounceRate = validBounces.length > 0
          ? Math.round(validBounces.reduce((s, b) => s + (b.rate ?? 0), 0) / validBounces.length)
          : null;

        // Parse traffic sources — aggregate across all months
        const sourcesData = sourcesRaw.status === "fulfilled" ? (sourcesRaw.value as any) : null;
        const sourceMap: Record<string, number> = {};
        const domainVisits = sourcesData?.visits?.[domain] ?? sourcesData?.visits?.[`www.${domain}`] ?? [];
        for (const src of domainVisits) {
          const name = src.source_type as string;
          const total = (src.visits as any[]).reduce((s: number, v: any) => s + (v.organic ?? 0) + (v.paid ?? 0) + (v.visits ?? 0), 0);
          sourceMap[name] = (sourceMap[name] ?? 0) + total;
        }
        const trafficSources = Object.entries(sourceMap)
          .map(([source, visits]) => ({ source, visits: Math.round(visits) }))
          .sort((a, b) => b.visits - a.visits);

        return {
          hasData: true,
          domain,
          visits,
          bounceRate,
          trafficSources,
          totalVisits,
          avgBounceRate,
          range: input.range,
          startStr,
          endStr,
        };
      } catch (err) {
        console.error("[getSiteAnalytics] SimilarWeb error:", err);
        return { hasData: false, domain, visits: [], bounceRate: [], trafficSources: [], totalVisits: 0, avgBounceRate: null };
      }
    }),

  // ─── ADMIN: Assign a client account to the currently logged-in user ─────────
  // Useful for testing or when the admin IS the client (e.g. owner's own account)
  adminAssignToSelf: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { clientAccounts } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(clientAccounts)
        .set({ clientOpenId: ctx.user.openId, inviteAccepted: 1 })
        .where(eq(clientAccounts.id, input.accountId));

      return { success: true };
    }),

  // ─── CLIENT: Get site overview (PageSpeed scores + screenshot) ───────────────
  getSiteOverview: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { clientAccounts } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [account] = await db
      .select()
      .from(clientAccounts)
      .where(eq(clientAccounts.clientOpenId, ctx.user.openId))
      .limit(1);

    if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "No client account found" });

    const websiteUrl = account.websiteUrl;
    if (!websiteUrl) {
      return { hasWebsite: false, performance: null, seo: null, accessibility: null, bestPractices: null, loadTime: null, screenshotUrl: null };
    }

    try {
      // Generate a screenshot URL using Microlink (free, no API key required)
      // Fetch server-side to follow redirects and get the final CDN image URL
      let screenshotUrl: string | null = null;
      try {
        const normalizedUrl = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;
        const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(normalizedUrl)}&screenshot=true&meta=false`;
        const mlRes = await fetch(microlinkUrl, { signal: AbortSignal.timeout(15000) });
        if (mlRes.ok) {
          const mlData = await mlRes.json();
          screenshotUrl = mlData?.data?.screenshot?.url ?? null;
        }
      } catch {
        // Screenshot fetch failed — non-critical
      }

      // Try PageSpeed scores — may not be available in all environments
      let performance: number | null = null;
      let seo: number | null = null;
      let accessibility: number | null = null;
      let bestPractices: number | null = null;
      let loadTime: number | null = null;
      try {
        const { analyzeWebsite } = await import("../pagespeed");
        const result = await analyzeWebsite(websiteUrl);
        performance = result.performance;
        seo = result.seo;
        accessibility = result.accessibility;
        bestPractices = result.bestPractices;
        loadTime = result.loadTime;
      } catch {
        // PageSpeed not available — return screenshot only
      }

      return {
        hasWebsite: true,
        performance,
        seo,
        accessibility,
        bestPractices,
        loadTime,
        screenshotUrl,
        websiteUrl,
        analyzedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        hasWebsite: true,
        performance: null,
        seo: null,
        accessibility: null,
        bestPractices: null,
        loadTime: null,
        screenshotUrl: null,
        websiteUrl,
        error: err?.message || "Analysis failed",
      };
    }
  }),

  // ─── CLIENT: Get Stripe payment history ──────────────────────────────────────
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { clientAccounts } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [account] = await db
      .select()
      .from(clientAccounts)
      .where(eq(clientAccounts.clientOpenId, ctx.user.openId))
      .limit(1);

    if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "No client account found" });

    const stripeCustomerId = account.stripeCustomerId;
    if (!stripeCustomerId) {
      return { payments: [], hasStripe: false };
    }

    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(ENV.stripeSecretKey, { apiVersion: "2026-02-25.clover" as any });

      // Fetch charges for this customer
      const charges = await stripe.charges.list({
        customer: stripeCustomerId,
        limit: 20,
      });

      const payments = charges.data.map(charge => ({
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        description: charge.description,
        createdAt: charge.created * 1000, // convert to ms
        receiptUrl: charge.receipt_url,
        refunded: charge.refunded,
      }));

      return { payments, hasStripe: true };
    } catch (err: any) {
      console.error("[getPaymentHistory] Stripe error:", err?.message);
      return { payments: [], hasStripe: true, error: err?.message };
    }
  }),

  // ─── PUBLIC: Get invoice by share token (no auth required) ──────────────────────────
  getInvoiceByShareToken: publicProcedure
    .input(z.object({ shareToken: z.string() }))
    .query(async ({ input }) => {
      const { getDb } = await import("../db");
      const { clientInvoices, clientAccounts, invoiceItems } = await import("../../drizzle/schema");
      const { eq, asc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [invoice] = await db
        .select()
        .from(clientInvoices)
        .where(eq(clientInvoices.shareToken, input.shareToken))
        .limit(1);
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found or link has expired" });

      const [account] = await db
        .select()
        .from(clientAccounts)
        .where(eq(clientAccounts.id, invoice.clientAccountId))
        .limit(1);

      const items = await db
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, invoice.id))
        .orderBy(asc(invoiceItems.sortOrder));

      return {
        invoice,
        items,
        account: account ? {
          businessName: account.businessName,
          clientName: account.clientName,
          clientEmail: account.clientEmail,
          websiteUrl: account.websiteUrl,
        } : null,
      };
    }),

  // ─── PUBLIC: Create Stripe checkout for shared invoice (no auth required) ─────────
  createSharedInvoiceCheckout: publicProcedure
    .input(z.object({ shareToken: z.string(), origin: z.string() }))
    .mutation(async ({ input }) => {
      const { getDb } = await import("../db");
      const { clientInvoices, clientAccounts, invoiceItems } = await import("../../drizzle/schema");
      const { eq, asc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [invoice] = await db
        .select()
        .from(clientInvoices)
        .where(eq(clientInvoices.shareToken, input.shareToken))
        .limit(1);
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      if (invoice.status === "paid") throw new TRPCError({ code: "BAD_REQUEST", message: "Invoice already paid" });

      const [account] = await db
        .select()
        .from(clientAccounts)
        .where(eq(clientAccounts.id, invoice.clientAccountId))
        .limit(1);

      const items = await db
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, invoice.id))
        .orderBy(asc(invoiceItems.sortOrder));

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(ENV.stripeSecretKey, { apiVersion: "2026-02-25.clover" as any });

      // Build Stripe line_items: use individual items if present, otherwise single line
      const stripeLineItems = items.length > 0
        ? items.map(item => ({
            quantity: item.quantity,
            price_data: {
              currency: "usd",
              unit_amount: item.unitAmountCents,
              product_data: { name: item.description },
            },
          }))
        : [{
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: invoice.totalAmountCents,
              product_data: {
                name: `FlowSites Invoice ${invoice.invoiceNumber}`,
                description: `${account?.businessName ?? ""} — ${invoice.periodStart} to ${invoice.periodEnd}`,
              },
            },
          }];

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: stripeLineItems,
        metadata: {
          invoiceId: String(invoice.id),
          invoiceNumber: invoice.invoiceNumber,
          shareToken: input.shareToken,
        },
        success_url: `${input.origin}/invoice/${input.shareToken}?payment=success`,
        cancel_url: `${input.origin}/invoice/${input.shareToken}?payment=cancelled`,
      });

      return { checkoutUrl: session.url };
    }),

  // ─── CLIENT: Request an upgrade / add-on ─────────────────────────────────────
  requestUpgrade: protectedProcedure
    .input(z.object({
      featureId: z.string(),
      featureLabel: z.string(),
      featurePrice: z.number(),
      clientNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { clientAccounts, featureUpgradeRequests, clientInvoices } = await import("../../drizzle/schema");
      const { eq, count } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [account] = await db
        .select()
        .from(clientAccounts)
        .where(eq(clientAccounts.clientOpenId, ctx.user.openId))
        .limit(1);
      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "No account found" });

      // Insert the upgrade request
      const [requestResult] = await db.insert(featureUpgradeRequests).values({
        projectId: account.projectId ?? 0,
        clientOpenId: ctx.user.openId,
        clientName: account.clientName,
        featureId: input.featureId,
        featureLabel: input.featureLabel,
        featurePrice: input.featurePrice,
        clientNotes: input.clientNotes ?? null,
        status: "pending",
      });
      const addonRequestId = (requestResult as any).insertId as number;

      // Immediately create an open invoice for this add-on
      const today = new Date().toISOString().slice(0, 10);
      const [{ value: invoiceCount }] = await db.select({ value: count() }).from(clientInvoices);
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Number(invoiceCount) + 1).padStart(4, "0")}`;
      const shareToken = crypto.randomBytes(32).toString("hex");

      await db.insert(clientInvoices).values({
        clientAccountId: account.id,
        invoiceNumber,
        periodStart: today,
        periodEnd: today,
        dueDate: today,
        baseAmountCents: input.featurePrice,
        discountCents: 0,
        lateFeeCents: 0,
        totalAmountCents: input.featurePrice,
        discountType: "none",
        status: "open",
        isRecurring: 0,
        invoiceType: "addon",
        addonRequestId,
        shareToken,
        notes: `Add-on: ${input.featureLabel}${input.clientNotes ? ` — ${input.clientNotes}` : ""}`,
      });

      // Notify owner
      try {
        const { notifyOwner } = await import("../_core/notification");
        await notifyOwner({
          title: `New Upgrade Request: ${input.featureLabel}`,
          content: `${account.businessName} (${account.clientName}) requested "${input.featureLabel}" ($${(input.featurePrice / 100).toFixed(2)}).${input.clientNotes ? ` Notes: ${input.clientNotes}` : ""} Invoice ${invoiceNumber} created.`,
        });
      } catch (_) { /* non-fatal */ }

      return { success: true, shareToken, invoiceNumber };
    }),

  // ─── CLIENT: Get my upgrade requests ─────────────────────────────────────────
  getMyUpgradeRequests: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { clientAccounts, featureUpgradeRequests, clientInvoices } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [account] = await db
      .select()
      .from(clientAccounts)
      .where(eq(clientAccounts.clientOpenId, ctx.user.openId))
      .limit(1);
    if (!account) return [];

    const requests = await db
      .select()
      .from(featureUpgradeRequests)
      .where(eq(featureUpgradeRequests.clientOpenId, ctx.user.openId))
      .orderBy(featureUpgradeRequests.createdAt);

    // Attach the invoice shareToken for each request (for Pay Now links)
    const invoices = await db
      .select({ addonRequestId: clientInvoices.addonRequestId, shareToken: clientInvoices.shareToken, status: clientInvoices.status })
      .from(clientInvoices)
      .where(eq(clientInvoices.clientAccountId, account.id));

    const invoiceByRequestId = new Map(invoices.map(inv => [inv.addonRequestId, inv]));

    return requests.map(req => ({
      ...req,
      invoiceShareToken: invoiceByRequestId.get(req.id)?.shareToken ?? null,
      invoiceStatus: invoiceByRequestId.get(req.id)?.status ?? null,
    }));
  }),

  // ─── ADMIN: Get all upgrade requests ─────────────────────────────────────────
  adminGetUpgradeRequests: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx);
    const { getDb } = await import("../db");
    const { featureUpgradeRequests } = await import("../../drizzle/schema");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db.select().from(featureUpgradeRequests).orderBy(featureUpgradeRequests.createdAt);
  }),

  // ─── ADMIN: Mark invoice as paid (manual) — fires dual commissions ─────────────
  adminMarkInvoicePaid: protectedProcedure
    .input(z.object({
      invoiceId: z.number().int(),
      paymentMethod: z.string().optional(), // e.g. "cash", "check", "bank_transfer"
      adminNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { clientInvoices } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [invoice] = await db
        .select()
        .from(clientInvoices)
        .where(eq(clientInvoices.id, input.invoiceId))
        .limit(1);
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      if (invoice.status === "paid") throw new TRPCError({ code: "BAD_REQUEST", message: "Invoice already marked as paid" });

      await db
        .update(clientInvoices)
        .set({
          status: "paid",
          paidAt: new Date(),
          notes: input.adminNotes
            ? (invoice.notes ? `${invoice.notes}\nPaid manually: ${input.adminNotes}` : `Paid manually: ${input.adminNotes}`)
            : invoice.notes,
        })
        .where(eq(clientInvoices.id, input.invoiceId));

      // Fire dual commissions (rep 15% + partner 15%)
      try {
        const { createDualCommissions } = await import("./partnerRouter");
        await createDualCommissions(db, invoice.id, invoice.clientAccountId, invoice.totalAmountCents);
      } catch (err) {
        console.error("[adminMarkInvoicePaid] Commission creation failed:", err);
        // Non-fatal — invoice is still marked paid
      }

      // Auto-generate next month's invoice if this is a recurring monthly invoice
      let nextInvoiceId: number | null = null;
      if (invoice.isRecurring === 1 && invoice.invoiceType === "monthly") {
        try {
          const { clientAccounts } = await import("../../drizzle/schema");
          const [account] = await db.select().from(clientAccounts).where(eq(clientAccounts.id, invoice.clientAccountId)).limit(1);
          if (account && account.status === "active") {
            // Parse current period end to get next period
            const currentEnd = new Date(invoice.periodEnd + "T12:00:00Z");
            const nextStart = new Date(currentEnd);
            nextStart.setUTCDate(nextStart.getUTCDate() + 1);
            const nextEnd = new Date(nextStart);
            nextEnd.setUTCMonth(nextEnd.getUTCMonth() + 1);
            nextEnd.setUTCDate(nextEnd.getUTCDate() - 1);
            const nextDue = new Date(nextStart);
            const pad = (n: number) => String(n).padStart(2, "0");
            const fmt = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
            // Generate invoice number
            const year = nextStart.getUTCFullYear();
            const month = nextStart.getUTCMonth() + 1;
            const countResult = await db.select().from(clientInvoices);
            const nextNum = countResult.length + 1;
            const invoiceNumber = `INV-${year}-${pad(month)}-${String(nextNum).padStart(3, "0")}`;
            const crypto = await import("crypto");
            const shareToken = crypto.randomBytes(24).toString("hex");
            const insertResult = await db.insert(clientInvoices).values({
              clientAccountId: invoice.clientAccountId,
              invoiceNumber,
              periodStart: fmt(nextStart),
              periodEnd: fmt(nextEnd),
              dueDate: fmt(nextDue),
              baseAmountCents: account.monthlyPriceCents,
              discountCents: 0,
              lateFeeCents: 0,
              totalAmountCents: account.monthlyPriceCents,
              status: "open",
              isRecurring: 1,
              invoiceType: "monthly",
              discountType: "none",
              shareToken,
            });
            nextInvoiceId = (insertResult as any).insertId ?? null;
          }
        } catch (err) {
          console.error("[adminMarkInvoicePaid] Auto-next-month invoice failed:", err);
          // Non-fatal
        }
      }

      // Send SMS notification to owner when invoice is marked as paid
      try {
        const { sendSms } = await import("../800com");
        const { clientAccounts } = await import("../../drizzle/schema");
        const [account] = await db.select().from(clientAccounts).where(eq(clientAccounts.id, invoice.clientAccountId)).limit(1);
        const clientName = account?.businessName || account?.clientName || "Client";
        const amount = `$${(invoice.totalAmountCents / 100).toFixed(2)}`;
        await sendSms({
          recipient: "2818189288",
          message: `💰 FlowSites: Invoice ${invoice.invoiceNumber} for ${clientName} has been paid — ${amount}!`,
        });
      } catch (err) {
        console.error("[adminMarkInvoicePaid] SMS notification failed:", err);
        // Non-fatal
      }

      return { success: true, nextInvoiceId };
    }),

  // ─── ADMIN: Void / cancel an invoice ────────────────────────────────────────────────────────────────────────────────
  adminVoidInvoice: protectedProcedure
    .input(z.object({
      invoiceId: z.number().int(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { clientInvoices } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [invoice] = await db.select().from(clientInvoices).where(eq(clientInvoices.id, input.invoiceId)).limit(1);
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      if (invoice.status === "paid") throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot void a paid invoice" });
      await db.update(clientInvoices).set({
        status: "void",
        notes: input.reason
          ? (invoice.notes ? `${invoice.notes}\nVoided: ${input.reason}` : `Voided: ${input.reason}`)
          : invoice.notes,
      }).where(eq(clientInvoices.id, input.invoiceId));
      return { success: true };
    }),

  // 250025002500 ADMIN: Update upgrade request status 250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500
  adminUpdateUpgradeRequest: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "quoted", "approved", "in_progress", "completed", "declined"]),
      adminResponse: z.string().optional(),
      agreedPrice: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { featureUpgradeRequests } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(featureUpgradeRequests)
        .set({
          status: input.status,
          adminResponse: input.adminResponse ?? null,
          agreedPrice: input.agreedPrice ?? null,
        })
        .where(eq(featureUpgradeRequests.id, input.id));
      return { success: true };
    }),

  // ─── CLIENT PAGES ─────────────────────────────────────────────────────────────

  /** Client: get their website pages */
  getMyPages: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { clientAccounts, clientPages } = await import("../../drizzle/schema");
    const { eq, asc } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) return [];

    const [account] = await db
      .select()
      .from(clientAccounts)
      .where(eq(clientAccounts.clientOpenId, ctx.user.openId))
      .limit(1);

    if (!account) return [];

    return db.select().from(clientPages)
      .where(eq(clientPages.clientAccountId, account.id))
      .orderBy(asc(clientPages.sortOrder), asc(clientPages.id));
  }),

  /** Admin: list all pages for a client account */
  adminGetPages: protectedProcedure
    .input(z.object({ clientAccountId: z.number() }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { clientPages } = await import("../../drizzle/schema");
      const { eq, asc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) return [];
      return db.select().from(clientPages)
        .where(eq(clientPages.clientAccountId, input.clientAccountId))
        .orderBy(asc(clientPages.sortOrder), asc(clientPages.id));
    }),

  /** Admin: add a page to a client account */
  adminAddPage: protectedProcedure
    .input(z.object({
      clientAccountId: z.number(),
      title: z.string().min(1).max(100),
      path: z.string().min(1).max(255),
      description: z.string().optional(),
      status: z.enum(["live", "draft", "in_progress"]).default("live"),
      lastUpdated: z.string().optional(),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { clientPages } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(clientPages).values({
        clientAccountId: input.clientAccountId,
        title: input.title,
        path: input.path,
        description: input.description ?? null,
        status: input.status,
        lastUpdated: input.lastUpdated ?? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        sortOrder: input.sortOrder,
      });
      return { success: true, id: (result as unknown as { insertId: number }).insertId };
    }),

  /** Admin: update a page */
  adminUpdatePage: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(100).optional(),
      path: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      status: z.enum(["live", "draft", "in_progress"]).optional(),
      lastUpdated: z.string().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { clientPages } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...updates } = input;
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([, v]) => v !== undefined)
      );
      await db.update(clientPages).set(filteredUpdates).where(eq(clientPages.id, id));
      return { success: true };
    }),

  /** Admin: delete a page */
  adminDeletePage: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { clientPages } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(clientPages).where(eq(clientPages.id, input.id));
      return { success: true };
    }),

  /** Admin: save an add-on quote and optionally link it to a client account */
  saveAddonQuote: protectedProcedure
    .input(z.object({
      clientAccountId: z.number().optional(),
      clientName: z.string().min(1),
      clientEmail: z.string().optional().default(""),
      addonIds: z.array(z.string()),
      addonLabels: z.array(z.string()),
      addonPrices: z.array(z.number()),
      totalCents: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx);
      const { getDb } = await import("../db");
      const { budgetQuotes } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const lineItems = input.addonIds.map((id, i) => ({ id, label: input.addonLabels[i], price: input.addonPrices[i] }));
      const [result] = await db.insert(budgetQuotes).values({
        prospectName: input.clientName,
        prospectEmail: input.clientEmail,
        industry: "addon_quote",
        basePackage: "addon_only",
        coreAddons: JSON.stringify(lineItems.filter((l) => l.id.startsWith("core_") || ["extra_page","custom_homepage_section","faq_section","testimonials_section","gallery_portfolio","blog_setup","careers_page","video_embed","popup_lead_capture","countdown_timer","live_chat","social_feed","google_reviews","multilingual","accessibility","speed_optimization","analytics_setup","custom_404"].includes(l.id))),
        autoAddons: JSON.stringify(lineItems.filter((l) => ["crm_integration","booking_system","email_automation","sms_automation","lead_pipeline","stripe_payment","member_portal","custom_admin","ai_chatbot","review_automation","referral_program","loyalty_rewards","lead_magnet","webinar_registration","affiliate_tracking"].includes(l.id))),
        industryAddons: JSON.stringify(lineItems.filter((l) => !(["extra_page","custom_homepage_section","faq_section","testimonials_section","gallery_portfolio","blog_setup","careers_page","video_embed","popup_lead_capture","countdown_timer","live_chat","social_feed","google_reviews","multilingual","accessibility","speed_optimization","analytics_setup","custom_404","crm_integration","booking_system","email_automation","sms_automation","lead_pipeline","stripe_payment","member_portal","custom_admin","ai_chatbot","review_automation","referral_program","loyalty_rewards","lead_magnet","webinar_registration","affiliate_tracking"].includes(l.id)))),
        subscriptionTier: "none",
        monthlyPrice: 0,
        paymentPlan: "full",
        buildCostMin: input.totalCents,
        buildCostMax: input.totalCents,
        adminNotes: input.notes ?? null,
        status: "new",
      });
      return { success: true, quoteId: (result as any)?.insertId };
    }),
});
