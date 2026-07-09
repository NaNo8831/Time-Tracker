============================================================
FILE: planning/STATE.md
============================================================

# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-07-09

---

## Current Phase

Sprint 002 Ready — Core MVP Build Authorized

---

## Current Status

Architect Pack 002 (Core MVP Build) has been applied. Sprint 002 is now authorized to implement the working app: Next.js + Supabase, behind Supabase email/password auth, covering daily entry, settings/preferences, and the weekly recap landing page — using the data model and calculation rules locked in Sprint 001.

- No application code has been written yet. Sprint 002 is authorized but not yet built.
- Sprint 001 (Discovery / Architecture) is complete.
- Sprint 002 (Core MVP Build) is the active sprint. It does NOT include the Google Sheet migration.
- Sprint 003 (Historical Data Migration) is anticipated next, once Sprint 002 is built and verified, and requires its own Architect session before implementation.

---

## Active Sprint

`planning/sprints/002-core-mvp-build/`

---

## Active Work

Builder: read `planning/sprints/002-core-mvp-build/` in full, then stop at the code gate — post a concrete file-by-file plan and wait for explicit approval before writing any code.

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
| Tech stack | Next.js, Supabase (Postgres + Auth), Vercel |

---

## v1 Scope Snapshot

See `planning/DOMAIN.md` and `docs/ARCHITECTURE.md` for full detail. Summary:

- Auth: Supabase email/password login gating the whole app; single pre-created account, no self-serve signup.
- Daily entry: date, one or more check-in/check-out sessions, a "took lunch" toggle, optional vacation/sick/paternity leave hours (full or partial day).
- Settings (all effective-dated/changelog): weekly target hours, lunch duration default, standard workday hours (holiday credit), three leave banks (vacation, sick, paternity), plus a plain list of paid holidays.
- Weekly recap landing page: hours worked vs. target, rolling balance carried forward, current leave balances.
- Out of scope for Sprint 002: migrating 2026 Google Sheet data (Sprint 003), reports/analytics beyond the weekly recap, multi-user/accounts, mobile app, calendar integrations, reminders, blackout/recurring non-work dates.

---

## Next Actions

1. Builder executes Sprint 002 from `planning/sprints/002-core-mvp-build/` only, starting with the mandatory code gate (file-by-file plan, wait for approval).
2. After Sprint 002 is built and verified, start a new Architect session to scope Sprint 003 — Historical Data Migration (2026 Google Sheet import).
3. Sprint 003 should also revisit the deferred questions in `planning/QUESTIONS.md` (reports/analytics direction, blackout dates) if the user wants to raise them.

---

## Blockers

No known blocker. The Builder will need a real Supabase project (URL + anon/service keys) supplied via local environment variables before the app can run against a live database — these must never be committed to the repo.

---

## Watch Items

