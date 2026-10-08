import { describe, expect, it } from "vitest";
import { availableSlots, generateSlotTimes, isOfferedSlot, zonedTimeToUtc, type BusinessRules } from "@/lib/scheduling";

const dhaka: BusinessRules = { timezone: "Asia/Dhaka", workingDays: [0, 1, 2, 3, 4], startHour: 10, endHour: 18, slotMinutes: 30, minNoticeHours: 12, horizonDays: 14, closedDates: [] };
const dhakaDay = (t: number) => new Date(t + 6 * 3_600_000).toISOString().slice(0, 10);

describe("scheduling", () => {
  it("converts business-local time to UTC (Dhaka is UTC+6)", () => {
    expect(new Date(zonedTimeToUtc(2026, 10, 11, 10, 0, "Asia/Dhaka")).toISOString()).toBe("2026-10-11T04:00:00.000Z");
  });

  it("handles daylight-saving offsets", () => {
    expect(new Date(zonedTimeToUtc(2026, 3, 6, 9, 0, "America/New_York")).toISOString()).toBe("2026-03-06T14:00:00.000Z"); // EST
    expect(new Date(zonedTimeToUtc(2026, 3, 9, 9, 0, "America/New_York")).toISOString()).toBe("2026-03-09T13:00:00.000Z"); // EDT
  });

  it("only offers working days within hours, respecting minimum notice", () => {
    const now = Date.parse("2026-10-06T12:00:00Z"); // Tuesday 18:00 Dhaka
    const slots = generateSlotTimes(now, dhaka);
    expect(slots.length).toBeGreaterThan(0);
    const perDay = new Map<string, number>();
    for (const t of slots) {
      expect(t).toBeGreaterThanOrEqual(now + 12 * 3_600_000);
      const local = new Date(t + 6 * 3_600_000);
      expect([0, 1, 2, 3, 4]).toContain(local.getUTCDay()); // never Friday/Saturday
      const mins = local.getUTCHours() * 60 + local.getUTCMinutes();
      expect(mins).toBeGreaterThanOrEqual(600);
      expect(mins).toBeLessThanOrEqual(17 * 60 + 30);
      perDay.set(dhakaDay(t), (perDay.get(dhakaDay(t)) ?? 0) + 1);
    }
    expect(Math.max(...perDay.values())).toBe(16); // 10:00-18:00 in 30 minute steps
  });

  it("removes booked slots and rejects arbitrary times", () => {
    const now = Date.parse("2026-10-06T12:00:00Z");
    const all = generateSlotTimes(now, dhaka);
    const left = availableSlots(now, [all[0]], dhaka);
    expect(left).not.toContain(all[0]);
    expect(left.length).toBe(all.length - 1);
    expect(isOfferedSlot(all[3], now, dhaka)).toBe(true);
    expect(isOfferedSlot(all[3] + 60_000, now, dhaka)).toBe(false);
  });

  it("skips closed dates", () => {
    const now = Date.parse("2026-10-06T12:00:00Z");
    const open = generateSlotTimes(now, dhaka);
    const day = dhakaDay(open[0]);
    const closed = generateSlotTimes(now, { ...dhaka, closedDates: [day] });
    expect(closed.some((t) => dhakaDay(t) === day)).toBe(false);
  });
});
