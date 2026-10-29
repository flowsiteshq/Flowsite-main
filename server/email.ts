import { Resend } from "resend";
import { ENV } from "./_core/env";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(ENV.resendApiKey);
  return _resend;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export type EmailSendResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  const result = await sendEmailWithResult({ to, subject, html });
  return result.ok;
}

/**
 * Send an email and preserve the provider's actionable error for audit and retry UI.
 */
export async function sendEmailWithResult({ to, subject, html }: SendEmailParams): Promise<EmailSendResult> {
  if (!ENV.resendApiKey) {
    const error = "RESEND_API_KEY is not configured";
    console.warn(`[Email] ${error}`);
    return { ok: false, error };
  }
  if (ENV.isProduction && ENV.emailFromAddress.includes("onboarding@resend.dev")) {
    const error = "Production email sender is still onboarding@resend.dev; configure a verified FlowSites sender address";
    console.error(`[Email] ${error}`);
    return { ok: false, error };
  }
  try {
    const { error } = await getResend().emails.send({
      from: ENV.emailFromAddress,
      to,
      subject,
      html,
    });
    if (error) {
      console.error("[Email] Failed to send email:", error);
      const providerError = [error.name, error.message].filter(Boolean).join(": ") || "Resend rejected the message";
      return { ok: false, error: providerError };
    }
    return { ok: true };
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Email provider request failed" };
  }
}

/**
 * Generate confirmation email HTML for wizard submissions
 */
