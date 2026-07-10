import { describe, expect, it } from "vitest";
import { isoWeekNumber, payPeriodWeek1Start } from "@/lib/calculations/isoWeek";

describe("isoWeekNumber", () => {
  it("matches verified reference dates (planning/DECISIONS.md)", () => {
    expect(isoWeekNumber("2026-01-12")).toBe(3);
    expect(isoWeekNumber("2026-04-27")).toBe(18);
    expect(isoWeekNumber("2026-05-04")).toBe(19);
  });

  it("returns week 1 for the week containing the year's first Thursday", () => {
    // 2026-01-01 is a Thursday, so it's in ISO week 1 of 2026.
    expect(isoWeekNumber("2026-01-01")).toBe(1);
  });

  it("is stable across an entire Monday-Sunday week", () => {
    const week = isoWeekNumber("2026-04-27"); // Monday
    for (let i = 0; i < 7; i++) {
      const d = new Date("2026-04-27T00:00:00Z");
      d.setUTCDate(d.getUTCDate() + i);
      expect(isoWeekNumber(d.toISOString().slice(0, 10))).toBe(week);
    }
  });
});

describe("payPeriodWeek1Start", () => {
  it("returns the same Monday when that week is odd (Week 1 itself)", () => {
    // 2026-01-12 is ISO week 3 (odd).
    expect(payPeriodWeek1Start("2026-01-12")).toBe("2026-01-12");
    expect(payPeriodWeek1Start("2026-01-15")).toBe("2026-01-12"); // mid-week, same period
  });

  it("returns the prior Monday when that week is even (Week 2)", () => {
    // 2026-01-19 is ISO week 4 (even) -> Week 1 is the prior Monday, 2026-01-12.
    expect(payPeriodWeek1Start("2026-01-19")).toBe("2026-01-12");
  });

  it("matches the verified 2026-04-27/2026-05-04 boundary", () => {
    // 2026-04-20 = week 17 (odd, Week 1). 2026-04-27 = week 18 (even, Week 2 of the same period).
    expect(payPeriodWeek1Start("2026-04-20")).toBe("2026-04-20");
    expect(payPeriodWeek1Start("2026-04-27")).toBe("2026-04-20");
    // 2026-05-04 = week 19 (odd) -> a new period starts here.
    expect(payPeriodWeek1Start("2026-05-04")).toBe("2026-05-04");
  });
});
