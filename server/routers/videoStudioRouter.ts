import crypto from "crypto";
import Stripe from "stripe";
import { desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ENV } from "../_core/env";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";

export const VIDEO_STUDIO_PACKAGES = {
  social_spark: { label: "Social Spark", amountCents: 14_900, durationLabel: "15 seconds" },
  business_spotlight: { label: "Business Spotlight", amountCents: 29_900, durationLabel: "30 seconds" },
  cinematic_pro: { label: "Cinematic Pro", amountCents: 59_900, durationLabel: "Up to 60 seconds" },
} as const;

const packageIdSchema = z.enum(["social_spark", "business_spotlight", "cinematic_pro"]);
const videoStatusSchema = z.enum(["pending_payment", "paid", "in_production", "review", "revision_requested", "delivered", "cancelled"]);
const safeMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml", "application/pdf"]);

async function requireVideoAdmin(ctx: { user: { role: string; openId: string } | null }) {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  if (ctx.user.role === "admin" || ctx.user.openId === ENV.ownerOpenId) return;

  const { getDb } = await import("../db");
  const { technicians } = await import("../../drizzle/schema");
  const db = await getDb();
  if (db) {
    const [technician] = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
    if (technician?.status === "active" && technician.role === "admin") return;
  }
  throw new TRPCError({ code: "FORBIDDEN" });
}

