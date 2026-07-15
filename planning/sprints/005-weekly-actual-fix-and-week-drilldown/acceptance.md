# Sprint 005 Acceptance — Weekly Actual Fix + Week Drill-down Modal

Sprint 005 is complete when all of the following are true:

## The Fix

- For a week that has real logged data (sessions or leave) on a date after today, that week's "Actual" and "Delta" cards now include it. Spot-check against the user's own reported case: with data logged on 2026-07-15/16/17 and 2026-07-20 through 07-24, the corresponding weeks' Actual figures reflect all of it, not just the portion through today.
- `throughTodayHours + laterThisWeekHours` (from `splitWeekActual`) equals that week's `actualHours` from `buildPayPeriodRecap()`, exactly, for the same week.
- History tab's numbers are unchanged before/after the fix (spot-check at least one already-elapsed period).
- Rolling Balance shown on the Recap page is unchanged before/after the fix for the same period/today combination (it depends only on which weeks are calendar-complete, not on how much of a week's data is logged).

## Hover Tooltip

- Hovering a week's "Actual" card shows the through-today / later-this-week split, with the later segment broken down by `v`/`s`/`p` when non-zero.
- A week entirely in the past (no "later" hours) shows a sensible tooltip with nothing to break down (no empty/awkward "0.0 · 0.0 · 0.0" clutter — omit the breakdown when there's nothing later).

## Week Drill-down Modal

- Clicking either week's "Actual" card opens a modal showing that week's 7 daily rows: Date, Day, Raw, Break, Other, Total.
- The Day column shows the correct short weekday name for each date (e.g. 2026-07-13 → "Mon").
- Weekend rows are still visually highlighted, matching the existing style.
- Each date is still a link to `/entries/{date}`.
- The modal can be dismissed (backdrop click, Escape, and/or a close button) and reopened.
- This works identically for the current period and for any past period reached via Prev/Next on the Recap page.
- The always-visible 14-day table that used to sit at the bottom of the Recap page is gone — nothing renders there now except what's already specified (stat cards, Rolling Balance, Leave Remaining, Weeks Left in Year).

## Non-goals confirmed untouched

- History tab: pixel-for-pixel unchanged, still period-level rows only, no modal.
- `buildPayPeriodRecap()`'s Rolling Balance "last fully-completed week" logic: unchanged, all existing `payPeriodRecap.test.ts` tests pass unmodified.
- Business Rules 1-5, 7-17: unchanged.

## Regression

- All Sprint 002-004 acceptance criteria still hold: auth gate, session overlap/duplicate rejection, duplicate-effective-date rejection, no letter codes or raw sheet math exposed, mobile layout/theme/`ActionForm` refresh behavior from the post-Sprint-004 rounds all still work.
- Unit tests added/updated for the day-loop fix and `splitWeekActual`; `npm test`, `npx tsc --noEmit`, and `npm run build` all pass clean.
