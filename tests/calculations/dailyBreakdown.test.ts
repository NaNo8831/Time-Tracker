import { describe, expect, it } from "vitest";
import { dailyBreakdown, splitWeekActual, type DailyBreakdownRow } from "@/lib/calculations/dailyBreakdown";
import type { IsoDate, LeaveType } from "@/lib/types";

function row(
  date: IsoDate,
  paidHours: number,
  leaveHoursByType: Partial<Record<LeaveType, number>> = {}
): DailyBreakdownRow {
  const byType = { vacation: 0, sick: 0, paternity: 0, ...leaveHoursByType } as Record<LeaveType, number>;
  return {
    date,
    rawHours: 0,
    breakHours: 0,
    leaveHoursByType: byType,
    totalLeaveHours: byType.vacation + byType.sick + byType.paternity,
    holidayCredit: 0,
    othersTotal: byType.vacation + byType.sick + byType.paternity,
    paidHours,
  };
}

describe("dailyBreakdown", () => {
  it("splits raw hours, break hours, and leave hours by type", () => {
    const row = dailyBreakdown({
      date: "2026-07-09",
      sessions: [
        { checkIn: "2026-07-09T08:00:00Z", checkOut: "2026-07-09T14:00:00Z" },
      ],
      breakMinutesOverride: null,
      breakDurationMinutesInEffect: 30,
      leaveEntries: [
        { leaveType: "vacation", hours: 2 },
        { leaveType: "vacation", hours: 1 },
        { leaveType: "sick", hours: 4 },
      ],
      isHoliday: false,
      standardWorkdayHoursInEffect: 8,
    });

    expect(row.rawHours).toBe(6);
    expect(row.breakHours).toBe(0.5);
    expect(row.leaveHoursByType).toEqual({ vacation: 3, sick: 4, paternity: 0 });
    expect(row.totalLeaveHours).toBe(7);
    expect(row.holidayCredit).toBe(0);
    expect(row.othersTotal).toBe(7);
    // paidHours = Raw - Break + Leave + Holiday = 6 - 0.5 + 7 + 0
    expect(row.paidHours).toBe(12.5);
  });

  it("uses a manual break override instead of the default", () => {
    const row = dailyBreakdown({
      date: "2026-05-14",
      sessions: [{ checkIn: "2026-05-14T08:00:00", checkOut: "2026-05-14T14:15:00" }],
      breakMinutesOverride: 60,
      breakDurationMinutesInEffect: 0,
      leaveEntries: [],
      isHoliday: false,
      standardWorkdayHoursInEffect: 8,
    });

    expect(row.breakHours).toBe(1);
    expect(row.paidHours).toBe(5.25); // matches the real 2026-05-14 sheet row
  });

  it("returns zeroed leave totals when nothing was logged", () => {
    const row = dailyBreakdown({
      date: "2026-07-09",
      sessions: [],
      breakMinutesOverride: null,
      breakDurationMinutesInEffect: undefined,
      leaveEntries: [],
      isHoliday: false,
      standardWorkdayHoursInEffect: 8,
    });

    expect(row.leaveHoursByType).toEqual({ vacation: 0, sick: 0, paternity: 0 });
    expect(row.totalLeaveHours).toBe(0);
    expect(row.holidayCredit).toBe(0);
    expect(row.othersTotal).toBe(0);
    expect(row.paidHours).toBe(0);
  });

  it("folds Holiday Credit into othersTotal and paidHours, matching the Work Hours business rule exactly", () => {
    // A paid holiday with no sessions: Raw stays 0, but Holiday Credit
    // shows up in the "Other" column (with V/S/P) and in the Total.
    const row = dailyBreakdown({
      date: "2026-07-04",
      sessions: [],
      breakMinutesOverride: null,
      breakDurationMinutesInEffect: undefined,
      leaveEntries: [],
      isHoliday: true,
      standardWorkdayHoursInEffect: 8,
    });

    expect(row.rawHours).toBe(0);
    expect(row.holidayCredit).toBe(8);
    expect(row.othersTotal).toBe(8);
    expect(row.paidHours).toBe(8);
  });
});

describe("splitWeekActual", () => {
  it("splits a mixed week into through-today and later-this-week totals, with a leave-type breakdown for the later segment", () => {
    // Mirrors the reported case: Mon-Tue already worked, Wed-Fri already
    // logged in advance with different leave types.
    const rows = [
      row("2026-07-13", 0),
      row("2026-07-14", 6.25), // today
      row("2026-07-15", 8, { vacation: 4 }),
      row("2026-07-16", 4.5),
      row("2026-07-17", 5, { sick: 2 }),
      row("2026-07-18", 0),
      row("2026-07-19", 0),
    ];

    const split = splitWeekActual(rows, "2026-07-14");

    expect(split.throughTodayHours).toBeCloseTo(6.25);
    expect(split.laterThisWeekHours).toBeCloseTo(17.5);
    expect(split.laterThisWeekByType).toEqual({ vacation: 4, sick: 2, paternity: 0 });
    // The two totals must always add back up to the week's real actual hours.
    const weekTotal = rows.reduce((sum, r) => sum + r.paidHours, 0);
    expect(split.throughTodayHours + split.laterThisWeekHours).toBeCloseTo(weekTotal);
  });

  it("has no later-this-week hours when the whole week is in the past", () => {
    const rows = [
      row("2026-07-06", 8),
      row("2026-07-07", 8),
      row("2026-07-08", 8),
      row("2026-07-09", 8),
      row("2026-07-10", 8),
      row("2026-07-11", 0),
      row("2026-07-12", 0),
    ];

    const split = splitWeekActual(rows, "2026-07-14");

    expect(split.laterThisWeekHours).toBe(0);
    expect(split.laterThisWeekByType).toEqual({ vacation: 0, sick: 0, paternity: 0 });
    expect(split.throughTodayHours).toBe(40);
  });

  it("puts everything in later-this-week when the whole week is in the future (e.g. a week of pre-planned vacation)", () => {
    const rows = [
      row("2026-07-20", 8, { vacation: 8 }),
      row("2026-07-21", 8, { vacation: 8 }),
      row("2026-07-22", 8, { vacation: 8 }),
      row("2026-07-23", 8, { vacation: 8 }),
      row("2026-07-24", 8, { vacation: 8 }),
      row("2026-07-25", 0),
      row("2026-07-26", 0),
    ];

    const split = splitWeekActual(rows, "2026-07-14");

    expect(split.throughTodayHours).toBe(0);
    expect(split.laterThisWeekHours).toBe(40);
    expect(split.laterThisWeekByType.vacation).toBe(40);
  });
});