- Do not write application code until the Builder has posted the Sprint 002 code-gate plan and received explicit approval.
- Keep the effective-dated/changelog pattern consistent across all settings (weekly target, lunch duration, standard workday hours, leave banks) — see `planning/DECISIONS.md`.
- Keep secrets, credentials, and private tokens (including Supabase keys) out of project files — use local, untracked env files only.
- Do not implement the Google Sheet migration in Sprint 002 — it is explicitly out of scope, deferred to Sprint 003.

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
| 2026-07-09 | Auth for v1 is Supabase email/password, gating the entire app, with a single account created directly in the Supabase dashboard (no self-serve signup flow). | User chose to future-proof for occasional off-network access over the simpler shared-password-gate option, while staying within the Micro-app rigor tier (no roles, no invites, no multi-user). | Sprint 002 must implement a login screen and route protection (middleware), but not a signup/registration flow. The one account is provisioned manually, outside the app. |
| 2026-07-09 | A weekly target change takes effect starting the following Monday; the value in effect on a week's Monday governs that entire week's Weekly Delta, even if the target changes again mid-week. | Resolves the open week-boundary question with the simplest predictable rule, matching the working assumption already documented; avoids blended-target math for a case expected to be rare. | Confirms Business Rule 4/7 in `planning/DOMAIN.md`. Weekly Delta calculation always looks up the effective-dated value as of each week's Monday, not per-day. |
| 2026-07-09 | Backups for v1 rely on Supabase's built-in automatic daily backups; no custom export/download tooling is built in Sprint 002. | Matches the Micro-app rigor tier's bias to the smallest thing that works; low-stakes personal data. | Removes bespoke export/backup UI from Sprint 002 scope. Revisit only if the user's needs change. |
| 2026-07-09 | The Google Sheet migration (2026 data) ships as its own follow-up sprint (Sprint 003), not bundled into Sprint 002. | Keeps Sprint 002 small enough to build and verify cleanly; migration has its own risks (data cleanliness) that are easier to isolate once the core app is proven. | Sprint 002 ships with an empty database; the user tests it live before migration is planned. |
| 2026-07-09 | Styling uses Tailwind CSS with Next.js App Router defaults; data mutations use Next.js Server Actions talking directly to Supabase (no separate REST/GraphQL API layer). | Standard, low-overhead pairing with the chosen stack; keeps Sprint 002 focused on product behavior rather than infrastructure choices. Architect judgment call within the Micro-app "smallest thing that works" bias — no user preference was expressed either way. | Sprint 002's blueprint assumes this structure. Builder should not introduce a separate API server or a different styling system without flagging it first. |
| 2026-07-09 | Supabase Row Level Security (RLS) is enabled on all tables, with a single policy per table permitting all operations to any authenticated session (not scoped to a specific `user_id` column). | Only one account will ever exist in Sprint 002; scoping by `user_id` adds schema complexity with no present benefit, but leaving RLS off entirely would leave data readable via the public anon key if it ever leaked. | Simpler schema (no `user_id` columns needed yet). If a second account is ever added post-v1, RLS policies must be revisited before that happens. |

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

A single user (the project owner). This is a personal-use tool — no other roles, accounts, or permissions are needed. Access is gated by a single Supabase email/password login (see `planning/DECISIONS.md`); there is no signup flow.

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

