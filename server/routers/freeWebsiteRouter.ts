import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";

const consentDisclosureVersion = "free-website-sms-v1";

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
});
