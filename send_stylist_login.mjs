/**
 * One-time script: Send Stylist Factory their client portal login details
 * via SMS (+18328335383) and email (stylistfactorytx@gmail.com)
 */
import dotenv from 'dotenv';
dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM_ADDRESS || 'FlowSites <hello@flow-sites.com>';

const RECIPIENT_PHONE = '+18328335383';
const RECIPIENT_EMAIL = 'stylistfactorytx@gmail.com';
const PORTAL_URL = 'https://flow-sites.com/client-portal';
const TEMP_PASSWORD = 'FlowSites2025';

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

  const body = `Hi Stylist Factory! Your FlowSites client portal is ready.\n\nLogin: ${PORTAL_URL}\nEmail: ${RECIPIENT_EMAIL}\nTemp password: ${TEMP_PASSWORD}\n\nPlease change your password after logging in. Questions? Call 281-503-8903.`;

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
  console.log('SMS response:', res.status, text.substring(0, 200));
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
      <h1 style="color: #ffffff; font-size: 26px; margin-bottom: 8px;">Your Client Portal is Ready</h1>
      <p style="color: #cccccc; font-size: 16px; line-height: 1.6;">Hi Stylist Factory team,</p>
      <p style="color: #cccccc; font-size: 16px; line-height: 1.6;">
        Your FlowSites client portal is now live! Log in to track your project progress, view build updates, and access your deliverables.
      </p>
      <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #e53e3e; margin: 0 0 16px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Login Details</h3>
        <p style="margin: 8px 0; color: #ffffff;"><strong>Portal URL:</strong> <a href="${PORTAL_URL}" style="color: #e53e3e;">${PORTAL_URL}</a></p>
        <p style="margin: 8px 0; color: #ffffff;"><strong>Email:</strong> ${RECIPIENT_EMAIL}</p>
        <p style="margin: 8px 0; color: #ffffff;"><strong>Temporary Password:</strong> <code style="background:#2a2a2a; padding: 2px 8px; border-radius: 4px;">${TEMP_PASSWORD}</code></p>
      </div>
      <p style="color: #999999; font-size: 14px;">Please change your password after your first login. Questions? Reply to this email or call <strong style="color: #ffffff;">281-503-8903</strong>.</p>
      <div style="text-align: center; margin-top: 32px;">
        <a href="${PORTAL_URL}" style="background: #e53e3e; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Access Your Portal</a>
      </div>
      <p style="color: #555; font-size: 12px; text-align: center; margin-top: 32px;">FlowSites | Premium Web Agency | flow-sites.com</p>
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
      subject: 'Your FlowSites Client Portal Login Details',
      html,
    }),
  });
  const json = await res.json();
  console.log('Email response:', res.status, JSON.stringify(json));
  return res.ok;
}

// ─── Run ─────────────────────────────────────────────────────────────────────
console.log('Sending SMS to', RECIPIENT_PHONE, '...');
const smsOk = await sendSms();
console.log('Sending Email to', RECIPIENT_EMAIL, '...');
const emailOk = await sendEmail();
console.log('');
console.log('Results:', { sms: smsOk ? '✅ sent' : '❌ failed/skipped', email: emailOk ? '✅ sent' : '❌ failed/skipped' });
