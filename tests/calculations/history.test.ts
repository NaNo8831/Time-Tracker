import { describe, expect, it } from "vitest";
import { buildDailyHistory, summarizeDailyHistory } from "@/lib/calculations/history";

const NO_HOLIDAYS = new Set<string>();

describe("buildDailyHistory", () => {
  it("produces one row per calendar date in the inclusive range", () => {
    const rows = buildDailyHistory({
      startDate: "2026-07-01",
      endDate: "2026-07-03",
      sessionsByDate: new Map(),
      breakMinutesOverrideByDate: new Map(),
      leaveEntriesByDate: new Map(),
      breakDurationSettings: [],
      holidays: NO_HOLIDAYS,
      standardWorkdayHoursSettings: [],
    });

    expect(rows.map((r) => r.date)).toEqual(["2026-07-01", "2026-07-02", "2026-07-03"]);
  });

  it("looks up the break duration in effect for each date independently (only applies when the day has sessions)", () => {
    const rows = buildDailyHistory({
      startDate: "2026-07-01",
      endDate: "2026-07-02",
      sessionsByDate: new Map([
        ["2026-07-01", [{ checkIn: "2026-07-01T08:00:00Z", checkOut: "2026-07-01T12:00:00Z" }]],
        ["2026-07-02", [{ checkIn: "2026-07-02T08:00:00Z", checkOut: "2026-07-02T12:00:00Z" }]],
      ]),
      breakMinutesOverrideByDate: new Map(),
      leaveEntriesByDate: new Map(),
      breakDurationSettings: [
        { value: 30, effectiveDate: "2026-01-01" },
        { value: 60, effectiveDate: "2026-07-02" },
      ],
      holidays: NO_HOLIDAYS,
      standardWorkdayHoursSettings: [],
    });

    expect(rows[0].breakHours).toBe(0.5); // 30 min, still in effect on 07-01
    expect(rows[1].breakHours).toBe(1); // 60 min, effective 07-02
  });

  it("does not apply the default break duration on a day with no sessions", () => {
    const rows = buildDailyHistory({
      startDate: "2026-07-01",
      endDate: "2026-07-01",
      sessionsByDate: new Map(), // no sessions at all this day
      breakMinutesOverrideByDate: new Map(),
      leaveEntriesByDate: new Map(),
      breakDurationSettings: [{ value: 30, effectiveDate: "2026-01-01" }],
      holidays: NO_HOLIDAYS,
      standardWorkdayHoursSettings: [],
    });

    expect(rows[0].breakHours).toBe(0);
  });

  it("uses a manual break override instead of the effective default", () => {
    const rows = buildDailyHistory({
      startDate: "2026-07-01",
      endDate: "2026-07-01",
      sessionsByDate: new Map(),
      breakMinutesOverrideByDate: new Map([["2026-07-01", 60]]),
      leaveEntriesByDate: new Map(),
      breakDurationSettings: [{ value: 30, effectiveDate: "2026-01-01" }],
      holidays: NO_HOLIDAYS,
      standardWorkdayHoursSettings: [],
    });

    expect(rows[0].breakHours).toBe(1); // override wins over the 30-min default
  });

  it("credits a holiday date automatically, folded into othersTotal", () => {
    const rows = buildDailyHistory({
      startDate: "2026-07-04",
      endDate: "2026-07-04",
      sessionsByDate: new Map(),
      breakMinutesOverrideByDate: new Map(),
      leaveEntriesByDate: new Map(),
      breakDurationSettings: [],
      holidays: new Set(["2026-07-04"]),
      standardWorkdayHoursSettings: [{ value: 8, effectiveDate: "2026-01-01" }],
    });

    expect(rows[0].holidayCredit).toBe(8);
    expect(rows[0].othersTotal).toBe(8);
    expect(rows[0].paidHours).toBe(8);
  });
});

describe("summarizeDailyHistory", () => {
  it("sums raw, break, and per-type leave hours across all rows", () => {
    const rows = buildDailyHistory({
      startDate: "2026-07-06",
      endDate: "2026-07-07",
      sessionsByDate: new Map([
        ["2026-07-06", [{ checkIn: "2026-07-06T08:00:00Z", checkOut: "2026-07-06T12:00:00Z" }]],
        ["2026-07-07", [{ checkIn: "2026-07-07T08:00:00Z", checkOut: "2026-07-07T12:00:00Z" }]],
      ]),
      breakMinutesOverrideByDate: new Map(),
      leaveEntriesByDate: new Map([
        ["2026-07-07", [{ leaveType: "sick" as const, hours: 2 }]],
      ]),
      breakDurationSettings: [{ value: 30, effectiveDate: "2026-01-01" }],
      holidays: NO_HOLIDAYS,
      standardWorkdayHoursSettings: [],
    });

    const summary = summarizeDailyHistory(rows);

    expect(summary.totalRawHours).toBe(8);
    expect(summary.totalBreakHours).toBe(1); // 30-min default applies both days
    expect(summary.totalLeaveHoursByType).toEqual({ vacation: 0, sick: 2, paternity: 0 });
    expect(summary.totalLeaveHours).toBe(2);
    expect(summary.totalHolidayCredit).toBe(0);
    expect(summary.totalOthersTotal).toBe(2);
    // totalPaidHours = totalRaw - totalBreak + totalOthersTotal = 8 - 1 + 2
    expect(summary.totalPaidHours).toBe(9);
  });

  it("includes holiday credit in totalOthersTotal and totalPaidHours", () => {
    const rows = buildDailyHistory({
      startDate: "2026-07-04",
      endDate: "2026-07-04",
      sessionsByDate: new Map(),
      breakMinutesOverrideByDate: new Map(),
      leaveEntriesByDate: new Map(),
      breakDurationSettings: [],
      holidays: new Set(["2026-07-04"]),
      standardWorkdayHoursSettings: [{ value: 8, effectiveDate: "2026-01-01" }],
    });

    const summary = summarizeDailyHistory(rows);

    expect(summary.totalHolidayCredit).toBe(8);
    expect(summary.totalOthersTotal).toBe(8);
    expect(summary.totalPaidHours).toBe(8);
  });

  it("returns all zeros for an empty set of rows", () => {
    const summary = summarizeDailyHistory([]);
    expect(summary.totalRawHours).toBe(0);
    expect(summary.totalBreakHours).toBe(0);
    expect(summary.totalLeaveHoursByType).toEqual({ vacation: 0, sick: 0, paternity: 0 });
    expect(summary.totalLeaveHours).toBe(0);
    expect(summary.totalHolidayCredit).toBe(0);
    expect(summary.totalOthersTotal).toBe(0);
    expect(summary.totalPaidHours).toBe(0);
  });
});
