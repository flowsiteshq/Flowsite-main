import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { analyzeWebsite } from "./pagespeed";
import { z } from "zod";
import { stripeRouter } from "./stripe/stripeRouter";
import { clientPortalRouter } from "./routers/clientPortalRouter";
import { clientBillingRouter } from "./routers/clientBillingRouter";
import { technicianRouter } from "./routers/technicianRouter";
import { partnerRouter } from "./routers/partnerRouter";
import { emailAuthRouter } from "./routers/emailAuthRouter";
import { opportunityRouter } from "./routers/opportunityRouter";
import { communicationsRouter } from "./routers/communicationsRouter";
import { learningRouter } from "./routers/learningRouter";
import { clientPortalAuthRouter } from "./routers/clientPortalAuthRouter";
import { analyticsRouter } from "./routers/analyticsRouter";
import { bookingsRouter } from "./routers/bookingsRouter";
import type { TrpcContext } from "./_core/context";

/**
 * Accepts either:
 * 1. A valid admin_session cookie (password login)
 * 2. A valid email_session_id cookie with isAdmin=1 (email+password admin login)
 * 3. A Manus OAuth technician with role="admin", "admin_manager", or "sales_rep" in the technicians table
 */
async function requireAdminAccess(ctx: TrpcContext): Promise<void> {
  // 1. Check admin password session cookie
  const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
  if (token) {
    const { getAdminSession } = await import("./db");
    const session = await getAdminSession(token);
    if (session) return;
  }
  // 2. Check email_session_id cookie (email+password login with isAdmin=1)
  const emailToken = ctx.req.cookies?.email_session_id;
  if (emailToken) {
    const { getDb } = await import("./db");
    const { emailAuthSessions } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (db) {
      const rows = await db.select().from(emailAuthSessions).where(eq(emailAuthSessions.sessionToken, emailToken)).limit(1);
      const sess = rows[0];
      if (sess && sess.isAdmin === 1 && new Date() < sess.expiresAt) return;
    }
  }
  // 3. Check Manus OAuth technician with any active staff role
  if (ctx.user?.openId) {
    const { getDb } = await import("./db");
    const { technicians } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (db) {
      const rows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
      const tech = rows[0];
      const ALLOWED_ROLES = ["admin", "admin_manager", "sales_rep"];
      if (tech && tech.status === "active" && ALLOWED_ROLES.includes(tech.role)) return;
    }
  }
  throw new Error("Unauthorized");
}

/**
 * Strictly admin-only access — password session OR role="admin" technician.
 * Use this for destructive or sensitive operations (billing, team management, partner commissions).
 */
