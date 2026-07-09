import { createClient } from "@/lib/supabase/server";
import type { IsoDate, LeaveType } from "@/lib/types";
import type { RecapInput } from "@/lib/calculations/recap";
import { buildDailyHistory } from "@/lib/calculations/history";
import type { DailyBreakdownRow } from "@/lib/calculations/dailyBreakdown";
import type { Session } from "@/lib/calculations/workHours";

const LEAVE_TYPES: LeaveType[] = ["vacation", "sick", "paternity"];

/** Gathers everything the recap calculation needs. Returns null when no weekly target is set yet. */
export async function getRecapInput(today: IsoDate): Promise<RecapInput | null> {
  const supabase = createClient();

  const { data: weeklyTargetRows, error: wtErr } = await supabase
    .from("weekly_target_settings")
    .select("hours, effective_date");
  if (wtErr) throw wtErr;

  if (!weeklyTargetRows || weeklyTargetRows.length === 0) {
    return null;
  }

  const [
    { data: breakDurationRows, error: bdErr },
    { data: standardWorkdayHoursRows, error: swhErr },
    { data: leaveBankRows, error: lbErr },
    { data: leaveEntryRows, error: leErr },
    { data: holidayRows, error: hErr },
    { data: dayEntryRows, error: deErr },
    { data: rollingBalanceSeedRows, error: rbsErr },
  ] = await Promise.all([
    supabase.from("break_duration_settings").select("minutes, effective_date"),
    supabase.from("standard_workday_hours_settings").select("hours, effective_date"),
    supabase.from("leave_banks").select("leave_type, total_hours, effective_date"),
    supabase.from("leave_entries").select("leave_type, date, hours"),
    supabase.from("holidays").select("date"),
    supabase.from("day_entries").select("id, date, break_minutes_override"),
    supabase
      .from("rolling_balance_seed")
      .select("balance, created_at")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);
  if (bdErr) throw bdErr;
  if (swhErr) throw swhErr;
  if (lbErr) throw lbErr;
  if (leErr) throw leErr;
  if (hErr) throw hErr;
  if (deErr) throw deErr;
  if (rbsErr) throw rbsErr;

  const dayEntryIds = (dayEntryRows ?? []).map((row) => row.id);
  const { data: sessionRows, error: sErr } = dayEntryIds.length
    ? await supabase
        .from("sessions")
        .select("day_entry_id, check_in, check_out")
        .in("day_entry_id", dayEntryIds)
    : { data: [] as { day_entry_id: string; check_in: string; check_out: string }[], error: null };
  if (sErr) throw sErr;

  const sessionsByDayEntryId = new Map<string, Session[]>();
  for (const row of sessionRows ?? []) {
    const list = sessionsByDayEntryId.get(row.day_entry_id) ?? [];
    list.push({ checkIn: row.check_in, checkOut: row.check_out });
    sessionsByDayEntryId.set(row.day_entry_id, list);
  }

  const sessionsByDate = new Map<IsoDate, Session[]>();
  const breakMinutesOverrideByDate = new Map<IsoDate, number | null>();
  for (const row of dayEntryRows ?? []) {
    sessionsByDate.set(row.date, sessionsByDayEntryId.get(row.id) ?? []);
    breakMinutesOverrideByDate.set(row.date, row.break_minutes_override);
  }

  const leaveHoursByDate = new Map<IsoDate, { hours: number }[]>();
  const allLeaveEntriesByType: Record<LeaveType, { date: IsoDate; hours: number }[]> = {
    vacation: [],
    sick: [],
    paternity: [],
  };
  for (const row of leaveEntryRows ?? []) {
    const list = leaveHoursByDate.get(row.date) ?? [];
    list.push({ hours: row.hours });
    leaveHoursByDate.set(row.date, list);

    allLeaveEntriesByType[row.leave_type as LeaveType].push({
      date: row.date,
      hours: row.hours,
    });
  }

  return {
    today,
    weeklyTargetSettings: weeklyTargetRows.map((row) => ({
      value: row.hours,
      effectiveDate: row.effective_date,
    })),
    breakDurationSettings: (breakDurationRows ?? []).map((row) => ({
      value: row.minutes,
      effectiveDate: row.effective_date,
    })),
    standardWorkdayHoursSettings: (standardWorkdayHoursRows ?? []).map((row) => ({
      value: row.hours,
      effectiveDate: row.effective_date,
    })),
    holidays: new Set((holidayRows ?? []).map((row) => row.date)),
    sessionsByDate,
    breakMinutesOverrideByDate,
    leaveHoursByDate,
    leaveBankEntries: (leaveBankRows ?? []).map((row) => ({
      leaveType: row.leave_type as LeaveType,
      totalHours: row.total_hours,
      effectiveDate: row.effective_date,
    })),
    allLeaveEntriesByType,
    rollingBalanceSeed: rollingBalanceSeedRows?.[0]?.balance ?? 0,
  };
}

/** Per-day raw/break/leave-by-type breakdown for a date range (the recap page's history table). */
export async function getDailyHistoryRows(
  startDate: IsoDate,
  endDate: IsoDate
): Promise<DailyBreakdownRow[]> {
  const supabase = createClient();

  const [
    { data: breakDurationRows, error: bdErr },
    { data: standardWorkdayHoursRows, error: swhErr },
    { data: dayEntryRows, error: deErr },
    { data: leaveEntryRows, error: leErr },
    { data: holidayRows, error: hErr },
  ] = await Promise.all([
    supabase.from("break_duration_settings").select("minutes, effective_date"),
    supabase.from("standard_workday_hours_settings").select("hours, effective_date"),
    supabase
      .from("day_entries")
      .select("id, date, break_minutes_override")
      .gte("date", startDate)
      .lte("date", endDate),
    supabase
      .from("leave_entries")
      .select("leave_type, date, hours")
      .gte("date", startDate)
      .lte("date", endDate),
    supabase.from("holidays").select("date").gte("date", startDate).lte("date", endDate),
  ]);
  if (bdErr) throw bdErr;
  if (swhErr) throw swhErr;
  if (deErr) throw deErr;
  if (leErr) throw leErr;
  if (hErr) throw hErr;

  const dayEntryIds = (dayEntryRows ?? []).map((row) => row.id);
  const { data: sessionRows, error: sErr } = dayEntryIds.length
    ? await supabase
        .from("sessions")
        .select("day_entry_id, check_in, check_out")
        .in("day_entry_id", dayEntryIds)
    : { data: [] as { day_entry_id: string; check_in: string; check_out: string }[], error: null };
  if (sErr) throw sErr;

  const sessionsByDayEntryId = new Map<string, Session[]>();
  for (const row of sessionRows ?? []) {
    const list = sessionsByDayEntryId.get(row.day_entry_id) ?? [];
    list.push({ checkIn: row.check_in, checkOut: row.check_out });
    sessionsByDayEntryId.set(row.day_entry_id, list);
  }

  const sessionsByDate = new Map<IsoDate, Session[]>();
  const breakMinutesOverrideByDate = new Map<IsoDate, number | null>();
  for (const row of dayEntryRows ?? []) {
    sessionsByDate.set(row.date, sessionsByDayEntryId.get(row.id) ?? []);
    breakMinutesOverrideByDate.set(row.date, row.break_minutes_override);
  }

  const leaveEntriesByDate = new Map<IsoDate, { leaveType: LeaveType; hours: number }[]>();
  for (const row of leaveEntryRows ?? []) {
    const list = leaveEntriesByDate.get(row.date) ?? [];
    list.push({ leaveType: row.leave_type as LeaveType, hours: row.hours });
    leaveEntriesByDate.set(row.date, list);
  }

  return buildDailyHistory({
    startDate,
    endDate,
    sessionsByDate,
    breakMinutesOverrideByDate,
    leaveEntriesByDate,
    breakDurationSettings: (breakDurationRows ?? []).map((row) => ({
      value: row.minutes,
      effectiveDate: row.effective_date,
    })),
    holidays: new Set((holidayRows ?? []).map((row) => row.date)),
    standardWorkdayHoursSettings: (standardWorkdayHoursRows ?? []).map((row) => ({
      value: row.hours,
      effectiveDate: row.effective_date,
    })),
  });
}
