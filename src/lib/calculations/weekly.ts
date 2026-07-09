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
 * week's Monday. A target change taking effect mid-week does not apply
 * until the following Monday's week (planning/DECISIONS.md, 2026-07-09).
 */
export function weeklyDelta(
  weeklyActual: number,
  weeklyTargetHoursAtMonday: number
): number {
  return weeklyActual - weeklyTargetHoursAtMonday;
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

/**
 * Returns the ISO date of the Monday for the week containing `date`.
 * Used to look up the Weekly Target value that governs a whole week
 * (planning/DOMAIN.md Business Rule 4).
 */
export function mondayOf(date: IsoDate): IsoDate {
  const d = new Date(`${date}T00:00:00Z`);
  const day = d.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d.toISOString().slice(0, 10);
}
