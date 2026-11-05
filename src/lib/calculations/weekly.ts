import type { IsoDate } from "@/lib/types";

export interface DayWorkHours {
  date: IsoDate;
  workHours: number;
}

/** Rule 6: sum of Work Hours for each day in the week. */
export function weeklyActualHours(daysInWeek: DayWorkHours[]): number {
  return daysInWeek.reduce((total, day) => total + day.workHours, 0);
}

/**
 * Rule 7: Weekly Actual Hours minus the Weekly Target in effect on that
 * week's first day (a Saturday). A target change taking effect mid-week does
 * not apply until the following week (planning/DECISIONS.md, 2026-07-09,
 * week boundary updated 2026-11-05).
 */
export function weeklyDelta(
  weeklyActual: number,
  weeklyTargetHoursAtWeekStart: number
): number {
  return weeklyActual - weeklyTargetHoursAtWeekStart;
}

/**
 * Rule 8: the Rolling Balance Seed (0 if none is set) plus the cumulative
 * sum of Weekly Delta across all tracked weeks, in date order.
 */
export function rollingBalance(weeklyDeltasInOrder: number[], seed = 0): number[] {
  let running = seed;
  return weeklyDeltasInOrder.map((delta) => {
    running += delta;
    return running;
  });
}
