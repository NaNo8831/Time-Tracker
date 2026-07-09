import { describe, expect, it } from "vitest";
import {
  breakDeduction,
  holidayCredit,
  leaveHours,
  rawHours,
  workHours,
} from "@/lib/calculations/workHours";

describe("rawHours", () => {
  it("sums a multi-session day correctly (e.g. 8am-2pm, 6pm-10pm)", () => {
    const sessions = [
      { checkIn: "2026-07-09T08:00:00Z", checkOut: "2026-07-09T14:00:00Z" },
      { checkIn: "2026-07-09T18:00:00Z", checkOut: "2026-07-09T22:00:00Z" },
    ];

    expect(rawHours(sessions)).toBe(10);
  });

  it("returns 0 for a day with no sessions", () => {
    expect(rawHours([])).toBe(0);
  });
});

describe("breakDeduction", () => {
  it("uses the manual override when one is set, regardless of the default or session presence", () => {
    expect(breakDeduction(60, 30, true)).toBe(1);
    expect(breakDeduction(60, 30, false)).toBe(1);
  });

  it("falls back to the effective-dated default when no override is set, but only if the day has sessions", () => {
    expect(breakDeduction(null, 30, true)).toBe(0.5);
    expect(breakDeduction(undefined, 30, true)).toBe(0.5);
  });

  it("an override of exactly 0 means no break, even if a default exists", () => {
    expect(breakDeduction(0, 30, true)).toBe(0);
  });

  it("is 0 when there is no override and no default in effect", () => {
    expect(breakDeduction(null, undefined, true)).toBe(0);
  });

  it("does not apply the default break when the day has no sessions, even with a default in effect", () => {
    expect(breakDeduction(null, 30, false)).toBe(0);
    expect(breakDeduction(undefined, 30, false)).toBe(0);
  });
});

describe("leaveHours", () => {
  it("sums all leave entries for the date", () => {
    expect(leaveHours([{ hours: 4 }, { hours: 2 }])).toBe(6);
  });
});

describe("holidayCredit", () => {
  it("credits the standard workday hours in effect when the date is a holiday", () => {
    expect(holidayCredit(true, 8)).toBe(8);
  });

  it("is 0 when the date is not a holiday, regardless of the setting", () => {
    expect(holidayCredit(false, 8)).toBe(0);
  });
});

describe("workHours", () => {
  it("combines raw hours, break deduction, leave hours, and holiday credit", () => {
    const result = workHours({
      date: "2026-07-09",
      sessions: [
        { checkIn: "2026-07-09T08:00:00Z", checkOut: "2026-07-09T14:00:00Z" },
        { checkIn: "2026-07-09T18:00:00Z", checkOut: "2026-07-09T22:00:00Z" },
      ],
      breakMinutesOverride: null,
      breakDurationMinutesInEffect: 30,
      leaveEntries: [],
      isHoliday: false,
      standardWorkdayHoursInEffect: 8,
    });

    // 10 raw hours - 0.5 break (default) + 0 leave + 0 holiday (not a holiday)
    expect(result).toBe(9.5);
  });

  it("applies break deduction exactly once even with three sessions", () => {
    const result = workHours({
      date: "2026-07-09",
      sessions: [
        { checkIn: "2026-07-09T06:00:00Z", checkOut: "2026-07-09T08:00:00Z" },
        { checkIn: "2026-07-09T09:00:00Z", checkOut: "2026-07-09T12:00:00Z" },
        { checkIn: "2026-07-09T13:00:00Z", checkOut: "2026-07-09T16:00:00Z" },
      ],
      breakMinutesOverride: null,
      breakDurationMinutesInEffect: 30,
      leaveEntries: [],
      isHoliday: false,
      standardWorkdayHoursInEffect: 8,
    });

    // 8 raw hours - 0.5 break (once, not three times)
    expect(result).toBe(7.5);
  });

  it("uses a manual break override instead of the default", () => {
    const result = workHours({
      date: "2026-05-14",
      sessions: [{ checkIn: "2026-05-14T08:00:00", checkOut: "2026-05-14T14:15:00" }],
      breakMinutesOverride: 60,
      breakDurationMinutesInEffect: 0,
      leaveEntries: [],
      isHoliday: false,
      standardWorkdayHoursInEffect: 8,
    });

    // 6.25 raw hours - 1 break (override) = 5.25, matching the real 2026-05-14 sheet row
    expect(result).toBe(5.25);
  });

  it("credits a holiday automatically with no sessions required", () => {
    const result = workHours({
      date: "2026-07-04",
      sessions: [],
      breakMinutesOverride: null,
      breakDurationMinutesInEffect: 30,
      leaveEntries: [],
      isHoliday: true,
      standardWorkdayHoursInEffect: 8,
    });

    expect(result).toBe(8);
  });
});
