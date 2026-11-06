import { query } from "@/lib/db";
import { toDateText, toNullableNumber, toNumber, toTimestampText } from "@/lib/dbNormalize";
import type { IsoDate, LeaveType } from "@/lib/types";
import type { RecapInput } from "@/lib/calculations/recap";
import { buildDailyHistory } from "@/lib/calculations/history";
import type { DailyBreakdownRow } from "@/lib/calculations/dailyBreakdown";
import type { Session } from "@/lib/calculations/workHours";

interface DayEntryRow {
  id: string;
  date: string;
  break_minutes_override: number | null;
}
interface SessionRow {
  day_entry_id: string;
  check_in: string;
  check_out: string;
}
interface LeaveRow {
  leave_type: LeaveType;
  date: string;
  hours: number;
}

// Columns are cast to deterministic text/float so the driver never applies its
// own date/numeric parsing (see src/lib/dbNormalize.ts).
const DAY_ENTRY_COLS = `id, date::text as date, break_minutes_override`;
const SESSION_COLS = `s.day_entry_id,
  (s.check_in at time zone 'UTC')::text as check_in,
  (s.check_out at time zone 'UTC')::text as check_out`;
const LEAVE_COLS = `leave_type, date::text as date, hours::float8 as hours`;

function groupSessionsByDayEntry(rows: SessionRow[]): Map<string, Session[]> {
  const byId = new Map<string, Session[]>();
  for (const row of rows) {
    const list = byId.get(row.day_entry_id) ?? [];
    list.push({ checkIn: toTimestampText(row.check_in), checkOut: toTimestampText(row.check_out) });
    byId.set(row.day_entry_id, list);
  }
  return byId;
}

function mapDays(
  dayRows: DayEntryRow[],
  sessionsByDayEntryId: Map<string, Session[]>
): {
  sessionsByDate: Map<IsoDate, Session[]>;
  breakMinutesOverrideByDate: Map<IsoDate, number | null>;
} {
  const sessionsByDate = new Map<IsoDate, Session[]>();
  const breakMinutesOverrideByDate = new Map<IsoDate, number | null>();
  for (const row of dayRows) {
    const date = toDateText(row.date);
    sessionsByDate.set(date, sessionsByDayEntryId.get(row.id) ?? []);
    breakMinutesOverrideByDate.set(date, toNullableNumber(row.break_minutes_override));
  }
  return { sessionsByDate, breakMinutesOverrideByDate };
}

/** Gathers everything the recap calculation needs. Returns null when no weekly target is set yet. */
export async function getRecapInput(today: IsoDate): Promise<RecapInput | null> {
  const weeklyTargetRows = await query<{ hours: number; effective_date: string }>(
    `select hours::float8 as hours, effective_date::text as effective_date from weekly_target_settings`
  );

  if (weeklyTargetRows.length === 0) {
    return null;
  }

  const [
    breakDurationRows,
    standardWorkdayHoursRows,
    leaveBankRows,
    leaveEntryRows,
    holidayRows,
    dayEntryRows,
    sessionRows,
    rollingBalanceSeedRows,
  ] = await Promise.all([
    query<{ minutes: number; effective_date: string }>(
      `select minutes::float8 as minutes, effective_date::text as effective_date from break_duration_settings`
    ),
    query<{ hours: number; effective_date: string }>(
      `select hours::float8 as hours, effective_date::text as effective_date from standard_workday_hours_settings`
    ),
    query<{ leave_type: LeaveType; total_hours: number; effective_date: string }>(
      `select leave_type, total_hours::float8 as total_hours, effective_date::text as effective_date from leave_banks`
    ),
    query<LeaveRow>(`select ${LEAVE_COLS} from leave_entries`),
    query<{ date: string }>(`select date::text as date from holidays`),
    query<DayEntryRow>(`select ${DAY_ENTRY_COLS} from day_entries`),
    query<SessionRow>(`select ${SESSION_COLS} from sessions s`),
    query<{ balance: number }>(
      `select balance::float8 as balance from rolling_balance_seed order by created_at desc limit 1`
    ),
  ]);

  const { sessionsByDate, breakMinutesOverrideByDate } = mapDays(
    dayEntryRows,
    groupSessionsByDayEntry(sessionRows)
  );

  const leaveHoursByDate = new Map<IsoDate, { hours: number }[]>();
  const allLeaveEntriesByType: Record<LeaveType, { date: IsoDate; hours: number }[]> = {
    vacation: [],
    sick: [],
    paternity: [],
  };
  for (const row of leaveEntryRows) {
    const date = toDateText(row.date);
    const hours = toNumber(row.hours);
    const list = leaveHoursByDate.get(date) ?? [];
    list.push({ hours });
    leaveHoursByDate.set(date, list);

    allLeaveEntriesByType[row.leave_type].push({ date, hours });
  }

  return {
    today,
    weeklyTargetSettings: weeklyTargetRows.map((row) => ({
      value: toNumber(row.hours),
      effectiveDate: toDateText(row.effective_date),
    })),
    breakDurationSettings: breakDurationRows.map((row) => ({
      value: toNumber(row.minutes),
      effectiveDate: toDateText(row.effective_date),
    })),
    standardWorkdayHoursSettings: standardWorkdayHoursRows.map((row) => ({
      value: toNumber(row.hours),
      effectiveDate: toDateText(row.effective_date),
    })),
    holidays: new Set(holidayRows.map((row) => toDateText(row.date))),
    sessionsByDate,
    breakMinutesOverrideByDate,
    leaveHoursByDate,
    leaveBankEntries: leaveBankRows.map((row) => ({
      leaveType: row.leave_type,
      totalHours: toNumber(row.total_hours),
      effectiveDate: toDateText(row.effective_date),
    })),
    allLeaveEntriesByType,
    rollingBalanceSeed: rollingBalanceSeedRows[0] ? toNumber(rollingBalanceSeedRows[0].balance) : 0,
  };
}

