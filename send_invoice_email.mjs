import { Resend } from 'resend';
import * as dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const invoiceUrl = `https://flow-sites.com/invoice/7ba410755b7a11f188396283a8d82259`;

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #0f0f0f; padding: 32px 40px; text-align: center; }
    .header img { height: 48px; }
    .body { padding: 40px; }
    h2 { color: #111; margin-top: 0; }
    .invoice-box { background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 6px; padding: 24px; margin: 24px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .row:last-child { border-bottom: none; font-weight: bold; font-size: 16px; }
    .btn { display: inline-block; background: #e53e3e; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; margin-top: 24px; }
    .footer { padding: 24px 40px; text-align: center; color: #999; font-size: 12px; background: #fafafa; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://flow-sites.com/manus-storage/flowsites-logo-white-bg_43c53b6d.png" alt="FlowSites" />
    </div>
    <div class="body">
      <h2>Invoice for Stitched With Love</h2>
      <p>Hi Vincent,</p>
      <p>Here is a copy of the invoice created for <strong>Stitched With Love</strong> for their monthly website retainer.</p>
      <div class="invoice-box">
        <div class="row"><span>Invoice #</span><span>INV-SWL-2026-05</span></div>
        <div class="row"><span>Client</span><span>Stitched With Love</span></div>
        <div class="row"><span>Period</span><span>May 1 – May 31, 2026</span></div>
        <div class="row"><span>Due Date</span><span>June 1, 2026</span></div>
        <div class="row"><span>Monthly Website Retainer</span><span>$99.00</span></div>
        <div class="row"><span>Total Due</span><span>$99.00</span></div>
      </div>
      <a href="${invoiceUrl}" class="btn">View Invoice</a>
    </div>
    <div class="footer">
      FlowSites &bull; flow-sites.com &bull; 281-503-8903
    </div>
  </div>
</body>
</html>
`;

const result = await resend.emails.send({
  from: process.env.EMAIL_FROM_ADDRESS || 'FlowSites <billing@flow-sites.com>',
  to: 'vincent.holmes00@gmail.com',
  subject: 'Invoice INV-SWL-2026-05 – Stitched With Love ($99.00)',
  html,
});

console.log('Email result:', JSON.stringify(result, null, 2));
