import { createClient } from "@/lib/supabase/server";
import type { IsoDate, LeaveType } from "@/lib/types";
import { buildDayEntryDetail, type DayEntryDetail } from "./entryDetail";

export type { SessionRow, LeaveEntryRow, DayEntryDetail } from "./entryDetail";

export async function getDayEntryDetail(date: IsoDate): Promise<DayEntryDetail> {
  const supabase = createClient();

  // Leave is keyed by date (not by day record), so always fetch it; sessions
  // hang off the day record, so fetch them only when one exists.
  const [
    { data: dayEntry, error: dayEntryError },
    { data: leaveEntries, error: leaveError },
  ] = await Promise.all([
    supabase
      .from("day_entries")
      .select("id, date, break_minutes_override")
      .eq("date", date)
      .maybeSingle(),
    supabase.from("leave_entries").select("id, leave_type, hours").eq("date", date),
  ]);
  if (dayEntryError) throw dayEntryError;
  if (leaveError) throw leaveError;

  let sessions: { id: string; check_in: string; check_out: string }[] = [];
  if (dayEntry) {
    const { data, error } = await supabase
      .from("sessions")
      .select("id, check_in, check_out")
      .eq("day_entry_id", dayEntry.id)
      .order("check_in", { ascending: true });
    if (error) throw error;
    sessions = data ?? [];
  }

  return buildDayEntryDetail({
    date,
    dayEntry,
    sessions,
    leaveEntries: leaveEntries ?? [],
  });
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
