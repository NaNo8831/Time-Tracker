# Architect Briefing

**Last updated:** 2026-11-05 (Sprint 007 built; awaiting deploy + SQL)

---

## Where things stand

Sprint 007 is built and tested. The app now measures weeks Saturday to Friday and pay periods as fixed 14-day blocks starting 2026-01-10, which is exactly how your pay stubs and your original sheet work. Before writing any database changes I recomputed all 24 weeks from your sheet exports under the new model and every one matches the sheet's own weekly totals and running balances (the largest difference was under a hundredth of an hour); the three stub periods you gave me come out exactly as you listed them. Nothing is live yet and nothing is committed. Next: merge/deploy the code, then run the one SQL script right away, then check History and the Recap.

---

## Current status

Sprint 007 (Pay Cycle Alignment) — code complete and verified locally, SQL written, not committed, not deployed. 87/87 tests, typecheck and build clean. The SQL has not been run (the Builder has no database access). Sprint 006 (leave-bug fix, date jump, History links, Week 1/2 labels) was merged and verified live earlier today.

## Since last sprint

- **New `src/lib/calculations/payCycle.ts`**: anchor `2026-01-10`, `payWeekStart`, `payPeriodStart`. Tested against the user's stub dates, the anchor, pre-anchor dates and Saturday-ness.
- **Week boundary swapped everywhere**: `recap.ts`, `periods.ts`, `payPeriodRecap.ts`, `physicalYear.ts` (Weeks Left in Year now counts Sat-start weeks), `weekly.ts`, the Recap page (`?period=` snaps to its period start; malformed values fall back to the current period) and the History page. `isoWeek.ts`, `mondayOf` and their tests were deleted; a grep finds no ISO/Monday logic left in `src/` or `tests/`.
- **Tests**: five existing test files re-based onto Sat–Fri weeks with no assertions weakened; new `payCycle.test.ts`; new permanent real-data test `payCycleRealData.test.ts` (the sheet's first three weeks: -9.37 / -11.97 / -16.97 from seed -12.12).
- **Reconciliation gate (throwaway script, passed)**: 24/24 weeks Jan 10 – Jun 26 match the sheet's printed Actual and rolling balance; table recorded in `planning/DECISIONS.md`. The first run flagged one week by exactly 12 hrs — a bug in the script's time parsing ("2:00:00 PM" misread as 2 AM), not in the app or the stored data (confirmed against the Sprint 003 import SQL).
- **`supabase/migration-007-sat-fri-weeks.sql`** (additive, idempotent, no deletes): imports 2026-01-10 (07:00–11:15), moves the three settings' effective date 2026-01-12 → 2026-01-10, sets the seed to -12.12.

## Architecture / file map

- `src/lib/calculations/payCycle.ts` (new); `isoWeek.ts` removed.
- Edited: `recap.ts`, `weekly.ts`, `periods.ts`, `payPeriodRecap.ts`, `physicalYear.ts`, `src/app/(app)/page.tsx`, `src/app/(app)/history/page.tsx`.
- `docs/ARCHITECTURE.md` has a "Pay Cycle (Sprint 007)" section; older sections that mention Monday–Sunday/ISO are marked superseded there.

## Decisions

See `planning/DECISIONS.md`: the 2026-11-05 entries (Sprint 007 supersedes the ISO and Monday–Sunday decisions; stubs matter for dates only) and the reconciliation table.

## Risks / watch-items

- **Release window**: after the deploy and before the SQL, week/period figures are briefly inconsistent (read-only). Run the SQL immediately; don't log entries in between.
- If the SQL were run before the deploy instead, the old code would show a phantom Monday-based week — so deploy first.
- The "all history changes at once" risk is mitigated by the gate (passed) and the real-data test.
- The 2026 year-end ISO-53-week issue no longer applies.
- The page-level `?period=` normalization is not unit-tested (it lives in the page); worth a live check with an old Monday-based link.
- Physical Year and holiday lists may need entries for the coming year; no duplicate guard on leave (accepted).

## Open questions for the Architect

None blocking. Possible follow-ups the user may raise: stub paid-hours comparison (explicitly out of scope), a duplicate-leave guard.

## Validation / test status

Automated: 87/87 tests, typecheck clean, production build clean (the usual Supabase Edge Runtime warning only). Reconciliation: 24/24 weeks match the sheet. Not yet verified against live data (needs deploy + SQL + the user's check).

## Recommended next Architect action

None required. After the user deploys, runs the SQL and confirms History's periods match their stubs, close the loop (or open a small fix sprint if anything looks off).
