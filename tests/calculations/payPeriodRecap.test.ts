import { describe, expect, it } from "vitest";
import { buildPayPeriodRecap } from "@/lib/calculations/payPeriodRecap";
import type { RecapInput } from "@/lib/calculations/recap";

function baseInput(overrides: Partial<RecapInput> = {}): RecapInput {
  return {
    today: "2026-06-01", // Monday, ISO week 23 (odd) -> Week 1 of its period
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

describe("buildPayPeriodRecap", () => {
  it("returns week1 and week2 with rollingBalance as of week2's end", () => {
    const sessionsByDate = new Map([
      ["2026-06-01", [{ checkIn: "2026-06-01T08:00:00Z", checkOut: "2026-06-01T16:00:00Z" }]],
    ]);
    const result = buildPayPeriodRecap(baseInput({ sessionsByDate }), "2026-06-01");

    expect(result).not.toBeNull();
    expect(result!.week1.weekStart).toBe("2026-06-01");
    expect(result!.week2.weekStart).toBe("2026-06-08");
    expect(result!.week1.actualHours).toBeCloseTo(7.5);
    expect(result!.week2.actualHours).toBe(0); // week 2 hasn't happened yet (today is 2026-06-01)
    expect(result!.rollingBalance).toBe(result!.week2.rollingBalance);
  });

  it("still returns both weeks when the requested period is entirely in the past", () => {
    const result = buildPayPeriodRecap(baseInput({ today: "2026-07-09" }), "2026-06-01");

    expect(result).not.toBeNull();
    expect(result!.week1.weekStart).toBe("2026-06-01");
    expect(result!.week2.weekStart).toBe("2026-06-08");
  });

  it("returns null when the period starts before any tracked history", () => {
    const result = buildPayPeriodRecap(baseInput(), "2026-01-05");
    expect(result).toBeNull();
  });

  it("does not let the extension leak into a second, unrelated call using the same input", () => {
    // Calling buildPayPeriodRecap for a future period should not change what
    // a plain, unextended buildWeeklyRecap-based check (e.g. History tab)
    // would compute for the same input.
    const input = baseInput({ today: "2026-06-01" });
    buildPayPeriodRecap(input, "2026-06-01"); // extends through 2026-06-08 internally
    const plain = buildPayPeriodRecap(input, "2026-06-01");
    expect(plain!.week2.actualHours).toBe(0);
  });
});
