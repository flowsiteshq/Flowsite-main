import crypto from "crypto";
import type { Express, Request, Response } from "express";
import { ENV } from "./_core/env";
import {
  getAdminSession,
  getGoogleCalendarConnection,
  saveGoogleCalendarConnection,
  updateBookingCalendar,
} from "./db";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

function secretKey() {
  return crypto.createHash("sha256").update(ENV.cookieSecret || "flowsites-google-calendar").digest();
}

function encrypt(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decrypt(value: string) {
  const [ivPart, tagPart, dataPart] = value.split(".");
  if (!ivPart || !tagPart || !dataPart) throw new Error("Invalid Google Calendar token");
  const decipher = crypto.createDecipheriv("aes-256-gcm", secretKey(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(dataPart, "base64url")), decipher.final()]).toString("utf8");
}

function stateFor(origin: string, token: string) {
  const payload = Buffer.from(JSON.stringify({ origin, token, nonce: crypto.randomUUID() })).toString("base64url");
  const signature = crypto.createHmac("sha256", secretKey()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function parseState(value: string) {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) throw new Error("Invalid OAuth state");
  const expected = crypto.createHmac("sha256", secretKey()).update(payload).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error("Invalid OAuth state");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { origin: string; token: string };
}

function redirectUri(origin: string) {
  return `${origin}/api/admin/google-calendar/callback`;
}

async function exchangeRefreshToken(refreshToken: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: ENV.googleClientId, client_secret: ENV.googleClientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
  });
  if (!response.ok) throw new Error(`Google token refresh failed (${response.status})`);
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error("Google did not return an access token");
  return data.access_token;
}

async function googleRequest(path: string, init: RequestInit = {}) {
  const connection = await getGoogleCalendarConnection();
  if (!connection) throw new Error("Google Calendar is not connected");
  const accessToken = await exchangeRefreshToken(decrypt(connection.encryptedRefreshToken));
  const response = await fetch(`${GOOGLE_CALENDAR_API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, ...(init.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`Google Calendar request failed (${response.status})`);
  return response.json();
}

export function registerGoogleCalendarRoutes(app: Express) {
  app.get("/api/admin/google-calendar/connect", async (req: Request, res: Response) => {
    const adminToken = req.cookies?.admin_session as string | undefined;
    if (!adminToken || !(await getAdminSession(adminToken))) return res.status(401).send("Unauthorized");
    if (!ENV.googleClientId || !ENV.googleClientSecret) return res.status(503).send("Google OAuth is not configured");
    const origin = typeof req.query.origin === "string" ? req.query.origin : `${req.protocol}://${req.get("host")}`;
    const params = new URLSearchParams({ client_id: ENV.googleClientId, redirect_uri: redirectUri(origin), response_type: "code", access_type: "offline", prompt: "consent", scope: CALENDAR_SCOPE, state: stateFor(origin, adminToken) });
    return res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  });

  app.get("/api/admin/google-calendar/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : "";
    const oauthState = typeof req.query.state === "string" ? req.query.state : "";
    try {
      const { origin, token } = parseState(oauthState);
      if (!(await getAdminSession(token))) return res.status(401).send("Unauthorized");
      if (!code) return res.redirect(`${origin}/flowsites-admin-settings?googleCalendar=error`);
      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: ENV.googleClientId, client_secret: ENV.googleClientSecret, redirect_uri: redirectUri(origin), grant_type: "authorization_code" }) });
      if (!tokenResponse.ok) throw new Error("Google authorization failed");
      const tokenData = await tokenResponse.json() as { access_token?: string; refresh_token?: string };
      if (!tokenData.refresh_token) throw new Error("Google did not return a refresh token; reconnect and approve access");
      const userResponse = await fetch(GOOGLE_USERINFO_URL, { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
      const user = await userResponse.json() as { email?: string };
      await saveGoogleCalendarConnection({ accountEmail: user.email ?? ENV.googleCalendarAccountEmail, calendarId: "primary", encryptedRefreshToken: encrypt(tokenData.refresh_token), scopes: CALENDAR_SCOPE });
      return res.redirect(`${origin}/flowsites-admin-settings?googleCalendar=connected`);
    } catch (error) {
      console.error("[Google Calendar] OAuth callback failed:", error);
      const origin = `${req.protocol}://${req.get("host")}`;
      return res.redirect(`${origin}/flowsites-admin-settings?googleCalendar=error`);
    }
  });
}

export async function createGoogleCalendarEvent(booking: {
  id: number; guestName: string; guestEmail: string; businessName?: string | null; bookingDate: string; startTime: string; endTime: string; confirmationCode: string;
}) {
  const connection = await getGoogleCalendarConnection();
  if (!connection) {
    await updateBookingCalendar(booking.id, { calendarSyncStatus: "not_configured" });
    return null;
  }
  await updateBookingCalendar(booking.id, { calendarSyncStatus: "pending" });
  try {
    const event = await googleRequest(`/calendars/${encodeURIComponent(connection.calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`, {
      method: "POST",
      body: JSON.stringify({
        summary: `FlowSites Strategy Call — ${booking.guestName}`,
        description: `FlowSites discovery call\nBusiness: ${booking.businessName ?? "Not provided"}\nConfirmation: ${booking.confirmationCode}`,
        start: { dateTime: `${booking.bookingDate}T${booking.startTime}:00`, timeZone: "America/Chicago" },
        end: { dateTime: `${booking.bookingDate}T${booking.endTime}:00`, timeZone: "America/Chicago" },
        attendees: [{ email: booking.guestEmail, displayName: booking.guestName }],
        conferenceData: { createRequest: { requestId: `flowsites-${booking.id}-${crypto.randomUUID()}`, conferenceSolutionKey: { type: "hangoutsMeet" } } },
      }),
    }) as { id?: string; conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> } };
    const meetUrl = event.conferenceData?.entryPoints?.find(point => point.entryPointType === "video")?.uri ?? null;
    await updateBookingCalendar(booking.id, { calendarEventId: event.id ?? null, meetUrl, calendarSyncStatus: meetUrl ? "synced" : "pending" });
    return { eventId: event.id ?? null, meetUrl };
  } catch (error) {
    console.error("[Google Calendar] Event creation failed:", error);
    await updateBookingCalendar(booking.id, { calendarSyncStatus: "failed" });
    return null;
  }
}
