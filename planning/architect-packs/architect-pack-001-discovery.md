============================================================
FILE: planning/STATE.md
============================================================

# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-07-08

---

## Current Phase

Architecture Locked — Ready for Build Sprint Planning

---

## Current Status

Architect Pack 001 (Discovery / Architecture) has been applied. The v1 product direction, data model, and calculation rules are locked based on a discovery conversation and a review of the existing Google Sheet the user currently tracks hours in.

- No application code has been written yet.
- Sprint 001 (Discovery / Architecture) is complete — its deliverable was this planning pack, not working software.
- Sprint 002 (Core MVP Build) has not been planned yet and requires a new Architect session before any implementation begins.

---

## Active Sprint

`planning/sprints/001-discovery-architecture/` — complete (planning-only sprint, no code authorized).

---

## Active Work

Start a new Architect session to plan Sprint 002 — Core MVP Build (data model implementation, daily entry screen, settings/preferences screen, weekly recap landing page, 2026 data migration from the Google Sheet).

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
| Tech stack | Next.js, Supabase, Vercel |

---

## v1 Scope Snapshot

See `planning/DOMAIN.md` and `docs/ARCHITECTURE.md` for full detail. Summary:

- Daily entry: date, one or more check-in/check-out sessions, a "took lunch" toggle, optional vacation/sick/paternity leave hours (full or partial day).
- Settings (all effective-dated/changelog): weekly target hours, lunch duration default, standard workday hours (holiday credit), three leave banks (vacation, sick, paternity), plus a plain list of paid holidays.
- Weekly recap landing page: hours worked vs. target, rolling balance carried forward, current leave balances.
- One-time migration of 2026 daily entries from the source Google Sheet.
- Out of scope for v1: reports/analytics beyond the weekly recap, multi-user/accounts, mobile app, calendar integrations, reminders, blackout/recurring non-work dates.

---

## Next Actions

1. Start a new Architect session to plan Architect Pack 002 — Sprint 002: Core MVP Build.
2. Resolve the open questions in `planning/QUESTIONS.md` (auth approach, week-boundary rule, backup/export strategy) before Sprint 002 is scoped.
3. Implement only from generated sprint files under `planning/sprints/` once Sprint 002 is authorized.

---

## Blockers

No known blocker.

---

## Watch Items

- Do not write application code until an active sprint explicitly authorizes it. Sprint 001 does not authorize it.
- Keep the effective-dated/changelog pattern consistent across all settings (weekly target, lunch duration, standard workday hours, leave banks) — see `planning/DECISIONS.md`.
- Keep secrets, credentials, and private tokens out of project files.

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
| 2026-07-08 | Work Hours (day) = Raw Hours (sum of all check-in/check-out sessions) minus Lunch Deduction (flat, once per day, only if "took lunch" is checked) plus Leave Hours (vacation/sick/paternity logged that day) plus Holiday Credit (if the date is a saved holiday). | Confirmed against the user's real usage pattern (e.g., 8am-2pm, lunch, 6pm-10pm) and against the existing Google Sheet's Work Hours formula, which the user confirmed as correct. | Day entries must support multiple sessions per day. Lunch is a single flat subtraction independent of session count, not tied to any specific session gap. |
| 2026-07-08 | Weekly target hours, lunch duration default, standard workday hours, and each leave bank (vacation/sick/paternity) are all stored as effective-dated changelog entries, not single mutable values. | The user needs to adjust these over time (e.g., weekly target changed from a 4-day/32hr week to a 5-day/32hr week) without rewriting the math on past weeks. | Settings become versioned records (value + effective date). Calculations must always look up "the value in effect as of the date being calculated," not the current value. |
| 2026-07-08 | Holiday credit hours come from a directly user-editable "Standard Workday Hours" setting, not a formula derived from weekly target divided by workdays per week. | The user's workdays-per-week has changed historically (4-day to 5-day week); a derived formula would silently change past holiday credit whenever the target or day count changed. | Standard Workday Hours is its own effective-dated setting, independent of weekly target hours. |
| 2026-07-08 | Leave banks (vacation, sick, paternity) are self-reported: the user manually enters/adjusts each bank's total hours with an effective date, matching what their employer reports. There is no employer system integration. | The user reconciles balances against their employer manually and needs full manual control, including corrections. | No auth/integration work with an employer HR system. Remaining balance = latest bank total in effect minus sum of that leave type's hours logged since that bank's effective date. |
| 2026-07-08 | Historical migration covers only calendar-year 2026 entries from the source Google Sheet. | The sheet's format evolved over its roughly three-year life; only the current year's format is clean enough to migrate reliably. | Pre-2026 history remains in the original Google Sheet only and is not migrated into the app. |
| 2026-07-08 | Blackout dates / recurring non-work-day rules (e.g., "never works Sunday") are out of scope for v1. | Adds recurring-exclusion-rule complexity and interacts with holiday logic; conflicts with the user's explicit "don't turn this into a full time management tool" boundary. | Logged as a future enhancement in `planning/QUESTIONS.md`. Not part of Sprint 002 scope. |
| 2026-07-08 | Reports/analytics beyond the weekly recap view are out of scope for v1. | Matches the user's explicit out-of-scope intake boundary. | v1 ships only the weekly recap (hours vs. target, rolling balance, leave balances). |

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

