import type { IsoDate } from "@/lib/types";
import { addDays } from "./dates";
import { mondayOf } from "./weekly";

/**
 * The ISO 8601 week-of-year number for `date`. Week 1 is the week
 * containing the year's first Thursday; weeks run Monday-Sunday. This is a
 * fixed calendar standard — no external lookup, no employer-specific
 * anchor (planning/DECISIONS.md, 2026-07-09).
 */
export function isoWeekNumber(date: IsoDate): number {
  const d = new Date(`${date}T00:00:00Z`);
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstThursdayDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNum + 3);
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000));
}

/**
 * The Monday that starts "Week 1" of the pay period containing `date`. A
 * Pay Period is two consecutive ISO weeks: the odd-numbered week is Week 1,
 * the following even-numbered week is Week 2 (Business Rule 14). Known
 * limitation: in a 53-ISO-week year, pairing may not alternate cleanly
 * across the year boundary — accepted, not solved in v1.
 */
export function payPeriodWeek1Start(date: IsoDate): IsoDate {
  const weekMonday = mondayOf(date);
  const weekNum = isoWeekNumber(weekMonday);
  return weekNum % 2 === 1 ? weekMonday : addDays(weekMonday, -7);
}
