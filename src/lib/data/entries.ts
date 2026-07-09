import { createClient } from "@/lib/supabase/server";
import type { IsoDate, LeaveType } from "@/lib/types";

export interface SessionRow {
  id: string;
  checkIn: string;
  checkOut: string;
}

export interface LeaveEntryRow {
  id: string;
  leaveType: LeaveType;
  hours: number;
}

export interface DayEntryDetail {
  id: string | null;
  date: IsoDate;
  breakMinutesOverride: number | null;
  sessions: SessionRow[];
  leaveEntries: LeaveEntryRow[];
}

export interface DayEntrySummary {
  id: string;
  date: IsoDate;
  breakMinutesOverride: number | null;
}

export async function listRecentDayEntries(limit = 30): Promise<DayEntrySummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("day_entries")
    .select("id, date, break_minutes_override")
    .order("date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    date: row.date,
    breakMinutesOverride: row.break_minutes_override,
  }));
}

export async function getDayEntryDetail(date: IsoDate): Promise<DayEntryDetail> {
  const supabase = createClient();

  const { data: dayEntry, error: dayEntryError } = await supabase
    .from("day_entries")
    .select("id, date, break_minutes_override")
    .eq("date", date)
    .maybeSingle();
  if (dayEntryError) throw dayEntryError;

  if (!dayEntry) {
    return { id: null, date, breakMinutesOverride: null, sessions: [], leaveEntries: [] };
  }

  const [{ data: sessions, error: sessionsError }, { data: leaveEntries, error: leaveError }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select("id, check_in, check_out")
        .eq("day_entry_id", dayEntry.id)
        .order("check_in", { ascending: true }),
      supabase
        .from("leave_entries")
        .select("id, leave_type, hours")
        .eq("date", date),
    ]);
  if (sessionsError) throw sessionsError;
  if (leaveError) throw leaveError;

  return {
    id: dayEntry.id,
    date: dayEntry.date,
    breakMinutesOverride: dayEntry.break_minutes_override,
    sessions: (sessions ?? []).map((s) => ({
      id: s.id,
      checkIn: s.check_in,
      checkOut: s.check_out,
    })),
    leaveEntries: (leaveEntries ?? []).map((l) => ({
      id: l.id,
      leaveType: l.leave_type,
      hours: l.hours,
    })),
  };
}

/** Creates the day_entries row for `date` if it doesn't exist yet, and returns its id. */
export async function ensureDayEntry(date: IsoDate): Promise<string> {
  const supabase = createClient();
  const { data: existing, error: existingError } = await supabase
    .from("day_entries")
    .select("id")
    .eq("date", date)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return existing.id;

  const { data: created, error: createError } = await supabase
    .from("day_entries")
    .insert({ date })
    .select("id")
    .single();
  if (createError) throw createError;
  return created.id;
}

/** Sets or clears the day's manual break override. Pass null to clear it (use the default instead). */
export async function setBreakOverride(date: IsoDate, minutes: number | null) {
  const dayEntryId = await ensureDayEntry(date);
  const supabase = createClient();
  const { error } = await supabase
    .from("day_entries")
    .update({ break_minutes_override: minutes })
    .eq("id", dayEntryId);
  if (error) throw error;
}

export async function addSession(date: IsoDate, checkIn: string, checkOut: string) {
  const dayEntryId = await ensureDayEntry(date);
  const supabase = createClient();
  const { error } = await supabase
    .from("sessions")
    .insert({ day_entry_id: dayEntryId, check_in: checkIn, check_out: checkOut });
  if (error) throw error;
}

export async function removeSession(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) throw error;
}

export async function addLeaveEntry(date: IsoDate, leaveType: LeaveType, hours: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("leave_entries")
    .insert({ date, leave_type: leaveType, hours });
  if (error) throw error;
}

export async function removeLeaveEntry(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("leave_entries").delete().eq("id", id);
  if (error) throw error;
}
