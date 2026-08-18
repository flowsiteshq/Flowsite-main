import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

const SALT_ROUNDS = 12;
const SESSION_COOKIE = "email_session_id";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function generateToken(): string {
  return randomBytes(48).toString("hex");
}

function setSessionCookie(res: any, token: string, rememberMe: boolean) {
  const maxAge = rememberMe ? Math.floor(SESSION_DURATION_MS / 1000) : undefined;
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    ...(maxAge !== undefined ? { maxAge } : {}),
    path: "/",
  });
}

function clearSessionCookie(res: any) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

/**
 * Generate the password reset email HTML.
 */
function buildPasswordResetEmail(resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password – FlowSites</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#111111;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f0f0f0;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#111111;letter-spacing:-0.3px;">FlowSites</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#111111;line-height:1.3;">Reset your password</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#555555;">
                We received a request to reset the password for your FlowSites account. Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <a href="${resetUrl}" style="display:inline-block;padding:13px 28px;background:#111111;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:-0.2px;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#888888;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:13px;word-break:break-all;">
                <a href="${resetUrl}" style="color:#111111;">${resetUrl}</a>
              </p>
              <p style="margin:0;font-size:13px;color:#888888;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:#f9f9f9;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.6;">
                © ${new Date().getFullYear()} FlowSites. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const emailAuthRouter = router({
  /**
   * Register a new customer account with email + password.
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        email: z.string().email().toLowerCase(),
        password: z.string().min(8).max(128),
        rememberMe: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { getDb } = await import("../db");
      const { users, emailAuth, emailAuthSessions } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if email already in use
      const existing = await db
        .select({ id: emailAuth.id })
        .from(emailAuth)
        .where(eq(emailAuth.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists.",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

      // Create user row
      const [userResult] = await db.insert(users).values({
        openId: `email:${input.email}`,
        name: input.name,
        email: input.email,
        loginMethod: "email",
        role: "user",
      });

      const userId = (userResult as any).insertId as number;

      // Create emailAuth row
      await db.insert(emailAuth).values({
        userId,
        email: input.email,
        passwordHash,
        emailVerified: 0,
      });

      // Create session
      const token = generateToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

      await db.insert(emailAuthSessions).values({
        userId,
        sessionToken: token,
        userAgent: ctx.req.headers["user-agent"] ?? null,
        isAdmin: 0,
        expiresAt,
      });

      setSessionCookie(ctx.res, token, input.rememberMe);

      return { success: true, userId };
    }),

  /**
   * Login with email + password.
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email().toLowerCase(),
        password: z.string().min(1),
        rememberMe: z.boolean().default(false),
        isAdmin: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { getDb } = await import("../db");
      const { users, emailAuth, emailAuthSessions } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const authRows = await db
        .select()
        .from(emailAuth)
        .where(eq(emailAuth.email, input.email))
        .limit(1);

      if (authRows.length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      const authRow = authRows[0];
      const valid = await bcrypt.compare(input.password, authRow.passwordHash);

      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      // If admin login requested, verify the user has admin role
      if (input.isAdmin) {
        const userRows = await db
          .select({ role: users.role })
          .from(users)
          .where(eq(users.id, authRow.userId))
          .limit(1);

        if (userRows.length === 0 || userRows[0].role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have admin access.",
          });
        }
      }

      // Update lastSignedIn
      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, authRow.userId));

      // Create session
      const token = generateToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

      await db.insert(emailAuthSessions).values({
        userId: authRow.userId,
        sessionToken: token,
        userAgent: ctx.req.headers["user-agent"] ?? null,
        isAdmin: input.isAdmin ? 1 : 0,
        expiresAt,
      });

      setSessionCookie(ctx.res, token, input.rememberMe);

      // If admin login, also set the admin_session cookie so trpc.admin.verify works
      if (input.isAdmin) {
        const { createAdminSession } = await import("../db");
        const adminToken = generateToken();
        const adminExpiry = new Date(Date.now() + SESSION_DURATION_MS);
        await createAdminSession(adminToken, adminExpiry);
        const { getSessionCookieOptions } = await import("../_core/cookies");
        ctx.res.cookie("admin_session", adminToken, {
          ...getSessionCookieOptions(ctx.req),
          ...(input.rememberMe ? { maxAge: Math.floor(SESSION_DURATION_MS / 1000) } : {}),
        });
      }

      return { success: true, userId: authRow.userId };
    }),

  /**
   * Logout — clears the email session cookie and deletes the session row.
   */
  logout: publicProcedure.mutation(async ({ ctx }) => {
    const { getDb } = await import("../db");
    const { emailAuthSessions } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const token = ctx.req.cookies?.[SESSION_COOKIE];
    if (token) {
      await db
        .delete(emailAuthSessions)
        .where(eq(emailAuthSessions.sessionToken, token));
      clearSessionCookie(ctx.res);
    }
    return { success: true };
  }),

  /**
   * Get the currently logged-in user from the email session cookie.
   * Returns null if not logged in.
   */
  me: publicProcedure.query(async ({ ctx }) => {
    const token = ctx.req.cookies?.[SESSION_COOKIE];
    if (!token) return null;

    const { getDb } = await import("../db");
    const { users, emailAuthSessions } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const sessionRows = await db
      .select()
      .from(emailAuthSessions)
      .where(eq(emailAuthSessions.sessionToken, token))
      .limit(1);

    if (sessionRows.length === 0) return null;

    const session = sessionRows[0];

    // Check expiry
    if (new Date() > session.expiresAt) {
      await db
        .delete(emailAuthSessions)
        .where(eq(emailAuthSessions.sessionToken, token));
      clearSessionCookie(ctx.res);
      return null;
    }

    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userRows.length === 0) return null;

    return {
      ...userRows[0],
      isAdmin: session.isAdmin === 1,
    };
  }),

  /**
   * Forgot password — generates a reset token and sends a reset email.
   * Always returns success to prevent email enumeration.
   */
  forgotPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email().toLowerCase(),
        /** The frontend origin so we can build the correct reset URL */
        origin: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const { getDb } = await import("../db");
      const { emailAuth } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const { sendEmail } = await import("../email");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const authRows = await db
        .select()
        .from(emailAuth)
        .where(eq(emailAuth.email, input.email))
        .limit(1);

      // Always return success — don't reveal whether the email exists
      if (authRows.length === 0) {
        return { success: true };
      }

      const authRow = authRows[0];

      // Generate a secure random token (plain-text stored — short-lived, low risk)
      const resetToken = generateToken();
      const resetTokenExpiry = Date.now() + RESET_TOKEN_EXPIRY_MS;

      await db
        .update(emailAuth)
        .set({ resetToken, resetTokenExpiry })
        .where(eq(emailAuth.id, authRow.id));

      const resetUrl = `${input.origin}/reset-password?token=${resetToken}`;
      const html = buildPasswordResetEmail(resetUrl);

      await sendEmail({
        to: input.email,
        subject: "Reset your FlowSites password",
        html,
      });

      return { success: true };
    }),

  /**
   * Reset password — validates the token and sets a new password.
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
        newPassword: z.string().min(8).max(128),
      })
    )
    .mutation(async ({ input }) => {
      const { getDb } = await import("../db");
      const { emailAuth } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const authRows = await db
        .select()
        .from(emailAuth)
        .where(eq(emailAuth.resetToken, input.token))
        .limit(1);

      if (authRows.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This reset link is invalid or has already been used.",
        });
      }

      const authRow = authRows[0];

      // Check expiry
      const now = Date.now();
      const expiry = authRow.resetTokenExpiry ? Number(authRow.resetTokenExpiry) : 0;
      if (now > expiry) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This reset link has expired. Please request a new one.",
        });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

      await db
        .update(emailAuth)
        .set({
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
        })
        .where(eq(emailAuth.id, authRow.id));

      return { success: true };
    }),

  /**
   * Admin: create an account for a customer.
   */
  adminCreateCustomerAccount: publicProcedure
    .input(
      z.object({
        adminToken: z.string(),
        name: z.string().min(2).max(100),
        email: z.string().email().toLowerCase(),
        password: z.string().min(8).max(128),
      })
    )
    .mutation(async ({ input }) => {
      if (input.adminToken !== process.env.ADMIN_SECRET_PASSWORD) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid admin token." });
      }

      const { getDb } = await import("../db");
      const { users, emailAuth } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const existing = await db
        .select({ id: emailAuth.id })
        .from(emailAuth)
        .where(eq(emailAuth.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already registered." });
      }

      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

      const [userResult] = await db.insert(users).values({
        openId: `email:${input.email}`,
        name: input.name,
        email: input.email,
        loginMethod: "email",
        role: "user",
      });

      const userId = (userResult as any).insertId as number;

      await db.insert(emailAuth).values({
        userId,
        email: input.email,
        passwordHash,
        emailVerified: 1,
      });

      return { success: true, userId };
    }),

  /**
   * Admin: create an admin account (first-time setup or adding new admins).
   */
  adminSetup: publicProcedure
    .input(
      z.object({
        setupToken: z.string(),
        name: z.string().min(2).max(100),
        email: z.string().email().toLowerCase(),
        password: z.string().min(8).max(128),
      })
    )
    .mutation(async ({ input }) => {
      if (input.setupToken !== process.env.ADMIN_SECRET_PASSWORD) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Invalid setup token." });
      }

      const { getDb } = await import("../db");
      const { users, emailAuth } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const existing = await db
        .select({ id: emailAuth.id })
        .from(emailAuth)
        .where(eq(emailAuth.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already registered." });
      }

      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

      const [userResult] = await db.insert(users).values({
        openId: `email:${input.email}`,
        name: input.name,
        email: input.email,
        loginMethod: "email",
        role: "admin",
      });

      const userId = (userResult as any).insertId as number;

      await db.insert(emailAuth).values({
        userId,
        email: input.email,
        passwordHash,
        emailVerified: 1,
      });

      return { success: true, userId };
    }),
});