============================================================
FILE: planning/RISKS.md
============================================================

# Risks

Known project risks and mitigation notes.

---

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| Effective-dated settings model is more complex than a flat settings table; a bug in "which value was in effect" lookups could silently corrupt historical balances the user relies on. | Medium | High | Document the lookup rule explicitly (Business Rule 7 in `planning/DOMAIN.md`); Sprint 002 acceptance criteria should include a specific test around a setting change mid-history. | Open |
| Migrated 2026 sheet data may be inconsistent (manual entry errors, format drift within the year). | Medium | Medium | Manually spot-check a sample of migrated rows against the source sheet after import; treat migration as a one-time reviewable step, not a live sync. | Open |
| No backup/export strategy defined yet for Supabase-hosted personal data. | Medium | Medium | Define a simple export/backup approach before or during Sprint 002. | Open |
| Rolling balance and leave-bank math both depend on getting week/date boundary rules exactly right (e.g., which target applies if it changes mid-week). | Low | Medium | Resolve the open week-boundary question in `planning/QUESTIONS.md` before Sprint 002 is scoped. | Open |
| Scope creep toward a "full time management tool" the user explicitly does not want. | Low | Medium | Every future sprint should be checked against the Out of Scope list in `planning/DOMAIN.md` before being authorized. | Open |

============================================================
FILE: planning/QUESTIONS.md
============================================================

# Open Questions

Questions that need answers from the Architect or Builder.

---

| Question | Owner | Needed By | Status | Answer / Notes |
|---|---|---|---|---|
| Which weekly target value applies if the target changes mid-week — the value in effect at the start of the week, or something else? | Architect/User | Sprint 002 planning | Open | Working assumption for Sprint 002 planning: use the value in effect on the first day of the week (Monday). Confirm before building. |
| What auth approach does v1 need — a single login/shared secret, or none at all (trusted network / home use only)? | User | Sprint 002 planning | Open | Rigor tier allows "single login, shared secret, or none if local-only." Needs a decision before Sprint 002 scope is locked. |
| What backup/export strategy should protect the Supabase-hosted data? | Architect | Sprint 002 or later | Open | Not yet defined. |
| Should blackout dates / recurring non-work-day rules (e.g., "never works Sunday") become a future sprint? | User | Post-v1 | Deferred | Explicitly out of scope for v1 per user request; revisit after v1 ships. |
| Should reports/analytics beyond the weekly recap become a v2 direction? | User | Post-v1 | Deferred | Explicitly out of scope for v1; user flagged interest in "useful reports" as a future possibility. |
| Should pre-2026 historical sheet data ever be migrated, or does the original Google Sheet remain the permanent archive for that period? | User | Post-v1 | Open | Not needed for v1; the source sheet stays authoritative for pre-2026 history for now. |

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
| `planning/STATE.md` | Project-specific starter documentation. | Updated by Architect Pack 001 | Reflects locked v1 scope and Sprint 001 completion. |
| `planning/DOMAIN.md` | Project-specific starter documentation. | Updated by Architect Pack 001 | Full domain model, business rules, and calculation formulas. |
| `planning/FILE_INVENTORY.md` | Project-specific starter documentation. | Updated by Architect Pack 001 | This file. |

