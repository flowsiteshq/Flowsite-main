/**
 * 800.com Inbound SMS Webhook Handler
 *
 * 800.com POSTs to this endpoint whenever a contact replies to a message.
 * We store the inbound message in sms_logs so the dashboard can display it
 * in real time via polling.
 *
 * 800.com webhook payload shape (based on their API docs):
 * {
 *   id: string;           // message ID
 *   from: string;         // sender phone (the lead's number)
 *   to: string;           // recipient phone (our 800.com number)
 *   message: string;      // message body
 *   timestamp: string;    // ISO 8601 or Unix timestamp
 *   type?: string;        // "sms" | "mms"
 *   media_url?: string;   // MMS attachment URL
 * }
 *
 * 800.com may also send a verification GET request with a challenge param;
 * we handle that too.
 */

import type { Request, Response } from "express";
import { getDb } from "./db";
import { smsLogs, wizardSubmissions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { toE164 } from "./800com";

export interface EightHundredWebhookPayload {
  id?: string;
  from?: string;
  to?: string;
  message?: string;
  body?: string;       // some 800.com versions use "body"
  text?: string;       // fallback
  timestamp?: string | number;
  type?: string;
  media_url?: string;
  mediaUrl?: string;
}

/**
 * POST /api/800com/webhook
 * Receives inbound SMS from 800.com and stores in sms_logs.
 */
export async function eightHundredWebhookHandler(req: Request, res: Response) {
  try {
    const payload = req.body as EightHundredWebhookPayload;

    // 800.com sometimes sends a GET verification challenge
    if (req.method === "GET") {
      const challenge = (req.query.challenge as string) || "ok";
      return res.status(200).send(challenge);
    }

    // Extract fields — 800.com uses different field names across versions
    const fromRaw = payload.from ?? "";
    const messageBody = payload.message ?? payload.body ?? payload.text ?? "";
    const externalId = payload.id ?? null;
    const mediaUrl = payload.media_url ?? payload.mediaUrl ?? null;

    if (!fromRaw || !messageBody) {
      // Acknowledge but don't process empty payloads
      console.warn("[800.com Webhook] Missing from or message body:", payload);
      return res.status(200).json({ received: true, stored: false });
    }

    const contactPhone = toE164(fromRaw);

    // Try to find a matching lead by phone number
    let leadId: number | null = null;
    const db = await getDb();
    if (db) {
      // Normalize the stored phone for comparison — strip non-digits
      const digitsOnly = contactPhone.replace(/\D/g, "");
      const leads = await db
        .select({ id: wizardSubmissions.id, phone: wizardSubmissions.phone })
        .from(wizardSubmissions)
        .limit(200);

      const match = leads.find((l) => {
        const d = (l.phone ?? "").replace(/\D/g, "");
        return d === digitsOnly || d === digitsOnly.slice(-10);
      });
      if (match) leadId = match.id;

      // Store the inbound message
      await db.insert(smsLogs).values({
        leadId: leadId ?? null,
        clientAccountId: null,
        direction: "inbound",
        contactPhone,
        message: messageBody,
        sentBy: null,
        sentByOpenId: null,
        conversationId: externalId,
        status: "delivered",
        createdAt: new Date(),
      });

      console.log(
        `[800.com Webhook] Stored inbound SMS from ${contactPhone}` +
          (leadId ? ` (lead #${leadId})` : " (no matching lead)")
      );
    }

    return res.status(200).json({ received: true, stored: !!db });
  } catch (err) {
    console.error("[800.com Webhook] Error processing inbound SMS:", err);
    // Always return 200 so 800.com doesn't retry indefinitely
    return res.status(200).json({ received: true, error: "internal error" });
  }
}

/**
 * GET /api/800com/webhook
 * Handles 800.com webhook URL verification challenges.
 */
export async function eightHundredWebhookVerify(req: Request, res: Response) {
  const challenge = (req.query.challenge as string) || "ok";
  return res.status(200).send(challenge);
}
