import {
  getBreakDurationSettings,
  getHolidays,
  getLeaveBankEntries,
  getPhysicalYears,
  getStandardWorkdayHoursSettings,
  getWeeklyTargetSettings,
} from "@/lib/data/settings";
import { LEAVE_TYPES } from "@/lib/types";
import ThemePicker from "@/components/ThemePicker";
import {
  addBreakDuration,
  addHoliday,
  addLeaveBank,
  addPhysicalYear,
  addStandardWorkdayHours,
  addWeeklyTarget,
  deleteHoliday,
  deletePhysicalYear,
} from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const [weeklyTargets, breakDurations, standardWorkdayHours, leaveBanks, holidays, physicalYears] =
    await Promise.all([
      getWeeklyTargetSettings(),
      getBreakDurationSettings(),
      getStandardWorkdayHoursSettings(),
      getLeaveBankEntries(),
      getHolidays(),
      getPhysicalYears(),
    ]);

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <h1 className="text-xl font-semibold text-[var(--color-text)]">Settings</h1>
      <p className="text-sm text-[var(--color-text-muted)]">
        Every setting below is effective-dated: adding a new entry never
        overwrites history, and past weeks keep using the value that was in
        effect at the time. Only one entry is allowed per effective date.
      </p>

      {searchParams.error && (
        <p className="rounded-md bg-[var(--color-error-bg)] px-3 py-2 text-sm text-[var(--color-error-text)]">
          {searchParams.error}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-base font-medium text-[var(--color-text)]">Appearance</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Applies instantly and is remembered on this device.
        </p>
        <ThemePicker />
        <hr className="border-[var(--color-border)]" />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-[var(--color-text)]">Weekly Target Hours</h2>
        <form action={addWeeklyTarget} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-[var(--color-text-muted)]">Hours / week</label>
            <input
              name="hours"
              type="number"
              step="0.25"
              required
              className="w-28 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)]">Effective date</label>
            <input
              name="effectiveDate"
              type="date"
              required
              className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-[var(--color-btn-bg)] px-3 py-1.5 text-sm text-[var(--color-btn-text)] hover:bg-[var(--color-btn-bg-hover)]"
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
        <hr className="border-[var(--color-border)]" />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-[var(--color-text)]">Break Duration</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          The default break deducted on a day with sessions logged, unless overridden
          for that specific day on the Daily Entry screen.
        </p>
        <form action={addBreakDuration} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-[var(--color-text-muted)]">Minutes</label>
            <input
              name="minutes"
              type="number"
              step="5"
              required
              className="w-28 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)]">Effective date</label>
            <input
              name="effectiveDate"
              type="date"
              required
              className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-[var(--color-btn-bg)] px-3 py-1.5 text-sm text-[var(--color-btn-text)] hover:bg-[var(--color-btn-bg-hover)]"
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
        <hr className="border-[var(--color-border)]" />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-[var(--color-text)]">Paid Holidays</h2>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--color-text-muted)]">
            Standard Workday Hours (Holiday Credit)
          </h3>
          <form action={addStandardWorkdayHours} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-[var(--color-text-muted)]">Hours</label>
              <input
                name="hours"
                type="number"
                step="0.25"
                required
                className="w-28 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)]">Effective date</label>
              <input
                name="effectiveDate"
                type="date"
                required
                className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-[var(--color-btn-bg)] px-3 py-1.5 text-sm text-[var(--color-btn-text)] hover:bg-[var(--color-btn-bg-hover)]"
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
            <label className="block text-xs text-[var(--color-text-muted)]">Date</label>
            <input
              name="date"
              type="date"
              required
              className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)]">Label</label>
            <input
              name="label"
              type="text"
              required
              className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-[var(--color-btn-bg)] px-3 py-1.5 text-sm text-[var(--color-btn-text)] hover:bg-[var(--color-btn-bg-hover)]"
          >
            Add holiday
          </button>
        </form>
        <ul className="divide-y divide-[var(--color-border)] text-sm">
          {holidays.map((h) => (
            <li key={h.id} className="flex items-center justify-between py-1.5">
              <span>
                {h.date} — {h.label}
              </span>
              <form action={deleteHoliday}>
                <input type="hidden" name="id" value={h.id} />
                <button type="submit" className="text-xs text-[var(--color-negative)] hover:underline">
                  Remove
                </button>
              </form>
            </li>
          ))}
          {holidays.length === 0 && (
            <li className="py-1.5 text-[var(--color-text-faint)]">No holidays added yet.</li>
          )}
        </ul>
        <hr className="border-[var(--color-border)]" />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-[var(--color-text)]">Leave Banks</h2>
        <form action={addLeaveBank} className="flex flex-wrap items-end gap-3">
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
            <label className="block text-xs text-[var(--color-text-muted)]">Total hours</label>
            <input
              name="totalHours"
              type="number"
              step="0.1"
              required
              className="w-28 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)]">Effective date</label>
            <input
              name="effectiveDate"
              type="date"
              required
              className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)]">Note (optional)</label>
            <input
              name="note"
              type="text"
              className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-[var(--color-btn-bg)] px-3 py-1.5 text-sm text-[var(--color-btn-text)] hover:bg-[var(--color-btn-bg-hover)]"
          >
            Add entry
          </button>
        </form>
        {LEAVE_TYPES.map((type) => (
          <div key={type} className="pt-2">
            <h3 className="text-sm font-medium capitalize text-[var(--color-text-muted)]">{type}</h3>
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
        <hr className="border-[var(--color-border)]" />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-[var(--color-text)]">Physical Year</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Used to compute "Weeks Left in Year" on the Recap page. Enter the start and
          end date of your organization's physical year — it doesn't need to match the
          calendar year.
        </p>
        <form action={addPhysicalYear} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-[var(--color-text-muted)]">Start date</label>
            <input
              name="startDate"
              type="date"
              required
              className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)]">End date</label>
            <input
              name="endDate"
              type="date"
              required
              className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)]">Note (optional)</label>
            <input
              name="note"
              type="text"
              className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-[var(--color-btn-bg)] px-3 py-1.5 text-sm text-[var(--color-btn-text)] hover:bg-[var(--color-btn-bg-hover)]"
          >
            Add entry
          </button>
        </form>
        <ul className="divide-y divide-[var(--color-border)] text-sm">
          {physicalYears.map((y) => (
            <li key={y.id} className="flex items-center justify-between py-1.5">
              <span>
                {y.startDate} – {y.endDate}
                {y.note ? ` — ${y.note}` : ""}
              </span>
              <form action={deletePhysicalYear}>
                <input type="hidden" name="id" value={y.id} />
                <button type="submit" className="text-xs text-[var(--color-negative)] hover:underline">
                  Remove
                </button>
              </form>
            </li>
          ))}
          {physicalYears.length === 0 && (
            <li className="py-1.5 text-[var(--color-text-faint)]">No physical years added yet.</li>
          )}
        </ul>
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
    return <p className="text-sm text-[var(--color-text-faint)]">No entries yet.</p>;
  }

  return (
    <ul className="divide-y divide-[var(--color-border)] text-sm">
      {rows.map((row) => (
        <li key={row.id} className="flex justify-between py-1.5">
          <span>{row.label}</span>
          <span className="text-[var(--color-text-faint)]">effective {row.effectiveDate}</span>
        </li>
      ))}
    </ul>
  );
}
