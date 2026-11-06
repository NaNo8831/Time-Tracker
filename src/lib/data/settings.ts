import { query } from "@/lib/db";
import { toDateText, toNumber } from "@/lib/dbNormalize";
import type { IsoDate, LeaveType } from "@/lib/types";

export interface WeeklyTargetSetting {
  id: string;
  hours: number;
  effectiveDate: IsoDate;
}

export interface BreakDurationSetting {
  id: string;
  minutes: number;
  effectiveDate: IsoDate;
}

export interface StandardWorkdayHoursSetting {
  id: string;
  hours: number;
  effectiveDate: IsoDate;
}

export interface LeaveBankEntry {
  id: string;
  leaveType: LeaveType;
  totalHours: number;
  effectiveDate: IsoDate;
  note: string | null;
}

export interface Holiday {
  id: string;
  date: IsoDate;
  label: string;
}

export interface PhysicalYear {
  id: string;
  startDate: IsoDate;
  endDate: IsoDate;
  note: string | null;
}

// Duplicate-date inserts fail with Postgres code 23505 (unique violation);
// the Neon driver surfaces it as `error.code`, which settings/actions.ts checks.

export async function getWeeklyTargetSettings(): Promise<WeeklyTargetSetting[]> {
  const rows = await query<{ id: string; hours: number; effective_date: string }>(
    `select id, hours::float8 as hours, effective_date::text as effective_date
       from weekly_target_settings order by weekly_target_settings.effective_date desc`
  );
  return rows.map((row) => ({
    id: row.id,
    hours: toNumber(row.hours),
    effectiveDate: toDateText(row.effective_date),
  }));
}

export async function addWeeklyTargetSetting(hours: number, effectiveDate: IsoDate) {
  await query(`insert into weekly_target_settings (hours, effective_date) values ($1::numeric, $2::date)`, [
    hours,
    effectiveDate,
  ]);
}

export async function getBreakDurationSettings(): Promise<BreakDurationSetting[]> {
  const rows = await query<{ id: string; minutes: number; effective_date: string }>(
    `select id, minutes::float8 as minutes, effective_date::text as effective_date
       from break_duration_settings order by break_duration_settings.effective_date desc`
  );
  return rows.map((row) => ({
    id: row.id,
    minutes: toNumber(row.minutes),
    effectiveDate: toDateText(row.effective_date),
  }));
}

export async function addBreakDurationSetting(minutes: number, effectiveDate: IsoDate) {
  await query(`insert into break_duration_settings (minutes, effective_date) values ($1::numeric, $2::date)`, [
    minutes,
    effectiveDate,
  ]);
}

export async function getStandardWorkdayHoursSettings(): Promise<
  StandardWorkdayHoursSetting[]
> {
  const rows = await query<{ id: string; hours: number; effective_date: string }>(
    `select id, hours::float8 as hours, effective_date::text as effective_date
       from standard_workday_hours_settings order by standard_workday_hours_settings.effective_date desc`
  );
  return rows.map((row) => ({
    id: row.id,
    hours: toNumber(row.hours),
    effectiveDate: toDateText(row.effective_date),
  }));
}

export async function addStandardWorkdayHoursSetting(
  hours: number,
  effectiveDate: IsoDate
) {
  await query(
    `insert into standard_workday_hours_settings (hours, effective_date) values ($1::numeric, $2::date)`,
    [hours, effectiveDate]
  );
}

export async function getLeaveBankEntries(): Promise<LeaveBankEntry[]> {
  const rows = await query<{
    id: string;
    leave_type: LeaveType;
    total_hours: number;
    effective_date: string;
    note: string | null;
  }>(
    `select id, leave_type, total_hours::float8 as total_hours,
            effective_date::text as effective_date, note
       from leave_banks order by leave_banks.effective_date desc`
  );
  return rows.map((row) => ({
    id: row.id,
    leaveType: row.leave_type,
    totalHours: toNumber(row.total_hours),
    effectiveDate: toDateText(row.effective_date),
    note: row.note,
  }));
}

export async function addLeaveBankEntry(
  leaveType: LeaveType,
  totalHours: number,
  effectiveDate: IsoDate,
  note: string | null
) {
  await query(
    `insert into leave_banks (leave_type, total_hours, effective_date, note)
       values ($1, $2::numeric, $3::date, $4)`,
    [leaveType, totalHours, effectiveDate, note]
  );
}

export async function getHolidays(): Promise<Holiday[]> {
  const rows = await query<{ id: string; date: string; label: string }>(
    `select id, date::text as date, label from holidays order by holidays.date asc`
  );
  return rows.map((row) => ({ id: row.id, date: toDateText(row.date), label: row.label }));
}

export async function addHoliday(date: IsoDate, label: string) {
  await query(`insert into holidays (date, label) values ($1::date, $2)`, [date, label]);
}

export async function removeHoliday(id: string) {
  await query(`delete from holidays where id = $1::uuid`, [id]);
}

export async function getPhysicalYears(): Promise<PhysicalYear[]> {
  const rows = await query<{ id: string; start_date: string; end_date: string; note: string | null }>(
    `select id, start_date::text as start_date, end_date::text as end_date, note
       from physical_year_settings order by physical_year_settings.start_date desc`
  );
  return rows.map((row) => ({
    id: row.id,
    startDate: toDateText(row.start_date),
    endDate: toDateText(row.end_date),
    note: row.note,
  }));
}

export async function addPhysicalYear(
  startDate: IsoDate,
  endDate: IsoDate,
  note: string | null
) {
  await query(
    `insert into physical_year_settings (start_date, end_date, note) values ($1::date, $2::date, $3)`,
    [startDate, endDate, note]
  );
}

export async function removePhysicalYear(id: string) {
  await query(`delete from physical_year_settings where id = $1::uuid`, [id]);
}
