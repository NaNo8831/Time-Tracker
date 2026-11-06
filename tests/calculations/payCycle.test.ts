import { describe, expect, it } from "vitest";
import { PAY_CYCLE_ANCHOR, payPeriodStart, payWeekStart, periodNav, resolvePeriodStart } from "@/lib/calculations/payCycle";

describe("resolvePeriodStart (the Recap's ?period= value)", () => {
  const today = "2026-11-05"; // inside the period starting 2026-10-31

  it("returns a valid period start unchanged — what Prev/Next and History links pass", () => {
    expect(resolvePeriodStart("2026-10-17", today)).toBe("2026-10-17");
    expect(resolvePeriodStart("2026-10-03", today)).toBe("2026-10-03");
    expect(resolvePeriodStart("2026-11-14", today)).toBe("2026-11-14");
  });

  it("snaps any other valid date, including old Monday-based links, to its period start", () => {
    expect(resolvePeriodStart("2026-10-20", today)).toBe("2026-10-17"); // a Tuesday
    expect(resolvePeriodStart("2026-10-12", today)).toBe("2026-10-03"); // a Monday
  });

  it("falls back to the current period for missing, malformed, or impossible values", () => {
    for (const bad of [undefined, "", "abc", "dddd-dd-dd", "2026-13-45", "2026-02-30", "26-10-17", "2026-10-17x"]) {
      expect(resolvePeriodStart(bad, today)).toBe("2026-10-31");
    }
  });
});

describe("payPeriodStart", () => {
  it("matches the user's real pay stub periods", () => {
    // Sep 19 – Oct 2, Oct 3 – Oct 16, Oct 17 – Oct 30 (2026)
    expect(payPeriodStart("2026-09-19")).toBe("2026-09-19");
    expect(payPeriodStart("2026-10-02")).toBe("2026-09-19");
    expect(payPeriodStart("2026-10-03")).toBe("2026-10-03");
    expect(payPeriodStart("2026-10-16")).toBe("2026-10-03");
    expect(payPeriodStart("2026-10-17")).toBe("2026-10-17");
    expect(payPeriodStart("2026-10-30")).toBe("2026-10-17");
  });

  it("rolls into the next period the day after a Friday period end", () => {
    expect(payPeriodStart("2026-10-31")).toBe("2026-10-31");
    expect(payPeriodStart("2026-11-05")).toBe("2026-10-31");
    expect(payPeriodStart("2026-11-13")).toBe("2026-10-31");
    expect(payPeriodStart("2026-11-14")).toBe("2026-11-14");
  });

  it("starts at the anchor and handles dates before it", () => {
    expect(PAY_CYCLE_ANCHOR).toBe("2026-01-10");
    expect(payPeriodStart("2026-01-10")).toBe("2026-01-10");
    expect(payPeriodStart("2026-01-09")).toBe("2025-12-27");
  });

  it("always returns a Saturday", () => {
    for (const date of ["2026-01-10", "2026-03-17", "2026-07-04", "2026-12-31", "2027-01-04", "2025-06-01"]) {
      expect(new Date(`${payPeriodStart(date)}T00:00:00Z`).getUTCDay()).toBe(6);
    }
  });
});

describe("payWeekStart", () => {
  it("returns the Saturday that starts the Sat–Fri week", () => {
    expect(payWeekStart("2026-10-02")).toBe("2026-09-26"); // Friday, Week 2 of the Sep 19 period
    expect(payWeekStart("2026-10-03")).toBe("2026-10-03"); // Saturday
    expect(payWeekStart("2026-11-05")).toBe("2026-10-31");
    expect(payWeekStart("2026-11-07")).toBe("2026-11-07");
  });

  it("handles dates before the anchor", () => {
    expect(payWeekStart("2026-01-09")).toBe("2026-01-03");
  });

  it("keeps the date inside the returned 7-day week", () => {
    const start = payWeekStart("2026-07-15");
    const dayOffset = (new Date("2026-07-15T00:00:00Z").getTime() - new Date(`${start}T00:00:00Z`).getTime()) / 86400000;
    expect(dayOffset).toBeGreaterThanOrEqual(0);
    expect(dayOffset).toBeLessThan(7);
  });
});

describe("periodNav (Prev / Today / Next on the Recap)", () => {
  const today = "2026-11-05"; // inside the period starting 2026-10-31

  it("marks the period containing today as current", () => {
    expect(periodNav("2026-10-31", today).isCurrent).toBe(true);
    // today anywhere in the period still points at the same period start
    expect(periodNav("2026-10-31", "2026-11-13").isCurrent).toBe(true);
    expect(periodNav("2026-10-31", "2026-10-31").isCurrent).toBe(true);
  });

  it("is not current for past or future periods", () => {
    expect(periodNav("2026-10-17", today).isCurrent).toBe(false);
    expect(periodNav("2026-01-10", today).isCurrent).toBe(false);
    expect(periodNav("2026-11-14", today).isCurrent).toBe(false);
  });

  it("gives Prev and Next as exactly 14 days either side", () => {
    expect(periodNav("2026-10-31", today)).toMatchObject({ prev: "2026-10-17", next: "2026-11-14" });
    expect(periodNav("2027-01-02", today)).toMatchObject({ prev: "2026-12-19", next: "2027-01-16" });
  });
});
