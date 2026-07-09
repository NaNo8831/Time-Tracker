# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-07-09

---

## Current Phase

Sprint 003 Built — Pending Live Import Verification

---

## Current Status

Sprint 003 (Break Model Rework + Historical Migration) is code-complete: the break/lunch model is reworked, a Rolling Balance Seed mechanism exists, and a one-time SQL import script for 8 real weeks (2026-05-02–2026-06-26) is ready. During execution, a real correctness bug was found and fixed (see below) and the Architect Pack's own acceptance criteria were corrected. Nothing has been run against the live database yet — that's the user's next step.

- 57/57 unit tests, typecheck, and production build all pass clean.
- **A real bug was caught and fixed before it shipped**: the initial `breakDeduction()` implementation applied the default break duration to every calendar day, including days with zero sessions — this would have silently subtracted the default break from every untouched day in a week. Fixed: the default now only applies when the day has at least one session; an explicit override always applies regardless.
- **A math error in the Architect Pack's own acceptance criteria was caught and corrected**: the original plan set `weekly_target_settings`' earliest `effective_date` to 2026-04-27 and copied the source sheet's own week-ending Rolling Balance checkpoints directly into `acceptance.md`. Neither was right — the sheet groups weeks Saturday-Friday, the app groups Monday-Sunday (an already-locked business rule), so the two conventions produce different weekly checkpoints from identical daily data. Corrected to `effective_date = 2026-05-04` (the Monday of the first full Monday-Sunday week with real activity) and an independently-recomputed 8-week Rolling Balance table. See `planning/DECISIONS.md` for the full trail.
- Two SQL scripts are ready for the user to run, in order: `supabase/schema-migration-003-break-rework.sql`, then `supabase/migration-003-import-2026-05-02-to-2026-06-26.sql`.
- Sprint 002 remains complete and hardened.

---

## Active Sprint

`planning/sprints/003-break-rework-and-migration/` — code complete, pending live SQL execution and verification against the corrected acceptance table.

---

## Active Work

User: run `supabase/schema-migration-003-break-rework.sql` in the Supabase SQL editor, then `supabase/migration-003-import-2026-05-02-to-2026-06-26.sql`. After that, verify the Weekly Recap / History tab against the exact Rolling Balance table in `planning/sprints/003-break-rework-and-migration/acceptance.md`.

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
| Canonical GitHub repo | UNKNOWN |
| Tech stack | Next.js 14 (App Router), Supabase (Postgres + Auth via `@supabase/ssr`), Tailwind CSS, Vitest, Vercel |

---

## v1 Scope Snapshot

See `planning/DOMAIN.md` and `docs/ARCHITECTURE.md` for full detail. Sprint 003 adds:

- Break model: `day_entries` gets a nullable `break_minutes_override` (15-minute increments) replacing the old `lunch_taken` boolean. When unset, falls back to the effective-dated `break_duration_settings` default (renamed from `lunch_duration_settings`) — but only on days that actually have sessions logged. (Built.)
- Rolling balance seed: a new one-row `rolling_balance_seed` table lets historical rolling balance continue from the source sheet's real running total instead of starting at zero. No UI for this in v1 — set once via SQL during migration. (Built.)
- Historical import: 2026-05-02 through 2026-06-26 (8 weeks), sourced from `references/source-app/sheet-export-2026-05-02-to-2026-05-29.csv` and `references/source-app/sheet-export-2026-05-30-to-2026-06-26.csv`. (SQL ready, not yet run.)
- Out of scope: any data before 2026-05-02, a configurable pay-period-cycle setting (still deferred), any UI for editing the rolling balance seed, reports/analytics, multi-user.

---

## Next Actions

1. User runs the two SQL scripts (schema, then data) against the live Supabase project, in order.
2. User verifies the Weekly Recap and History tab against `planning/sprints/003-break-rework-and-migration/acceptance.md`'s corrected Rolling Balance table.
3. Once verified, plan the January-April 2026 import as its own future sprint — do not fold it into this one. That import will also need to re-check whether the break-duration-default and standard-workday-hours values from that earlier "4-day week" era differ from this sprint's.

---

## Blockers

None blocking further Builder work — the code is complete and re-verified. Live import verification is blocked only on the user running the two SQL scripts.

---

## Watch Items

- **Critical**: `weekly_target_settings`' earliest `effective_date` is `2026-05-04` (the Monday of the first FULL Monday-Sunday tracked week) — this is already correctly set in the SQL script; do not change it without re-deriving the acceptance table.
- The `rolling_balance_seed` value (-27.67) and the earliest settings effective_date (2026-05-04) will both need to be replaced/adjusted when the eventual January-2026 import happens — this is expected and documented, not a bug to "fix" now.
- Keep secrets, credentials, and private tokens out of project files.
- Do not implement a configurable pay-period-cycle setting in this sprint — still deferred (`planning/QUESTIONS.md`).
- No code has been committed to git yet — the working tree has been building up since Sprint 002 with nothing checked in beyond the initial scaffold commit.
