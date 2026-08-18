const { Resend } = require('resend');
const mysql = require('mysql2/promise');
const { randomUUID } = require('crypto');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM_ADDRESS || 'FlowSites <hello@flow-sites.com>';

const teamMembers = [
  { id: 30001,  name: 'Joseph',      email: 'chidi.ej@gmail.com',                  commissionRate: 15 },
  { id: 60001,  name: 'Godslove',    email: 'godslovealex66@gmail.com',             commissionRate: 15 },
  { id: 60003,  name: 'Jason',       email: 'jason.mervin2006@gmail.com',           commissionRate: 15 },
  { id: 60004,  name: 'Comfort',     email: 'comfortonwuchekwa365@gmail.com',       commissionRate: 15 },
  { id: 60005,  name: 'Merrilyn',    email: 'merryfromhome@gmail.com',              commissionRate: 15 },
  { id: 60006,  name: 'Eugenia',     email: 'eugeniaweb73@gmail.com',               commissionRate: 15 },
  { id: 60007,  name: 'Alwell',      email: 'ejiogualwell52@gmial.com',             commissionRate: 15 },
  { id: 90001,  name: 'Loyal',       email: 'chikezieloyal@gmail.com',              commissionRate: 15 },
  { id: 90002,  name: 'Christopher', email: 'okoloibechristopher@gmail.com',        commissionRate: 15 },
  { id: 90003,  name: 'Jerry',       email: 'emperorjerry8@gmail.com',              commissionRate: 15 },
  { id: 90004,  name: 'Faith',       email: 'meetchibuzorfj@gmail.com',             commissionRate: 15 },
  { id: 90005,  name: 'Samuel',      email: 'samyeshiet13@gmail.com',               commissionRate: 15 },
  { id: 120001, name: 'Onyinyechi',  email: 'onyinyechichukwunyere1@gmail.com',     commissionRate: 15 },
  { id: 120002, name: 'Fatai',       email: 'fataifaith529@gmail.com',              commissionRate: 15 },
  { id: 150001, name: 'Bethel',      email: 'georgebethel23@gmail.com',             commissionRate: 15 },
  { id: 180001, name: 'Favour',      email: 'favken531@gmail.com',                  commissionRate: 15 },
  { id: 210001, name: 'Vincent',     email: 'sensei30002003@gmail.com',             commissionRate: 15 },
];

async function main() {
  // Connect to DB
  const db = await mysql.createConnection(process.env.DATABASE_URL);

  const results = [];

  for (const member of teamMembers) {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Insert fresh invite token
    await db.execute(
      'INSERT INTO technician_invites (technicianId, token, email, expiresAt, createdAt) VALUES (?, ?, ?, ?, NOW())',
      [member.id, token, member.email, expiresAt]
    );

    const inviteUrl = `https://flow-sites.com/accept-tech-invite?token=${token}`;

    // Send email
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
      results.push({ name: member.name, email: member.email, status: 'failed', error: error.message });
    } else {
      console.log(`✅ SENT    ${member.name} <${member.email}>`);
      results.push({ name: member.name, email: member.email, status: 'sent', id: data.id });
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  await db.end();

  console.log('\n=== SUMMARY ===');
  const sent = results.filter(r => r.status === 'sent').length;
  const failed = results.filter(r => r.status === 'failed');
  console.log(`Sent: ${sent}/${results.length}`);
  if (failed.length > 0) {
    console.log('Failed:');
    failed.forEach(f => console.log(`  - ${f.name} <${f.email}>: ${f.error}`));
  }
}

main().catch(console.error);
