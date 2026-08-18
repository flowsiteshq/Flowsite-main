import { describe, it, expect } from "vitest";

// ─── Slot generation logic (extracted for unit testing) ────────────────────
function generateSlots(
  rules: { startTime: string; endTime: string; slotDurationMins: number }[],
  bookedTimes: Set<string>
): { startTime: string; endTime: string; available: boolean }[] {
  const slots: { startTime: string; endTime: string; available: boolean }[] = [];
  for (const rule of rules) {
    const [sh, sm] = rule.startTime.split(":").map(Number);
    const [eh, em] = rule.endTime.split(":").map(Number);
    let current = sh * 60 + sm;
    const end = eh * 60 + em;
    while (current + rule.slotDurationMins <= end) {
      const startH = String(Math.floor(current / 60)).padStart(2, "0");
      const startM = String(current % 60).padStart(2, "0");
      const endMin = current + rule.slotDurationMins;
      const endH = String(Math.floor(endMin / 60)).padStart(2, "0");
      const endMStr = String(endMin % 60).padStart(2, "0");
      const startTime = `${startH}:${startM}`;
      const endTime = `${endH}:${endMStr}`;
      slots.push({ startTime, endTime, available: !bookedTimes.has(startTime) });
      current += rule.slotDurationMins;
    }
  }
  return slots;
}

describe("Scheduling: slot generation", () => {
  it("generates correct number of 30-min slots for a 2-hour window", () => {
    const slots = generateSlots(
      [{ startTime: "09:00", endTime: "11:00", slotDurationMins: 30 }],
      new Set()
    );
    expect(slots).toHaveLength(4);
    expect(slots[0]).toEqual({ startTime: "09:00", endTime: "09:30", available: true });
    expect(slots[3]).toEqual({ startTime: "10:30", endTime: "11:00", available: true });
  });

  it("marks booked slots as unavailable", () => {
    const slots = generateSlots(
      [{ startTime: "09:00", endTime: "11:00", slotDurationMins: 30 }],
      new Set(["09:30"])
    );
    expect(slots[0].available).toBe(true);
    expect(slots[1].available).toBe(false); // 09:30 is booked
    expect(slots[2].available).toBe(true);
  });

  it("generates 60-min slots correctly", () => {
    const slots = generateSlots(
      [{ startTime: "10:00", endTime: "14:00", slotDurationMins: 60 }],
      new Set()
    );
    expect(slots).toHaveLength(4);
    expect(slots[0]).toEqual({ startTime: "10:00", endTime: "11:00", available: true });
    expect(slots[3]).toEqual({ startTime: "13:00", endTime: "14:00", available: true });
  });

  it("returns empty array when no rules provided", () => {
    const slots = generateSlots([], new Set());
    expect(slots).toHaveLength(0);
  });

  it("does not generate partial slot at end of window", () => {
    // 9:00 to 9:45 with 30-min slots → only 1 slot (9:00-9:30), not 2
    const slots = generateSlots(
      [{ startTime: "09:00", endTime: "09:45", slotDurationMins: 30 }],
      new Set()
    );
    expect(slots).toHaveLength(1);
    expect(slots[0].startTime).toBe("09:00");
  });

  it("handles multiple rules for the same day", () => {
    const slots = generateSlots(
      [
        { startTime: "09:00", endTime: "12:00", slotDurationMins: 60 },
        { startTime: "14:00", endTime: "16:00", slotDurationMins: 60 },
      ],
      new Set()
    );
    expect(slots).toHaveLength(5); // 3 morning + 2 afternoon
    expect(slots[3].startTime).toBe("14:00");
    expect(slots[4].startTime).toBe("15:00");
  });

  it("handles all slots booked", () => {
    const slots = generateSlots(
      [{ startTime: "09:00", endTime: "10:00", slotDurationMins: 30 }],
      new Set(["09:00", "09:30"])
    );
    expect(slots).toHaveLength(2);
    expect(slots.every(s => !s.available)).toBe(true);
  });
});

describe("Scheduling: date utilities", () => {
  it("correctly identifies day of week from date string", () => {
    // 2026-03-09 is a Monday (day 1)
    const dateObj = new Date("2026-03-09T12:00:00Z");
    expect(dateObj.getUTCDay()).toBe(1);

    // 2026-03-08 is a Sunday (day 0)
    const sunday = new Date("2026-03-08T12:00:00Z");
    expect(sunday.getUTCDay()).toBe(0);
  });

  it("generates correct date range for month boundaries", () => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = 2026;
    const month = 2; // February
    const lastDay = new Date(year, month, 0).getDate();
    expect(lastDay).toBe(28); // 2026 is not a leap year
    const fromDate = `${year}-${pad(month)}-01`;
    const toDate = `${year}-${pad(month)}-${pad(lastDay)}`;
    expect(fromDate).toBe("2026-02-01");
    expect(toDate).toBe("2026-02-28");
  });
});
