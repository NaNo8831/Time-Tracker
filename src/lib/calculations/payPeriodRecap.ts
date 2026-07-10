import type { IsoDate, LeaveType } from "@/lib/types";
import { addDays } from "./dates";
import { buildWeeklyRecap, type RecapInput, type WeekSummary } from "./recap";

export interface PayPeriodRecapResult {
  week1: WeekSummary;
  week2: WeekSummary;
  /**
   * Rolling Balance as of the end of the most recently FULLY COMPLETED
   * week — never the in-progress current week. A week that's only
   * partially worked always shows a large negative delta (actual so far
   * vs. the full-week target), which would otherwise drag the displayed
   * balance down based on days that haven't happened yet. Falls back to
   * the raw seed if even the first tracked week is still in progress.
   */
  rollingBalance: number;
  leaveBankRemaining: Record<LeaveType, number>;
}

/**
 * Builds the Week 1 + Week 2 summary for the pay period starting at
 * `week1Start` (must already be a valid period start — see
 * isoWeek.ts's payPeriodWeek1Start). Extends the underlying weekly
 * computation through Week 2 even if it's still in the future, so a
 * currently-in-progress period always has both weeks to display.
 * Returns null if the period starts before any tracked history exists.
 */
export function buildPayPeriodRecap(
  recapInput: RecapInput,
  week1Start: IsoDate
): PayPeriodRecapResult | null {
  const week2Start = addDays(week1Start, 7);
  const recap = buildWeeklyRecap(recapInput, { extendThroughWeek: week2Start });
  if (!recap) return null;

  const week1Index = recap.weeks.findIndex((w) => w.weekStart === week1Start);
  const week1 = recap.weeks[week1Index];
  const week2 = recap.weeks.find((w) => w.weekStart === week2Start);
  if (!week1 || !week2) return null;

  const today = recapInput.today;
  const week2Complete = addDays(week2.weekStart, 6) < today;
  const week1Complete = addDays(week1.weekStart, 6) < today;

  let rollingBalance: number;
  if (week2Complete) {
    rollingBalance = week2.rollingBalance;
  } else if (week1Complete) {
    rollingBalance = week1.rollingBalance;
  } else {
    const priorWeek = week1Index > 0 ? recap.weeks[week1Index - 1] : undefined;
    rollingBalance = priorWeek ? priorWeek.rollingBalance : recapInput.rollingBalanceSeed;
  }

  return {
    week1,
    week2,
    rollingBalance,
    leaveBankRemaining: recap.leaveBankRemaining,
  };
}
