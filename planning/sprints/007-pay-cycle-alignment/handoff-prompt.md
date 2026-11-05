# Sprint 007 Builder Handoff Prompt

Read `templates/method/120x-agent-identity.md`, then `AGENTS.md`, then `planning/STATE.md` and `planning/DECISIONS.md`, then this sprint's `requirements.md`, `blueprint.md`, and `acceptance.md` in full.

Act as the Builder. Implement only what's in this sprint's files:

1. Add `src/lib/calculations/payCycle.ts` (anchor `2026-01-10`, `payWeekStart`, `payPeriodStart`) with tests built from the user's stub dates.
2. Replace Monday-based and ISO-based week logic everywhere with Sat–Fri weeks / fixed 14-day periods: `recap.ts`, `weekly.ts`, `periods.ts`, `payPeriodRecap.ts`, `physicalYear.ts`, `(app)/page.tsx` (normalize `?period=`), `(app)/history/page.tsx`. Delete `isoWeek.ts`, `isoWeek.test.ts`, and `mondayOf` with its tests. Re-base the affected tests without weakening any assertion.
3. Add the permanent real-data test `payCycleRealData.test.ts` (seed -12.12; sheet days Jan 10–30; expected -9.37 / -11.97 / -16.97 ±0.01).
4. Write and run the standalone reconciliation script (scratchpad, not committed) over all six saved CSV exports; **if any week is outside tolerance, STOP and report — do not release the SQL.** Record the full matched table in `planning/DECISIONS.md`.
5. Write `supabase/migration-007-sat-fri-weeks.sql` (additive, idempotent: Jan 10 import, three `effective_date` moves 2026-01-12 → 2026-01-10, seed → -12.12). Hand it to the user with the release order from the blueprint — you have no database access and must not attempt any.

Scope guards — do NOT:
- Add stub amounts / paid-hours comparison, a configurable anchor, a duplicate-leave guard, or any Daily Entry change.
- Change Business Rules 1–6, 8–9, 11–12, or 18 (only the week-boundary wording in Rules 7 and 10 and the replacement of Rules 13–17 change, and the Architect has already updated those docs).
- Delete or modify any data, or run any SQL.

Stop at the mandatory code gate before writing any code: post your concrete file-by-file plan, scope guards, and acceptance criteria, and wait for explicit approval.

At close: update `planning/STATE.md`, `planning/DECISIONS.md`, `planning/ARCHITECT_BRIEFING.md` (leading with a plain-English "Where things stand"), `docs/ARCHITECTURE.md`, `docs/VALIDATION.md`, `planning/FILE_INVENTORY.md`, and mark `planning/STATUS.json` `sprint-closed`. Do not commit to git unless the user explicitly asks.
