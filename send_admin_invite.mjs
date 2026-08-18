import "dotenv/config";
import { createRequire } from "module";
import { randomUUID } from "crypto";
import mysql from "mysql2/promise";
import { Resend } from "resend";

const db = await mysql.createConnection(process.env.DATABASE_URL);

const name = "Chris Pamugo";
const email = "chrismpamugo99@gmail.com";
const role = "admin";
const commissionRate = 15;

// Check if already exists
const [existing] = await db.execute(
  "SELECT id FROM technicians WHERE email = ? LIMIT 1",
  [email]
);

let technicianId;

if (existing.length > 0) {
  technicianId = existing[0].id;
  console.log(`Technician already exists with id ${technicianId}, updating role to admin...`);
  await db.execute(
    "UPDATE technicians SET role = 'admin', status = 'invited' WHERE id = ?",
    [technicianId]
  );
} else {
  // Insert new technician
  const [result] = await db.execute(
    "INSERT INTO technicians (name, email, commissionRate, role, status) VALUES (?, ?, ?, ?, 'invited')",
    [name, email, commissionRate, role]
  );
  technicianId = result.insertId;
  console.log(`Created new technician with id ${technicianId}`);
}

// Create invite token (expires in 30 days)
const token = randomUUID();
const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

await db.execute(
  "INSERT INTO technician_invites (technicianId, token, email, expiresAt) VALUES (?, ?, ?, ?)",
  [technicianId, token, email, expiresAt]
);

console.log(`Invite token created: ${token}`);

// Send invite email
const resend = new Resend(process.env.RESEND_API_KEY);
const inviteUrl = `https://flow-sites.com/accept-tech-invite?token=${token}`;

const result = await resend.emails.send({
  from: "FlowSites <noreply@flow-sites.com>",
  to: email,
  subject: "You've been invited to FlowSites Admin Panel",
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #fff; border-radius: 12px;">
      <h2 style="color: #fff; margin-bottom: 8px;">Welcome to FlowSites, ${name}!</h2>
      <p style="color: #aaa; line-height: 1.6;">
        You've been invited to join the FlowSites team as an <strong style="color: #dc2626;">Admin</strong>.
        You'll have full access to the FlowSites admin panel, including leads, clients, invoices, and team management.
      </p>
      <p style="color: #aaa; line-height: 1.6;">Click the button below to accept your invite and set up your account:</p>
      <a href="${inviteUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
        Accept Admin Invite
      </a>
      <p style="color: #666; font-size: 13px; margin-top: 24px;">
        This invite link expires in 30 days. Once accepted, you'll have full admin access to the FlowSites dashboard.
      </p>
      <hr style="border-color: #333; margin: 24px 0;" />
      <p style="color: #666; font-size: 12px;">FlowSites | flow-sites.com</p>
    </div>
  `,
});

if (result.error) {
  console.error("❌ Failed to send email:", result.error.message);
} else {
  console.log(`✅ Admin invite email sent successfully to ${email}`);
  console.log(`   Invite URL: ${inviteUrl}`);
}

await db.end();
