# Sprint 002 Blueprint — Core MVP Build

## Approach

Implement the app in the following practical order, verifying each piece works before moving to the next:

1. Supabase schema (tables + RLS policies).
2. Auth (login screen + route protection).
3. Calculation engine (pure functions, no UI dependency) — highest risk, build and sanity-check first.
4. Settings / Preferences screen (needed before entry/recap have any real values to show).
5. Daily Entry screen.
6. Weekly Recap landing page (ties everything together).

## Tech Stack

- **Frontend/Backend**: Next.js (App Router), TypeScript.
- **Styling**: Tailwind CSS (see `planning/DECISIONS.md`, 2026-07-09).
- **Database**: Supabase (Postgres), accessed via the Supabase JS client.
- **Auth**: Supabase Auth (email/password), single account provisioned directly in the Supabase dashboard — no in-app signup.
- **Data mutations**: Next.js Server Actions calling the Supabase server client directly. No separate REST/GraphQL API layer (see `docs/API.md`).
- **Hosting**: Vercel for v1.

## Environment / Setup

- Supabase project URL, anon key, and service role key are supplied via local `.env.local` (untracked). The Builder should add a `.env.local.example` with placeholder keys (no real values) so setup is documented without leaking secrets.
- The one user account is created manually in the Supabase Auth dashboard, not through app code.

## Data Model (implement exactly as specified in `docs/ARCHITECTURE.md`)

- `day_entries` — `id`, `date` (unique), `lunch_taken` (boolean).
- `sessions` — `id`, `day_entry_id` (FK to `day_entries`), `check_in` (timestamp), `check_out` (timestamp).
- `leave_entries` — `id`, `date`, `leave_type` (enum: vacation | sick | paternity), `hours` (numeric, supports partial-day).
- `holidays` — `id`, `date`, `label`.
- `weekly_target_settings` — `id`, `hours`, `effective_date`.
- `lunch_duration_settings` — `id`, `minutes`, `effective_date`.
- `standard_workday_hours_settings` — `id`, `hours`, `effective_date`.
- `leave_banks` — `id`, `leave_type` (enum), `total_hours`, `effective_date`, `note`.

RLS: enable on every table above; one policy per table allowing all operations (`select`, `insert`, `update`, `delete`) when `auth.role() = 'authenticated'` (see `planning/DECISIONS.md`, 2026-07-09). Do not add a `user_id` column or per-row ownership scoping in Sprint 002.

## Calculation Engine

Implement as a standalone module (e.g., `lib/calculations/`) with pure functions, independent of any UI framework code, so it can be unit tested directly:

1. `rawHours(sessions)` — sum of `(check_out - check_in)` across a day's sessions.
2. `lunchDeduction(lunchTaken, lunchDurationSettingsAtDate)` — the effective lunch duration if `lunchTaken`, else 0.
3. `leaveHours(leaveEntriesForDate)` — sum of that date's leave entries, all types.
4. `holidayCredit(date, holidaysList, standardWorkdayHoursSettingsAtDate)` — the effective standard workday hours if `date` is in `holidaysList`, else 0.
5. `workHours(day)` = rawHours − lunchDeduction + leaveHours + holidayCredit.
6. `weeklyActualHours(daysInWeek)` — sum of `workHours` for each day in the week.
7. `weeklyDelta(weeklyActualHours, weeklyTargetSettingsAtMonday)` — actual minus the target in effect on that week's Monday (per Business Rule 4).
8. `rollingBalance(weeklyDeltasInOrder)` — cumulative sum across all tracked weeks, in date order.
9. `leaveBankRemaining(leaveType, leaveBanksForType, leaveEntriesForType)` — latest bank total (by `effective_date`) minus sum of that type's leave entries dated on/after that bank entry's `effective_date`.

Every effective-dated lookup (weekly target, lunch duration, standard workday hours, leave bank total) must implement the same rule: the most recent row with `effective_date <= the date being calculated`. Never use the current/latest row for a past date.

## Screens (v1)

- **Login** (`/login`): email + password fields, Supabase Auth sign-in. Redirects to the recap on success.
- **Weekly Recap** (`/`, default/home, auth-protected): current week's hours vs. target, rolling balance, leave balances remaining. Clean numbers only — no letter codes, no raw balance math exposed.
- **Daily Entry** (`/entries` or `/entries/[date]`, auth-protected): add/edit a day — sessions (add/remove check-in/check-out pairs), "took lunch" toggle, optional leave hours by type.
- **Settings / Preferences** (`/settings`, auth-protected): manage weekly target, lunch duration, standard workday hours, and leave banks (each with an "add new dated entry" action and a visible history list), plus the paid holiday list (add/remove date + label).

## Out of Scope for This Sprint

- Migration execution or tooling (Sprint 003).
- Anything on the "Out of Scope for v1" list in `planning/DOMAIN.md`.
