// Direct DB script to invite marketers to FlowSites
// Run from sandbox: node /home/ubuntu/send-invites2.mjs

import { createConnection } from 'mysql2/promise';
import { randomUUID } from 'crypto';
import { Resend } from 'resend';

const DATABASE_URL = process.env.DATABASE_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM_ADDRESS || 'hello@flow-sites.com';

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// Marketers to invite (only those missing FlowSites invites)
const marketers = [
  { name: 'Eugenia Mark-Igbani', email: 'eugemail73@gmail.com' },
  { name: 'Alwell Ejiogu', email: 'ejiogualwell52@gmail.com' },
  { name: 'Ma. Angelika I. Abella', email: 'angelikaabella7@gmail.com' },
  { name: 'Michael Ogbuja', email: 'ogbujamichael01@gmail.com' },
];

async function main() {
  // Parse DATABASE_URL for mysql2
  const url = new URL(DATABASE_URL);
  const conn = await createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });

  console.log('Connected to database ✓');

  const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

  for (const m of marketers) {
    // Check if already exists
    const [existing] = await conn.execute(
      'SELECT id FROM technicians WHERE email = ? LIMIT 1',
      [m.email]
    );
    
    if (existing.length > 0) {
      console.log(`⚠ ${m.name} (${m.email}): Already exists in database`);
      continue;
    }

    // Insert technician record
    const [result] = await conn.execute(
      `INSERT INTO technicians (name, email, commissionRate, notes, role, status, invitedAt, createdAt, updatedAt) 
       VALUES (?, ?, 15, 'Marketer', 'sales_rep', 'invited', NOW(), NOW(), NOW())`,
      [m.name, m.email]
    );
    const technicianId = result.insertId;

    // Create invite token (7 days)
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await conn.execute(
      `INSERT INTO technician_invites (technicianId, token, email, expiresAt, createdAt) 
       VALUES (?, ?, ?, ?, NOW())`,
      [technicianId, token, m.email, expiresAt]
    );

    // Send invite email
    const inviteUrl = `https://flow-sites.com/accept-tech-invite?token=${token}`;
    if (resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: m.email,
          subject: "You've been invited to FlowSites CRM",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #dc2626;">Welcome to FlowSites!</h2>
              <p style="color: #333; line-height: 1.6;">Hi ${m.name},</p>
              <p style="color: #555; line-height: 1.6;">You've been invited to join the FlowSites team as a sales representative.</p>
              <p style="color: #555; line-height: 1.6;">Click the button below to accept your invite and set up your account:</p>
              <a href="${inviteUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
                Accept Invite
              </a>
              <p style="color: #999; font-size: 14px;">This invite link expires in 7 days.</p>
              <p style="color: #999; font-size: 14px;">If you have any questions, reply to this email.</p>
            </div>
          `,
        });
        console.log(`✓ ${m.name} (${m.email}): Invite sent! URL: ${inviteUrl}`);
      } catch (err) {
        console.log(`⚠ ${m.name} (${m.email}): DB record created but email failed: ${err.message}`);
        console.log(`  Invite URL: ${inviteUrl}`);
      }
    } else {
      console.log(`✓ ${m.name} (${m.email}): DB record created (no email - RESEND_API_KEY not set)`);
      console.log(`  Invite URL: ${inviteUrl}`);
    }
  }

  await conn.end();
  console.log('\nDone!');
}

main().catch(console.error);
