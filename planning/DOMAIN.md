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

A single user (the project owner). This is a personal-use tool — no other roles, accounts, or permissions are needed. Access is gated by a single Supabase email/password login; there is no signup flow.

---

## Secondary Users / Roles

None.

---

## Current Workflow (as observed in the source Google Sheet)

The user currently tracks time in a Google Sheet with one row per day, one tab per time period (the sheet is duplicated and re-dated monthly). Columns include: Date, Day, Check-in, Check-out, ADJ./Hours, Check-in 2, Check-out 2, Break Hours, Raw Hours, Work Hours.

- The user manually enters start/end time(s) daily or weekly, as they remember.
- Each month requires a manual transition: duplicate the template tab, update the dates, add any holidays for that period, and manually link/carry forward the previous month's rollover balance.
- A letter-code "key" (`x`=Break, `v`=Vacation, `h`=Paid Holiday, `s`=Sick, `P`=Paternity, blank=none) is printed as a static reference table in the sheet, off to the side — it is NOT tied row-by-row to the data. The real per-day adjustment lives in an ADJ code column plus a numeric hours column right next to it.
- **Confirmed against real 2026-05-02 through 2026-06-26 data** (see `references/source-app/sheet-export-*.csv`): for `v`/`h`/`s`/`P` codes, the adjacent number is ADDED to that day's hours (clocked session time plus leave/holiday). For the `x` code, the number instead flows into the Break Hours column and is SUBTRACTED — it appears only once in the 8 weeks checked (1 hour, 2026-05-14). On ordinary days, Break Hours is 0: the user does not log a routine daily lunch/break deduction.
- A separate Paternity Leave calculator tracks a fixed bank (Total 64, Used 23.2, Remaining 40.8 hours as of the checked window — unchanged since no "P" code appeared in it).
- A fixed list of recognized paid holidays is maintained by hand nearby, but it is a rolling/partial reminder of upcoming holidays, not the authoritative full list — the authoritative source for which dates are holidays is wherever an `h` code actually appears in the data.
- Weekly summaries compare actual hours against a target (32 hours/week, confirmed unchanged through 2026-05-02–2026-06-26) and carry a rolling under/over balance forward week to week, continuously, with no breaks — verified exactly continuous across both checked CSV exports (-14.77 handoff matches to the cent).
- Sheet's own formula: Work Hours = Raw Hours minus Break Hours plus ADJ (leave/holiday) hours, where "Raw Hours" in the sheet already blends clocked session time with any addition-type ADJ value — this is a sheet-internal quirk, NOT how the app's `rawHours()` works (the app keeps session-derived Raw Hours and leave hours as separate figures that sum together in Work Hours, per Business Rule 5 below).

---

## Target Workflow (v1)

- **Login**: a single email/password login gates the whole app. No signup screen — the one account is created directly in Supabase, outside the app.
- **Daily entry**: pick a date, add one or more check-in/check-out session pairs, optionally override that day's break duration (in 15-minute increments — leave blank to use the effective-dated default), and optionally log vacation/sick/paternity hours against that date (full or partial day).
- **Settings / Preferences page**: weekly target hours, a default break duration, a "standard workday hours" value (used for holiday credit, nested under Paid Holidays), three leave banks, and a maintained list of paid holidays. Weekly target, break duration, standard workday hours, and each leave bank are all effective-dated.
- **Weekly recap (landing page)**: hours worked vs. target for the current week, the rolling balance carried forward from all prior weeks (continuing from a one-time historical seed value where applicable), current remaining leave balances, and a trailing 14-day history table.
- **History tab**: every tracked week, grouped into two-week chunks, most recent first.
- **Migration**: one-time SQL-script imports of real sheet history, run directly against Supabase (never an in-app upload feature — this is a single-user tool and a strictly one-time operation per batch). Sprint 003 covers 2026-05-02 through 2026-06-26; earlier data (back to January 2026) is a separate, later import.

---

## Key Terms

