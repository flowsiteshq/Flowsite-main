import { config } from 'dotenv';
config();
import Stripe from 'stripe';
import { Resend } from 'resend';

const LIVE_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(LIVE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

const CLIENT_EMAIL = 'jkhorygibson1992@gmail.com';
const CLIENT_NAME = 'SeriousPro Agency';
const CLIENT_PHONE = '4092950715';
const CLIENT_ADDRESS = '2905 Somerset Ave, Texas City, TX 77590';
const WEBSITE = 'www.seriouspro.agency';
const DOMAIN_AMOUNT = 3400;   // $34.00 one-time
const MONTHLY_AMOUNT = 4900;  // $49.00/mo recurring

try {
  console.log('Step 1: Find or create Stripe customer...');
  let customer;
  const existing = await stripe.customers.list({ email: CLIENT_EMAIL, limit: 1 });
  if (existing.data.length > 0) {
    customer = existing.data[0];
    console.log('Found existing customer:', customer.id);
  } else {
    customer = await stripe.customers.create({
      email: CLIENT_EMAIL,
      name: CLIENT_NAME,
      phone: CLIENT_PHONE,
      address: {
        line1: '2905 Somerset Ave',
        city: 'Texas City',
        state: 'TX',
        postal_code: '77590',
        country: 'US',
      },
      metadata: { website: WEBSITE },
    });
    console.log('Created customer:', customer.id);
  }

  console.log('Step 2: Create recurring $49/mo price...');
  const monthlyPrice = await stripe.prices.create({
    unit_amount: MONTHLY_AMOUNT,
    currency: 'usd',
    recurring: { interval: 'month' },
    product_data: { name: `FlowSites Monthly Website Management - ${WEBSITE}` },
  });
  console.log('Monthly price created:', monthlyPrice.id);

  console.log('Step 3: Create Stripe Checkout Session (subscription + one-time domain fee)...');
  // Use subscription mode — add the $34 domain fee as an invoice item (charged on first invoice)
  await stripe.invoiceItems.create({
    customer: customer.id,
    amount: DOMAIN_AMOUNT,
    currency: 'usd',
    description: `Domain Registration - ${WEBSITE} (one-time)`,
  });
  console.log('Domain invoice item added');

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: 'subscription',
    line_items: [
      {
        price: monthlyPrice.id,
        quantity: 1,
      },
    ],
    // The invoice item above will be included on the first subscription invoice automatically
    subscription_data: {
      metadata: {
        client_name: CLIENT_NAME,
        client_email: CLIENT_EMAIL,
        website: WEBSITE,
      },
    },
    payment_method_types: ['card'],
    success_url: `https://flow-sites.com/client-portal?payment=success`,
    cancel_url: `https://flow-sites.com/client-portal`,
    customer_update: { address: 'auto', name: 'auto' },
    metadata: {
      client_name: CLIENT_NAME,
      client_email: CLIENT_EMAIL,
      website: WEBSITE,
    },
  });

  console.log('Checkout session created:', session.id);
  console.log('Payment URL:', session.url);

  console.log('Step 4: Send invoice email to client...');
  const emailResult = await resend.emails.send({
    from: process.env.EMAIL_FROM_ADDRESS || 'billing@flow-sites.com',
    to: CLIENT_EMAIL,
    subject: `Your FlowSites Invoice — ${WEBSITE}`,
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
  .greeting { font-size: 16px; color: #333; margin-bottom: 24px; }
  .invoice-box { background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
  .invoice-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; font-size: 15px; color: #333; }
  .invoice-row:last-child { border-bottom: none; font-weight: 700; font-size: 16px; }
  .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; margin-left: 8px; }
  .badge-blue { background: #e3f2fd; color: #1565c0; }
  .cta { text-align: center; margin: 28px 0; }
  .cta a { background: #e63946; color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; }
  .footer { background: #f9f9f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>FlowSites</h1>
      <p>Invoice for ${WEBSITE}</p>
    </div>
    <div class="body">
      <p class="greeting">Hi there,</p>
      <p style="color:#555;font-size:15px;">Thank you for choosing FlowSites! Here's your invoice summary. Click the button below to pay securely with your card.</p>
      
      <div class="invoice-box">
        <div class="invoice-row">
          <span>Domain Registration — ${WEBSITE} <span class="badge badge-blue">One-Time</span></span>
          <span>$34.00</span>
        </div>
        <div class="invoice-row">
          <span>Monthly Website Management <span class="badge">Recurring</span></span>
          <span>$49.00/mo</span>
        </div>
        <div class="invoice-row">
          <span>Due Today</span>
          <span>$83.00</span>
        </div>
      </div>

      <p style="color:#555;font-size:14px;background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:12px;">
        <strong>📅 Auto-billing:</strong> After today's payment, your card will be charged <strong>$49.00 automatically every month</strong>. No action needed — we handle it for you.
      </p>

      <div class="cta">
        <a href="${session.url}">Pay Now — $83.00</a>
      </div>

      <p style="color:#999;font-size:13px;text-align:center;">Questions? Reply to this email or call us at <strong>(281) 503-8903</strong></p>
    </div>
    <div class="footer">
      FlowSites | 2905 Somerset Ave, Texas City, TX 77590<br>
      © 2026 FlowSites. All rights reserved.
    </div>
  </div>
</body>
</html>
    `,
  });

  console.log('Email sent:', emailResult);
  console.log('\n✅ DONE');
  console.log('Customer ID:', customer.id);
  console.log('Checkout URL:', session.url);
  console.log('Email to:', CLIENT_EMAIL);

} catch (err) {
  console.error('Error:', err.message);
  if (err.raw) console.error('Stripe error:', err.raw);
}
