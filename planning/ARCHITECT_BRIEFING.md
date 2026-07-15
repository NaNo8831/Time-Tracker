# Architect Briefing

**Last updated:** 2026-07-14 (Sprint 005 complete)

---

## Where things stand

Sprint 005 is done. The user found a real bug through actual use — they'd pre-logged some vacation days in advance, and the app was silently ignoring that already-saved data when it computed the week's total, making it look like far less had been logged than really had. That's fixed now, and I proved it against the user's own numbers, not just test fixtures: the two weeks from their screenshot went from showing 6.25 hrs and 0.00 hrs to the correct 23.75 hrs and 40.00 hrs. On top of the fix, each week's total now has a helpful hover explaining what's already behind you versus what's already logged ahead, and clicking that total pops open a small window with the day-by-day log for just that week — replacing the big table that used to always sit at the bottom of the page. Everything is tested and verified; nothing has been pushed to the live site yet since the user hasn't asked for that this session.

---

## Current status

Sprint 005 (Weekly Actual Fix + Week Drill-down Modal) — complete, verified, not yet committed to git. This was the first sprint since 2026-07-09 to go through a full Architect conversation (planning-doc refresh, discovery, clarifying questions, written pack, code gate) before any code was touched — the process the user asked for after three earlier rounds happened directly with the Builder.

## Since last sprint

- **The bug fix**: `buildWeeklyRecap()`'s day-loop no longer stops summing at `today`. A day's real logged hours (sessions or leave) now count toward its week's Actual/Delta regardless of whether that day is in the past or future — previously, any data logged for a date after today was silently dropped. The written business rule was always correct; only the code's defensive early-stop was wrong.
- **`splitWeekActual()`** (`src/lib/calculations/dailyBreakdown.ts`): new pure function powering the "Actual" hover tooltip — splits a week's total into hours-through-today vs. hours-already-logged-for-later-this-week, with the later segment broken down by leave type (v/s/p).
- **`WeekLogModal`** (`src/components/WeekLogModal.tsx`, new): the "Actual" stat card is now a clickable trigger that opens a modal with that week's 7-day log (Date, Day, Raw, Break, Other, Total — new Day-of-week column). Dismissible via backdrop click, Escape, or a close button.
- **`src/app/(app)/page.tsx`**: the always-visible 14-day table at the bottom of the Pay Period Recap is gone, replaced by the two per-week modals wired into each `WeekSection`'s "Actual" card.
- Confirmed via existing (unmodified) test suites that neither the History tab nor Rolling Balance's "last fully-completed week" selection logic were affected by the fix.
- Live-verified end-to-end via an isolated, non-auth preview reproducing the user's exact real scenario (not just synthetic fixtures) — both weeks now show the correct totals, the modal opens/closes correctly, and the Day column is right.
- 83/83 unit tests pass (7 new: 2 regression tests for the fix, 3 for `splitWeekActual`, plus 2 more from earlier in the session), typecheck clean, production build clean.

## Architecture / file map

- `src/lib/calculations/recap.ts` — `buildWeeklyRecap()`'s day loop, cutoff removed.
- `src/lib/calculations/dailyBreakdown.ts` — `splitWeekActual()`, new.
- `src/components/WeekLogModal.tsx` — new, fourth deliberate client-side component (after `ThemePicker`, `CollapsibleSection`, `ActionForm`). Self-contained: owns its own `isWeekend`/`dayOfWeek`/`othersBreakdownTitle` helpers (moved from `page.tsx`, no longer needed there).
- `src/app/(app)/page.tsx` — `WeekSection` now takes `rows`/`today` props and renders `WeekLogModal` instead of a plain `StatCard` for "Actual"; the bottom table section is deleted entirely.
- `tests/calculations/recap.test.ts`, `tests/calculations/dailyBreakdown.test.ts` — new regression coverage.

## Decisions

See `planning/DECISIONS.md` for the full log, including the two 2026-07-14 entries describing the bug/fix and the modal design, plus a closing entry confirming it shipped exactly as planned with no deviations.

## Risks / watch-items

- See `planning/RISKS.md` — the "Actual hours excluding future data" risk is now addressed (Sprint 005). One open item worth tracking: this is now the fourth distinct client-side interactive component with no shared modal/dialog abstraction — still fine at this scale, but worth a shared pattern if a fifth, differently-shaped case shows up.
- No new risks introduced. History tab and Rolling Balance were both explicitly protected as non-goals and verified unaffected.

## Open questions for the Architect

None outstanding. The "should History tab get the same drill-down" question was resolved during this sprint's discovery — explicitly no, Prev/Next on the Recap page already covers it.

## Validation / test status

- Automated: 83/83 unit tests passing, typecheck clean, production build clean.
- Manual/live: verified against an isolated preview reproducing the user's exact reported numbers (not just synthetic fixtures) — both previously-wrong weeks now show the correct totals, hover tooltips match, and the modal (including the new Day column and close/dismiss behavior) all work as specified.
- Not yet tested against the real production database/mobile device — recommend the user try it live once deployed.

## Recommended next Architect action

None needed right now. Natural next steps if the user wants them: ask whether to commit and push (nothing has been committed this session), or bring whatever comes up next through an Architect conversation first, per the process the user asked to keep going forward.
