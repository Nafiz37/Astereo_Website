import { business } from "@/content/site";

export type BusinessRules = {
  timezone: string;
  workingDays: readonly number[];
  startHour: number;
  endHour: number;
  slotMinutes: number;
  minNoticeHours: number;
  horizonDays: number;
  closedDates: readonly string[];
};

const dtfCache = new Map<string, Intl.DateTimeFormat>();
function dtf(tz: string) {
  let f = dtfCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    dtfCache.set(tz, f);
  }
  return f;
}

/** Wall-clock parts of an instant in a given IANA timezone. */
export function zonedParts(ts: number, tz: string) {
  const o: Record<string, number> = {};
  for (const p of dtf(tz).formatToParts(new Date(ts))) {
    if (p.type !== "literal") o[p.type] = Number(p.value);
  }
  return { year: o.year, month: o.month, day: o.day, hour: o.hour === 24 ? 0 : o.hour, minute: o.minute, second: o.second };
}

/** Offset (ms) of `tz` from UTC at instant `ts`. */
export function tzOffsetMs(ts: number, tz: string) {
  const p = zonedParts(ts, tz);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ts / 1000) * 1000;
}

/** Converts a wall-clock time in `tz` to a UTC timestamp (handles DST transitions). */
export function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, tz: string) {
  const naive = Date.UTC(year, month - 1, day, hour, minute, 0);
  let ts = naive - tzOffsetMs(naive, tz);
  ts = naive - tzOffsetMs(ts, tz);
  return ts;
}

const pad = (n: number) => String(n).padStart(2, "0");
export const isoDate = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

/** All bookable slot start times (UTC ms) from `now`, before removing existing bookings. */
export function generateSlotTimes(now: number, rules: BusinessRules = business): number[] {
  const out: number[] = [];
  const earliest = now + rules.minNoticeHours * 3_600_000;
  const today = zonedParts(now, rules.timezone);
  for (let i = 0; i <= rules.horizonDays; i++) {
    // Calendar arithmetic on the business-local date (UTC date maths avoids DST pitfalls).
    const d = new Date(Date.UTC(today.year, today.month - 1, today.day + i));
    const [y, m, day] = [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
    if (!rules.workingDays.includes(d.getUTCDay())) continue;
    if (rules.closedDates.includes(isoDate(y, m, day))) continue;
    for (let mins = rules.startHour * 60; mins + rules.slotMinutes <= rules.endHour * 60; mins += rules.slotMinutes) {
      const ts = zonedTimeToUtc(y, m, day, Math.floor(mins / 60), mins % 60, rules.timezone);
      if (ts >= earliest) out.push(ts);
    }
  }
  return out;
}

export function availableSlots(now: number, bookedStartsMs: Iterable<number>, rules: BusinessRules = business) {
  const booked = new Set(bookedStartsMs);
  return generateSlotTimes(now, rules).filter((t) => !booked.has(t));
}

/** True when `startMs` is exactly one of the offered slot times. */
export function isOfferedSlot(startMs: number, now: number, rules: BusinessRules = business) {
  return generateSlotTimes(now, rules).includes(startMs);
}

export function formatInZone(ms: number, tz: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...opts,
  }).format(new Date(ms));
}

export function isValidTimezone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;