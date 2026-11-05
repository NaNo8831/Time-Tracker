import { describe, expect, it } from "vitest";
import { buildWeeklyRecap, type RecapInput } from "@/lib/calculations/recap";

/**
 * Pins the Saturday–Friday week model to the user's real Google Sheet
 * (references/source-app/sheet-export-2026-01-10-to-2026-02-06.csv): the
 * sheet's own printed weekly rollover balances for its first three
 * Sat–Fri weeks, starting from its carried-in balance of -12.12 at 2026-01-10.
 */
function span(date: string, from: string, to: string) {
  return { checkIn: `${date}T${from}:00`, checkOut: `${date}T${to}:00` };
}

describe("Sat–Fri weeks reproduce the user's real sheet (Jan 10 – Jan 30, 2026)", () => {
  const sessionsByDate = new Map([
    // Week of Sat Jan 10
    ["2026-01-10", [span("2026-01-10", "07:00", "11:15")]],
    ["2026-01-13", [span("2026-01-13", "08:00", "15:30")]],
    ["2026-01-14", [span("2026-01-14", "08:00", "16:30")]],
    ["2026-01-15", [span("2026-01-15", "08:00", "13:30")]],
    ["2026-01-16", [span("2026-01-16", "09:00", "10:00")]],
    // Week of Sat Jan 17
    ["2026-01-20", [span("2026-01-20", "08:00", "16:15")]],
    ["2026-01-21", [span("2026-01-21", "08:00", "14:00")]],
    ["2026-01-22", [span("2026-01-22", "08:00", "13:15")]],
    ["2026-01-23", [span("2026-01-23", "10:00", "13:00"), span("2026-01-23", "14:00", "15:30")]],
    // Week of Sat Jan 24
    ["2026-01-26", [span("2026-01-26", "09:00", "10:00")]],
    ["2026-01-27", [span("2026-01-27", "08:00", "15:30")]],
    ["2026-01-28", [span("2026-01-28", "08:00", "16:45")]],
    ["2026-01-29", [span("2026-01-29", "10:30", "16:00")]],
    ["2026-01-30", [span("2026-01-30", "08:15", "13:30")]],
  ]);

  const input: RecapInput = {
    today: "2026-01-30", // the Friday ending the third week
    weeklyTargetSettings: [{ value: 32, effectiveDate: "2026-01-10" }],
    breakDurationSettings: [{ value: 0, effectiveDate: "2026-01-10" }],
    standardWorkdayHoursSettings: [{ value: 6.4, effectiveDate: "2026-01-10" }],
    holidays: new Set<string>(),
    sessionsByDate,
    breakMinutesOverrideByDate: new Map([
      ["2026-01-20", 60],
      ["2026-01-29", 60],
    ]),
    leaveHoursByDate: new Map([
      ["2026-01-16", [{ hours: 8 }]], // vacation
      ["2026-01-19", [{ hours: 6.4 }]], // vacation
    ]),
    leaveBankEntries: [],
    allLeaveEntriesByType: { vacation: [], sick: [], paternity: [] },
    rollingBalanceSeed: -12.12,
  };

  it("matches the sheet's printed weekly Actual and rolling balances", () => {
    const result = buildWeeklyRecap(input)!;

    expect(result.weeks.map((w) => w.weekStart)).toEqual(["2026-01-10", "2026-01-17", "2026-01-24"]);
    expect(result.weeks.map((w) => Number(w.actualHours.toFixed(2)))).toEqual([34.75, 29.4, 27]);
    // The sheet prints -9.37, -11.97, -16.97 (±0.01 for its 2-decimal rounding).
    expect(result.weeks[0].rollingBalance).toBeCloseTo(-9.37, 2);
    expect(result.weeks[1].rollingBalance).toBeCloseTo(-11.97, 2);
    expect(result.weeks[2].rollingBalance).toBeCloseTo(-16.97, 2);
  });
});
