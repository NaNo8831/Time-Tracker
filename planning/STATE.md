# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-11-06

---

## Current Phase

Sprint 009 Built — awaiting merge, deploy and the user's one SQL step; not committed

---

## Current Status

Sprint 008 (move to Neon Postgres + single-password login) is complete: merged (PR #4), deployed, verified live by the user on 2026-11-06 (Recap and History match the pre-cutover screenshots). The user took a first full backup with `npm run db:backup` and test-restored it into a scratch Neon database: every table's row count matched, scratch project deleted. The backup file is stored safely off the computer. Supabase still holds a copy of the data and is the fallback until the user deletes the project (their own step, after a few good days).

**Sprint 009 is now authorized.** Two small quality-of-life changes the user asked for, decisions made in the Architect conversation:

- **Last-backup note:** shown in the app header (the Nav bar, in the free space between the Settings link and "Sign out"), not buried in Settings. Reads e.g. `Last backup: Nov 6 (3 days ago)`; turns amber after 35 days; says `No backup yet` before any is recorded. The date is stored in the database: one tiny new table, written by `npm run db:backup` after the file is saved. The user runs one SQL statement in Neon that creates the table and records **2026-11-06** as the starting date (the backup they already took and stored).
- **Today link:** on the Recap, between Prev and Next (`← Prev   Today   Next →`). It goes to the current pay period. It is greyed out and not clickable when the user is already viewing the current period.

No calculation, page layout (beyond those two spots), or existing table changes.

---

## Active Sprint

`planning/sprints/009-backup-note-and-today-button/`

---

## Active Work

Code complete and verified locally (tsc clean, 123/123 tests, build clean, SQL checked on PGlite). Nothing is committed (branch `sprint-009-backup-note-and-today-button`). After merge/deploy the user runs `neon/migration-009-last-backup.sql` in Neon (steps in `docs/OPERATIONS.md`); the Builder has no database access.

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
| Tech stack | Next.js 14 (App Router), Neon Postgres, single-password cookie login, Tailwind CSS, Vitest, Vercel |

---

## v1 Scope Snapshot

Pay Period Recap (Sat–Fri weeks, fixed 14-day periods anchored 2026-01-10), per-week modal, History with links to each period, Daily Entry, Settings (incl. Physical Year, 5 themes), single-password login, user-run backup script, Vercel auto-deploy. Sprint 009 adds the header backup note and the Recap "Today" link only.

- Out of scope: any calculation or data-model change, automated/scheduled backups, backup emails or notifications, in-app backup button, multi-user, stub paid-hours comparison.

---

## Next Actions

1. User: merge the Sprint 009 PR; after Vercel deploys, run `neon/migration-009-last-backup.sql` in the Neon SQL editor and reload (header should show `Last backup: Nov 6`); next `npm run db:backup` should print "Recorded in the app header."
2. User (independent): after a few good days remove `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY` from Vercel and `SUPABASE_DB_URL` from `.env.local`, then delete the Time Tracker project in Supabase.
3. User: confirm Settings > Physical Year shows its row on the live site.
4. Architect: no further sprint planned.

---

## Blockers

None.

---

## Watch Items

- **Deploy order**: deploy the code first, then the user runs the SQL. Until the SQL runs, the header must show `No backup yet` and every page must still load (the backup lookup must never throw).
- **What the note means**: the date records that `npm run db:backup` finished writing the file, not that the user copied it somewhere safe. The docs and the UI wording must not claim more.
- **Backup script becomes a writer**: it was read-only; it will now write exactly one row (`last_backup`) after the file is saved. A failure to record must never fail or hide a successful backup.
- The new table is bookkeeping, not user data: it is excluded from the backup export and the Supabase-to-Neon copy script, but is part of `neon/schema.sql`.
- Free-tier terms change often; confirm on neon.com before relying on any specific limit.
- Keep URL/param parsing and "is this the current period" logic in tested pure helpers (lesson from the Prev/Next hotfix, PR #3).
- No duplicate guard on leave entries (accepted). Physical Year and holiday lists may need entries for the coming year.
