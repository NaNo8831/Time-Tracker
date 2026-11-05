import type { IsoDate } from "@/lib/types";
import { payWeekStart } from "./payCycle";

export interface PhysicalYearRange {
  startDate: IsoDate;
  endDate: IsoDate;
}

/**
 * Weeks Left in Year(date) = count of Saturday–Friday weeks from date's week through
 * the end date's week of whichever physical_year_settings record has
 * start_date <= date <= end_date (Business Rule 16). Returns null if no
 * record matches — the caller should show a "not set" state, not an error.
 */
export function weeksLeftInYear(
  years: PhysicalYearRange[],
  today: IsoDate
): number | null {
  const current = years.find((y) => y.startDate <= today && today <= y.endDate);
  if (!current) return null;

  const todayWeekStart = payWeekStart(today);
  const endWeekStart = payWeekStart(current.endDate);
  const weeks = Math.round(
    (new Date(`${endWeekStart}T00:00:00Z`).getTime() - new Date(`${todayWeekStart}T00:00:00Z`).getTime()) /
      (7 * 86400000)
  );
  return Math.max(weeks + 1, 0); // inclusive of the current week
}
