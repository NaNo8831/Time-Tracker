import type { IsoDate, LeaveType } from "@/lib/types";
import { breakDeduction, holidayCredit, rawHours, workHours, type Session } from "./workHours";

export interface DailyBreakdownInput {
  date: IsoDate;
  sessions: Session[];
  breakMinutesOverride: number | null | undefined;
  breakDurationMinutesInEffect: number | undefined;
  leaveEntries: { leaveType: LeaveType; hours: number }[];
  isHoliday: boolean;
  standardWorkdayHoursInEffect: number | undefined;
}

export interface DailyBreakdownRow {
  date: IsoDate;
  rawHours: number;
  breakHours: number;
  leaveHoursByType: Record<LeaveType, number>;
  totalLeaveHours: number;
  holidayCredit: number;
  /** Leave (vacation + sick + paternity) plus Holiday Credit — the "Other" column. */
  othersTotal: number;
  /**
   * Raw - Break + Others (Leave + Holiday Credit). This is exactly the
   * locked Work Hours business rule (planning/DOMAIN.md Rule 5), computed
   * via the same workHours() function the weekly recap uses, so the two
   * views can never disagree.
   */
  paidHours: number;
}

const LEAVE_TYPES: LeaveType[] = ["vacation", "sick", "paternity"];

export interface WeekActualSplit {
  throughTodayHours: number;
  laterThisWeekHours: number;
  laterThisWeekByType: Record<LeaveType, number>;
}

/**
 * Splits a week's daily rows into "through today" and "later this week"
 * (date > today) totals, for the Pay Period Recap's "Actual" hover tooltip.
 * Purely presentational — both segments are real, already-logged hours
 * (planning/DOMAIN.md Rule 6); this does not change what Actual/Delta mean,
 * it just explains where a week's total comes from.
 */
export function splitWeekActual(rows: DailyBreakdownRow[], today: IsoDate): WeekActualSplit {
  let throughTodayHours = 0;
  let laterThisWeekHours = 0;
  const laterThisWeekByType = { vacation: 0, sick: 0, paternity: 0 } as Record<LeaveType, number>;

  for (const row of rows) {
    if (row.date <= today) {
      throughTodayHours += row.paidHours;
    } else {
      laterThisWeekHours += row.paidHours;
      for (const type of LEAVE_TYPES) {
        laterThisWeekByType[type] += row.leaveHoursByType[type];
      }
    }
  }

  return { throughTodayHours, laterThisWeekHours, laterThisWeekByType };
}

/**
 * A single day's breakdown for display (2-week history view): raw hours,
 * break hours, leave hours split by type, and holiday credit. Reuses the
 * same primitives as the weekly calculation engine (planning/DOMAIN.md
 * Business Rules 1-5) so the two views can never disagree with each other.
 */
export function dailyBreakdown(input: DailyBreakdownInput): DailyBreakdownRow {
  const leaveHoursByType = { vacation: 0, sick: 0, paternity: 0 } as Record<LeaveType, number>;
  for (const entry of input.leaveEntries) {
    leaveHoursByType[entry.leaveType] += entry.hours;
  }
  for (const type of LEAVE_TYPES) {
    leaveHoursByType[type] = leaveHoursByType[type] ?? 0;
  }

  const totalLeaveHours = LEAVE_TYPES.reduce((sum, type) => sum + leaveHoursByType[type], 0);
  const raw = rawHours(input.sessions);
  const breakHours = breakDeduction(
    input.breakMinutesOverride,
    input.breakDurationMinutesInEffect,
    input.sessions.length > 0
  );
  const credit = holidayCredit(input.isHoliday, input.standardWorkdayHoursInEffect);

  return {
    date: input.date,
    rawHours: raw,
    breakHours,
    leaveHoursByType,
    totalLeaveHours,
    holidayCredit: credit,
    othersTotal: totalLeaveHours + credit,
    paidHours: workHours({
      date: input.date,
      sessions: input.sessions,
      breakMinutesOverride: input.breakMinutesOverride,
      breakDurationMinutesInEffect: input.breakDurationMinutesInEffect,
      leaveEntries: input.leaveEntries,
      isHoliday: input.isHoliday,
      standardWorkdayHoursInEffect: input.standardWorkdayHoursInEffect,
    }),
  };
}
