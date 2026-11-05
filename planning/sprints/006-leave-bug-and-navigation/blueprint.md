# Sprint 006 Blueprint — Leave Entry Bug Fix + Navigation Improvements

## 1. Bug fix: `src/lib/data/entries.ts` — `getDayEntryDetail()`

Current behavior: queries `day_entries` for the date; if no row, returns `{ id: null, ..., sessions: [], leaveEntries: [] }` immediately. `leave_entries` is keyed by `date` (not `day_entry_id`), so it must NOT depend on the day record existing.

Required behavior:
- Query `day_entries` (by date, `maybeSingle`) and `leave_entries` (by date) **in parallel**, always.
- Query `sessions` only if a `day_entries` row exists (sessions hang off `day_entry_id`).
- Always return the leave entries.

To make this unit-testable without mocking Supabase, extract the assembly into a pure function (e.g. `buildDayEntryDetail({ date, dayEntry, sessions, leaveEntries })` in the same file or a small sibling module) that maps raw rows to `DayEntryDetail`, where `dayEntry` may be `null`. `getDayEntryDetail()` fetches rows and calls it.

**Audit**: while in this file and in `src/lib/data/`, check for any other place that gates leave (or any other date-keyed table) behind the existence of a `day_entries` row. Report findings at the code gate; do not change anything beyond what's needed to fix the same pattern.

### Tests
- `buildDayEntryDetail` with `dayEntry = null` and one or more leave rows returns `id: null`, empty sessions, and all leave entries mapped (this is the regression test for the reported bug).
- With a `dayEntry` and sessions plus leave, returns everything.
- With `dayEntry = null` and no leave, returns the empty shape.

### Live verification
After deploy (or via the isolated preview technique if auth blocks): open 2026-11-05; the leave entries must appear and each must be removable.

## 2. Date picker auto-navigates

File: `src/app/(app)/entries/[date]/page.tsx` (the `goToDate` form in the header) plus a new small client component, e.g. `src/components/DateJump.tsx`.

- `DateJump` renders `<input type="date" defaultValue={date}>` styled as today. On change, if the value matches `YYYY-MM-DD` and the year is within 2000–2099, call `router.push('/entries/' + value)` (use `useRouter` from `next/navigation`). Ignore empty/partial/out-of-range values (desktop typing changes the value per keystroke; the year guard prevents jumping mid-typing, e.g. year `0002`).
- Remove the "Go" button and the `<form action={goToDate}>`.
- `goToDate` in `src/app/(app)/entries/actions.ts` becomes unused — remove it (no dead code).
- Fifth deliberate client-side component; no shared abstraction needed.

## 3. History links to Recap

File: `src/app/(app)/history/page.tsx`.

- In each period row, render the `{periodStart} – {periodEnd}` range as a `<Link href={`/?period=${period.periodStart}`}>` styled like the existing accent links (`text-[var(--color-accent)] underline`).
- `periodStart` is already the pay period's Week 1 Monday — exactly what the Recap's `?period=` parameter expects. No other History changes.

## 4. Week labels

File: `src/app/(app)/page.tsx`.

- Replace `Week ${isoWeekNumber(week1.weekStart)}` / `Week ${isoWeekNumber(week2.weekStart)}` with the literal titles `Week 1` / `Week 2`. The `weekLabel` passed to `WeekLogModal` is derived from the same title, so the modal heading updates automatically.
- Remove the now-unused `isoWeekNumber` import from `page.tsx` only. Do **not** touch `isoWeek.ts` — `isoWeekNumber` is still used by `payPeriodWeek1Start()` for the odd/even pairing.

## Out of Scope

- Pay-period boundaries / ISO pairing (Sprint 007).
- Any calculation or business-rule change.
- Modifying or deleting existing leave rows (user does this via the UI).
- Duplicate-leave guards, leave editing.
