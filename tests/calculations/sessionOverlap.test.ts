import { describe, expect, it } from "vitest";
import { findOverlappingSession, sessionsOverlap } from "@/lib/calculations/sessionOverlap";

describe("sessionsOverlap", () => {
  it("detects an exact duplicate as overlapping", () => {
    const a = { checkIn: "2026-07-09T08:00:00", checkOut: "2026-07-09T12:00:00" };
    expect(sessionsOverlap(a, { ...a })).toBe(true);
  });

  it("detects a partial overlap", () => {
    const a = { checkIn: "2026-07-09T08:00:00", checkOut: "2026-07-09T12:00:00" };
    const b = { checkIn: "2026-07-09T11:00:00", checkOut: "2026-07-09T14:00:00" };
    expect(sessionsOverlap(a, b)).toBe(true);
  });

  it("detects one interval fully containing another as overlapping", () => {
    const a = { checkIn: "2026-07-09T08:00:00", checkOut: "2026-07-09T16:00:00" };
    const b = { checkIn: "2026-07-09T10:00:00", checkOut: "2026-07-09T11:00:00" };
    expect(sessionsOverlap(a, b)).toBe(true);
  });

  it("does not flag back-to-back sessions that touch at the boundary", () => {
    const a = { checkIn: "2026-07-09T08:00:00", checkOut: "2026-07-09T12:00:00" };
    const b = { checkIn: "2026-07-09T12:00:00", checkOut: "2026-07-09T14:00:00" };
    expect(sessionsOverlap(a, b)).toBe(false);
  });

  it("does not flag genuinely separate sessions", () => {
    const a = { checkIn: "2026-07-09T08:00:00", checkOut: "2026-07-09T12:00:00" };
    const b = { checkIn: "2026-07-09T18:00:00", checkOut: "2026-07-09T22:00:00" };
    expect(sessionsOverlap(a, b)).toBe(false);
  });
});

describe("findOverlappingSession", () => {
  it("returns the conflicting session when one exists among several", () => {
    const candidate = { checkIn: "2026-07-09T11:00:00", checkOut: "2026-07-09T13:00:00" };
    const existing = [
      { checkIn: "2026-07-09T06:00:00", checkOut: "2026-07-09T08:00:00" },
      { checkIn: "2026-07-09T10:00:00", checkOut: "2026-07-09T12:00:00" },
    ];
    expect(findOverlappingSession(candidate, existing)).toEqual(existing[1]);
  });

  it("returns undefined when nothing conflicts", () => {
    const candidate = { checkIn: "2026-07-09T13:00:00", checkOut: "2026-07-09T14:00:00" };
    const existing = [{ checkIn: "2026-07-09T06:00:00", checkOut: "2026-07-09T08:00:00" }];
    expect(findOverlappingSession(candidate, existing)).toBeUndefined();
  });
});
