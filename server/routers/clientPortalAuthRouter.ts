import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

const SALT_ROUNDS = 12;
const CLIENT_SESSION_COOKIE = "client_portal_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SETUP_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function generateToken(): string {
  return randomBytes(48).toString("hex");
}

function setClientSessionCookie(res: any, token: string) {
  res.cookie(CLIENT_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
    path: "/",
  });
}

function clearClientSessionCookie(res: any) {
  res.clearCookie(CLIENT_SESSION_COOKIE, { path: "/" });
}

export const clientPortalAuthRouter = router({
  /**
   * Get the currently logged-in client from the client portal session cookie.
   * Returns null if not logged in.
   */
  me: publicProcedure.query(async ({ ctx }) => {
    const token = ctx.req.cookies?.[CLIENT_SESSION_COOKIE];
    if (!token) return null;
    const { getDb } = await import("../db");
    const { clientPortalSessions, clientProjects } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) return null;

    const [session] = await db
      .select()
      .from(clientPortalSessions)
      .where(eq(clientPortalSessions.sessionToken, token))
      .limit(1);

    if (!session) return null;

    // Check expiry
    if (new Date() > session.expiresAt) {
      await db.delete(clientPortalSessions).where(eq(clientPortalSessions.sessionToken, token));
      clearClientSessionCookie(ctx.res);
      return null;
    }

    // Find the client's project
    const [project] = await db
      .select()
      .from(clientProjects)
      .where(eq(clientProjects.clientEmail, session.clientEmail))
      .limit(1);

    return {
      clientEmail: session.clientEmail,
      clientName: project?.clientName ?? null,
      businessName: project?.businessName ?? null,
      projectId: project?.id ?? null,
    };
  }),

  /**
   * Login with email + password.
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email().toLowerCase(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { getDb } = await import("../db");
      const { clientPortalPasswords, clientPortalSessions } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [authRow] = await db
        .select()
        .from(clientPortalPasswords)
        .where(eq(clientPortalPasswords.clientEmail, input.email))
        .limit(1);

      if (!authRow) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
      }

      const valid = await bcrypt.compare(input.password, authRow.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
      }

      // Create session
      const token = generateToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
      await db.insert(clientPortalSessions).values({
        clientEmail: input.email,
        sessionToken: token,
        userAgent: ctx.req.headers["user-agent"] ?? null,
        expiresAt,
      });

      setClientSessionCookie(ctx.res, token);
      return { success: true };
    }),

  /**
   * Logout — clears the client portal session cookie and deletes the session row.
   */
  logout: publicProcedure.mutation(async ({ ctx }) => {
    const token = ctx.req.cookies?.[CLIENT_SESSION_COOKIE];
    if (token) {
      const { getDb } = await import("../db");
      const { clientPortalSessions } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (db) {
        await db.delete(clientPortalSessions).where(eq(clientPortalSessions.sessionToken, token));
      }
    }
    clearClientSessionCookie(ctx.res);
    return { success: true };
  }),

  /**
   * Admin: send a portal invite email to a client.
   * Creates a setup token and sends an email with a link to set their password.
   */
  sendInvite: protectedProcedure
    .input(
      z.object({
        clientEmail: z.string().email().toLowerCase(),
        clientName: z.string().min(1).optional(),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only." });
      }
      const { getDb } = await import("../db");
      const { clientPortalPasswords } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const setupToken = generateToken();
      const setupTokenExpiry = Date.now() + SETUP_TOKEN_EXPIRY_MS;

      // Upsert — create or update setup token
      const [existing] = await db
        .select({ id: clientPortalPasswords.id })
        .from(clientPortalPasswords)
        .where(eq(clientPortalPasswords.clientEmail, input.clientEmail))
        .limit(1);

      if (existing) {
        await db
          .update(clientPortalPasswords)
          .set({ setupToken, setupTokenExpiry })
          .where(eq(clientPortalPasswords.clientEmail, input.clientEmail));
      } else {
        // Create a placeholder row with a random unusable password hash
        const placeholderHash = await bcrypt.hash(generateToken(), SALT_ROUNDS);
        await db.insert(clientPortalPasswords).values({
          clientEmail: input.clientEmail,
          passwordHash: placeholderHash,
          setupToken,
          setupTokenExpiry,
        });
      }

      const setupUrl = `${input.origin}/client-setup?token=${setupToken}`;

      // Send invite email via Resend
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.EMAIL_FROM_ADDRESS ?? "noreply@flowsites.com",
          to: input.clientEmail,
          subject: "Your FlowSites Client Portal Access",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Welcome to Your Client Portal</h2>
              <p>Hi ${input.clientName ?? "there"},</p>
              <p>Your FlowSites client portal is ready! Click the button below to set up your password and access your project dashboard.</p>
              <p style="margin: 32px 0;">
                <a href="${setupUrl}" style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Set Up My Portal Access
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">This link expires in 7 days. If you didn't expect this email, you can safely ignore it.</p>
              <p style="color: #666; font-size: 14px;">Or copy this link: ${setupUrl}</p>
            </div>
          `,
        });
      } catch (err) {
        console.error("[clientPortalAuth] Failed to send invite email:", err);
        // Don't throw — return the setup URL so admin can share it manually
      }

      return { success: true, setupUrl };
    }),

  /**
   * Set up password using a setup token (from invite email).
   */
  setupPassword: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
        password: z.string().min(8).max(128),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { getDb } = await import("../db");
      const { clientPortalPasswords, clientPortalSessions } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [authRow] = await db
        .select()
        .from(clientPortalPasswords)
        .where(eq(clientPortalPasswords.setupToken, input.token))
        .limit(1);

      if (!authRow) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This setup link is invalid or has already been used." });
      }

      const now = Date.now();
      const expiry = authRow.setupTokenExpiry ?? 0;
      if (now > expiry) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This setup link has expired. Please ask your account manager for a new invite." });
      }

      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
      await db
        .update(clientPortalPasswords)
        .set({ passwordHash, setupToken: null, setupTokenExpiry: null })
        .where(eq(clientPortalPasswords.id, authRow.id));

      // Auto-login after setup
      const sessionToken = generateToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
      await db.insert(clientPortalSessions).values({
        clientEmail: authRow.clientEmail,
        sessionToken,
        userAgent: ctx.req.headers["user-agent"] ?? null,
        expiresAt,
      });
      setClientSessionCookie(ctx.res, sessionToken);

      return { success: true, clientEmail: authRow.clientEmail };
    }),

  /**
   * Forgot password — generates a reset token and sends a reset email.
   */
  forgotPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email().toLowerCase(),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const { getDb } = await import("../db");
      const { clientPortalPasswords } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [authRow] = await db
        .select()
        .from(clientPortalPasswords)
        .where(eq(clientPortalPasswords.clientEmail, input.email))
        .limit(1);

      // Always return success to prevent email enumeration
      if (!authRow) return { success: true };

      const resetToken = generateToken();
      const resetTokenExpiry = Date.now() + RESET_TOKEN_EXPIRY_MS;

      await db
        .update(clientPortalPasswords)
        .set({ resetToken, resetTokenExpiry })
        .where(eq(clientPortalPasswords.id, authRow.id));

      const resetUrl = `${input.origin}/client-reset-password?token=${resetToken}`;

      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.EMAIL_FROM_ADDRESS ?? "noreply@flowsites.com",
          to: input.email,
          subject: "Reset Your FlowSites Portal Password",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Reset Your Password</h2>
              <p>Click the button below to reset your FlowSites client portal password. This link expires in 1 hour.</p>
              <p style="margin: 32px 0;">
                <a href="${resetUrl}" style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Reset Password
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });
      } catch (err) {
        console.error("[clientPortalAuth] Failed to send reset email:", err);
      }

      return { success: true };
    }),

  /**
   * Reset password using a reset token.
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
        newPassword: z.string().min(8).max(128),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { getDb } = await import("../db");
      const { clientPortalPasswords, clientPortalSessions } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [authRow] = await db
        .select()
        .from(clientPortalPasswords)
        .where(eq(clientPortalPasswords.resetToken, input.token))
        .limit(1);

      if (!authRow) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This reset link is invalid or has already been used." });
      }

      const now = Date.now();
      const expiry = authRow.resetTokenExpiry ?? 0;
      if (now > expiry) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This reset link has expired. Please request a new one." });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
      await db
        .update(clientPortalPasswords)
        .set({ passwordHash, resetToken: null, resetTokenExpiry: null })
        .where(eq(clientPortalPasswords.id, authRow.id));

      // Auto-login after reset
      const sessionToken = generateToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
      await db.insert(clientPortalSessions).values({
        clientEmail: authRow.clientEmail,
        sessionToken,
        userAgent: ctx.req.headers["user-agent"] ?? null,
        expiresAt,
      });
       setClientSessionCookie(ctx.res, sessionToken);
      return { success: true };
    }),

  /**
   * Get the full project for the currently logged-in client (via portal session cookie).
   * Returns null if not logged in or no project found.
   */
  getMyProjectBySession: publicProcedure.query(async ({ ctx }) => {
    const token = (ctx.req as any).cookies?.[CLIENT_SESSION_COOKIE];
    if (!token) return null;
    const { getDb } = await import("../db");
    const { clientPortalSessions, clientProjects } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) return null;
    const [session] = await db.select().from(clientPortalSessions).where(eq(clientPortalSessions.sessionToken, token)).limit(1);
    if (!session || new Date() > session.expiresAt) return null;
    const [project] = await db.select().from(clientProjects).where(eq(clientProjects.clientEmail, session.clientEmail)).limit(1);
    return project ?? null;
  }),

  /**
   * Get messages for the client's project (via portal session cookie).
   */
  getMessagesBySession: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const token = (ctx.req as any).cookies?.[CLIENT_SESSION_COOKIE];
      if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      const { getDb } = await import("../db");
      const { clientPortalSessions, clientProjects, projectMessages } = await import("../../drizzle/schema");
      const { eq, and, asc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [session] = await db.select().from(clientPortalSessions).where(eq(clientPortalSessions.sessionToken, token)).limit(1);
      if (!session || new Date() > session.expiresAt) throw new TRPCError({ code: "UNAUTHORIZED", message: "Session expired" });
      const [project] = await db.select().from(clientProjects).where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientEmail, session.clientEmail))).limit(1);
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      await db.update(projectMessages).set({ isRead: 1 }).where(and(eq(projectMessages.projectId, input.projectId), eq(projectMessages.senderRole, "staff")));
      return db.select().from(projectMessages).where(eq(projectMessages.projectId, input.projectId)).orderBy(asc(projectMessages.createdAt));
    }),

  /**
   * Send a message for the client's project (via portal session cookie).
   */
  sendMessageBySession: publicProcedure
    .input(z.object({ projectId: z.number(), message: z.string().min(1).max(5000) }))
    .mutation(async ({ ctx, input }) => {
      const token = (ctx.req as any).cookies?.[CLIENT_SESSION_COOKIE];
      if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      const { getDb } = await import("../db");
      const { clientPortalSessions, clientProjects, projectMessages } = await import("../../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [session] = await db.select().from(clientPortalSessions).where(eq(clientPortalSessions.sessionToken, token)).limit(1);
      if (!session || new Date() > session.expiresAt) throw new TRPCError({ code: "UNAUTHORIZED", message: "Session expired" });
      const [project] = await db.select().from(clientProjects).where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientEmail, session.clientEmail))).limit(1);
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      await db.insert(projectMessages).values({
        projectId: input.projectId,
        senderRole: "client",
        senderName: project.clientName,
        message: input.message,
        isRead: 0,
      });
      const { notifyOwner } = await import("../_core/notification");
      await notifyOwner({ title: `New message from ${project.clientName}`, content: input.message.slice(0, 200) });
      return { success: true };
    }),

  /**
   * Get change requests for the client's project (via portal session cookie).
   */
  getChangeRequestsBySession: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const token = (ctx.req as any).cookies?.[CLIENT_SESSION_COOKIE];
      if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      const { getDb } = await import("../db");
      const { clientPortalSessions, clientProjects, changeRequests } = await import("../../drizzle/schema");
      const { eq, and, desc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [session] = await db.select().from(clientPortalSessions).where(eq(clientPortalSessions.sessionToken, token)).limit(1);
      if (!session || new Date() > session.expiresAt) throw new TRPCError({ code: "UNAUTHORIZED", message: "Session expired" });
      const [project] = await db.select().from(clientProjects).where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientEmail, session.clientEmail))).limit(1);
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      return db.select().from(changeRequests).where(eq(changeRequests.projectId, input.projectId)).orderBy(desc(changeRequests.createdAt));
    }),

  /**
   * Submit a change request for the client's project (via portal session cookie).
   */
  submitChangeRequestBySession: publicProcedure
    .input(z.object({
      projectId: z.number(),
      title: z.string().min(1).max(255),
      description: z.string().min(1).max(5000),
      priority: z.enum(["low", "medium", "high"]).default("medium"),
      pageSection: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const token = (ctx.req as any).cookies?.[CLIENT_SESSION_COOKIE];
      if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      const { getDb } = await import("../db");
      const { clientPortalSessions, clientProjects, changeRequests } = await import("../../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [session] = await db.select().from(clientPortalSessions).where(eq(clientPortalSessions.sessionToken, token)).limit(1);
      if (!session || new Date() > session.expiresAt) throw new TRPCError({ code: "UNAUTHORIZED", message: "Session expired" });
      const [project] = await db.select().from(clientProjects).where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientEmail, session.clientEmail))).limit(1);
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      await db.insert(changeRequests).values({
        projectId: input.projectId,
        clientName: project.clientName,
        title: input.title,
        description: input.description,
        priority: input.priority,
        pageSection: input.pageSection,
        status: "pending",
      });
      const { notifyOwner } = await import("../_core/notification");
      await notifyOwner({ title: `New change request from ${project.clientName}`, content: `${input.title}: ${input.description.slice(0, 150)}` });
      return { success: true };
    }),

  /**
   * Get feature upgrade requests for the client's project (via portal session cookie).
   */
  getMyUpgradeRequestsBySession: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const token = (ctx.req as any).cookies?.[CLIENT_SESSION_COOKIE];
      if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      const { getDb } = await import("../db");
      const { clientPortalSessions, clientProjects, featureUpgradeRequests } = await import("../../drizzle/schema");
      const { eq, and, desc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [session] = await db.select().from(clientPortalSessions).where(eq(clientPortalSessions.sessionToken, token)).limit(1);
      if (!session || new Date() > session.expiresAt) throw new TRPCError({ code: "UNAUTHORIZED", message: "Session expired" });
      const [project] = await db.select().from(clientProjects).where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientEmail, session.clientEmail))).limit(1);
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      return db.select().from(featureUpgradeRequests).where(eq(featureUpgradeRequests.projectId, input.projectId)).orderBy(desc(featureUpgradeRequests.createdAt));
    }),

  /**
   * Request a feature upgrade for the client's project (via portal session cookie).
   */
  requestFeatureUpgradeBySession: publicProcedure
    .input(z.object({
      projectId: z.number(),
      featureId: z.string(),
      featureLabel: z.string(),
      featurePrice: z.number(),
      clientNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const token = (ctx.req as any).cookies?.[CLIENT_SESSION_COOKIE];
      if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
      const { getDb } = await import("../db");
      const { clientPortalSessions, clientProjects, featureUpgradeRequests } = await import("../../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [session] = await db.select().from(clientPortalSessions).where(eq(clientPortalSessions.sessionToken, token)).limit(1);
      if (!session || new Date() > session.expiresAt) throw new TRPCError({ code: "UNAUTHORIZED", message: "Session expired" });
      const [project] = await db.select().from(clientProjects).where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientEmail, session.clientEmail))).limit(1);
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      await db.insert(featureUpgradeRequests).values({
        projectId: input.projectId,
        clientName: project.clientName,
        featureId: input.featureId,
        featureLabel: input.featureLabel,
        featurePrice: input.featurePrice,
        clientNotes: input.clientNotes,
        status: "pending",
      });
      const { notifyOwner } = await import("../_core/notification");
      await notifyOwner({
        title: `Feature upgrade request: ${input.featureLabel}`,
        content: `Project: ${project.businessName}\nFeature: ${input.featureLabel} ($${input.featurePrice})${input.clientNotes ? "\nNotes: " + input.clientNotes : ""}`,
      });
      return { success: true };
    }),

  /**
   * Get invoices for the client's project (via portal session cookie or OAuth).
   * Returns both DB invoices and a synthetic setup-fee invoice if setup_fee > 0.
   */
  getInvoicesBySession: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const { clientPortalSessions, clientProjects, clientAccounts, clientInvoices } = await import("../../drizzle/schema");
      const { eq, and, desc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) return { invoices: [], setupFee: null, monthlyPrice: null };

      // Verify access: either portal session cookie or OAuth user
      let project: typeof clientProjects.$inferSelect | null = null;
      const token = (ctx.req as any).cookies?.[CLIENT_SESSION_COOKIE];
      if (token) {
        const [session] = await db.select().from(clientPortalSessions).where(eq(clientPortalSessions.sessionToken, token)).limit(1);
        if (session && new Date() <= session.expiresAt) {
          const [p] = await db.select().from(clientProjects).where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientEmail, session.clientEmail))).limit(1);
          project = p ?? null;
        }
      } else if ((ctx as any).user?.openId) {
        const [p] = await db.select().from(clientProjects).where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientOpenId, (ctx as any).user.openId))).limit(1);
        project = p ?? null;
      }
      if (!project) return { invoices: [], setupFee: null, monthlyPrice: null };

      // Get linked client account for DB invoices
      const [account] = await db.select().from(clientAccounts).where(eq(clientAccounts.projectId, project.id)).limit(1);
      const dbInvoices = account
        ? await db.select().from(clientInvoices).where(eq(clientInvoices.clientAccountId, account.id)).orderBy(desc(clientInvoices.createdAt)).limit(50)
        : [];

      return {
        invoices: dbInvoices,
        setupFee: project.setupFee ?? null,
        monthlyPrice: project.monthlyPrice ?? null,
        packageName: project.packageName ?? null,
      };
    }),

  /**
   * Create a Stripe Checkout session to pay the one-time setup fee.
   * Works for both portal-session and OAuth-authenticated clients.
   */
  createSetupFeeCheckout: publicProcedure
    .input(z.object({
      projectId: z.number().int(),
      origin: z.string().url(),
      // Optional: admin impersonation token (from ?adminPreview=<token> URL param)
      adminPreviewToken: z.string().optional(),
      // Optional: client access token (from project.accessToken)
      accessToken: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const { clientProjects, clientAccounts, clientInvoices } = await import("../../drizzle/schema");
      const { eq, and, count } = await import("drizzle-orm");
      const { randomBytes: rb } = await import("crypto");

      // Verify access — any of these methods grants access:
      // 1. Admin impersonation token (?adminPreview=<token>)
      // 2. Client portal session cookie (email+password login)
      // 3. Client access token (project.accessToken in URL)
      // 4. OAuth user matching by openId or email
      let project: typeof clientProjects.$inferSelect | null = null;

      if (input.adminPreviewToken) {
        // Admin impersonation — verify the token is valid and matches the project
        const { adminImpersonationTokens } = await import("../../drizzle/schema");
        const [tok] = await db.select().from(adminImpersonationTokens).where(eq(adminImpersonationTokens.token, input.adminPreviewToken)).limit(1);
        if (tok && new Date() <= tok.expiresAt && tok.projectId === input.projectId) {
          const [p] = await db.select().from(clientProjects).where(eq(clientProjects.id, input.projectId)).limit(1);
          project = p ?? null;
        }
      } else if (input.accessToken) {
        // Client access token — matches project.accessToken
        const [p] = await db.select().from(clientProjects).where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.accessToken, input.accessToken))).limit(1);
        project = p ?? null;
      } else {
        const sessionToken = (ctx.req as any).cookies?.[CLIENT_SESSION_COOKIE];
        if (sessionToken) {
          const { clientPortalSessions } = await import("../../drizzle/schema");
          const [sess] = await db.select().from(clientPortalSessions).where(eq(clientPortalSessions.sessionToken, sessionToken)).limit(1);
          if (sess && new Date() <= sess.expiresAt) {
            const [p] = await db.select().from(clientProjects).where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientEmail, sess.clientEmail))).limit(1);
            project = p ?? null;
          }
        } else if ((ctx as any).user?.openId) {
          const oauthUser = (ctx as any).user;
          const [byOpenId] = await db.select().from(clientProjects).where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientOpenId, oauthUser.openId))).limit(1);
          if (byOpenId) {
            project = byOpenId;
          } else if (oauthUser.email) {
            const [byEmail] = await db.select().from(clientProjects).where(and(eq(clientProjects.id, input.projectId), eq(clientProjects.clientEmail, oauthUser.email))).limit(1);
            project = byEmail ?? null;
            if (project) {
              await db.update(clientProjects).set({ clientOpenId: oauthUser.openId }).where(eq(clientProjects.id, input.projectId));
            }
          }
        }
      }
      if (!project) throw new TRPCError({ code: "FORBIDDEN", message: "Project not found or access denied" });

      const setupFee = project.setupFee ?? 0;
      if (setupFee <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "No setup fee to pay" });

      // Get linked client account
      const [account] = await db.select().from(clientAccounts).where(eq(clientAccounts.projectId, project.id)).limit(1);

      // Get Stripe instance
      const Stripe = (await import("stripe")).default;
      const { ENV } = await import("../_core/env");
      if (!ENV.stripeSecretKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });
      const stripe = new Stripe(ENV.stripeSecretKey, { apiVersion: "2026-02-25.clover" as any });

      // Get or create Stripe customer
      let stripeCustomerId = account?.stripeCustomerId ?? null;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: project.clientEmail,
          name: project.clientName,
          metadata: { businessName: project.businessName, projectId: String(project.id) },
        });
        stripeCustomerId = customer.id;
        if (account) {
          await db.update(clientAccounts).set({ stripeCustomerId }).where(eq(clientAccounts.id, account.id));
        }
      }

      // Create a client_invoice record for the setup fee
      const shareToken = rb(32).toString("hex");
      const today = new Date().toISOString().slice(0, 10);
      const [{ value: invoiceCount }] = await db.select({ value: count() }).from(clientInvoices);
      const invoiceNumber = `INV-SF-${new Date().getFullYear()}-${String(Number(invoiceCount) + 1).padStart(4, "0")}`;

      let invoiceId = 0;
      if (account) {
        const [insertResult] = await db.insert(clientInvoices).values({
          clientAccountId: account.id,
          invoiceNumber,
          periodStart: today,
          periodEnd: today,
          dueDate: today,
          baseAmountCents: setupFee * 100,
          discountCents: 0,
          lateFeeCents: 0,
          totalAmountCents: setupFee * 100,
          discountType: "none",
          status: "open",
          isRecurring: 0,
          invoiceType: "addon",
          shareToken,
          notes: `One-time setup fee for ${project.businessName}`,
        });
        invoiceId = (insertResult as any).insertId ?? 0;
      }

      // Create Stripe Checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: stripeCustomerId,
        line_items: [{
          price_data: {
            currency: "usd",
            unit_amount: setupFee * 100,
            product_data: {
              name: `FlowSites Setup Fee — ${project.businessName}`,
              description: `One-time website build & setup fee${project.packageName ? ` (${project.packageName} Package)` : ""}`,
            },
          },
          quantity: 1,
        }],
        metadata: {
          invoiceId: String(invoiceId),
          shareToken,
          projectId: String(project.id),
          paymentType: "setup_fee",
        },
        success_url: `${input.origin}/portal?payment=success&type=setup_fee`,
        cancel_url: `${input.origin}/portal?payment=cancel`,
      });

      return { checkoutUrl: checkoutSession.url };
    }),
});
