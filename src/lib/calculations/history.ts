import type { IsoDate, LeaveType } from "@/lib/types";
import { addDays } from "./dates";
import { dailyBreakdown, type DailyBreakdownRow } from "./dailyBreakdown";
import { valueInEffect, type EffectiveDatedEntry } from "./effectiveDated";
import type { Session } from "./workHours";

export interface BuildDailyHistoryInput {
  startDate: IsoDate;
  endDate: IsoDate; // inclusive
  sessionsByDate: Map<IsoDate, Session[]>;
  breakMinutesOverrideByDate: Map<IsoDate, number | null>;
  leaveEntriesByDate: Map<IsoDate, { leaveType: LeaveType; hours: number }[]>;
  breakDurationSettings: EffectiveDatedEntry<number>[];
  holidays: Set<IsoDate>;
  standardWorkdayHoursSettings: EffectiveDatedEntry<number>[];
}

/** Builds one DailyBreakdownRow per calendar date from startDate to endDate, inclusive. */
export function buildDailyHistory(input: BuildDailyHistoryInput): DailyBreakdownRow[] {
  const rows: DailyBreakdownRow[] = [];

  for (let date = input.startDate; date <= input.endDate; date = addDays(date, 1)) {
    rows.push(
      dailyBreakdown({
        date,
        sessions: input.sessionsByDate.get(date) ?? [],
        breakMinutesOverride: input.breakMinutesOverrideByDate.get(date) ?? null,
        breakDurationMinutesInEffect: valueInEffect(input.breakDurationSettings, date),
        leaveEntries: input.leaveEntriesByDate.get(date) ?? [],
        isHoliday: input.holidays.has(date),
        standardWorkdayHoursInEffect: valueInEffect(input.standardWorkdayHoursSettings, date),
      })
    );
  }

  return rows;
}

export interface DailyHistorySummary {
  totalRawHours: number;
  totalBreakHours: number;
  totalLeaveHoursByType: Record<LeaveType, number>;
  totalLeaveHours: number;
  totalHolidayCredit: number;
  totalOthersTotal: number;
  totalPaidHours: number;
}

const LEAVE_TYPES: LeaveType[] = ["vacation", "sick", "paternity"];

/** Pure totals rollup for a set of DailyBreakdownRow — the "summary" row for a history view. */
export function summarizeDailyHistory(rows: DailyBreakdownRow[]): DailyHistorySummary {
  const totalLeaveHoursByType = { vacation: 0, sick: 0, paternity: 0 } as Record<LeaveType, number>;

  let totalRawHours = 0;
  let totalBreakHours = 0;
  let totalHolidayCredit = 0;
  let totalPaidHours = 0;

  for (const row of rows) {
    totalRawHours += row.rawHours;
    totalBreakHours += row.breakHours;
    totalHolidayCredit += row.holidayCredit;
    totalPaidHours += row.paidHours;
    for (const type of LEAVE_TYPES) {
      totalLeaveHoursByType[type] += row.leaveHoursByType[type];
    }
  }

  const totalLeaveHours = LEAVE_TYPES.reduce((sum, type) => sum + totalLeaveHoursByType[type], 0);
  const totalOthersTotal = totalLeaveHours + totalHolidayCredit;

  return {
    totalRawHours,
    totalBreakHours,
    totalLeaveHoursByType,
    totalLeaveHours,
    totalHolidayCredit,
    totalOthersTotal,
    totalPaidHours,
  };
}
