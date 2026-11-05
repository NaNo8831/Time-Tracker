import type { IsoDate } from "@/lib/types";
import { addDays } from "./dates";

/**
 * First day (a Saturday) of the pay cycle the user's pay stubs are anchored
 * to. It is the first day of the user's original sheet, and the stub periods
 * (Sep 19, Oct 3, Oct 17 2026 ...) are all a multiple of 14 days after it.
 * A fixed, documented constant — not a setting (planning/DECISIONS.md,
 * 2026-11-05).
 */
export const PAY_CYCLE_ANCHOR: IsoDate = "2026-01-10";

const MS_PER_DAY = 86400000;

function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round(
    (new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) /
      MS_PER_DAY
  );
}

/** The Saturday that starts the Saturday–Friday pay week containing `date`. */
export function payWeekStart(date: IsoDate): IsoDate {
  const weeks = Math.floor(daysBetween(PAY_CYCLE_ANCHOR, date) / 7);
  return addDays(PAY_CYCLE_ANCHOR, weeks * 7);
}

/** The Saturday that starts the 14-day pay period containing `date` (Week 1's start). */
export function payPeriodStart(date: IsoDate): IsoDate {
  const periods = Math.floor(daysBetween(PAY_CYCLE_ANCHOR, date) / 14);
  return addDays(PAY_CYCLE_ANCHOR, periods * 14);
}
