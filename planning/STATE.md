# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-11-06

---

## Current Phase

Sprint 008 Built — awaiting user cutover (Neon Postgres + single-password login); not committed

---

## Current Status

Sprint 007 (Saturday–Friday weeks, fixed 14-day pay periods anchored 2026-01-10) is complete: merged, deployed, its SQL run by the user, and the new period dates confirmed live (2026-11-05). A follow-up hotfix (PR #3, `resolvePeriodStart()`) fixed the Recap's Prev/Next buttons and History links, which had all been showing the current period; it is merged to `main` — the user should confirm Prev/Next now works.

**Sprint 008 is now authorized.** The user needs their second free Supabase project for something else and asked to move Time Tracker's data storage to something free. Research (2026-11-06) found **Neon** (permanent free plan, no card; per Neon's own FAQ 100 projects × 1 GB each, scales to zero and wakes automatically) the best fit because the tables are already Postgres. Decisions made with the user:

- **Database:** Neon Postgres, accessed only from the server with a secret connection string.
- **Login:** replace Supabase Auth with **one password** (stored hashed in an environment variable) plus a signed login cookie.
- **Backups:** a script the user runs for a full export; Neon's free restore window is short, so exports are the real safety net.
- Supabase stays untouched until the user has verified the new setup; deleting the Supabase project is the user's own later step.

This supersedes: "Auth is Supabase email/password" (2026-07-09), "Backups rely on Supabase's built-in automatic backups" (2026-07-09), and "RLS enabled on all tables" (the database is no longer reachable from the browser at all).

---

## Active Sprint

`planning/sprints/008-supabase-to-neon/`

---

## Active Work

Code complete and verified locally (tsc clean, 114/114 tests, build clean, SQL checked on PGlite, login smoke-tested). Nothing is committed (branch `sprint-008-supabase-to-neon`). The user now runs the cutover in `docs/OPERATIONS.md`; the Builder has no database access.

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
| Tech stack | Next.js 14 (App Router), Neon Postgres (Supabase until Sprint 008 ships), single-password cookie login (Supabase Auth until Sprint 008 ships), Tailwind CSS, Vitest, Vercel |

---

## v1 Scope Snapshot

Features are unchanged by Sprint 008 (see `planning/DOMAIN.md`): Pay Period Recap (Sat–Fri weeks, fixed 14-day periods anchored 2026-01-10), per-week modal, History with links to each period, Daily Entry (date picker auto-navigates, leave loads on any date), Settings (incl. Physical Year, 5 themes), Vercel auto-deploy. Sprint 008 changes only where data is stored and how login works.

- Out of scope: any feature change, schema redesign, multi-user, stub paid-hours comparison, deleting the Supabase project (user does that after verifying).

---

## Next Actions

1. User: put `DATABASE_URL` in this project's `.env.local` (it was missing when checked), create the Neon project, run `neon/schema.sql`, take before screenshots, rehearse `npm run db:migrate`, add the three env vars to Vercel, final copy, merge, verify.
2. User: confirm the Prev/Next hotfix works live; take a first backup and test-restore it.
3. Afterwards the user removes old Supabase vars and deletes the Time Tracker Supabase project.

---

## Blockers

None.

---

## Watch Items

- **Cutover safety**: Supabase stays untouched and its Vercel env vars stay in place until the new setup is verified; rollback = redeploy the previous Vercel deployment.
- **Data freeze**: don't log entries between the final data copy and the cutover (a few minutes).
- **Supabase free tier** connects directly over IPv6 only; the copy script should use Supabase's "Session pooler" connection string if the user's network lacks IPv6.
- **Type/timezone parity**: the new data layer must return exactly the shapes the app has always received ('YYYY-MM-DD' strings, ISO timestamps whose characters 11–16 are HH:MM in UTC, numbers for hours). A mismatch would silently shift displayed times.
- Free-tier terms change often (figures come from Neon's own FAQ and third-party comparison pages); confirm on neon.com before cutover.
- The user's DB passwords live in the gitignored `supabase/information.md`; never commit credentials or paste them into chat.
- No duplicate guard on leave entries (accepted). Physical Year and holiday lists may need entries for the coming year.
