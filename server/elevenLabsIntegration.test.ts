import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import {
  createVoiceApiKey,
  hashVoiceApiKey,
  normalizeVoicePhone,
  safeVoiceSummary,
  VOICE_API_KEY_PREFIX,
  VOICE_LEAD_WRITE_SCOPE,
} from "./voiceIntegration";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("Cue telephone foundation", () => {
  it("creates a separate hash-only fs_voice_ credential with the narrow phone-lead scope", () => {
    const key = createVoiceApiKey();
    expect(key.rawKey.startsWith(VOICE_API_KEY_PREFIX)).toBe(true);
    expect(key.tokenHash).toHaveLength(64);
    expect(key.tokenHash).toBe(hashVoiceApiKey(key.rawKey));
    expect(key.rawKey).not.toContain(key.tokenHash);
    expect(VOICE_LEAD_WRITE_SCOPE).toBe("phone_leads:write");
  });

  it("normalizes valid call phone numbers and rejects too-short values", () => {
    expect(normalizeVoicePhone("(888) 933-3010")).toBe("+18889333010");
    expect(normalizeVoicePhone("+1 281 503 8903")).toBe("+12815038903");
    expect(() => normalizeVoicePhone("123")).toThrow("valid phone");
  });

  it("limits stored summaries and does not retain blank content", () => {
    expect(safeVoiceSummary("  clear   business  summary ")).toBe("clear business summary");
    expect(safeVoiceSummary("   ")).toBeNull();
    expect(safeVoiceSummary("x".repeat(2500))).toHaveLength(2000);
  });

  it("uses the current official ElevenLabs SDK event constructor", () => {
    const client = new ElevenLabsClient({ apiKey: "test-only" });
    expect(typeof client.webhooks.constructEvent).toBe("function");
  });

  it("keeps Cue read access separate and routes only raw-body signed ElevenLabs webhooks", () => {
    const cue = read("server/cueIntegration.ts");
    const server = read("server/_core/index.ts");
    const api = read("server/elevenLabsIntegrationApi.ts");
    const voice = read("server/voiceIntegration.ts");

    expect(cue).toContain('CUE_LEAD_SCOPE = "leads:read"');
    expect(voice).toContain('VOICE_LEAD_WRITE_SCOPE = "phone_leads:write"');
    expect(api).toContain('req.header("elevenlabs-signature")');
    expect(api).toContain("client.webhooks.constructEvent(rawBody, signature, ENV.elevenLabsWebhookSecret)");
    expect(api).toContain('providerEventId: `webhook:${callId}:post_call_transcription`');
    expect(api).not.toContain("sendSms(");
    expect(api).not.toContain("createCheckout");
    expect(server.indexOf('express.raw({ type: "application/json" })')).toBeLessThan(server.indexOf('app.use(express.json'));
  });

  it("documents human approval and forbids changing the live public route before an independent test", () => {
    const runbook = read("docs/cue-telephone-integration/runbook.md");
    const audit = read("docs/cue-telephone-integration/audit-evidence.md");
    expect(runbook).toContain("does not create or configure an ElevenLabs agent");
    expect(runbook).toContain("separate approved number");
    expect(audit).toContain("does not port, cancel, replace, disconnect, forward");
    expect(audit).toContain("+1 888-933-3010");
  });
});
