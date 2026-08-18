import { Request, Response } from "express";
import Stripe from "stripe";
import { ENV } from "../_core/env";

export async function stripeWebhookHandler(req: Request, res: Response) {
  const stripe = new Stripe(ENV.stripeSecretKey, { apiVersion: "2026-02-25.clover" });
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, ENV.stripeWebhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Webhook] Signature verification failed:", message);
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Webhook] Received event: ${event.type} | id: ${event.id}`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { invoiceId, shareToken } = session.metadata ?? {};

      console.log(
        `[Webhook] Checkout completed — invoiceId: ${invoiceId}, shareToken: ${shareToken}, paymentStatus: ${session.payment_status}`
      );

      // Only mark paid if this checkout was for a client invoice (has invoiceId in metadata)
      if (invoiceId && session.payment_status === "paid") {
        try {
          const { getDb } = await import("../db");
          const { clientInvoices } = await import("../../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const db = await getDb();

          if (db) {
            const invId = Number(invoiceId);

            // Fetch invoice before updating to get clientAccountId and amount
            const [inv] = await db
              .select()
              .from(clientInvoices)
              .where(eq(clientInvoices.id, invId))
              .limit(1);

            if (inv && inv.status !== "paid") {
              await db
                .update(clientInvoices)
                .set({
                  status: "paid",
                  paidAt: new Date(),
                  stripePaymentIntentId: session.payment_intent as string ?? null,
                })
                .where(eq(clientInvoices.id, invId));

              console.log(`[Webhook] Invoice ${invoiceId} marked as paid`);

              // If this was a setup fee payment, mark it as paid on the project
              if (session.metadata?.paymentType === "setup_fee" && session.metadata?.projectId) {
                try {
                  const { clientProjects } = await import("../../drizzle/schema");
                  await db
                    .update(clientProjects)
                    .set({ setupFee: 0 })
                    .where(eq(clientProjects.id, Number(session.metadata.projectId)));
                  console.log(`[Webhook] Setup fee marked as paid on project ${session.metadata.projectId}`);
                } catch (sfErr) {
                  console.error("[Webhook] Failed to mark setup fee as paid on project:", sfErr);
                }
              }

              // Fire dual commissions (rep 15% + partner 15%)
              try {
                const { createDualCommissions } = await import("../routers/partnerRouter");
                await createDualCommissions(db, inv.id, inv.clientAccountId, inv.totalAmountCents);
                console.log(`[Webhook] Dual commissions created for invoice ${invId}`);
              } catch (commErr) {
                console.error("[Webhook] Commission creation failed:", commErr);
              }

              // SMS notification to owner
              try {
                const { sendSms } = await import("../800com");
                const { clientAccounts } = await import("../../drizzle/schema");
                const [acct] = await db.select().from(clientAccounts).where(eq(clientAccounts.id, inv.clientAccountId)).limit(1);
                const clientName = acct?.businessName || acct?.clientName || "Client";
                const amount = `$${(inv.totalAmountCents / 100).toFixed(2)}`;
                await sendSms({ recipient: "2818189288", message: `💰 FlowSites: Invoice ${inv.invoiceNumber} for ${clientName} has been paid — ${amount}!` });
              } catch (smsErr) {
                console.error("[Webhook] SMS notification failed:", smsErr);
              }
            }
          }
        } catch (dbErr) {
          console.error("[Webhook] Failed to update invoice status:", dbErr);
        }
      }
      break;
    }

    case "payment_intent.succeeded": {
      // Fallback: if checkout.session.completed doesn't fire, catch it here via shareToken
      const pi = event.data.object as Stripe.PaymentIntent;
      const { invoiceId, shareToken } = pi.metadata ?? {};

      console.log(`[Webhook] PaymentIntent succeeded — invoiceId: ${invoiceId}, shareToken: ${shareToken}`);

      if (invoiceId) {
        try {
          const { getDb } = await import("../db");
          const { clientInvoices } = await import("../../drizzle/schema");
          const { eq, and, ne } = await import("drizzle-orm");
          const db = await getDb();

          if (db) {
            const invId = Number(invoiceId);

            const [inv] = await db
              .select()
              .from(clientInvoices)
              .where(and(eq(clientInvoices.id, invId), ne(clientInvoices.status, "paid")))
              .limit(1);

            if (inv) {
              await db
                .update(clientInvoices)
                .set({
                  status: "paid",
                  paidAt: new Date(),
                  stripePaymentIntentId: pi.id,
                })
                .where(eq(clientInvoices.id, invId));

              console.log(`[Webhook] Invoice ${invoiceId} marked as paid via payment_intent.succeeded`);

              // Fire dual commissions (rep 15% + partner 15%)
              try {
                const { createDualCommissions } = await import("../routers/partnerRouter");
                await createDualCommissions(db, inv.id, inv.clientAccountId, inv.totalAmountCents);
                console.log(`[Webhook] Dual commissions created for invoice ${invId} via payment_intent`);
              } catch (commErr) {
                console.error("[Webhook] Commission creation failed:", commErr);
              }

              // SMS notification to owner
              try {
                const { sendSms } = await import("../800com");
                const { clientAccounts } = await import("../../drizzle/schema");
                const [acct] = await db.select().from(clientAccounts).where(eq(clientAccounts.id, inv.clientAccountId)).limit(1);
                const clientName = acct?.businessName || acct?.clientName || "Client";
                const amount = `$${(inv.totalAmountCents / 100).toFixed(2)}`;
                await sendSms({ recipient: "2818189288", message: `💰 FlowSites: Invoice ${inv.invoiceNumber} for ${clientName} has been paid — ${amount}!` });
              } catch (smsErr) {
                console.error("[Webhook] SMS notification failed:", smsErr);
              }
            }
          }
        } catch (dbErr) {
          console.error("[Webhook] Failed to update invoice status via payment_intent:", dbErr);
        }
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`[Webhook] Stripe invoice paid — id: ${invoice.id}`);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`[Webhook] Subscription cancelled — id: ${sub.id}`);
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}
