import type { IsoDate } from "@/lib/types";
import { addDays } from "./dates";
import { payPeriodWeek1Start } from "./isoWeek";
import type { WeekSummary } from "./recap";

export interface PeriodSummary {
  periodStart: IsoDate;
  periodEnd: IsoDate; // last calendar day covered by the period
  actualHours: number;
  targetHours: number;
  delta: number;
  /** The rolling balance as of the end of this period (Week 2's value — rolling balance is already cumulative). */
  rollingBalance: number;
  weeks: WeekSummary[];
}

/**
 * Groups already-computed weeks (oldest first, as returned by
 * buildWeeklyRecap) into Pay Periods using the ISO odd/even week rule
 * (planning/DOMAIN.md Business Rule 14), NOT chronological pairing since
 * tracking began. A period at either end of the tracked range may have
 * only one week if the corresponding partner week falls outside what's
 * been computed — that's expected, not a bug.
 */
export function groupWeeksIntoPayPeriods(weeks: WeekSummary[]): PeriodSummary[] {
  const byPeriodStart = new Map<IsoDate, WeekSummary[]>();

  for (const week of weeks) {
    const periodStart = payPeriodWeek1Start(week.weekStart);
    const bucket = byPeriodStart.get(periodStart) ?? [];
    bucket.push(week);
    byPeriodStart.set(periodStart, bucket);
  }

  return [...byPeriodStart.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([periodStart, periodWeeks]) => {
      const lastWeekStart = periodWeeks[periodWeeks.length - 1].weekStart;
      return {
        periodStart,
        periodEnd: addDays(lastWeekStart, 6),
        actualHours: periodWeeks.reduce((sum, week) => sum + week.actualHours, 0),
        targetHours: periodWeeks.reduce((sum, week) => sum + week.targetHours, 0),
        delta: periodWeeks.reduce((sum, week) => sum + week.delta, 0),
        rollingBalance: periodWeeks[periodWeeks.length - 1].rollingBalance,
        weeks: periodWeeks,
      };
    });
}