export function generateWizardConfirmationEmail(data: {
  businessName: string;
  contactName?: string;
}): string {
  const name = data.contactName || "there";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Inquiry</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0f; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, rgba(20, 20, 30, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663031545745/urOWhqfyIrKAoifg.png" alt="FlowSites" style="height: 60px; width: auto;">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                Thank You for Your Inquiry!
              </h1>
              
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                Hi ${name},
              </p>
              
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                We've received your inquiry for <strong style="color: #ffffff;">${data.businessName}</strong> and we're excited to help you build a high-converting website that drives real results.
              </p>
              
              <div style="margin: 30px 0; padding: 24px; background: rgba(220, 38, 38, 0.1); border-left: 4px solid #dc2626; border-radius: 8px;">
                <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                  What Happens Next?
                </h2>
                <ol style="margin: 0; padding-left: 20px; color: rgba(255, 255, 255, 0.8); font-size: 15px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Our team will review your submission within 24 hours</li>
                  <li style="margin-bottom: 8px;">We'll reach out to schedule a discovery call to discuss your goals</li>
                  <li style="margin-bottom: 8px;">We'll create a custom proposal tailored to your business needs</li>
                  <li>You'll get a website that actually enrolls students and grows your business</li>
                </ol>
              </div>
              
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                In the meantime, feel free to explore our <a href="https://flowsites.manus.space/portfolio" style="color: #dc2626; text-decoration: none; font-weight: 600;">portfolio</a> and <a href="https://flowsites.manus.space/case-study/homeup" style="color: #dc2626; text-decoration: none; font-weight: 600;">case studies</a> to see the results we've achieved for businesses like yours.
              </p>
              
              <div style="margin: 30px 0; padding: 24px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                  Questions? We're Here to Help
                </h3>
                <p style="margin: 0 0 8px 0; font-size: 15px; color: rgba(255, 255, 255, 0.8);">
                  📧 Email: <a href="mailto:sensei30002003@gmail.com" style="color: #dc2626; text-decoration: none;">sensei30002003@gmail.com</a>
                </p>
                <p style="margin: 0; font-size: 15px; color: rgba(255, 255, 255, 0.8);">
                  🌐 Website: <a href="https://flowsites.manus.space" style="color: #dc2626; text-decoration: none;">flowsites.manus.space</a>
                </p>
              </div>
              
              <p style="margin: 24px 0 0 0; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                Looking forward to working with you!
              </p>
              
              <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                The FlowSites Team
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.5); line-height: 1.6;">
                © ${new Date().getFullYear()} FlowSites. All rights reserved.<br>
                DojoFlow Certified Integration Partner
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send confirmation email after wizard submission
 */
export async function sendWizardConfirmationEmail(data: {
  email: string;
  businessName: string;
  contactName?: string;
}): Promise<boolean> {
  const html = generateWizardConfirmationEmail({
    businessName: data.businessName,
    contactName: data.contactName,
  });

  return await sendEmail({
    to: data.email,
    subject: `Thank You for Your Inquiry - ${data.businessName}`,
    html,
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

/** Generate the secure invoice email sent when an admin creates a customer account. */
export function generateInvoiceEmail(data: {
  businessName: string;
  contactName: string;
  invoiceNumber: string;
  amountCents: number;
  dueDate: string;
  invoiceUrl: string;
  isRecurring: boolean;
}): string {
  const amount = `$${(data.amountCents / 100).toFixed(2)}`;
  const recurringCopy = data.isRecurring
    ? "This is a monthly recurring invoice. Standard monthly payments will be set up as recurring billing during secure checkout."
    : "This invoice is a one-time charge.";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FlowSites invoice ${escapeHtml(data.invoiceNumber)}</title></head>
<body style="margin:0;background:#f5f8fc;color:#14213f;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:36px 16px;background:#f5f8fc;"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
      <tr><td style="padding:28px 32px;background:#0f2747;color:#fff;"><div style="font-size:23px;font-weight:800;letter-spacing:-.04em;">FLOW SITES</div><div style="margin-top:6px;color:#cfe1f7;font-size:13px;">Secure billing and client services</div></td></tr>
      <tr><td style="padding:34px 32px;"><p style="margin:0 0 8px;font-size:15px;color:#64748b;">Hello ${escapeHtml(data.contactName || "there")},</p><h1 style="margin:0;font-size:28px;letter-spacing:-.03em;color:#14213f;">Your FlowSites invoice is ready</h1><p style="margin:16px 0 0;font-size:15px;line-height:1.65;color:#475569;">An invoice has been created for <strong>${escapeHtml(data.businessName)}</strong>.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0;border:1px solid #dbe5f0;border-radius:14px;"><tr><td style="padding:18px 20px;color:#64748b;font-size:13px;">Invoice</td><td align="right" style="padding:18px 20px;font-weight:700;color:#14213f;">${escapeHtml(data.invoiceNumber)}</td></tr><tr><td style="padding:0 20px 18px;color:#64748b;font-size:13px;">Amount due</td><td align="right" style="padding:0 20px 18px;font-size:24px;font-weight:800;color:#1269e8;">${amount}</td></tr><tr><td style="padding:0 20px 18px;color:#64748b;font-size:13px;">Due date</td><td align="right" style="padding:0 20px 18px;font-weight:700;color:#14213f;">${escapeHtml(data.dueDate)}</td></tr></table>
        <p style="margin:0 0 22px;padding:14px 16px;border-radius:10px;background:#eff6ff;color:#1e3a5f;font-size:13px;line-height:1.55;">${recurringCopy}</p>
        <a href="${escapeHtml(data.invoiceUrl)}" style="display:inline-block;padding:13px 20px;border-radius:10px;background:#1269e8;color:#fff;text-decoration:none;font-weight:700;font-size:14px;">View and pay invoice</a>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#64748b;">Payments are processed securely by Stripe. The final payment and recurring terms, when applicable, are displayed before approval.</p>
      </td></tr>
      <tr><td style="padding:20px 32px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;">FlowSites · flow-sites.com · This message was sent because a customer account was created for your business.</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export async function sendInvoiceEmail(data: Parameters<typeof generateInvoiceEmail>[0] & { to: string }): Promise<boolean> {
  return sendEmail({
    to: data.to,
    subject: `FlowSites invoice ${data.invoiceNumber} for ${data.businessName}`,
    html: generateInvoiceEmail(data),
  });
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatDateDisplay(dateStr: string): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildBookingConfirmationHtml(data: {
  guestName: string;
  date: string;
  startTime: string;
  endTime: string;
  confirmationCode: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed – FlowSites</title>
</head>
<body style="margin:0;padding:0;background:#0b0b0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:0 0 32px 0;text-align:center;">
              <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663031545745/urOWhqfyIrKAoifg.png" alt="FlowSites" width="160" style="display:block;margin:0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="background:linear-gradient(135deg,#1a0a0a 0%,#0f0f1a 100%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <div style="width:64px;height:64px;background:linear-gradient(135deg,#c0392b,#922b21);border-radius:50%;text-align:center;line-height:64px;font-size:28px;display:inline-block;">&#10003;</div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">You're Booked!</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:16px;color:rgba(255,255,255,0.55);">Hi ${data.guestName}, your strategy call with FlowSites is confirmed.</p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.06);">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.35);">Date</p>
                          <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff;">${data.date}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.35);">Time</p>
                          <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff;">${data.startTime} &ndash; ${data.endTime}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:16px;">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.35);">Confirmation Code</p>
                          <p style="margin:0;font-size:22px;font-weight:700;color:#e74c3c;letter-spacing:3px;font-family:monospace;">${data.confirmationCode}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <h2 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#ffffff;">What to Expect</h2>
                    <p style="margin:0 0 8px;font-size:14px;color:rgba(255,255,255,0.65);">&#127919; We'll review your current online presence and goals</p>
                    <p style="margin:0 0 8px;font-size:14px;color:rgba(255,255,255,0.65);">&#9889; Discuss how a DojoFlow-integrated website can grow your enrollment</p>
                    <p style="margin:0 0 8px;font-size:14px;color:rgba(255,255,255,0.65);">&#128203; Walk through a custom strategy tailored to your business</p>
                    <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.65);">&#128640; No pressure &mdash; just a focused, value-packed conversation</p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 16px;font-size:13px;color:rgba(255,255,255,0.4);">Our team will reach out shortly with a meeting link.</p>
                    <a href="https://flow-sites.com/portfolio" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#c0392b,#922b21);color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">View Our Portfolio &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 0 0;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.25);">FlowSites &middot; Premium Web Agency &amp; DojoFlow Integration Specialist</p>
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);"><a href="https://flow-sites.com" style="color:rgba(255,255,255,0.35);text-decoration:none;">flow-sites.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Send a booking confirmation email to the guest.
 * Non-blocking — returns true on success, false on failure.
 */
export async function sendBookingConfirmationEmail(booking: {
  guestName: string;
  guestEmail: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;   // HH:MM
  endTime: string;     // HH:MM
  confirmationCode: string;
}): Promise<boolean> {
  const html = buildBookingConfirmationHtml({
    guestName: booking.guestName,
    date: formatDateDisplay(booking.bookingDate),
    startTime: formatTime(booking.startTime),
    endTime: formatTime(booking.endTime),
    confirmationCode: booking.confirmationCode,
  });

  return sendEmail({
    to: booking.guestEmail,
    subject: `✅ Confirmed: Your Strategy Call with FlowSites — ${formatDateDisplay(booking.bookingDate)}`,
    html,
  });
}

/**
 * Send a budget quote summary email to the prospect after they complete the wizard
 */
export async function sendBudgetQuoteEmail(data: {
  prospectName: string;
  prospectEmail: string;
  industry: string;
  basePackage: string;
  buildCostMin: number;
  buildCostMax: number;
  subscriptionTier: string;
  monthlyPrice: number;
  paymentPlan: string;
}): Promise<boolean> {
  const buildRange = data.buildCostMin === data.buildCostMax
    ? `$${data.buildCostMin.toLocaleString()}`
    : `$${data.buildCostMin.toLocaleString()} – $${data.buildCostMax.toLocaleString()}`;

  const paymentLabel = data.paymentPlan === "full"
    ? "Pay in Full"
    : data.paymentPlan === "6mo"
    ? "6-Month Payment Plan"
    : "12-Month Payment Plan";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Website Budget Estimate – FlowSites</title>
</head>
<body style="margin:0;padding:0;background:#0b0b0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:0 0 32px 0;text-align:center;">
              <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663031545745/urOWhqfyIrKAoifg.png" alt="FlowSites" width="160" style="display:block;margin:0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="background:linear-gradient(135deg,#1a0a0a 0%,#0f0f1a 100%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px;">
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#ffffff;">Your Website Budget Estimate</h1>
              <p style="margin:0 0 32px;font-size:15px;color:rgba(255,255,255,0.55);">Hi ${data.prospectName}, here's a summary of your custom quote from FlowSites.</p>

              <!-- Build Cost -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,200,50,0.07);border:1px solid rgba(255,200,50,0.2);border-radius:12px;margin-bottom:16px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.4);">One-Time Build Cost</p>
                    <p style="margin:0;font-size:28px;font-weight:700;color:#f0c040;">${buildRange}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.4);">Payment: ${paymentLabel}</p>
                  </td>
                </tr>
              </table>

              <!-- Monthly Plan -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(220,38,38,0.07);border:1px solid rgba(220,38,38,0.2);border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.4);">${data.subscriptionTier} Monthly Plan</p>
                    <p style="margin:0;font-size:28px;font-weight:700;color:#e74c3c;">$${data.monthlyPrice}<span style="font-size:16px;font-weight:400;color:rgba(255,255,255,0.4);">/mo</span></p>
                    <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.4);">Hosting, support, maintenance & platform upkeep</p>
                  </td>
                </tr>
              </table>

              <!-- Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;">Quote Details</p>
                    <p style="margin:0 0 6px;font-size:14px;color:rgba(255,255,255,0.75);">&#127775; Industry: <strong style="color:#fff;">${data.industry}</strong></p>
                    <p style="margin:0 0 6px;font-size:14px;color:rgba(255,255,255,0.75);">&#128230; Package: <strong style="color:#fff;">${data.basePackage}</strong></p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7;">
                This is an estimate based on your selections. Final pricing is confirmed during your free discovery call where we'll review your goals and customize the perfect plan for your business.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://flow-sites.com/book-a-call" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#c0392b,#922b21);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;border-radius:10px;">Book Your Free Discovery Call</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);">© ${new Date().getFullYear()} FlowSites. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return await sendEmail({
    to: data.prospectEmail,
    subject: `Your FlowSites Budget Estimate: ${buildRange} build + $${data.monthlyPrice}/mo`,
    html,
  });
}

