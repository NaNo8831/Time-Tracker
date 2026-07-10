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
  it("rollingBalance is week2's value once both weeks of the period are fully complete", () => {
    const result = buildPayPeriodRecap(baseInput({ today: "2026-07-09" }), "2026-06-01");

    expect(result).not.toBeNull();
    expect(result!.week1.weekStart).toBe("2026-06-01");
    expect(result!.week2.weekStart).toBe("2026-06-08");
    expect(result!.rollingBalance).toBe(result!.week2.rollingBalance);
    // No sessions logged anywhere: both weeks miss target by -32.
    expect(result!.rollingBalance).toBeCloseTo(-64);
  });

  it("rollingBalance falls back to week1 when week2 is still in progress (today is in week2)", () => {
    // today = 2026-06-10 (Wed of week2, 2026-06-08 - 06-14) -> week2 not yet complete.
    const result = buildPayPeriodRecap(baseInput({ today: "2026-06-10" }), "2026-06-01");

    expect(result).not.toBeNull();
    expect(result!.rollingBalance).toBe(result!.week1.rollingBalance);
    expect(result!.rollingBalance).not.toBe(result!.week2.rollingBalance);
    expect(result!.rollingBalance).toBeCloseTo(-32); // only week1's full miss counted
  });

  it("rollingBalance falls back to the seed when week1 itself is still in progress and is the first tracked week", () => {
    // today = 2026-06-01, the first day of the first tracked week -> nothing completed yet.
    const sessionsByDate = new Map([
      ["2026-06-01", [{ checkIn: "2026-06-01T08:00:00Z", checkOut: "2026-06-01T16:00:00Z" }]],
    ]);
    const result = buildPayPeriodRecap(
      baseInput({ sessionsByDate, rollingBalanceSeed: -7.87 }),
      "2026-06-01"
    );

    expect(result).not.toBeNull();
    expect(result!.week1.actualHours).toBeCloseTo(7.5); // partial week, not yet complete
    expect(result!.rollingBalance).toBe(-7.87); // the raw seed, not week1's partial balance
  });

  it("rollingBalance uses the prior completed week when week1 is in progress but isn't the first tracked week", () => {
    // Two prior fully-complete weeks (2026-05-18, 2026-05-25), then week1
    // (2026-06-01) still in progress as of today.
    const result = buildPayPeriodRecap(
      baseInput({
        today: "2026-06-01",
        weeklyTargetSettings: [{ value: 32, effectiveDate: "2026-05-18" }],
      }),
      "2026-06-01"
    );

    expect(result).not.toBeNull();
    // Prior week (2026-05-25 - 05-31) is fully complete with no sessions: -32 delta twice = -64.
    expect(result!.rollingBalance).toBeCloseTo(-64);
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
