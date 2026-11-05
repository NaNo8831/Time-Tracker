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
