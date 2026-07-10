# Architect Briefing

**Last updated:** 2026-07-09 (Sprint 004 code complete, SQL handed to user)

---

## Where things stand

Sprint 004's code is done and fully verified — the landing page is now a true Pay Period Recap (two ISO-week-numbered weeks, clickable day rows, prev/next navigation), a new Physical Year setting drives a "Weeks Left in Year" figure, the History tab now excludes the current period and pairs weeks by the ISO odd/even rule, and Daily Entry/Nav got the requested cleanup. The bigger piece — importing 2026-01-12 through 2026-05-01 of real history — is written and independently double-checked: a standalone script recomputed every week's actual hours and rolling balance from the raw source data and it matches the architect's verified table exactly, week for week, including the critical already-live `-27.67` checkpoint. Nothing has touched the live database yet — two SQL scripts are ready and waiting on the user to run them.

---

## Current status

Sprint 004 (Pay Period Recap Redesign + Full-Year Historical Import) — code complete, unit-tested, typechecked, and build-verified. Not yet committed to git (user has not asked for a commit this session). SQL not yet run against the live database.

## Since last sprint

- **ISO week numbering**: `isoWeekNumber()` / `payPeriodWeek1Start()` in `src/lib/calculations/isoWeek.ts`, standard-compliant (Monday-Sunday weeks, Week 1 contains the year's first Thursday), verified against known reference dates.
- **Pay Period Recap**: `buildWeeklyRecap()` gained an opt-in `extendThroughWeek` option (default no-op, so every other caller is unaffected); `buildPayPeriodRecap()` in `src/lib/calculations/payPeriodRecap.ts` uses it to compute Week 1 + Week 2 together, even when Week 2 is still in the future.
- **Physical Year setting**: new `physical_year_settings` table (list-style, like Paid Holidays), `weeksLeftInYear()` in `src/lib/calculations/physicalYear.ts`.
- **`src/app/(app)/page.tsx`** fully rewritten as the Pay Period Recap landing page: Week 1 / Week 2 stat cards, Rolling Balance, Leave Remaining + Weeks Left in Year, a single 14-day day-by-day list (visual divider between the two weeks, each row links to `/entries/{date}`), and Prev/Next period navigation via a `?period=` search param.
- **History tab** (`src/app/(app)/history/page.tsx`): re-paired by the ISO odd/even rule (`groupWeeksIntoPayPeriods`, replacing the old naive chronological `chunkWeeksIntoPeriods`), and now excludes whichever period contains today.
- **Daily Entry**: "Recent Entries" section and its now-dead `listRecentDayEntries()` data function removed.
- **Nav**: reordered to Daily Entry, Recap, History, Settings.
- **Settings**: new Physical Year section (add/remove date ranges, same pattern as Paid Holidays).
- **Historical import prepared**: `supabase/schema-migration-004-physical-year.sql` (additive, one new table) and `supabase/migration-004-import-2026-01-12-to-2026-05-01.sql` (additive day_entries/sessions/leave_entries/holidays for ~90 real days, plus 3 settings `effective_date` UPDATEs and a `rolling_balance_seed` value UPDATE). Both handed to the user to run — Builder has no DB access.
- 74/74 unit tests pass (17 new: isoWeek, physicalYear, payPeriodRecap, extended recap, rewritten periods), typecheck clean, production build clean.

## Architecture / file map

- `src/lib/calculations/isoWeek.ts` — `isoWeekNumber()`, `payPeriodWeek1Start()`.
- `src/lib/calculations/payPeriodRecap.ts` — `buildPayPeriodRecap()`.
- `src/lib/calculations/physicalYear.ts` — `weeksLeftInYear()`.
- `src/lib/calculations/periods.ts` — `groupWeeksIntoPayPeriods()` (ISO-based, replaces the removed `chunkWeeksIntoPeriods`).
- `src/lib/calculations/recap.ts` — `buildWeeklyRecap(input, { extendThroughWeek? })`.
- `src/lib/data/settings.ts` — `getPhysicalYears()` / `addPhysicalYear()` / `removePhysicalYear()`.
- `src/app/(app)/page.tsx` — Pay Period Recap landing page (was Weekly Recap).
- `src/app/(app)/history/page.tsx`, `src/app/(app)/entries/[date]/page.tsx`, `src/app/(app)/settings/{page,actions}.tsx`, `src/components/Nav.tsx` — all updated per above.
- `supabase/schema-migration-004-physical-year.sql`, `supabase/migration-004-import-2026-01-12-to-2026-05-01.sql` — not yet run.
- `references/source-app/sheet-export-2026-01-10-to-2026-02-06.csv` through `sheet-export-2026-04-04-to-2026-05-01.csv` — the four real source exports, saved verbatim.

## Decisions

See `planning/DECISIONS.md` for the full log: the ISO-standard (not employer-anchored) pay-period decision, the Pay Period Recap layout decision (day-row navigates to the existing Daily Entry page, not a modal), the Physical Year setting shape, the History-tab-excludes-current-period decision, the stray `Mar-9` CSV row recovery, and the derived `2026-01-12` / `-7.87` seed with full mathematical justification.

## Risks / watch-items

- **Not yet executed**: the two Sprint 004 SQL scripts are written and independently verified against the architect's table, but have not been run against the live database. Until the user runs them and confirms, the app will show incomplete history (data starting 2026-05-02, not 2026-01-12).
- Same live-database care as Sprint 3: run `schema-migration-004-physical-year.sql` first, then the import script. Both are additive/idempotent-safe to re-run from the top if a partial run needs retrying.
- ISO week pairing has a known, accepted edge case in 53-ISO-week years — not solved in v1, accepted tradeoff.
- 2026-01-10 and 2026-01-11 are intentionally not imported (fall before the first fully-reconstructable Monday-Sunday week); their contribution is folded into the seed.

## Open questions for the Architect

None outstanding. The user-configurable pay-period-cycle question from earlier sessions was resolved this sprint (ISO standard, not configurable — explicit user decision).

## Validation / test status

- Automated: 74/74 unit tests passing, typecheck clean, production build clean.
- Data verification: a standalone Node script independently recomputed all 16 weeks' actual hours and rolling balance from the raw day-by-day import data and matched the architect's pre-verified table exactly, including the `-27.67` already-live boundary — see this session's work, not yet written into a permanent script (was a throwaway check, deleted after confirming).
- Manual/live: **not yet done** — SQL hasn't been run against the live database yet. The user should run both scripts, then check the acceptance criteria's Historical Import spot-checks (2026-01-20, 2026-02-13, 2026-03-05, 2026-04-09) and confirm the Sprint 3 numbers (2026-05-04 onward) are unchanged.

## Recommended next Architect action

None needed from the Architect. Next step is the user running the two SQL scripts and confirming the app looks right, then (if they want) asking for a git commit — nothing has been committed this session.
