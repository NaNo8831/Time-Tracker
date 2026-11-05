============================================================
FILE: planning/STATE.md
============================================================

# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-11-05

---

## Current Phase

Sprint 007 Ready — Pay Cycle Alignment (Saturday–Friday weeks, fixed 14-day pay periods)

---

## Current Status

Sprint 006 (leave-entry bug fix, date jump, History links, Week 1/Week 2 labels) is complete, merged to `main` via PR, deployed to Vercel, and user-verified live (2026-11-05).

**Sprint 007 is now authorized.** The user supplied their last three pay periods: **Sep 19–Oct 2, Oct 3–Oct 16, Oct 17–Oct 30 (2026)**. These are **Saturday–Friday** blocks in a fixed 14-day cycle. Sep 19 is exactly 252 days (18 cycles) after **Sat 2026-01-10** — the first day of the user's original Google Sheet export, whose weekly blocks were also Saturday–Friday. The app, however, has used **Monday–Sunday weeks** and **ISO-odd/even pay periods** since Sprints 003–004, which is why its periods never matched the stubs.

Decisions made with the user (2026-11-05):
- **Saturday–Friday weeks everywhere**, pay period = two such weeks, fixed 14-day cycle anchored at 2026-01-10 (a documented code constant, not a setting).
- Pay stubs matter **for dates only** — no stub amounts / paid-hours comparison.
- This supersedes two earlier decisions: "ISO standard pay periods" (2026-07-09) and "weeks are Monday–Sunday" (Sprint 003).
- Rolling balance re-seeds from the sheet's own carried-in value **-12.12 at 2026-01-10**; Jan 10 (4.25 hrs, 7:00–11:15) and Jan 11 (empty) become importable; the three settings' `effective_date` moves 2026-01-12 → 2026-01-10. All additive SQL run by the user, gated by a reconciliation script against the sheet's own weekly balances.

---

## Active Sprint

`planning/sprints/007-pay-cycle-alignment/`

---

## Active Work

Builder: read `planning/sprints/007-pay-cycle-alignment/` in full, then stop at the code gate — post a concrete file-by-file plan and wait for explicit approval before writing any code. Do not release any SQL until the reconciliation script matches (see blueprint).

---

## Project Metadata

| Field | Value |
|---|---|
| Project name | Time Tracker |
| Client name | Ly-Ark |
| Project slug | time-tracker |
| One-sentence description | Time Tracker is a tool designed to help users track their worked time against a set target number of hours over the course a month with historical date to review. |
| Project type | Internal tool |
| Planning folder | time-tracker/ |
| Implementation repo | Downloaded project folder |
| Canonical GitHub repo | github.com/NaNo8831/Time-Tracker |
| Tech stack | Next.js 14 (App Router), Supabase (Postgres + Auth via `@supabase/ssr`), Tailwind CSS, Vitest, Vercel |

---

## v1 Scope Snapshot

See `planning/DOMAIN.md` and `docs/ARCHITECTURE.md`. Shipped through Sprint 006; Sprint 007 changes noted:

- **Pay Period Recap**: Week 1 / Week 2 stats, Actual/Delta counting every logged day, Rolling Balance as of the last fully-completed week, Leave Remaining (collapsible) + Weeks Left in Year, Prev/Next, per-week "Actual" modal with hover split and Day column. **Sprint 007**: weeks run Sat–Fri; a period is a fixed 14-day block anchored at 2026-01-10 (current period as of today: Oct 31 – Nov 13).
- **History tab**: fully-elapsed pay-period summary rows, each range linking to that period's Recap. **Sprint 007**: re-grouped into the new periods (totals change by design).
- **Daily Entry**, **Settings** (incl. Physical Year; **Sprint 007**: Weeks Left in Year counts Sat-start weeks), **Appearance**, **Deployment**: otherwise unchanged.
- Out of scope: stub amounts / paid-hours comparison, a configurable pay-cycle anchor, reports/analytics, multi-user, data before 2026-01-10.

---

## Next Actions

1. Builder executes Sprint 007 from `planning/sprints/007-pay-cycle-alignment/` only, starting with the mandatory code gate.
2. Release order at deploy time: merge/deploy the code first, then the user runs the SQL immediately (read-only display is briefly wrong in between; no data writes during that window).

---

## Blockers

None.

---

## Watch Items

- **Do not log new data in the window between deploy and SQL run** (display only is briefly off; logging is harmless but confusing to verify).
- The 53-ISO-week year-boundary limitation (old Rule 17) disappears with this sprint — fixed 14-day cycles don't depend on ISO weeks.
- Physical Year and paid-holiday lists may need entries for the coming year.
- No duplicate guard on leave entries (accepted).
- 2026-01-10 will now be imported (4.25 hrs); 2026-01-11 is empty. Data before 2026-01-10 still does not exist.
- Process: all work goes through Architect discussion first.