---

## Source Material Reviewed

| Reference | Purpose | Status | Notes |
|---|---|---|---|
| Google Sheet: `https://docs.google.com/spreadsheets/d/1KKEhUQkF4SOgrrC_zReIPbNJwVC6k9eW44tk7AgTcYY/edit` | Source of the current manual time-tracking workflow; basis for the v1 data model and migration plan. | Reviewed | Open-access link provided by the user. Only 2026 calendar-year entries are in scope for migration (see `planning/DECISIONS.md`). Not downloaded into `references/source-app/` — external link only. |

---

## Sprint 001 Deliverables

| File | Purpose | Status |
|---|---|---|
| `planning/sprints/001-discovery-architecture/requirements.md` | Sprint 001 requirements. | Created by Architect Pack 001 |
| `planning/sprints/001-discovery-architecture/blueprint.md` | Sprint 001 architecture blueprint (data model, calculation rules, screens, migration plan). | Created by Architect Pack 001 |
| `planning/sprints/001-discovery-architecture/acceptance.md` | Sprint 001 acceptance criteria. | Created by Architect Pack 001 |
| `planning/sprints/001-discovery-architecture/handoff-prompt.md` | Sprint 001 Builder handoff prompt. | Created by Architect Pack 001 |
| `docs/ARCHITECTURE.md` | Durable architecture reference for v1. | Updated by Architect Pack 001 |
| `docs/API.md` | API surface notes for v1 (none planned). | Updated by Architect Pack 001 |
| `docs/VALIDATION.md` | Validation priorities for Sprint 002 planning. | Updated by Architect Pack 001 |

---

## Common Source And Reference Folders

| Folder | Purpose | Status | Notes |
|---|---|---|---|
| `references/client-docs/` | Client docs, proposals, emails, meeting notes, and intake material. | Created / ensured | Keep sensitive source material local and intentional. |
| `references/source-app/` | Existing app, code, assets, exports, or source-system material. | Created / ensured | Use when there is a source app or prior implementation. |
| `references/platform/` | Platform notes, repo notes, hosting notes, and integration context. | Created / ensured | Capture platform assumptions before implementation. |
| `samples/` | Sample data, exports, workbooks, fixtures, and generated examples. | Created / ensured | Avoid secrets and credentials in samples. |
| `planning/architect-packs/` | Architect Pack files before importer dry-run/apply. | Created / ensured | After applying a pack, build from `planning/sprints/`. |

============================================================
FILE: planning/sprints/001-discovery-architecture/requirements.md
============================================================

# Sprint 001 Requirements — Discovery / Architecture

## Goal

Turn the project intake and Architect discovery conversation into Builder-ready planning and architecture artifacts for Time Tracker v1 — without writing any application code.

## In Scope

- Confirm the v1 product direction: daily time entry, settings/preferences, weekly recap.
- Define the data model and calculation rules (work hours, weekly delta, rolling balance, leave bank remaining, holiday credit).
- Document the effective-dated/changelog pattern used for weekly target, lunch duration, standard workday hours, and leave banks.
- Document the screen inventory for v1.
- Document the migration plan for 2026 Google Sheet data.
- Record decisions, risks, and open questions surfaced during discovery.

## Out of Scope

