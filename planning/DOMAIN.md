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
- **Pay Period Recap (landing page)**: the current pay period — two ISO-week-numbered weeks (Week 1 = odd ISO week, Week 2 = the following even week) — showing each week's actual/target/delta (now counting every logged day in the week's range, not just days through today — see Business Rules), the Rolling Balance as of the last fully-completed week, Leave Remaining (collapsible), Weeks Left in Year, and Prev/Next navigation to adjacent pay periods (unlimited range). Each week's "Actual" card is clickable, opening that week's 7-day log in a modal (Date, Day-of-week, Raw, Break, Other, Total) and carries a hover tooltip splitting the total into hours-through-today vs. hours-already-logged-for-later-this-week (broken down by leave type).
- **History tab**: every FULLY ELAPSED past pay period (never the current one, which lives on the landing page), same ISO odd/even pairing, period-level summary rows only — no per-week drill-down (deliberately, per Sprint 005 discussion).
- **Migration**: one-time SQL-script imports of real sheet history, run directly against Supabase by the user, additive-only once real live data exists.

---

## Key Terms

- **ISO Week Number**: the ISO 8601 standard week-of-year number. Week 1 is the week containing the year's first Thursday; weeks run Monday-Sunday. Computed directly in code — no external lookup, no employer-specific anchor.
- **Pay Period**: two consecutive ISO weeks. The odd-numbered week is "Week 1"; the following even-numbered week is "Week 2." A fixed calendar rule, not configurable per user or employer.
- **Physical Year**: a user-entered date range (start date, end date) representing the user's own tracking/leave year, which may not align with the calendar year (Jan 1 - Dec 31). Multiple records can exist (one per real year); looked up by "which record's range contains this date," not effective-dated in the usual sense.
- **Weeks Left in Year**: the count of ISO weeks from today's week through the end of whichever Physical Year record contains today. Blank/not shown if no record matches.

---

## Business Rules (renumbered/clarified, Sprint 005)

Rules 1-5, 7-17 are unchanged since Sprint 004. **Rule 6 is clarified** (the rule's wording was always correct; Sprint 005 fixes an implementation bug that contradicted it):

6. **Weekly Actual Hours** = sum of Work Hours (Rule 5) for **every** day in the week (all 7 days), regardless of whether that day is before, on, or after today. A day with nothing logged naturally contributes 0 — there is no separate "stop at today" rule. (Sprint 002-004 code incorrectly stopped the sum at today; fixed in Sprint 005 after real usage — pre-logging future leave — exposed it as wrong.)
18. **Week Actual Split (Sprint 005, display-only, not a new calculation of Actual/Delta/Rolling Balance)**: for the hover tooltip on a week's "Actual" card, split that week's days into "through today" (date ≤ today) and "later this week" (date > today), sum Work Hours for each group, and further break the "later this week" group down by leave type (vacation/sick/paternity, shown as v/s/p). This is purely a presentational breakdown of the same Rule 6 total — it does not change what Actual, Delta, or Rolling Balance mean.

13. ISO Week Number(date) = the ISO 8601 week-of-year number for that date (Monday-Sunday weeks, Week 1 contains the year's first Thursday).
14. Pay Period Week 1 Start(date) = the Monday of the week containing `date`, adjusted so that Week 1 of a period always falls on an odd ISO week: if that week's ISO number is odd, Week 1 Start = that week's Monday; if even, Week 1 Start = the PRIOR week's Monday (7 days earlier).
15. A Pay Period spans Week 1 Start through Week 1 Start + 13 (14 days, two 7-day weeks).
16. Weeks Left in Year(date) = number of ISO weeks from `date`'s week through the end date's week of whichever `physical_year_settings` record has `start_date <= date <= end_date`; undefined/blank if no record matches.
17. Known limitation: in an ISO year with 53 weeks, the pairing in Rule 14 may not alternate cleanly across the year boundary. Accepted for v1, not solved.

---

## Out of Scope for v1

- Turning this into a full time-management/project-management tool.
- Reports or analytics beyond the recap and history views.
- Multi-user accounts, roles, invites.
- Mobile app / native clients.
- Calendar integrations, automated reminders/notifications.
- Blackout dates / recurring non-work-day rules.
- Employer-specific or user-configurable pay-period anchoring — ISO standard only.
- An in-app data import/upload feature — all migration is one-time SQL, run directly by the user.
- Data before 2026-01-12 (nothing earlier has been provided; 2026-01-10/11 are known but excluded — see Decisions).
- History tab per-week drill-down (explicitly declined in the Sprint 005 discussion — Prev/Next on the Recap page already covers browsing past periods).
