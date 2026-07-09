# Sprint 001 Blueprint — Discovery / Architecture

## Approach

This sprint's deliverable is the planning pack itself (this Architect Pack), produced through a discovery conversation with the user and a review of their existing Google Sheet. No code is produced in this sprint — the blueprint below is the architecture that Sprint 002 (Core MVP Build) will implement from.

## Tech Stack

- **Frontend/Backend**: Next.js (App Router).
- **Database**: Supabase (Postgres).
- **Hosting**: Vercel for v1. Self-hosting on the user's home server remains possible later since the app is not built with Vercel-specific lock-in.

## Data Model (logical design — for Sprint 002 to implement)

- `day_entries` — one row per date. Fields: date (unique), lunch_taken (boolean).
- `sessions` — one row per check-in/check-out pair. Fields: day_entry_id (FK), check_in (timestamp), check_out (timestamp). A day_entry can have one or more sessions.
- `leave_entries` — one row per logged leave amount. Fields: date, leave_type (vacation | sick | paternity), hours (supports partial-day amounts).
- `holidays` — one row per recognized paid holiday. Fields: date, label.
- `weekly_target_settings` — effective-dated changelog. Fields: hours, effective_date.
- `lunch_duration_settings` — effective-dated changelog. Fields: minutes, effective_date.
- `standard_workday_hours_settings` — effective-dated changelog. Fields: hours, effective_date.
- `leave_banks` — effective-dated changelog, per leave type. Fields: leave_type (vacation | sick | paternity), total_hours, effective_date, note.

All four "_settings"/"leave_banks" tables follow the same lookup rule: to get the value in effect on a given date, take the most recent row with `effective_date <= that date`. Never apply the current/latest row retroactively to past dates.

## Calculation Rules

1. Raw Hours (day) = sum of (check_out minus check_in) across all sessions for that day.
2. Lunch Deduction (day) = lunch_taken ? lunch_duration_settings value in effect that date : 0. Applied once per day, not per session.
3. Leave Hours (day) = sum of leave_entries hours logged for that date, across all leave types.
4. Holiday Credit (day) = date in holidays list ? standard_workday_hours_settings value in effect that date : 0.
5. Work Hours (day) = Raw Hours minus Lunch Deduction plus Leave Hours plus Holiday Credit.
6. Weekly Actual Hours = sum of Work Hours for each day in the week.
7. Weekly Delta = Weekly Actual Hours minus Weekly Target Hours (target in effect for that week — see open question in `planning/QUESTIONS.md` on the exact mid-week-change rule; default assumption: value in effect on the week's Monday).
8. Rolling Balance = cumulative sum of Weekly Delta across all tracked weeks.
9. Leave Bank Remaining (type) = most recent leave_banks total for that type (as of its effective_date) minus sum of that type's leave_entries hours dated on/after that effective_date.

## Screen Inventory (v1)

- **Weekly Recap (landing page)**: current week's hours vs. target, rolling balance, current leave balances remaining. Default/home screen.
- **Daily Entry**: add/edit a day — date, sessions (add/remove check-in/check-out pairs), "took lunch" toggle, optional leave hours by type.
- **Settings / Preferences**: manage weekly target (with history), lunch duration default (with history), standard workday hours (with history), leave banks (vacation/sick/paternity, each with history), and the paid holiday list.

## Migration Plan (planning only — execution is a future sprint)

- Source: Google Sheet at the URL in `planning/DOMAIN.md`, 2026 calendar-year rows only.
- Map: sheet rows to `day_entries` + `sessions` (splitting Check-in/Check-out and Check-in 2/Check-out 2 into two session rows where both exist) + `leave_entries` (from ADJ letter codes) + `holidays` (from the sheet's holiday list).
- The rolling balance at the migration cutover point should be seeded from the sheet's last known balance, or recomputed from the imported daily data — to be decided in Sprint 002 planning.

## Out of Scope for This Sprint

No code, schema execution, or UI work happens in Sprint 001. This blueprint is the input to Sprint 002, which requires its own Architect Pack and explicit build authorization.
