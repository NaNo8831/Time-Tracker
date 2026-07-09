import {
  getBreakDurationSettings,
  getHolidays,
  getLeaveBankEntries,
  getStandardWorkdayHoursSettings,
  getWeeklyTargetSettings,
} from "@/lib/data/settings";
import { LEAVE_TYPES } from "@/lib/types";
import {
  addBreakDuration,
  addHoliday,
  addLeaveBank,
  addStandardWorkdayHours,
  addWeeklyTarget,
  deleteHoliday,
} from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const [weeklyTargets, breakDurations, standardWorkdayHours, leaveBanks, holidays] =
    await Promise.all([
      getWeeklyTargetSettings(),
      getBreakDurationSettings(),
      getStandardWorkdayHoursSettings(),
      getLeaveBankEntries(),
      getHolidays(),
    ]);

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
      <p className="text-sm text-slate-600">
        Every setting below is effective-dated: adding a new entry never
        overwrites history, and past weeks keep using the value that was in
        effect at the time. Only one entry is allowed per effective date.
      </p>

      {searchParams.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-base font-medium text-slate-900">Weekly Target Hours</h2>
        <form action={addWeeklyTarget} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-slate-600">Hours / week</label>
            <input
              name="hours"
              type="number"
              step="0.25"
              required
              className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">Effective date</label>
            <input
              name="effectiveDate"
              type="date"
              required
              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            Add entry
          </button>
        </form>
        <HistoryList
          rows={weeklyTargets.map((t) => ({
            id: t.id,
            effectiveDate: t.effectiveDate,
            label: `${t.hours} hrs/week`,
          }))}
        />
        <hr className="border-slate-200" />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-slate-900">Break Duration</h2>
        <p className="text-sm text-slate-600">
          The default break deducted on a day with sessions logged, unless overridden
          for that specific day on the Daily Entry screen.
        </p>
        <form action={addBreakDuration} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-slate-600">Minutes</label>
            <input
              name="minutes"
              type="number"
              step="5"
              required
              className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">Effective date</label>
            <input
              name="effectiveDate"
              type="date"
              required
              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            Add entry
          </button>
        </form>
        <HistoryList
          rows={breakDurations.map((b) => ({
            id: b.id,
            effectiveDate: b.effectiveDate,
            label: `${b.minutes} min`,
          }))}
        />
        <hr className="border-slate-200" />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-slate-900">Paid Holidays</h2>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-700">
            Standard Workday Hours (Holiday Credit)
          </h3>
          <form action={addStandardWorkdayHours} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-slate-600">Hours</label>
              <input
                name="hours"
                type="number"
                step="0.25"
                required
                className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600">Effective date</label>
              <input
                name="effectiveDate"
                type="date"
                required
                className="rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
            >
              Add entry
            </button>
          </form>
          <HistoryList
            rows={standardWorkdayHours.map((s) => ({
              id: s.id,
              effectiveDate: s.effectiveDate,
              label: `${s.hours} hrs`,
            }))}
          />
        </div>

        <form action={addHoliday} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-slate-600">Date</label>
            <input
              name="date"
              type="date"
              required
              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">Label</label>
            <input
              name="label"
              type="text"
              required
              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            Add holiday
          </button>
        </form>
        <ul className="divide-y divide-slate-200 text-sm">
          {holidays.map((h) => (
            <li key={h.id} className="flex items-center justify-between py-1.5">
              <span>
                {h.date} — {h.label}
              </span>
              <form action={deleteHoliday}>
                <input type="hidden" name="id" value={h.id} />
                <button type="submit" className="text-xs text-red-600 hover:underline">
                  Remove
                </button>
              </form>
            </li>
          ))}
          {holidays.length === 0 && (
            <li className="py-1.5 text-slate-500">No holidays added yet.</li>
          )}
        </ul>
        <hr className="border-slate-200" />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-slate-900">Leave Banks</h2>
        <form action={addLeaveBank} className="flex flex-wrap items-end gap-3">
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
            <label className="block text-xs text-slate-600">Total hours</label>
            <input
              name="totalHours"
              type="number"
              step="0.1"
              required
              className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">Effective date</label>
            <input
              name="effectiveDate"
              type="date"
              required
              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">Note (optional)</label>
            <input
              name="note"
              type="text"
              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            Add entry
          </button>
        </form>
        {LEAVE_TYPES.map((type) => (
          <div key={type} className="pt-2">
            <h3 className="text-sm font-medium capitalize text-slate-700">{type}</h3>
            <HistoryList
              rows={leaveBanks
                .filter((b) => b.leaveType === type)
                .map((b) => ({
                  id: b.id,
                  effectiveDate: b.effectiveDate,
                  label: `${b.totalHours} hrs${b.note ? ` — ${b.note}` : ""}`,
                }))}
            />
          </div>
        ))}
        <hr className="border-slate-200" />
      </section>
    </main>
  );
}

function HistoryList({
  rows,
}: {
  rows: { id: string; effectiveDate: string; label: string }[];
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">No entries yet.</p>;
  }

  return (
    <ul className="divide-y divide-slate-200 text-sm">
      {rows.map((row) => (
        <li key={row.id} className="flex justify-between py-1.5">
          <span>{row.label}</span>
          <span className="text-slate-500">effective {row.effectiveDate}</span>
        </li>
      ))}
    </ul>
  );
}