async function requireStrictAdminAccess(ctx: TrpcContext): Promise<void> {
  const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
  if (token) {
    const { getAdminSession } = await import("./db");
    const session = await getAdminSession(token);
    if (session) return;
  }
  // Check email_session_id cookie (email+password login with isAdmin=1)
  const emailToken = ctx.req.cookies?.email_session_id;
  if (emailToken) {
    const { getDb } = await import("./db");
    const { emailAuthSessions } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (db) {
      const rows = await db.select().from(emailAuthSessions).where(eq(emailAuthSessions.sessionToken, emailToken)).limit(1);
      const sess = rows[0];
      if (sess && sess.isAdmin === 1 && new Date() < sess.expiresAt) return;
    }
  }
  if (ctx.user?.openId) {
    const { getDb } = await import("./db");
    const { technicians } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (db) {
      const rows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
      const tech = rows[0];
      if (tech && tech.status === "active" && tech.role === "admin") return;
    }
  }
  throw new Error("Unauthorized");
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  stripe: stripeRouter,
  analytics: analyticsRouter,
  clientPortal: clientPortalRouter,
  clientBilling: clientBillingRouter,
  technician: technicianRouter,
  partner: partnerRouter,
  emailAuth: emailAuthRouter,
  opportunity: opportunityRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  analyzer: router({
    analyze: publicProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(async ({ input }) => {
        return await analyzeWebsite(input.url);
      }),

    /** Auto-save an analysis result and return the shareId */
    saveResult: publicProcedure
      .input(z.object({
        url: z.string(),
        performance: z.number(),
        seo: z.number(),
        accessibility: z.number(),
        bestPractices: z.number(),
        mobileScore: z.number(),
        loadTime: z.number(),
        issues: z.array(z.object({
          title: z.string(),
          description: z.string(),
          severity: z.enum(["critical", "warning", "info"]),
        })).optional(),
        recommendations: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db");
        const { analyzerResults } = await import("../drizzle/schema");
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        // Generate a random 12-char alphanumeric share ID
        const shareId = Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8);
        await db.insert(analyzerResults).values({
          shareId,
          url: input.url,
          performance: input.performance,
          seo: input.seo,
          accessibility: input.accessibility,
          bestPractices: input.bestPractices,
          mobileScore: input.mobileScore,
          loadTime: input.loadTime,
          issuesJson: input.issues ? JSON.stringify(input.issues) : null,
          recommendationsJson: input.recommendations ? JSON.stringify(input.recommendations) : null,
        });
        return { shareId };
      }),

    /** Get a saved result by shareId (public — for the shareable results page) */
    getByShareId: publicProcedure
      .input(z.object({ shareId: z.string() }))
      .query(async ({ input }) => {
        const { getDb } = await import("./db");
        const { analyzerResults } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const rows = await db.select().from(analyzerResults).where(eq(analyzerResults.shareId, input.shareId)).limit(1);
        if (!rows.length) throw new Error("Result not found");
        const row = rows[0];
        return {
          ...row,
          issues: row.issuesJson ? JSON.parse(row.issuesJson) : [],
          recommendations: row.recommendationsJson ? JSON.parse(row.recommendationsJson) : [],
        };
      }),

    /** Admin: list all analyzer leads */
    adminList: publicProcedure
      .query(async ({ ctx }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const { analyzerResults } = await import("../drizzle/schema");
        const { desc } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        return await db.select().from(analyzerResults).orderBy(desc(analyzerResults.createdAt)).limit(500);
      }),
  }),

  wizard: router({
    getSubmissions: publicProcedure
      .query(async ({ ctx }) => {
        // Only allow admin users to view submissions
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const { getAllWizardSubmissions } = await import("./db");
        return await getAllWizardSubmissions();
      }),
    submit: publicProcedure
      .input(z.object({
        businessName: z.string(),
        businessType: z.string(),
        businessTypeOther: z.string().optional(),
        website: z.string().optional(),
        phone: z.string(),
        email: z.string().email(),
        colorScheme: z.string(),
        customColors: z.string().optional(),
        designStyle: z.string().optional(),
        referenceWebsites: z.string().optional(),
        primaryGoal: z.string(),
        currentChallenges: z.string().optional(),
        timeline: z.string(),
        budget: z.string().optional(),
        additionalNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Store wizard submission in database
        const { createWizardSubmission } = await import("./db");
        const submission = await createWizardSubmission(input);
        
        // Send confirmation email to customer
        const { sendWizardConfirmationEmail } = await import("./email");
        await sendWizardConfirmationEmail({
          email: input.email,
          businessName: input.businessName,
          contactName: input.businessName, // Using business name as contact name since we don't collect it separately
        });
        
        // Send notification to owner
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: `New Website Inquiry: ${input.businessName}`,
          content: `${input.businessName} (${input.businessType}) has submitted the onboarding wizard.\n\nEmail: ${input.email}\nPhone: ${input.phone}\nTimeline: ${input.timeline}\n\nView details in the admin panel.`,
        });
        
        return { success: true, id: submission.id };
      }),
    
    // Update submission status
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "in_progress", "proposal_sent", "won", "lost"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getDb } = await import("./db");
        const { wizardSubmissions } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Update status and timestamp
        await db
          .update(wizardSubmissions)
          .set({
            status: input.status,
            statusUpdatedAt: new Date(),
          })
          .where(eq(wizardSubmissions.id, input.id));
        
        return { success: true };
      }),
  }),

  admin: router({
    // Login with secret password — returns a session token stored in cookie
    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { ENV } = await import("./_core/env");
        if (!ENV.adminSecretPassword || input.password !== ENV.adminSecretPassword) {
          throw new Error("Invalid password");
        }
        // Generate a secure random session token
        const crypto = await import("crypto");
        const token = crypto.randomBytes(48).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const { createAdminSession } = await import("./db");
        await createAdminSession(token, expiresAt);
        // Set cookie — use same sameSite/secure settings as core session cookie
        const { getSessionCookieOptions } = await import("./_core/cookies");
        ctx.res.cookie("admin_session", token, {
          ...getSessionCookieOptions(ctx.req),
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        // Also return token in body so frontend can store in localStorage
        // as a fallback for environments where cookies are blocked
        return { success: true, token };
      }),

    // Verify current admin session — also accepts active technicians via Manus OAuth
    verify: publicProcedure.query(async ({ ctx }) => {
      // 1. Check admin password session cookie first
      const token = ctx.req.cookies?.admin_session ||
        (ctx.req.headers["x-admin-token"] as string | undefined);
      if (token) {
        const { getAdminSession } = await import("./db");
        const session = await getAdminSession(token);
        if (session) return { authenticated: true, techRole: "admin" as const };
      }
      // 2. Check email_session_id cookie (email+password login with isAdmin=1)
      const emailToken = ctx.req.cookies?.email_session_id;
      if (emailToken) {
        const { getDb } = await import("./db");
        const { emailAuthSessions } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (db) {
          const rows = await db.select().from(emailAuthSessions).where(eq(emailAuthSessions.sessionToken, emailToken)).limit(1);
          const sess = rows[0];
          if (sess && sess.isAdmin === 1 && new Date() < sess.expiresAt) {
            return { authenticated: true, techRole: "admin" as const };
          }
        }
      }
      // 3. Fall back to Manus OAuth technician session
      if (ctx.user?.openId) {
        const { getDb } = await import("./db");
        const { technicians } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (db) {
          const rows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
          const tech = rows[0];
          if (tech && tech.status === "active") {
            return { authenticated: true, techRole: tech.role as string };
          }
        }
      }
      return { authenticated: false, techRole: null };
    }),

    // Logout — clear admin session
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const token = ctx.req.cookies?.admin_session ||
        (ctx.req.headers["x-admin-token"] as string | undefined);
      if (token) {
        const { deleteAdminSession } = await import("./db");
        await deleteAdminSession(token);
      }
      const { getSessionCookieOptions } = await import("./_core/cookies");
      ctx.res.clearCookie("admin_session", getSessionCookieOptions(ctx.req));
      return { success: true };
    }),

    // Get all leads/submissions — requires admin session OR technician admin role
    getLeads: publicProcedure.query(async ({ ctx }) => {
      await requireAdminAccess(ctx);
      const { getAllWizardSubmissions } = await import("./db");
      return await getAllWizardSubmissions();
    }),

    // Delete a single lead — requires admin session OR technician admin role
    deleteLead: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { wizardSubmissions } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db.delete(wizardSubmissions).where(eq(wizardSubmissions.id, input.id));
        return { success: true };
      }),

    // Bulk delete leads — requires admin session OR technician admin role
    deleteLeadsBulk: publicProcedure
      .input(z.object({ ids: z.array(z.number()).min(1) }))
      .mutation(async ({ input, ctx }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { wizardSubmissions } = await import("../drizzle/schema");
        const { inArray } = await import("drizzle-orm");
        await db.delete(wizardSubmissions).where(inArray(wizardSubmissions.id, input.ids));
        return { success: true, deleted: input.ids.length };
      }),

    // Update lead status — requires admin session OR technician admin role
    updateLeadStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "in_progress", "proposal_sent", "won", "lost"]),
      }))
      .mutation(async ({ input, ctx }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { wizardSubmissions } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db.update(wizardSubmissions).set({ status: input.status, statusUpdatedAt: new Date() }).where(eq(wizardSubmissions.id, input.id));
        return { success: true };
      }),

    // Update lead details (notes, source, followUpDate, assignedTechnicianId, assignedPartnerId, nicheTag)
    updateLead: publicProcedure
      .input(z.object({
        id: z.number(),
        adminNotes: z.string().optional(),
        source: z.enum(["website", "cold_call", "referral", "social", "partner", "other"]).nullable().optional(),
        followUpDate: z.string().nullable().optional(), // YYYY-MM-DD
        assignedTechnicianId: z.number().nullable().optional(),
        assignedPartnerId: z.number().nullable().optional(),
        nicheTag: z.enum(["martial_arts", "restaurant", "fitness", "self_defense", "health_wellness", "salon", "hospitality", "other"]).nullable().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { wizardSubmissions } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const updateData: Record<string, unknown> = {};
        if (input.adminNotes !== undefined) updateData.adminNotes = input.adminNotes;
        if (input.source !== undefined) updateData.source = input.source;
        if (input.followUpDate !== undefined) updateData.followUpDate = input.followUpDate;
        if (input.assignedTechnicianId !== undefined) updateData.assignedTechnicianId = input.assignedTechnicianId;
        if (input.assignedPartnerId !== undefined) updateData.assignedPartnerId = input.assignedPartnerId;
        if (input.nicheTag !== undefined) updateData.nicheTag = input.nicheTag;
        if (Object.keys(updateData).length > 0) {
          await db.update(wizardSubmissions).set(updateData).where(eq(wizardSubmissions.id, input.id));
        }
        return { success: true };
      }),

    // Bulk update lead status
    bulkUpdateLeadStatus: publicProcedure
      .input(z.object({
        ids: z.array(z.number()).min(1),
        status: z.enum(["new", "contacted", "in_progress", "proposal_sent", "won", "lost"]),
      }))
      .mutation(async ({ input, ctx }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { wizardSubmissions } = await import("../drizzle/schema");
        const { inArray } = await import("drizzle-orm");
        await db.update(wizardSubmissions)
          .set({ status: input.status, statusUpdatedAt: new Date() })
          .where(inArray(wizardSubmissions.id, input.ids));
        return { success: true, updated: input.ids.length };
      }),

    // Manually add a new lead — requires admin session OR technician admin role
    addLead: publicProcedure
      .input(z.object({
        businessName: z.string().min(1),
        businessType: z.string().default("other"),
        email: z.string().email(),
        phone: z.string().optional(),
        website: z.string().optional(),
        primaryGoal: z.string().optional(),
        source: z.enum(["website", "cold_call", "referral", "social", "partner", "other"]).default("cold_call"),
        adminNotes: z.string().optional(),
        colorScheme: z.string().default("professional"),
        timeline: z.string().default("flexible"),
        nicheTag: z.enum(["martial_arts", "restaurant", "fitness", "self_defense", "health_wellness", "salon", "hospitality", "other"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { wizardSubmissions } = await import("../drizzle/schema");
        const [result] = await db.insert(wizardSubmissions).values({
          businessName: input.businessName,
          businessType: input.businessType,
          email: input.email,
          phone: input.phone ?? "",
          website: input.website ?? undefined,
          primaryGoal: input.primaryGoal ?? "Improve online presence",
          source: input.source,
          adminNotes: input.adminNotes ?? undefined,
          colorScheme: input.colorScheme,
          timeline: input.timeline,
          nicheTag: input.nicheTag ?? undefined,
          status: "new",
          createdAt: new Date(),
          statusUpdatedAt: new Date(),
        });
        return { success: true, id: (result as { insertId: number }).insertId };
      }),

    // ─── Lead Notes ─────────────────────────────────────────────────────────
    addLeadNote: publicProcedure
      .input(z.object({
        leadId: z.number(),
        content: z.string().min(1).max(2000),
      }))
      .mutation(async ({ input, ctx }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { leadNotes, technicians } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        // Resolve author name from technician record or fallback to user name
        let authorName = "Admin";
        let authorOpenId: string | undefined;
        if (ctx.user) {
          authorOpenId = ctx.user.openId;
          const [tech] = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
          authorName = tech?.name ?? ctx.user.name ?? "Admin";
        }
        const [result] = await db.insert(leadNotes).values({
          leadId: input.leadId,
          content: input.content,
          authorName,
          authorOpenId,
          createdAt: new Date(),
        });
        return { success: true, id: (result as { insertId: number }).insertId };
      }),

    getLeadNotes: publicProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ input, ctx }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { leadNotes } = await import("../drizzle/schema");
        const { eq, desc } = await import("drizzle-orm");
        const notes = await db.select().from(leadNotes)
          .where(eq(leadNotes.leadId, input.leadId))
          .orderBy(desc(leadNotes.createdAt));
        return notes;
      }),

    deleteLeadNote: publicProcedure
      .input(z.object({ noteId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { leadNotes } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db.delete(leadNotes).where(eq(leadNotes.id, input.noteId));
        return { success: true };
      }),

    // Convert won lead to billing client account
    convertLeadToClient: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { wizardSubmissions } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const [lead] = await db.select().from(wizardSubmissions).where(eq(wizardSubmissions.id, input.id)).limit(1);
        if (!lead) throw new Error("Lead not found");
        // Return prefill data for the create client form
        return {
          clientName: lead.businessName,
          clientEmail: lead.email,
          clientPhone: lead.phone ?? "",
          businessName: lead.businessName,
          websiteUrl: lead.website ?? "",
          assignedTechnicianId: lead.assignedTechnicianId ?? null,
          assignedPartnerId: lead.assignedPartnerId ?? null,
          leadId: lead.id,
        };
      }),
  }),

  scheduling: router({
    // ─── Public: Get available time slots for a given date ───────────────────
    getAvailableSlots: publicProcedure
      .input(z.object({ date: z.string() })) // "YYYY-MM-DD"
      .query(async ({ input }) => {
        const { getAllAvailability, getBlockedDates, getBookingsForDate } = await import("./db");
        const dateObj = new Date(input.date + "T12:00:00Z");
        const dayOfWeek = dateObj.getUTCDay();

        // Check if date is blocked
        const blocked = await getBlockedDates(input.date, input.date);
        if (blocked.length > 0) return { slots: [], blocked: true };

        // Get availability rules for this day
        const rules = (await getAllAvailability()).filter(
          (r) => r.dayOfWeek === dayOfWeek && r.isActive === 1
        );
        if (rules.length === 0) return { slots: [], blocked: false };

        // Get already-booked slots
        const existingBookings = await getBookingsForDate(input.date);
        const bookedTimes = new Set(existingBookings.map((b) => b.startTime));

        // Generate time slots
        const slots: { startTime: string; endTime: string; available: boolean }[] = [];
        for (const rule of rules) {
          const [sh, sm] = rule.startTime.split(":").map(Number);
          const [eh, em] = rule.endTime.split(":").map(Number);
          let current = sh * 60 + sm;
          const end = eh * 60 + em;
          while (current + rule.slotDurationMins <= end) {
            const startH = String(Math.floor(current / 60)).padStart(2, "0");
            const startM = String(current % 60).padStart(2, "0");
            const endMin = current + rule.slotDurationMins;
            const endH = String(Math.floor(endMin / 60)).padStart(2, "0");
            const endMStr = String(endMin % 60).padStart(2, "0");
            const startTime = `${startH}:${startM}`;
            const endTime = `${endH}:${endMStr}`;
            slots.push({ startTime, endTime, available: !bookedTimes.has(startTime) });
            current += rule.slotDurationMins;
          }
        }
        return { slots, blocked: false };
      }),

    // ─── Public: Get availability calendar for a month ───────────────────────
    getMonthAvailability: publicProcedure
      .input(z.object({ year: z.number(), month: z.number() })) // month 1-12
      .query(async ({ input }) => {
        const { getAllAvailability, getBlockedDates, getBookingsInRange } = await import("./db");
        const pad = (n: number) => String(n).padStart(2, "0");
        const fromDate = `${input.year}-${pad(input.month)}-01`;
        const lastDay = new Date(input.year, input.month, 0).getDate();
        const toDate = `${input.year}-${pad(input.month)}-${pad(lastDay)}`;

        const rules = await getAllAvailability();
        const blocked = await getBlockedDates(fromDate, toDate);
        const bookings = await getBookingsInRange(fromDate, toDate);
        const blockedSet = new Set(blocked.map((b) => b.blockedDate));

        // Count booked slots per date
        const bookedCountByDate: Record<string, number> = {};
        for (const b of bookings) {
          bookedCountByDate[b.bookingDate] = (bookedCountByDate[b.bookingDate] ?? 0) + 1;
        }

        const result: Record<string, "available" | "partial" | "full" | "unavailable"> = {};
        for (let d = 1; d <= lastDay; d++) {
          const dateStr = `${input.year}-${pad(input.month)}-${pad(d)}`;
          const dateObj = new Date(dateStr + "T12:00:00Z");
          const dow = dateObj.getUTCDay();
          const dayRules = rules.filter((r) => r.dayOfWeek === dow && r.isActive === 1);

          if (blockedSet.has(dateStr) || dayRules.length === 0) {
            result[dateStr] = "unavailable";
            continue;
          }

          // Count total slots
          let totalSlots = 0;
          for (const rule of dayRules) {
            const [sh, sm] = rule.startTime.split(":").map(Number);
            const [eh, em] = rule.endTime.split(":").map(Number);
            totalSlots += Math.floor(((eh * 60 + em) - (sh * 60 + sm)) / rule.slotDurationMins);
          }
          const booked = bookedCountByDate[dateStr] ?? 0;
          if (booked === 0) result[dateStr] = "available";
          else if (booked >= totalSlots) result[dateStr] = "full";
          else result[dateStr] = "partial";
        }
        return result;
      }),

    // ─── Public: Create a booking ─────────────────────────────────────────────
    createBooking: publicProcedure
      .input(z.object({
        guestName: z.string().min(1),
        guestEmail: z.string().email(),
        guestPhone: z.string().optional(),
        businessName: z.string().optional(),
        notes: z.string().optional(),
        bookingDate: z.string(),  // "YYYY-MM-DD"
        startTime: z.string(),    // "HH:MM"
        endTime: z.string(),      // "HH:MM"
        timezone: z.string().default("America/New_York"),
        /** Questionnaire answers: array of { questionId, answerText } */
        answers: z.array(z.object({
          questionId: z.number(),
          answerText: z.string().nullable(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { getBookingsForDate, createBooking, saveBookingAnswers } = await import("./db");
        // Double-check slot is still available
        const existing = await getBookingsForDate(input.bookingDate);
        const conflict = existing.find((b) => b.startTime === input.startTime);
        if (conflict) throw new Error("This time slot is no longer available. Please choose another.");

        // Generate confirmation code
        const crypto = await import("crypto");
        const code = crypto.randomBytes(4).toString("hex").toUpperCase();

        const { answers, ...bookingData } = input;
        const id = await createBooking({ ...bookingData, confirmationCode: code, status: "confirmed" });

        // Save questionnaire answers
        if (answers && answers.length > 0) {
          await saveBookingAnswers(
            answers.map((a) => ({ bookingId: id, questionId: a.questionId, answerText: a.answerText }))
          );
        }

        // Notify owner
        const { notifyOwner } = await import("./_core/notification");
        const answersText = answers && answers.length > 0
          ? `\n\nQuestionnaire Answers:\n${answers.map((a) => `Q${a.questionId}: ${a.answerText ?? "(no answer)"}`).join("\n")}`
          : "";
        await notifyOwner({
          title: `New Discovery Call Booked: ${input.guestName}`,
          content: `${input.guestName} (${input.businessName ?? ""}) booked a call for ${input.bookingDate} at ${input.startTime}.\nEmail: ${input.guestEmail}\nPhone: ${input.guestPhone ?? "N/A"}\nConfirmation: ${code}${answersText}`,
        });

        // Send confirmation email to guest (non-blocking)
        const { sendBookingConfirmationEmail } = await import("./email");
        sendBookingConfirmationEmail({
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          bookingDate: input.bookingDate,
          startTime: input.startTime,
          endTime: input.endTime,
          confirmationCode: code,
        }).catch((err) => console.error("[Booking] Failed to send confirmation email:", err));

        return { success: true, id, confirmationCode: code };
      }),

    // ─── Public: Cancel a booking by confirmation code ───────────────────────
    cancelBooking: publicProcedure
      .input(z.object({ confirmationCode: z.string(), reason: z.string().optional() }))
      .mutation(async ({ input }) => {
        const { getBookingByConfirmationCode, updateBookingStatus } = await import("./db");
        const booking = await getBookingByConfirmationCode(input.confirmationCode);
        if (!booking) throw new Error("Booking not found");
        if (booking.status !== "confirmed") throw new Error("Booking is already cancelled or completed");
        await updateBookingStatus(booking.id, "cancelled", input.reason);
        return { success: true };
      }),

    // ─── Admin: Get all bookings ──────────────────────────────────────────────
    adminGetBookings: publicProcedure.query(async ({ ctx }) => {
      const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
      if (!token) throw new Error("Unauthorized");
      const { getAdminSession, getAllBookings } = await import("./db");
      const session = await getAdminSession(token);
      if (!session) throw new Error("Unauthorized");
      return await getAllBookings();
    }),

    // ─── Admin: Update booking status ────────────────────────────────────────
    adminUpdateBookingStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["confirmed", "cancelled", "completed", "no_show"]),
        cancelReason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
        if (!token) throw new Error("Unauthorized");
        const { getAdminSession, updateBookingStatus } = await import("./db");
        const session = await getAdminSession(token);
        if (!session) throw new Error("Unauthorized");
        await updateBookingStatus(input.id, input.status, input.cancelReason);
        return { success: true };
      }),

    // ─── Admin: Manage availability ───────────────────────────────────────────
    adminGetAvailability: publicProcedure.query(async ({ ctx }) => {
      const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
      if (!token) throw new Error("Unauthorized");
      const { getAdminSession, getAllAvailability } = await import("./db");
      const session = await getAdminSession(token);
      if (!session) throw new Error("Unauthorized");
      return await getAllAvailability();
    }),

    adminUpsertAvailability: publicProcedure
      .input(z.object({
        id: z.number().optional(),
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string(),
        endTime: z.string(),
        slotDurationMins: z.number().default(30),
        isActive: z.number().default(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
        if (!token) throw new Error("Unauthorized");
        const { getAdminSession, upsertAvailabilitySlot } = await import("./db");
        const session = await getAdminSession(token);
        if (!session) throw new Error("Unauthorized");
        const id = await upsertAvailabilitySlot(input);
        return { success: true, id };
      }),

    adminDeleteAvailability: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
        if (!token) throw new Error("Unauthorized");
        const { getAdminSession, deleteAvailabilitySlot } = await import("./db");
        const session = await getAdminSession(token);
        if (!session) throw new Error("Unauthorized");
        await deleteAvailabilitySlot(input.id);
        return { success: true };
      }),

    // ─── Admin: Blocked dates ─────────────────────────────────────────────────
    adminGetBlockedDates: publicProcedure.query(async ({ ctx }) => {
      const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
      if (!token) throw new Error("Unauthorized");
      const { getAdminSession, getAllBlockedDates } = await import("./db");
      const session = await getAdminSession(token);
      if (!session) throw new Error("Unauthorized");
      return await getAllBlockedDates();
    }),

    adminAddBlockedDate: publicProcedure
      .input(z.object({ blockedDate: z.string(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
        if (!token) throw new Error("Unauthorized");
        const { getAdminSession, addBlockedDate } = await import("./db");
        const session = await getAdminSession(token);
        if (!session) throw new Error("Unauthorized");
        const id = await addBlockedDate(input);
        return { success: true, id };
      }),

    adminRemoveBlockedDate: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
        if (!token) throw new Error("Unauthorized");
        const { getAdminSession, removeBlockedDate } = await import("./db");
        const session = await getAdminSession(token);
        if (!session) throw new Error("Unauthorized");
        await removeBlockedDate(input.id);
        return { success: true };
      }),
  }),

  questionnaire: router({
    // ─── Public: Get active questions for the booking form ─────────────────────────
    getQuestions: publicProcedure.query(async () => {
      const { getActiveQuestions } = await import("./db");
      return await getActiveQuestions();
    }),

    // ─── Admin: Get all questions (including inactive) ──────────────────────────
    adminGetQuestions: publicProcedure.query(async ({ ctx }) => {
      const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
      if (!token) throw new Error("Unauthorized");
      const { getAdminSession, getAllQuestions } = await import("./db");
      const session = await getAdminSession(token);
      if (!session) throw new Error("Unauthorized");
      return await getAllQuestions();
    }),

    // ─── Admin: Create a new question ─────────────────────────────────────────────
    adminCreateQuestion: publicProcedure
      .input(z.object({
        questionText: z.string().min(1),
        fieldType: z.enum(["text", "textarea", "select", "radio", "checkbox"]),
        options: z.string().optional(), // JSON array string
        isRequired: z.number().default(0),
        isActive: z.number().default(1),
        sortOrder: z.number().default(0),
        placeholder: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
        if (!token) throw new Error("Unauthorized");
        const { getAdminSession, createQuestion } = await import("./db");
        const session = await getAdminSession(token);
        if (!session) throw new Error("Unauthorized");
        const id = await createQuestion(input);
        return { success: true, id };
      }),

    // ─── Admin: Update a question ───────────────────────────────────────────────
    adminUpdateQuestion: publicProcedure
      .input(z.object({
        id: z.number(),
        questionText: z.string().min(1).optional(),
        fieldType: z.enum(["text", "textarea", "select", "radio", "checkbox"]).optional(),
        options: z.string().nullable().optional(),
        isRequired: z.number().optional(),
        isActive: z.number().optional(),
        sortOrder: z.number().optional(),
        placeholder: z.string().nullable().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
        if (!token) throw new Error("Unauthorized");
        const { getAdminSession, updateQuestion } = await import("./db");
        const session = await getAdminSession(token);
        if (!session) throw new Error("Unauthorized");
        const { id, ...data } = input;
        await updateQuestion(id, data);
        return { success: true };
      }),

    // ─── Admin: Delete a question ───────────────────────────────────────────────
    adminDeleteQuestion: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
        if (!token) throw new Error("Unauthorized");
        const { getAdminSession, deleteQuestion } = await import("./db");
        const session = await getAdminSession(token);
        if (!session) throw new Error("Unauthorized");
        await deleteQuestion(input.id);
        return { success: true };
      }),

    // ─── Admin: Reorder questions (bulk sort order update) ──────────────────────
    adminReorderQuestions: publicProcedure
      .input(z.array(z.object({ id: z.number(), sortOrder: z.number() })))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
        if (!token) throw new Error("Unauthorized");
        const { getAdminSession, updateQuestion } = await import("./db");
        const session = await getAdminSession(token);
        if (!session) throw new Error("Unauthorized");
        await Promise.all(input.map((q) => updateQuestion(q.id, { sortOrder: q.sortOrder })));
        return { success: true };
      }),

    // ─── Admin: Get answers for a specific booking ───────────────────────────
    adminGetBookingAnswers: publicProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
        if (!token) throw new Error("Unauthorized");
        const { getAdminSession, getAnswersForBooking } = await import("./db");
        const session = await getAdminSession(token);
        if (!session) throw new Error("Unauthorized");
        return await getAnswersForBooking(input.bookingId);
      }),
  }),
  budgetQuote: router({
    // ─── Public: Save a completed budget wizard quote ─────────────────────────
    save: publicProcedure
      .input(z.object({
        prospectName: z.string().optional(),
        prospectEmail: z.string().email().optional(),
        prospectPhone: z.string().optional(),
        industry: z.string(),
        basePackage: z.string(),
        coreAddons: z.array(z.string()),
        autoAddons: z.array(z.string()),
        industryAddons: z.array(z.string()),
        subscriptionTier: z.string(),
        monthlyPrice: z.number(),
        paymentPlan: z.string(),
        buildCostMin: z.number(),
        buildCostMax: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db");
        const { budgetQuotes } = await import("../drizzle/schema");
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const [result] = await db.insert(budgetQuotes).values({
          prospectName: input.prospectName,
          prospectEmail: input.prospectEmail,
          prospectPhone: input.prospectPhone,
          industry: input.industry,
          basePackage: input.basePackage,
          coreAddons: JSON.stringify(input.coreAddons),
          autoAddons: JSON.stringify(input.autoAddons),
          industryAddons: JSON.stringify(input.industryAddons),
          subscriptionTier: input.subscriptionTier,
          monthlyPrice: input.monthlyPrice,
          paymentPlan: input.paymentPlan,
          buildCostMin: input.buildCostMin,
          buildCostMax: input.buildCostMax,
          status: "new",
        });

        // Send owner notification
        const { notifyOwner } = await import("./_core/notification");
        const buildRange = input.buildCostMin === input.buildCostMax
          ? `$${input.buildCostMin.toLocaleString()}`
          : `$${input.buildCostMin.toLocaleString()} – $${input.buildCostMax.toLocaleString()}`;
        const prospectLine = input.prospectName
          ? `Name: ${input.prospectName}\nEmail: ${input.prospectEmail ?? "N/A"}\nPhone: ${input.prospectPhone ?? "N/A"}\n\n`
          : "";
        await notifyOwner({
          title: `New Budget Quote: ${input.industry} — ${buildRange}`,
          content: `${prospectLine}Industry: ${input.industry}\nPackage: ${input.basePackage}\nBuild Cost: ${buildRange}\nMonthly Plan: ${input.subscriptionTier} ($${input.monthlyPrice}/mo)\nPayment Plan: ${input.paymentPlan}\n\nAdd-ons selected: ${[...input.coreAddons, ...input.autoAddons, ...input.industryAddons].length}\n\nView in admin: https://flow-sites.com/admin`,
        }).catch((err) => console.error("[BudgetQuote] Notify owner failed:", err));

        // Send email via Resend if prospect email provided
        if (input.prospectEmail) {
          const { sendBudgetQuoteEmail } = await import("./email");
          sendBudgetQuoteEmail({
            prospectName: input.prospectName ?? "there",
            prospectEmail: input.prospectEmail,
            industry: input.industry,
            basePackage: input.basePackage,
            buildCostMin: input.buildCostMin,
            buildCostMax: input.buildCostMax,
            subscriptionTier: input.subscriptionTier,
            monthlyPrice: input.monthlyPrice,
            paymentPlan: input.paymentPlan,
          }).catch((err) => console.error("[BudgetQuote] Email failed:", err));
        }

        return { success: true };
      }),

    // ─── Admin: Get all budget quotes ─────────────────────────────────────────
    adminList: publicProcedure.query(async ({ ctx }) => {
      const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
      if (!token) throw new Error("Unauthorized");
      const { getAdminSession, getDb } = await import("./db");
      const session = await getAdminSession(token);
      if (!session) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { budgetQuotes } = await import("../drizzle/schema");
      const { desc } = await import("drizzle-orm");
      return await db.select().from(budgetQuotes).orderBy(desc(budgetQuotes.createdAt));
    }),

    // ─── Admin: Update quote status ───────────────────────────────────────────
    adminUpdateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "proposal_sent", "won", "lost"]),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
        if (!token) throw new Error("Unauthorized");
        const { getAdminSession, getDb } = await import("./db");
        const session = await getAdminSession(token);
        if (!session) throw new Error("Unauthorized");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { budgetQuotes } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db.update(budgetQuotes)
          .set({ status: input.status, adminNotes: input.adminNotes })
          .where(eq(budgetQuotes.id, input.id));
        return { success: true };
      }),

    // ─── Admin: Convert a budget quote into a client account ─────────────────
    convertToClient: publicProcedure
      .input(z.object({
        quoteId: z.number(),
        clientName: z.string(),
        clientEmail: z.string().email(),
        clientPhone: z.string().optional(),
        businessName: z.string(),
        websiteUrl: z.string().optional(),
        monthlyPriceCents: z.number(),
        billingStartDate: z.string().optional(),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
        if (!token) throw new Error("Unauthorized");
        const { getAdminSession, getDb } = await import("./db");
        const session = await getAdminSession(token);
        if (!session) throw new Error("Unauthorized");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { budgetQuotes, clientAccounts } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const crypto = await import("crypto");
        // Create client account
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
        });
        const newAccountId = (result as any).insertId as number;
        // Mark the quote as won
        await db.update(budgetQuotes)
          .set({ status: "won", adminNotes: `Converted to client account #${newAccountId}${input.adminNotes ? ` — ${input.adminNotes}` : ""}` })
          .where(eq(budgetQuotes.id, input.quoteId));
        return { success: true, clientAccountId: newAccountId };
      }),
  }),


  // ─── Admin: Client Project Management ────────────────────────────────────────
  adminProjects: router({
    list: publicProcedure.query(async ({ ctx }) => {
      await requireAdminAccess(ctx);
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { clientProjects } = await import("../drizzle/schema");
      const { desc } = await import("drizzle-orm");
      return await db.select().from(clientProjects).orderBy(desc(clientProjects.createdAt));
    }),

    create: publicProcedure
      .input(z.object({
        clientName: z.string(),
        clientEmail: z.string().email(),
        clientPhone: z.string().optional(),
        businessName: z.string(),
        websiteDomain: z.string().optional(),
        packageName: z.string().optional(),
        monthlyPrice: z.number().optional(),
        estimatedLaunchDate: z.string().optional(),
        clientMessage: z.string().optional(),
        setupFee: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { clientProjects } = await import("../drizzle/schema");
        // Generate access token
        const crypto = await import("crypto");
        const accessToken = crypto.randomBytes(32).toString("hex");
        const [result] = await db.insert(clientProjects).values({
          ...input,
          accessToken,
          status: "onboarding",
          currentStage: 0,
          stageProgress: 0,
        });

        // Auto-send welcome email + SMS to the client
        const portalUrl = `https://flow-sites.com/client-portal?token=${accessToken}`;

        try {
          const { sendProjectWelcomeEmail } = await import("./email");
          await sendProjectWelcomeEmail({
            clientName: input.clientName,
            clientEmail: input.clientEmail,
            businessName: input.businessName,
            packageName: input.packageName,
            monthlyPrice: input.monthlyPrice,
            portalUrl,
          });
        } catch (emailErr) {
          // Non-fatal: log but don't fail the project creation
          console.error("[Project] Failed to send welcome email:", emailErr);
        }

        if (input.clientPhone) {
          try {
            const { sendProjectWelcomeSms } = await import("./sms");
            await sendProjectWelcomeSms({
              clientName: input.clientName,
              clientPhone: input.clientPhone,
              businessName: input.businessName,
              monthlyPrice: input.monthlyPrice,
              portalUrl,
            });
          } catch (smsErr) {
            // Non-fatal: log but don't fail the project creation
            console.error("[Project] Failed to send welcome SMS:", smsErr);
          }
        }

        return { success: true, accessToken };
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["onboarding", "design", "development", "review", "revisions", "launch", "maintenance", "paused"]).optional(),
        currentStage: z.number().min(0).max(7).optional(),
        stageProgress: z.number().min(0).max(100).optional(),
        previewUrl: z.string().optional(),
        websiteDomain: z.string().optional(),
        clientMessage: z.string().optional(),
        adminNotes: z.string().optional(),
        estimatedLaunchDate: z.string().optional(),
        githubRepos: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { clientProjects } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const { id, ...updates } = input;
        await db.update(clientProjects).set(updates).where(eq(clientProjects.id, id));
        return { success: true };
      }),

    // Resend welcome SMS to a client for an existing project
    resendWelcomeSms: publicProcedure
      .input(z.object({ projectId: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { clientProjects } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        const [project] = await db
          .select()
          .from(clientProjects)
          .where(eq(clientProjects.id, input.projectId))
          .limit(1);
        if (!project) throw new Error("Project not found");
        if (!project.clientPhone) throw new Error("No phone number on file for this client");

        const { sendProjectWelcomeSms } = await import("./sms");
        const portalUrl = `https://flow-sites.com/client-portal?token=${project.accessToken}`;
        const sent = await sendProjectWelcomeSms({
          clientName: project.clientName,
          clientPhone: project.clientPhone,
          businessName: project.businessName,
          monthlyPrice: project.monthlyPrice ?? undefined,
          portalUrl,
        });

        if (!sent) throw new Error("SMS could not be sent. Check Twilio credentials in Settings.");
        return { success: true };
      }),

    // Sync existing customer accounts as projects (bulk import)
    syncFromCustomers: publicProcedure.mutation(async ({ ctx }) => {
      await requireAdminAccess(ctx);
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { clientAccounts, clientProjects } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const crypto = await import("crypto");

      // Fetch all customers that don't already have a linked project
      const accounts = await db.select().from(clientAccounts);
      const existingProjects = await db.select().from(clientProjects);
      const existingEmails = new Set(existingProjects.map((p) => p.clientEmail.toLowerCase()));

      const toCreate = accounts.filter(
        (a) => !existingEmails.has(a.clientEmail.toLowerCase())
      );

      if (toCreate.length === 0) {
        return { created: 0, skipped: accounts.length, message: "All customers already have projects." };
      }

      let created = 0;
      for (const account of toCreate) {
        const accessToken = crypto.randomBytes(32).toString("hex");
        const monthlyPrice = account.monthlyPriceCents ? Math.round(account.monthlyPriceCents / 100) : undefined;
        await db.insert(clientProjects).values({
          clientName: account.clientName,
          clientEmail: account.clientEmail,
          clientPhone: account.clientPhone ?? undefined,
          businessName: account.businessName,
          websiteDomain: account.websiteUrl ?? undefined,
          packageName: undefined,
          monthlyPrice,
          accessToken,
          status: "onboarding",
          currentStage: 0,
          stageProgress: 0,
        });
        // Update the customer record to link the new project
        const [newProject] = await db
          .select()
          .from(clientProjects)
          .where(eq(clientProjects.accessToken, accessToken))
          .limit(1);
        if (newProject) {
          await db
            .update(clientAccounts)
            .set({ projectId: newProject.id })
            .where(eq(clientAccounts.id, account.id));
        }
        created++;
      }

      return {
        created,
        skipped: accounts.length - toCreate.length,
        message: `Created ${created} project${created !== 1 ? "s" : ""} from existing customers.`,
      };
    }),

    // Get all change requests (admin view)
    listChangeRequests: publicProcedure.query(async ({ ctx }) => {
      await requireAdminAccess(ctx);
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { changeRequests, clientProjects } = await import("../drizzle/schema");
      const { desc, eq } = await import("drizzle-orm");
      const requests = await db.select().from(changeRequests).orderBy(desc(changeRequests.createdAt));
      // Attach project info
      const projects = await db.select().from(clientProjects);
      return requests.map((r) => ({
        ...r,
        project: projects.find((p) => p.id === r.projectId) ?? null,
      }));
    }),

    updateChangeRequest: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "in_review", "approved", "in_progress", "completed", "declined"]).optional(),
        adminResponse: z.string().optional(),
        estimatedHours: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { changeRequests } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const { id, ...updates } = input;
        await db.update(changeRequests).set(updates).where(eq(changeRequests.id, id));
        return { success: true };
      }),

    // List all feature upgrade requests (admin view)
    listUpgradeRequests: publicProcedure.query(async ({ ctx }) => {
      await requireAdminAccess(ctx);
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { featureUpgradeRequests, clientProjects } = await import("../drizzle/schema");
      const { desc } = await import("drizzle-orm");
      const requests = await db.select().from(featureUpgradeRequests).orderBy(desc(featureUpgradeRequests.createdAt));
      const projects = await db.select().from(clientProjects);
      return requests.map((r) => ({
        ...r,
        businessName: projects.find((p) => p.id === r.projectId)?.businessName ?? null,
      }));
    }),

    updateUpgradeRequest: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "quoted", "approved", "in_progress", "completed", "declined"]).optional(),
        adminResponse: z.string().optional(),
        agreedPrice: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await requireAdminAccess(ctx);
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { featureUpgradeRequests } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const { id, ...updates } = input;
        await db.update(featureUpgradeRequests).set(updates).where(eq(featureUpgradeRequests.id, id));
        return { success: true };
      }),
  }),
  contact: router({
    /** Public contact form submission — saves lead and sends SMS notification via 800.com */
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        businessName: z.string().min(1).max(200),
        email: z.string().email(),
        phone: z.string().min(7).max(20),
        lookingFor: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        // Save to database as a wizard submission / lead
        const { createWizardSubmission } = await import("./db");
        const submission = await createWizardSubmission({
          businessName: input.businessName,
          businessType: "other",
          website: "",
          phone: input.phone,
          email: input.email,
          colorScheme: "not_specified",
          primaryGoal: input.lookingFor,
          timeline: "flexible",
          additionalNotes: `Contact form submission from ${input.name}. Looking for: ${input.lookingFor}`,
          source: "website",
        });

        // Send SMS notification to FlowSites team via 800.com
        const { sendSms } = await import("./800com");
        const { ENV } = await import("./_core/env");
        if (ENV.eightHundredSenderNumber) {
          // Send to the team's tracking number so it shows up in 800.com inbox
          await sendSms({
            recipient: ENV.eightHundredSenderNumber,
            message: `New Contact Form Lead!\n\nName: ${input.name}\nBusiness: ${input.businessName}\nPhone: ${input.phone}\nEmail: ${input.email}\nLooking for: ${input.lookingFor}\n\nLog in to admin to follow up.`,
          });
        }

        // Also send owner notification
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: `New Contact Form: ${input.businessName}`,
          content: `${input.name} from ${input.businessName} submitted the contact form.\n\nEmail: ${input.email}\nPhone: ${input.phone}\nLooking for: ${input.lookingFor}`,
        });

        return { success: true, id: submission.id };
      }),
  }),
  leads: router({
    captureExitIntent: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional().default(""),
        website: z.string().optional().default(""),
        analysisScores: z.object({
          performance: z.number(),
          seo: z.number(),
          accessibility: z.number(),
          bestPractices: z.number(),
          loadTime: z.number(),
          mobileScore: z.number(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        const { createWizardSubmission } = await import("./db");
        const scores = input.analysisScores;
        const additionalNotes = scores
          ? `Exit-intent lead. Site: ${input.website}. Scores - Perf: ${scores.performance}, SEO: ${scores.seo}, A11y: ${scores.accessibility}, BP: ${scores.bestPractices}, Load: ${scores.loadTime.toFixed(1)}s, Mobile: ${scores.mobileScore}`
          : `Exit-intent lead. Site: ${input.website}`;
        const submission = await createWizardSubmission({
          businessName: input.name,
          businessType: "exit_intent",
          website: input.website,
          phone: input.phone,
          email: input.email,
          colorScheme: "not_specified",
          primaryGoal: "Free website analysis via exit-intent popup",
          timeline: "asap",
          additionalNotes,
        });
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: `Exit-Intent Lead: ${input.name}`,
          content: `${input.name} requested a free website analysis.\n\nEmail: ${input.email}\nPhone: ${input.phone || 'N/A'}\nWebsite: ${input.website || 'N/A'}\n\n${additionalNotes}`,
        });
        return { success: true, id: submission.id };
      }),
  }),
  communications: communicationsRouter,
  learning: learningRouter,
  clientPortalAuth: clientPortalAuthRouter,
  bookings: bookingsRouter,
  marketing: router({
    /** Public opt-in form — email blast landing page */
    submitOptin: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          email: z.string().email().max(320),
          phone: z.string().min(1).max(50),
          businessName: z.string().min(1).max(255),
          website: z.string().max(500).optional(),
          source: z.string().max(100).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db");
        const { marketingOptins } = await import("../drizzle/schema");
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        await db.insert(marketingOptins).values({
          name: input.name,
          email: input.email,
          phone: input.phone,
          businessName: input.businessName,
          website: input.website ?? null,
          source: input.source ?? "email_blast",
        });
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: `✅ New Opt-In: ${input.businessName}`,
          content: `${input.name} from ${input.businessName} opted in via the email blast.\n\nEmail: ${input.email}\nPhone: ${input.phone}\nWebsite: ${input.website ?? 'N/A'}`,
        });
        return { success: true };
      }),
    /** Admin: get all opt-ins */
    getOptins: publicProcedure.query(async ({ ctx }) => {
      await requireAdminAccess(ctx);
      const { getDb } = await import("./db");
      const { marketingOptins } = await import("../drizzle/schema");
      const { desc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      return db.select().from(marketingOptins).orderBy(desc(marketingOptins.createdAt));
    }),
  }),
});
export type AppRouter = typeof appRouter;

