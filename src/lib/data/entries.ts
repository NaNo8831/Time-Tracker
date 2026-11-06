import { query } from "@/lib/db";
import { toDateText, toNullableNumber, toNumber, toTimestampText } from "@/lib/dbNormalize";
import type { IsoDate, LeaveType } from "@/lib/types";
import { buildDayEntryDetail, type DayEntryDetail } from "./entryDetail";

export type { SessionRow, LeaveEntryRow, DayEntryDetail } from "./entryDetail";

export async function getDayEntryDetail(date: IsoDate): Promise<DayEntryDetail> {
  // Leave is keyed by date (not by day record), so always fetch it; sessions
  // hang off the day record, so fetch them only when one exists.
  const [dayRows, leaveRows] = await Promise.all([
    query<{ id: string; date: string; break_minutes_override: number | null }>(
      `select id, date::text as date, break_minutes_override
         from day_entries where date = $1::date`,
      [date]
    ),
    query<{ id: string; leave_type: LeaveType; hours: number }>(
      `select id, leave_type, hours::float8 as hours
         from leave_entries where date = $1::date
         order by created_at, id`,
      [date]
    ),
  ]);

  const dayRow = dayRows[0] ?? null;

  let sessions: { id: string; check_in: string; check_out: string }[] = [];
  if (dayRow) {
    const rows = await query<{ id: string; check_in: string; check_out: string }>(
      `select id,
              (check_in at time zone 'UTC')::text as check_in,
              (check_out at time zone 'UTC')::text as check_out
         from sessions where day_entry_id = $1::uuid
         order by sessions.check_in asc`,
      [dayRow.id]
    );
    sessions = rows.map((r) => ({
      id: r.id,
      check_in: toTimestampText(r.check_in),
      check_out: toTimestampText(r.check_out),
    }));
  }

  return buildDayEntryDetail({
    date,
    dayEntry: dayRow
      ? {
          id: dayRow.id,
          date: toDateText(dayRow.date),
          break_minutes_override: toNullableNumber(dayRow.break_minutes_override),
        }
      : null,
    sessions,
    leaveEntries: leaveRows.map((r) => ({
      id: r.id,
      leave_type: r.leave_type,
      hours: toNumber(r.hours),
    })),
  });
}

/** Creates the day_entries row for `date` if it doesn't exist yet, and returns its id. */
export async function ensureDayEntry(date: IsoDate): Promise<string> {
  const rows = await query<{ id: string }>(
    `insert into day_entries (date) values ($1::date)
       on conflict (date) do update set date = excluded.date
       returning id`,
    [date]
  );
  return rows[0].id;
}

/** Sets or clears the day's manual break override. Pass null to clear it (use the default instead). */
export async function setBreakOverride(date: IsoDate, minutes: number | null) {
  const dayEntryId = await ensureDayEntry(date);
  await query(`update day_entries set break_minutes_override = $1::integer where id = $2::uuid`, [
    minutes,
    dayEntryId,
  ]);
}

export async function addSession(date: IsoDate, checkIn: string, checkOut: string) {
  const dayEntryId = await ensureDayEntry(date);
  // Times arrive as 'YYYY-MM-DDTHH:MM:SS' with no zone and are stored as UTC,
  // exactly as before.
  await query(
    `insert into sessions (day_entry_id, check_in, check_out)
       values ($1::uuid, ($2::timestamp at time zone 'UTC'), ($3::timestamp at time zone 'UTC'))`,
    [dayEntryId, checkIn, checkOut]
  );
}

export async function removeSession(id: string) {
  await query(`delete from sessions where id = $1::uuid`, [id]);
}

export async function addLeaveEntry(date: IsoDate, leaveType: LeaveType, hours: number) {
  await query(`insert into leave_entries (date, leave_type, hours) values ($1::date, $2, $3::numeric)`, [
    date,
    leaveType,
    hours,
  ]);
}

export async function removeLeaveEntry(id: string) {
  await query(`delete from leave_entries where id = $1::uuid`, [id]);
}
