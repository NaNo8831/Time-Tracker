# Architecture

Time Tracker v1 — architecture defined by the Architect Layer across Packs 001-005.

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
| `physical_year_settings` | User-entered year date ranges, for Weeks Left in Year. Not effective-dated — looked up by "which range contains this date." | `start_date`, `end_date`, `note` |

All effective-dated tables share the "most recent entry with effective_date <= the date being calculated" lookup rule.

**Critical**: the earliest `weekly_target_settings` entry's `effective_date` determines the first week the whole app computes. As of Sprint 004 this is `2026-01-12`.

**Important**: `day_entries`/`sessions`/`leave_entries` are not restricted to past dates — a user can and does log data (especially leave) for future dates. All weekly/daily calculations must treat "future" purely as "no data yet, naturally contributes 0," never as an artificial hard stop (Sprint 005 fixed a bug where the weekly aggregation incorrectly did the latter).

## Calculation Rules

Rules 1-5, 7-17 unchanged since Sprint 004 — see `planning/DOMAIN.md`. **Rule 6 (Sprint 005)**: Weekly Actual Hours sums Work Hours for all 7 days in a week regardless of the day's relation to "today" — the rule's wording never said otherwise; a day-loop bug that stopped at today was fixed.

`src/lib/calculations/isoWeek.ts` and `physicalYear.ts` implement Sprint 004's rules as standalone, UI-independent, unit-tested modules, same pattern as the rest of `src/lib/calculations/`. Sprint 005 adds `splitWeekActual()` (in `dailyBreakdown.ts` or similar) as a presentation-only split of the same Rule 5/6 total — not a new business rule.

## Screens (v1, updated Sprint 005)

- **Login** — Supabase Auth sign-in.
- **Daily Entry** — first in nav order. Sessions, break override, leave hours, any date past or future. No "Recent Entries" list. Forms refresh via a client-side `router.refresh()` after saving.
- **Pay Period Recap** (landing page) — Week 1 + Week 2 stats (Actual now correctly includes all logged days, not just through-today), Rolling Balance, Leave Remaining (collapsible), Weeks Left in Year, Prev/Next period navigation. **Sprint 005**: no more always-visible 14-day table; each week's "Actual" card opens a modal with that week's 7-day log (with a Day-of-week column) and carries a hover tooltip splitting hours through-today vs. later-this-week (by leave type).
- **History** — every fully-elapsed pay period (excludes the current one), ISO odd/even paired, period-level summary rows only — no drill-down (unchanged by Sprint 005, by explicit decision).
- **Settings** — weekly target, break duration, standard workday hours (under Paid Holidays), leave banks, holidays, Physical Year list, and Appearance (5 color/dark-mode presets).

## Client-side Interactivity

The app is server-rendered by default (Server Components + Server Actions, no client-side data fetching). Three deliberate, scoped exceptions exist so far: the theme picker (`ThemePicker.tsx`), the collapsible section (`CollapsibleSection.tsx`), the form-refresh wrapper (`ActionForm.tsx`), and now (Sprint 005) the week drill-down modal. Each is a small, single-purpose client component — no shared modal/dialog abstraction exists yet; introduce one only if a fourth, differently-shaped case appears.

## Migration

One-time SQL scripts, run directly by the user. Sprint 004's import ran against a LIVE database with real data — strictly additive, no destructive operations, with mandatory regression verification against every previously-proofed number. Completed and verified 2026-07-09.

## Deployment

Live on Vercel (`https://time-tracker-red-six.vercel.app`), GitHub auto-deploy on push to `main`. No OAuth/magic-link/password-reset flows exist, so no redirect-URL allow-list configuration was needed for the deployed domain.

## Out of Scope for v1

See `planning/DOMAIN.md`.
