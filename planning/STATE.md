# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-11-06

---

## Current Phase

Sprint 009 Complete — live (2026-11-06); no sprint active

---

## Current Status

Everything planned is built, merged, deployed and verified live by the user (2026-11-06):

- **Sprint 007** — Saturday–Friday weeks and fixed 14-day pay periods anchored 2026-01-10 (with the Prev/Next hotfix, PR #3).
- **Sprint 008** — data moved from Supabase to Neon Postgres, Supabase Auth replaced by a single-password login (PR #4). Rehearsal and final copies matched on every table; Recap and History match the pre-cutover screenshots. A first full backup was taken, stored safely off the computer, and test-restored into a scratch Neon database (row counts matched; scratch project deleted).
- **Sprint 009** — "Last backup: <date> (N days ago)" note in the app header (amber after 35 days; `No backup yet` if none; recorded by `npm run db:backup` in the one-row `last_backup` table, seeded with 2026-11-06) and a "Today" link between Prev and Next on the Recap (PR #7). The user ran the SQL and confirmed it works.
- Monthly backup reminder added to `docs/OPERATIONS.md` (PR #6); README and stack lines updated (PR #5).

Supabase still holds a copy of the data from the 2026-11-06 final copy and is the fallback until the user deletes the project (their own step).

---

## Active Sprint

None. Last completed: `planning/sprints/009-backup-note-and-today-button/`.

---

## Active Work

None.

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

Pay Period Recap (Sat–Fri weeks, fixed 14-day periods anchored 2026-01-10, Prev / Today / Next), per-week modal, History with links to each period, Daily Entry, Settings (incl. Physical Year, 5 themes), single-password login, user-run backup script with a "last backup" note in the header, Vercel auto-deploy.

- Out of scope: automated/scheduled backups or reminders, an in-app backup button, multi-user, stub paid-hours comparison.

---

## Next Actions

1. User (monthly): run `npm run db:backup` and copy the file somewhere safe; the header shows the date and turns amber after 35 days.
2. User (their own pace, after a few good days): remove `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY` from Vercel (all environments) and `SUPABASE_DB_URL` from `.env.local`, then delete the Time Tracker project in Supabase.
3. User: confirm Settings > Physical Year shows its row on the live site (the restore test shows 1 row exists).
4. Architect: no further sprint planned; start one when new needs come up (`/architect`).

---

## Blockers

None.

---

## Watch Items

- **Supabase fallback**: its data copy dates from 2026-11-06; it is stale for anything logged since. Do not roll back to it after real new entries without re-entering them.
- **What the header date means**: the backup script finished writing the file, not that the user copied it somewhere safe.
- **Type/timezone parity**: the data layer must keep returning the shapes the app has always received ('YYYY-MM-DD' strings, ISO timestamps whose characters 11-16 are HH:MM in UTC, numbers for hours).
- **Neon free plan**: sleeps when idle (first page after a gap is slower) and has a short restore window; terms change, so confirm on neon.com before relying on any limit. Backups are the real safety net.
- **Stale local cache**: if the dev Recap ever looks blank, stop `npm run dev`, delete the `.next` folder and restart (this caused the blank page during the Sprint 008 rehearsal; it was not a code bug).
- The user's DB passwords live in the gitignored `supabase/information.md` and `.env.local`; never commit credentials or paste them into chat.
- No duplicate guard on leave entries (accepted). Physical Year and holiday lists may need entries for the coming year.
