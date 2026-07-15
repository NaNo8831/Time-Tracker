# Sprint 005 Requirements — Weekly Actual Fix + Week Drill-down Modal

## Background

The user found a real bug while testing on mobile: they had pre-logged vacation leave for several days later in the current week and for an entire week further ahead, but the Pay Period Recap's "Actual" card for those weeks showed hours far lower than reality (one week showed 6.25 hrs when 23.75 hrs were genuinely logged; another showed 0.00 hrs when 40 hrs were genuinely logged). The daily table at the bottom of the same page correctly showed the real data — the bug is isolated to the weekly aggregation, which stops summing at "today" even though real data can and does exist for dates after today (the Daily Entry page has always allowed picking any date, past or future).

While fixing this, the user also asked for two related UI changes: a smarter hover tooltip on "Actual" that explains the split between hours already behind you and hours already logged ahead, and replacing the always-visible 14-day table at the bottom of the page with a per-week pop-out log (triggered by clicking each week's "Actual" card), which also gains a day-of-week column.

## Goals

1. **Fix**: Weekly Actual Hours (and therefore Delta) must sum every day's real logged Work Hours for the whole week, regardless of whether that day is before, on, or after today.
2. **Hover tooltip on "Actual"**: shows hours-through-today vs. hours-already-logged-for-later-this-week, with the later portion broken down by leave type (vacation/sick/paternity, shown as v/s/p for brevity).
3. **Week drill-down modal**: clicking a week's "Actual" card opens a modal with that week's 7-day log (Date, Day-of-week, Raw, Break, Other, Total columns), replacing the always-visible 14-day table at the bottom of the page.
4. **Day-of-week column**: add a "Day" column (short weekday name, e.g. "Mon") to the daily log table inside the new modal.

## Non-goals (explicitly out of scope this sprint)

- No change to the History tab — it stays exactly as it is today (period-level summary rows only, no per-week drill-down). The user explicitly declined adding this there; Prev/Next on the Recap page already covers browsing to any past period, and the modal comes along automatically since it's part of the same page.
- No change to Rolling Balance's "last fully-completed week" selection logic (2026-07-09 decision) — that fix is separate and orthogonal, and must keep working exactly as it does today.
- No change to Business Rules 1-5, 7-17. Rule 6's wording is unchanged (it was already correct) — only the code's incorrect implementation of it changes.
- No new "projected" or "imputed" (estimated/guessed) figures anywhere. Every number this sprint touches must be built strictly from real, already-logged data. (Earlier discussion floated a pace-projection idea; the user's screenshot revealed the real issue was a data-exclusion bug, not a need for estimation, and that idea was dropped.)

## Users / Roles

Unchanged — single user, gated by Supabase auth.

## Acceptance Summary

See `acceptance.md` for the full checklist. Headline checks: the two real cases from the user's screenshot (2026-07-15/16/17 data appearing in that week's Actual; 2026-07-20–24 data appearing in that week's Actual) must resolve correctly once the fix ships; History tab numbers must be unchanged (regression check); Rolling Balance must be unchanged (regression check); the modal must open from either week's "Actual" card and show the correct 7 rows with a Day column; the bottom-of-page 14-day table must be gone.
