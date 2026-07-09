============================================================
FILE: planning/STATE.md
============================================================

# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-07-09

---

## Current Phase

Sprint 003 Ready — Break Model Rework + Historical Migration Authorized

---

## Current Status

Architect Pack 003 has been applied. Sprint 003 is now authorized to: (1) rework the daily break/lunch model from a boolean flag to a manual per-day override with an effective-dated default, (2) add a one-time rolling-balance seed so historical continuity from the source Google Sheet is preserved, and (3) import 8 real weeks of sheet data (2026-05-02 through 2026-06-26) via a one-time SQL script — the first real test of the calculation engine against numbers the user already trusts.

- No Sprint 003 code has been written yet.
- Sprint 002 (Core MVP Build) is complete, hardened through three UI/UX rounds, and live on a real (now empty) Supabase project.
- Sprint 003 does NOT cover data before 2026-05-02 — the user has said they intend to bring in everything from January 2026 eventually, but that is a later, separate import once this test batch is proven correct.

---

## Active Sprint

`planning/sprints/003-break-rework-and-migration/`

---

## Active Work

Builder: read `planning/sprints/003-break-rework-and-migration/` in full, then stop at the code gate — post a concrete file-by-file plan and wait for explicit approval before writing any code.

---

## Project Metadata

| Field | Value |
|---|---|
| Project name | Time Tracker |
| Client name | Ly-Ark |
| Project slug | time-tracker |
| One-sentence description | Time Tracker is a tool designed to help users track their worked time against a set target number of hours over the course a month with historical date to review. |
| Project type | Internal tool |
| Planning folder | time-tracker/ |
| Implementation repo | Downloaded project folder |
| Canonical GitHub repo | UNKNOWN |
| Tech stack | Next.js 14 (App Router), Supabase (Postgres + Auth via `@supabase/ssr`), Tailwind CSS, Vitest, Vercel |

---

## v1 Scope Snapshot

See `planning/DOMAIN.md` and `docs/ARCHITECTURE.md` for full detail. Sprint 003 adds:

- Break model: `day_entries` gets a nullable `break_minutes_override` (15-minute increments) replacing the old `lunch_taken` boolean. When unset, falls back to the effective-dated `break_duration_settings` default (renamed from `lunch_duration_settings`).
- Rolling balance seed: a new one-row `rolling_balance_seed` table lets historical rolling balance continue from the source sheet's real running total instead of starting at zero. No UI for this in v1 — set once via SQL during migration.
- Historical import: 2026-05-02 through 2026-06-26 (8 weeks), sourced from `references/source-app/sheet-export-2026-05-02-to-2026-05-29.csv` and `references/source-app/sheet-export-2026-05-30-to-2026-06-26.csv`.
- Out of scope: any data before 2026-05-02, a configurable pay-period-cycle setting (still deferred), any UI for editing the rolling balance seed, reports/analytics, multi-user.

---

## Next Actions

1. Builder executes Sprint 003 from `planning/sprints/003-break-rework-and-migration/` only, starting with the mandatory code gate.
2. After Sprint 003 is verified live, plan the next import (back to January 2026) as its own future sprint — do not fold it into this one.

---

## Blockers

No known blocker. The Builder will need the user to run the schema-migration SQL and the data-import SQL against the live Supabase project (Builder has no direct DB access).

---

## Watch Items

- **Critical**: `weekly_target_settings`' earliest `effective_date` must equal the Monday of the earliest real tracked week (2026-04-27), not an earlier placeholder — see `planning/RISKS.md`. Setting it earlier creates phantom empty weeks that silently corrupt the rolling balance by a large margin.
- The `rolling_balance_seed` value (-27.67) and the earliest settings effective_date (2026-04-27) will both need to be replaced/adjusted when the eventual January-2026 import happens — this is expected and documented, not a bug to "fix" now.
- Keep secrets, credentials, and private tokens out of project files.
- Do not implement a configurable pay-period-cycle setting in this sprint — still deferred (`planning/QUESTIONS.md`).

============================================================
FILE: planning/DECISIONS.md
============================================================

# Decisions

Record durable decisions future sprints must respect.

---

## Decision Log

