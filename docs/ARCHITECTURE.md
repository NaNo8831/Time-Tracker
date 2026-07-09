# Architecture

Time Tracker v1 — architecture defined by the Architect Layer. Data model and calculation rules locked in Architect Pack 001; auth/styling/data-access in Pack 002; break model rework, rolling balance seed, and historical migration in Pack 003.

---

## Stack

- **Application**: Next.js (App Router), TypeScript, deployed to Vercel for v1.
- **Styling**: Tailwind CSS.
- **Database**: Supabase (Postgres).
- **Auth**: Supabase Auth, email/password, single account (no signup flow).
- **Data access**: Next.js Server Actions calling the Supabase client directly — no separate REST/GraphQL API layer.
- **Hosting**: Vercel for v1.

## Users & Access

Single user, personal use. Every route except the login screen requires a valid session (enforced via Next.js middleware).

## Data Model

| Table | Purpose | Key Fields |
|---|---|---|
| `day_entries` | One row per date. | `date` (unique), `break_minutes_override` (nullable, multiple of 15) |
| `sessions` | One or more check-in/check-out pairs per day. | `day_entry_id`, `check_in`, `check_out` |
| `leave_entries` | Vacation/sick/paternity hours logged against a date. | `date`, `leave_type`, `hours` |
| `holidays` | User-maintained list of recognized paid holidays. | `date`, `label` |
| `weekly_target_settings` | Effective-dated weekly target hours. | `hours`, `effective_date` (unique) |
| `break_duration_settings` | Effective-dated default break duration (minutes). Renamed from `lunch_duration_settings` in Sprint 003. | `minutes`, `effective_date` (unique) |
| `standard_workday_hours_settings` | Effective-dated hours credited for a holiday. | `hours`, `effective_date` (unique) |
| `leave_banks` | Effective-dated total hours per leave type. | `leave_type`, `total_hours`, `effective_date` (unique per type) |
| `rolling_balance_seed` | **New in Sprint 003.** A single-row starting offset for Rolling Balance, representing pre-app history (e.g., a source spreadsheet's running total). No Settings UI — set once via SQL. | `balance`, `note` |

All effective-dated tables share one lookup rule: the value "in effect" on a given date is the most recent row with `effective_date <= that date`. Each has a unique constraint preventing two entries for the same effective date (same leave type + date for `leave_banks`).

**Critical**: `weekly_target_settings`' earliest `effective_date` determines the first week the entire app computes (`mondayOf(earliest effective_date)` through the current week, every week in between, even with no data). Setting it earlier than real tracked history creates phantom zero-actual weeks that silently corrupt Rolling Balance. Always set it to the Monday of the actual earliest tracked week.

### Row Level Security

RLS is enabled on every table above (including `rolling_balance_seed`). Each has one policy permitting all operations to any authenticated session — not scoped by `user_id`, since only one account exists in v1.

## Calculation Rules

1. **Raw Hours (day)** = sum of `(check_out minus check_in)` across all sessions for that day.
2. **Break Deduction (day)** = the per-day manual override if set (multiple of 15 minutes), otherwise the break duration setting in effect that date. Applied once per day, independent of session count.
3. **Leave Hours (day)** = sum of that date's `leave_entries` hours, across all types.
4. **Holiday Credit (day)** = the standard workday hours setting in effect that date, if the date is in `holidays`; otherwise 0.
5. **Work Hours (day)** = Raw Hours minus Break Deduction plus Leave Hours plus Holiday Credit.
6. **Weekly Actual Hours** = sum of Work Hours for each day in the week.
7. **Weekly Delta** = Weekly Actual Hours minus Weekly Target Hours, using the target in effect on that week's Monday.
8. **Rolling Balance** = the Rolling Balance Seed (0 if unset) plus the cumulative sum of Weekly Delta across all tracked weeks.
9. **Leave Bank Remaining (type)** = latest `leave_banks` total for that type minus sum of that type's `leave_entries` hours logged on/after that bank entry's `effective_date`.

The calculation engine lives in `src/lib/calculations/` as standalone, UI-independent, unit-tested modules.

## Screens (v1)

- **Login** — Supabase Auth email/password sign-in.
- **Weekly Recap** (landing page) — hours vs. target, rolling balance, leave balances remaining, plus a trailing 14-day history table (raw/break/total/other-with-hover-breakdown).
- **Daily Entry** — sessions, break override, leave hours by type, for a given date. Auto-opens to today with a date switcher.
- **History** — every tracked week grouped into two-week chunks (naive chronological pairing, not real pay-period alignment), most recent first.
- **Settings / Preferences** — weekly target, break duration, standard workday hours, leave banks (nested inside Paid Holidays), and holiday list, each with history where applicable.

## Migration

One-time SQL scripts, run directly by the user against Supabase — never an in-app feature (single-user tool, strictly one-time operations). Sprint 003 covers 2026-05-02–2026-06-26. Earlier data is a separate, later sprint.

## Out of Scope for v1

See `planning/DOMAIN.md` — Out of Scope for v1.
