import { getDayEntryDetail } from "@/lib/data/entries";
import { LEAVE_TYPES } from "@/lib/types";
import TimeSelect from "@/components/TimeSelect";
import BreakMinutesSelect from "@/components/BreakMinutesSelect";
import ActionForm from "@/components/ActionForm";
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
  const entry = await getDayEntryDetail(date);

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">{date}</h1>
        <form action={goToDate} className="flex items-end gap-2">
          <input
            name="date"
            type="date"
            defaultValue={date}
            required
            className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
          />
          <button
            type="submit"
            className="rounded-md bg-[var(--color-btn-bg)] px-3 py-1.5 text-sm text-[var(--color-btn-text)] hover:bg-[var(--color-btn-bg-hover)]"
          >
            Go
          </button>
        </form>
      </div>

      {searchParams.error && (
        <p className="rounded-md bg-[var(--color-error-bg)] px-3 py-2 text-sm text-[var(--color-error-text)]">
          {searchParams.error}
        </p>
      )}

      <section className="space-y-2">
        <h2 className="text-base font-medium text-[var(--color-text)]">Break</h2>
        <ActionForm action={setBreak} className="flex items-center gap-2">
          <input type="hidden" name="date" value={date} />
          <BreakMinutesSelect
            name="breakMinutesOverride"
            defaultValue={entry.breakMinutesOverride}
          />
          <button
            type="submit"
            className="rounded-md bg-[var(--color-btn-bg)] px-3 py-1 text-xs text-[var(--color-btn-text)] hover:bg-[var(--color-btn-bg-hover)]"
          >
            Save
          </button>
        </ActionForm>
        <p className="text-xs text-[var(--color-text-faint)]">
          Leave as "(use default)" to use the break duration set in Settings for this date.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-[var(--color-text)]">Sessions</h2>
        <ActionForm action={addSession} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="date" value={date} />
          <div>
            <label className="block text-xs text-[var(--color-text-muted)]">Check in</label>
            <TimeSelect name="checkInTime" required />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)]">Check out</label>
            <TimeSelect name="checkOutTime" required />
          </div>
          <button
            type="submit"
            className="rounded-md bg-[var(--color-btn-bg)] px-3 py-1.5 text-sm text-[var(--color-btn-text)] hover:bg-[var(--color-btn-bg-hover)]"
          >
            Add session
          </button>
        </ActionForm>
        <ul className="divide-y divide-[var(--color-border)] text-sm">
          {entry.sessions.map((session) => (
            <li key={session.id} className="flex items-center justify-between py-1.5">
              <span>
                {formatTime(session.checkIn)} – {formatTime(session.checkOut)}
              </span>
              <ActionForm action={removeSession}>
                <input type="hidden" name="id" value={session.id} />
                <input type="hidden" name="date" value={date} />
                <button type="submit" className="text-xs text-[var(--color-negative)] hover:underline">
                  Remove
                </button>
              </ActionForm>
            </li>
          ))}
          {entry.sessions.length === 0 && (
            <li className="py-1.5 text-[var(--color-text-faint)]">No sessions logged for this day.</li>
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-[var(--color-text)]">Leave</h2>
        <ActionForm action={addLeaveEntry} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="date" value={date} />
          <div>
            <label className="block text-xs text-[var(--color-text-muted)]">Type</label>
            <select
              name="leaveType"
              required
              className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
            >
              {LEAVE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)]">Hours</label>
            <input
              name="hours"
              type="number"
              step="0.25"
              min="0.25"
              required
              className="w-24 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-[var(--color-btn-bg)] px-3 py-1.5 text-sm text-[var(--color-btn-text)] hover:bg-[var(--color-btn-bg-hover)]"
          >
            Add leave
          </button>
        </ActionForm>
        <ul className="divide-y divide-[var(--color-border)] text-sm">
          {entry.leaveEntries.map((leave) => (
            <li key={leave.id} className="flex items-center justify-between py-1.5">
              <span className="capitalize">
                {leave.leaveType} — {leave.hours} hrs
              </span>
              <ActionForm action={removeLeaveEntry}>
                <input type="hidden" name="id" value={leave.id} />
                <input type="hidden" name="date" value={date} />
                <button type="submit" className="text-xs text-[var(--color-negative)] hover:underline">
                  Remove
                </button>
              </ActionForm>
            </li>
          ))}
          {entry.leaveEntries.length === 0 && (
            <li className="py-1.5 text-[var(--color-text-faint)]">No leave logged for this day.</li>
          )}
        </ul>
      </section>
    </main>
  );
}
