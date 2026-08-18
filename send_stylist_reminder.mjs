/**
 * One-time script: Send Stylist Factory a payment reminder
 * for their outstanding balance and monthly charge
 */
import dotenv from 'dotenv';
dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM_ADDRESS || 'FlowSites <hello@flow-sites.com>';

const CLIENT_NAME = 'Latisha';
const BUSINESS_NAME = 'Stylist Factory';
const RECIPIENT_PHONE = '+18328335383';
const RECIPIENT_EMAIL = 'stylistfactorytx@gmail.com';
const PORTAL_URL = 'https://flow-sites.com/client-portal';

// From DB: setup_fee = $3,499, monthly = $199 (client_projects)
// From DB: invoice open = $3,499 (monthlyPriceCents=349900 in client_accounts — this is the build fee)
// Monthly hosting = $199/mo
const BUILD_BALANCE = '$3,499.00';
const MONTHLY_CHARGE = '$199.00';
const INVOICE_NUMBER = 'INV-2026-0005';
const DUE_DATE = 'May 12, 2026';

function normalizePhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

// ─── Send SMS via Twilio ─────────────────────────────────────────────────────
async function sendSms() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    console.log('⚠️  SMS skipped — Twilio credentials not configured');
    return false;
  }

  const body = `Hi ${CLIENT_NAME}! This is a friendly reminder from FlowSites.\n\nYou have a pending balance:\n• Build fee balance: ${BUILD_BALANCE} (${INVOICE_NUMBER})\n• Monthly hosting: ${MONTHLY_CHARGE}/mo\n\nYou can make a payment anytime at:\n${PORTAL_URL}\n\nQuestions? Call 281-503-8903.`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const params = new URLSearchParams({
    To: normalizePhone(RECIPIENT_PHONE),
    From: TWILIO_FROM_NUMBER,
    Body: body,
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const text = await res.text();
  console.log('SMS response:', res.status, text.substring(0, 300));
  return res.ok;
}

// ─── Send Email via Resend ───────────────────────────────────────────────────
async function sendEmail() {
  if (!RESEND_API_KEY) {
    console.log('⚠️  Email skipped — no Resend API key configured');
    return false;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 12px;">
      <div style="border-left: 4px solid #e53e3e; padding-left: 16px; margin-bottom: 28px;">
        <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 4px 0;">Payment Reminder</h1>
        <p style="color: #999; margin: 0; font-size: 14px;">${BUSINESS_NAME} — Account Balance Due</p>
      </div>

      <p style="color: #cccccc; font-size: 16px; line-height: 1.6;">Hi ${CLIENT_NAME},</p>
      <p style="color: #cccccc; font-size: 16px; line-height: 1.6;">
        This is a friendly reminder that you have a pending balance on your FlowSites account. Here's a summary of what's outstanding:
      </p>

      <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #e53e3e; margin: 0 0 16px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Outstanding Balance</h3>
        
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #2a2a2a;">
          <div>
            <p style="margin: 0; color: #ffffff; font-weight: bold;">Website Build Fee</p>
            <p style="margin: 4px 0 0 0; color: #888; font-size: 13px;">Invoice ${INVOICE_NUMBER} · Due ${DUE_DATE}</p>
          </div>
          <p style="margin: 0; color: #e53e3e; font-size: 20px; font-weight: bold;">${BUILD_BALANCE}</p>
        </div>

        <div style="display: flex; justify-content: space-between; padding: 12px 0;">
          <div>
            <p style="margin: 0; color: #ffffff; font-weight: bold;">Monthly Hosting & Maintenance</p>
            <p style="margin: 4px 0 0 0; color: #888; font-size: 13px;">Recurring monthly charge</p>
          </div>
          <p style="margin: 0; color: #ffffff; font-size: 20px; font-weight: bold;">${MONTHLY_CHARGE}<span style="font-size: 13px; color: #888;">/mo</span></p>
        </div>
      </div>

      <p style="color: #cccccc; font-size: 15px; line-height: 1.6;">
        You can make a payment — including a partial deposit toward your balance — directly through your client portal. We accept all major credit cards and Klarna (buy now, pay later).
      </p>

      <div style="text-align: center; margin-top: 28px;">
        <a href="${PORTAL_URL}" style="background: #e53e3e; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Make a Payment</a>
      </div>

      <p style="color: #666; font-size: 13px; margin-top: 28px;">
        If you have any questions or need to discuss a payment plan, please don't hesitate to reach out. Reply to this email or call us at <strong style="color: #ffffff;">281-503-8903</strong>.
      </p>

      <p style="color: #555; font-size: 12px; text-align: center; margin-top: 32px; border-top: 1px solid #222; padding-top: 20px;">FlowSites | Premium Web Agency | flow-sites.com</p>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [RECIPIENT_EMAIL],
      subject: `Payment Reminder — ${BUSINESS_NAME} Balance Due`,
      html,
    }),
  });
  const json = await res.json();
  console.log('Email response:', res.status, JSON.stringify(json));
  return res.ok;
}

// ─── Run ─────────────────────────────────────────────────────────────────────
console.log('Sending SMS reminder to', RECIPIENT_PHONE, '...');
const smsOk = await sendSms();
console.log('Sending Email reminder to', RECIPIENT_EMAIL, '...');
const emailOk = await sendEmail();
console.log('');
console.log('Results:', { sms: smsOk ? '✅ sent' : '❌ failed/skipped', email: emailOk ? '✅ sent' : '❌ failed/skipped' });
