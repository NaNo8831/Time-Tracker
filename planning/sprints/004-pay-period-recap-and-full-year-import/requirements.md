# Sprint 004 Requirements — Pay Period Recap Redesign + Full-Year Historical Import

## Goal

1. Replace the Weekly Recap landing page with a **Pay Period Recap**: two ISO-week-numbered weeks (odd/even paired), a unified clickable day-by-day list, and period navigation.
2. Add a **Physical Year** setting and a **Weeks Left in Year** figure.
3. Clean up Daily Entry (drop Recent Entries) and Nav ordering (Daily Entry first).
4. Rework the History tab to the new pay-period definition, excluding the current period.
5. Import 2026-01-12 through 2026-05-01 (extending tracked history backward from the already-live 2026-05-02 start) from four real CSV exports — additive-only, against a live database with real, user-verified data.

## In Scope

- `src/lib/calculations/isoWeek.ts`: ISO 8601 week number + pay-period boundary calculation.
- `buildWeeklyRecap()` extended to optionally compute weeks beyond `today`, scoped to the Pay Period Recap's own use (not affecting History/Leave Bank calculations).
- New `buildPayPeriodRecap()`: Week 1 + Week 2 summaries, Rolling Balance as of period end.
- New `physical_year_settings` table + Settings UI section (list-style: add start/end date, view/remove list) + `weeksLeftInYear()` calculation.
- Pay Period Recap page (`src/app/(app)/page.tsx`): full rewrite per the layout in `planning/DECISIONS.md`. Day rows link to `/entries/{date}`. Prev/Next period links. Retires the old rolling "Last 14 Days" section entirely.
- History tab: rewritten to group by ISO pay period and exclude the current period.
- Daily Entry: remove "Recent Entries" section.
- Nav: reorder to Daily Entry, Recap, History, Settings.
- Schema migration SQL (new `physical_year_settings` table + RLS) for the live database.
- Data-import SQL (additive-only) for 2026-01-12–2026-05-01, plus the three settings `effective_date` `UPDATE`s and the `rolling_balance_seed` value `UPDATE`, all per the exact values derived in `planning/DECISIONS.md` and `blueprint.md`.

## Out of Scope

- Data before 2026-01-12.
- Employer-specific or user-configurable pay-period anchoring.
- An in-app import feature.
- Any change to the underlying Work Hours / Weekly Delta / Rolling Balance business rules themselves (Rules 1-12 are untouched).
- Fixing the 53-ISO-week-year pairing edge case.

## Tied to Business Goal

Delivers the pay-period view the user actually wants to check their hours against, extends the proven-correct calculation engine across the full year so far, and keeps the app's core promise — real numbers matching the user's own trusted source — intact through a much larger dataset.
