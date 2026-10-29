import { and, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod";
import { adminNotifications, knowledgeArticles } from "../../drizzle/schema";
import { getDb } from "../db";
import { assertStrictAdminAccess } from "../adminCommandCenterAuth";
import { publicProcedure, router } from "../_core/trpc";

const categorySchema = z.enum([
  "company_information",
  "services_pricing",
  "cue_ai_training",
  "sales_playbooks",
  "customer_support",
  "internal_procedures",
]);
const accessSchema = z.enum(["public", "internal"]);
const statusSchema = z.enum(["draft", "published", "archived"]);

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 140);
}

export const adminKnowledgeRouter = router({
  listArticles: publicProcedure
    .input(z.object({ query: z.string().trim().max(100).optional(), category: categorySchema.optional(), status: statusSchema.optional() }).default({}))
    .query(async ({ ctx, input }) => {
      await assertStrictAdminAccess(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const filters = [];
      if (input.category) filters.push(eq(knowledgeArticles.category, input.category));
      if (input.status) filters.push(eq(knowledgeArticles.status, input.status));
      if (input.query) {
        const pattern = `%${input.query.replace(/[%_\\]/g, "")}%`;
        filters.push(or(like(knowledgeArticles.title, pattern), like(knowledgeArticles.content, pattern))!);
      }
      return db.select().from(knowledgeArticles).where(filters.length ? and(...filters) : undefined).orderBy(desc(knowledgeArticles.updatedAt));
    }),

  getArticle: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      await assertStrictAdminAccess(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [article] = await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.id, input.id)).limit(1);
      if (!article) throw new Error("Knowledge article not found.");
      return article;
    }),

  createArticle: publicProcedure
    .input(z.object({ title: z.string().trim().min(3).max(255), category: categorySchema, content: z.string().trim().min(1), access: accessSchema, status: statusSchema.default("draft") }))
    .mutation(async ({ ctx, input }) => {
      await assertStrictAdminAccess(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const nowPublished = input.status === "published" ? new Date() : null;
      const slug = `${slugify(input.title)}-${Date.now().toString(36)}`;
      await db.insert(knowledgeArticles).values({
        slug,
        title: input.title,
        category: input.category,
        content: input.content,
        access: input.access,
        status: input.status,
        authorOpenId: ctx.user?.openId ?? null,
        authorName: ctx.user?.name ?? "FlowSites Admin",
        cueSyncStatus: input.status === "published" && input.access === "public" ? "pending_manual_sync" : "not_synced",
        publishedAt: nowPublished,
      });
      return { success: true };
    }),

  updateArticle: publicProcedure
    .input(z.object({ id: z.number().int().positive(), title: z.string().trim().min(3).max(255), category: categorySchema, content: z.string().trim().min(1), access: accessSchema, status: statusSchema }))
    .mutation(async ({ ctx, input }) => {
      await assertStrictAdminAccess(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [existing] = await db.select({ cueSyncStatus: knowledgeArticles.cueSyncStatus, publishedAt: knowledgeArticles.publishedAt }).from(knowledgeArticles).where(eq(knowledgeArticles.id, input.id)).limit(1);
      if (!existing) throw new Error("Knowledge article not found.");
      const becomingPublic = input.status === "published" && input.access === "public";
      await db.update(knowledgeArticles).set({
        title: input.title,
        category: input.category,
        content: input.content,
        access: input.access,
        status: input.status,
        cueSyncStatus: becomingPublic ? "pending_manual_sync" : existing.cueSyncStatus === "synced" ? "not_synced" : existing.cueSyncStatus,
        cueSyncError: null,
        publishedAt: becomingPublic ? existing.publishedAt ?? new Date() : null,
      }).where(eq(knowledgeArticles.id, input.id));
      return { success: true };
    }),

  archiveArticle: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await assertStrictAdminAccess(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(knowledgeArticles).set({ status: "archived", publishedAt: null, cueSyncStatus: "not_synced" }).where(eq(knowledgeArticles.id, input.id));
      return { success: true };
    }),

  markCueSync: publicProcedure
    .input(z.object({ id: z.number().int().positive(), status: z.enum(["synced", "error"]), error: z.string().max(1000).optional() }))
    .mutation(async ({ ctx, input }) => {
      await assertStrictAdminAccess(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(knowledgeArticles).set({ cueSyncStatus: input.status, cueSyncError: input.status === "error" ? input.error ?? "Manual synchronization failed." : null }).where(and(eq(knowledgeArticles.id, input.id), eq(knowledgeArticles.status, "published"), eq(knowledgeArticles.access, "public")));
      return { success: true };
    }),

  getCuePublishedKnowledge: publicProcedure.query(async ({ ctx }) => {
    await assertStrictAdminAccess(ctx);
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    return db.select({ id: knowledgeArticles.id, title: knowledgeArticles.title, category: knowledgeArticles.category, content: knowledgeArticles.content, updatedAt: knowledgeArticles.updatedAt })
      .from(knowledgeArticles)
      .where(and(eq(knowledgeArticles.status, "published"), eq(knowledgeArticles.access, "public")))
      .orderBy(desc(knowledgeArticles.updatedAt));
  }),

  listNotifications: publicProcedure.query(async ({ ctx }) => {
    await assertStrictAdminAccess(ctx);
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    return db.select().from(adminNotifications).orderBy(desc(adminNotifications.createdAt)).limit(50);
  }),

  markNotificationRead: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await assertStrictAdminAccess(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(adminNotifications).set({ isRead: 1, readAt: new Date() }).where(eq(adminNotifications.id, input.id));
      return { success: true };
    }),
});
