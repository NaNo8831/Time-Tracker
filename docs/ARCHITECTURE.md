# Architecture

Time Tracker v1 — architecture defined by the Architect Layer after discovery (Architect Pack 001).

---

## Stack

- **Application**: Next.js (App Router), deployed to Vercel for v1.
- **Database**: Supabase (Postgres).
- **Hosting**: Vercel for v1. The app is not built with Vercel-specific lock-in, so a move to self-hosting (the user's home server) remains possible later without a rewrite.

## Users

Single user, personal use. No multi-tenancy, roles, or accounts beyond a possible simple access gate (see open question in `planning/QUESTIONS.md`).

## Data Model

| Table | Purpose | Key Fields |
|---|---|---|
| `day_entries` | One row per date. | `date` (unique), `lunch_taken` (boolean) |
| `sessions` | One or more check-in/check-out pairs per day. | `day_entry_id`, `check_in`, `check_out` |
| `leave_entries` | Vacation/sick/paternity hours logged against a date, full or partial day. | `date`, `leave_type`, `hours` |
| `holidays` | User-maintained list of recognized paid holidays. | `date`, `label` |
| `weekly_target_settings` | Effective-dated weekly target hours. | `hours`, `effective_date` |
| `lunch_duration_settings` | Effective-dated default lunch duration. | `minutes`, `effective_date` |
| `standard_workday_hours_settings` | Effective-dated hours credited for a holiday. | `hours`, `effective_date` |
| `leave_banks` | Effective-dated total hours per leave type (vacation/sick/paternity). | `leave_type`, `total_hours`, `effective_date`, `note` |

All effective-dated tables share one lookup rule: the value "in effect" on a given date is the most recent row with `effective_date <= that date`. This preserves historical accuracy even after a setting changes later.

## Calculation Rules

1. **Raw Hours (day)** = sum of `(check_out minus check_in)` across all sessions for that day.
2. **Lunch Deduction (day)** = the lunch duration setting in effect that date, applied once per day if `lunch_taken` is true — independent of session count.
3. **Leave Hours (day)** = sum of that date's `leave_entries` hours, across all types.
4. **Holiday Credit (day)** = the standard workday hours setting in effect that date, if the date is in `holidays`; otherwise 0.
5. **Work Hours (day)** = Raw Hours minus Lunch Deduction plus Leave Hours plus Holiday Credit.
6. **Weekly Actual Hours** = sum of Work Hours for each day in the week.
7. **Weekly Delta** = Weekly Actual Hours minus Weekly Target Hours (target in effect for that week).
8. **Rolling Balance** = cumulative sum of Weekly Delta across all tracked weeks.
9. **Leave Bank Remaining (type)** = latest `leave_banks` total for that type minus sum of that type's `leave_entries` hours logged on/after that bank entry's `effective_date`.

## Screens (v1)

- **Weekly Recap** (landing page) — hours vs. target, rolling balance, leave balances remaining.
- **Daily Entry** — sessions, lunch toggle, leave hours by type, for a given date.
- **Settings / Preferences** — weekly target, lunch duration, standard workday hours, leave banks, and holiday list, each with history where applicable.

## Migration

One-time import of 2026 calendar-year entries from the source Google Sheet (see `planning/DOMAIN.md` for the link and mapping notes). Execution is planned in a future sprint, not Sprint 001.

## Out of Scope for v1

See `planning/DOMAIN.md` — Out of Scope for v1.
