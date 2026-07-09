import { describe, expect, it } from "vitest";
import { dailyBreakdown } from "@/lib/calculations/dailyBreakdown";

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
