import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { TrpcContext } from "../_core/context";
import { ENV } from "../_core/env";
import { publicProcedure, router } from "../_core/trpc";

const consentDisclosureVersion = "free-website-sms-v1";
const previewStatuses = ["new", "under_review", "qualified", "preview_requested", "preview_ready", "preview_delivered", "closed"] as const;

type PreviewStatus = (typeof previewStatuses)[number];

/**
 * Free Website Program staff actions are restricted to the same strict-admin
 * identity boundary used for sensitive CRM settings. A queue update records
 * internal review metadata only; it cannot send messages, publish a preview,
 * create a payment, or enroll a prospect.
 */
async function requirePreviewRequestAdmin(ctx: TrpcContext): Promise<void> {
  const { getAdminSession, getDb } = await import("../db");
  const adminToken = ctx.req.cookies?.admin_session || (ctx.req.headers["x-admin-token"] as string | undefined);
  if (adminToken && await getAdminSession(adminToken)) return;

  const emailToken = ctx.req.cookies?.email_session_id;
  if (emailToken) {
    const { emailAuthSessions } = await import("../../drizzle/schema");
    const db = await getDb();
    if (db) {
      const [session] = await db.select().from(emailAuthSessions).where(eq(emailAuthSessions.sessionToken, emailToken)).limit(1);
      if (session && session.isAdmin === 1 && session.expiresAt > new Date()) return;
    }
  }

  if (ctx.user?.openId) {
    if (ctx.user.role === "admin" || ctx.user.openId === ENV.ownerOpenId) return;
    const { technicians } = await import("../../drizzle/schema");
    const db = await getDb();
    if (db) {
      const [technician] = await db.select().from(technicians).where(eq(technicians.openId, ctx.user.openId)).limit(1);
      if (technician?.status === "active" && technician.role === "admin") return;
    }
  }

  throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
}

/**
 * Captures a Free Website Program request without creating a subscription,
 * payment record, or outbound marketing communication. The offer-specific
 * record is linked to the canonical CRM lead for staff review.
 */
export const freeWebsiteRouter = router({
  submitPreviewRequest: publicProcedure
    .input(
      z.object({
        businessName: z.string().min(2).max(255),
        contactName: z.string().min(2).max(255),
        industry: z.string().min(2).max(100),
        businessLocation: z.string().max(255).optional(),
        phone: z.string().min(7).max(50),
        email: z.string().email().max(320),
        existingWebsiteUrl: z.string().url().max(500).optional().or(z.literal("")),
        desiredWebsiteFeatures: z.string().max(4000).optional(),
        businessDescription: z.string().min(10).max(4000),
        preferredContactMethod: z.enum(["phone", "email", "either"]),
        marketingSmsConsent: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const { createWizardSubmission } = await import("../db");
      const lead = await createWizardSubmission({
        businessName: input.businessName,
        businessType: input.industry,
        website: input.existingWebsiteUrl || undefined,
        phone: input.phone,
        email: input.email.toLowerCase(),
        colorScheme: "not_specified",
        primaryGoal: "Request a Free Website Program preview",
        currentChallenges: input.desiredWebsiteFeatures || undefined,
        timeline: "flexible",
        budget: "monthly_service_program",
        additionalNotes: [
          "Free Website Program request.",
          `Contact: ${input.contactName}`,
          input.businessLocation ? `Location: ${input.businessLocation}` : "",
          `Preferred contact method: ${input.preferredContactMethod}`,
          input.businessDescription,
        ]
          .filter(Boolean)
          .join("\n"),
      });

      const { getDb } = await import("../db");
      const { freeWebsitePreviewRequests } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(freeWebsitePreviewRequests).values({
        leadId: lead.id,
        businessName: input.businessName,
        contactName: input.contactName,
        industry: input.industry,
        businessLocation: input.businessLocation || null,
        phone: input.phone,
        email: input.email.toLowerCase(),
        existingWebsiteUrl: input.existingWebsiteUrl || null,
        desiredWebsiteFeatures: input.desiredWebsiteFeatures || null,
        businessDescription: input.businessDescription,
        preferredContactMethod: input.preferredContactMethod,
        marketingSmsConsent: input.marketingSmsConsent ? 1 : 0,
        marketingConsentAt: input.marketingSmsConsent ? new Date() : null,
        consentDisclosureVersion: input.marketingSmsConsent ? consentDisclosureVersion : null,
      });

      return {
        success: true,
        leadId: lead.id,
        message: "Your request has been received for staff review.",
      };
    }),

  listPreviewRequests: publicProcedure.query(async ({ ctx }) => {
    await requirePreviewRequestAdmin(ctx);
    const { getDb } = await import("../db");
    const { freeWebsitePreviewRequests } = await import("../../drizzle/schema");
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    return db.select().from(freeWebsitePreviewRequests).orderBy(desc(freeWebsitePreviewRequests.createdAt));
  }),

  updatePreviewRequest: publicProcedure
    .input(z.object({
      requestId: z.number().int().positive(),
      status: z.enum(previewStatuses).optional(),
      internalNotes: z.string().trim().max(5000).nullable().optional(),
      previewUrl: z.string().url().max(1000).nullable().optional(),
      deliveryChecklistComplete: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await requirePreviewRequestAdmin(ctx);
      if (input.status === "preview_delivered" && input.deliveryChecklistComplete !== true) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Complete the human delivery checklist before marking a preview as delivered.",
        });
      }

      const { getDb } = await import("../db");
      const { freeWebsitePreviewRequests } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const updates: {
        status?: PreviewStatus;
        internalNotes?: string | null;
        previewUrl?: string | null;
        deliveryChecklistComplete?: number;
        reviewedAt: Date;
      } = { reviewedAt: new Date() };
      if (input.status !== undefined) updates.status = input.status;
      if (input.internalNotes !== undefined) updates.internalNotes = input.internalNotes;
      if (input.previewUrl !== undefined) updates.previewUrl = input.previewUrl;
      if (input.deliveryChecklistComplete !== undefined) updates.deliveryChecklistComplete = input.deliveryChecklistComplete ? 1 : 0;

      await db.update(freeWebsitePreviewRequests).set(updates).where(eq(freeWebsitePreviewRequests.id, input.requestId));
      return { success: true };
    }),
});
