const { Resend } = require('resend');
const mysql = require('mysql2/promise');
const { randomUUID } = require('crypto');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM_ADDRESS || 'FlowSites <hello@flow-sites.com>';

// New team members from WhatsApp screenshots
const newMembers = [
  { name: 'Doris',   email: 'doriswotobo@gmail.com',            commissionRate: 15 },
  { name: 'Ihesie',  email: 'isaiahdesigns@outlook.com',        commissionRate: 15 },
  { name: 'Lynda',   email: 'sparkling2all2007@yahoo.com',       commissionRate: 15 },
  { name: 'Angelika',email: 'angelikaabella7@gmail.com',         commissionRate: 15 },
  { name: 'Ruth',    email: 'amarachiruthjiogu@gmail.com',       commissionRate: 15 },
];

async function main() {
  const db = await mysql.createConnection(process.env.DATABASE_URL);

  for (const member of newMembers) {
    // Check if already exists
    const [existing] = await db.execute(
      'SELECT id FROM technicians WHERE email = ? LIMIT 1',
      [member.email]
    );
    if (existing.length > 0) {
      console.log(`⚠️  SKIP   ${member.name} <${member.email}> — already exists (id=${existing[0].id})`);
      continue;
    }

    // Insert technician record
    const [result] = await db.execute(
      'INSERT INTO technicians (name, email, commissionRate, role, status, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
      [member.name, member.email, member.commissionRate, 'sales_rep', 'invited']
    );
    const techId = result.insertId;

    // Create invite token
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.execute(
      'INSERT INTO technician_invites (technicianId, token, email, expiresAt, createdAt) VALUES (?, ?, ?, ?, NOW())',
      [techId, token, member.email, expiresAt]
    );

    const inviteUrl = `https://flow-sites.com/accept-tech-invite?token=${token}`;

    // Send invite email
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: member.email,
      subject: "You've been invited to FlowSites CRM",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff;">
          <div style="margin-bottom: 24px;">
            <img src="https://manus-storage.s3.us-east-1.amazonaws.com/VvLvZnpjR27EmYwxaK3mTG/flowsites-logo-footer_c345a671.png" alt="FlowSites" style="height: 36px;" />
          </div>
          <h2 style="color: #111; margin-bottom: 8px; font-size: 24px;">Welcome to FlowSites, ${member.name}!</h2>
          <p style="color: #555; line-height: 1.6; font-size: 15px;">
            You've been invited to join the FlowSites team as a sales representative.
            You'll earn a <strong>${member.commissionRate}% commission</strong> on the first payment of every client you bring in.
          </p>
          <p style="color: #555; line-height: 1.6; font-size: 15px;">
            Click the button below to accept your invite and set up your account:
          </p>
          <a href="${inviteUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; font-size: 15px;">
            Accept Invite &rarr;
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">
            This invite link expires in 7 days. If you have any questions, contact us at hello@flow-sites.com.
          </p>
          <p style="color: #bbb; font-size: 12px;">&copy; ${new Date().getFullYear()} FlowSites. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.log(`❌ FAILED  ${member.name} <${member.email}>: ${error.message}`);
    } else {
      console.log(`✅ SENT    ${member.name} <${member.email}> (techId=${techId})`);
    }

    await new Promise(r => setTimeout(r, 300));
  }

  await db.end();
  console.log('\nDone!');
}

main().catch(console.error);
