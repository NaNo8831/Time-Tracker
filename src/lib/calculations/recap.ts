import type { IsoDate, LeaveType } from "@/lib/types";
import { addDays } from "./dates";
import { valueInEffect, type EffectiveDatedEntry } from "./effectiveDated";
import { leaveBankRemaining } from "./leaveBanks";
import { workHours as calcWorkHours, type Session } from "./workHours";
import { mondayOf, rollingBalance, weeklyDelta } from "./weekly";

export interface RecapInput {
  today: IsoDate;
  weeklyTargetSettings: EffectiveDatedEntry<number>[];
  breakDurationSettings: EffectiveDatedEntry<number>[];
  standardWorkdayHoursSettings: EffectiveDatedEntry<number>[];
  holidays: Set<IsoDate>;
  sessionsByDate: Map<IsoDate, Session[]>;
  breakMinutesOverrideByDate: Map<IsoDate, number | null>;
  leaveHoursByDate: Map<IsoDate, { hours: number }[]>;
  leaveBankEntries: { leaveType: LeaveType; totalHours: number; effectiveDate: IsoDate }[];
  allLeaveEntriesByType: Record<LeaveType, { date: IsoDate; hours: number }[]>;
  /** Rolling Balance Seed — see planning/DOMAIN.md. 0 if none is set. */
  rollingBalanceSeed: number;
}

export interface WeekSummary {
  weekStart: IsoDate;
  actualHours: number;
  targetHours: number;
  delta: number;
  rollingBalance: number;
}

export interface RecapResult {
  weeks: WeekSummary[];
  currentWeek: WeekSummary;
  leaveBankRemaining: Record<LeaveType, number>;
}

const LEAVE_TYPES: LeaveType[] = ["vacation", "sick", "paternity"];

/**
 * Builds the full weekly recap: every tracked week from the earliest weekly
 * target's effective date through the current week, each week's actual vs.
 * target hours, and the rolling balance carried forward across all of them
 * (planning/DOMAIN.md Business Rules 3-8). Returns null when no weekly
 * target has been set yet (nothing to compute).
 */
export function buildWeeklyRecap(input: RecapInput): RecapResult | null {
  if (input.weeklyTargetSettings.length === 0) return null;

  const earliestTargetDate = [...input.weeklyTargetSettings]
    .map((entry) => entry.effectiveDate)
    .sort()[0];
  const startMonday = mondayOf(earliestTargetDate);
  const currentWeekMonday = mondayOf(input.today);

  const weekStarts: IsoDate[] = [];
  for (let week = startMonday; week <= currentWeekMonday; week = addDays(week, 7)) {
    weekStarts.push(week);
  }

  const weeklyActuals = weekStarts.map((weekStart) => {
    let total = 0;
    for (let offset = 0; offset < 7; offset += 1) {
      const date = addDays(weekStart, offset);
      if (date > input.today) break;

      total += calcWorkHours({
        date,
        sessions: input.sessionsByDate.get(date) ?? [],
        breakMinutesOverride: input.breakMinutesOverrideByDate.get(date) ?? null,
        breakDurationMinutesInEffect: valueInEffect(input.breakDurationSettings, date),
        leaveEntries: input.leaveHoursByDate.get(date) ?? [],
        isHoliday: input.holidays.has(date),
        standardWorkdayHoursInEffect: valueInEffect(input.standardWorkdayHoursSettings, date),
      });
    }
    return total;
  });

  const targets = weekStarts.map(
    (weekStart) => valueInEffect(input.weeklyTargetSettings, weekStart) ?? 0
  );
  const deltas = weeklyActuals.map((actual, i) => weeklyDelta(actual, targets[i]));
  const balances = rollingBalance(deltas, input.rollingBalanceSeed);

  const weeks: WeekSummary[] = weekStarts.map((weekStart, i) => ({
    weekStart,
    actualHours: weeklyActuals[i],
    targetHours: targets[i],
    delta: deltas[i],
    rollingBalance: balances[i],
  }));

  const remaining = {} as Record<LeaveType, number>;
  for (const type of LEAVE_TYPES) {
    remaining[type] = leaveBankRemaining(
      input.leaveBankEntries
        .filter((entry) => entry.leaveType === type)
        .map((entry) => ({
          leaveType: entry.leaveType,
          totalHours: entry.totalHours,
          effectiveDate: entry.effectiveDate,
        })),
      input.allLeaveEntriesByType[type] ?? []
    );
  }

  return {
    weeks,
    currentWeek: weeks[weeks.length - 1],
    leaveBankRemaining: remaining,
  };
}