| Date | Decision | Reason | Impact |
|---|---|---|---|
| 2026-07-08 | Tech stack is Next.js + Supabase + Vercel for v1. | Fastest path for a single-user tool; user already knows the stack; a Next.js app is not locked to Vercel, so self-hosting stays possible later if desired. | No self-hosting infrastructure work in v1. |
| 2026-07-08 | Work Hours (day) = Raw Hours (sum of all check-in/check-out sessions) minus Lunch Deduction (flat, once per day, only if "took lunch" is checked) plus Leave Hours (vacation/sick/paternity logged that day) plus Holiday Credit (if the date is a saved holiday). | Confirmed against the user's real usage pattern (e.g., 8am-2pm, lunch, 6pm-10pm) and against the existing Google Sheet's Work Hours formula, which the user confirmed as correct. | Day entries must support multiple sessions per day. Lunch is a single flat subtraction independent of session count, not tied to any specific session gap. Superseded 2026-07-09 by the break-model rework below (still one flat subtraction per day, but no longer boolean-gated). |
| 2026-07-08 | Weekly target hours, lunch duration default, standard workday hours, and each leave bank (vacation/sick/paternity) are all stored as effective-dated changelog entries, not single mutable values. | The user needs to adjust these over time (e.g., weekly target changed from a 4-day/32hr week to a 5-day/32hr week) without rewriting the math on past weeks. | Settings become versioned records (value + effective date). Calculations must always look up "the value in effect as of the date being calculated," not the current value. |
| 2026-07-08 | Holiday credit hours come from a directly user-editable "Standard Workday Hours" setting, not a formula derived from weekly target divided by workdays per week. | The user's workdays-per-week has changed historically (4-day to 5-day week); a derived formula would silently change past holiday credit whenever the target or day count changed. | Standard Workday Hours is its own effective-dated setting, independent of weekly target hours. Confirmed correct against real May 2026 data (6.4 hrs = 32/5, the 5-day-week era); the 4-day-week era (8.0 hrs = 32/4) predates this sprint's import window and will need its own earlier-dated entry when January data is imported later. |
| 2026-07-08 | Leave banks (vacation, sick, paternity) are self-reported: the user manually enters/adjusts each bank's total hours with an effective date, matching what their employer reports. There is no employer system integration. | The user reconciles balances against their employer manually and needs full manual control, including corrections. | No auth/integration work with an employer HR system. Remaining balance = latest bank total in effect minus sum of that leave type's hours logged since that bank's effective date. |
| 2026-07-08 | Historical migration covers only calendar-year 2026 entries from the source Google Sheet. | The sheet's format evolved over its roughly three-year life; only the current year's format is clean enough to migrate reliably. | Pre-2026 history remains in the original Google Sheet only and is not migrated into the app. |
| 2026-07-08 | Blackout dates / recurring non-work-day rules (e.g., "never works Sunday") are out of scope for v1. | Adds recurring-exclusion-rule complexity and interacts with holiday logic; conflicts with the user's explicit "don't turn this into a full time management tool" boundary. | Logged as a future enhancement in `planning/QUESTIONS.md`. Not part of Sprint 002 scope. |
| 2026-07-08 | Reports/analytics beyond the weekly recap view are out of scope for v1. | Matches the user's explicit out-of-scope intake boundary. | v1 ships only the weekly recap (hours vs. target, rolling balance, leave balances). |
| 2026-07-09 | Auth for v1 is Supabase email/password, gating the entire app, with a single account created directly in the Supabase dashboard (no self-serve signup flow). | User chose to future-proof for occasional off-network access over the simpler shared-password-gate option, while staying within the Micro-app rigor tier (no roles, no invites, no multi-user). | Sprint 002 must implement a login screen and route protection (middleware), but not a signup/registration flow. The one account is provisioned manually, outside the app. |
| 2026-07-09 | A weekly target change takes effect starting the following Monday; the value in effect on a week's Monday governs that entire week's Weekly Delta, even if the target changes again mid-week. | Resolves the open week-boundary question with the simplest predictable rule, matching the working assumption already documented; avoids blended-target math for a case expected to be rare. | Confirms Business Rule 4/7 in `planning/DOMAIN.md`. Weekly Delta calculation always looks up the effective-dated value as of each week's Monday, not per-day. |
| 2026-07-09 | Backups for v1 rely on Supabase's built-in automatic backups; no custom export/download tooling is built in Sprint 002. | Matches the Micro-app rigor tier's bias to the smallest thing that works; low-stakes personal data. | Removes bespoke export/backup UI from Sprint 002 scope. Revisit only if the user's needs change. |
| 2026-07-09 | The Google Sheet migration ships as its own follow-up sprint (Sprint 003+), not bundled into Sprint 002. | Keeps Sprint 002 small enough to build and verify cleanly; migration has its own risks (data cleanliness) that are easier to isolate once the core app is proven. | Sprint 002 shipped with an empty database; the user tested it live before migration was planned. |
| 2026-07-09 | Styling uses Tailwind CSS; data mutations use Next.js Server Actions talking directly to Supabase (no separate REST/GraphQL API layer). | Standard, low-overhead pairing with the chosen stack. | Sprint 002's blueprint assumed this structure; carried forward unchanged. |
| 2026-07-09 | Supabase RLS is enabled on all tables, one policy per table permitting all operations to any authenticated session (not scoped to `user_id`). | Only one account exists; scoping by `user_id` adds complexity with no present benefit. | If a second account is ever added post-v1, RLS policies must be revisited first. |
| 2026-07-09 | Sprint 002 built with `@supabase/ssr`; Next.js pinned to `^14.2.15`. | Current recommended Supabase package for Next.js App Router; stable pin avoids mid-sprint surprises. | Sprint 003 and beyond should follow the same pattern in `src/lib/supabase/`. |
| 2026-07-09 | Sprint 002 was self-verified (tests, typecheck, build, auth-gate smoke test) without a real Supabase project during the Builder session; later, real credentials and schema were applied live by the user outside that session. | Builder cannot fabricate real credentials. | Confirmed resolved once the user applied the schema and ran the app locally. |
| 2026-07-09 | Two UI/UX + hardening rounds added: 24hr/15-min time selector; session overlap/duplicate rejection; unique constraints on all four effective-dated settings tables; Settings page reorder (Paid Holidays above Leave Banks, Standard Workday Hours nested inside it); a 14-day history table on the recap page with a Total column and a combined "Other" column (Vacation+Sick+Paternity+Holiday Credit, computed via the same `workHours()` function as the weekly recap — no divergence); a new History tab showing all tracked weeks in two-week chunks. | User-requested hardening and visibility once real usage started. | See `src/lib/calculations/{dailyBreakdown,history,periods,sessionOverlap}.ts`. The two-week chunking is a naive chronological pairing, not aligned to a real pay-period anchor — that remains deferred. |
| 2026-07-09 | The user shared two real CSV exports from the source Google Sheet (2026-05-02 through 2026-06-26, 8 weeks). Parsing them revealed the actual per-cell convention: an ADJ code letter (v/h/s/P/x) plus a numeric hours value in the adjacent cell. For v/h/s/P, that number is ADDED to the day's hours (leave/holiday). For x, it instead flows into the sheet's Break Hours column and is SUBTRACTED — it appears only once in 8 weeks (1 hour, 2026-05-14). Ordinary days show Break Hours = 0; the user does not log a routine lunch/break deduction day to day. | Real data, not assumption — confirms/corrects the migration mapping documented after Sprint 001's discovery, which only had column names, not cell semantics. | `planning/DOMAIN.md`'s migration mapping notes updated. The near-universal "Break Hours = 0" finding directly motivated the break-model rework below. |
| 2026-07-09 | Reworked the break/lunch model: `day_entries.lunch_taken` (boolean) is replaced by `day_entries.break_minutes_override` (nullable integer, must be a multiple of 15). When set, it is used directly as that day's break deduction. When null, the app falls back to the effective-dated `break_duration_settings` value (renamed from `lunch_duration_settings`) in effect for that date — same effective-dating rule as every other setting. | The real sheet data showed no routine daily deduction, but one real one-off adjustment (the "x" code) that needs to be representable per-day without changing the default for every other day. A manual override with a sensible fallback matches reality better than a blanket boolean. | Renames ripple through `src/lib/calculations/workHours.ts` (`lunchDeduction` → `breakDeduction`), `dailyBreakdown.ts`, `history.ts`, `recap.ts`, the data layer, and both the Daily Entry and Settings screens. Since the live `day_entries` and `lunch_duration_settings` tables are empty (post-`TRUNCATE`), this is implemented as a clean schema change, not a data-preserving migration. |
| 2026-07-09 | The default `break_duration_settings` value for the imported historical window (2026-05-02 onward) is 0 minutes, matching the real data (Break Hours was 0 on every ordinary day). | Reflects actual historical behavior exactly rather than assuming a lunch deduction that never happened. | The one real exception (2026-05-14, "x" code, 1 hour) is imported as a per-day `break_minutes_override` of 60, not a change to the default. |
| 2026-07-09 | Added a one-time `rolling_balance_seed` table (single row: `balance`, `note`) so the app's Rolling Balance can continue from the sheet's real running total (-27.67, the balance immediately before the week of 2026-05-02) instead of starting at zero. No Settings UI for this in v1 — it is set once via SQL during migration and only ever needs changing if an earlier import (e.g., January 2026) later becomes the new "earliest tracked week." | The calculation engine's Rolling Balance was, until now, always fully derived from daily data starting at zero — there was no way to honor real pre-app history. Building a full UI for a value that's set once and rarely touched again would be over-engineering for this rigor tier. | `src/lib/calculations/recap.ts`'s `rollingBalance()` call now starts from the seed instead of a hardcoded 0. Documented in `docs/ARCHITECTURE.md` as a deliberately code-only (no UI) setting. |
| 2026-07-09 | `weekly_target_settings`' earliest entry for this import must have `effective_date = 2026-04-27` (the Monday of the week containing 2026-05-02, the earliest imported day) — NOT an earlier placeholder like 2026-01-01. | `buildWeeklyRecap()` computes every week from `mondayOf(earliest weekly_target_settings.effective_date)` through the current week, treating any week with no data as a full zero/-32 week. An earlier placeholder would silently generate ~17 phantom empty weeks (January-April) before the real data even starts, corrupting the rolling balance by hundreds of hours. | Flagged as a critical watch-item in `planning/STATE.md` and `planning/RISKS.md`. The same effective_date (2026-04-27) is used for the initial `break_duration_settings` and `standard_workday_hours_settings` entries for consistency, though only `weekly_target_settings` has the phantom-week failure mode. |
| 2026-07-09 | The paternity leave bank is imported as `total_hours = 40.8` (the sheet's already-known Remaining value) effective 2026-05-01, not the original `total_hours = 64` with reconstructed usage history. | No paternity leave was logged as a "P" code in either imported CSV, so the 23.2 hours already used happened before the import window. Reconstructing that pre-window usage isn't needed — effective-dated settings already support "snapshot the current known state as of a date," which is exactly this case. | `leave_banks` gets one row: `leave_type='paternity', total_hours=40.8, effective_date='2026-05-01'`. No `leave_entries` rows are needed to explain the prior 23.2 hours. |
| 2026-07-09 | Sprint 003's import covers exactly 2026-05-02 through 2026-06-26 (8 weeks, both full CSVs the user provided) and infers standard US holiday names (e.g., "Memorial Day" for 2026-05-25) rather than importing placeholder labels. | User confirmed both explicitly when asked. The 8 weeks form one complete, internally-consistent chunk (rolling balance verified continuous end-to-end against the sheet's own numbers). | Only one holiday falls in this window (2026-05-25). Later imports (e.g., back to January) will need their own holiday-label pass. |

