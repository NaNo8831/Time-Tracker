import type { IsoDate, LeaveType } from "@/lib/types";

export interface SessionRow {
  id: string;
  checkIn: string;
  checkOut: string;
}

export interface LeaveEntryRow {
  id: string;
  leaveType: LeaveType;
  hours: number;
}

export interface DayEntryDetail {
  id: string | null;
  date: IsoDate;
  breakMinutesOverride: number | null;
  sessions: SessionRow[];
  leaveEntries: LeaveEntryRow[];
}

export interface RawDayEntry {
  id: string;
  date: IsoDate;
  break_minutes_override: number | null;
}

/**
 * Assembles a day's detail from raw rows. Pure (no Supabase) so it can be
 * unit-tested. `dayEntry` is null for a date with no session/break record —
 * leave entries are keyed by date, not by day record, so they must still be
 * returned in that case (Sprint 006 bug: a leave-only day used to show an
 * empty, un-removable Leave list).
 */
export function buildDayEntryDetail(input: {
  date: IsoDate;
  dayEntry: RawDayEntry | null;
  sessions: { id: string; check_in: string; check_out: string }[];
  leaveEntries: { id: string; leave_type: LeaveType; hours: number }[];
}): DayEntryDetail {
  return {
    id: input.dayEntry?.id ?? null,
    date: input.date,
    breakMinutesOverride: input.dayEntry?.break_minutes_override ?? null,
    sessions: input.sessions.map((s) => ({
      id: s.id,
      checkIn: s.check_in,
      checkOut: s.check_out,
    })),
    leaveEntries: input.leaveEntries.map((l) => ({
      id: l.id,
      leaveType: l.leave_type,
      hours: l.hours,
    })),
  };
}