============================================================
FILE: planning/sprints/007-pay-cycle-alignment/requirements.md
============================================================

# Sprint 007 Requirements — Pay Cycle Alignment (Saturday–Friday)

## Background

The user's real pay periods (from their stubs) are Sep 19–Oct 2, Oct 3–Oct 16, Oct 17–Oct 30 (2026): Saturday–Friday, 14 days each. They anchor exactly to Sat 2026-01-10 (252 days = 18 cycles before Sep 19), the first day of the user's original Google Sheet, whose weekly blocks were also Saturday–Friday (the sheet's own printed weekly rollover balances are on this basis). The app instead uses Monday–Sunday weeks (a Sprint 003 choice made to avoid re-deriving numbers) and ISO odd/even pay periods (a Sprint 004 choice), so its periods and weekly totals never matched the stubs or the sheet.

## Goals

1. **Weeks are Saturday–Friday.** Weekly Actual/Target/Delta, the Rolling Balance, Recap, History, the week modal, and "last fully-completed week" all use Sat–Fri weeks.
2. **Pay periods are fixed 14-day blocks** anchored at **2026-01-10** (Week 1 = first Sat–Fri, Week 2 = the next). The anchor is a documented constant in code.
3. **Data alignment (additive SQL, run by the user):** import 2026-01-10 (session 07:00–11:15) and 2026-01-11 (empty — nothing to insert); move the three settings' `effective_date` from 2026-01-12 to 2026-01-10; set `rolling_balance_seed` to **-12.12** (the sheet's carried-in balance at 2026-01-10).
4. **Reconciliation gate:** before any SQL is released, a standalone script recomputes the Sat–Fri weekly chain from the saved sheet exports and matches the sheet's own printed weekly balances.
5. **Weeks Left in Year** counts Sat-start weeks instead of ISO (Monday) weeks.
6. **Retire ISO week code** (`isoWeek.ts`, `mondayOf`) and their tests — no dead code.

## Non-goals

- No stub amounts or paid-hours comparison (user confirmed: dates only).
- No configurable/settings-driven anchor.
- No change to Business Rules 1–6, 8–9, 11–12, 18 (Work Hours, Weekly Actual, Rolling Balance formula, Leave Bank, etc.) beyond the week-boundary wording in Rules 7 and 10 (Monday → week start/Saturday) and the replacement of Rules 13–17.
- No duplicate-leave guard, no leave editing, no Daily Entry changes.
- The Builder does not touch the database; the user runs the SQL.
- No deletion of any existing data.

## Users / Roles

Unchanged — single user, Supabase auth.

## Acceptance Summary

See `acceptance.md`. Headline: with code deployed and SQL run, History's period ranges match the user's stub ranges (Sep 19–Oct 2, Oct 3–Oct 16, Oct 17–Oct 30) and the current period reads Oct 31–Nov 13; weekly balances match the sheet; all tests/typecheck/build pass.

============================================================
FILE: planning/sprints/007-pay-cycle-alignment/blueprint.md
============================================================

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

============================================================
FILE: planning/sprints/007-pay-cycle-alignment/acceptance.md
============================================================

# Sprint 007 Acceptance — Pay Cycle Alignment

Sprint 007 is complete when all of the following are true:

## Code
- `payCycle.ts` exists with `PAY_CYCLE_ANCHOR = "2026-01-10"`, `payWeekStart`, `payPeriodStart`; tests pass for the user's stub dates, the anchor, dates before the anchor, and Saturday-ness.
- `isoWeek.ts`, `isoWeek.test.ts`, and `mondayOf` (and its tests) are gone; nothing in `src/` or `tests/` references ISO week numbers or Monday-based week logic. Grep confirms.
- Recap, History, Physical Year (Weeks Left in Year), `periods.ts`, `payPeriodRecap.ts`, `recap.ts` all use Sat–Fri weeks.
- `/?period=` snaps any date to its cycle start; a malformed value falls back to the current period.
- Updated/rebased tests keep every previously-covered behavior covered (future-day data counts, extendThroughWeek, last-completed-week rolling balance, period grouping incl. lone weeks, weeksLeftInYear).
- The permanent real-data test (`payCycleRealData.test.ts`) reproduces the sheet's printed -9.37 / -11.97 / -16.97 (±0.01) for Jan 10–16, 17–23, 24–30 with seed -12.12.
- `npm test`, `npx tsc --noEmit`, `npm run build` pass clean.

