import { describe, expect, it } from "vitest";
import { buildWeeklyRecap, type RecapInput } from "@/lib/calculations/recap";

function baseInput(overrides: Partial<RecapInput> = {}): RecapInput {
  return {
    today: "2026-07-09", // Thursday
    weeklyTargetSettings: [{ value: 32, effectiveDate: "2026-06-01" }],
    breakDurationSettings: [{ value: 30, effectiveDate: "2026-06-01" }],
    standardWorkdayHoursSettings: [{ value: 8, effectiveDate: "2026-06-01" }],
    holidays: new Set<string>(),
    sessionsByDate: new Map(),
    breakMinutesOverrideByDate: new Map(),
    leaveHoursByDate: new Map(),
    leaveBankEntries: [],
    allLeaveEntriesByType: { vacation: [], sick: [], paternity: [] },
    rollingBalanceSeed: 0,
    ...overrides,
  };
}

describe("buildWeeklyRecap", () => {
  it("returns null when no weekly target has been set", () => {
    expect(buildWeeklyRecap(baseInput({ weeklyTargetSettings: [] }))).toBeNull();
  });

  it("computes the current week's actual/target/delta and rolling balance", () => {
    const sessionsByDate = new Map([
      ["2026-06-01", [{ checkIn: "2026-06-01T08:00:00Z", checkOut: "2026-06-01T16:00:00Z" }]],
    ]);
    const result = buildWeeklyRecap(baseInput({ today: "2026-06-01", sessionsByDate }));

    expect(result).not.toBeNull();
    // The default break (30 min) applies automatically since this day has sessions.
    expect(result!.currentWeek.actualHours).toBeCloseTo(7.5); // 8 raw - 0.5 break
    expect(result!.currentWeek.targetHours).toBe(32);
    expect(result!.currentWeek.delta).toBeCloseTo(-24.5);
    expect(result!.currentWeek.rollingBalance).toBeCloseTo(-24.5);
  });

  it("does not apply the default break to days with no sessions (regression for the phantom-break bug)", () => {
    // Three fully unworked weeks starting 2026-06-01 (a Monday), target 32/week,
    // with a break duration default in effect. If the default break wrongly
    // applied to every empty day, each week's actual would be -3.5 (7 * -0.5)
    // instead of 0, corrupting the rolling balance.
    const result = buildWeeklyRecap(baseInput({ today: "2026-06-15" }));

    expect(result!.weeks).toHaveLength(3);
    expect(result!.weeks.every((w) => w.actualHours === 0)).toBe(true);
    expect(result!.weeks.map((w) => w.rollingBalance)).toEqual([-32, -64, -96]);
  });

  it("starts the rolling balance from the seed value when one is set", () => {
    const result = buildWeeklyRecap(baseInput({ today: "2026-06-01", rollingBalanceSeed: -27.67 }));

    // No sessions this week: actual 0, delta -32, seeded rolling balance = -27.67 - 32
    expect(result!.currentWeek.rollingBalance).toBeCloseTo(-59.67);
  });

  it("effective-dating regression: a target change effective next week does not alter already-computed past weeks", () => {
    const before = buildWeeklyRecap(baseInput({ today: "2026-06-15" }));
    const pastWeekBalanceBefore = before!.weeks[0].rollingBalance;

    const after = buildWeeklyRecap(
      baseInput({
        today: "2026-06-15",
        weeklyTargetSettings: [
          { value: 32, effectiveDate: "2026-06-01" },
          { value: 40, effectiveDate: "2026-07-13" }, // future relative to the range above
        ],
      })
    );
    const pastWeekBalanceAfter = after!.weeks[0].rollingBalance;

    expect(pastWeekBalanceAfter).toBe(pastWeekBalanceBefore);
  });

  it("computes leave bank remaining per type", () => {
    const result = buildWeeklyRecap(
      baseInput({
        today: "2026-06-01",
        leaveBankEntries: [
          { leaveType: "paternity", totalHours: 64, effectiveDate: "2026-01-01" },
        ],
        allLeaveEntriesByType: {
          vacation: [],
          sick: [],
          paternity: [{ date: "2026-02-01", hours: 23.2 }],
        },
      })
    );

    expect(result!.leaveBankRemaining.paternity).toBeCloseTo(40.8);
    expect(result!.leaveBankRemaining.vacation).toBe(0);
  });
});
