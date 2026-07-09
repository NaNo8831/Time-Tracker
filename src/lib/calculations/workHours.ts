import type { IsoDate } from "@/lib/types";

export interface Session {
  checkIn: string; // ISO datetime
  checkOut: string; // ISO datetime
}

export interface LeaveHoursEntry {
  hours: number;
}

/** Rule 1: sum of (check_out - check_in) across all sessions for the day. */
export function rawHours(sessions: Session[]): number {
  return sessions.reduce((total, session) => {
    const ms =
      new Date(session.checkOut).getTime() - new Date(session.checkIn).getTime();
    return total + ms / (1000 * 60 * 60);
  }, 0);
}

/**
 * Rule 2: the per-day manual override if set (multiple of 15 minutes) —
 * applied regardless of whether the day has sessions, since an override is
 * a deliberate per-day choice. Otherwise, the break duration setting in
 * effect that date, but ONLY if the day has at least one session: a day
 * with no clocked time (a pure leave day, a holiday, or simply nothing
 * logged) never has a break to deduct, even if a default is in effect —
 * confirmed against real source-sheet data, where every ADJ-only day
 * (no session) shows Break Hours = 0. Applied once per day, independent of
 * session count.
 */
export function breakDeduction(
  breakMinutesOverride: number | null | undefined,
  breakDurationMinutesInEffect: number | undefined,
  hasSessions: boolean
): number {
  if (breakMinutesOverride !== null && breakMinutesOverride !== undefined) {
    return breakMinutesOverride / 60;
  }
  if (!hasSessions) return 0;
  return (breakDurationMinutesInEffect ?? 0) / 60;
}

/** Rule 3: sum of that date's leave_entries hours, across all types. */
export function leaveHours(entries: LeaveHoursEntry[]): number {
  return entries.reduce((total, entry) => total + entry.hours, 0);
}

/**
 * Rule 4: the standard workday hours setting in effect that date, if the
 * date is a saved holiday; otherwise 0.
 */
export function holidayCredit(
  isHoliday: boolean,
  standardWorkdayHoursInEffect: number | undefined
): number {
  if (!isHoliday) return 0;
  return standardWorkdayHoursInEffect ?? 0;
}

export interface WorkHoursInput {
  date: IsoDate;
  sessions: Session[];
  breakMinutesOverride: number | null | undefined;
  breakDurationMinutesInEffect: number | undefined;
  leaveEntries: LeaveHoursEntry[];
  isHoliday: boolean;
  standardWorkdayHoursInEffect: number | undefined;
}

/** Rule 5: Work Hours (day) = Raw Hours - Break Deduction + Leave Hours + Holiday Credit. */
export function workHours(input: WorkHoursInput): number {
  return (
    rawHours(input.sessions) -
    breakDeduction(
      input.breakMinutesOverride,
      input.breakDurationMinutesInEffect,
      input.sessions.length > 0
    ) +
    leaveHours(input.leaveEntries) +
    holidayCredit(input.isHoliday, input.standardWorkdayHoursInEffect)
  );
}
