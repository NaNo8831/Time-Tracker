import type { IsoDate } from "@/lib/types";
import { addDays } from "./dates";
import type { WeekSummary } from "./recap";

export interface PeriodSummary {
  periodStart: IsoDate;
  periodEnd: IsoDate; // last calendar day covered by the period
  actualHours: number;
  targetHours: number;
  delta: number;
  /** The rolling balance as of the end of this period (the last week's value — rolling balance is already cumulative). */
  rollingBalance: number;
  weeks: WeekSummary[];
}

/**
 * Groups already-computed weeks (oldest first, as returned by
 * buildWeeklyRecap) into chronological chunks of `weeksPerPeriod` weeks —
 * "two week chunks" by default. The final chunk may be shorter if the week
 * count doesn't divide evenly. This is a simple pairing of consecutive
 * tracked weeks, not aligned to any specific pay-period anchor date — that
 * remains a deferred idea (see planning/QUESTIONS.md).
 */
export function chunkWeeksIntoPeriods(
  weeks: WeekSummary[],
  weeksPerPeriod = 2
): PeriodSummary[] {
  const periods: PeriodSummary[] = [];

  for (let i = 0; i < weeks.length; i += weeksPerPeriod) {
    const chunk = weeks.slice(i, i + weeksPerPeriod);
    const periodStart = chunk[0].weekStart;
    const lastWeekStart = chunk[chunk.length - 1].weekStart;

    periods.push({
      periodStart,
      periodEnd: addDays(lastWeekStart, 6),
      actualHours: chunk.reduce((sum, week) => sum + week.actualHours, 0),
      targetHours: chunk.reduce((sum, week) => sum + week.targetHours, 0),
      delta: chunk.reduce((sum, week) => sum + week.delta, 0),
      rollingBalance: chunk[chunk.length - 1].rollingBalance,
      weeks: chunk,
    });
  }

  return periods;
}
