import { describe, expect, it } from "vitest";
import { toDateText, toNullableNumber, toNumber, toTimestampText } from "@/lib/dbNormalize";

// These pin the shapes the app has always received from the database (what
// Supabase's PostgREST returned), so the move to Neon cannot shift a displayed
// date, time, or hour total.

describe("toDateText", () => {
  it("passes a 'YYYY-MM-DD' string through unchanged", () => {
    expect(toDateText("2026-11-05")).toBe("2026-11-05");
  });

  it("trims a longer date string to the date part", () => {
    expect(toDateText("2026-11-05T00:00:00.000Z")).toBe("2026-11-05");
  });

  it("converts a Date using UTC (not local) components", () => {
    expect(toDateText(new Date(Date.UTC(2026, 0, 10)))).toBe("2026-01-10");
  });

  it("throws on anything that is not a date", () => {
    expect(() => toDateText("tomorrow")).toThrow();
    expect(() => toDateText(null)).toThrow();
    expect(() => toDateText(12345)).toThrow();
  });
});

describe("toTimestampText", () => {
  it("turns the UTC text Postgres returns into the ISO shape the app expects", () => {
    expect(toTimestampText("2026-01-10 07:00:00")).toBe("2026-01-10T07:00:00+00:00");
  });

  it("keeps characters 11-16 as HH:MM so the Daily Entry page shows 08:00 as 08:00", () => {
    const iso = toTimestampText("2026-07-14 08:00:00");
    expect(iso.slice(11, 16)).toBe("08:00");
    expect(toTimestampText("2026-07-14 16:30:00").slice(11, 16)).toBe("16:30");
  });

  it("handles offsets of +00 / +00:00 / Z and keeps fractional seconds", () => {
    expect(toTimestampText("2026-01-10 07:00:00+00")).toBe("2026-01-10T07:00:00+00:00");
    expect(toTimestampText("2026-01-10T07:00:00+00:00")).toBe("2026-01-10T07:00:00+00:00");
    expect(toTimestampText("2026-01-10T07:00:00Z")).toBe("2026-01-10T07:00:00+00:00");
    expect(toTimestampText("2026-01-10 07:00:00.123456")).toBe("2026-01-10T07:00:00.123456+00:00");
  });

  it("converts a Date to the same ISO shape", () => {
    expect(toTimestampText(new Date(Date.UTC(2026, 0, 10, 7, 0, 0)))).toBe("2026-01-10T07:00:00+00:00");
  });

  it("produces a string whose Date parse equals the UTC instant", () => {
    const iso = toTimestampText("2026-01-10 11:15:00");
    expect(new Date(iso).getTime()).toBe(Date.UTC(2026, 0, 10, 11, 15, 0));
  });

  it("rejects non-UTC offsets rather than silently shifting a time", () => {
    expect(() => toTimestampText("2026-01-10 07:00:00-05")).toThrow();
    expect(() => toTimestampText("not a time")).toThrow();
  });
});

describe("toNumber / toNullableNumber", () => {
  it("accepts numbers and numeric strings (Postgres numeric arrives as text)", () => {
    expect(toNumber(6.4)).toBe(6.4);
    expect(toNumber("6.4")).toBe(6.4);
    expect(toNumber("-12.12")).toBe(-12.12);
    expect(toNumber("8")).toBe(8);
  });

  it("throws on non-numeric values", () => {
    expect(() => toNumber("abc")).toThrow();
    expect(() => toNumber(null)).toThrow();
    expect(() => toNumber(undefined)).toThrow();
  });

  it("toNullableNumber keeps null/undefined as null", () => {
    expect(toNullableNumber(null)).toBeNull();
    expect(toNullableNumber(undefined)).toBeNull();
    expect(toNullableNumber("60")).toBe(60);
    expect(toNullableNumber(0)).toBe(0);
  });
});
