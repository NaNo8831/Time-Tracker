# Sprint 005 Builder Handoff Prompt

Read `templates/method/120x-agent-identity.md`, then `AGENTS.md`, then `planning/STATE.md` and `planning/DECISIONS.md`, then this sprint's `requirements.md`, `blueprint.md`, and `acceptance.md` in full.

Act as the Builder. Implement only what's described in this sprint's files:

1. Fix `buildWeeklyRecap()`'s day loop in `src/lib/calculations/recap.ts` — remove the `date > today: stop` cutoff so every day in a week's range contributes its real logged Work Hours, regardless of past/future. Add regression tests proving a future day with real data now counts (both for the natural current week and for a week reached via `extendThroughWeek`), and confirm all existing tests still pass unmodified.
2. Add `splitWeekActual()` (or your preferred name matching existing conventions) to compute the through-today / later-this-week split with a v/s/p breakdown, consuming the same `DailyBreakdownRow[]` already fetched for the daily table — no new data source. Add unit tests.
3. Build the week drill-down modal (`WeekLogModal` or similar) as a small client component, wired to each week's "Actual" `StatCard` on the Pay Period Recap page. Remove the always-visible 14-day table at the bottom of the page entirely. Add a Day-of-week column to the modal's table.
4. Wire the hover tooltip onto each week's "Actual" card using `splitWeekActual()`'s output.

Scope guards — do NOT:
- Touch the History tab in any way.
- Touch `buildPayPeriodRecap()`'s Rolling Balance "last fully-completed week" selection logic.
- Change Business Rules 1-5 or 7-17, or introduce any projected/estimated (non-real) figures anywhere.
- Add the drill-down modal anywhere except the Pay Period Recap page's two "Actual" cards.

Stop at the mandatory code gate before writing any code: post your concrete file-by-file plan, scope guards, and acceptance criteria, and wait for explicit approval.

At close: update `planning/STATE.md` and `planning/DECISIONS.md`, refresh `planning/ARCHITECT_BRIEFING.md` (leading with a plain-English "Where things stand"), and mark `planning/STATUS.json` `sprint-closed`. Do not commit to git unless the user explicitly asks.
