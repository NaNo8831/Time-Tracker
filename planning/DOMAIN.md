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

## Target Workflow (v1, updated Sprint 004)

- **Login**: single email/password login gates the whole app.
- **Daily entry**: pick a date, add one or more check-in/check-out session pairs, optionally override that day's break duration, optionally log leave hours. Reachable directly from the Pay Period Recap's day list, or via its own nav tab (now first in the nav order). No "recent entries" list.
- **Settings / Preferences**: weekly target hours, break duration default, standard workday hours (nested under Paid Holidays), three leave banks, paid holidays, and a new **Physical Year** list (start/end date pairs, used for Weeks Left in Year).
- **Pay Period Recap (landing page)**: the current pay period — two ISO-week-numbered weeks (Week 1 = odd ISO week, Week 2 = the following even week) — showing each week's actual/target/delta, the Rolling Balance as of the end of the period, Leave Remaining, Weeks Left in Year, and a single day-by-day list covering both weeks (visually divided between them), each day clickable through to Daily Entry. Prev/Next navigation steps to adjacent pay periods, unlimited range.
- **History tab**: every FULLY ELAPSED past pay period (never the current one, which lives on the landing page), same ISO odd/even pairing.
- **Migration**: one-time SQL-script imports of real sheet history, run directly against Supabase by the user, additive-only once real live data exists.

---

## Key Terms (additions, Sprint 004)

- **ISO Week Number**: the ISO 8601 standard week-of-year number. Week 1 is the week containing the year's first Thursday; weeks run Monday-Sunday. Computed directly in code — no external lookup, no employer-specific anchor.
- **Pay Period**: two consecutive ISO weeks. The odd-numbered week is "Week 1"; the following even-numbered week is "Week 2." A fixed calendar rule, not configurable per user or employer.
- **Physical Year**: a user-entered date range (start date, end date) representing the user's own tracking/leave year, which may not align with the calendar year (Jan 1 - Dec 31). Multiple records can exist (one per real year); looked up by "which record's range contains this date," not effective-dated in the usual sense.
- **Weeks Left in Year**: the count of ISO weeks from today's week through the end of whichever Physical Year record contains today. Blank/not shown if no record matches.

---

## Business Rules (additions, Sprint 004 — continuing from Rule 12 in the prior pack)

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
