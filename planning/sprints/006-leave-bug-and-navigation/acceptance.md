# Sprint 006 Acceptance — Leave Entry Bug Fix + Navigation Improvements

Sprint 006 is complete when all of the following are true:

## Bug fix
- Opening the Daily Entry page for a date that has leave entries but no sessions and no saved break (e.g. 2026-11-05) shows every leave entry, and each can be removed with its Remove button.
- Adding a leave entry on a brand-new date (no prior session/break) shows it in the list immediately after saving.
- New unit tests cover: leave-only day (null day record) returns its leave entries; full day returns sessions + leave; empty day returns the empty shape.
- Any other place that gated date-keyed data behind a `day_entries` row is reported at the code gate (fixed only if it's the same bug pattern).
- The Recap's Actual/Delta/Rolling Balance numbers are unchanged by this sprint (no calculation code touched).

## Date picker
- Choosing a date in the Daily Entry picker opens that date's page immediately; there is no "Go" button.
- Partial or out-of-range values (e.g. mid-typing a year) do not navigate.
- `goToDate` and its form are removed; no dead code remains.

## History links
- Each pay period's date range on the History tab is a link that opens the Recap for exactly that period (Week 1 / Week 2 matching the row's dates).
- The History table is otherwise unchanged (same columns, same numbers).

## Week labels
- The Recap's two week headings read "Week 1 · <date range>" and "Week 2 · <date range>"; the week modal title matches. No ISO week numbers appear anywhere on the Recap.
- Week 1 / Week 2 still correspond to the same dates as before (no boundary change).

## Regression
- Sprint 002–005 acceptance still holds: auth gate, Daily Entry saves refresh via `ActionForm`, themes, mobile layout, week modal, hover tooltip.
- `npm test`, `npx tsc --noEmit`, and `npm run build` pass clean.
