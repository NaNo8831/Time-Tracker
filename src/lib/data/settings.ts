import { createClient } from "@/lib/supabase/server";
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

export async function getWeeklyTargetSettings(): Promise<WeeklyTargetSetting[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("weekly_target_settings")
    .select("id, hours, effective_date")
    .order("effective_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    hours: row.hours,
    effectiveDate: row.effective_date,
  }));
}

export async function addWeeklyTargetSetting(hours: number, effectiveDate: IsoDate) {
  const supabase = createClient();
  const { error } = await supabase
    .from("weekly_target_settings")
    .insert({ hours, effective_date: effectiveDate });
  if (error) throw error;
}

export async function getBreakDurationSettings(): Promise<BreakDurationSetting[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("break_duration_settings")
    .select("id, minutes, effective_date")
    .order("effective_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    minutes: row.minutes,
    effectiveDate: row.effective_date,
  }));
}

export async function addBreakDurationSetting(minutes: number, effectiveDate: IsoDate) {
  const supabase = createClient();
  const { error } = await supabase
    .from("break_duration_settings")
    .insert({ minutes, effective_date: effectiveDate });
  if (error) throw error;
}

export async function getStandardWorkdayHoursSettings(): Promise<
  StandardWorkdayHoursSetting[]
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("standard_workday_hours_settings")
    .select("id, hours, effective_date")
    .order("effective_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    hours: row.hours,
    effectiveDate: row.effective_date,
  }));
}

export async function addStandardWorkdayHoursSetting(
  hours: number,
  effectiveDate: IsoDate
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("standard_workday_hours_settings")
    .insert({ hours, effective_date: effectiveDate });
  if (error) throw error;
}

export async function getLeaveBankEntries(): Promise<LeaveBankEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leave_banks")
    .select("id, leave_type, total_hours, effective_date, note")
    .order("effective_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    leaveType: row.leave_type,
    totalHours: row.total_hours,
    effectiveDate: row.effective_date,
    note: row.note,
  }));
}

export async function addLeaveBankEntry(
  leaveType: LeaveType,
  totalHours: number,
  effectiveDate: IsoDate,
  note: string | null
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("leave_banks")
    .insert({ leave_type: leaveType, total_hours: totalHours, effective_date: effectiveDate, note });
  if (error) throw error;
}

export async function getHolidays(): Promise<Holiday[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("holidays")
    .select("id, date, label")
    .order("date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addHoliday(date: IsoDate, label: string) {
  const supabase = createClient();
  const { error } = await supabase.from("holidays").insert({ date, label });
  if (error) throw error;
}

export async function removeHoliday(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("holidays").delete().eq("id", id);
  if (error) throw error;
}

export async function getPhysicalYears(): Promise<PhysicalYear[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("physical_year_settings")
    .select("id, start_date, end_date, note")
    .order("start_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    note: row.note,
  }));
}

export async function addPhysicalYear(
  startDate: IsoDate,
  endDate: IsoDate,
  note: string | null
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("physical_year_settings")
    .insert({ start_date: startDate, end_date: endDate, note });
  if (error) throw error;
}

export async function removePhysicalYear(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("physical_year_settings").delete().eq("id", id);
  if (error) throw error;
}
