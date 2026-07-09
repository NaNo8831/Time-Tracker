import { describe, expect, it } from "vitest";
import { valueInEffect } from "@/lib/calculations/effectiveDated";
import {
  mondayOf,
  rollingBalance,
  weeklyActualHours,
  weeklyDelta,
} from "@/lib/calculations/weekly";

describe("mondayOf", () => {
  it("returns the same date when given a Monday", () => {
    expect(mondayOf("2026-07-06")).toBe("2026-07-06");
  });

  it("returns the prior Monday for a mid-week date", () => {
    expect(mondayOf("2026-07-09")).toBe("2026-07-06"); // Thursday
  });

  it("handles Sunday correctly (rolls back to the same week's Monday)", () => {
    expect(mondayOf("2026-07-12")).toBe("2026-07-06");
  });
});

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
  it("a weekly target entry effective next Monday does not change a past week's delta", () => {
    const targetEntries = [{ value: 32, effectiveDate: "2026-01-01" }];
    const pastWeekMonday = mondayOf("2026-03-04"); // some past week
    const pastTargetBefore = valueInEffect(targetEntries, pastWeekMonday);
    const pastDeltaBefore = weeklyDelta(30, pastTargetBefore!);

    // Add a new target entry effective "next Monday" (a future date relative
    // to the past week already computed above).
    const updatedEntries = [
      ...targetEntries,
      { value: 40, effectiveDate: "2026-07-13" },
    ];
    const pastTargetAfter = valueInEffect(updatedEntries, pastWeekMonday);
    const pastDeltaAfter = weeklyDelta(30, pastTargetAfter!);

    expect(pastTargetAfter).toBe(pastTargetBefore);
    expect(pastDeltaAfter).toBe(pastDeltaBefore);
    expect(pastDeltaAfter).toBe(-2);
  });
});
