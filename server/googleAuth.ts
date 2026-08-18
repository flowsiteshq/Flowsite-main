/**
 * Google OAuth flow for team member (technician/rep) login.
 * Routes:
 *   GET /api/auth/google          → redirect to Google consent screen
 *   GET /api/auth/google/callback → handle Google callback, create/update user, set session cookie
 */

import { Router } from "express";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { users, technicians, technicianInvites } from "../drizzle/schema";
import { eq, isNull } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

function getRedirectUri(origin: string) {
  return `${origin}/api/auth/google/callback`;
}

export function createGoogleAuthRouter(): Router {
  const router = Router();

  // Step 1: Redirect to Google
  router.get("/auth/google", (req, res) => {
    const origin =
      (req.query.origin as string) ||
      (ENV.isProduction
        ? "https://flow-sites.com"
        : `http://localhost:${process.env.PORT || 3000}`);
    const inviteToken = (req.query.inviteToken as string) || "";
    const returnTo = (req.query.returnTo as string) || "/rep-dashboard";

    const state = Buffer.from(
      JSON.stringify({ origin, inviteToken, returnTo })
    ).toString("base64url");

    const params = new URLSearchParams({
      client_id: ENV.googleClientId,
      redirect_uri: getRedirectUri(origin),
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "select_account",
    });

    res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  });

  // Step 2: Handle callback from Google
  router.get("/auth/google/callback", async (req, res) => {
    const { code, state, error } = req.query as Record<string, string>;

    if (error) {
      return res.redirect(`/rep-login?error=${encodeURIComponent(error)}`);
    }

    let parsedState: { origin: string; inviteToken: string; returnTo: string };
    try {
      parsedState = JSON.parse(
        Buffer.from(state, "base64url").toString("utf-8")
      );
    } catch {
      return res.redirect("/rep-login?error=invalid_state");
    }

    const { origin, inviteToken, returnTo } = parsedState;

    try {
      // Exchange code for tokens
      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          redirect_uri: getRedirectUri(origin),
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        console.error("[Google OAuth] Token exchange failed:", err);
        return res.redirect("/rep-login?error=token_exchange_failed");
      }

      const tokenData = (await tokenRes.json()) as { access_token: string };

      // Get user info from Google
      const userInfoRes = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoRes.ok) {
        return res.redirect("/rep-login?error=userinfo_failed");
      }

      const googleUser = (await userInfoRes.json()) as {
        id: string;
        email: string;
        name: string;
        picture: string;
      };

      const db = await getDb();
      if (!db) {
        return res.redirect("/rep-login?error=db_unavailable");
      }

      // Use google_{id} as the openId to avoid collisions with Manus OAuth
      const googleOpenId = `google_${googleUser.id}`;

      // Find existing user by openId or email
      let [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.openId, googleOpenId))
        .limit(1);

      if (!existingUser) {
        // Try by email
        const [byEmail] = await db
          .select()
          .from(users)
          .where(eq(users.email, googleUser.email))
          .limit(1);

        if (byEmail) {
          // Update existing user with google openId
          await db
            .update(users)
            .set({
              openId: googleOpenId,
              name: googleUser.name,
              loginMethod: "google",
            })
            .where(eq(users.id, byEmail.id));
          const [updated] = await db
            .select()
            .from(users)
            .where(eq(users.id, byEmail.id))
            .limit(1);
          existingUser = updated;
        } else {
          // Create new user
          await db.insert(users).values({
            email: googleUser.email,
            name: googleUser.name,
            openId: googleOpenId,
            loginMethod: "google",
            role: "user",
          });
          const [newUser] = await db
            .select()
            .from(users)
            .where(eq(users.openId, googleOpenId))
            .limit(1);
          existingUser = newUser;
        }
      } else {
        // Update name if changed
        await db
          .update(users)
          .set({ name: googleUser.name })
          .where(eq(users.id, existingUser.id));
      }

      if (!existingUser) {
        return res.redirect("/rep-login?error=user_creation_failed");
      }

      // If there's an invite token, activate the technician account
      if (inviteToken) {
        const [invite] = await db
          .select()
          .from(technicianInvites)
          .where(eq(technicianInvites.token, inviteToken))
          .limit(1);

        // Invite is valid if it exists and hasn't been used (usedAt is null) and hasn't expired
        if (invite && !invite.usedAt && invite.expiresAt > new Date()) {
          await db
            .update(technicians)
            .set({ userId: existingUser.id, openId: existingUser.openId, status: "active" })
            .where(eq(technicians.id, invite.technicianId));

          await db
            .update(technicianInvites)
            .set({ usedAt: new Date() })
            .where(eq(technicianInvites.id, invite.id));
        }
      } else {
        // No invite token — auto-activate if this email matches an invited technician
        const [tech] = await db
          .select()
          .from(technicians)
          .where(eq(technicians.email, googleUser.email))
          .limit(1);

        if (tech) {
          if (tech.status === "invited") {
            await db
              .update(technicians)
              .set({ userId: existingUser.id, openId: existingUser.openId, status: "active" })
              .where(eq(technicians.id, tech.id));
          } else if (!tech.userId) {
            await db
              .update(technicians)
              .set({ userId: existingUser.id, openId: existingUser.openId })
              .where(eq(technicians.id, tech.id));
          }
        }
      }

      // Create session token using the same SDK used by Manus OAuth
      const sessionToken = await sdk.createSessionToken(existingUser.openId, {
        name: existingUser.name ?? "",
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // If user is admin, always redirect to admin dashboard regardless of returnTo
      const [freshUser] = await db.select().from(users).where(eq(users.id, existingUser.id)).limit(1);
      const effectiveReturnTo = freshUser?.role === "admin" ? "/flowsites-admin-dashboard" : returnTo;

      // Redirect to destination
      const destination = effectiveReturnTo.startsWith("/")
        ? `${origin}${effectiveReturnTo}`
        : effectiveReturnTo;
      return res.redirect(destination);
    } catch (err) {
      console.error("[Google OAuth] Error:", err);
      return res.redirect("/rep-login?error=server_error");
    }
  });

  return router;
}
