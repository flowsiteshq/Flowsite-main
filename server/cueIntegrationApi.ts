import crypto from "crypto";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import { CUE_LEAD_SCOPE, getCueLeads, logCueLeadRead, verifyCueApiKey } from "./cueIntegration";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.coerce.number().int().positive().optional(),
  status: z.enum(["new", "contacted", "in_progress", "proposal_sent", "won", "lost"]).optional(),
});

function bearerToken(req: Request): string | null {
  const header = req.header("authorization");
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function sendUnauthorized(res: Response) {
  res.status(401).json({
    error: {
      code: "invalid_api_key",
      message: "A valid Cue read-only API key is required.",
    },
  });
}

/**
 * REST surface intended for Cue's Custom API connector. It is deliberately
 * separate from the browser/tRPC admin API: it has only GET /leads and does
 * not receive a staff session or any write capability.
 */
export function registerCueIntegrationRoutes(app: Express) {
  app.get("/api/integrations/cue/leads", async (req, res) => {
    res.set({
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    });

    const rawKey = bearerToken(req);
    if (!rawKey) return sendUnauthorized(res);

    try {
      const key = await verifyCueApiKey(rawKey);
      if (!key || key.scope !== CUE_LEAD_SCOPE) return sendUnauthorized(res);

      const parsed = querySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          error: { code: "invalid_request", message: "limit, cursor, or status is invalid." },
        });
      }

      const result = await getCueLeads(parsed.data);
      const requestId = crypto.randomUUID();
      await logCueLeadRead({ keyId: key.id, resultCount: result.leads.length, requestId });

      return res.json({
        data: result.leads,
        page: {
          limit: parsed.data.limit,
          nextCursor: result.nextCursor,
        },
        access: {
          provider: "Cue",
          scope: CUE_LEAD_SCOPE,
          readOnly: true,
        },
        requestId,
      });
    } catch (error) {
      console.error("[Cue integration] Lead read failed:", error);
      return res.status(500).json({
        error: { code: "service_unavailable", message: "Cue lead access is temporarily unavailable." },
      });
    }
  });
}
