import type { IsoDate, LeaveType } from "@/lib/types";

export interface LeaveBankEntry {
  leaveType: LeaveType;
  totalHours: number;
  effectiveDate: IsoDate;
}

export interface LoggedLeaveEntry {
  date: IsoDate;
  hours: number;
}

/**
 * Rule 9: the most recent leave_banks total for this type (by
 * effective_date) minus the sum of that type's logged leave hours dated on
 * or after that entry's effective_date.
 */
export function leaveBankRemaining(
  bankEntriesForType: LeaveBankEntry[],
  leaveEntriesForType: LoggedLeaveEntry[]
): number {
  const latest = [...bankEntriesForType].sort((a, b) =>
    a.effectiveDate < b.effectiveDate ? 1 : -1
  )[0];

  if (!latest) return 0;

  const usedSinceEffective = leaveEntriesForType
    .filter((entry) => entry.date >= latest.effectiveDate)
    .reduce((total, entry) => total + entry.hours, 0);

  return latest.totalHours - usedSinceEffective;
}
