# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-11-05

---

## Current Phase

Sprint 007 Complete (code + SQL written) — awaiting deploy and the user running the SQL

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

None. Sprint 007 (`planning/sprints/007-pay-cycle-alignment/`) is closed from the Builder side; the user still has to merge/deploy and run the SQL.

---

## Active Work

None for the Builder. Built: `payCycle.ts` (anchor 2026-01-10), Sat–Fri weeks/periods across recap, periods, physical year, Recap and History pages; `isoWeek.ts`/`mondayOf` removed; tests re-based (87/87 pass) plus a real-data test; reconciliation gate passed (24/24 weeks vs. the sheet); `supabase/migration-007-sat-fri-weeks.sql` written. Not committed.

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

1. User decides on commit/PR. Release order: merge → Vercel deploys → user immediately runs `supabase/migration-007-sat-fri-weeks.sql` in the Supabase SQL editor (display is briefly wrong in between; do not log entries in that window).
2. User verifies live: History shows Sep 19–Oct 2, Oct 3–Oct 16, Oct 17–Oct 30; Recap's current period is Oct 31–Nov 13.

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
