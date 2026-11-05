# Sprint 006 Builder Handoff Prompt

Read `templates/method/120x-agent-identity.md`, then `AGENTS.md`, then `planning/STATE.md` and `planning/DECISIONS.md`, then this sprint's `requirements.md`, `blueprint.md`, and `acceptance.md` in full.

Act as the Builder. Implement only what's in this sprint's files:

1. Fix `getDayEntryDetail()` so leave entries load for any date, independent of whether a `day_entries` row exists (extract a pure `buildDayEntryDetail` and unit-test the leave-only case). Audit `src/lib/data/` for the same gating pattern and report findings at the code gate.
2. Replace the Daily Entry "Go" form with a `DateJump` client component that navigates on a complete, valid date (year 2000–2099); remove the now-unused `goToDate` action.
3. Make each History period's date range a link to `/?period=<periodStart>`.
4. Change the Recap week headings to "Week 1" / "Week 2" and drop the unused `isoWeekNumber` import from `page.tsx`.

Scope guards — do NOT:
- Change pay-period boundaries, ISO pairing, or `isoWeek.ts`.
- Change any calculation or Business Rule.
- Modify or delete the user's existing leave data; the duplicate 2026-11-05 entries are removed by the user via the UI.
- Add duplicate-leave guards or leave editing.

Stop at the mandatory code gate before writing any code: post your concrete file-by-file plan, scope guards, and acceptance criteria, and wait for explicit approval.

At close: update `planning/STATE.md` and `planning/DECISIONS.md`, refresh `planning/ARCHITECT_BRIEFING.md` (leading with a plain-English "Where things stand"), and mark `planning/STATUS.json` `sprint-closed`. Do not commit to git unless the user explicitly asks.
