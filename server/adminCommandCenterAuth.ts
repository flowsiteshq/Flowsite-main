import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";

/**
 * Authorization boundary for the Admin 3.0 command center.
 *
 * This deliberately accepts only the established, cookie-backed administrator
 * sessions, an established FlowSites user with the `admin` role, or an active
 * technician whose role is exactly `admin`. It does not accept a raw request
 * header token, sales-rep roles, or a client session.
 */
export async function assertStrictAdminAccess(ctx: TrpcContext): Promise<void> {
  const passwordSessionToken = ctx.req.cookies?.admin_session;
  if (passwordSessionToken) {
    const { getAdminSession } = await import("./db");
    const session = await getAdminSession(passwordSessionToken);
    if (session) return;
  }

  const emailSessionToken = ctx.req.cookies?.email_session_id;
  if (emailSessionToken) {
    const { getDb } = await import("./db");
    const { emailAuthSessions } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (db) {
      const [session] = await db
        .select()
        .from(emailAuthSessions)
        .where(eq(emailAuthSessions.sessionToken, emailSessionToken))
        .limit(1);
      if (session && session.isAdmin === 1 && new Date() < session.expiresAt) return;
    }
  }

  if (ctx.user?.role === "admin") return;

  if (ctx.user?.openId) {
    const { getDb } = await import("./db");
    const { technicians } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (db) {
      const [technician] = await db
        .select({ role: technicians.role, status: technicians.status })
        .from(technicians)
        .where(eq(technicians.openId, ctx.user.openId))
        .limit(1);
      if (technician?.status === "active" && technician.role === "admin") return;
    }
  }

  throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
}