- Any application code, database schema creation, or UI implementation.
- Executing the historical data migration (planning only; execution is a future sprint).
- Anything on the "Out of Scope for v1" list in `planning/DOMAIN.md`.

## Tied to Business Goal

Directly supports the business goal in `planning/DOMAIN.md`: a fast, low-friction way to replace the user's Google Sheet with clear numbers against a personal weekly target.

============================================================
FILE: planning/sprints/001-discovery-architecture/blueprint.md
============================================================

# Sprint 001 Blueprint — Discovery / Architecture

## Approach

This sprint's deliverable is the planning pack itself (this Architect Pack), produced through a discovery conversation with the user and a review of their existing Google Sheet. No code is produced in this sprint — the blueprint below is the architecture that Sprint 002 (Core MVP Build) will implement from.

## Tech Stack

- **Frontend/Backend**: Next.js (App Router).
- **Database**: Supabase (Postgres).
- **Hosting**: Vercel for v1. Self-hosting on the user's home server remains possible later since the app is not built with Vercel-specific lock-in.

## Data Model (logical design — for Sprint 002 to implement)

- `day_entries` — one row per date. Fields: date (unique), lunch_taken (boolean).
- `sessions` — one row per check-in/check-out pair. Fields: day_entry_id (FK), check_in (timestamp), check_out (timestamp). A day_entry can have one or more sessions.
- `leave_entries` — one row per logged leave amount. Fields: date, leave_type (vacation | sick | paternity), hours (supports partial-day amounts).
- `holidays` — one row per recognized paid holiday. Fields: date, label.
- `weekly_target_settings` — effective-dated changelog. Fields: hours, effective_date.
- `lunch_duration_settings` — effective-dated changelog. Fields: minutes, effective_date.
- `standard_workday_hours_settings` — effective-dated changelog. Fields: hours, effective_date.
- `leave_banks` — effective-dated changelog, per leave type. Fields: leave_type (vacation | sick | paternity), total_hours, effective_date, note.

All four "_settings"/"leave_banks" tables follow the same lookup rule: to get the value in effect on a given date, take the most recent row with `effective_date <= that date`. Never apply the current/latest row retroactively to past dates.

## Calculation Rules

