import { config } from 'dotenv';
config();

import Stripe from 'stripe';
import { Resend } from 'resend';

const LIVE_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(LIVE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

const STITCHED_EMAIL = 'stitchwithris@gmail.com';
const STITCHED_NAME = 'Stitched With Love';
const OWNER_EMAIL = 'sensei30002003@gmail.com';
const AMOUNT = 9900; // $99.00 in cents

try {
  // 1. Find or create Stripe customer for Stitched
  let customer;
  const existing = await stripe.customers.list({ email: STITCHED_EMAIL, limit: 1 });
  if (existing.data.length > 0) {
    customer = existing.data[0];
    console.log('Found existing customer:', customer.id);
  } else {
    customer = await stripe.customers.create({
      email: STITCHED_EMAIL,
      name: STITCHED_NAME,
    });
    console.log('Created new customer:', customer.id);
  }

  // 2. Create a recurring price ($99/month)
  const price = await stripe.prices.create({
    unit_amount: AMOUNT,
    currency: 'usd',
    recurring: { interval: 'month' },
    product_data: { name: 'FlowSites Monthly Website Management - $99/mo' },
  });
  console.log('Created price:', price.id);

  // 3. Create a payment link for the subscription
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    after_completion: { type: 'hosted_confirmation', hosted_confirmation: { custom_message: 'Thank you! Your monthly subscription is now active.' } },
    customer_creation: 'always',
    metadata: { client_name: STITCHED_NAME, client_email: STITCHED_EMAIL },
  });
  console.log('Payment link:', paymentLink.url);

  // 4. Send email to Stitched
  const emailToClient = await resend.emails.send({
    from: process.env.EMAIL_FROM_ADDRESS || 'FlowSites <noreply@flow-sites.com>',
    to: STITCHED_EMAIL,
    subject: 'FlowSites — Monthly Website Management ($99/mo)',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="https://private-us-east-1.manuscdn.com/sessionFile/579xV04TUt9Agk1PR0jUAG/sandbox/JGCqg0aLz0nNAjLYTB7KvN-img-0_1770430978000_na1fn_Zmxvd3NpdGVzLWxvZ28.png" alt="FlowSites" style="height: 48px; margin-bottom: 24px;" />
        <h2 style="color: #111; margin-bottom: 8px;">Your Monthly Website Management</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">Hi ${STITCHED_NAME},</p>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Please click the button below to set up your $99/month recurring subscription for FlowSites website management. Your card will be charged $99 today and automatically on the same date each month.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${paymentLink.url}" style="background-color: #e63946; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: bold; display: inline-block;">
            Pay $99/month →
          </a>
        </div>
        <p style="color: #888; font-size: 14px;">
          This is a secure Stripe payment link. You can cancel anytime by contacting us.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px;">FlowSites | flow-sites.com | 281-503-8903</p>
      </div>
    `,
  });
  console.log('Email to Stitched sent:', emailToClient.data?.id || emailToClient.error);

  // 5. Send copy to owner
  const emailToOwner = await resend.emails.send({
    from: process.env.EMAIL_FROM_ADDRESS || 'FlowSites <noreply@flow-sites.com>',
    to: OWNER_EMAIL,
    subject: `[Copy] Payment link sent to ${STITCHED_NAME} — $99/mo`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #111;">Payment Link Sent</h2>
        <p style="color: #555;">A $99/month recurring payment link was sent to <strong>${STITCHED_NAME}</strong> (${STITCHED_EMAIL}).</p>
        <p style="color: #555;"><strong>Payment Link:</strong> <a href="${paymentLink.url}">${paymentLink.url}</a></p>
        <p style="color: #555;"><strong>Stripe Customer ID:</strong> ${customer.id}</p>
        <p style="color: #555;"><strong>Amount:</strong> $99.00/month recurring</p>
      </div>
    `,
  });
  console.log('Copy email to owner sent:', emailToOwner.data?.id || emailToOwner.error);

  console.log('\n✅ Done!');
  console.log('Payment link:', paymentLink.url);
  console.log('Customer ID:', customer.id);

} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
