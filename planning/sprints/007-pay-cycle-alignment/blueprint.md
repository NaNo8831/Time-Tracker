# Sprint 007 Blueprint — Pay Cycle Alignment

## 1. New module: `src/lib/calculations/payCycle.ts`

```ts
import type { IsoDate } from "@/lib/types";
import { addDays } from "./dates";

/** First day (a Saturday) of the pay cycle the user's stubs are anchored to.
 *  Sep 19, Oct 3, Oct 17 2026 (the user's stub periods) are all 14k days after it. */
export const PAY_CYCLE_ANCHOR: IsoDate = "2026-01-10";

function daysBetween(a: IsoDate, b: IsoDate): number { /* UTC-anchored, (b - a) in days */ }
function floorDiv(n: number, d: number): number { return Math.floor(n / d); } // correct for negatives

/** Saturday that starts the Sat–Fri week containing `date` (aligned to the anchor). */
export function payWeekStart(date: IsoDate): IsoDate {
  const k = floorDiv(daysBetween(PAY_CYCLE_ANCHOR, date), 7);
  return addDays(PAY_CYCLE_ANCHOR, k * 7);
}

/** Saturday that starts the 14-day pay period containing `date` (Week 1 start). */
export function payPeriodStart(date: IsoDate): IsoDate {
  const k = floorDiv(daysBetween(PAY_CYCLE_ANCHOR, date), 14);
  return addDays(PAY_CYCLE_ANCHOR, k * 14);
}
```

Use the same UTC date pattern already used in `dates.ts`/`physicalYear.ts`. Handle dates before the anchor (negative offsets) via floor division — add a test.

### Tests: `tests/calculations/payCycle.test.ts` (new)
- `payPeriodStart` for the user's stub dates: 2026-09-19 → 2026-09-19; 2026-10-02 → 2026-09-19; 2026-10-03 → 2026-10-03; 2026-10-16 → 2026-10-03; 2026-10-17 → 2026-10-17; 2026-10-30 → 2026-10-17; 2026-10-31 → 2026-10-31; 2026-11-05 → 2026-10-31.
- `payWeekStart`: 2026-10-02 (Fri) → 2026-09-26; 2026-10-03 (Sat) → 2026-10-03; 2026-11-05 → 2026-10-31; 2026-11-07 → 2026-11-07.
- Anchor itself: `payPeriodStart("2026-01-10")` → `2026-01-10`; before anchor: `payPeriodStart("2026-01-09")` → `2025-12-27`; `payWeekStart("2026-01-09")` → `2026-01-03`.
- Every `payPeriodStart` result is a Saturday and `payWeekStart` ≤ date < `payWeekStart + 7`.

## 2. Swap the week boundary everywhere

