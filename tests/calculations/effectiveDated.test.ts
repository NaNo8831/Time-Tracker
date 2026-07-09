import { describe, expect, it } from "vitest";
import { valueInEffect } from "@/lib/calculations/effectiveDated";

describe("valueInEffect", () => {
  it("returns the most recent entry on or before the date", () => {
    const entries = [
      { value: 32, effectiveDate: "2026-01-01" },
      { value: 40, effectiveDate: "2026-06-01" },
    ];

    expect(valueInEffect(entries, "2026-03-15")).toBe(32);
    expect(valueInEffect(entries, "2026-06-01")).toBe(40);
    expect(valueInEffect(entries, "2026-12-31")).toBe(40);
  });

  it("returns undefined when no entry is effective yet", () => {
    const entries = [{ value: 32, effectiveDate: "2026-06-01" }];
    expect(valueInEffect(entries, "2026-01-01")).toBeUndefined();
  });

  it("never applies a future entry retroactively (the core effective-dating regression case)", () => {
    const before = [{ value: 32, effectiveDate: "2026-01-01" }];
    const pastDateResultBefore = valueInEffect(before, "2026-03-01");

    // Simulate adding a new dated entry effective "next Monday" — a future date.
    const after = [...before, { value: 40, effectiveDate: "2026-07-13" }];
    const pastDateResultAfter = valueInEffect(after, "2026-03-01");

    expect(pastDateResultAfter).toBe(pastDateResultBefore);
    expect(pastDateResultAfter).toBe(32);
  });
});
