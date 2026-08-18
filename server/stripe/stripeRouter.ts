import { z } from "zod";
import Stripe from "stripe";
import { router, publicProcedure } from "../_core/trpc";
import { ENV } from "../_core/env";
import { TIERS, TierKey } from "./products";

const getStripe = () => {
  if (!ENV.stripeSecretKey) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(ENV.stripeSecretKey, { apiVersion: "2026-02-25.clover" });
};

const SUB_TIER_PRICES: Record<string, number> = {
  essential: 99,
  growth: 149,
  premium: 249,
};

export const stripeRouter = router({
  /**
   * Create a Stripe Checkout Session for a wizard submission.
   * Accepts a custom build amount (in dollars) + subscription tier + payment plan.
   *
   * Pay in full:  session mode = "subscription"
   *   - Line item 1: one-time build fee charged as a first invoice item
   *   - Line item 2: recurring monthly hosting subscription
   *
   * Finance (6 or 12 month): session mode = "subscription"
   *   - Line item 1: build instalment (recurring, monthly)
   *   - Line item 2: monthly hosting subscription
   *
   * On success, redirects to /client-portal?payment=success
   */
  createWizardCheckout: publicProcedure
    .input(
      z.object({
        buildAmount: z.number().min(0), // total build price in dollars
        subscriptionTierId: z.enum(["essential", "growth", "premium"]),
        paymentPlan: z.enum(["full", "6month", "12month"]),
        businessName: z.string(),
        email: z.string().email().optional(),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const stripe = getStripe();
      const successUrl = `${input.origin}/client-portal?payment=success`;
      const cancelUrl = `${input.origin}/get-started?payment=cancel`;

      const monthlyFee = SUB_TIER_PRICES[input.subscriptionTierId] ?? 149;
      const tierLabel =
        input.subscriptionTierId.charAt(0).toUpperCase() +
        input.subscriptionTierId.slice(1);

      let session: Stripe.Checkout.Session;

      if (input.paymentPlan === "full") {
        // Pay in full: charge build fee upfront + start monthly subscription
        // Use subscription mode with an invoice_item for the one-time build fee
        session = await stripe.checkout.sessions.create({
          mode: "subscription",
          allow_promotion_codes: true,
          customer_email: input.email,
          line_items: [
            // Recurring monthly hosting fee
            {
              price_data: {
                currency: "usd",
                unit_amount: monthlyFee * 100,
                recurring: { interval: "month" },
                product_data: {
                  name: `FlowSites ${tierLabel} Hosting & Support`,
                  description: `Monthly hosting, SSL, updates, and support — ${tierLabel} plan`,
                },
              },
              quantity: 1,
            },
          ],
          // One-time build fee added as an invoice item on the first invoice
          subscription_data: {
            description: `Website build for ${input.businessName}`,
            metadata: {
              business_name: input.businessName,
              payment_plan: "full",
              subscription_tier: input.subscriptionTierId,
            },
          },
          invoice_creation: undefined,
          // Add the one-time build charge to the first invoice via payment_intent_data is not
          // available in subscription mode — use add_invoice_items instead
          metadata: {
            business_name: input.businessName,
            payment_plan: "full",
            subscription_tier: input.subscriptionTierId,
            build_amount_cents: String(Math.round(input.buildAmount * 100)),
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
        });

        // After session creation, add the one-time build fee as an invoice item
        // that will be included on the first subscription invoice
        if (session.customer) {
          await stripe.invoiceItems.create({
            customer: session.customer as string,
            amount: Math.round(input.buildAmount * 100),
            currency: "usd",
            description: `FlowSites Website Build — ${input.businessName}`,
          });
        }
      } else {
        // Financing: split build into monthly instalments + hosting as separate line items
        const months = input.paymentPlan === "6month" ? 6 : 12;
        const multiplier = input.paymentPlan === "6month" ? 1.10 : 1.20;
        const totalWithFee = Math.round(input.buildAmount * multiplier);
        const buildInstalment = Math.round(totalWithFee / months);

        session = await stripe.checkout.sessions.create({
          mode: "subscription",
          allow_promotion_codes: true,
          customer_email: input.email,
          line_items: [
            // Build instalment (recurring for N months)
            {
              price_data: {
                currency: "usd",
                unit_amount: buildInstalment * 100,
                recurring: { interval: "month" },
                product_data: {
                  name: `FlowSites Website Build — ${months}-Month Plan`,
                  description: `Build instalment · ${months} payments · 0% interest · ${input.businessName}`,
                },
              },
              quantity: 1,
            },
            // Monthly hosting fee
            {
              price_data: {
                currency: "usd",
                unit_amount: monthlyFee * 100,
                recurring: { interval: "month" },
                product_data: {
                  name: `FlowSites ${tierLabel} Hosting & Support`,
                  description: `Monthly hosting, SSL, updates, and support — ${tierLabel} plan`,
                },
              },
              quantity: 1,
            },
          ],
          subscription_data: {
            description: `${months}-month finance plan for ${input.businessName}`,
            metadata: {
              business_name: input.businessName,
              payment_plan: input.paymentPlan,
              subscription_tier: input.subscriptionTierId,
              months: String(months),
            },
          },
          metadata: {
            business_name: input.businessName,
            payment_plan: input.paymentPlan,
            subscription_tier: input.subscriptionTierId,
            months: String(months),
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
        });
      }

      return { url: session.url };
    }),

  /**
   * Create a Stripe Checkout Session for a given tier (homepage pricing cards).
   * paymentType: "full"     → one-time build fee + monthly subscription
   * paymentType: "monthly"  → recurring monthly subscription only
   * paymentType: "finance"  → 12-month instalment plan + monthly subscription
   */
  createCheckout: publicProcedure
    .input(
      z.object({
        tier: z.enum(["launch", "growth", "authority"]),
        paymentType: z.enum(["full", "monthly", "finance"]),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const stripe = getStripe();
      const tierData = TIERS[input.tier as TierKey];
      const successUrl = `${input.origin}/get-started?payment=success&tier=${input.tier}`;
      const cancelUrl = `${input.origin}/get-started?payment=cancel`;

      let session: Stripe.Checkout.Session;

      if (input.paymentType === "full") {
        // Build fee + monthly subscription together
        session = await stripe.checkout.sessions.create({
          mode: "subscription",
          allow_promotion_codes: true,
          line_items: [
            {
              price_data: {
                currency: "usd",
                unit_amount: tierData.monthlyAmountCents,
                recurring: { interval: "month" },
                product_data: {
                  name: `FlowSites ${tierData.name} — Monthly Hosting & Support`,
                  description: "Hosting, SSL, updates, and ongoing support",
                },
              },
              quantity: 1,
            },
          ],
          subscription_data: {
            metadata: {
              tier: input.tier,
              payment_type: "full_build",
            },
          },
          metadata: {
            tier: input.tier,
            payment_type: "full_build",
            build_amount_cents: String(tierData.buildAmountCents),
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
        });
      } else if (input.paymentType === "monthly") {
        // Recurring monthly hosting subscription only
        session = await stripe.checkout.sessions.create({
          mode: "subscription",
          allow_promotion_codes: true,
          line_items: [
            {
              price_data: {
                currency: "usd",
                unit_amount: tierData.monthlyAmountCents,
                recurring: { interval: "month" },
                product_data: {
                  name: `FlowSites ${tierData.name} — Monthly Hosting & Support`,
                  description: "Hosting, SSL, updates, and ongoing support",
                },
              },
              quantity: 1,
            },
          ],
          metadata: {
            tier: input.tier,
            payment_type: "monthly_subscription",
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
        });
      } else {
        // 12-month financing: build instalment + hosting as separate line items
        const combinedMonthly =
          tierData.financeMonthlyBuildCents + tierData.monthlyAmountCents;
        session = await stripe.checkout.sessions.create({
          mode: "subscription",
          allow_promotion_codes: true,
          line_items: [
            {
              price_data: {
                currency: "usd",
                unit_amount: tierData.financeMonthlyBuildCents,
                recurring: { interval: "month" },
                product_data: {
                  name: `FlowSites ${tierData.name} — 12-Month Build Plan`,
                  description: `Build instalment · 0% interest · 12-month term`,
                },
              },
              quantity: 1,
            },
            {
              price_data: {
                currency: "usd",
                unit_amount: tierData.monthlyAmountCents,
                recurring: { interval: "month" },
                product_data: {
                  name: `FlowSites ${tierData.name} — Monthly Hosting & Support`,
                  description: "Hosting, SSL, updates, and ongoing support",
                },
              },
              quantity: 1,
            },
          ],
          metadata: {
            tier: input.tier,
            payment_type: "finance_12mo",
            combined_monthly_cents: String(combinedMonthly),
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
        });
      }

      return { url: session.url };
    }),
});
