/**
 * Retry script for the 7 emails that hit rate limits
 */
import { Resend } from "resend";
import * as dotenv from "dotenv";

dotenv.config({ path: "/home/ubuntu/flowsites-agency/.env" });

const resend = new Resend(process.env.RESEND_API_KEY);

const failedEmails = [
  { email: "info@grandrapidsboxing.com", businessName: "Grand Rapids Boxing" },
  { email: "info@tulsataekwondo.com", businessName: "Tulsa Taekwondo" },
  { email: "info@columbiakaratesc.com", businessName: "Columbia Karate SC" },
  { email: "info@buffalomartialarts.com", businessName: "Buffalo Martial Arts" },
  { email: "info@topsbbq.com", businessName: "Tops Bar-B-Q" },
  { email: "info@arcaderestaurant.com", businessName: "Arcade Restaurant" },
  { email: "info@rustrestaurant.com", businessName: "Rust Restaurant" },
];

function buildEmailHtml(businessName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Business Deserves a Website That Actually Works</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #0a0a0f; padding: 28px 40px; text-align: center; }
    .header-logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    .header-logo span { color: #e03030; }
    .hero { background: linear-gradient(135deg, #0a0a0f 0%, #1a0505 100%); padding: 48px 40px 40px; text-align: center; }
    .hero h1 { color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.3; margin: 0 0 16px; }
    .hero h1 span { color: #e03030; }
    .hero p { color: rgba(255,255,255,0.65); font-size: 16px; line-height: 1.6; margin: 0 0 28px; }
    .cta-btn { display: inline-block; background: #e03030; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-size: 16px; font-weight: 700; letter-spacing: 0.2px; }
    .body { padding: 40px; }
    .greeting { font-size: 16px; color: #374151; margin-bottom: 16px; line-height: 1.6; }
    .section-title { font-size: 18px; font-weight: 700; color: #111827; margin: 28px 0 16px; }
    .benefit { display: flex; align-items: flex-start; margin-bottom: 16px; }
    .benefit-icon { font-size: 20px; margin-right: 12px; flex-shrink: 0; margin-top: 2px; }
    .benefit-text strong { display: block; color: #111827; font-size: 15px; font-weight: 600; }
    .benefit-text span { color: #6b7280; font-size: 14px; line-height: 1.5; }
    .price-box { background: #fef2f2; border: 2px solid #fca5a5; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0; }
    .price-box p { margin: 0 0 8px; color: #374151; font-size: 15px; }
    .price-box .price { font-size: 32px; font-weight: 800; color: #e03030; }
    .cta-section { text-align: center; margin: 32px 0; }
    .cta-section a { display: inline-block; background: #e03030; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 17px; font-weight: 700; }
    .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 28px 40px; text-align: center; }
    .footer p { color: #9ca3af; font-size: 13px; margin: 4px 0; }
    .footer a { color: #6b7280; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><div class="header-logo">Flow<span>Sites</span></div></div>
    <div class="hero">
      <h1>Your Business Deserves a Website That <span>Actually Works</span></h1>
      <p>High-converting websites for service businesses — built to get you more customers, not just look good.</p>
      <a href="https://flow-sites.com/interested" class="cta-btn">Yes, I'm Interested →</a>
    </div>
    <div class="body">
      <p class="greeting">Hi ${businessName},</p>
      <p class="greeting">We noticed your business could be getting a lot more customers online — and we want to help.</p>
      <p class="greeting"><strong>FlowSites builds high-converting websites for service businesses like yours.</strong> We specialize in martial arts schools, fitness studios, restaurants, and local service businesses — and we do more than just make things look good.</p>
      <p class="section-title">Here's what sets us apart:</p>
      <div class="benefit"><div class="benefit-icon">✅</div><div class="benefit-text"><strong>Websites that convert</strong><span>Every page is engineered to turn visitors into customers, with strategic CTAs and proven layouts.</span></div></div>
      <div class="benefit"><div class="benefit-icon">✅</div><div class="benefit-text"><strong>CRM integration</strong><span>Your site connects directly to your CRM so every lead is captured and followed up automatically.</span></div></div>
      <div class="benefit"><div class="benefit-icon">✅</div><div class="benefit-text"><strong>Fast, mobile-first, SEO-ready</strong><span>Your site loads fast, looks great on phones, and gets found on Google.</span></div></div>
      <div class="benefit"><div class="benefit-icon">✅</div><div class="benefit-text"><strong>Done for you</strong><span>We handle everything. Design, development, integration, and launch.</span></div></div>
      <div class="price-box">
        <p>Get started for as little as</p>
        <div class="price">$499</div>
        <p style="margin-top:8px; font-size:14px; color:#6b7280;">No obligation. No pressure. Just results.</p>
      </div>
      <p class="greeting">If you're interested, just click the button below and fill out a quick form — we'll reach out personally within 24 hours.</p>
      <div class="cta-section"><a href="https://flow-sites.com/interested">Yes, I'm Interested →</a></div>
      <p class="greeting" style="margin-top:32px;">To your success,<br /><strong>The FlowSites Team</strong><br /><a href="tel:+12815038903" style="color:#e03030;">(281) 503-8903</a> · <a href="https://flow-sites.com" style="color:#e03030;">flow-sites.com</a></p>
    </div>
    <div class="footer">
      <p>© 2026 FlowSites. All rights reserved.</p>
      <p><a href="https://flow-sites.com">flow-sites.com</a> · <a href="tel:+12815038903">(281) 503-8903</a></p>
      <p style="margin-top:12px;">You're receiving this email because your business was identified as a great fit for our services.<br />To unsubscribe, reply with "unsubscribe."</p>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log(`Retrying ${failedEmails.length} failed emails with longer delays...`);
  let sent = 0;
  let failed = 0;

  for (const lead of failedEmails) {
    // Wait 1 second between each to stay well under rate limit
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const result = await resend.emails.send({
        from: "FlowSites <noreply@flow-sites.com>",
        to: lead.email,
        subject: "Your Business Deserves a Website That Actually Works — Starting at $499",
        html: buildEmailHtml(lead.businessName),
      });
      if (result.error) {
        failed++;
        console.log(`❌ Failed: ${lead.email} — ${result.error.message}`);
      } else {
        sent++;
        console.log(`✅ Sent: ${lead.email}`);
      }
    } catch (err) {
      failed++;
      console.log(`❌ Error: ${lead.email} — ${err.message}`);
    }
  }

  console.log(`\n=== RETRY COMPLETE ===`);
  console.log(`✅ Sent: ${sent}`);
  console.log(`❌ Failed: ${failed}`);
}

main().catch(console.error);
