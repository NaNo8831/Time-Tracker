# Sprint 003 Requirements — Break Model Rework + Historical Migration

## Goal

1. Rework the daily break/lunch model from a boolean flag to a manual per-day override (15-minute increments) that falls back to an effective-dated default when unset.
2. Add a one-time Rolling Balance seed so historical continuity from the source Google Sheet is preserved.
3. Import 8 real weeks of sheet data (2026-05-02 through 2026-06-26) via a one-time SQL script, as the first real-data test of the calculation engine.

## In Scope

- Schema: rename `lunch_duration_settings` → `break_duration_settings`; replace `day_entries.lunch_taken` (boolean) with `day_entries.break_minutes_override` (nullable integer, multiple of 15); add a new single-row `rolling_balance_seed` table (`balance`, `note`).
- Calculation engine: rename `lunchDeduction` → `breakDeduction` and all related fields across `workHours.ts`, `dailyBreakdown.ts`, `history.ts`, `recap.ts`; `recap.ts`'s rolling balance computation starts from the seed value (0 if unset) instead of a hardcoded 0.
- Daily Entry screen: replace the "took lunch" checkbox with a 15-minute-increment break override selector (blank = use default).
- Settings screen: rename the "Lunch Duration" section to "Break Duration."
- A one-time SQL migration script (schema changes) and a one-time SQL data-import script (the 8 weeks of real data), both handed to the user to run manually — no in-app feature.
- Settings data for the import window: `weekly_target_settings` (32 hrs, effective 2026-05-04), `break_duration_settings` (0 min, effective 2026-05-04), `standard_workday_hours_settings` (6.4 hrs, effective 2026-05-04), `leave_banks` (paternity, 40.8 hrs, effective 2026-05-01), one holiday (2026-05-25, "Memorial Day"), and the `rolling_balance_seed` row (-27.67). 2026-05-04 is the Monday of the first full Monday-Sunday week with real activity — see `blueprint.md` for why this differs from the sheet's own Saturday-Friday week boundaries.
- Day-by-day import of `day_entries`/`sessions`/`leave_entries` for every date in the window that has real activity (sessions, leave, or a holiday), sourced from `references/source-app/sheet-export-2026-05-02-to-2026-05-29.csv` and `references/source-app/sheet-export-2026-05-30-to-2026-06-26.csv`.

## Out of Scope

- Any data before 2026-05-02 or after 2026-06-26 (a later, separate sprint).
- A configurable pay-period-cycle setting.
- Any Settings UI for the Rolling Balance Seed (SQL-only for now).
- An in-app data import/upload feature.
- Reports/analytics beyond the weekly recap and History tab.
- Multi-user, mobile, calendar integrations, reminders, blackout dates.

## Tied to Business Goal

Directly validates the core value proposition: that the app's calculation engine produces the same numbers as the trusted source sheet, using the user's own real data — and fixes a real mismatch (the break/lunch model) discovered by looking at that real data.
