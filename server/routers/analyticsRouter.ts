/**
 * Analytics Router — first-party tracking for client websites.
 *
 * Public procedures:
 *   analytics.track            — called by the JS snippet on client sites
 *   analytics.getToken         — returns (or creates) the tracking token for a project
 *   analytics.getStats         — daily aggregated traffic stats
 *   analytics.getTopPages      — top pages by view count
 *   analytics.getTrafficSources — referrer breakdown
 *
 * Protected procedures:
 *   analytics.ensureToken      — admin helper to pre-create tokens
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import crypto from "crypto";

// ── helpers ──────────────────────────────────────────────────────────────────

function detectDevice(ua: string): "desktop" | "mobile" | "tablet" {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

function parseUtm(url: string) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://x.com${url}`);
    return {
      utmSource: u.searchParams.get("utm_source") ?? undefined,
      utmMedium: u.searchParams.get("utm_medium") ?? undefined,
      utmCampaign: u.searchParams.get("utm_campaign") ?? undefined,
    };
  } catch {
    return {};
  }
}

async function getOrCreateToken(projectId: number): Promise<string> {
  const { getDb } = await import("../db");
  const { analyticsTokens } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const existing = await db
    .select()
    .from(analyticsTokens)
    .where(eq(analyticsTokens.projectId, projectId))
    .limit(1);

  if (existing.length > 0) return existing[0].token;

  const token = crypto.randomBytes(24).toString("hex");
  await db.insert(analyticsTokens).values({ projectId, token });
  return token;
}

// ── router ───────────────────────────────────────────────────────────────────

export const analyticsRouter = router({
  /**
   * Called by the JS snippet on the client's website.
   * Resolves the project from the token and inserts a page_view row.
   */
  track: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
        path: z.string().max(500).default("/"),
        sessionId: z.string().max(64),
        referrer: z.string().max(500).optional(),
        userAgent: z.string().max(500).optional(),
        href: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { getDb } = await import("../db");
      const { pageViews, analyticsTokens } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) return { ok: false };

      // Resolve project from token
      const tokenRow = await db
        .select()
        .from(analyticsTokens)
        .where(eq(analyticsTokens.token, input.token))
        .limit(1);

      if (tokenRow.length === 0) return { ok: false };

      const projectId = tokenRow[0].projectId;
      const deviceType = detectDevice(input.userAgent ?? "");
      const utmParams = parseUtm(input.href ?? input.path);

      await db.insert(pageViews).values({
        projectId,
        pagePath: input.path,
        sessionId: input.sessionId,
        referrer: input.referrer ?? null,
        deviceType,
        utmSource: utmParams.utmSource ?? null,
        utmMedium: utmParams.utmMedium ?? null,
        utmCampaign: utmParams.utmCampaign ?? null,
      });

      return { ok: true };
    }),

  /**
   * Returns (or creates) the tracking token for a project.
   */
  getToken: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const token = await getOrCreateToken(input.projectId);
      return { token };
    }),

  /**
   * Returns daily aggregated stats for a project over the last N days.
   * Used to power the Traffic Overview chart.
   */
  getStats: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        days: z.number().min(7).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      const { getDb } = await import("../db");
      const { pageViews } = await import("../../drizzle/schema");
      const { and, gte, sql, count } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) return { daily: [], totalViews: 0, totalVisitors: 0 };

      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const rows = await db
        .select({
          day: sql<string>`DATE(${pageViews.createdAt})`.as("day"),
          views: count(pageViews.id).as("views"),
          visitors: sql<number>`COUNT(DISTINCT ${pageViews.sessionId})`.as("visitors"),
        })
        .from(pageViews)
        .where(
          and(
            sql`${pageViews.projectId} = ${input.projectId}`,
            gte(pageViews.createdAt, since)
          )
        )
        .groupBy(sql`DATE(${pageViews.createdAt})`)
        .orderBy(sql`DATE(${pageViews.createdAt})`);

      const totals = await db
        .select({
          totalViews: count(pageViews.id),
          totalVisitors: sql<number>`COUNT(DISTINCT ${pageViews.sessionId})`,
        })
        .from(pageViews)
        .where(
          and(
            sql`${pageViews.projectId} = ${input.projectId}`,
            gte(pageViews.createdAt, since)
          )
        );

      return {
        daily: rows.map((r) => ({
          day: String(r.day),
          views: Number(r.views),
          visitors: Number(r.visitors),
        })),
        totalViews: Number(totals[0]?.totalViews ?? 0),
        totalVisitors: Number(totals[0]?.totalVisitors ?? 0),
      };
    }),

  /**
   * Returns top pages by view count for a project.
   */
  getTopPages: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        days: z.number().min(7).max(365).default(30),
        limit: z.number().min(1).max(20).default(5),
      })
    )
    .query(async ({ input }) => {
      const { getDb } = await import("../db");
      const { pageViews } = await import("../../drizzle/schema");
      const { and, gte, sql, count, desc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) return [];

      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const rows = await db
        .select({
          path: pageViews.pagePath,
          views: count(pageViews.id).as("views"),
          visitors: sql<number>`COUNT(DISTINCT ${pageViews.sessionId})`.as("visitors"),
        })
        .from(pageViews)
        .where(
          and(
            sql`${pageViews.projectId} = ${input.projectId}`,
            gte(pageViews.createdAt, since)
          )
        )
        .groupBy(pageViews.pagePath)
        .orderBy(desc(count(pageViews.id)))
        .limit(input.limit);

      return rows.map((r) => ({
        path: r.path,
        views: Number(r.views),
        visitors: Number(r.visitors),
      }));
    }),

  /**
   * Returns traffic source breakdown (referrer domains) for a project.
   */
  getTrafficSources: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        days: z.number().min(7).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      const { getDb } = await import("../db");
      const { pageViews } = await import("../../drizzle/schema");
      const { and, gte, sql, count, desc } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) return [];

      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const rows = await db
        .select({
          referrer: pageViews.referrer,
          views: count(pageViews.id).as("views"),
        })
        .from(pageViews)
        .where(
          and(
            sql`${pageViews.projectId} = ${input.projectId}`,
            gte(pageViews.createdAt, since)
          )
        )
        .groupBy(pageViews.referrer)
        .orderBy(desc(count(pageViews.id)))
        .limit(10);

      // Bucket into source categories
      const buckets: Record<string, number> = {
        Direct: 0,
        Google: 0,
        Facebook: 0,
        Instagram: 0,
        Other: 0,
      };

      for (const r of rows) {
        const ref = r.referrer ?? "";
        const n = Number(r.views);
        if (!ref) buckets["Direct"] += n;
        else if (/google/i.test(ref)) buckets["Google"] += n;
        else if (/facebook|fb\.com/i.test(ref)) buckets["Facebook"] += n;
        else if (/instagram/i.test(ref)) buckets["Instagram"] += n;
        else buckets["Other"] += n;
      }

      return Object.entries(buckets)
        .filter(([, v]) => v > 0)
        .map(([label, value]) => ({ label, value }));
    }),

  /**
   * Admin: ensure a token exists for a project (called on admin dashboard load).
   */
  ensureToken: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input }) => {
      const token = await getOrCreateToken(input.projectId);
      return { token };
    }),
});
