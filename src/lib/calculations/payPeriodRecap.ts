import type { IsoDate, LeaveType } from "@/lib/types";
import { addDays } from "./dates";
import { buildWeeklyRecap, type RecapInput, type WeekSummary } from "./recap";

export interface PayPeriodRecapResult {
  week1: WeekSummary;
  week2: WeekSummary;
  /** Rolling Balance as of the end of the period (Week 2's cumulative value). */
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

  const week1 = recap.weeks.find((w) => w.weekStart === week1Start);
  const week2 = recap.weeks.find((w) => w.weekStart === week2Start);
  if (!week1 || !week2) return null;

  return {
    week1,
    week2,
    rollingBalance: week2.rollingBalance,
    leaveBankRemaining: recap.leaveBankRemaining,
  };
}
