const CENTRAL_TIME_ZONE = "America/Chicago";
const SLOT_DURATION_MINS = 30;
const OPEN_MINUTES = 8 * 60;
const CLOSE_MINUTES = 15 * 60;

function datePartsInCentral(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day, 12));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CENTRAL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(utc);
  const get = (type: string) =>
    parts.find(part => part.type === type)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday"),
  };
}

function observedFixedHoliday(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  if (weekday === 6) date.setUTCDate(date.getUTCDate() - 1);
  if (weekday === 0) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  occurrence: number
) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  const day = 1 + offset + (occurrence - 1) * 7;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function lastWeekdayOfMonth(year: number, month: number, weekday: number) {
  const last = new Date(Date.UTC(year, month, 0));
  const offset = (last.getUTCDay() - weekday + 7) % 7;
  const day = last.getUTCDate() - offset;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** U.S. federal holidays, including observed dates, evaluated in Central Time. */
export function getUsHolidayDates(year: number) {
  return new Set([
    observedFixedHoliday(year, 1, 1),
    nthWeekdayOfMonth(year, 1, 1, 3), // Martin Luther King Jr. Day
    nthWeekdayOfMonth(year, 2, 1, 3), // Washington's Birthday
    lastWeekdayOfMonth(year, 5, 1), // Memorial Day
    observedFixedHoliday(year, 6, 19), // Juneteenth
    observedFixedHoliday(year, 7, 4),
    nthWeekdayOfMonth(year, 9, 1, 1), // Labor Day
    nthWeekdayOfMonth(year, 10, 1, 2), // Columbus Day
    observedFixedHoliday(year, 11, 11), // Veterans Day
    nthWeekdayOfMonth(year, 11, 4, 4), // Thanksgiving Day
    observedFixedHoliday(year, 12, 25),
  ]);
}

export function getSchedulingPolicy() {
  return {
    timezone: CENTRAL_TIME_ZONE,
    openTime: "08:00",
    closeTime: "15:00",
    slotDurationMins: SLOT_DURATION_MINS,
    weekdays: [1, 2, 3, 4, 5],
  } as const;
}

export function isAllowedBookingDate(date: string) {
  const parts = datePartsInCentral(date);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    parts.weekday
  );
  return (
    weekday >= 1 && weekday <= 5 && !getUsHolidayDates(parts.year).has(date)
  );
}

export function isAllowedBookingTime(startTime: string, endTime: string) {
  const parse = (value: string) => {
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    if (!match) return null;
    const minutes = Number(match[1]) * 60 + Number(match[2]);
    return Number(match[1]) <= 23 && Number(match[2]) <= 59 ? minutes : null;
  };
  const start = parse(startTime);
  const end = parse(endTime);
  return (
    start !== null &&
    end !== null &&
    start >= OPEN_MINUTES &&
    end <= CLOSE_MINUTES &&
    start % SLOT_DURATION_MINS === 0 &&
    end - start === SLOT_DURATION_MINS
  );
}

export function getPolicySlots() {
  const slots: { startTime: string; endTime: string }[] = [];
  for (
    let current = OPEN_MINUTES;
    current + SLOT_DURATION_MINS <= CLOSE_MINUTES;
    current += SLOT_DURATION_MINS
  ) {
    const format = (minutes: number) =>
      `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    slots.push({
      startTime: format(current),
      endTime: format(current + SLOT_DURATION_MINS),
    });
  }
  return slots;
}

export { CENTRAL_TIME_ZONE };
