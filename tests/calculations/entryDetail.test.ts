import { describe, expect, it } from "vitest";
import { buildDayEntryDetail } from "@/lib/data/entryDetail";

describe("buildDayEntryDetail", () => {
  it("returns leave entries for a leave-only day with no day record (regression: Sprint 006 bug)", () => {
    const detail = buildDayEntryDetail({
      date: "2026-11-05",
      dayEntry: null,
      sessions: [],
      leaveEntries: [
        { id: "l1", leave_type: "vacation", hours: 8 },
        { id: "l2", leave_type: "vacation", hours: 8 },
      ],
    });

    expect(detail.id).toBeNull();
    expect(detail.sessions).toEqual([]);
    expect(detail.breakMinutesOverride).toBeNull();
    expect(detail.leaveEntries).toEqual([
      { id: "l1", leaveType: "vacation", hours: 8 },
      { id: "l2", leaveType: "vacation", hours: 8 },
    ]);
  });

  it("returns sessions, break override, and leave for a full day", () => {
    const detail = buildDayEntryDetail({
      date: "2026-07-14",
      dayEntry: { id: "d1", date: "2026-07-14", break_minutes_override: 30 },
      sessions: [{ id: "s1", check_in: "2026-07-14T08:00:00", check_out: "2026-07-14T14:15:00" }],
      leaveEntries: [{ id: "l1", leave_type: "sick", hours: 2 }],
    });

    expect(detail.id).toBe("d1");
    expect(detail.breakMinutesOverride).toBe(30);
    expect(detail.sessions).toEqual([
      { id: "s1", checkIn: "2026-07-14T08:00:00", checkOut: "2026-07-14T14:15:00" },
    ]);
    expect(detail.leaveEntries).toEqual([{ id: "l1", leaveType: "sick", hours: 2 }]);
  });

  it("returns the empty shape for a date with nothing logged", () => {
    const detail = buildDayEntryDetail({
      date: "2026-11-06",
      dayEntry: null,
      sessions: [],
      leaveEntries: [],
    });

    expect(detail).toEqual({
      id: null,
      date: "2026-11-06",
      breakMinutesOverride: null,
      sessions: [],
      leaveEntries: [],
    });
  });
});