- **Login**: a single email/password login gates the whole app. No signup screen — the one account is created directly in Supabase, outside the app.
- **Daily entry**: pick a date, add one or more check-in/check-out session pairs (supports complex days, e.g., 8am-2pm, then 6pm-10pm), a single "took lunch" toggle for the day, and optionally log vacation/sick/paternity hours against that date (full or partial day).
- **Settings / Preferences page**: weekly target hours, a default lunch duration, a "standard workday hours" value (used for holiday credit), three leave banks (vacation, sick, paternity), and a maintained list of paid holidays (date + label). Weekly target, lunch duration, standard workday hours, and each leave bank are all effective-dated — see Business Rules below.
- **Weekly recap (landing page)**: hours worked vs. target for the current week, the rolling balance carried forward from all prior weeks, and current remaining leave balances. Presented as clean numbers — no exposed letter-code "key" or raw balance math, matching the user's stated success criteria.
- **Migration** (Sprint 003, not Sprint 002): a one-time import of the user's 2026 daily entries from the source Google Sheet into the new data model.

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
4. Weekly Delta = Weekly Actual Hours minus Weekly Target Hours, using the Weekly Target value in effect on that week's Monday. A target change taking effect mid-week does not apply until the following Monday's week.
5. Rolling Balance = cumulative sum of Weekly Delta across all tracked weeks (carried forward indefinitely, matching the source sheet's behavior).
6. Leave Bank Remaining (type) = the most recent leave bank total entered for that type (as of its effective date) minus sum of that leave type's logged hours dated on or after that effective date.
7. All effective-dated settings (weekly target, lunch duration, standard workday hours, each leave bank) are looked up as "the most recent entry with an effective date on or before the date being calculated" — never the current/latest value applied retroactively. For Weekly Target specifically, the lookup date is always that week's Monday (see Rule 4).
8. Holiday credit is automatic (no manual confirmation needed) once a date is in the saved holiday list.
9. Access requires an authenticated Supabase session (single account, email/password). There is no unauthenticated read or write path.

---

## Known Constraints

- Tech stack: Next.js + Supabase (Postgres + Auth), hosted on Vercel for v1 (self-hosting remains a possible future move; not built for v1).
- Single user, single Supabase Auth account, gated by login — no roles/multi-tenancy.
- Implementation repo: Downloaded project folder.
- Canonical GitHub repo: UNKNOWN.
- Source material: Google Sheet at `https://docs.google.com/spreadsheets/d/1KKEhUQkF4SOgrrC_zReIPbNJwVC6k9eW44tk7AgTcYY/edit` (open access) — reviewed during discovery; only 2026 entries are in scope for migration, deferred to Sprint 003.
- Supabase project credentials (URL, anon key, service role key) must be supplied via local, untracked environment variables — never committed to the repo.
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
- Migrating 2026 historical data in Sprint 002 (deferred to Sprint 003).
- Custom data export/backup tooling (relying on Supabase's built-in backups for v1).

---

## Success Criteria

The user can see everything the Google Sheet currently shows them, presented on a weekly basis, with the letter-code "key" and the raw balance math hidden from view — just the clean, useful numbers (hours vs. target, rolling balance, leave remaining) — behind a simple login.

============================================================
FILE: planning/RISKS.md
============================================================

# Risks

Known project risks and mitigation notes.

---

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| Effective-dated settings model is more complex than a flat settings table; a bug in "which value was in effect" lookups could silently corrupt historical balances the user relies on. | Medium | High | Document the lookup rule explicitly (Business Rule 7 in `planning/DOMAIN.md`); Sprint 002 acceptance criteria include a specific test around a setting change mid-history. | Open — addressed in Sprint 002 acceptance criteria |
| Migrated 2026 sheet data may be inconsistent (manual entry errors, format drift within the year). | Medium | Medium | Manually spot-check a sample of migrated rows against the source sheet after import; treat migration as a one-time reviewable step, not a live sync. | Deferred to Sprint 003 |
| No backup/export strategy defined yet for Supabase-hosted personal data. | Medium | Medium | Resolved: rely on Supabase's built-in automatic backups for v1 (see `planning/DECISIONS.md`, 2026-07-09). | Resolved |
| Rolling balance and leave-bank math both depend on getting week/date boundary rules exactly right (e.g., which target applies if it changes mid-week). | Low | Medium | Resolved: target changes apply starting the following Monday (see `planning/DECISIONS.md`, 2026-07-09; Business Rule 4). | Resolved |
| Scope creep toward a "full time management tool" the user explicitly does not want. | Low | Medium | Every future sprint should be checked against the Out of Scope list in `planning/DOMAIN.md` before being authorized. | Open |
| RLS policy permits any authenticated session to read/write all rows (not scoped per-user). Acceptable now with one account, but would be a real data-isolation gap if a second account is ever added without revisiting it. | Low | Medium | Documented in `planning/DECISIONS.md` (2026-07-09) as a deliberate v1 tradeoff; must be revisited before any second account is created. | Open — accepted for v1 |
| Losing the single Supabase account's password/access with no self-serve signup fallback could lock the user out. | Low | Low | Supabase's standard password-reset-by-email flow covers recovery; the account's email must stay accessible to the user. | Open — accepted for v1 |

============================================================
FILE: planning/QUESTIONS.md
============================================================

# Open Questions

Questions that need answers from the Architect or Builder.

---

| Question | Owner | Needed By | Status | Answer / Notes |
|---|---|---|---|---|
| Which weekly target value applies if the target changes mid-week — the value in effect at the start of the week, or something else? | Architect/User | Sprint 002 planning | Resolved | The value in effect on the week's Monday governs the whole week. See `planning/DECISIONS.md` (2026-07-09) and Business Rule 4. |
| What auth approach does v1 need — a single login/shared secret, or none at all (trusted network / home use only)? | User | Sprint 002 planning | Resolved | Supabase email/password login, single manually-provisioned account, no signup flow. See `planning/DECISIONS.md` (2026-07-09). |
| What backup/export strategy should protect the Supabase-hosted data? | Architect | Sprint 002 or later | Resolved | Rely on Supabase's built-in automatic backups for v1; no custom export tooling built. See `planning/DECISIONS.md` (2026-07-09). |
| Should blackout dates / recurring non-work-day rules (e.g., "never works Sunday") become a future sprint? | User | Post-v1 | Deferred | Explicitly out of scope for v1 per user request; revisit after v1 ships. |
| Should reports/analytics beyond the weekly recap become a v2 direction? | User | Post-v1 | Deferred | Explicitly out of scope for v1; user flagged interest in "useful reports" as a future possibility. |
| Should pre-2026 historical sheet data ever be migrated, or does the original Google Sheet remain the permanent archive for that period? | User | Post-v1 | Open | Not needed for v1; the source sheet stays authoritative for pre-2026 history for now. |
| Should the single-account RLS approach be revisited (e.g., scoped by `user_id`) before any second account is ever added? | Architect | Before any second account is created | Open | See risk logged in `planning/RISKS.md` (2026-07-09). Not needed for Sprint 002. |

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
| `planning/STATE.md` | Project-specific starter documentation. | Updated by Architect Pack 002 | Reflects Sprint 002 authorization. |
| `planning/DOMAIN.md` | Project-specific starter documentation. | Updated by Architect Pack 002 | Adds auth, week-boundary, and backup decisions to the domain model. |
| `planning/FILE_INVENTORY.md` | Project-specific starter documentation. | Updated by Architect Pack 002 | This file. |

---

## Source Material Reviewed

| Reference | Purpose | Status | Notes |
|---|---|---|---|
| Google Sheet: `https://docs.google.com/spreadsheets/d/1KKEhUQkF4SOgrrC_zReIPbNJwVC6k9eW44tk7AgTcYY/edit` | Source of the current manual time-tracking workflow; basis for the v1 data model and migration plan. | Reviewed | Open-access link provided by the user. Only 2026 calendar-year entries are in scope for migration, planned as Sprint 003 (not Sprint 002). |

---

## Sprint 001 Deliverables

| File | Purpose | Status |
|---|---|---|
| `planning/sprints/001-discovery-architecture/requirements.md` | Sprint 001 requirements. | Created by Architect Pack 001 |
| `planning/sprints/001-discovery-architecture/blueprint.md` | Sprint 001 architecture blueprint (data model, calculation rules, screens, migration plan). | Created by Architect Pack 001 |
| `planning/sprints/001-discovery-architecture/acceptance.md` | Sprint 001 acceptance criteria. | Created by Architect Pack 001 |
| `planning/sprints/001-discovery-architecture/handoff-prompt.md` | Sprint 001 Builder handoff prompt. | Created by Architect Pack 001 |

---

## Sprint 002 Deliverables

| File | Purpose | Status |
|---|---|---|
| `planning/sprints/002-core-mvp-build/requirements.md` | Sprint 002 requirements (core app, no migration). | Created by Architect Pack 002 |
| `planning/sprints/002-core-mvp-build/blueprint.md` | Sprint 002 implementation blueprint (schema SQL, auth flow, app structure, calculation engine design). | Created by Architect Pack 002 |
| `planning/sprints/002-core-mvp-build/acceptance.md` | Sprint 002 acceptance criteria. | Created by Architect Pack 002 |
| `planning/sprints/002-core-mvp-build/handoff-prompt.md` | Sprint 002 Builder handoff prompt, including the mandatory code gate. | Created by Architect Pack 002 |
| `docs/ARCHITECTURE.md` | Durable architecture reference for v1. | Updated by Architect Pack 002 |
| `docs/API.md` | Server Actions / data-access notes for v1. | Updated by Architect Pack 002 |
| `docs/VALIDATION.md` | Validation priorities and specific test scenarios for Sprint 002. | Updated by Architect Pack 002 |

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
FILE: planning/sprints/002-core-mvp-build/requirements.md
============================================================

# Sprint 002 Requirements — Core MVP Build

## Goal

Build the working Time Tracker application — login, daily entry, settings/preferences, and the weekly recap — implementing the data model and calculation rules locked in `planning/DOMAIN.md` and `docs/ARCHITECTURE.md`. This sprint ships a real, usable app the user can start entering live data into, with an empty database (no historical migration yet).

## In Scope

- Supabase schema: create all tables from `docs/ARCHITECTURE.md` (`day_entries`, `sessions`, `leave_entries`, `holidays`, `weekly_target_settings`, `lunch_duration_settings`, `standard_workday_hours_settings`, `leave_banks`), with RLS enabled per `planning/DECISIONS.md`.
- Auth: Supabase email/password login screen; middleware-based route protection so no page or data is reachable without an authenticated session; logout action. No signup/registration screen.
- Daily Entry screen: create/edit a day — date picker, add/remove one or more check-in/check-out session pairs, a single "took lunch" toggle, optional leave hours entry by type (vacation/sick/paternity, partial-day supported).
- Settings / Preferences screen: manage weekly target hours, lunch duration default, standard workday hours, and the three leave banks — each as an effective-dated changelog (add a new dated entry; view history); manage the paid holiday list (add/remove date + label).
- Weekly Recap landing page: current week's Work Hours vs. Weekly Target, the Rolling Balance carried forward from all tracked weeks, and current remaining balance for each leave bank. This is the default/home screen after login.
- Calculation engine: implement all 9 business rules from `planning/DOMAIN.md` as a shared, testable module — this is the highest-risk part of the sprint (see `planning/RISKS.md`).

## Out of Scope

- Migrating any Google Sheet data (2026 or otherwise) — planned as Sprint 003.
- Reports/analytics beyond the weekly recap view.
- Multi-user accounts, roles, invites, or a signup flow.
- Mobile app / native clients (a responsive web layout is sufficient; no native build).
- Calendar integrations, reminders, or notifications.
- Blackout dates / recurring non-work-day rules.
- Custom data export/backup tooling.
- Anything else on the "Out of Scope for v1" list in `planning/DOMAIN.md`.

## Tied to Business Goal

Directly delivers the business goal in `planning/DOMAIN.md`: replacing the user's Google Sheet with a fast, low-friction tool for logging hours and seeing a clean weekly recap against target and leave balances.

============================================================
FILE: planning/sprints/002-core-mvp-build/blueprint.md
============================================================

# Sprint 002 Blueprint — Core MVP Build

## Approach

Implement the app in the following practical order, verifying each piece works before moving to the next:

1. Supabase schema (tables + RLS policies).
2. Auth (login screen + route protection).
3. Calculation engine (pure functions, no UI dependency) — highest risk, build and sanity-check first.
4. Settings / Preferences screen (needed before entry/recap have any real values to show).
5. Daily Entry screen.
6. Weekly Recap landing page (ties everything together).

## Tech Stack

- **Frontend/Backend**: Next.js (App Router), TypeScript.
- **Styling**: Tailwind CSS (see `planning/DECISIONS.md`, 2026-07-09).
- **Database**: Supabase (Postgres), accessed via the Supabase JS client.
- **Auth**: Supabase Auth (email/password), single account provisioned directly in the Supabase dashboard — no in-app signup.
- **Data mutations**: Next.js Server Actions calling the Supabase server client directly. No separate REST/GraphQL API layer (see `docs/API.md`).
- **Hosting**: Vercel for v1.

## Environment / Setup

- Supabase project URL, anon key, and service role key are supplied via local `.env.local` (untracked). The Builder should add a `.env.local.example` with placeholder keys (no real values) so setup is documented without leaking secrets.
- The one user account is created manually in the Supabase Auth dashboard, not through app code.

## Data Model (implement exactly as specified in `docs/ARCHITECTURE.md`)

- `day_entries` — `id`, `date` (unique), `lunch_taken` (boolean).
- `sessions` — `id`, `day_entry_id` (FK to `day_entries`), `check_in` (timestamp), `check_out` (timestamp).
- `leave_entries` — `id`, `date`, `leave_type` (enum: vacation | sick | paternity), `hours` (numeric, supports partial-day).
- `holidays` — `id`, `date`, `label`.
- `weekly_target_settings` — `id`, `hours`, `effective_date`.
- `lunch_duration_settings` — `id`, `minutes`, `effective_date`.
- `standard_workday_hours_settings` — `id`, `hours`, `effective_date`.
- `leave_banks` — `id`, `leave_type` (enum), `total_hours`, `effective_date`, `note`.

RLS: enable on every table above; one policy per table allowing all operations (`select`, `insert`, `update`, `delete`) when `auth.role() = 'authenticated'` (see `planning/DECISIONS.md`, 2026-07-09). Do not add a `user_id` column or per-row ownership scoping in Sprint 002.

## Calculation Engine

Implement as a standalone module (e.g., `lib/calculations/`) with pure functions, independent of any UI framework code, so it can be unit tested directly:

1. `rawHours(sessions)` — sum of `(check_out - check_in)` across a day's sessions.
2. `lunchDeduction(lunchTaken, lunchDurationSettingsAtDate)` — the effective lunch duration if `lunchTaken`, else 0.
3. `leaveHours(leaveEntriesForDate)` — sum of that date's leave entries, all types.
4. `holidayCredit(date, holidaysList, standardWorkdayHoursSettingsAtDate)` — the effective standard workday hours if `date` is in `holidaysList`, else 0.
5. `workHours(day)` = rawHours − lunchDeduction + leaveHours + holidayCredit.
6. `weeklyActualHours(daysInWeek)` — sum of `workHours` for each day in the week.
7. `weeklyDelta(weeklyActualHours, weeklyTargetSettingsAtMonday)` — actual minus the target in effect on that week's Monday (per Business Rule 4).
8. `rollingBalance(weeklyDeltasInOrder)` — cumulative sum across all tracked weeks, in date order.
9. `leaveBankRemaining(leaveType, leaveBanksForType, leaveEntriesForType)` — latest bank total (by `effective_date`) minus sum of that type's leave entries dated on/after that bank entry's `effective_date`.

Every effective-dated lookup (weekly target, lunch duration, standard workday hours, leave bank total) must implement the same rule: the most recent row with `effective_date <= the date being calculated`. Never use the current/latest row for a past date.

## Screens (v1)

- **Login** (`/login`): email + password fields, Supabase Auth sign-in. Redirects to the recap on success.
- **Weekly Recap** (`/`, default/home, auth-protected): current week's hours vs. target, rolling balance, leave balances remaining. Clean numbers only — no letter codes, no raw balance math exposed.
- **Daily Entry** (`/entries` or `/entries/[date]`, auth-protected): add/edit a day — sessions (add/remove check-in/check-out pairs), "took lunch" toggle, optional leave hours by type.
- **Settings / Preferences** (`/settings`, auth-protected): manage weekly target, lunch duration, standard workday hours, and leave banks (each with an "add new dated entry" action and a visible history list), plus the paid holiday list (add/remove date + label).

## Out of Scope for This Sprint

- Migration execution or tooling (Sprint 003).
- Anything on the "Out of Scope for v1" list in `planning/DOMAIN.md`.

============================================================
FILE: planning/sprints/002-core-mvp-build/acceptance.md
============================================================

# Sprint 002 Acceptance — Core MVP Build

Sprint 002 is complete when all of the following are true:

## Auth

- An unauthenticated visitor cannot view or mutate any data — every route except `/login` redirects to `/login` without a valid session.
- A valid login with the single provisioned account reaches the Weekly Recap screen.
- Logout ends the session and returns the user to a state where protected routes redirect to `/login` again.

## Daily Entry

- A day can be created/edited with one or more check-in/check-out session pairs (e.g., 8am–2pm, then 6pm–10pm on the same day) and the sessions are stored and re-displayed correctly.
- The "took lunch" toggle, when checked, deducts the effective lunch duration exactly once for that day regardless of how many sessions exist.
- Leave hours (vacation/sick/paternity, full or partial day) can be logged against a date alongside worked sessions.

## Settings / Preferences

- Each of weekly target hours, lunch duration, standard workday hours, and each leave bank (vacation/sick/paternity) can have a new dated entry added, and prior entries remain visible as history (not overwritten).
- The paid holiday list supports adding and removing a date + label entry.

## Weekly Recap

- The landing page (default route after login) shows the current week's Work Hours, Weekly Target, Weekly Delta, the Rolling Balance across all tracked weeks, and remaining balance for each leave bank.
- No letter codes or raw internal balance math are exposed in the UI — only the computed, human-readable numbers.

## Calculation Correctness (highest-priority checks — see `planning/RISKS.md`)

- **Effective-dating regression test**: after adding a new weekly target entry effective this coming Monday, all previously computed weeks' Weekly Delta and Rolling Balance values are unchanged. The same holds for a new lunch duration, standard workday hours, or leave bank entry — past calculations must not shift.
- A multi-session day sums correctly, and the lunch deduction applies exactly once regardless of session count.
- Holiday credit applies automatically for a date in the holiday list, with no session/clock-in required that day.
- If logged leave hours for a type exceed that type's current remaining balance, the UI visibly flags it (does not silently go negative unnoticed).

## General

- The app runs locally against a real Supabase project using only environment variables supplied outside the repo (no secrets committed).
- No Google Sheet migration code or UI exists in this sprint's deliverable.
- `planning/STATE.md` is updated to reflect Sprint 002's completion status at close, per `AGENTS.md` Completion Standard.

============================================================
FILE: planning/sprints/002-core-mvp-build/handoff-prompt.md
============================================================

# Sprint 002 Builder Handoff Prompt — Core MVP Build

Read `AGENTS.md`, `planning/STATE.md`, `planning/DOMAIN.md`, `planning/DECISIONS.md`, `planning/RISKS.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, and `docs/VALIDATION.md` first, then all four files in `planning/sprints/002-core-mvp-build/`.

## The code gate (mandatory)

Before creating, editing, or deleting any source/test/app file, stop and post:

- A concrete file-by-file plan (what you will create/edit, in what order).
- The scope guards — explicitly state you will NOT build the Google Sheet migration, reports/analytics beyond the weekly recap, multi-user/signup, or anything else on the Sprint 002 out-of-scope list.
- The acceptance criteria you're building toward, from `planning/sprints/002-core-mvp-build/acceptance.md`.

Wait for explicit approval of that plan before writing any code. An earlier "generate the pack" or "proceed" approval does not count as code-gate approval.

## Do

- Implement only from `planning/sprints/002-core-mvp-build/requirements.md`, `blueprint.md`, and `acceptance.md`.
- Follow the build order in `blueprint.md`: schema → auth → calculation engine → settings → daily entry → weekly recap.
- Ask the user for real Supabase project credentials (URL, anon key, service role key) to place in a local, untracked `.env.local` — do not invent or commit placeholder secrets as if real.
- Verify the app manually against the acceptance criteria (per `docs/VALIDATION.md`), especially the effective-dating regression scenario, before declaring the sprint done.
- Update `planning/STATE.md`, and record any new decisions or risks encountered during the build in `planning/DECISIONS.md` / `planning/RISKS.md`, per the Completion Standard in `AGENTS.md`.

## Do not

- Do not implement the Google Sheet migration — that is Sprint 003 and requires its own Architect session.
- Do not add reports/analytics beyond the weekly recap, multi-user support, a signup flow, calendar integrations, reminders, or blackout-date logic.
- Do not add a `user_id` column or change the RLS approach documented in `planning/DECISIONS.md` without flagging it first.
- Do not commit real Supabase credentials or any secret to the repository.

## Next step

Once Sprint 002 is built and the user has verified it against real (test) usage, start a new Architect session to scope Sprint 003 — Historical Data Migration (2026 Google Sheet import).

============================================================
FILE: docs/ARCHITECTURE.md
============================================================

# Architecture

Time Tracker v1 — architecture defined by the Architect Layer. Data model and calculation rules locked in Architect Pack 001; auth, styling, and data-access approach locked in Architect Pack 002.

---

## Stack

- **Application**: Next.js (App Router), TypeScript, deployed to Vercel for v1.
- **Styling**: Tailwind CSS.
- **Database**: Supabase (Postgres).
- **Auth**: Supabase Auth, email/password, single account (no signup flow).
- **Data access**: Next.js Server Actions calling the Supabase client directly — no separate REST/GraphQL API layer (see `docs/API.md`).
- **Hosting**: Vercel for v1. The app is not built with Vercel-specific lock-in, so a move to self-hosting (the user's home server) remains possible later without a rewrite.

## Users & Access

Single user, personal use. No multi-tenancy or roles. The whole app sits behind a Supabase Auth login; the one account is created directly in the Supabase dashboard, not through an in-app signup flow. Every route except the login screen requires a valid session (enforced via Next.js middleware).

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

All effective-dated tables share one lookup rule: the value "in effect" on a given date is the most recent row with `effective_date <= that date`. This preserves historical accuracy even after a setting changes later. For `weekly_target_settings` specifically, the lookup date used for a given week is always that week's Monday.

### Row Level Security

RLS is enabled on every table above. Each table has one policy permitting all operations (`select`/`insert`/`update`/`delete`) to any authenticated session — not scoped by a `user_id` column, since only one account exists in v1. See `planning/DECISIONS.md` (2026-07-09) for the reasoning and the accepted risk if a second account is ever added.

## Calculation Rules

1. **Raw Hours (day)** = sum of `(check_out minus check_in)` across all sessions for that day.
2. **Lunch Deduction (day)** = the lunch duration setting in effect that date, applied once per day if `lunch_taken` is true — independent of session count.
3. **Leave Hours (day)** = sum of that date's `leave_entries` hours, across all types.
4. **Holiday Credit (day)** = the standard workday hours setting in effect that date, if the date is in `holidays`; otherwise 0.
5. **Work Hours (day)** = Raw Hours minus Lunch Deduction plus Leave Hours plus Holiday Credit.
6. **Weekly Actual Hours** = sum of Work Hours for each day in the week.
7. **Weekly Delta** = Weekly Actual Hours minus Weekly Target Hours, using the target in effect on that week's Monday.
8. **Rolling Balance** = cumulative sum of Weekly Delta across all tracked weeks.
9. **Leave Bank Remaining (type)** = latest `leave_banks` total for that type minus sum of that type's `leave_entries` hours logged on/after that bank entry's `effective_date`.

The calculation engine implementing these rules should live as a standalone, UI-independent module (see `planning/sprints/002-core-mvp-build/blueprint.md`) so it can be unit tested directly — this is the highest-risk area of the app (see `planning/RISKS.md`).

## Screens (v1)

- **Login** — Supabase Auth email/password sign-in.
- **Weekly Recap** (landing page) — hours vs. target, rolling balance, leave balances remaining.
- **Daily Entry** — sessions, lunch toggle, leave hours by type, for a given date.
- **Settings / Preferences** — weekly target, lunch duration, standard workday hours, leave banks, and holiday list, each with history where applicable.

## Migration

One-time import of 2026 calendar-year entries from the source Google Sheet (see `planning/DOMAIN.md` for the link and mapping notes). Planned as Sprint 003 — not part of Sprint 002's scope.

## Out of Scope for v1

See `planning/DOMAIN.md` — Out of Scope for v1.

============================================================
FILE: docs/API.md
============================================================

# API

No separate REST/GraphQL API is built for v1. The Next.js app talks to Supabase directly:

- **Reads**: Server Components fetch via the Supabase server client.
- **Writes**: Next.js Server Actions call the Supabase server client directly (create/update day entries, sessions, leave entries, holidays, and each effective-dated settings table).
- **Auth**: Supabase Auth handles login/session/logout; Next.js middleware checks the session on every request to a protected route and redirects to `/login` if absent.

All data access — reads and writes — must go through an authenticated Supabase session; RLS policies (see `docs/ARCHITECTURE.md`) enforce this at the database level as a second layer, not just in the app.

This file will be revisited if Sprint 003 (Google Sheet migration) needs a dedicated import script or endpoint — likely a one-off Node script run locally against the Supabase service role key, not a public API route.

============================================================
FILE: docs/VALIDATION.md
============================================================

# Validation

Per the Micro-app rigor profile (`docs/RIGOR_PROFILE.md`): cover the happy path and the one or two failure modes that would lose the user's data. Do not over-test.

## Sprint 002 Validation Priorities

- **Effective-dating regression (highest priority)**: A setting change (weekly target, lunch duration, standard workday hours, or a leave bank) must never alter the calculated Work Hours, Weekly Delta, or Rolling Balance for dates/weeks before that setting's `effective_date`. Concretely: add a new weekly target entry effective next Monday, then confirm every already-computed past week's Weekly Delta and Rolling Balance are byte-for-byte unchanged. This is the most important behavior to verify given the effective-dated/changelog design — see the risk logged in `planning/RISKS.md`. Because this logic is isolated in the calculation engine module (per `docs/ARCHITECTURE.md`), a handful of unit tests here is worth the small extra effort even under the Micro-app tier.
- **Multi-session days**: e.g., 8am-2pm, then 6pm-10pm must sum correctly, and the lunch deduction must apply once per day regardless of session count.
- **Leave bank overdraw visibility**: leave bank remaining must never go negative silently — flag in the UI when logged leave hours would exceed the remaining balance.
- **Holiday credit**: must apply automatically without requiring a manual clock-in on that date.
- **Auth gate**: every protected route must be unreachable without a valid session; verify by hitting a protected route directly while logged out.
- **Manual smoke test**: after building each screen (per the blueprint's build order), manually exercise its happy path before moving to the next screen, rather than validating everything at the very end.

## Deferred to Sprint 003

- Migration data should be spot-checked against the source sheet for a sample of days before being treated as trustworthy — applies once migration is built, not in Sprint 002.

============================================================
FILE: planning/STATUS.json
============================================================

{
  "schemaVersion": 1,
  "phase": "apply-pack",
  "sprint": "002-core-mvp-build",
  "updated": "2026-07-09"
}
