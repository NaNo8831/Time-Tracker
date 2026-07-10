# Sprint 004 Acceptance — Pay Period Recap Redesign + Full-Year Historical Import

Sprint 004 is complete when all of the following are true:

## Pay Period Recap

- Landing page shows Week 1 (odd ISO week) and Week 2 (even ISO week) stats, Rolling Balance as of period end, Leave Remaining, Weeks Left in Year, and a 14-day list for both weeks with a visual divider between them.
- Each day row navigates to `/entries/{date}`.
- Prev/Next navigation moves by exactly 14 days each direction and works for both past and future periods, unbounded.
- Viewing a period where "today" falls in Week 1 still renders Week 2 (as a zero/pending week), without crashing and without polluting the History tab or Leave Bank figures with that future week.
- The old rolling "Last 14 Days" section no longer exists anywhere.

## Physical Year / Weeks Left in Year

- Settings has a new list-style section for adding/removing Physical Year date ranges.
- With no matching Physical Year record for today, Weeks Left in Year shows a clear "not set" state, not an error.
- With a matching record, Weeks Left in Year shows the correct count (spot-check manually against a real entered range).

## History Tab

- Lists only fully-elapsed pay periods — the period containing today never appears.
- Period pairing matches the ISO odd/even rule, not the old chronological-since-tracking-start pairing.

## Daily Entry / Nav

- "Recent Entries" section is gone from the Daily Entry page.
- Nav order is Daily Entry, Recap, History, Settings.

## Historical Import — Critical Regression Check

- **Before treating this sprint as done**, verify the already-live, already-proofed Sprint 3 weekly table (2026-05-04 through 2026-06-26, from `planning/sprints/003-break-rework-and-migration/acceptance.md`) is EXACTLY unchanged after this import runs. Any deviation means stop and investigate — do not proceed.
- The new weekly table in `blueprint.md` (2026-01-12 through 2026-04-26) matches exactly, including the connecting `-27.67` value at the 2026-04-27–05-03 boundary.
- Settings → Weekly Target Hours / Break Duration / Standard Workday Hours each show exactly one entry, effective 2026-01-12 (not two entries — these were `UPDATE`s, not new inserts).
- Settings → Paid Holidays lists 2026-04-02, 2026-04-03, 2026-04-06 with the inferred labels.
- Spot-check Daily Entry for: 2026-01-20 (session + 60-min break override), 2026-02-13 (vacation 8h, no session), 2026-03-05 (session + 120-min break override), 2026-04-09 (session + 3h sick).
- 2026-01-10 and 2026-01-11 show no data in the app (by design — see `planning/DECISIONS.md`).

## Regression

- All Sprint 002/003 acceptance criteria still hold: auth gate, session overlap/duplicate rejection, duplicate-effective-date rejection, no letter codes or raw sheet math exposed.
- Unit tests updated/added for `isoWeek.ts`, `buildPayPeriodRecap`, `weeksLeftInYear`, and the reworked `periods.ts`; `npm test`, `npx tsc --noEmit`, and `npm run build` all pass clean.