1. Raw Hours (day) = sum of (check_out minus check_in) across all sessions for that day.
2. Lunch Deduction (day) = lunch_taken ? lunch_duration_settings value in effect that date : 0. Applied once per day, not per session.
3. Leave Hours (day) = sum of leave_entries hours logged for that date, across all leave types.
4. Holiday Credit (day) = date in holidays list ? standard_workday_hours_settings value in effect that date : 0.
5. Work Hours (day) = Raw Hours minus Lunch Deduction plus Leave Hours plus Holiday Credit.
6. Weekly Actual Hours = sum of Work Hours for each day in the week.
7. Weekly Delta = Weekly Actual Hours minus Weekly Target Hours (target in effect for that week — see open question in `planning/QUESTIONS.md` on the exact mid-week-change rule; default assumption: value in effect on the week's Monday).
8. Rolling Balance = cumulative sum of Weekly Delta across all tracked weeks.
9. Leave Bank Remaining (type) = most recent leave_banks total for that type (as of its effective_date) minus sum of that type's leave_entries hours dated on/after that effective_date.

## Screen Inventory (v1)

- **Weekly Recap (landing page)**: current week's hours vs. target, rolling balance, current leave balances remaining. Default/home screen.
- **Daily Entry**: add/edit a day — date, sessions (add/remove check-in/check-out pairs), "took lunch" toggle, optional leave hours by type.
- **Settings / Preferences**: manage weekly target (with history), lunch duration default (with history), standard workday hours (with history), leave banks (vacation/sick/paternity, each with history), and the paid holiday list.

## Migration Plan (planning only — execution is a future sprint)

- Source: Google Sheet at the URL in `planning/DOMAIN.md`, 2026 calendar-year rows only.
- Map: sheet rows to `day_entries` + `sessions` (splitting Check-in/Check-out and Check-in 2/Check-out 2 into two session rows where both exist) + `leave_entries` (from ADJ letter codes) + `holidays` (from the sheet's holiday list).
- The rolling balance at the migration cutover point should be seeded from the sheet's last known balance, or recomputed from the imported daily data — to be decided in Sprint 002 planning.

## Out of Scope for This Sprint

No code, schema execution, or UI work happens in Sprint 001. This blueprint is the input to Sprint 002, which requires its own Architect Pack and explicit build authorization.

============================================================
FILE: planning/sprints/001-discovery-architecture/acceptance.md
============================================================

# Sprint 001 Acceptance — Discovery / Architecture

Sprint 001 is complete when:

- `planning/DOMAIN.md` documents the confirmed business goal, current and target workflows, key terms, and business rules (calculation formulas) from the discovery conversation.
- `planning/DECISIONS.md` records every durable decision made during discovery (stack, calculation rules, effective-dated settings pattern, migration scope, out-of-scope items).
- `planning/RISKS.md` and `planning/QUESTIONS.md` capture the risks and open items surfaced during discovery.
- `docs/ARCHITECTURE.md` describes the data model, calculation rules, and screen inventory clearly enough for a future Architect session to plan Sprint 002 from it without re-asking already-answered questions.
- No application code, database schema, or UI has been created.
- `planning/STATE.md` reflects that Sprint 001 is complete and that Sprint 002 requires a new Architect session before implementation begins.

============================================================
FILE: planning/sprints/001-discovery-architecture/handoff-prompt.md
============================================================

# Sprint 001 Builder Handoff Prompt — Discovery / Architecture

Read `AGENTS.md`, `planning/STATE.md`, `planning/DOMAIN.md`, `planning/DECISIONS.md`, `planning/RISKS.md`, `planning/QUESTIONS.md`, and `docs/ARCHITECTURE.md` first.

This sprint's deliverable is the planning pack itself — there is no further Builder implementation work in Sprint 001.

Do:
- Apply this Architect Pack with `node scripts/apply-architect-pack.js planning/architect-packs/architect-pack-001-discovery.md --dry-run`, review the output, then apply it without `--dry-run`.
- Confirm the generated files match what's described above.
- Leave `planning/STATUS.json` set to `phase: "apply-pack"` (already set by this pack) — do not advance it further from this sprint.

Do not:
- Write, edit, or delete any application/source/test file (nothing outside `planning/` and `docs/`).
- Start implementing the data model, screens, or migration described in `planning/sprints/001-discovery-architecture/blueprint.md` — that requires a new Architect Pack (Sprint 002) with explicit build authorization.

Next step: start a new Architect session to scope Architect Pack 002 — Sprint 002: Core MVP Build. Resolve the open questions in `planning/QUESTIONS.md` (auth approach, week-boundary rule for target changes, backup/export strategy) as part of that planning session.

============================================================
FILE: docs/ARCHITECTURE.md
============================================================

# Architecture

Time Tracker v1 — architecture defined by the Architect Layer after discovery (Architect Pack 001).

---

## Stack

- **Application**: Next.js (App Router), deployed to Vercel for v1.
- **Database**: Supabase (Postgres).
- **Hosting**: Vercel for v1. The app is not built with Vercel-specific lock-in, so a move to self-hosting (the user's home server) remains possible later without a rewrite.

## Users

Single user, personal use. No multi-tenancy, roles, or accounts beyond a possible simple access gate (see open question in `planning/QUESTIONS.md`).

## Data Model

| Table | Purpose | Key Fields |
|---|---|---|
| `day_entries` | One row per date. | `date` (unique), `lunch_taken` (boolean) |
| `sessions` | One or more check-in/check-out pairs per day. | `day_entry_id`, `check_in`, `check_out` |
| `leave_entries` | Vacation/sick/paternity hours logged against a date, full or partial day. | `date`, `leave_type`, `hours` |
| `holidays` | User-maintained list of recognized paid holidays. | `date`, `label` |
| `weekly_target_settings` | Effective-dated weekly target hours. | `hours`, `effective_date` |
| `lunch_duration_settings` | Effective-dated default lunch duration. | `minutes`, `effective_date` |
| `standard_workday_hours_settings` | Effective-dated hours credited for a holiday. | `hours`, `effective_date` |
| `leave_banks` | Effective-dated total hours per leave type (vacation/sick/paternity). | `leave_type`, `total_hours`, `effective_date`, `note` |

All effective-dated tables share one lookup rule: the value "in effect" on a given date is the most recent row with `effective_date <= that date`. This preserves historical accuracy even after a setting changes later.

## Calculation Rules

1. **Raw Hours (day)** = sum of `(check_out minus check_in)` across all sessions for that day.
2. **Lunch Deduction (day)** = the lunch duration setting in effect that date, applied once per day if `lunch_taken` is true — independent of session count.
3. **Leave Hours (day)** = sum of that date's `leave_entries` hours, across all types.
4. **Holiday Credit (day)** = the standard workday hours setting in effect that date, if the date is in `holidays`; otherwise 0.
5. **Work Hours (day)** = Raw Hours minus Lunch Deduction plus Leave Hours plus Holiday Credit.
6. **Weekly Actual Hours** = sum of Work Hours for each day in the week.
7. **Weekly Delta** = Weekly Actual Hours minus Weekly Target Hours (target in effect for that week).
8. **Rolling Balance** = cumulative sum of Weekly Delta across all tracked weeks.
9. **Leave Bank Remaining (type)** = latest `leave_banks` total for that type minus sum of that type's `leave_entries` hours logged on/after that bank entry's `effective_date`.

## Screens (v1)

- **Weekly Recap** (landing page) — hours vs. target, rolling balance, leave balances remaining.
- **Daily Entry** — sessions, lunch toggle, leave hours by type, for a given date.
- **Settings / Preferences** — weekly target, lunch duration, standard workday hours, leave banks, and holiday list, each with history where applicable.

## Migration

One-time import of 2026 calendar-year entries from the source Google Sheet (see `planning/DOMAIN.md` for the link and mapping notes). Execution is planned in a future sprint, not Sprint 001.

## Out of Scope for v1

See `planning/DOMAIN.md` — Out of Scope for v1.

============================================================
FILE: docs/API.md
============================================================

# API

No custom REST/GraphQL API is planned for v1. The Next.js app is expected to talk to Supabase directly (client library and/or server actions/route handlers as needed for the calculations in `docs/ARCHITECTURE.md`).

This file will be revisited in Sprint 002 planning if a dedicated API surface turns out to be necessary (e.g., for the historical migration script).

============================================================
FILE: docs/VALIDATION.md
============================================================

# Validation

Per the Micro-app rigor profile (`docs/RIGOR_PROFILE.md`): cover the happy path and the one or two failure modes that would lose the user's data. Do not over-test.

## v1 Validation Priorities (for Sprint 002 planning)

- A setting change (weekly target, lunch duration, standard workday hours, or a leave bank) must never alter the calculated Work Hours, Weekly Delta, or Rolling Balance for dates before that setting's `effective_date`. This is the most important behavior to verify given the effective-dated/changelog design — see the risk logged in `planning/RISKS.md`.
- Multi-session days (e.g., 8am-2pm, then 6pm-10pm) must sum correctly, and the lunch deduction must apply once per day regardless of session count.
- Leave bank remaining must never go negative silently without being visible to the user — flag when logged leave hours exceed the remaining balance.
- Holiday credit must apply automatically without requiring a manual clock-in on that date.
- Migration (when executed) should be spot-checked against the source sheet for a sample of days before being treated as trustworthy.

============================================================
FILE: planning/STATUS.json
============================================================

{
  "schemaVersion": 1,
  "phase": "apply-pack",
  "sprint": "001-discovery-architecture",
  "updated": "2026-07-08"
}