- **Session**: one check-in/check-out pair within a day. A day can have one or more sessions.
- **Raw Hours (day)**: sum of the durations of all sessions logged for that day (app-side; does not blend in leave hours, unlike the source sheet's own "Raw Hours" column).
- **Break Deduction**: the break duration applied once per day — either a manually entered per-day override (15-minute increments) or, if none is set, the break duration setting in effect for that date. Formerly called "Lunch Deduction," gated by a boolean; reworked in Sprint 003 to a nullable override with a fallback default, since real usage showed no routine daily deduction ever occurred.
- **Leave Hours (day)**: vacation, sick, and/or paternity hours logged against that date (can be partial-day, combined with worked hours).
- **Holiday Credit (day)**: if the date matches an entry in the saved holiday list, the "Standard Workday Hours" value in effect on that date is credited automatically — no clock-in required.
- **Work Hours (day)**: Raw Hours minus Break Deduction plus Leave Hours plus Holiday Credit.
- **Weekly Target**: the number of hours the user is expected to work in a week; an effective-dated setting.
- **Rolling Balance**: the cumulative over/under difference between Work Hours and Weekly Target, carried forward week over week — starting from a one-time seed value (if set) representing pre-app history, then computed purely from tracked data from that point forward.
- **Rolling Balance Seed**: a one-time starting offset for Rolling Balance, set directly via SQL (no UI) to preserve continuity with pre-app history like the source Google Sheet's own running balance. Only meaningful as of the very first tracked week; must be updated if an earlier import later pushes the "first tracked week" further back.
- **Leave Bank**: a per-type (vacation/sick/paternity) running total the user manually enters/adjusts with an effective date; remaining balance is that total minus leave hours logged since the effective date. Can be "seeded" with an already-known remaining balance as of a date, without needing to reconstruct every prior leave entry that produced it.
- **Effective-dated / changelog setting**: a setting stored as a series of dated entries rather than a single current value, so that past calculations always use the value that was in effect at the time, even after the setting is later changed. **Critical rule for `weekly_target_settings` specifically**: its earliest entry's `effective_date` determines the very first week the whole app computes — set it to a date before real data exists and every week in between becomes a phantom zero-actual week, corrupting Rolling Balance.

---

## Business Rules

1. Raw Hours (day) = sum of session durations (check_out minus check_in, summed across all of that day's sessions).
2. Break Deduction (day) = the manually entered per-day override for that date if one is set (15-minute increments), otherwise the break duration setting in effect for that date. Applied once per day, independent of session count.
3. Leave Hours (day) = sum of that date's leave hours, across all types.
4. Holiday Credit (day) = the standard workday hours setting in effect that date, if the date is a saved holiday; otherwise 0.
5. Work Hours (day) = Raw Hours minus Break Deduction plus Leave Hours plus Holiday Credit.
6. Weekly Actual Hours = sum of Work Hours for each day in the week.
7. Weekly Delta = Weekly Actual Hours minus Weekly Target Hours, using the Weekly Target value in effect on that week's Monday. A target change taking effect mid-week does not apply until the following Monday's week.
8. Rolling Balance = the rolling balance seed (0 if none is set) plus the cumulative sum of Weekly Delta across all tracked weeks, carried forward indefinitely from the first tracked week onward.
9. Leave Bank Remaining (type) = the most recent leave bank total entered for that type (as of its effective date) minus sum of that leave type's logged hours dated on or after that effective date.
10. All effective-dated settings are looked up as "the most recent entry with an effective date on or before the date being calculated" — never the current/latest value applied retroactively. For Weekly Target specifically, the lookup date is always that week's Monday.
11. Holiday credit is automatic (no manual confirmation needed) once a date is in the saved holiday list.
12. Access requires an authenticated Supabase session (single account, email/password). There is no unauthenticated read or write path.

---

## Known Constraints

- Tech stack: Next.js + Supabase (Postgres + Auth), hosted on Vercel for v1.
- Single user, single Supabase Auth account, gated by login — no roles/multi-tenancy.
- Supabase project credentials must be supplied via local, untracked environment variables — never committed to the repo.
- Historical migration proceeds in batches, each its own reviewable step; Sprint 003 covers 2026-05-02 through 2026-06-26 only. Earlier data (January-April 2026) is a known future batch, not in scope now.
- Do not invent unknown business details. Keep them as `TBD` until the Architect Layer documents them.

---

## Out of Scope for v1

- Turning this into a full time-management/project-management tool.
- Reports or analytics beyond the weekly recap view.
- Multi-user accounts, roles, or invites.
- Mobile app / native clients.
- Calendar integrations or automated reminders/notifications.
- Blackout dates or recurring non-work-day rules.
- A user-configurable pay-period-cycle setting (the History tab's two-week chunks are a simple chronological pairing, not real pay-period alignment).
- A Settings UI for the Rolling Balance Seed (SQL-only, set rarely).
- An in-app data import/upload feature (all migration is one-time SQL, run directly against Supabase by the user).

---

## Success Criteria

The user can see everything the Google Sheet currently shows them, presented on a weekly basis, with the letter-code "key" and the raw balance math hidden from view — just the clean, useful numbers. For the imported 2026-05-02–2026-06-26 window specifically: the app's Rolling Balance at the end of each of the 8 weeks matches the sheet's own recorded values exactly.
