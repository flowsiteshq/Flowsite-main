/**
 * Tests for the client-side timezone utility (lib/timezones.ts).
 * We import directly from the source file — no server dependencies.
 */
import { describe, it, expect } from "vitest";
import { extractAreaCode, getTZFromPhone, getLocalTimeInfo } from "../client/src/lib/timezones";

describe("extractAreaCode", () => {
  it("extracts area code from dashes format", () => {
    expect(extractAreaCode("903-534-8800")).toBe("903");
  });

  it("extracts area code from parentheses format", () => {
    expect(extractAreaCode("(512) 444-6672")).toBe("512");
  });

  it("extracts area code from plain digits", () => {
    expect(extractAreaCode("7135348800")).toBe("713");
  });

  it("strips +1 country code prefix", () => {
    expect(extractAreaCode("+19035348800")).toBe("903");
  });

  it("returns null for short/invalid numbers", () => {
    expect(extractAreaCode("555")).toBeNull();
    expect(extractAreaCode("")).toBeNull();
  });
});

describe("getTZFromPhone", () => {
  it("returns Central Time for 903 (East Texas)", () => {
    const tz = getTZFromPhone("903-534-8800");
    expect(tz).not.toBeNull();
    expect(tz!.tz).toBe("America/Chicago");
    expect(tz!.label).toBe("CT");
  });

  it("returns Central Time for 512 (Austin, TX)", () => {
    const tz = getTZFromPhone("(512) 444-6672");
    expect(tz!.tz).toBe("America/Chicago");
  });

  it("returns Eastern Time for 212 (New York)", () => {
    const tz = getTZFromPhone("212-555-0100");
    expect(tz!.tz).toBe("America/New_York");
    expect(tz!.label).toBe("ET");
  });

  it("returns Pacific Time for 310 (LA)", () => {
    const tz = getTZFromPhone("310-555-0100");
    expect(tz!.tz).toBe("America/Los_Angeles");
    expect(tz!.label).toBe("PT");
  });

  it("returns Mountain Time for 303 (Denver)", () => {
    const tz = getTZFromPhone("303-555-0100");
    expect(tz!.tz).toBe("America/Denver");
    expect(tz!.label).toBe("MT");
  });

  it("returns Arizona Time for 480 (Phoenix)", () => {
    const tz = getTZFromPhone("480-555-0100");
    expect(tz!.tz).toBe("America/Phoenix");
    expect(tz!.label).toBe("AZ");
  });

  it("returns Hawaii Time for 808", () => {
    const tz = getTZFromPhone("808-555-0100");
    expect(tz!.tz).toBe("Pacific/Honolulu");
    expect(tz!.label).toBe("HT");
  });

  it("returns Alaska Time for 907", () => {
    const tz = getTZFromPhone("907-555-0100");
    expect(tz!.tz).toBe("America/Anchorage");
    expect(tz!.label).toBe("AKT");
  });

  it("returns null for unknown area code", () => {
    expect(getTZFromPhone("000-000-0000")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getTZFromPhone("")).toBeNull();
  });
});

describe("getLocalTimeInfo", () => {
  it("returns a time string and a valid status for America/Chicago", () => {
    const info = getLocalTimeInfo("America/Chicago");
    expect(info.time).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
    expect(["good", "early", "late", "closed"]).toContain(info.status);
    expect(typeof info.hour).toBe("number");
    expect(info.hour).toBeGreaterThanOrEqual(0);
    expect(info.hour).toBeLessThanOrEqual(23);
  });

  it("returns a time string for America/New_York", () => {
    const info = getLocalTimeInfo("America/New_York");
    expect(info.time).toBeTruthy();
  });

  it("returns a time string for Pacific/Honolulu", () => {
    const info = getLocalTimeInfo("Pacific/Honolulu");
    expect(info.time).toBeTruthy();
  });
});
