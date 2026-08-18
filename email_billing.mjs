import { Resend } from "resend";
import { readFileSync } from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: "/home/ubuntu/flowsites-agency/.env" });

const resend = new Resend(process.env.RESEND_API_KEY);

const attachment = readFileSync("/home/ubuntu/FlowSites_Billing.xlsx");

const result = await resend.emails.send({
  from: "FlowSites <noreply@flow-sites.com>",
  to: "chrismpamugo99@gmail.com",
  subject: "FlowSites — Monthly Billing Summary",
  html: `<p>Hi,</p>
<p>Please find attached the FlowSites monthly billing spreadsheet.</p>
<p>Total Monthly Recurring: <strong>$880/mo</strong></p>
<br/>
<p>The FlowSites Team<br/>
📞 (281) 503-8903<br/>
🌐 <a href="https://flow-sites.com">flow-sites.com</a></p>`,
  attachments: [
    {
      filename: "FlowSites_Billing.xlsx",
      content: attachment.toString("base64"),
    },
  ],
});

if (result.error) {
  console.error("Failed:", result.error.message);
} else {
  console.log("✅ Email sent successfully to chrismpamugo99@gmail.com");
}
