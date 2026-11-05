import { describe, expect, it } from "vitest";
import { weeksLeftInYear } from "@/lib/calculations/physicalYear";

describe("weeksLeftInYear", () => {
  it("returns null when no physical year record contains today", () => {
    expect(weeksLeftInYear([], "2026-07-09")).toBeNull();
    expect(
      weeksLeftInYear(
        [{ startDate: "2026-09-01", endDate: "2027-08-31" }],
        "2026-07-09"
      )
    ).toBeNull();
  });

  it("counts the current week as 1 remaining when today is in the final week", () => {
    // Year ends Fri 2026-07-10, the last day of today's Sat–Fri week (starting Sat 2026-07-04).
    const result = weeksLeftInYear(
      [{ startDate: "2026-01-01", endDate: "2026-07-10" }],
      "2026-07-09"
    );
    expect(result).toBe(1);
  });

  it("counts multiple full weeks remaining", () => {
    // today's week starts Sat 2026-07-04; the end date's week starts Sat 2026-07-18
    // (two weeks later) -> 3 weeks remaining inclusive.
    const result = weeksLeftInYear(
      [{ startDate: "2026-01-01", endDate: "2026-07-24" }],
      "2026-07-09"
    );
    expect(result).toBe(3);
  });

  it("picks the record whose range actually contains today when multiple exist", () => {
    const result = weeksLeftInYear(
      [
        { startDate: "2025-09-01", endDate: "2026-01-04" },
        { startDate: "2026-01-05", endDate: "2026-12-27" },
      ],
      "2026-07-09"
    );
    expect(result).not.toBeNull();
  });
});
