# Validation

Per the Micro-app rigor profile: cover the happy path and the one or two failure modes that would lose the user's data. Do not over-test.

## Sprint 005 Validation Priorities

- **Highest priority — the bug's own regression check**: a day after today with real logged data (sessions or leave) must count toward that week's Actual/Delta. Spot-check against the user's own reported case (2026-07-15/16/17 and 2026-07-20–07-24).
- **Isolation checks**: History tab numbers unchanged; Rolling Balance unchanged for the same inputs. Both should be provable by running the existing test suites unmodified plus one live spot-check each.
- **Split-total identity**: `splitWeekActual()`'s two totals must sum to exactly the week's `actualHours` — add this as an explicit test, not just a manual check.
- **Modal behavior**: opens from either week's Actual card, shows the right 7 rows with a working Day column, dismissible, and works the same whether viewing the current period or one reached via Prev/Next.

## Sprint 004 Validation Priorities (carried forward, already complete)

- The live-data regression check (2026-05-04–2026-06-26 reproduced exactly) — done, user-verified 2026-07-09.
- Pay Period week-extension isolation — done.
- ISO week number correctness — done, unit-tested.
- Migration spot-checks — done, user-verified.

## Deferred

- Full manual walkthrough of every day is not required — targeted spot-checks plus the automated suite are sufficient per the Micro-app rigor tier.
- The 53-ISO-week-year edge case and 2026-01-01–01-09 recovery remain explicitly deferred.
- History tab per-week drill-down: explicitly out of scope, not validated.
