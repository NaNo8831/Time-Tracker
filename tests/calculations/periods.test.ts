import { describe, expect, it } from "vitest";
import { groupWeeksIntoPayPeriods } from "@/lib/calculations/periods";
import type { WeekSummary } from "@/lib/calculations/recap";

function week(weekStart: string, actualHours: number, targetHours: number, rollingBalance: number): WeekSummary {
  return { weekStart, actualHours, targetHours, delta: actualHours - targetHours, rollingBalance };
}

describe("groupWeeksIntoPayPeriods", () => {
  it("pairs Sat–Fri weeks into fixed 14-day periods, oldest first", () => {
    // Pay periods start every 14 days from Sat 2026-01-10: 2026-05-30 and
    // 2026-06-13 are period starts, so 05-30 + 06-06 form one period and
    // 06-13 + 06-20 the next.
    const weeks = [
      week("2026-05-30", 32, 32, 0),
      week("2026-06-06", 30, 32, -2),
      week("2026-06-13", 32, 32, -2),
      week("2026-06-20", 34, 32, 0),
    ];

    const periods = groupWeeksIntoPayPeriods(weeks);

    expect(periods).toHaveLength(2);
    expect(periods[0].periodStart).toBe("2026-05-30");
    expect(periods[0].periodEnd).toBe("2026-06-12");
    expect(periods[0].actualHours).toBe(62);
    expect(periods[0].targetHours).toBe(64);
    expect(periods[0].delta).toBe(-2);
    expect(periods[0].rollingBalance).toBe(-2); // week 2's rolling balance, not summed

    expect(periods[1].periodStart).toBe("2026-06-13");
    expect(periods[1].actualHours).toBe(66);
    expect(periods[1].rollingBalance).toBe(0);
  });

  it("matches the user's real stub periods", () => {
    const weeks = [
      week("2026-09-19", 32, 32, 0),
      week("2026-09-26", 32, 32, 0),
      week("2026-10-03", 32, 32, 0),
      week("2026-10-10", 32, 32, 0),
      week("2026-10-17", 32, 32, 0),
      week("2026-10-24", 32, 32, 0),
    ];

    const periods = groupWeeksIntoPayPeriods(weeks);

    expect(periods.map((p) => [p.periodStart, p.periodEnd])).toEqual([
      ["2026-09-19", "2026-10-02"],
      ["2026-10-03", "2026-10-16"],
      ["2026-10-17", "2026-10-30"],
    ]);
  });

  it("gives a lone Week 2 its own period when its Week 1 isn't in the input", () => {
    // 2026-06-06 is the second week of the period starting 2026-05-30.
    const weeks = [week("2026-06-06", 30, 32, -2)];

    const periods = groupWeeksIntoPayPeriods(weeks);

    expect(periods).toHaveLength(1);
    expect(periods[0].periodStart).toBe("2026-05-30");
    expect(periods[0].weeks).toHaveLength(1);
    expect(periods[0].weeks[0].weekStart).toBe("2026-06-06");
  });

  it("gives a lone Week 1 its own period when Week 2 hasn't happened yet", () => {
    const weeks = [week("2026-06-13", 32, 32, -2)];

    const periods = groupWeeksIntoPayPeriods(weeks);

    expect(periods).toHaveLength(1);
    expect(periods[0].periodStart).toBe("2026-06-13");
    expect(periods[0].weeks).toHaveLength(1);
  });

  it("returns an empty array for no weeks", () => {
    expect(groupWeeksIntoPayPeriods([])).toEqual([]);
  });
});
