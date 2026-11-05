# Sprint 007 Requirements — Pay Cycle Alignment (Saturday–Friday)

## Background

The user's real pay periods (from their stubs) are Sep 19–Oct 2, Oct 3–Oct 16, Oct 17–Oct 30 (2026): Saturday–Friday, 14 days each. They anchor exactly to Sat 2026-01-10 (252 days = 18 cycles before Sep 19), the first day of the user's original Google Sheet, whose weekly blocks were also Saturday–Friday (the sheet's own printed weekly rollover balances are on this basis). The app instead uses Monday–Sunday weeks (a Sprint 003 choice made to avoid re-deriving numbers) and ISO odd/even pay periods (a Sprint 004 choice), so its periods and weekly totals never matched the stubs or the sheet.

## Goals

1. **Weeks are Saturday–Friday.** Weekly Actual/Target/Delta, the Rolling Balance, Recap, History, the week modal, and "last fully-completed week" all use Sat–Fri weeks.
2. **Pay periods are fixed 14-day blocks** anchored at **2026-01-10** (Week 1 = first Sat–Fri, Week 2 = the next). The anchor is a documented constant in code.
3. **Data alignment (additive SQL, run by the user):** import 2026-01-10 (session 07:00–11:15) and 2026-01-11 (empty — nothing to insert); move the three settings' `effective_date` from 2026-01-12 to 2026-01-10; set `rolling_balance_seed` to **-12.12** (the sheet's carried-in balance at 2026-01-10).
4. **Reconciliation gate:** before any SQL is released, a standalone script recomputes the Sat–Fri weekly chain from the saved sheet exports and matches the sheet's own printed weekly balances.
5. **Weeks Left in Year** counts Sat-start weeks instead of ISO (Monday) weeks.
6. **Retire ISO week code** (`isoWeek.ts`, `mondayOf`) and their tests — no dead code.

## Non-goals

- No stub amounts or paid-hours comparison (user confirmed: dates only).
- No configurable/settings-driven anchor.
- No change to Business Rules 1–6, 8–9, 11–12, 18 (Work Hours, Weekly Actual, Rolling Balance formula, Leave Bank, etc.) beyond the week-boundary wording in Rules 7 and 10 (Monday → week start/Saturday) and the replacement of Rules 13–17.
- No duplicate-leave guard, no leave editing, no Daily Entry changes.
- The Builder does not touch the database; the user runs the SQL.
- No deletion of any existing data.

## Users / Roles

Unchanged — single user, Supabase auth.

## Acceptance Summary

See `acceptance.md`. Headline: with code deployed and SQL run, History's period ranges match the user's stub ranges (Sep 19–Oct 2, Oct 3–Oct 16, Oct 17–Oct 30) and the current period reads Oct 31–Nov 13; weekly balances match the sheet; all tests/typecheck/build pass.
