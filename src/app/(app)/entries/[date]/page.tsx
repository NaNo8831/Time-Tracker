import Link from "next/link";
import { getDayEntryDetail, listRecentDayEntries } from "@/lib/data/entries";
import { LEAVE_TYPES } from "@/lib/types";
import TimeSelect from "@/components/TimeSelect";
import BreakMinutesSelect from "@/components/BreakMinutesSelect";
import {
  addLeaveEntry,
  addSession,
  goToDate,
  removeLeaveEntry,
  removeSession,
  setBreak,
} from "../actions";

function formatTime(iso: string): string {
  return iso.slice(11, 16);
}

export default async function DayEntryPage({
  params,
  searchParams,
}: {
  params: { date: string };
  searchParams: { error?: string };
}) {
  const { date } = params;
  const [entry, recent] = await Promise.all([
    getDayEntryDetail(date),
    listRecentDayEntries(),
  ]);

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{date}</h1>
        <form action={goToDate} className="flex items-end gap-2">
          <input
            name="date"
            type="date"
            defaultValue={date}
            required
            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            Go
          </button>
        </form>
      </div>

      {searchParams.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <section className="space-y-2">
        <h2 className="text-base font-medium text-slate-900">Break</h2>
        <form action={setBreak} className="flex items-center gap-2">
          <input type="hidden" name="date" value={date} />
          <BreakMinutesSelect
            name="breakMinutesOverride"
            defaultValue={entry.breakMinutesOverride}
          />
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-1 text-xs text-white hover:bg-slate-700"
          >
            Save
          </button>
        </form>
        <p className="text-xs text-slate-500">
          Leave as "(use default)" to use the break duration set in Settings for this date.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-slate-900">Sessions</h2>
        <form action={addSession} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="date" value={date} />
          <div>
            <label className="block text-xs text-slate-600">Check in</label>
            <TimeSelect name="checkInTime" required />
          </div>
          <div>
            <label className="block text-xs text-slate-600">Check out</label>
            <TimeSelect name="checkOutTime" required />
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            Add session
          </button>
        </form>
        <ul className="divide-y divide-slate-200 text-sm">
          {entry.sessions.map((session) => (
            <li key={session.id} className="flex items-center justify-between py-1.5">
              <span>
                {formatTime(session.checkIn)} – {formatTime(session.checkOut)}
              </span>
              <form action={removeSession}>
                <input type="hidden" name="id" value={session.id} />
                <input type="hidden" name="date" value={date} />
                <button type="submit" className="text-xs text-red-600 hover:underline">
                  Remove
                </button>
              </form>
            </li>
          ))}
          {entry.sessions.length === 0 && (
            <li className="py-1.5 text-slate-500">No sessions logged for this day.</li>
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-slate-900">Leave</h2>
        <form action={addLeaveEntry} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="date" value={date} />
          <div>
            <label className="block text-xs text-slate-600">Type</label>
            <select
              name="leaveType"
              required
              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
            >
              {LEAVE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600">Hours</label>
            <input
              name="hours"
              type="number"
              step="0.25"
              min="0.25"
              required
              className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            Add leave
          </button>
        </form>
        <ul className="divide-y divide-slate-200 text-sm">
          {entry.leaveEntries.map((leave) => (
            <li key={leave.id} className="flex items-center justify-between py-1.5">
              <span className="capitalize">
                {leave.leaveType} — {leave.hours} hrs
              </span>
              <form action={removeLeaveEntry}>
                <input type="hidden" name="id" value={leave.id} />
                <input type="hidden" name="date" value={date} />
                <button type="submit" className="text-xs text-red-600 hover:underline">
                  Remove
                </button>
              </form>
            </li>
          ))}
          {entry.leaveEntries.length === 0 && (
            <li className="py-1.5 text-slate-500">No leave logged for this day.</li>
          )}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium text-slate-900">Recent Entries</h2>
        <ul className="divide-y divide-slate-200 text-sm">
          {recent.map((recentEntry) => (
            <li key={recentEntry.id} className="py-1.5">
              <Link
                href={`/entries/${recentEntry.date}`}
                className={
                  recentEntry.date === date
                    ? "font-medium text-slate-900"
                    : "text-slate-700 hover:underline"
                }
              >
                {recentEntry.date}
              </Link>
              {recentEntry.breakMinutesOverride !== null && (
                <span className="ml-2 text-xs text-slate-500">
                  break override: {recentEntry.breakMinutesOverride} min
                </span>
              )}
            </li>
          ))}
          {recent.length === 0 && (
            <li className="py-1.5 text-slate-500">No entries logged yet.</li>
          )}
        </ul>
      </section>
    </main>
  );
}
