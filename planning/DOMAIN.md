# Domain Context

This file captures the operating context for Time Tracker.

---

## Client

Ly-Ark

---

## Business Goal

Give a single user a fast, low-friction way to log daily worked hours against a personal weekly target, see a running (rolling) balance over/under that target, and track paid leave and paid holidays — replacing a manually-maintained Google Sheet.

---

## Project Type

Internal tool (personal use, single user)

---

## Primary Users / Roles

A single user (the project owner). Access gated by a single Supabase email/password login.

---

## Target Workflow (v1, updated Sprint 005)

- **Login**: single email/password login gates the whole app.
- **Daily entry**: pick a date (any date — past OR future; nothing stops logging leave in advance), add one or more check-in/check-out session pairs, optionally override that day's break duration, optionally log leave hours. Reachable directly from the Pay Period Recap's week modal, or via its own nav tab (first in the nav order). No "recent entries" list. Saves refresh immediately via `router.refresh()`.
- **Settings / Preferences**: weekly target hours, break duration default, standard workday hours (nested under Paid Holidays), three leave banks, paid holidays, a Physical Year list (start/end date pairs, used for Weeks Left in Year), and an Appearance section (5 color/dark-mode presets).
- **Pay Period Recap (landing page)**: the current pay period — two Saturday–Friday weeks in a fixed 14-day cycle anchored at 2026-01-10 (Week 1 = first Sat–Fri, Week 2 = the next; matches the user's pay stubs) — showing each week's actual/target/delta (counting every logged day in the week's range), the Rolling Balance as of the last fully-completed week, Leave Remaining (collapsible), Weeks Left in Year, and Prev/Next navigation to adjacent pay periods (unlimited range). Each week's "Actual" card opens that week's 7-day log in a modal (Date, Day-of-week, Raw, Break, Other, Total) and carries a hover tooltip splitting the total into hours-through-today vs. hours-already-logged-for-later-this-week (by leave type).
- **History tab**: every FULLY ELAPSED past pay period (never the current one, which lives on the landing page), same fixed 14-day cycle; period-level summary rows only, each range linking to that period's Recap.
- **Migration**: one-time SQL-script imports of real sheet history, run directly against Supabase by the user, additive-only once real live data exists.

---

## Key Terms

- **Pay Cycle Anchor**: Saturday 2026-01-10 — the first day of the user's original sheet, and 14k days before every pay-stub period (Sep 19, Oct 3, Oct 17 2026...). A documented code constant (`PAY_CYCLE_ANCHOR`), not a setting.
- **Pay Period**: a fixed 14-day Saturday–Friday block (two Sat–Fri weeks). Week 1 is the first seven days, Week 2 the next seven. Aligned to the user's pay stubs.
- **Physical Year**: a user-entered date range (start date, end date) representing the user's own tracking/leave year, which may not align with the calendar year (Jan 1 - Dec 31). Multiple records can exist (one per real year); looked up by "which record's range contains this date," not effective-dated in the usual sense.
- **Weeks Left in Year**: the count of Sat–Fri weeks from today's week through the end of whichever Physical Year record contains today. Blank/not shown if no record matches.

---

## Business Rules (renumbered/clarified, Sprint 005)

Rules 1-5, 8-12 and 18 are unchanged; Rules 7 and 10 now use the week's first day (Saturday) instead of Monday, and Rules 13-17 were replaced in Sprint 007. **Rule 6 is clarified** (the rule's wording was always correct; Sprint 005 fixes an implementation bug that contradicted it):

6. **Weekly Actual Hours** = sum of Work Hours (Rule 5) for **every** day in the week (all 7 days), regardless of whether that day is before, on, or after today. A day with nothing logged naturally contributes 0 — there is no separate "stop at today" rule. (Sprint 002-004 code incorrectly stopped the sum at today; fixed in Sprint 005 after real usage — pre-logging future leave — exposed it as wrong.)
18. **Week Actual Split (Sprint 005, display-only, not a new calculation of Actual/Delta/Rolling Balance)**: for the hover tooltip on a week's "Actual" card, split that week's days into "through today" (date ≤ today) and "later this week" (date > today), sum Work Hours for each group, and further break the "later this week" group down by leave type (vacation/sick/paternity, shown as v/s/p). This is purely a presentational breakdown of the same Rule 6 total — it does not change what Actual, Delta, or Rolling Balance mean.

13. **Pay Week (Sprint 007, supersedes old Rule 13 ISO Week Number)**: a week runs Saturday–Friday, aligned to the pay cycle anchor. Pay Week Start(date) = the Saturday on or before `date` that is 7k days from 2026-01-10. This also replaces "Monday" in Rules 7 and 10: the Weekly Target is looked up on the week's first day (Saturday), and a target change takes effect from the following Saturday-start week.
14. **Pay Period Start (Sprint 007, supersedes old Rule 14)**: Pay Period Start(date) = the Saturday on or before `date` that is 14k days from 2026-01-10. Week 1 starts there; Week 2 starts 7 days later.
15. A Pay Period spans Pay Period Start through Pay Period Start + 13 (14 days). A week is "complete" once its Friday (week start + 6) is strictly before today.
16. Weeks Left in Year(date) = number of Sat–Fri weeks from `date`'s week through the end date's week of whichever `physical_year_settings` record has `start_date <= date <= end_date`; undefined/blank if no record matches.
17. (Retired in Sprint 007) The old 53-ISO-week-year pairing limitation no longer exists — fixed 14-day cycles do not depend on ISO weeks.

---

## Out of Scope for v1

- Turning this into a full time-management/project-management tool.
- Reports or analytics beyond the recap and history views.
- Multi-user accounts, roles, invites.
- Mobile app / native clients.
- Calendar integrations, automated reminders/notifications.
- Blackout dates / recurring non-work-day rules.
- A user-configurable pay-cycle anchor (the anchor is a fixed documented constant, 2026-01-10) and pay-stub amount / paid-hours comparison.
- An in-app data import/upload feature — all migration is one-time SQL, run directly by the user.
- Data before 2026-01-12 (nothing earlier has been provided; 2026-01-10/11 are known but excluded — see Decisions).
- History tab per-week drill-down (explicitly declined in the Sprint 005 discussion — Prev/Next on the Recap page already covers browsing past periods).