/**
 * Send a welcome email to a client when a new project is created for them.
 * Called automatically by the adminProjects.create procedure.
 */
export async function sendProjectWelcomeEmail(data: {
  clientName: string;
  clientEmail: string;
  businessName: string;
  packageName?: string;
  monthlyPrice?: number;
  portalUrl: string;
}): Promise<boolean> {
  const monthlyLine = data.monthlyPrice
    ? `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.75);">
         Your monthly plan: <strong style="color:#ffffff;">$${data.monthlyPrice.toFixed(2)}/mo</strong>
         ${data.packageName ? ` — <em>${data.packageName}</em>` : ""}
       </p>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to FlowSites</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#0a0a0f;color:#ffffff;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;background:linear-gradient(135deg,rgba(20,20,30,0.95) 0%,rgba(15,15,25,0.98) 100%);border-radius:16px;border:1px solid rgba(255,255,255,0.1);box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <!-- Logo -->
          <tr>
            <td style="padding:40px 40px 20px 40px;text-align:center;">
              <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663031545745/urOWhqfyIrKAoifg.png" alt="FlowSites" style="height:56px;width:auto;">
            </td>
          </tr>
          <!-- Headline -->
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <h1 style="margin:0 0 16px 0;font-size:28px;font-weight:700;color:#ffffff;line-height:1.2;">
                Welcome to FlowSites, ${data.clientName}! 🎉
              </h1>
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.75);">
                Your project for <strong style="color:#ffffff;">${data.businessName}</strong> has been created and our team is ready to get started.
              </p>
              ${monthlyLine}
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.75);">
                You can track your project progress, review designs, request changes, and communicate with your team through your dedicated Client Portal.
              </p>
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${data.portalUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#c0392b,#922b21);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;border-radius:10px;">
                      Access Your Client Portal
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- What to expect -->
          <tr>
            <td style="padding:0 40px 32px 40px;">
              <table role="presentation" style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px 0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.4);">What Happens Next</p>
                    <p style="margin:0 0 8px 0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.7);">✅ &nbsp;Your dedicated project manager will reach out within 1 business day.</p>
                    <p style="margin:0 0 8px 0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.7);">✅ &nbsp;We'll schedule a kickoff call to review your goals and brand assets.</p>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.7);">✅ &nbsp;Your first design mockup will be ready within 5–7 business days.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 32px 40px;border-top:1px solid rgba(255,255,255,0.08);">
              <p style="margin:16px 0 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.35);">
                Questions? Reply to this email or call us at <a href="tel:+12818189288" style="color:#dc2626;text-decoration:none;">(281) 818-9288</a>.<br>
                &copy; ${new Date().getFullYear()} FlowSites Agency &bull; <a href="https://flow-sites.com" style="color:#dc2626;text-decoration:none;">flow-sites.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendEmail({
    to: data.clientEmail,
    subject: `Welcome to FlowSites — Your Project is Live, ${data.clientName}!`,
    html,
  });
}
