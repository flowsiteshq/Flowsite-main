import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import type { TrpcContext } from "../_core/context";
import { desc } from "drizzle-orm";

async function requireAdminAccess(ctx: TrpcContext) {
  const token = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
  if (token) {
    const { getAdminSession } = await import("../db");
    const session = await getAdminSession(token);
    if (session) return;
  }
  if (ctx.user?.openId) {
    const { getDb } = await import("../db");
    const { technicians } = await import("../../drizzle/schema");
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

export const communicationsRouter = router({
  /** Send an SMS to a lead or customer via 800.com */
  sendSms: publicProcedure
    .input(z.object({
      recipientPhone: z.string().min(7),
      message: z.string().min(1).max(1600),
      leadId: z.number().optional(),
      mediaUrl: z.string().url().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await requireAdminAccess(ctx);
      const { sendSms } = await import("../800com");
      const result = await sendSms({
        recipient: input.recipientPhone,
        message: input.message,
        mediaUrl: input.mediaUrl,
      });
      if (!result.success) {
        throw new Error(result.error ?? "Failed to send SMS");
      }
      const { getDb } = await import("../db");
      const db = await getDb();
      if (db) {
        const { smsLogs, technicians } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        let sentBy = "Admin";
        if (ctx.user) {
          const [tech] = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
          sentBy = tech?.name ?? ctx.user.name ?? "Admin";
        }
        await db.insert(smsLogs).values({
          leadId: input.leadId ?? null,
          contactPhone: input.recipientPhone,
          message: input.message,
          direction: "outbound",
          sentBy,
          sentByOpenId: ctx.user?.openId,
          status: "sent",
          createdAt: new Date(),
        });
      }
      return { success: true };
    }),

  /** Get SMS conversations for a phone number from 800.com */
  getConversations: publicProcedure
    .input(z.object({ contactPhone: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      await requireAdminAccess(ctx);
      const { getConversations } = await import("../800com");
      return await getConversations(input.contactPhone ? { contactNumber: input.contactPhone } : undefined);
    }),

  /** Get messages for a specific conversation from 800.com */
  getMessages: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ input, ctx }) => {
      await requireAdminAccess(ctx);
      const { getConversationItems } = await import("../800com");
      return await getConversationItems(input.conversationId);
    }),

  /** Get local SMS log messages for a contact phone number */
  getLocalMessages: publicProcedure
    .input(z.object({
      contactPhone: z.string().min(7),
      limit: z.number().min(1).max(200).default(100),
    }))
    .query(async ({ input, ctx }) => {
      await requireAdminAccess(ctx);
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) return [];
      const { smsLogs } = await import("../../drizzle/schema");
      const digits = input.contactPhone.replace(/\D/g, "");
      const local10 = digits.slice(-10);
      const rows = await db
        .select()
        .from(smsLogs)
        .orderBy(desc(smsLogs.createdAt))
        .limit(input.limit);
      const filtered = rows.filter((r) => {
        const d = r.contactPhone.replace(/\D/g, "");
        return d === digits || d.slice(-10) === local10;
      });
      return filtered.reverse().map((r) => ({
        id: String(r.id),
        direction: r.direction,
        message: r.message,
        sentBy: r.sentBy,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        conversationId: r.conversationId,
      }));
    }),

  /** Get unread inbound message count for a contact phone number */
  getUnreadCount: publicProcedure
    .input(z.object({ contactPhone: z.string().min(7) }))
    .query(async ({ input, ctx }) => {
      await requireAdminAccess(ctx);
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) return { count: 0 };
      const { smsLogs } = await import("../../drizzle/schema");
      const { eq, and, gte } = await import("drizzle-orm");
      const digits = input.contactPhone.replace(/\D/g, "");
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const rows = await db
        .select()
        .from(smsLogs)
        .where(and(eq(smsLogs.direction, "inbound"), gte(smsLogs.createdAt, since)))
        .limit(500);
      const count = rows.filter((r) => {
        const d = r.contactPhone.replace(/\D/g, "");
        return d === digits || d.slice(-10) === digits.slice(-10);
      }).length;
      return { count };
    }),

  /** Get unified SMS inbox grouped by contact */
  getInbox: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(500).default(200),
      onlyInbound: z.boolean().default(false),
    }).optional())
    .query(async ({ input, ctx }) => {
      await requireAdminAccess(ctx);
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) return [];
      const { smsLogs } = await import("../../drizzle/schema");
      const limit = input?.limit ?? 200;
      const rows = await db
        .select()
        .from(smsLogs)
        .orderBy(desc(smsLogs.createdAt))
        .limit(limit);
      const byPhone = new Map<string, typeof rows>();
      for (const row of rows) {
        const key = row.contactPhone.replace(/\D/g, "").slice(-10);
        if (!byPhone.has(key)) byPhone.set(key, []);
        byPhone.get(key)!.push(row);
      }
      const entries = Array.from(byPhone.entries()).map(([_key, msgs]) => {
        const latest = msgs[0];
        const unreadCount = msgs.filter(m => m.direction === "inbound").length;
        const lastInbound = msgs.find(m => m.direction === "inbound");
        return {
          contactPhone: latest.contactPhone,
          lastMessage: latest.message,
          lastMessageAt: latest.createdAt.toISOString(),
          lastDirection: latest.direction,
          unreadCount,
          lastInboundAt: lastInbound ? lastInbound.createdAt.toISOString() : null,
          leadId: latest.leadId,
          clientAccountId: latest.clientAccountId,
          sentBy: latest.sentBy,
        };
      });
      entries.sort((a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      if (input?.onlyInbound) {
        return entries.filter(e => e.unreadCount > 0);
      }
      return entries;
    }),

  /** Verify 800.com API key is configured and valid */
  verifyConfig: publicProcedure
    .query(async ({ ctx }) => {
      await requireAdminAccess(ctx);
      const { verifyApiKey } = await import("../800com");
      const { ENV } = await import("../_core/env");
      return {
        ...(await verifyApiKey()),
        senderNumber: ENV.eightHundredSenderNumber || null,
      };
    }),
});
