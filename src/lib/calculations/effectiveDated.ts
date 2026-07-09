import type { IsoDate } from "@/lib/types";

export interface EffectiveDatedEntry<T> {
  value: T;
  effectiveDate: IsoDate;
}

/**
 * The value "in effect" on a given date is the most recent entry with an
 * effective_date on or before that date — never the current/latest entry
 * applied retroactively. See planning/DOMAIN.md Business Rule 7.
 */
export function valueInEffect<T>(
  entries: EffectiveDatedEntry<T>[],
  asOfDate: IsoDate
): T | undefined {
  let latest: EffectiveDatedEntry<T> | undefined;

  for (const entry of entries) {
    if (entry.effectiveDate > asOfDate) continue;
    if (!latest || entry.effectiveDate > latest.effectiveDate) {
      latest = entry;
    }
  }

  return latest?.value;
}
