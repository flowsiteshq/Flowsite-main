import * as dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.EIGHT_HUNDRED_API_KEY;
const SENDER = process.env.EIGHT_HUNDRED_SENDER_NUMBER;
const BASE_URL = "https://api.800.com";

// Parse company ID from API key (format: companyId|token)
const [COMPANY_ID] = API_KEY.split("|");

function toE164(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

const payload = {
  sender: toE164(SENDER),
  recipient: toE164("2818189288"),
  message: "💰 FlowSites: Test — SMS notifications are working! You'll receive this whenever an invoice is paid.",
};

console.log("Sending SMS with payload:", payload);
console.log("Company ID:", COMPANY_ID);

const res = await fetch(`${BASE_URL}/message`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const text = await res.text();
console.log("Status:", res.status);
console.log("Response:", text);
