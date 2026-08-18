/**
 * SMS helpers — Twilio REST API (no SDK dependency)
 *
 * Required env vars (set in Settings → Secrets):
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_FROM_NUMBER  (E.164 format, e.g. +12818189288)
 */

interface SendSmsParams {
  to: string;   // raw phone number — will be normalized to E.164
  body: string;
}

/**
 * Normalize any phone string to E.164.
 * Strips non-digits, prepends +1 for 10-digit US numbers.
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (!digits.startsWith("+")) return `+${digits}`;
  return digits;
}

/**
 * Send an SMS via Twilio REST API.
 * Returns true on success, false when credentials are missing or the request fails.
 * Never throws — callers can treat SMS as non-fatal.
 */
export async function sendSms({ to, body }: SendSmsParams): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("[SMS] Twilio credentials not configured — skipping SMS");
    return false;
  }

  if (!to || to.replace(/\D/g, "").length < 7) {
    console.warn("[SMS] Invalid or missing phone number — skipping SMS");
    return false;
  }

  const toNormalized = normalizePhone(to);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams({ To: toNormalized, From: fromNumber, Body: body });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[SMS] Twilio error:", errText);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[SMS] Unexpected error:", err);
    return false;
  }
}

/**
 * Send a welcome SMS to a client when a new project is created for them.
 * Called automatically by the adminProjects.create procedure.
 */
export async function sendProjectWelcomeSms(data: {
  clientName: string;
  clientPhone: string;
  businessName: string;
  monthlyPrice?: number;
  portalUrl: string;
}): Promise<boolean> {
  const priceLine = data.monthlyPrice
    ? ` Your plan: $${data.monthlyPrice.toFixed(2)}/mo.`
    : "";

  const body =
    `Hi ${data.clientName}! 🎉 Your FlowSites project for ${data.businessName} is live.` +
    priceLine +
    ` Access your Client Portal here: ${data.portalUrl}` +
    ` Questions? Call us: (281) 818-9288`;

  return sendSms({ to: data.clientPhone, body });
}
