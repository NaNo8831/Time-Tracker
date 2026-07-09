import { describe, expect, it } from "vitest";
import { chunkWeeksIntoPeriods } from "@/lib/calculations/periods";
import type { WeekSummary } from "@/lib/calculations/recap";

function week(weekStart: string, actualHours: number, targetHours: number, rollingBalance: number): WeekSummary {
  return { weekStart, actualHours, targetHours, delta: actualHours - targetHours, rollingBalance };
}

describe("chunkWeeksIntoPeriods", () => {
  it("pairs weeks two at a time, oldest first", () => {
    const weeks = [
      week("2026-06-01", 32, 32, 0),
      week("2026-06-08", 30, 32, -2),
      week("2026-06-15", 32, 32, -2),
      week("2026-06-22", 34, 32, 0),
    ];

    const periods = chunkWeeksIntoPeriods(weeks);

    expect(periods).toHaveLength(2);
    expect(periods[0].periodStart).toBe("2026-06-01");
    expect(periods[0].periodEnd).toBe("2026-06-14"); // last day of the 2nd week in the chunk
    expect(periods[0].actualHours).toBe(62);
    expect(periods[0].targetHours).toBe(64);
    expect(periods[0].delta).toBe(-2);
    expect(periods[0].rollingBalance).toBe(-2); // the 2nd week's rolling balance, not summed

    expect(periods[1].periodStart).toBe("2026-06-15");
    expect(periods[1].actualHours).toBe(66);
    expect(periods[1].rollingBalance).toBe(0);
  });

  it("leaves a trailing odd week as its own shorter period", () => {
    const weeks = [week("2026-06-01", 32, 32, 0), week("2026-06-08", 30, 32, -2)];

    const periods = chunkWeeksIntoPeriods(weeks);

    expect(periods).toHaveLength(1);
    expect(periods[0].weeks).toHaveLength(2);

    const oddWeeks = [...weeks, week("2026-06-15", 32, 32, -2)];
    const oddPeriods = chunkWeeksIntoPeriods(oddWeeks);
    expect(oddPeriods).toHaveLength(2);
    expect(oddPeriods[1].weeks).toHaveLength(1);
    expect(oddPeriods[1].periodEnd).toBe("2026-06-21");
  });

  it("returns an empty array for no weeks", () => {
    expect(chunkWeeksIntoPeriods([])).toEqual([]);
  });
});
