# Architect Briefing

**Last updated:** 2026-07-09 (end of Sprint 003 Builder session)

---

## Where things stand

Sprint 003 — reworking how breaks are tracked and preparing to bring in 8 real weeks of history — is code-complete but not yet run against the live database. Two things worth knowing before anything else: first, a real bug was caught during this build (a default break duration would have been silently applied to empty, untouched days) and fixed before it ever ran against real data. Second, the plan's own math had an error — the source spreadsheet groups its weeks Saturday-through-Friday, but the app (by earlier, deliberate design) groups Monday-through-Sunday, and those two conventions don't produce the same weekly checkpoints from the same daily numbers. That was caught and corrected too, with a fully independent recomputation, before any SQL was handed off. The two SQL scripts are ready and waiting on the user to run them.

---

## Current status

Sprint 003 (Break Model Rework + Historical Migration) — code complete, unverified against live data. Nothing has been committed to git yet for the whole project (Sprint 002 and Sprint 003 code both sit uncommitted in the working tree) — the user has asked for a commit/push or PR next.

## Since last sprint

- **Break model rework**: `day_entries.lunch_taken` (boolean) replaced by `day_entries.break_minutes_override` (nullable, 15-min increments). `lunch_duration_settings` renamed to `break_duration_settings`. New rule: the default break duration only applies on a day that has sessions — an explicit override always applies regardless. This fixed a real bug found mid-build (see below).
- **Rolling Balance Seed**: new `rolling_balance_seed` table (single row, no UI) lets Rolling Balance continue from a real pre-app history value instead of starting at zero. `weekly.ts`'s `rollingBalance()` now accepts an optional seed parameter.
- **Historical import prepared**: two real CSV exports from the user's Google Sheet (2026-05-02–2026-06-26, 8 weeks) were parsed cell-by-cell, saved to `references/source-app/`, and turned into a one-time SQL import script covering every real day in that window.
- **Bug caught and fixed during the build**: the first `breakDeduction()` implementation applied the default break to every calendar day regardless of activity — a day with zero sessions would have shown a negative Work Hours figure from an unearned break deduction. Fixed before any test or import ran against it; regression test added (`recap.test.ts`: "does not apply the default break to days with no sessions").
- **Acceptance criteria math corrected during the build**: the Architect Pack originally set the import's settings `effective_date` to 2026-04-27 and copied the sheet's own week-ending Rolling Balance values straight into `acceptance.md`. Both were wrong, because the sheet's Saturday-Friday week blocks don't align with the app's Monday-Sunday weeks (Business Rule 4/7, locked since Sprint 002). Corrected `effective_date` to 2026-05-04 and independently recomputed the 8-week Rolling Balance table from the real daily Work Hours figures using the app's actual grouping logic. Full trail in `planning/DECISIONS.md`.
- 57/57 unit tests pass, typecheck clean, production build clean, dev-server smoke test against the real (still-empty) Supabase project shows no console errors.

## Architecture / file map

- `src/lib/calculations/workHours.ts` — `breakDeduction(overrideMinutes, defaultMinutesInEffect, hasSessions)`. The third parameter is the fix: without it, empty days get a phantom break deduction.
- `src/lib/calculations/recap.ts` — `RecapInput.rollingBalanceSeed: number`, threaded into `rollingBalance()`'s starting value.
- `src/components/BreakMinutesSelect.tsx` — the new break-override picker (blank = use default, else 0–240 min in 15-min steps).
- `supabase/schema-migration-003-break-rework.sql` — one-time ALTER script for the already-live database (break rename/rework + new `rolling_balance_seed` table). Run this FIRST.
- `supabase/migration-003-import-2026-05-02-to-2026-06-26.sql` — the data import. Run this SECOND, after the app's Sprint 003 code is deployed/running.
- `supabase/schema.sql` — updated to the new end-state for future fresh installs.
- `references/source-app/sheet-export-*.csv` — the two real source exports, saved verbatim.

## Decisions

See `planning/DECISIONS.md` for the full log, including the detailed entry documenting the effective_date/acceptance-table correction (search for "Builder correction during Sprint 003 execution").

## Risks / watch-items

- **Not yet verified live**: none of Sprint 003's code or data has run against the actual Supabase project. This is the single most important open item.
- The `rolling_balance_seed` (-27.67) and `effective_date` (2026-05-04) will both need deliberate updates when a future January-2026 import happens — documented, not a bug to fix now.
- Nothing in this project has been committed to git yet. The user has asked to commit/push or open a PR as the next step — needs a check for whether a remote is configured (`AGENTS.md` lists "Canonical GitHub repo: UNKNOWN").

## Open questions for the Architect

- Carried over: the user-configurable pay-period-cycle question (`planning/QUESTIONS.md`) — unrelated to this sprint, still deferred.
- New: when the January-April 2026 import is eventually planned, its break-duration-default and standard-workday-hours values need to be re-derived from that period's real data — the "4-day week" era predates this sprint's "5-day week" assumptions and likely used different values.

## Validation / test status

- Automated: 57/57 unit tests passing, typecheck clean, production build clean.
- Manual/live: dev-server smoke test only (auth redirect, no console errors) — the actual break-override UI, the migration import, and the Rolling Balance numbers have NOT been checked against a live, populated database yet.

## Recommended next Architect action

Don't scope the January-2026 import yet. First, the user needs to:

1. Run `supabase/schema-migration-003-break-rework.sql`, then `supabase/migration-003-import-2026-05-02-to-2026-06-26.sql`, in that order.
2. Verify the Weekly Recap and History tab against the exact Rolling Balance table in `planning/sprints/003-break-rework-and-migration/acceptance.md`.
3. Spot-check the four worked-example dates (2026-05-14, 05-20, 05-25, 06-11) in the Daily Entry screen.

Once that comes back clean, the natural next Architect session is either (a) the January-April 2026 import, or (b) whatever the user prioritizes after seeing real data in the app for the first time.