/** Per-day raw/break/leave-by-type breakdown for a date range (the recap page's week log modal). */
export async function getDailyHistoryRows(
  startDate: IsoDate,
  endDate: IsoDate
): Promise<DailyBreakdownRow[]> {
  const range = [startDate, endDate];

  const [
    breakDurationRows,
    standardWorkdayHoursRows,
    dayEntryRows,
    sessionRows,
    leaveEntryRows,
    holidayRows,
  ] = await Promise.all([
    query<{ minutes: number; effective_date: string }>(
      `select minutes::float8 as minutes, effective_date::text as effective_date from break_duration_settings`
    ),
    query<{ hours: number; effective_date: string }>(
      `select hours::float8 as hours, effective_date::text as effective_date from standard_workday_hours_settings`
    ),
    query<DayEntryRow>(
      `select ${DAY_ENTRY_COLS} from day_entries where date between $1::date and $2::date`,
      range
    ),
    query<SessionRow>(
      `select ${SESSION_COLS}
         from sessions s join day_entries d on d.id = s.day_entry_id
         where d.date between $1::date and $2::date`,
      range
    ),
    query<LeaveRow>(
      `select ${LEAVE_COLS} from leave_entries where date between $1::date and $2::date`,
      range
    ),
    query<{ date: string }>(
      `select date::text as date from holidays where date between $1::date and $2::date`,
      range
    ),
  ]);

  const { sessionsByDate, breakMinutesOverrideByDate } = mapDays(
    dayEntryRows,
    groupSessionsByDayEntry(sessionRows)
  );

  const leaveEntriesByDate = new Map<IsoDate, { leaveType: LeaveType; hours: number }[]>();
  for (const row of leaveEntryRows) {
    const date = toDateText(row.date);
    const list = leaveEntriesByDate.get(date) ?? [];
    list.push({ leaveType: row.leave_type, hours: toNumber(row.hours) });
    leaveEntriesByDate.set(date, list);
  }

  return buildDailyHistory({
    startDate,
    endDate,
    sessionsByDate,
    breakMinutesOverrideByDate,
    leaveEntriesByDate,
    breakDurationSettings: breakDurationRows.map((row) => ({
      value: toNumber(row.minutes),
      effectiveDate: toDateText(row.effective_date),
    })),
    holidays: new Set(holidayRows.map((row) => toDateText(row.date))),
    standardWorkdayHoursSettings: standardWorkdayHoursRows.map((row) => ({
      value: toNumber(row.hours),
      effectiveDate: toDateText(row.effective_date),
    })),
  });
}