## Reconciliation gate (before SQL is released)
- The standalone script's full weekly table (Jan 10 → Jun 26, Sat–Fri) is within tolerance of the sheet's printed weekly Actual (±0.02) and rolling balance (±0.05) for **every** week, and is recorded in `planning/DECISIONS.md`.
- The script's expected new period boundaries include exactly **Sep 19–Oct 2, Oct 3–Oct 16, Oct 17–Oct 30** and the current period **Oct 31–Nov 13**.

## SQL
- `supabase/migration-007-sat-fri-weeks.sql` is additive and idempotent (re-run safe), no deletes; contains the Jan 10 import, the three `effective_date` moves (2026-01-12 → 2026-01-10), and the seed update to -12.12.

## Live (after deploy + SQL, user-checked)
- History's period ranges include Sep 19 – Oct 2, Oct 3 – Oct 16, and Oct 17 – Oct 30 exactly; the first period is Jan 10 – Jan 23.
- The Recap's current period reads Oct 31 – Nov 13 with Week 1 = Oct 31 – Nov 6 and Week 2 = Nov 7 – Nov 13; the headings say "Week 1"/"Week 2".
- Week modal days run Sat→Fri with correct Day names; clicking a History range opens the matching Recap.
- Jan 10 shows 4.25 hrs in its week; the Rolling Balance for a completed week matches the user's sheet/stub expectation (user spot-check).

## Non-goals confirmed untouched
- No stub-amount features, no configurable anchor, no Daily Entry changes, no duplicate-leave guard, no database access by the Builder, no data deleted.

## Regression
- Sprint 002–006 acceptance still holds (auth, leave-only-day display, date jump, themes, mobile layout, week modal/hover).

============================================================
FILE: planning/sprints/007-pay-cycle-alignment/handoff-prompt.md
============================================================

# Sprint 007 Builder Handoff Prompt

Read `templates/method/120x-agent-identity.md`, then `AGENTS.md`, then `planning/STATE.md` and `planning/DECISIONS.md`, then this sprint's `requirements.md`, `blueprint.md`, and `acceptance.md` in full.

Act as the Builder. Implement only what's in this sprint's files:

1. Add `src/lib/calculations/payCycle.ts` (anchor `2026-01-10`, `payWeekStart`, `payPeriodStart`) with tests built from the user's stub dates.
2. Replace Monday-based and ISO-based week logic everywhere with Sat–Fri weeks / fixed 14-day periods: `recap.ts`, `weekly.ts`, `periods.ts`, `payPeriodRecap.ts`, `physicalYear.ts`, `(app)/page.tsx` (normalize `?period=`), `(app)/history/page.tsx`. Delete `isoWeek.ts`, `isoWeek.test.ts`, and `mondayOf` with its tests. Re-base the affected tests without weakening any assertion.
3. Add the permanent real-data test `payCycleRealData.test.ts` (seed -12.12; sheet days Jan 10–30; expected -9.37 / -11.97 / -16.97 ±0.01).
4. Write and run the standalone reconciliation script (scratchpad, not committed) over all six saved CSV exports; **if any week is outside tolerance, STOP and report — do not release the SQL.** Record the full matched table in `planning/DECISIONS.md`.
5. Write `supabase/migration-007-sat-fri-weeks.sql` (additive, idempotent: Jan 10 import, three `effective_date` moves 2026-01-12 → 2026-01-10, seed → -12.12). Hand it to the user with the release order from the blueprint — you have no database access and must not attempt any.

Scope guards — do NOT:
- Add stub amounts / paid-hours comparison, a configurable anchor, a duplicate-leave guard, or any Daily Entry change.
- Change Business Rules 1–6, 8–9, 11–12, or 18 (only the week-boundary wording in Rules 7 and 10 and the replacement of Rules 13–17 change, and the Architect has already updated those docs).
- Delete or modify any data, or run any SQL.

Stop at the mandatory code gate before writing any code: post your concrete file-by-file plan, scope guards, and acceptance criteria, and wait for explicit approval.

At close: update `planning/STATE.md`, `planning/DECISIONS.md`, `planning/ARCHITECT_BRIEFING.md` (leading with a plain-English "Where things stand"), `docs/ARCHITECTURE.md`, `docs/VALIDATION.md`, `planning/FILE_INVENTORY.md`, and mark `planning/STATUS.json` `sprint-closed`. Do not commit to git unless the user explicitly asks.

============================================================
FILE: planning/STATUS.json
============================================================

{
  "schemaVersion": 1,
  "phase": "apply-pack",
  "sprint": "007-pay-cycle-alignment",
  "updated": "2026-11-05"
}
