const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const token = 'bc022792-36c5-4c71-b11c-44c2c5f4f8fc';
const inviteUrl = `https://flow-sites.com/accept-tech-invite?token=${token}`;
const recipientName = 'Vincent';
const recipientEmail = 'sensei30002003@gmail.com';
const commissionRate = 15;

resend.emails.send({
  from: process.env.EMAIL_FROM_ADDRESS || 'FlowSites <onboarding@resend.dev>',
  to: recipientEmail,
  subject: "You've been invited to FlowSites CRM",
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff;">
      <div style="margin-bottom: 24px;">
        <img src="https://flow-sites.com/manus-storage/flowsites-logo-footer_c345a671.png" alt="FlowSites" style="height: 36px;" />
      </div>
      <h2 style="color: #111; margin-bottom: 8px; font-size: 24px;">Welcome to FlowSites, ${recipientName}!</h2>
      <p style="color: #555; line-height: 1.6; font-size: 15px;">
        You've been invited to join the FlowSites team as a sales representative.
        You'll earn a <strong>${commissionRate}% commission</strong> on the first payment of every client you bring in.
      </p>
      <p style="color: #555; line-height: 1.6; font-size: 15px;">
        Click the button below to accept your invite and set up your account:
      </p>
      <a href="${inviteUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; font-size: 15px;">
        Accept Invite &rarr;
      </a>
      <p style="color: #999; font-size: 13px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">
        This invite link expires in 7 days. If you have any questions, reply to this email or contact us at hello@flow-sites.com.
      </p>
      <p style="color: #bbb; font-size: 12px;">&copy; ${new Date().getFullYear()} FlowSites. All rights reserved.</p>
    </div>
  `,
}).then(result => {
  console.log('Result:', JSON.stringify(result, null, 2));
}).catch(err => {
  console.error('Error:', err.message);
});
