# Domain Context

This file captures the operating context for Time Tracker.

---

## Client

Ly-Ark

---

## Business Goal

Give a single user a fast, low-friction way to log daily worked hours against a personal weekly target, see a running (rolling) balance over/under that target, and track paid leave (vacation, sick, paternity) and paid holidays — replacing a manually-maintained Google Sheet that has become cumbersome to keep up to date.

---

## Project Type

Internal tool (personal use, single user)

---

## Primary Users / Roles

A single user (the project owner). This is a personal-use tool — no other roles, accounts, or permissions are needed.

---

## Secondary Users / Roles

None.

---

## Current Workflow (as observed in the source Google Sheet)

The user currently tracks time in a Google Sheet with one row per day, one tab per time period (the sheet is duplicated and re-dated monthly). Columns include: Date, Day, Check-in, Check-out, ADJ./Hours, Check-in 2, Check-out 2, Break Hours, Raw Hours, Work Hours.

- The user manually enters start/end time(s) daily or weekly, as they remember.
- Each month requires a manual transition: duplicate the template tab, update the dates, add any holidays for that period, and manually link/carry forward the previous month's rollover balance.
- A letter-code "key" marks special day types: `x` = Break, `v` = Vacation, `h` = Paid Holiday, `s` = Sick, `P` = Paternity, blank = none.
- A separate Paternity Leave calculator tracks a fixed bank (seen as Total 64, Used 23.2, Remaining 40.8 hours).
- A fixed list of recognized paid holidays is maintained by hand (e.g., July 4th, Aug 15th, Sept 1st).
- Weekly summaries compare actual hours against a target (32 hours/week in the current sheet) and carry a rolling under/over balance forward week to week (e.g., -32.00, then -64.00, then -96.00 as unworked weeks accumulate).
- Confirmed formula in the current sheet: Work Hours = Raw Hours minus Break Hours plus ADJ (leave/holiday) hours.

---

## Target Workflow (v1)

- **Daily entry**: pick a date, add one or more check-in/check-out session pairs (supports complex days, e.g., 8am-2pm, then 6pm-10pm), a single "took lunch" toggle for the day, and optionally log vacation/sick/paternity hours against that date (full or partial day).
- **Settings / Preferences page**: weekly target hours, a default lunch duration, a "standard workday hours" value (used for holiday credit), three leave banks (vacation, sick, paternity), and a maintained list of paid holidays (date + label). Weekly target, lunch duration, standard workday hours, and each leave bank are all effective-dated — see Business Rules below.
- **Weekly recap (landing page)**: hours worked vs. target for the current week, the rolling balance carried forward from all prior weeks, and current remaining leave balances. Presented as clean numbers — no exposed letter-code "key" or raw balance math, matching the user's stated success criteria.
- **Migration**: a one-time import of the user's 2026 daily entries from the source Google Sheet into the new data model.

---

## Key Terms

- **Session**: one check-in/check-out pair within a day. A day can have one or more sessions.
- **Raw Hours (day)**: sum of the durations of all sessions logged for that day.
- **Lunch Deduction**: a flat amount of time subtracted once per day, only if the "took lunch" toggle is checked for that day, regardless of how many sessions exist that day.
- **Leave Hours (day)**: vacation, sick, and/or paternity hours logged against that date (can be partial-day, combined with worked hours).
- **Holiday Credit (day)**: if the date matches an entry in the saved holiday list, the "Standard Workday Hours" value in effect on that date is credited automatically — no clock-in required.
- **Work Hours (day)**: Raw Hours minus Lunch Deduction plus Leave Hours plus Holiday Credit.
- **Weekly Target**: the number of hours the user is expected to work in a week; an effective-dated setting.
- **Rolling Balance**: the cumulative over/under difference between Work Hours and Weekly Target, carried forward week over week from the start of tracked history.
- **Leave Bank**: a per-type (vacation/sick/paternity) running total the user manually enters/adjusts with an effective date; remaining balance is that total minus leave hours logged since the effective date.
- **Effective-dated / changelog setting**: a setting stored as a series of dated entries rather than a single current value, so that past calculations always use the value that was in effect at the time, even after the setting is later changed.

---

## Business Rules

1. Work Hours (day) = Raw Hours (sum of session durations) minus Lunch Deduction (flat, once/day if "took lunch" checked, using the lunch duration setting in effect that date) plus Leave Hours (that date) plus Holiday Credit (if that date is a saved holiday, using the Standard Workday Hours setting in effect that date).
2. Lunch is subtracted once per day, independent of the number of sessions — it is not derived from any gap between sessions.
3. Weekly Actual Hours = sum of Work Hours for each day in the week.
4. Weekly Delta = Weekly Actual Hours minus Weekly Target Hours (the target value in effect for that week; see open question on the exact effective-date rule for a target change mid-week in `planning/QUESTIONS.md`).
5. Rolling Balance = cumulative sum of Weekly Delta across all tracked weeks (carried forward indefinitely, matching the source sheet's behavior).
6. Leave Bank Remaining (type) = the most recent leave bank total entered for that type (as of its effective date) minus sum of that leave type's logged hours dated on or after that effective date.
7. All effective-dated settings (weekly target, lunch duration, standard workday hours, each leave bank) are looked up as "the most recent entry with an effective date on or before the date being calculated" — never the current/latest value applied retroactively.
8. Holiday credit is automatic (no manual confirmation needed) once a date is in the saved holiday list.

---

## Known Constraints

- Tech stack: Next.js + Supabase, hosted on Vercel for v1 (self-hosting remains a possible future move; not built for v1).
- Single user, no auth/roles/multi-tenancy required beyond the simplest access gate (see open question in `planning/QUESTIONS.md`).
- Implementation repo: Downloaded project folder.
- Canonical GitHub repo: UNKNOWN.
- Source material: Google Sheet at `https://docs.google.com/spreadsheets/d/1KKEhUQkF4SOgrrC_zReIPbNJwVC6k9eW44tk7AgTcYY/edit` (open access) — reviewed during discovery; only 2026 entries are in scope for migration.
- Do not invent unknown business details. Keep them as `TBD` until the Architect Layer documents them.

---

## Out of Scope for v1

- Turning this into a full time-management/project-management tool.
- Reports or analytics beyond the weekly recap view.
- Multi-user accounts, roles, or invites.
- Mobile app / native clients.
- Calendar integrations or automated reminders/notifications.
- Blackout dates or recurring non-work-day rules (e.g., "never works Sunday") — logged as a future enhancement.
- Migrating pre-2026 historical data from the source sheet.

---

## Success Criteria

The user can see everything the Google Sheet currently shows them, presented on a weekly basis, with the letter-code "key" and the raw balance math hidden from view — just the clean, useful numbers (hours vs. target, rolling balance, leave remaining).
