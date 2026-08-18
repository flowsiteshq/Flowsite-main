import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import nodeCrypto from "crypto";
import type { TrpcContext } from "../_core/context";

/**
 * Check admin access: accepts either admin_session cookie OR a technician with an admin-level role.
 * Mirrors the requireAdminAccess helper in routers.ts.
 */
async function checkIsAdmin(ctx: TrpcContext): Promise<boolean> {
  // 1. Check admin password session cookie
  const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
  if (token) {
    const { getAdminSession } = await import("../db");
    const session = await getAdminSession(token);
    if (session) return true;
  }
  // 2. Check users table role (owner)
  if (ctx.user?.role === "admin") return true;
  // 3. Check technicians table
  if (ctx.user?.openId) {
    const { getDb } = await import("../db");
    const { technicians } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (db) {
      const rows = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
      const tech = rows[0];
      const ALLOWED_ROLES = ["admin", "admin_manager", "sales_rep"];
      if (tech && tech.status === "active" && ALLOWED_ROLES.includes(tech.role)) return true;
    }
  }
  return false;
}

/**
 * Client Portal Router
 * Handles project tracking, messaging, and change requests for clients.
 * Also includes admin procedures for managing projects.
 */
export const clientPortalRouter = router({

  // ─── CLIENT: Get my project ─────────────────────────────────────────────────
  getMyProject: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { clientProjects } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [project] = await db
      .select()
      .from(clientProjects)
      .where(eq(clientProjects.clientOpenId, ctx.user.openId))
      .limit(1);

    return project ?? null;
  }),

  // ─── CLIENT: Get messages for my project ────────────────────────────────────
  getMessages: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { projectMessages, clientProjects } = await import("../../drizzle/schema");
      const { eq, and, asc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify project belongs to this client
      const [project] = await db
        .select()
        .from(clientProjects)
        .where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientOpenId, ctx.user.openId)))
        .limit(1);
      if (!project) throw new Error("Project not found");

      // Mark staff messages as read
      await db
        .update(projectMessages)
        .set({ isRead: 1 })
        .where(and(eq(projectMessages.projectId, input.projectId), eq(projectMessages.senderRole, "staff")));

      return db
        .select()
        .from(projectMessages)
        .where(eq(projectMessages.projectId, input.projectId))
        .orderBy(asc(projectMessages.createdAt));
    }),

  // ─── CLIENT: Send a message ──────────────────────────────────────────────────
  sendMessage: protectedProcedure
    .input(z.object({ projectId: z.number(), message: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { projectMessages, clientProjects } = await import("../../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify project belongs to this client
      const [project] = await db
        .select()
        .from(clientProjects)
        .where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientOpenId, ctx.user.openId)))
        .limit(1);
      if (!project) throw new Error("Project not found");

      await db.insert(projectMessages).values({
        projectId: input.projectId,
        senderRole: "client",
        senderName: ctx.user.name ?? "Client",
        message: input.message,
        isRead: 0,
      });

      // Notify owner of new client message
      const { notifyOwner } = await import("../_core/notification");
      await notifyOwner({
        title: `New message from ${project.clientName}`,
        content: `Project: ${project.businessName}\n\n${input.message}`,
      });

      return { success: true };
    }),

  // ─── CLIENT: Get my change requests ─────────────────────────────────────────
  getChangeRequests: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { changeRequests, clientProjects } = await import("../../drizzle/schema");
      const { eq, and, desc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify project belongs to this client
      const [project] = await db
        .select()
        .from(clientProjects)
        .where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientOpenId, ctx.user.openId)))
        .limit(1);
      if (!project) throw new Error("Project not found");

      return db
        .select()
        .from(changeRequests)
        .where(eq(changeRequests.projectId, input.projectId))
        .orderBy(desc(changeRequests.createdAt));
    }),

  // ─── CLIENT: Submit a change request ────────────────────────────────────────
  submitChangeRequest: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      title: z.string().min(3).max(255),
      description: z.string().min(10).max(3000),
      priority: z.enum(["low", "medium", "high"]).default("medium"),
      pageSection: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { changeRequests, clientProjects } = await import("../../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify project belongs to this client
      const [project] = await db
        .select()
        .from(clientProjects)
        .where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientOpenId, ctx.user.openId)))
        .limit(1);
      if (!project) throw new Error("Project not found");

      await db.insert(changeRequests).values({
        projectId: input.projectId,
        clientOpenId: ctx.user.openId,
        clientName: ctx.user.name ?? "Client",
        title: input.title,
        description: input.description,
        priority: input.priority,
        pageSection: input.pageSection,
        status: "pending",
      });

      // Notify owner
      const { notifyOwner } = await import("../_core/notification");
      await notifyOwner({
        title: `New change request: ${input.title}`,
        content: `Project: ${project.businessName}\nPriority: ${input.priority}\n\n${input.description}`,
      });

      return { success: true };
    }),

  // ─── ADMIN: Get all projects ─────────────────────────────────────────────────
  adminGetProjects: publicProcedure.query(async ({ ctx }) => {
    const token = (ctx.req as any).cookies?.admin_session || ((ctx.req as any).headers["x-admin-token"] as string | undefined);
    if (!token) throw new Error("Unauthorized");
    const { getAdminSession, getDb } = await import("../db");
    const session = await getAdminSession(token);
    if (!session) throw new Error("Unauthorized");

    const { clientProjects } = await import("../../drizzle/schema");
    const { desc } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db.select().from(clientProjects).orderBy(desc(clientProjects.createdAt));
  }),

  // ─── ADMIN: Create a project ─────────────────────────────────────────────────
  adminCreateProject: publicProcedure
    .input(z.object({
      clientName: z.string(),
      clientEmail: z.string().email(),
      clientPhone: z.string().optional(),
      businessName: z.string(),
      websiteDomain: z.string().optional(),
      packageName: z.string().optional(),
      setupFee: z.number().optional(),
      monthlyPrice: z.number().optional(),
      estimatedLaunchDate: z.string().optional(),
      clientMessage: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const token = (ctx.req as any).cookies?.admin_session || ((ctx.req as any).headers["x-admin-token"] as string | undefined);
      if (!token) throw new Error("Unauthorized");
      const { getAdminSession, getDb } = await import("../db");
      const session = await getAdminSession(token);
      if (!session) throw new Error("Unauthorized");

      const { clientProjects } = await import("../../drizzle/schema");
      const crypto = await import("crypto");
      const accessToken = crypto.randomBytes(32).toString("hex");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(clientProjects).values({
        ...input,
        accessToken,
        status: "onboarding",
        currentStage: 0,
        stageProgress: 0,
      });

      return { success: true, id: (result as any).insertId, accessToken };
    }),

  // ─── ADMIN: Update project ───────────────────────────────────────────────────
  adminUpdateProject: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["onboarding", "design", "development", "review", "revisions", "launch", "maintenance", "paused"]).optional(),
      currentStage: z.number().min(0).max(7).optional(),
      stageProgress: z.number().min(0).max(100).optional(),
      clientMessage: z.string().optional(),
      adminNotes: z.string().optional(),
      previewUrl: z.string().optional(),
      websiteDomain: z.string().optional(),
      estimatedLaunchDate: z.string().optional(),
      setupFee: z.number().optional(),
      monthlyPrice: z.number().optional(),
      packageName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const token = (ctx.req as any).cookies?.admin_session || ((ctx.req as any).headers["x-admin-token"] as string | undefined);
      if (!token) throw new Error("Unauthorized");
      const { getAdminSession, getDb } = await import("../db");
      const session = await getAdminSession(token);
      if (!session) throw new Error("Unauthorized");

      const { clientProjects } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updates } = input;
      await db.update(clientProjects).set(updates).where(eq(clientProjects.id, id));
      return { success: true };
    }),

  // ─── ADMIN: Link project to client by email ──────────────────────────────────
  adminLinkClient: publicProcedure
    .input(z.object({ projectId: z.number(), clientOpenId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const token = (ctx.req as any).cookies?.admin_session || ((ctx.req as any).headers["x-admin-token"] as string | undefined);
      if (!token) throw new Error("Unauthorized");
      const { getAdminSession, getDb } = await import("../db");
      const session = await getAdminSession(token);
      if (!session) throw new Error("Unauthorized");

      const { clientProjects } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(clientProjects).set({ clientOpenId: input.clientOpenId }).where(eq(clientProjects.id, input.projectId));
      return { success: true };
    }),

  // ─── ADMIN: Get messages for a project ──────────────────────────────────────
  adminGetMessages: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const token = (ctx.req as any).cookies?.admin_session || ((ctx.req as any).headers["x-admin-token"] as string | undefined);
      if (!token) throw new Error("Unauthorized");
      const { getAdminSession, getDb } = await import("../db");
      const session = await getAdminSession(token);
      if (!session) throw new Error("Unauthorized");

      const { projectMessages } = await import("../../drizzle/schema");
      const { eq, asc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return db.select().from(projectMessages).where(eq(projectMessages.projectId, input.projectId)).orderBy(asc(projectMessages.createdAt));
    }),

  // ─── ADMIN: Send a message to client ────────────────────────────────────────
  adminSendMessage: publicProcedure
    .input(z.object({ projectId: z.number(), message: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const token = (ctx.req as any).cookies?.admin_session || ((ctx.req as any).headers["x-admin-token"] as string | undefined);
      if (!token) throw new Error("Unauthorized");
      const { getAdminSession, getDb } = await import("../db");
      const session = await getAdminSession(token);
      if (!session) throw new Error("Unauthorized");

      const { projectMessages } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(projectMessages).values({
        projectId: input.projectId,
        senderRole: "staff",
        senderName: "FlowSites Team",
        message: input.message,
        isRead: 0,
      });

      return { success: true };
    }),

  // ─── ADMIN: Get all change requests ─────────────────────────────────────────
  adminGetChangeRequests: publicProcedure
    .input(z.object({ projectId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const token = (ctx.req as any).cookies?.admin_session || ((ctx.req as any).headers["x-admin-token"] as string | undefined);
      if (!token) throw new Error("Unauthorized");
      const { getAdminSession, getDb } = await import("../db");
      const session = await getAdminSession(token);
      if (!session) throw new Error("Unauthorized");

      const { changeRequests } = await import("../../drizzle/schema");
      const { eq, desc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const query = db.select().from(changeRequests).orderBy(desc(changeRequests.createdAt));
      if (input.projectId) {
        return db.select().from(changeRequests).where(eq(changeRequests.projectId, input.projectId)).orderBy(desc(changeRequests.createdAt));
      }
      return query;
    }),

  // ─── ADMIN: Update change request status ────────────────────────────────────
  adminUpdateChangeRequest: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "in_review", "approved", "in_progress", "completed", "declined"]),
      adminResponse: z.string().optional(),
      estimatedHours: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const token = (ctx.req as any).cookies?.admin_session || ((ctx.req as any).headers["x-admin-token"] as string | undefined);
      if (!token) throw new Error("Unauthorized");
      const { getAdminSession, getDb } = await import("../db");
      const session = await getAdminSession(token);
      if (!session) throw new Error("Unauthorized");

      const { changeRequests } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updates } = input;
      await db.update(changeRequests).set(updates).where(eq(changeRequests.id, id));
      return { success: true };
    }),

  // ─── CLIENT: Request a feature upgrade ─────────────────────────────────────────────────
  requestFeatureUpgrade: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      featureId: z.string(),
      featureLabel: z.string(),
      featurePrice: z.number(),
      clientNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { featureUpgradeRequests, clientProjects } = await import("../../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify project belongs to this client
      const [project] = await db
        .select()
        .from(clientProjects)
        .where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientOpenId, ctx.user.openId)))
        .limit(1);
      if (!project) throw new Error("Project not found");

      await db.insert(featureUpgradeRequests).values({
        projectId: input.projectId,
        clientOpenId: ctx.user.openId,
        clientName: ctx.user.name ?? "Client",
        featureId: input.featureId,
        featureLabel: input.featureLabel,
        featurePrice: input.featurePrice,
        clientNotes: input.clientNotes,
        status: "pending",
      });

      // Notify owner
      const { notifyOwner } = await import("../_core/notification");
      await notifyOwner({
        title: `Feature upgrade request: ${input.featureLabel}`,
        content: `Project: ${project.businessName}\nFeature: ${input.featureLabel} ($${input.featurePrice})\n${input.clientNotes ? "Notes: " + input.clientNotes : ""}`,
      });

      return { success: true };
    }),

  // ─── CLIENT: Get my feature upgrade requests ──────────────────────────────────────────────
  getMyUpgradeRequests: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { featureUpgradeRequests, clientProjects } = await import("../../drizzle/schema");
      const { eq, and, desc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify project belongs to this client
      const [project] = await db
        .select()
        .from(clientProjects)
        .where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientOpenId, ctx.user.openId)))
        .limit(1);
      if (!project) throw new Error("Project not found");

      return db
        .select()
        .from(featureUpgradeRequests)
        .where(eq(featureUpgradeRequests.projectId, input.projectId))
        .orderBy(desc(featureUpgradeRequests.createdAt));
    }),

  // ─── ADMIN: Get all feature upgrade requests ──────────────────────────────────────────────
  adminGetUpgradeRequests: publicProcedure
    .input(z.object({ projectId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const token = (ctx.req as any).cookies?.admin_session || ((ctx.req as any).headers["x-admin-token"] as string | undefined);
      if (!token) throw new Error("Unauthorized");
      const { getAdminSession, getDb } = await import("../db");
      const session = await getAdminSession(token);
      if (!session) throw new Error("Unauthorized");

      const { featureUpgradeRequests } = await import("../../drizzle/schema");
      const { eq, desc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (input.projectId) {
        return db.select().from(featureUpgradeRequests).where(eq(featureUpgradeRequests.projectId, input.projectId)).orderBy(desc(featureUpgradeRequests.createdAt));
      }
      return db.select().from(featureUpgradeRequests).orderBy(desc(featureUpgradeRequests.createdAt));
    }),

  // ─── ADMIN: Update feature upgrade request status ───────────────────────────────────────────
  adminUpdateUpgradeRequest: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "quoted", "approved", "in_progress", "completed", "declined"]),
      adminResponse: z.string().optional(),
      agreedPrice: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const token = (ctx.req as any).cookies?.admin_session || ((ctx.req as any).headers["x-admin-token"] as string | undefined);
      if (!token) throw new Error("Unauthorized");
      const { getAdminSession, getDb } = await import("../db");
      const session = await getAdminSession(token);
      if (!session) throw new Error("Unauthorized");

      const { featureUpgradeRequests } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updates } = input;
      await db.update(featureUpgradeRequests).set(updates).where(eq(featureUpgradeRequests.id, id));
      return { success: true };
    }),

  // ─── CLIENT: Get real analytics (PageSpeed + DB activity) ─────────────────
  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { clientProjects, changeRequests, projectMessages, clientAccounts } = await import("../../drizzle/schema");
    const { eq, and, gte, count } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [project] = await db
      .select()
      .from(clientProjects)
      .where(eq(clientProjects.clientOpenId, ctx.user.openId))
      .limit(1);

    if (!project) throw new Error("No project found");

    const [account] = await db
      .select()
      .from(clientAccounts)
      .where(eq(clientAccounts.clientOpenId, ctx.user.openId))
      .limit(1);

    const rawUrl = account?.websiteUrl ?? project.websiteDomain ?? null;
    const websiteUrl = rawUrl
      ? rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`
      : null;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [requestCount] = await db
      .select({ total: count() })
      .from(changeRequests)
      .where(and(eq(changeRequests.projectId, project.id), gte(changeRequests.createdAt, thirtyDaysAgo)));

    const [messageCount] = await db
      .select({ total: count() })
      .from(projectMessages)
      .where(and(eq(projectMessages.projectId, project.id), gte(projectMessages.createdAt, thirtyDaysAgo)));

    let pagespeed: {
      performance: number | null;
      seo: number | null;
      accessibility: number | null;
      bestPractices: number | null;
      loadTime: number | null;
      issues: Array<{ title: string; description: string; severity: string }>;
      recommendations: string[];
    } | null = null;

    if (websiteUrl) {
      try {
        const { analyzeWebsite } = await import("../pagespeed");
        const result = await analyzeWebsite(websiteUrl);
        pagespeed = {
          performance: result.performance,
          seo: result.seo,
          accessibility: result.accessibility,
          bestPractices: result.bestPractices,
          loadTime: result.loadTime,
          issues: result.issues,
          recommendations: result.recommendations,
        };
      } catch {
        // PageSpeed unavailable — return null scores
      }
    }

    return {
      websiteUrl,
      hasWebsite: !!websiteUrl,
      pagespeed,
      activity: {
        changeRequestsLast30Days: requestCount?.total ?? 0,
        messagesLast30Days: messageCount?.total ?? 0,
      },
      projectStatus: project.status,
      analyzedAt: new Date().toISOString(),
    };
  }),

  // ─── CLIENT: Claim project via access token ──────────────────────────────────
  claimProject: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { clientProjects } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [project] = await db
        .select()
        .from(clientProjects)
        .where(eq(clientProjects.accessToken, input.token))
        .limit(1);

      if (!project) throw new Error("Invalid access token");
      if (project.clientOpenId && project.clientOpenId !== ctx.user.openId) {
        throw new Error("This project is already claimed by another account");
      }

      await db.update(clientProjects).set({ clientOpenId: ctx.user.openId }).where(eq(clientProjects.id, project.id));
      return { success: true, projectId: project.id };
    }),

  // ─── ADMIN: Generate a short-lived impersonation token to preview any client portal ─────
  adminGenerateImpersonationToken: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await checkIsAdmin(ctx);
      if (!isAdmin) throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
      const { getDb } = await import("../db");
      const { clientProjects, adminImpersonationTokens } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [project] = await db.select().from(clientProjects).where(eq(clientProjects.id, input.projectId)).limit(1);
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });

      const token = nodeCrypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await db.insert(adminImpersonationTokens).values({
        token,
        projectId: input.projectId,
        createdByAdminId: ctx.user.openId,
        expiresAt,
      });
      return { token };
    }),

  // ─── ADMIN: Validate impersonation token and return project data ─────────────
  getProjectByImpersonationToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const { getDb } = await import("../db");
      const { adminImpersonationTokens, clientProjects } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [row] = await db.select().from(adminImpersonationTokens).where(eq(adminImpersonationTokens.token, input.token)).limit(1);
      if (!row || new Date() > row.expiresAt) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired preview token" });

      const [project] = await db.select().from(clientProjects).where(eq(clientProjects.id, row.projectId)).limit(1);
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      return project;
    }),

  // ─── HEATMAP: Record a click event (public — called by tracking snippet) ──────
  recordHeatmapClick: publicProcedure
    .input(z.object({
      projectId: z.number(),
      pagePath: z.string().max(500).default("/"),
      xPct: z.number().min(0).max(1),
      yPct: z.number().min(0).max(1),
      sessionId: z.string().max(64).optional(),
      deviceType: z.enum(["desktop", "mobile", "tablet"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { getDb } = await import("../db");
      const { heatmapClicks } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) return { ok: false };
      await db.insert(heatmapClicks).values({
        projectId: input.projectId,
        pagePath: input.pagePath,
        xPct: input.xPct,
        yPct: input.yPct,
        sessionId: input.sessionId,
        deviceType: input.deviceType ?? "desktop",
      });
      return { ok: true };
    }),

  // ─── HEATMAP: Get aggregated heatmap data for a project ──────────────────────
  getHeatmapData: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      pagePath: z.string().max(500).default("/"),
      days: z.number().min(1).max(365).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { heatmapClicks, clientProjects } = await import("../../drizzle/schema");
      const { eq, and, gte, sql } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify project belongs to this client (or admin)
      const [project] = await db
        .select()
        .from(clientProjects)
        .where(eq(clientProjects.id, input.projectId))
        .limit(1);
      if (!project) throw new Error("Project not found");
      const isOwner = project.clientOpenId === ctx.user.openId;
      const isAdmin = (await checkIsAdmin(ctx)) || project.clientOpenId === ctx.user.openId;
      if (!isOwner && !isAdmin) throw new Error("Access denied");

      const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      const clicks = await db
        .select({
          xPct: heatmapClicks.xPct,
          yPct: heatmapClicks.yPct,
          deviceType: heatmapClicks.deviceType,
        })
        .from(heatmapClicks)
        .where(
          and(
            eq(heatmapClicks.projectId, input.projectId),
            eq(heatmapClicks.pagePath, input.pagePath),
            gte(heatmapClicks.createdAt, since)
          )
        )
        .limit(5000);

      // Get distinct pages with click counts
      const pages = await db
        .select({
          pagePath: heatmapClicks.pagePath,
          count: sql<number>`count(*)`.as("count"),
        })
        .from(heatmapClicks)
        .where(
          and(
            eq(heatmapClicks.projectId, input.projectId),
            gte(heatmapClicks.createdAt, since)
          )
        )
        .groupBy(heatmapClicks.pagePath)
        .orderBy(sql`count(*) desc`)
        .limit(20);

      return {
        clicks,
        totalClicks: clicks.length,
        pages,
        websiteUrl: project.websiteDomain ? `https://${project.websiteDomain}` : project.previewUrl,
      };
    }),
});
