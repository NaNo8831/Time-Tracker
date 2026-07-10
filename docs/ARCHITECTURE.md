# Architecture

Time Tracker v1 — architecture defined by the Architect Layer across Packs 001-004.

---

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Supabase (Postgres + Auth via `@supabase/ssr`), Vercel, Vitest.

## Users & Access

Single user, personal use, gated by Supabase email/password login via middleware.

## Data Model

| Table | Purpose | Key Fields |
|---|---|---|
| `day_entries` | One row per date. | `date` (unique), `break_minutes_override` |
| `sessions` | Check-in/check-out pairs per day. | `day_entry_id`, `check_in`, `check_out` |
| `leave_entries` | Leave hours logged against a date. | `date`, `leave_type`, `hours` |
| `holidays` | Recognized paid holidays. | `date`, `label` |
| `weekly_target_settings` | Effective-dated weekly target hours. | `hours`, `effective_date` (unique) |
| `break_duration_settings` | Effective-dated default break duration. | `minutes`, `effective_date` (unique) |
| `standard_workday_hours_settings` | Effective-dated holiday-credit hours. | `hours`, `effective_date` (unique) |
| `leave_banks` | Effective-dated total hours per leave type. | `leave_type`, `total_hours`, `effective_date` (unique per type) |
| `rolling_balance_seed` | One-time starting offset for Rolling Balance. No UI. | `balance`, `note` |
| `physical_year_settings` | **New Sprint 004.** User-entered year date ranges, for Weeks Left in Year. Not effective-dated — looked up by "which range contains this date." | `start_date`, `end_date`, `note` |

All effective-dated tables share the "most recent entry with effective_date <= the date being calculated" lookup rule.

**Critical**: the earliest `weekly_target_settings` entry's `effective_date` determines the first week the whole app computes. As of Sprint 004 this is `2026-01-12`.

## Calculation Rules

Rules 1-12 (Raw Hours through Effective-dating) are unchanged since Sprint 003 — see `planning/DOMAIN.md`.

**New, Sprint 004** (Rules 13-17 in `planning/DOMAIN.md`): ISO 8601 Week Number; Pay Period (two ISO weeks, odd/even paired); Weeks Left in Year (from the matching Physical Year record); the 53-ISO-week-year pairing edge case is a known, accepted limitation.

`src/lib/calculations/isoWeek.ts` and `physicalYear.ts` implement these as standalone, UI-independent, unit-tested modules, same pattern as the rest of `src/lib/calculations/`.

## Screens (v1, updated Sprint 004)

- **Login** — Supabase Auth sign-in.
- **Daily Entry** — first in nav order. Sessions, break override, leave hours. No "Recent Entries" list; reachable via day-row links from the Pay Period Recap.
- **Pay Period Recap** (landing page) — Week 1 + Week 2 stats, Rolling Balance, Leave Remaining, Weeks Left in Year, a clickable 14-day list bound to the period (not a rolling window), Prev/Next period navigation.
- **History** — every fully-elapsed pay period (excludes the current one), ISO odd/even paired.
- **Settings** — weekly target, break duration, standard workday hours (under Paid Holidays), leave banks, holidays, and the new Physical Year list.

## Migration

One-time SQL scripts, run directly by the user. As of Sprint 004, imports run against a LIVE database with real data — strictly additive, no destructive operations, with mandatory regression verification against every previously-proofed number.

## Out of Scope for v1

See `planning/DOMAIN.md`.
