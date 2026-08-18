/**
 * Set up Stitched With Love recurring billing in live Stripe
 * - $99/mo recurring subscription
 * - Send payment link to stitchwithris@gmail.com
 */

import { config } from 'dotenv';
config();
import Stripe from 'stripe';
import { Resend } from 'resend';

const LIVE_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(LIVE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

const CLIENT_EMAIL = 'stitchwithris@gmail.com';
const CLIENT_NAME = 'Stitched With Love';
const MONTHLY_AMOUNT = 9900; // $99.00/mo

try {
  console.log('Step 1: Find or create Stripe customer for Stitched With Love...');
  let customer;
  const existing = await stripe.customers.list({ email: CLIENT_EMAIL, limit: 1 });
  if (existing.data.length > 0) {
    customer = existing.data[0];
    console.log('Found existing customer:', customer.id);
  } else {
    customer = await stripe.customers.create({
      email: CLIENT_EMAIL,
      name: CLIENT_NAME,
      metadata: { source: 'flowsites-admin', client: 'Stitched With Love' },
    });
    console.log('Created customer:', customer.id);
  }

  console.log('Step 2: Create recurring $99/mo price...');
  const monthlyPrice = await stripe.prices.create({
    unit_amount: MONTHLY_AMOUNT,
    currency: 'usd',
    recurring: { interval: 'month' },
    product_data: {
      name: 'FlowSites Monthly Website Management - Stitched With Love',
    },
  });
  console.log('Monthly price created:', monthlyPrice.id);

  console.log('Step 3: Create Stripe Checkout Session for $99/mo subscription...');
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: 'subscription',
    line_items: [
      {
        price: monthlyPrice.id,
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        client_name: CLIENT_NAME,
        client_email: CLIENT_EMAIL,
      },
    },
    payment_method_types: ['card'],
    success_url: 'https://flow-sites.com/client-portal?payment=success',
    cancel_url: 'https://flow-sites.com/client-portal',
    metadata: {
      client_name: CLIENT_NAME,
      client_email: CLIENT_EMAIL,
    },
  });

  console.log('Checkout session created:', session.id);
  console.log('Payment URL:', session.url);

  console.log('Step 4: Send payment setup email to Stitched With Love...');
  const emailResult = await resend.emails.send({
    from: process.env.EMAIL_FROM_ADDRESS || 'billing@flow-sites.com',
    to: CLIENT_EMAIL,
    subject: 'Set Up Your Monthly Payment — Stitched With Love',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .header { background: #0f0f0f; padding: 32px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
  .header p { color: #999; margin: 8px 0 0; font-size: 14px; }
  .body { padding: 32px; }
  .invoice-box { background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
  .invoice-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; font-size: 15px; color: #333; }
  .invoice-row:last-child { border-bottom: none; font-weight: 700; font-size: 16px; }
  .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; margin-left: 8px; }
  .cta { text-align: center; margin: 28px 0; }
  .cta a { background: #e63946; color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; }
  .footer { background: #f9f9f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>FlowSites</h1>
      <p>Monthly Payment Setup — Stitched With Love</p>
    </div>
    <div class="body">
      <p style="color:#333;font-size:16px;">Hi there,</p>
      <p style="color:#555;font-size:15px;">To keep your website running smoothly, please set up your monthly payment below. This is a one-time setup — after that, your card will be charged automatically each month.</p>
      
      <div class="invoice-box">
        <div class="invoice-row">
          <span>Monthly Website Management <span class="badge">Recurring</span></span>
          <span>$99.00/mo</span>
        </div>
        <div class="invoice-row">
          <span>Due Today</span>
          <span>$99.00</span>
        </div>
      </div>

      <p style="color:#555;font-size:14px;background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:12px;">
        <strong>📅 Auto-billing:</strong> After today's payment, your card will be charged <strong>$99.00 automatically every month</strong>. No action needed — we handle it for you.
      </p>

      <div class="cta">
        <a href="${session.url}">Set Up Monthly Payment — $99/mo</a>
      </div>

      <p style="color:#999;font-size:13px;text-align:center;">Questions? Reply to this email or call us at <strong>(281) 503-8903</strong></p>
    </div>
    <div class="footer">
      FlowSites<br>
      © 2026 FlowSites. All rights reserved.
    </div>
  </div>
</body>
</html>
    `,
  });

  console.log('Email sent:', emailResult.data?.id);
  console.log('\n✅ DONE — Stitched With Love recurring billing set up');
  console.log('Customer ID:', customer.id);
  console.log('Checkout URL:', session.url);
  console.log('Email to:', CLIENT_EMAIL);

} catch (err) {
  console.error('Error:', err.message);
  if (err.raw) console.error('Stripe error:', JSON.stringify(err.raw));
}
