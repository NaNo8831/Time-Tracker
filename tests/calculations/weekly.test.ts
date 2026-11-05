import { describe, expect, it } from "vitest";
import { valueInEffect } from "@/lib/calculations/effectiveDated";
import { payWeekStart } from "@/lib/calculations/payCycle";
import {
  rollingBalance,
  weeklyActualHours,
  weeklyDelta,
} from "@/lib/calculations/weekly";

describe("weeklyActualHours / weeklyDelta / rollingBalance", () => {
  it("sums the week and computes delta against target", () => {
    const days = [
      { date: "2026-07-06", workHours: 8 },
      { date: "2026-07-07", workHours: 8 },
      { date: "2026-07-08", workHours: 8 },
      { date: "2026-07-09", workHours: 8 },
    ];

    const actual = weeklyActualHours(days);
    expect(actual).toBe(32);
    expect(weeklyDelta(actual, 32)).toBe(0);
    expect(weeklyDelta(actual, 40)).toBe(-8);
  });

  it("carries the rolling balance forward across weeks", () => {
    const deltas = [-32, -32, 16];
    expect(rollingBalance(deltas)).toEqual([-32, -64, -48]);
  });

  it("starts from a seed value when one is provided", () => {
    const deltas = [0.75, -0.5];
    expect(rollingBalance(deltas, -27.67)).toEqual([-26.92, -27.42]);
  });

  it("defaults the seed to 0 when omitted, matching pre-seed behavior", () => {
    expect(rollingBalance([-32], 0)).toEqual(rollingBalance([-32]));
  });
});

describe("effective-dating regression: weekly target change mid-history", () => {
  it("a weekly target entry effective next week does not change a past week's delta", () => {
    const targetEntries = [{ value: 32, effectiveDate: "2026-01-01" }];
    const pastWeekStart = payWeekStart("2026-03-04"); // some past week
    const pastTargetBefore = valueInEffect(targetEntries, pastWeekStart);
    const pastDeltaBefore = weeklyDelta(30, pastTargetBefore!);

    // Add a new target entry effective next week (a future date relative
    // to the past week already computed above).
    const updatedEntries = [
      ...targetEntries,
      { value: 40, effectiveDate: "2026-07-11" },
    ];
    const pastTargetAfter = valueInEffect(updatedEntries, pastWeekStart);
    const pastDeltaAfter = weeklyDelta(30, pastTargetAfter!);

    expect(pastTargetAfter).toBe(pastTargetBefore);
    expect(pastDeltaAfter).toBe(pastDeltaBefore);
    expect(pastDeltaAfter).toBe(-2);
  });
});
