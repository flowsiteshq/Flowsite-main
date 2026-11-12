import { describe, expect, it } from "vitest";
import {
  getPolicySlots,
  getSchedulingPolicy,
  isAllowedBookingDate,
  isAllowedBookingTime,
  isFutureBookingSlot,
} from "./schedulingRules";

describe("public scheduling policy", () => {
  it("uses Central Time weekdays from 8 AM through 3 PM", () => {
    expect(getSchedulingPolicy()).toMatchObject({
      timezone: "America/Chicago",
      openTime: "08:00",
      closeTime: "15:00",
      slotDurationMins: 30,
      weekdays: [1, 2, 3, 4, 5],
    });
    expect(getPolicySlots()).toHaveLength(14);
    expect(getPolicySlots()[0]).toEqual({
      startTime: "08:00",
      endTime: "08:30",
    });
    expect(getPolicySlots().at(-1)).toEqual({
      startTime: "14:30",
      endTime: "15:00",
    });
  });

  it("allows only valid half-hour slots inside the business window", () => {
    expect(isAllowedBookingTime("08:00", "08:30")).toBe(true);
    expect(isAllowedBookingTime("14:30", "15:00")).toBe(true);
    expect(isAllowedBookingTime("07:30", "08:00")).toBe(false);
    expect(isAllowedBookingTime("15:00", "15:30")).toBe(false);
    expect(isAllowedBookingTime("08:15", "08:45")).toBe(false);
  });

  it("blocks weekends and U.S. federal holidays", () => {
    expect(isAllowedBookingDate("2026-11-06")).toBe(true); // Friday
    expect(isAllowedBookingDate("2026-11-07")).toBe(false); // Saturday
    expect(isAllowedBookingDate("2026-11-26")).toBe(false); // Thanksgiving
    expect(isAllowedBookingDate("2026-12-25")).toBe(false); // Christmas
  });

  it("does not offer slots that have already passed in Central Time", () => {
    const now = { date: "2026-11-12", minutes: 10 * 60 + 15 };
    expect(isFutureBookingSlot("2026-11-12", "10:00", now)).toBe(false);
    expect(isFutureBookingSlot("2026-11-12", "10:30", now)).toBe(true);
    expect(isFutureBookingSlot("2026-11-11", "14:30", now)).toBe(false);
    expect(isFutureBookingSlot("2026-11-13", "08:00", now)).toBe(true);
  });
});
