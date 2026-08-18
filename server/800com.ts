/**
 * 800.com API Helper
 * Provides SMS sending and conversation retrieval via the 800.com REST API.
 * API docs: https://api.800.com/docs
 *
 * Key endpoints:
 *  - POST /message                                            → send SMS/MMS
 *  - GET  /companies/{company}/conversations                  → list conversations
 *  - GET  /companies/{company}/conversations/{id}/items       → list conversation items
 *  - GET  /companies/{company}/numbers                        → list numbers (used for key verification)
 *
 * Company ID: 334319 (Mydojo Marketing)
 */

import { ENV } from "./_core/env";

const BASE_URL = "https://api.800.com";
/** 800.com company ID for Mydojo Marketing */
const COMPANY_ID = "334319";

function getHeaders() {
  return {
    Authorization: `Bearer ${ENV.eightHundredApiKey}`,
    "Content-Type": "application/json;charset=UTF-8",
    Accept: "application/json",
  };
}

/** Normalize a phone number to E.164 format (+1XXXXXXXXXX for US numbers) */
export function toE164(phone: string): string {
  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, "");
  // If 10 digits, prepend +1 (US)
  if (digits.length === 10) return `+1${digits}`;
  // If 11 digits starting with 1, prepend +
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  // Already has country code or international
  if (digits.length > 11) return `+${digits}`;
  return `+${digits}`;
}

export interface SendSmsParams {
  recipient: string; // phone number of the lead/customer
  message: string;
  mediaUrl?: string; // optional MMS attachment URL
}

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/** Send an SMS (or MMS) message via 800.com */
export async function sendSms(params: SendSmsParams): Promise<SendSmsResult> {
  const sender = ENV.eightHundredSenderNumber;
  if (!sender) {
    return { success: false, error: "800.com sender number not configured" };
  }
  if (!ENV.eightHundredApiKey) {
    return { success: false, error: "800.com API key not configured" };
  }

  const body: Record<string, unknown> = {
    sender: toE164(sender),
    recipient: toE164(params.recipient),
    message: params.message,
  };
  if (params.mediaUrl) {
    body.url = params.mediaUrl;
  }

  const res = await fetch(`${BASE_URL}/message`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      success: false,
      error: `800.com API error ${res.status}: ${text}`,
    };
  }

  const json = await res.json().catch(() => ({})) as { data?: { id?: string | number } };
  return { success: true, messageId: String(json.data?.id ?? "") };
}

export interface Conversation {
  id: string | number;
  recipient: string;
  numUnreadItems: number;
  lastActivityAt: string;
  isArchived: boolean;
  latestItem?: {
    type: string;
    details?: {
      type?: string;
      body?: string;
    };
    createdAt?: string;
  };
  number?: {
    id: number;
    number: string;
    label: string | null;
    isSmsEnabled: boolean;
  };
}

export interface ConversationItem {
  id: string | number;
  type: string;
  isInbound: boolean;
  createdAt: string;
  details?: {
    id?: number;
    type?: string;
    body?: string;
    recordingUrl?: string | null;
    status?: number;
    result?: number;
    transcription?: unknown;
  };
  user?: {
    id: number;
    name: string;
  } | null;
}

/** List conversations from 800.com Inbox */
export async function getConversations(opts?: {
  contactNumber?: string;
  perPage?: number;
  cursor?: string;
}): Promise<Conversation[]> {
  if (!ENV.eightHundredApiKey) return [];

  const url = new URL(`${BASE_URL}/companies/${COMPANY_ID}/conversations`);
  url.searchParams.set("per_page", String(opts?.perPage ?? 50));
  if (opts?.cursor) url.searchParams.set("cursor", opts.cursor);
  if (opts?.contactNumber) {
    url.searchParams.set("search", toE164(opts.contactNumber));
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(),
  });

  if (!res.ok) return [];

  const json = await res.json() as { data?: Conversation[] };
  return json.data ?? [];
}

/** Get items (messages, calls, voicemails) for a specific conversation */
export async function getConversationItems(
  conversationId: string | number,
  perPage = 100
): Promise<ConversationItem[]> {
  if (!ENV.eightHundredApiKey) return [];

  const url = new URL(
    `${BASE_URL}/companies/${COMPANY_ID}/conversations/${conversationId}/items`
  );
  url.searchParams.set("per_page", String(perPage));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(),
  });

  if (!res.ok) return [];

  const json = await res.json() as { data?: ConversationItem[] };
  return json.data ?? [];
}

/**
 * @deprecated Use getConversationItems instead
 * Kept for backward compatibility with existing code
 */
export async function getConversationMessages(
  conversationId: string
): Promise<ConversationItem[]> {
  return getConversationItems(conversationId);
}

/**
 * @deprecated Use getConversations instead
 * Kept for backward compatibility with existing code
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export { getConversations as getConversationsLegacy };

/** Verify the 800.com API key is valid by fetching account numbers */
export async function verifyApiKey(): Promise<{ valid: boolean; error?: string; companyId?: string }> {
  if (!ENV.eightHundredApiKey) {
    return { valid: false, error: "API key not set" };
  }

  const res = await fetch(`${BASE_URL}/companies/${COMPANY_ID}/numbers?per_page=1`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (res.status === 401) return { valid: false, error: "Invalid API key" };
  if (!res.ok) return { valid: false, error: `HTTP ${res.status}` };
  return { valid: true, companyId: COMPANY_ID };
}