- `src/lib/calculations/recap.ts`: replace `mondayOf` with `payWeekStart` (start week from the earliest weekly-target `effective_date`, current week from `today`, `extendThroughWeek` comparison). Rename the local variables (`startMonday` → `startWeek`, `currentWeekMonday` → `currentWeekStart`, `endWeekMonday` → `endWeekStart`). Day loop already iterates 7 days from the week start — unchanged. Update comments: weeks are Sat–Fri.
- `src/lib/calculations/weekly.ts`: remove `mondayOf` (and its tests in `weekly.test.ts`); update `weeklyDelta`'s doc/param name to "target in effect on that week's first day (Saturday)".
- `src/lib/calculations/periods.ts`: `groupWeeksIntoPayPeriods` groups by `payPeriodStart(week.weekStart)` (import from `payCycle`). Output shape unchanged.
- `src/lib/calculations/payPeriodRecap.ts`: logic unchanged (week2 = week1 + 7; "complete" = week's last day, `weekStart + 6`, strictly before `today` — i.e. its Friday has passed). Update the doc comment that references `isoWeek.ts`.
- `src/lib/calculations/physicalYear.ts`: `weeksLeftInYear` uses `payWeekStart` for today's and the end date's week (count of Sat-start weeks inclusive). Update doc/tests.
- `src/app/(app)/page.tsx`: default period = `payPeriodStart(today)`. **Normalize the `?period=` param**: `payPeriodStart(param)` so any date (including old Monday-based bookmarks) snaps to its cycle start; ignore a malformed param (fall back to the current period).
- `src/app/(app)/history/page.tsx`: current period to exclude = `payPeriodStart(today)`.
- Delete `src/lib/calculations/isoWeek.ts` and `tests/calculations/isoWeek.test.ts`.

### Tests to update (re-base fixtures, preserve each test's intent)
`tests/calculations/recap.test.ts`, `payPeriodRecap.test.ts`, `periods.test.ts`, `physicalYear.test.ts`, `weekly.test.ts` — many use Monday-based dates (e.g. 2026-06-01). Re-base them onto Sat–Fri weeks / the anchor cycle (e.g. use the stub dates above) and recompute expected values. Do not weaken assertions: every behavior currently covered (future-day data counts, extendThroughWeek, last-completed-week rolling balance, period grouping incl. lone first/last weeks, weeksLeftInYear) must remain covered. If a test only existed to assert Monday semantics (`mondayOf`), it is deleted with the function.

### Permanent real-data regression test (new): `tests/calculations/payCycleRealData.test.ts`
Using seed **-12.12**, target 32/wk, break default 0, standard workday 6.4, and the sheet's actual days for **2026-01-10 → 2026-01-30** (days listed in `references/source-app/sheet-export-2026-01-10-to-2026-02-06.csv`; Jan 10 = session 07:00–11:15; Jan 16 = session 09:00–10:00 + vacation 8; Jan 19 = vacation 6.4; Jan 20 = 08:00–16:15 with 60-min break override; Jan 29 = 10:30–16:00 with 60-min break override; etc.), assert `buildWeeklyRecap` weekly rolling balances equal the sheet's printed **-9.37, -11.97, -16.97** (±0.01) for the weeks ending Jan 16, Jan 23, Jan 30. This permanently pins the Sat–Fri model to the user's real sheet.

## 3. Reconciliation script (gate before SQL) — throwaway, not committed

A standalone Node script (in the scratchpad) that parses all six saved CSV exports in `references/source-app/` (Jan 10 – Jun 26), builds per-day work hours with the app's exact rules (Raw − Break + Leave + Holiday credit; `x` = break override, `v/s/p` = leave, `h` = holiday credit 6.4), groups into **Sat–Fri weeks starting 2026-01-10 with seed -12.12 and target 32**, and compares for every week: (a) week Actual vs the sheet's printed "Actual" and (b) rolling balance vs the sheet's printed rollover/"Under/Over" figure. Tolerance: ±0.02 on a week's Actual and ±0.05 on cumulative balance (the sheet rounds daily/weekly values to 2 decimals, e.g. Mar-4 raw 5.33). **Any week outside tolerance = stop and investigate; do not release the SQL.** Record the matched table (all weeks) in `planning/DECISIONS.md`.

Also include in the script's output the app's expected new period boundaries (Jan 10–23, ... Oct 17–30) to confirm they match the user's stubs.

## 4. SQL (user runs; Builder has no DB access) — `supabase/migration-007-sat-fri-weeks.sql`

Additive/idempotent, safe to re-run, no deletes:
1. Import 2026-01-10 only if absent: insert `day_entries (date)` for `'2026-01-10'` and one `sessions` row `'2026-01-10T07:00:00'` → `'2026-01-10T11:15:00'` (guard with a `do $$ ... if not exists (select 1 from day_entries where date = '2026-01-10')` block). 2026-01-11 is an empty day — nothing to insert.
2. `update weekly_target_settings set effective_date = '2026-01-10' where effective_date = '2026-01-12';` and the same for `break_duration_settings` and `standard_workday_hours_settings`.
3. Update the latest `rolling_balance_seed` row (same CTE pattern as migration 004) to `balance = -12.12` with an updated `note`.

**Release order at deploy time:** (a) Builder commits per the user's process; (b) PR merged → Vercel deploys the new code; (c) user immediately runs the SQL in the Supabase SQL editor; (d) verify live (acceptance). Between (b) and (c) the displayed week/period figures are briefly inconsistent — read-only, no data is written; the user should not log data in that window.

## 5. Docs the Builder updates at close

`planning/STATE.md`, `planning/DECISIONS.md` (record the reconciliation table and the release), `planning/ARCHITECT_BRIEFING.md`, `docs/ARCHITECTURE.md` (week/period model, `payCycle.ts`, removal of `isoWeek.ts`), `docs/VALIDATION.md`, `planning/FILE_INVENTORY.md`, `planning/STATUS.json`.

## Out of Scope

Stub amounts / paid-hours comparison; configurable anchor; duplicate-leave guard; leave editing; any Business Rule change beyond week-boundary wording (Rules 7, 10) and Rules 13–17's replacement; touching the database directly.