function makeOrderNumber() {
  return `VID-${new Date().getUTCFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120) || "brand-asset";
}

export const videoStudioRouter = router({
  packages: publicProcedure.query(() => Object.entries(VIDEO_STUDIO_PACKAGES).map(([id, item]) => ({ id, ...item }))),

  createOrder: publicProcedure
    .input(z.object({
      clientName: z.string().trim().min(2).max(255),
      businessName: z.string().trim().min(2).max(255),
      email: z.string().trim().email().max(320),
      phone: z.string().trim().max(50).optional(),
      packageId: packageIdSchema,
      businessDescription: z.string().trim().min(20).max(4_000),
      videoGoal: z.string().trim().max(1_000).optional(),
      callToAction: z.string().trim().max(255).optional(),
      requestedAspectRatio: z.enum(["landscape", "portrait"]),
    }))
    .mutation(async ({ input }) => {
      const { getDb } = await import("../db");
      const { videoOrders } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const packageDetails = VIDEO_STUDIO_PACKAGES[input.packageId];
      const uploadToken = crypto.randomBytes(36).toString("hex");
      const orderNumber = makeOrderNumber();
      const result = await db.insert(videoOrders).values({
        orderNumber,
        clientName: input.clientName,
        businessName: input.businessName,
        email: input.email.toLowerCase(),
        phone: input.phone || null,
        packageId: input.packageId,
        amountCents: packageDetails.amountCents,
        businessDescription: input.businessDescription,
        videoGoal: input.videoGoal || null,
        callToAction: input.callToAction || null,
        requestedAspectRatio: input.requestedAspectRatio,
        uploadToken,
        status: "pending_payment",
      });

      return {
        orderId: Number(result[0].insertId),
        uploadToken,
        orderNumber,
      };
    }),

  uploadBrandAsset: publicProcedure
    .input(z.object({
      orderId: z.number().int().positive(),
      uploadToken: z.string().min(32).max(128),
      fileName: z.string().min(1).max(255),
      mimeType: z.string().max(100),
      base64Data: z.string().min(16).max(7_000_000),
    }))
    .mutation(async ({ input }) => {
      if (!safeMimeTypes.has(input.mimeType)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Use a PNG, JPG, WebP, SVG, or PDF brand asset." });
      }

      const bytes = Buffer.from(input.base64Data, "base64");
      if (!bytes.length || bytes.length > 5 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Each brand asset must be 5 MB or smaller." });
      }

      const { getDb } = await import("../db");
      const { videoOrders, videoOrderAssets } = await import("../../drizzle/schema");
      const { storagePut } = await import("../storage");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [order] = await db.select().from(videoOrders).where(eq(videoOrders.id, input.orderId)).limit(1);
      if (!order || order.uploadToken !== input.uploadToken || order.status !== "pending_payment") {
        throw new TRPCError({ code: "FORBIDDEN", message: "This upload is no longer available." });
      }

      const fileName = safeFileName(input.fileName);
      const fileKey = `video-studio-orders/${order.id}/${crypto.randomBytes(8).toString("hex")}-${fileName}`;
      const stored = await storagePut(fileKey, bytes, input.mimeType);
      const result = await db.insert(videoOrderAssets).values({
        orderId: order.id,
        fileKey: stored.key,
        fileUrl: stored.url,
        fileName,
        mimeType: input.mimeType,
        fileSizeBytes: bytes.length,
      });

      return { assetId: Number(result[0].insertId), fileUrl: stored.url, fileName };
    }),

  createCheckout: publicProcedure
    .input(z.object({
      orderId: z.number().int().positive(),
      uploadToken: z.string().min(32).max(128),
      origin: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      if (!ENV.stripeSecretKey) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Secure payments are temporarily unavailable." });

      const { getDb } = await import("../db");
      const { videoOrders } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [order] = await db.select().from(videoOrders).where(eq(videoOrders.id, input.orderId)).limit(1);
      if (!order || order.uploadToken !== input.uploadToken) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video order not found." });
      }
      if (order.status !== "pending_payment") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This video order can no longer be paid from this link." });
      }

      const packageDetails = VIDEO_STUDIO_PACKAGES[order.packageId];
      const stripe = new Stripe(ENV.stripeSecretKey, { apiVersion: "2026-02-25.clover" });
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: order.email,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: order.amountCents,
            product_data: {
              name: `FlowSites AI Video Studio — ${packageDetails.label}`,
              description: `${packageDetails.durationLabel} professional promotional video production service`,
            },
          },
        }],
        metadata: {
          videoOrderId: String(order.id),
          videoOrderNumber: order.orderNumber,
          videoPackageId: order.packageId,
        },
        success_url: `${input.origin}/ai-video-studio?order=success`,
        cancel_url: `${input.origin}/ai-video-studio?order=cancelled`,
      });

      await db.update(videoOrders).set({ stripeCheckoutSessionId: session.id }).where(eq(videoOrders.id, order.id));
      if (!session.url) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe did not return a checkout URL." });
      return { checkoutUrl: session.url };
    }),

  adminList: protectedProcedure.query(async ({ ctx }) => {
    await requireVideoAdmin(ctx);
    const { getDb } = await import("../db");
    const { videoOrders, videoOrderAssets } = await import("../../drizzle/schema");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const orders = await db.select().from(videoOrders).orderBy(desc(videoOrders.createdAt));
    return Promise.all(orders.map(async order => ({
      ...order,
      assets: await db.select().from(videoOrderAssets).where(eq(videoOrderAssets.orderId, order.id)),
    })));
  }),

  adminUpdate: protectedProcedure
    .input(z.object({
      orderId: z.number().int().positive(),
      status: videoStatusSchema.optional(),
      adminNotes: z.string().max(6_000).nullable().optional(),
      revisionNotes: z.string().max(6_000).nullable().optional(),
      previewUrl: z.string().url().max(1_000).nullable().optional(),
      deliveryUrl: z.string().url().max(1_000).nullable().optional(),
    }).refine(input => Object.keys(input).length > 1, { message: "Choose an order update." }))
    .mutation(async ({ ctx, input }) => {
      await requireVideoAdmin(ctx);
      const { getDb } = await import("../db");
      const { videoOrders } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const { orderId, ...updates } = input;
      const result = await db.update(videoOrders).set(updates).where(eq(videoOrders.id, orderId));
      if (!result[0].affectedRows) throw new TRPCError({ code: "NOT_FOUND", message: "Video order not found." });
      return { success: true };
    }),
});