============================================================
FILE: planning/DOMAIN.md
============================================================

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

============================================================
FILE: planning/RISKS.md
============================================================

# Risks

Known project risks and mitigation notes.

---

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| Effective-dated settings model is more complex than a flat settings table; a bug in "which value was in effect" lookups could silently corrupt historical balances the user relies on. | Medium | High | Documented explicitly (Business Rule 10); Sprint 002's acceptance criteria included a specific mid-history regression test, still passing. | Resolved — ongoing regression coverage |
| Migrated sheet data may be inconsistent (manual entry errors, format drift). | Medium | Medium | Sprint 003 uses two real, directly-inspected CSV exports (saved in `references/source-app/`) with the mapping rules validated against multiple real examples before writing any import SQL. Spot-check remaining after import. | Open — addressed in Sprint 003 acceptance criteria |
| No backup/export strategy defined for Supabase-hosted personal data. | Medium | Medium | Resolved: rely on Supabase's built-in automatic backups. | Resolved |
| Rolling balance and leave-bank math depend on getting week/date boundary rules exactly right. | Low | Medium | Resolved: target changes apply starting the following Monday (Business Rule 7). | Resolved |
| Scope creep toward a "full time management tool" the user explicitly does not want. | Low | Medium | Every future sprint checked against the Out of Scope list in `planning/DOMAIN.md` before being authorized. | Open |
| RLS policy permits any authenticated session to read/write all rows (not scoped per-user). | Low | Medium | Documented as a deliberate v1 tradeoff; must be revisited before any second account is created. | Open — accepted for v1 |
| Losing the single Supabase account's password/access with no self-serve signup fallback could lock the user out. | Low | Low | Supabase's standard password-reset-by-email flow covers recovery. | Open — accepted for v1 |
| **New**: `weekly_target_settings`' earliest `effective_date` must exactly equal the Monday of the earliest real tracked week (2026-04-27 for this import). Setting it earlier (e.g., an arbitrary "start of year" placeholder) silently generates phantom empty weeks that tank Rolling Balance by a large, wrong amount. | Medium | High | Flagged prominently in `planning/DOMAIN.md`, `docs/ARCHITECTURE.md`, and this sprint's acceptance criteria (exact expected Rolling Balance values per week, taken from the sheet itself, must match). | Open — addressed in Sprint 003 acceptance criteria |
| **New**: the `rolling_balance_seed` value and the earliest settings `effective_date` will both need deliberate updates when an earlier (e.g., January 2026) import eventually happens — if forgotten, the seed would double-count or the phantom-week problem above would resurface. | Low (not yet, since it's a known future step) | High (when it happens) | Documented explicitly in `planning/DECISIONS.md` and `planning/STATE.md` as expected future work, not a bug. | Open — accepted, deferred to that future sprint |
| **New**: the historical break-duration default (0 minutes) is only confirmed correct for the 2026-05-02–2026-06-26 window (the "5-day week" era, per Standard Workday Hours = 6.4). Earlier data (e.g., January-April 2026, the "4-day week" era per prior decisions) may have used a different actual break pattern. | Low (not yet in scope) | Medium (when Jan-Apr is imported) | Will need re-verification against that data's real cells when that import is planned — do not assume 0 minutes applies retroactively without checking. | Open — deferred to that future sprint |

============================================================
FILE: planning/QUESTIONS.md
============================================================

# Open Questions

Questions that need answers from the Architect or Builder.

---

| Question | Owner | Needed By | Status | Answer / Notes |
|---|---|---|---|---|
| Which weekly target value applies if the target changes mid-week? | Architect/User | Sprint 002 planning | Resolved | The value in effect on the week's Monday governs the whole week. See `planning/DECISIONS.md` and Business Rule 7. |
| What auth approach does v1 need? | User | Sprint 002 planning | Resolved | Supabase email/password login, single manually-provisioned account, no signup flow. |
| What backup/export strategy should protect the Supabase-hosted data? | Architect | Sprint 002 or later | Resolved | Rely on Supabase's built-in automatic backups for v1. |
| Should blackout dates / recurring non-work-day rules become a future sprint? | User | Post-v1 | Deferred | Explicitly out of scope for v1 per user request; revisit after v1 ships. |
| Should reports/analytics beyond the weekly recap become a v2 direction? | User | Post-v1 | Deferred | Explicitly out of scope for v1; user flagged interest as a future possibility. |
| Should pre-2026 historical sheet data ever be migrated? | User | Post-v1 | Open | Not needed for v1; the source sheet stays authoritative for pre-2026 history for now. |
| Should the single-account RLS approach be revisited before any second account is ever added? | Architect | Before any second account is created | Open | Documented as an accepted v1 tradeoff. |
| Should the recap support a user-configurable pay-period cycle (anchor date + length)? | User/Architect | Not urgent | Open | The History tab's two-week chunks are a naive chronological pairing, not real pay-period alignment. Worth revisiting once more historical data is in and the user has a feel for whether the naive chunking is good enough. |
| **New**: how should the January-April 2026 import (the "4-day week" era) be scoped, and does its Break Hours data confirm the same "no routine deduction" pattern found in the May-June window? | User/Architect | Whenever that import is planned | Open | Explicitly deferred — Sprint 003 covers only 2026-05-02 through 2026-06-26. Do not assume the same settings values (target/break-default/standard-workday-hours) apply retroactively without checking real cells from that period. |

============================================================
FILE: planning/FILE_INVENTORY.md
============================================================

# File Inventory

Use this file to track important project files, references, samples, and their status.

---

## Generated Starter Files

| File | Purpose | Status | Notes |
|---|---|---|---|
| `planning/INTAKE.md` | Generated project startup artifact. | Created | Reviewed during Architect Pack 001 discovery. |
| `project-start.md` | Generated project startup artifact. | Created | Reviewed before starting Architect Pack 001. |
| `architect-chat-starter-prompt.md` | Generated project startup artifact. | Created | Reviewed before starting Architect Pack 001. |

---

## Personalized Scaffold Files

| File | Purpose | Status | Notes |
|---|---|---|---|
| `README.md` | Project-specific starter documentation. | Personalized | Initialized from CLI metadata. |
| `AGENTS.md` | Project-specific starter documentation. | Personalized | Initialized from CLI metadata. |
| `planning/STATE.md` | Project-specific starter documentation. | Updated by Architect Pack 003 | Reflects Sprint 003 authorization. |
| `planning/DOMAIN.md` | Project-specific starter documentation. | Updated by Architect Pack 003 | Break model rework, rolling balance seed, real sheet-parsing findings. |
| `planning/FILE_INVENTORY.md` | Project-specific starter documentation. | Updated by Architect Pack 003 | This file. |

---

## Source Material Reviewed

| Reference | Purpose | Status | Notes |
|---|---|---|---|
| Google Sheet: `https://docs.google.com/spreadsheets/d/1KKEhUQkF4SOgrrC_zReIPbNJwVC6k9eW44tk7AgTcYY/edit` | Source of the current manual time-tracking workflow. | Reviewed | Two real CSV exports (2026-05-02–06-26) reviewed cell-by-cell during Sprint 003 planning — see below. |
| `references/source-app/sheet-export-2026-05-02-to-2026-05-29.csv` | Real source data for the first 4 weeks of Sprint 003's import batch. | Saved | Verbatim export shared by the user. |
| `references/source-app/sheet-export-2026-05-30-to-2026-06-26.csv` | Real source data for the second 4 weeks of Sprint 003's import batch. | Saved | Verbatim export shared by the user. |

---

## Sprint 001 Deliverables

| File | Purpose | Status |
|---|---|---|
| `planning/sprints/001-discovery-architecture/*` | Discovery/architecture planning pack. | Complete |

## Sprint 002 Deliverables

| File | Purpose | Status |
|---|---|---|
| `planning/sprints/002-core-mvp-build/*` | Core MVP build (auth, daily entry, settings, recap). | Complete, hardened through 3 rounds |

## Sprint 003 Deliverables

| File | Purpose | Status |
|---|---|---|
| `planning/sprints/003-break-rework-and-migration/requirements.md` | Sprint 003 requirements. | Created by Architect Pack 003 |
| `planning/sprints/003-break-rework-and-migration/blueprint.md` | Break model rework + migration technical design. | Created by Architect Pack 003 |
| `planning/sprints/003-break-rework-and-migration/acceptance.md` | Sprint 003 acceptance criteria, including exact expected Rolling Balance values per imported week. | Created by Architect Pack 003 |
| `planning/sprints/003-break-rework-and-migration/handoff-prompt.md` | Sprint 003 Builder handoff prompt. | Created by Architect Pack 003 |
| `docs/ARCHITECTURE.md` | Durable architecture reference. | Updated by Architect Pack 003 |
| `docs/VALIDATION.md` | Validation priorities. | Updated by Architect Pack 003 |

---

## Common Source And Reference Folders

| Folder | Purpose | Status | Notes |
|---|---|---|---|
| `references/client-docs/` | Client docs, proposals, emails, meeting notes, intake material. | Created / ensured | |
| `references/source-app/` | Existing app, code, assets, exports, source-system material. | In use | Now holds the two real sheet CSV exports for Sprint 003. |
| `references/platform/` | Platform notes, repo notes, hosting notes, integration context. | Created / ensured | |
| `samples/` | Sample data, exports, workbooks, fixtures, generated examples. | Created / ensured | |
| `planning/architect-packs/` | Architect Pack files before importer dry-run/apply. | Created / ensured | |

============================================================
FILE: planning/sprints/003-break-rework-and-migration/requirements.md
============================================================

# Sprint 003 Requirements — Break Model Rework + Historical Migration

## Goal

1. Rework the daily break/lunch model from a boolean flag to a manual per-day override (15-minute increments) that falls back to an effective-dated default when unset.
2. Add a one-time Rolling Balance seed so historical continuity from the source Google Sheet is preserved.
3. Import 8 real weeks of sheet data (2026-05-02 through 2026-06-26) via a one-time SQL script, as the first real-data test of the calculation engine.

## In Scope

- Schema: rename `lunch_duration_settings` → `break_duration_settings`; replace `day_entries.lunch_taken` (boolean) with `day_entries.break_minutes_override` (nullable integer, multiple of 15); add a new single-row `rolling_balance_seed` table (`balance`, `note`).
- Calculation engine: rename `lunchDeduction` → `breakDeduction` and all related fields across `workHours.ts`, `dailyBreakdown.ts`, `history.ts`, `recap.ts`; `recap.ts`'s rolling balance computation starts from the seed value (0 if unset) instead of a hardcoded 0.
- Daily Entry screen: replace the "took lunch" checkbox with a 15-minute-increment break override selector (blank = use default).
- Settings screen: rename the "Lunch Duration" section to "Break Duration."
- A one-time SQL migration script (schema changes) and a one-time SQL data-import script (the 8 weeks of real data), both handed to the user to run manually — no in-app feature.
- Settings data for the import window: `weekly_target_settings` (32 hrs, effective 2026-04-27), `break_duration_settings` (0 min, effective 2026-04-27), `standard_workday_hours_settings` (6.4 hrs, effective 2026-04-27), `leave_banks` (paternity, 40.8 hrs, effective 2026-05-01), one holiday (2026-05-25, "Memorial Day"), and the `rolling_balance_seed` row (-27.67).
- Day-by-day import of `day_entries`/`sessions`/`leave_entries` for every date in the window that has real activity (sessions, leave, or a holiday), sourced from `references/source-app/sheet-export-2026-05-02-to-2026-05-29.csv` and `references/source-app/sheet-export-2026-05-30-to-2026-06-26.csv`.

## Out of Scope

- Any data before 2026-05-02 or after 2026-06-26 (a later, separate sprint).
- A configurable pay-period-cycle setting.
- Any Settings UI for the Rolling Balance Seed (SQL-only for now).
- An in-app data import/upload feature.
- Reports/analytics beyond the weekly recap and History tab.
- Multi-user, mobile, calendar integrations, reminders, blackout dates.

## Tied to Business Goal

Directly validates the core value proposition: that the app's calculation engine produces the same numbers as the trusted source sheet, using the user's own real data — and fixes a real mismatch (the break/lunch model) discovered by looking at that real data.

============================================================
FILE: planning/sprints/003-break-rework-and-migration/blueprint.md
============================================================

# Sprint 003 Blueprint — Break Model Rework + Historical Migration

## Approach

Build in this order:

1. Schema migration SQL (break model rename/rework + rolling_balance_seed table) — hand to user to run first.
2. Calculation engine renames + rolling balance seed support, with updated unit tests.
3. Daily Entry + Settings UI updates for the new break model.
4. Data-import SQL script (settings rows, then day-by-day day_entries/sessions/leave_entries) — hand to user to run after step 1-3 are live.
5. Verify against the exact expected values in `acceptance.md`.

## Schema Changes

```sql
-- Break model rework (live tables are empty post-TRUNCATE, so this is a
-- clean structural change, not a data-preserving migration).

alter table day_entries drop column lunch_taken;
alter table day_entries add column break_minutes_override integer;
alter table day_entries add constraint day_entries_break_override_multiple_of_15
  check (break_minutes_override is null or break_minutes_override % 15 = 0);
alter table day_entries add constraint day_entries_break_override_non_negative
  check (break_minutes_override is null or break_minutes_override >= 0);

alter table lunch_duration_settings rename to break_duration_settings;
alter table break_duration_settings rename constraint
  lunch_duration_settings_effective_date_unique to break_duration_settings_effective_date_unique;
-- RLS policy also needs renaming (drop the old lunch-named policy, create
-- an equivalent one on break_duration_settings — same authenticated-only rule).

create table rolling_balance_seed (
  id uuid primary key default gen_random_uuid(),
  balance numeric not null,
  note text,
  created_at timestamptz not null default now()
);
alter table rolling_balance_seed enable row level security;
create policy "authenticated_all_rolling_balance_seed" on rolling_balance_seed
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

Update `supabase/schema.sql` itself to reflect this end-state directly (for future fresh installs) — do not leave it describing the old boolean model.

## Calculation Engine Changes

- `src/lib/calculations/workHours.ts`: rename `lunchDeduction(lunchTaken, lunchDurationMinutesInEffect)` → `breakDeduction(overrideMinutes, defaultMinutesInEffect)`. Formula: `(overrideMinutes ?? defaultMinutesInEffect ?? 0) / 60`. Update `WorkHoursInput` and `workHours()` accordingly (rename `lunchTaken`/`lunchDurationMinutesInEffect` fields to `breakMinutesOverride`/`breakDurationMinutesInEffect`).
- `src/lib/calculations/dailyBreakdown.ts`, `history.ts`: same field renames flowing through (the output field `breakHours` already has the right name — only inputs change).
- `src/lib/calculations/recap.ts`: `RecapInput.lunchTakenByDate: Map<IsoDate, boolean>` → `breakMinutesOverrideByDate: Map<IsoDate, number | null>`; `lunchDurationSettings` → `breakDurationSettings`. Add `rollingBalanceSeed: number` to `RecapInput` (default 0), and change `buildWeeklyRecap()` to seed `rollingBalance()`'s starting value instead of always starting at 0 — either by adding a seed parameter to `rollingBalance()` in `weekly.ts`, or by adding the seed to the final computed values after the fact (simplest: add seed to every entry in the returned array, since it's a constant offset applied uniformly).
- Update `docs/VALIDATION.md`-referenced regression tests and all existing unit tests referencing `lunchTaken`/`lunchDurationMinutesInEffect` to the new names.

## Data Layer Changes

- `src/lib/data/entries.ts`: `DayEntryDetail.lunchTaken` → `breakMinutesOverride: number | null`; `setLunchTaken(date, boolean)` → `setBreakOverride(date, minutes: number | null)`.
- `src/lib/data/settings.ts`: `LunchDurationSetting` → `BreakDurationSetting`; `getLunchDurationSettings`/`addLunchDurationSetting` → `getBreakDurationSettings`/`addBreakDurationSetting`, reading/writing `break_duration_settings`.
- `src/lib/data/recap.ts`: update all queries referencing `lunch_duration_settings`/`lunch_taken` to `break_duration_settings`/`break_minutes_override`; fetch the single `rolling_balance_seed` row (if any) and pass its `balance` into `RecapInput.rollingBalanceSeed`.

## UI Changes

- New component `src/components/BreakMinutesSelect.tsx`: a `<select>` with a blank "(use default)" option plus values 0, 15, 30, ..., 240 (4 hours) in 15-minute steps — same pattern as `TimeSelect.tsx` but for a duration, not a time of day.
- `src/app/(app)/entries/[date]/page.tsx`: replace the "Took lunch today" checkbox/form with `BreakMinutesSelect`, submitting to a renamed action (`setBreak`, replacing `toggleLunch`) that accepts an empty value as `null`.
- `src/app/(app)/entries/actions.ts`: rename `toggleLunch` → `setBreak`.
- `src/app/(app)/settings/page.tsx` and `actions.ts`: rename the "Lunch Duration" section/fields/action to "Break Duration" / `addBreakDuration`.

## Migration Data (from `references/source-app/sheet-export-*.csv`)

**Settings, all effective 2026-04-27 unless noted** (the Monday of the week containing 2026-05-02 — see the critical phantom-week note in `planning/DOMAIN.md` and `planning/RISKS.md`; do NOT use an earlier placeholder date):
- `weekly_target_settings`: 32 hours.
- `break_duration_settings`: 0 minutes (matches the real data — Break Hours was 0 on every ordinary day in both CSVs).
- `standard_workday_hours_settings`: 6.4 hours.
- `leave_banks`: `leave_type='paternity', total_hours=40.8, effective_date='2026-05-01'` (the sheet's already-known Remaining value; no "P" code appears in either CSV, so no reconstruction of prior usage is needed).
- `holidays`: `date='2026-05-25', label='Memorial Day'`.
- `rolling_balance_seed`: `balance=-27.67, note='Seeded from source Google Sheet running balance immediately before the week of 2026-05-02. Must be replaced if an earlier (e.g. January 2026) import later becomes the new earliest tracked week.'`

**Day-by-day mapping rule** (validated against multiple real rows during Architect discovery — see worked examples below): for each date in the CSVs with any real activity —
- Every non-blank Check-in/Check-out (and Check-in 2/Check-out 2) pair becomes one `sessions` row, `check_in`/`check_out` = that date + the listed time (24-hour, combine directly — timezone-of-record doesn't matter since only the duration is ever used in calculations).
- If the ADJ code is `v`, `s`, or `P`: insert one `leave_entries` row (`leave_type` = vacation/sick/paternity respectively, `hours` = the adjacent numeric value, `date` = that day).
- If the ADJ code is `h`: that date is a holiday (see `holidays` above for 2026-05-25) — no `leave_entries` row; Holiday Credit is automatic from the `holidays` + `standard_workday_hours_settings` tables.
- If the ADJ code is `x`: set `day_entries.break_minutes_override` for that date to the adjacent numeric value × 60 (e.g., `x,1` → 60). Do NOT insert a `leave_entries` row for `x`.
- Days with zero sessions, no ADJ code, and not a holiday (most weekend/off days) do not need a `day_entries` row at all — the app treats a missing date as zero contribution automatically.
- Worked examples confirmed to reproduce the sheet's own Work Hours exactly: 2026-05-14 (`x,1`, session 8:00-14:15) → rawHours 6.25, breakDeduction 1 (override), leave 0, holiday 0 → workHours 5.25 (sheet: 5.25 ✓). 2026-05-20 (`v,4`, session 8:00-12:00) → raw 4, break 0 (default), leave 4, holiday 0 → work 8 (sheet: 8.00 ✓). 2026-05-25 (`h,6.4`, no session) → raw 0, break 0, leave 0, holiday 6.4 → work 6.4 (sheet: 6.40 ✓). 2026-06-11 (`s,2`, two sessions 9:30-13:00 + 14:00-16:30) → raw 6, break 0, leave 2, holiday 0 → work 8 (sheet: 8.00 ✓).

## Out of Scope for This Sprint

- Data outside 2026-05-02–2026-06-26.
- Any UI for the Rolling Balance Seed.
- Pay-period-cycle configuration.

============================================================
FILE: planning/sprints/003-break-rework-and-migration/acceptance.md
============================================================

# Sprint 003 Acceptance — Break Model Rework + Historical Migration

Sprint 003 is complete when all of the following are true:

## Break Model

- `day_entries` has no `lunch_taken` column; it has `break_minutes_override` (nullable, enforced multiple of 15 at the database level).
- The Daily Entry screen's break control accepts either "(use default)" or a specific 15-minute-increment value; leaving it blank and saving does not write an override.
- With no override set for a date, Work Hours for that date reflects the `break_duration_settings` value in effect for that date. With an override set, Work Hours reflects the override instead, regardless of the default setting.
- Settings screen shows "Break Duration" (not "Lunch Duration") with the same effective-dated add/history pattern as every other setting, and the same duplicate-effective-date rejection.

## Rolling Balance Seed

- With `rolling_balance_seed` set to -27.67 and `weekly_target_settings`' earliest entry at `effective_date = 2026-04-27`, the Weekly Recap and History tab show no phantom weeks before 2026-04-27, and the Rolling Balance at the end of each imported week matches these exact values from the source sheet:

  | Week ending | Expected Rolling Balance |
  |---|---:|
  | 2026-05-08 | -26.92 |
  | 2026-05-15 | -26.42 |
  | 2026-05-22 | -24.67 |
  | 2026-05-29 | -14.77 |
  | 2026-06-05 | -14.02 |
  | 2026-06-12 | -7.27 |
  | 2026-06-19 | -13.52 |
  | 2026-06-26 | -19.52 |

## Migration Data

- The Weekly Recap and History tab show exactly the 8 weeks above, in order, with no data outside 2026-05-02–2026-06-26.
- Daily Entry for 2026-05-14 shows one session (8:00–14:15) and a break override of 60 minutes.
- Daily Entry for 2026-05-20 shows one session (8:00–12:00) and 4 vacation hours logged.
- Daily Entry for 2026-05-25 shows no sessions, and the Weekly Recap/History reflects 6.4 hours of Holiday Credit for that date (Settings → Paid Holidays lists 2026-05-25 as "Memorial Day").
- Daily Entry for 2026-06-11 shows two sessions (9:30–13:00 and 14:00–16:30) and 2 sick hours logged.
- Settings → Leave Banks → Paternity shows 40.8 hours remaining (no leave logged against it in this window, so it stays at the seeded value).
- Settings → Weekly Target Hours shows one entry: 32 hours, effective 2026-04-27.

## Regression

- All Sprint 002 acceptance criteria still hold: auth gate, session overlap/duplicate rejection (verify it still works with the new break field alongside it), duplicate effective-date rejection on all four settings tables, no letter codes or raw sheet math exposed in the UI.
- The effective-dating regression test still passes: adding a new `weekly_target_settings` entry effective a future date does not change any of the 8 weeks' already-computed values above.
- Unit tests updated for all renamed fields/functions; `npm test`, `npx tsc --noEmit`, and `npm run build` all pass clean.

============================================================
FILE: planning/sprints/003-break-rework-and-migration/handoff-prompt.md
============================================================

# Sprint 003 Builder Handoff Prompt — Break Model Rework + Historical Migration

Read `AGENTS.md`, `planning/STATE.md`, `planning/DOMAIN.md`, `planning/DECISIONS.md`, `planning/RISKS.md`, `docs/ARCHITECTURE.md`, `docs/VALIDATION.md`, both CSVs in `references/source-app/`, and all four files in `planning/sprints/003-break-rework-and-migration/` first.

## The code gate (mandatory)

Before creating, editing, or deleting any source/test/app file, stop and post:

- A concrete file-by-file plan (what you will create/edit, in what order — follow `blueprint.md`'s build order).
- The scope guards — explicitly state you will NOT import data outside 2026-05-02–2026-06-26, will NOT build a Settings UI for the Rolling Balance Seed, and will NOT build a pay-period-cycle setting.
- The acceptance criteria you're building toward, from `acceptance.md`, especially the exact expected Rolling Balance table.

Wait for explicit approval before writing any code.

## Do

- Follow the build order in `blueprint.md`: schema SQL → calculation engine renames → UI updates → data-import SQL → verify.
- Write the schema-migration SQL and the data-import SQL as separate scripts (not embedded in application code) and hand both to the user to run manually against the live Supabase project — you have no direct DB access.
- Double-check the critical `effective_date = 2026-04-27` rule for `weekly_target_settings` before writing that INSERT — getting this wrong silently corrupts every week's Rolling Balance. Verify against the acceptance table's exact expected values once the user has run both scripts.
- Update existing unit tests for every renamed field/function (`lunchDeduction`→`breakDeduction`, etc.) — do not leave stale test names.
- Ask the user to confirm both SQL scripts have been run (schema first, then data) before treating the import as complete — you cannot verify live data yourself without their confirmation.

## Do not

- Do not import any data outside 2026-05-02 through 2026-06-26.
- Do not build a Settings UI for the Rolling Balance Seed.
- Do not build a pay-period-cycle configuration.
- Do not use an earlier placeholder `effective_date` (e.g., 2026-01-01) for `weekly_target_settings` — see the phantom-week risk in `planning/RISKS.md`.
- Do not commit real Supabase credentials or any secret to the repository.

## Next step

Once verified against the acceptance table, the next Architect session scopes the January-April 2026 import as its own sprint — including re-checking whether the break-duration-default and standard-workday-hours values from that earlier "4-day week" era differ from this sprint's (they likely do).

============================================================
FILE: docs/ARCHITECTURE.md
============================================================

# Architecture

Time Tracker v1 — architecture defined by the Architect Layer. Data model and calculation rules locked in Architect Pack 001; auth/styling/data-access in Pack 002; break model rework, rolling balance seed, and historical migration in Pack 003.

---

## Stack

- **Application**: Next.js (App Router), TypeScript, deployed to Vercel for v1.
- **Styling**: Tailwind CSS.
- **Database**: Supabase (Postgres).
- **Auth**: Supabase Auth, email/password, single account (no signup flow).
- **Data access**: Next.js Server Actions calling the Supabase client directly — no separate REST/GraphQL API layer.
- **Hosting**: Vercel for v1.

## Users & Access

Single user, personal use. Every route except the login screen requires a valid session (enforced via Next.js middleware).

## Data Model

| Table | Purpose | Key Fields |
|---|---|---|
| `day_entries` | One row per date. | `date` (unique), `break_minutes_override` (nullable, multiple of 15) |
| `sessions` | One or more check-in/check-out pairs per day. | `day_entry_id`, `check_in`, `check_out` |
| `leave_entries` | Vacation/sick/paternity hours logged against a date. | `date`, `leave_type`, `hours` |
| `holidays` | User-maintained list of recognized paid holidays. | `date`, `label` |
| `weekly_target_settings` | Effective-dated weekly target hours. | `hours`, `effective_date` (unique) |
| `break_duration_settings` | Effective-dated default break duration (minutes). Renamed from `lunch_duration_settings` in Sprint 003. | `minutes`, `effective_date` (unique) |
| `standard_workday_hours_settings` | Effective-dated hours credited for a holiday. | `hours`, `effective_date` (unique) |
| `leave_banks` | Effective-dated total hours per leave type. | `leave_type`, `total_hours`, `effective_date` (unique per type) |
| `rolling_balance_seed` | **New in Sprint 003.** A single-row starting offset for Rolling Balance, representing pre-app history (e.g., a source spreadsheet's running total). No Settings UI — set once via SQL. | `balance`, `note` |

All effective-dated tables share one lookup rule: the value "in effect" on a given date is the most recent row with `effective_date <= that date`. Each has a unique constraint preventing two entries for the same effective date (same leave type + date for `leave_banks`).

**Critical**: `weekly_target_settings`' earliest `effective_date` determines the first week the entire app computes (`mondayOf(earliest effective_date)` through the current week, every week in between, even with no data). Setting it earlier than real tracked history creates phantom zero-actual weeks that silently corrupt Rolling Balance. Always set it to the Monday of the actual earliest tracked week.

### Row Level Security

RLS is enabled on every table above (including `rolling_balance_seed`). Each has one policy permitting all operations to any authenticated session — not scoped by `user_id`, since only one account exists in v1.

## Calculation Rules

1. **Raw Hours (day)** = sum of `(check_out minus check_in)` across all sessions for that day.
2. **Break Deduction (day)** = the per-day manual override if set (multiple of 15 minutes), otherwise the break duration setting in effect that date. Applied once per day, independent of session count.
3. **Leave Hours (day)** = sum of that date's `leave_entries` hours, across all types.
4. **Holiday Credit (day)** = the standard workday hours setting in effect that date, if the date is in `holidays`; otherwise 0.
5. **Work Hours (day)** = Raw Hours minus Break Deduction plus Leave Hours plus Holiday Credit.
6. **Weekly Actual Hours** = sum of Work Hours for each day in the week.
7. **Weekly Delta** = Weekly Actual Hours minus Weekly Target Hours, using the target in effect on that week's Monday.
8. **Rolling Balance** = the Rolling Balance Seed (0 if unset) plus the cumulative sum of Weekly Delta across all tracked weeks.
9. **Leave Bank Remaining (type)** = latest `leave_banks` total for that type minus sum of that type's `leave_entries` hours logged on/after that bank entry's `effective_date`.

The calculation engine lives in `src/lib/calculations/` as standalone, UI-independent, unit-tested modules.

## Screens (v1)

- **Login** — Supabase Auth email/password sign-in.
- **Weekly Recap** (landing page) — hours vs. target, rolling balance, leave balances remaining, plus a trailing 14-day history table (raw/break/total/other-with-hover-breakdown).
- **Daily Entry** — sessions, break override, leave hours by type, for a given date. Auto-opens to today with a date switcher.
- **History** — every tracked week grouped into two-week chunks (naive chronological pairing, not real pay-period alignment), most recent first.
- **Settings / Preferences** — weekly target, break duration, standard workday hours, leave banks (nested inside Paid Holidays), and holiday list, each with history where applicable.

## Migration

One-time SQL scripts, run directly by the user against Supabase — never an in-app feature (single-user tool, strictly one-time operations). Sprint 003 covers 2026-05-02–2026-06-26. Earlier data is a separate, later sprint.

## Out of Scope for v1

See `planning/DOMAIN.md` — Out of Scope for v1.

============================================================
FILE: docs/VALIDATION.md
============================================================

# Validation

Per the Micro-app rigor profile (`docs/RIGOR_PROFILE.md`): cover the happy path and the one or two failure modes that would lose the user's data. Do not over-test.

## Sprint 003 Validation Priorities

- **Highest priority — the phantom-week risk**: verify `weekly_target_settings`' earliest `effective_date` is exactly 2026-04-27, not an earlier placeholder, and that the Rolling Balance at the end of each imported week matches the exact expected values in `acceptance.md`. A wrong earliest date is silent and only shows up as a badly wrong Rolling Balance number — check it explicitly, don't assume.
- **Break override correctness**: a date with no override uses the effective-dated default; a date with an override (including an override of exactly 0) uses the override instead, never the default.
- **Effective-dating regression, still applies**: adding a new dated settings entry must never change already-computed past weeks or days — re-run this check after the break-model rename to confirm nothing broke.
- **Migration spot-checks**: the four worked examples in `blueprint.md` (2026-05-14, 05-20, 05-25, 06-11) should be manually verified in the running app against the source CSVs after import.
- **Regression on existing Sprint 002 hardening**: session overlap/duplicate rejection and settings duplicate-effective-date rejection must still work after the schema rename.

## Deferred

- Full manual walkthrough of every day in the 8-week import against the source CSVs is not required — the worked examples plus the exact Rolling Balance table are sufficient given the Micro-app rigor tier's "don't over-test" guidance.
- Validation of the January-April 2026 window is deferred to that future sprint.

============================================================
FILE: planning/STATUS.json
============================================================

{
  "schemaVersion": 1,
  "phase": "apply-pack",
  "sprint": "003-break-rework-and-migration",
  "updated": "2026-07-09"
}
