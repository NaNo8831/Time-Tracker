import type { IsoDate } from "@/lib/types";
import { mondayOf } from "./weekly";

export interface PhysicalYearRange {
  startDate: IsoDate;
  endDate: IsoDate;
}

/**
 * Weeks Left in Year(date) = count of ISO weeks from date's week through
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

  const todayMonday = mondayOf(today);
  const endMonday = mondayOf(current.endDate);
  const weeks = Math.round(
    (new Date(`${endMonday}T00:00:00Z`).getTime() - new Date(`${todayMonday}T00:00:00Z`).getTime()) /
      (7 * 86400000)
  );
  return Math.max(weeks + 1, 0); // inclusive of the current week
}
