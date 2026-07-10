import { describe, expect, it } from "vitest";
import { groupWeeksIntoPayPeriods } from "@/lib/calculations/periods";
import type { WeekSummary } from "@/lib/calculations/recap";

function week(weekStart: string, actualHours: number, targetHours: number, rollingBalance: number): WeekSummary {
  return { weekStart, actualHours, targetHours, delta: actualHours - targetHours, rollingBalance };
}

describe("groupWeeksIntoPayPeriods", () => {
  it("pairs weeks by ISO odd/even parity, oldest first", () => {
    // 2026-06-01 = ISO week 23 (odd, Week 1); 2026-06-08 = week 24 (even, Week 2).
    // 2026-06-15 = week 25 (odd, Week 1 of the next period); 2026-06-22 = week 26 (even).
    const weeks = [
      week("2026-06-01", 32, 32, 0),
      week("2026-06-08", 30, 32, -2),
      week("2026-06-15", 32, 32, -2),
      week("2026-06-22", 34, 32, 0),
    ];

    const periods = groupWeeksIntoPayPeriods(weeks);

    expect(periods).toHaveLength(2);
    expect(periods[0].periodStart).toBe("2026-06-01");
    expect(periods[0].periodEnd).toBe("2026-06-14");
    expect(periods[0].actualHours).toBe(62);
    expect(periods[0].targetHours).toBe(64);
    expect(periods[0].delta).toBe(-2);
    expect(periods[0].rollingBalance).toBe(-2); // week 2's rolling balance, not summed

    expect(periods[1].periodStart).toBe("2026-06-15");
    expect(periods[1].actualHours).toBe(66);
    expect(periods[1].rollingBalance).toBe(0);
  });

  it("gives a lone even (Week 2) week its own period when its Week 1 isn't in the input", () => {
    // 2026-06-08 (week 24, even) is Week 2 of the period starting 2026-06-01,
    // but that Week 1 isn't present here (e.g. it's before tracked history).
    const weeks = [week("2026-06-08", 30, 32, -2)];

    const periods = groupWeeksIntoPayPeriods(weeks);

    expect(periods).toHaveLength(1);
    expect(periods[0].periodStart).toBe("2026-06-01");
    expect(periods[0].weeks).toHaveLength(1);
    expect(periods[0].weeks[0].weekStart).toBe("2026-06-08");
  });

  it("gives a lone odd (Week 1) week its own period when Week 2 hasn't happened yet", () => {
    const weeks = [week("2026-06-15", 32, 32, -2)];

    const periods = groupWeeksIntoPayPeriods(weeks);

    expect(periods).toHaveLength(1);
    expect(periods[0].periodStart).toBe("2026-06-15");
    expect(periods[0].weeks).toHaveLength(1);
  });

  it("returns an empty array for no weeks", () => {
    expect(groupWeeksIntoPayPeriods([])).toEqual([]);
  });
});
