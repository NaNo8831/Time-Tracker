============================================================
FILE: planning/STATE.md
============================================================

# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-07-09

---

## Current Phase

Sprint 004 Ready — Pay Period Recap Redesign + Full-Year Historical Import Authorized

---

## Current Status

Architect Pack 004 has been applied. Sprint 004 is authorized to: (1) redesign the landing page around a true Pay Period concept (two ISO-week-numbered weeks, clickable day rows, period navigation), (2) add a user-defined Physical Year setting to compute Weeks Left in Year, (3) clean up Daily Entry and Nav, (4) rework the History tab to match the new pay-period definition and exclude the current period, and (5) import the rest of 2026's history (2026-01-12 through 2026-05-01) from four new real CSV exports, extending the already-live, already-verified data back further in time.

- No Sprint 004 code has been written yet.
- Sprint 003 remains complete and verified live (2026-05-02–2026-06-26 imported, user-confirmed correct, current hours being logged).
- **Critical**: this import is additive only. The live database now holds real, user-verified data — no destructive operations (no TRUNCATE, no DROP) are in scope. The only mutations to already-existing rows are three settings' `effective_date` and the `rolling_balance_seed`'s value, both mathematically verified to leave every already-proofed number in `planning/sprints/003-break-rework-and-migration/acceptance.md` completely unchanged.

---

## Active Sprint

`planning/sprints/004-pay-period-recap-and-full-year-import/`

---

## Active Work

Builder: read `planning/sprints/004-pay-period-recap-and-full-year-import/` in full, then stop at the code gate — post a concrete file-by-file plan and wait for explicit approval before writing any code.

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
| Canonical GitHub repo | github.com/NaNo8831/Time-Tracker |
| Tech stack | Next.js 14 (App Router), Supabase (Postgres + Auth via `@supabase/ssr`), Tailwind CSS, Vitest, Vercel |

---

## v1 Scope Snapshot

See `planning/DOMAIN.md` and `docs/ARCHITECTURE.md` for full detail. Sprint 004 adds:

- **Pay Period Recap** (replaces Weekly Recap as the landing page): Week 1 + Week 2 stats (ISO-week-numbered, odd/even paired), Rolling Balance, Leave Remaining + Weeks Left in Year, a single day-by-day list for both weeks with a visual divider between them, each day clickable to `/entries/{date}`, and Prev/Next period navigation (unlimited range).
- **Physical Year setting**: user-entered start/end date ranges (list-style, like Paid Holidays), used to compute Weeks Left in Year.
- **History tab**: same period-list format, re-paired by ISO odd/even week instead of chronological pairing since tracking began, and excludes the current in-progress period.
- **Daily Entry**: "Recent Entries" list removed.
- **Nav**: reordered to Daily Entry, Recap, History, Settings.
- **Historical import**: 2026-01-12 through 2026-05-01 (extends tracked history back from the existing 2026-05-02 start), sourced from four new CSV exports in `references/source-app/`.
- Out of scope: employer-specific pay-period anchoring (ISO standard only, not configurable), any data before 2026-01-12, reports/analytics beyond what's described here, multi-user.

---

## Next Actions

1. Builder executes Sprint 004 from `planning/sprints/004-pay-period-recap-and-full-year-import/` only, starting with the mandatory code gate.
2. Build order matters: the Pay Period Recap redesign should land and be verified BEFORE the historical import runs, since the import's acceptance criteria are checked against the new page.
3. After Sprint 004 is verified live, the earliest remaining gap is 2026-01-01 through 2026-01-09 (data not available — the user's records start 2026-01-10, and 2026-01-10/11 fall outside the trackable Monday-Sunday boundary; see Decisions). No further action needed there unless the user finds additional records later.

---

## Blockers

No known blocker. The Builder will need the user to run the SQL scripts against the live Supabase project (Builder has no direct DB access), and this time those scripts touch a database with real, live, in-use data — extra care is warranted (see Risks).

---

## Watch Items

- **Critical**: this import is additive-only against a live, real, in-use database. No TRUNCATE, no destructive statements. The three settings `effective_date` changes and the `rolling_balance_seed` value change must reproduce the EXACT already-verified 8-week table from Sprint 3 (see `planning/sprints/003-break-rework-and-migration/acceptance.md`) as a hard regression check before this sprint is considered done.
- New earliest tracked Monday: `2026-01-12`. New rolling balance seed: `-7.87`. Both mathematically derived and cross-checked against the sheet's own rollover figures and the already-live `-27.67` checkpoint — see `planning/DECISIONS.md`.
- 2026-01-10 and 2026-01-11 (4.25 real hours on Jan-10) are NOT imported as discrete day records — they fall before the first fully-reconstructable Monday-Sunday week. This does not affect Rolling Balance accuracy (the seed already accounts for it) but means that one specific day's raw session detail is not viewable in the app. Documented, not a bug.
- Three inferred holiday labels (2026-04-02 "Holy Thursday", 2026-04-03 "Good Friday", 2026-04-06 "Easter Monday") — editable in Settings if wrong.
- ISO week pairing has a known, accepted edge case in 53-ISO-week years (rare) where year-boundary pairing may not alternate cleanly — not solved in v1, Micro-app tier accepts this.
- Do not implement employer-specific pay-period anchoring — the user explicitly chose the ISO 8601 standard, not a configurable anchor.

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
| 2026-07-08 | Work Hours (day) = Raw Hours minus Break Deduction plus Leave Hours plus Holiday Credit. | Confirmed against real usage and the source sheet's own formula. | Day entries support multiple sessions per day. |
| 2026-07-08 | Weekly target hours, break duration default, standard workday hours, and each leave bank are effective-dated changelog entries. | User needs to adjust these over time without rewriting past math. | Calculations always look up "the value in effect as of the date being calculated." |
| 2026-07-08 | Holiday credit hours come from a directly user-editable "Standard Workday Hours" setting, not a derived formula. | Workdays-per-week has changed historically; a derived formula would silently change past holiday credit. | Standard Workday Hours is its own effective-dated setting. |
| 2026-07-08 | Leave banks are self-reported, manually entered/adjusted with an effective date. | User reconciles balances against their employer manually. | Remaining balance = latest bank total minus hours logged since that effective date. |
| 2026-07-08 | Blackout dates and reports/analytics beyond the weekly recap are out of scope for v1. | Matches user's explicit boundaries. | Logged as future enhancements in `planning/QUESTIONS.md`. |
| 2026-07-09 | Auth is Supabase email/password, single manually-provisioned account, no signup flow. | Future-proofs for off-network access within the Micro-app rigor tier. | Login screen + middleware route protection. |
| 2026-07-09 | A weekly target change takes effect starting the following Monday. | Simplest predictable rule. | Weekly Delta always looks up the target in effect on that week's Monday. |
| 2026-07-09 | Backups rely on Supabase's built-in automatic backups. | Matches Micro-app rigor tier. | No custom export/backup tooling. |
| 2026-07-09 | Historical migration ships as its own follow-up sprint each time, not bundled into feature work. | Keeps each sprint verifiable in isolation. | Sprint 002 shipped empty; Sprint 003 added the first real batch; Sprint 004 adds the next. |
| 2026-07-09 | Styling uses Tailwind CSS; data mutations use Server Actions, no separate API layer. | Standard, low-overhead pairing. | Carried forward unchanged. |
| 2026-07-09 | Supabase RLS is enabled on all tables, single-account policy (not `user_id`-scoped). | Only one account exists. | Revisit before any second account is created. |
| 2026-07-09 | Reworked the break/lunch model: manual per-day override with an effective-dated default, applying the default only on days with sessions. | Real sheet data showed no routine daily deduction, but real one-off adjustments. | Fixed a real bug where the default would have applied to empty days. |
| 2026-07-09 | Added a one-time Rolling Balance Seed (`rolling_balance_seed` table, no UI) so Rolling Balance continues from real pre-app history. | The calculation engine was, until then, always fully derived starting at zero. | `rollingBalance()` now accepts a starting seed. |
| 2026-07-09 | `weekly_target_settings`' earliest `effective_date` must equal the Monday of the first FULL Monday-Sunday tracked week — not the Monday of the week merely containing the first real day, and not an earlier placeholder. | Phantom/wrong-boundary weeks silently corrupt Rolling Balance. | Verified via independent recomputation against real daily data before any SQL was run, both in Sprint 003 and again in Sprint 004. |
| 2026-07-09 | Sprint 003 imported 2026-05-02–2026-06-26 (8 weeks); user confirmed the numbers match the source sheet, then began logging live hours on top. | Real-data proof the calculation engine is correct. | This became the baseline every later import must reproduce exactly. |
| 2026-07-09 | Live-run correction: a constraint-name mismatch in the Sprint 003 schema-migration script was found and fixed only when it ran against the real database. | Two different constraint-creation paths existed across the project's history. | Script rewritten to check for either possible name and be safely re-runnable. |
| 2026-07-09 | **Pay Period redesign, locked after discussion**: pay periods are two consecutive ISO 8601 weeks, paired by parity — odd ISO week number = "Week 1", the following even week = "Week 2" (periods: 1&2, 3&4, 5&6, ... 51&52). This is a fixed calendar rule, explicitly NOT tied to the user's employer's own pay-period numbering — "it's a tracking metric," per the user. | User considered and explicitly rejected an employer-anchored or user-configurable-anchor alternative in favor of the plain ISO standard. | New `src/lib/calculations/isoWeek.ts` computes ISO week number and period boundaries directly (no external lookup, no anchor setting). Known limitation: a 53-ISO-week year may not pair cleanly across the year boundary — accepted, not solved in v1. |
| 2026-07-09 | Landing page becomes the **Pay Period Recap**: Week 1 stats, Week 2 stats, Rolling Balance, Leave Remaining + a new Weeks Left in Year card, then a single day-by-day list for both weeks (visually divided, no longer a separate "Last 14 Days" rolling section) with each day clickable. Clicking a day navigates to the existing `/entries/{date}` page — explicitly NOT an in-page modal, to avoid introducing the app's first client-side interactive UI pattern for this. | User wants an overview-plus-drill-down flow; navigating to the already-built Daily Entry page reuses everything instead of building new UI infrastructure. | The old rolling "Last 14 Days" table is retired entirely — it was redundant with the new period-bound day list. Requires extending `buildWeeklyRecap()` to compute weeks beyond `today` when a requested period's Week 2 hasn't happened yet. |
| 2026-07-09 | **Weeks Left in Year** is computed from a new user-entered **Physical Year** setting (start date + end date), NOT from a plain calendar-year or ISO-year boundary. | User: "the physical year does not align with the calendar weeks" — their tracking year has its own real start/end that a naive Dec 31 cutoff would get wrong. | New `physical_year_settings` table (list-style, like Paid Holidays: date-range records, no effective-dating). Weeks Left = ISO weeks from today's week through whichever record's range contains today; blank if none matches. |
| 2026-07-09 | History tab excludes the current in-progress pay period entirely (only past, fully-elapsed periods are listed), and its period-pairing switches from "chronological since tracking started" to the same ISO odd/even rule as the landing page. | The current period is now shown live on the landing page — showing it twice is redundant, and the old chronological-pairing logic doesn't match the new ISO-anchored definition. | `src/lib/calculations/periods.ts`'s old naive `chunkWeeksIntoPeriods` is replaced with ISO-based grouping. Some already-computed May-June period pairings may regroup under the new rule — expected, not a bug (see acceptance.md for the exact recomputed pairing). |
| 2026-07-09 | The user shared four new real CSV exports covering 2026-01-10 through 2026-05-01. Parsed cell-by-cell using the exact same mapping rules validated in Sprint 003 (ADJ code + adjacent number; `x` flows into Break, others add to hours). One file (`March_April 11-14.csv`) had a stray leading data row (`Mar-9`, a zero day) positioned before its own header block — recovered by treating it as real data for that date, since the main sequential block skips directly from Mar-8 to Mar-10 otherwise. | Real data inspection, same rigor as Sprint 003. | All four saved verbatim to `references/source-app/`. |
| 2026-07-09 | The earliest fully-reconstructable Monday-Sunday week is **2026-01-12** (2026-01-10 Saturday has 4.25 real hours, but 2026-01-05–01-09 are not in any provided CSV, so that partial week cannot be safely imported). The three settings' (`weekly_target_settings`, `break_duration_settings`, `standard_workday_hours_settings`) `effective_date` moves from `2026-05-04` back to `2026-01-12` — their VALUES are unchanged (32 hrs, 0 min default break, 6.4 hrs standard workday all hold constant from January through the already-verified window), confirmed by real data across the whole span, so this is a single `UPDATE` per table, not a new dated row. | The 4-day-week era (flagged as an open question after Sprint 003) turns out not to apply to any of this data — the "5-day week, 6.4 hrs standard workday" rate was already in effect by January 2026. | Resolves the open question logged in `planning/QUESTIONS.md` after Sprint 003. If a 4-day-week era exists at all, it predates 2026-01-10 and remains unconfirmed. |
| 2026-07-09 | `rolling_balance_seed` updates from `-27.67` (representing the balance before 2026-05-04) to `-7.87` (representing the balance before 2026-01-12), independently derived and verified by computing forward through all 15 intervening weeks and confirming it reproduces `-25.32` (the sheet's own rollover value before 2026-04-27) and then exactly `-27.67` at the 2026-05-04 boundary — the figure already live and user-verified. | Mathematical proof that extending history backward does not disturb any already-proofed number. | Single `UPDATE` on the existing `rolling_balance_seed` row (or an equivalent insert-then-supersede, per existing "latest row wins" design) — not a fresh insert requiring app changes. |

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

============================================================
FILE: planning/RISKS.md
============================================================

# Risks

Known project risks and mitigation notes.

---

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| Effective-dated settings model complexity could corrupt historical balances if a lookup bug exists. | Medium | High | Regression-tested since Sprint 002, re-verified in Sprint 003. | Resolved — ongoing regression coverage |
| No backup/export strategy for Supabase-hosted personal data. | Medium | Medium | Resolved: Supabase's built-in automatic backups. | Resolved |
| RLS policy permits any authenticated session to read/write all rows (not scoped per-user). | Low | Medium | Deliberate v1 tradeoff; revisit before any second account is created. | Open — accepted for v1 |
| Losing the single Supabase account's access with no self-serve signup fallback. | Low | Low | Standard password-reset-by-email flow covers recovery. | Open — accepted for v1 |
| **New**: this sprint's historical import runs against a LIVE database with real, user-verified data (unlike Sprints 002/003, which ran against empty or freshly-truncated tables). A mistake here risks corrupting data the user is actively relying on. | Medium | High | Import is strictly additive (no TRUNCATE/DROP); the only mutations to existing rows (3 settings' `effective_date`, the seed's value) are mathematically pre-verified to reproduce Sprint 3's exact already-proofed numbers. Acceptance criteria include a hard regression check of that entire 8-week table before Sprint 004 is considered done. | Open — addressed in Sprint 004 acceptance criteria |
| **New**: extending `buildWeeklyRecap()` to compute weeks beyond `today` (needed so a Pay Period Recap can show "Week 2" even when today is still in Week 1) could, if implemented carelessly, start counting future/not-yet-happened weeks into the Rolling Balance shown elsewhere (e.g., the History tab, or the "current week" figure). | Medium | Medium | Blueprint specifies this extension is scoped to the Pay Period Recap's own period-bounded view only, not the underlying `weeks[]` array used for History/Leave Bank calculations elsewhere. | Open — addressed in acceptance criteria |
| **New**: 2026-01-10/11 (4.25 real hours on Jan-10) are excluded from tracked history since the rest of that Monday-Sunday week isn't documented anywhere. | Low | Low | Documented clearly; does not affect Rolling Balance correctness (verified). If the user later finds records for 2026-01-05–01-09, those days plus Jan-10/11 could be imported as a small follow-up. | Open — accepted, low stakes |
| **New**: 53-ISO-week years may not pair cleanly under the Week1/Week2 odd/even rule at the year boundary. | Low | Low | Documented as a known, accepted limitation. Not solved in v1. | Open — accepted for v1 |

============================================================
FILE: planning/QUESTIONS.md
============================================================

# Open Questions

Questions that need answers from the Architect or Builder.

---

| Question | Owner | Needed By | Status | Answer / Notes |
|---|---|---|---|---|
| Which weekly target value applies if the target changes mid-week? | Architect/User | Sprint 002 | Resolved | Value in effect on the week's Monday. |
| What auth approach does v1 need? | User | Sprint 002 | Resolved | Supabase email/password, single account, no signup. |
| What backup/export strategy should protect the data? | Architect | Sprint 002 | Resolved | Supabase's built-in automatic backups. |
| Should blackout dates become a future sprint? | User | Post-v1 | Deferred | Out of scope for v1. |
| Should reports/analytics beyond the recap become a v2 direction? | User | Post-v1 | Deferred | Out of scope for v1. |
| Should pre-2026 historical sheet data ever be migrated? | User | Post-v1 | Open | Not needed for v1. |
| Should single-account RLS be revisited before a second account is added? | Architect | Before 2nd account | Open | Accepted v1 tradeoff. |
| Should the recap support a user-configurable pay-period cycle? | User/Architect | N/A | **Resolved** | User explicitly chose the ISO 8601 standard, not a configurable/employer anchor — "it's a tracking metric." Implemented in Sprint 004. |
| Does the Jan-April 2026 "4-day week" era need its own settings values (different Standard Workday Hours / break default)? | User/Architect | Sprint 004 | **Resolved** | No — real data from 2026-01-10 through 2026-05-01 confirms the "5-day week, 6.4 hrs standard workday, 0-min break default" rate was already in effect throughout. If a 4-day-week era exists, it predates 2026-01-10 and remains unconfirmed/unneeded. |
| **New**: should 2026-01-01 through 2026-01-09 ever be imported, if the user locates those records later? | User | Whenever found | Open | Currently excluded — no source data available. Low priority, low impact per `planning/RISKS.md`. |

============================================================
FILE: planning/FILE_INVENTORY.md
============================================================

# File Inventory

Use this file to track important project files, references, samples, and their status.

---

## Source Material Reviewed

| Reference | Purpose | Status | Notes |
|---|---|---|---|
| Google Sheet (see `planning/DOMAIN.md`) | Source of the manual time-tracking workflow. | Reviewed | Six real CSV exports reviewed cell-by-cell across Sprints 003-004, covering 2026-01-10 through 2026-06-26. |
| `references/source-app/sheet-export-2026-01-10-to-2026-02-06.csv` | Real source data, Sprint 004 import batch. | Saved | Verbatim export. |
| `references/source-app/sheet-export-2026-02-07-to-2026-03-06.csv` | Real source data, Sprint 004 import batch. | Saved | Verbatim export. |
| `references/source-app/sheet-export-2026-03-07-to-2026-04-03.csv` | Real source data, Sprint 004 import batch. | Saved | Verbatim export. Has a stray leading data row (`Mar-9`) — see `planning/DECISIONS.md`. |
| `references/source-app/sheet-export-2026-04-04-to-2026-05-01.csv` | Real source data, Sprint 004 import batch. | Saved | Verbatim export. Connects directly into the already-imported 2026-05-02 window. |

## Sprint 004 Deliverables

| File | Purpose | Status |
|---|---|---|
| `planning/sprints/004-pay-period-recap-and-full-year-import/requirements.md` | Sprint 004 requirements. | Created by Architect Pack 004 |
| `planning/sprints/004-pay-period-recap-and-full-year-import/blueprint.md` | Pay Period redesign + import technical design. | Created by Architect Pack 004 |
| `planning/sprints/004-pay-period-recap-and-full-year-import/acceptance.md` | Sprint 004 acceptance criteria, including the recomputed weekly table and the Sprint 3 regression check. | Created by Architect Pack 004 |
| `planning/sprints/004-pay-period-recap-and-full-year-import/handoff-prompt.md` | Sprint 004 Builder handoff prompt. | Created by Architect Pack 004 |
| `docs/ARCHITECTURE.md` | Durable architecture reference. | Updated by Architect Pack 004 |
| `docs/VALIDATION.md` | Validation priorities. | Updated by Architect Pack 004 |

============================================================
FILE: planning/sprints/004-pay-period-recap-and-full-year-import/requirements.md
============================================================

# Sprint 004 Requirements — Pay Period Recap Redesign + Full-Year Historical Import

## Goal

1. Replace the Weekly Recap landing page with a **Pay Period Recap**: two ISO-week-numbered weeks (odd/even paired), a unified clickable day-by-day list, and period navigation.
2. Add a **Physical Year** setting and a **Weeks Left in Year** figure.
3. Clean up Daily Entry (drop Recent Entries) and Nav ordering (Daily Entry first).
4. Rework the History tab to the new pay-period definition, excluding the current period.
5. Import 2026-01-12 through 2026-05-01 (extending tracked history backward from the already-live 2026-05-02 start) from four real CSV exports — additive-only, against a live database with real, user-verified data.

## In Scope

- `src/lib/calculations/isoWeek.ts`: ISO 8601 week number + pay-period boundary calculation.
- `buildWeeklyRecap()` extended to optionally compute weeks beyond `today`, scoped to the Pay Period Recap's own use (not affecting History/Leave Bank calculations).
- New `buildPayPeriodRecap()`: Week 1 + Week 2 summaries, Rolling Balance as of period end.
- New `physical_year_settings` table + Settings UI section (list-style: add start/end date, view/remove list) + `weeksLeftInYear()` calculation.
- Pay Period Recap page (`src/app/(app)/page.tsx`): full rewrite per the layout in `planning/DECISIONS.md`. Day rows link to `/entries/{date}`. Prev/Next period links. Retires the old rolling "Last 14 Days" section entirely.
- History tab: rewritten to group by ISO pay period and exclude the current period.
- Daily Entry: remove "Recent Entries" section.
- Nav: reorder to Daily Entry, Recap, History, Settings.
- Schema migration SQL (new `physical_year_settings` table + RLS) for the live database.
- Data-import SQL (additive-only) for 2026-01-12–2026-05-01, plus the three settings `effective_date` `UPDATE`s and the `rolling_balance_seed` value `UPDATE`, all per the exact values derived in `planning/DECISIONS.md` and `blueprint.md`.

## Out of Scope

- Data before 2026-01-12.
- Employer-specific or user-configurable pay-period anchoring.
- An in-app import feature.
- Any change to the underlying Work Hours / Weekly Delta / Rolling Balance business rules themselves (Rules 1-12 are untouched).
- Fixing the 53-ISO-week-year pairing edge case.

## Tied to Business Goal

Delivers the pay-period view the user actually wants to check their hours against, extends the proven-correct calculation engine across the full year so far, and keeps the app's core promise — real numbers matching the user's own trusted source — intact through a much larger dataset.

============================================================
FILE: planning/sprints/004-pay-period-recap-and-full-year-import/blueprint.md
============================================================

# Sprint 004 Blueprint — Pay Period Recap Redesign + Full-Year Historical Import

## Approach

Build in this order:

1. `isoWeek.ts` + unit tests (pure functions, no dependencies — build and verify first).
2. Extend `buildWeeklyRecap()` / add `buildPayPeriodRecap()`, with unit tests including the Sprint 3 regression check.
3. Physical Year setting: schema, data layer, Settings UI, `weeksLeftInYear()`.
4. Pay Period Recap page rewrite.
5. History tab rewrite.
6. Daily Entry cleanup + Nav reorder.
7. Schema migration SQL (physical_year_settings table) — hand to user.
8. Data-import SQL (2026-01-12–2026-05-01, additive) — hand to user, run AFTER step 7 and after the app code is live, so the new Pay Period Recap page can be used to verify it.
9. Verify against `acceptance.md`, including the Sprint 3 regression check.

## ISO Week Calculation

```ts
// src/lib/calculations/isoWeek.ts
export function isoWeekNumber(date: IsoDate): number {
  const d = new Date(`${date}T00:00:00Z`);
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstThursdayDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNum + 3);
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000));
}

/** The Monday that starts "Week 1" of the pay period containing `date`. */
export function payPeriodWeek1Start(date: IsoDate): IsoDate {
  const weekMonday = mondayOf(date); // from ./weekly.ts
  const weekNum = isoWeekNumber(weekMonday);
  return weekNum % 2 === 1 ? weekMonday : addDays(weekMonday, -7);
}
```

Verified reference values (see `planning/DECISIONS.md`): 2026-01-12 = ISO week 3 (odd, so it's a clean Week 1 with no partial-period edge case at the very start of tracked history). 2026-04-27 = ISO week 18 (even, Week 2 of the period starting 2026-04-20). 2026-05-04 = ISO week 19 (odd, Week 1 of the next period).

## Pay Period Recap Calculation

`buildWeeklyRecap()` currently iterates weeks only through `mondayOf(input.today)`. Add an optional parameter (e.g., `extendThroughWeek?: IsoDate`) so the returned `weeks[]` array can include weeks beyond today WHEN EXPLICITLY REQUESTED — the day-loop inside each week still correctly stops contributing actual hours once `date > today` (already-existing behavior), so a "future" week just shows 0 actual / full negative delta, which is exactly the right display for "this week hasn't happened yet."

**Important**: only the Pay Period Recap page should ever pass `extendThroughWeek`. The History tab and Leave Bank calculations must keep using the unextended, `today`-bounded array — do not let a requested future extension leak into those.

```ts
export function buildPayPeriodRecap(recapInput: RecapInput, week1Start: IsoDate) {
  const week2Start = addDays(week1Start, 7);
  const recap = buildWeeklyRecap({ ...recapInput, /* extend through week2Start */ });
  if (!recap) return null;
  const week1 = recap.weeks.find((w) => w.weekStart === week1Start);
  const week2 = recap.weeks.find((w) => w.weekStart === week2Start);
  // week1 should always exist for any period at/before "today"'s period;
  // week2 may need the array extended through week2Start if it's the
  // current, in-progress period.
  return { week1, week2, rollingBalance: (week2 ?? week1)!.rollingBalance };
}
```

## Physical Year + Weeks Left in Year

```sql
create table if not exists physical_year_settings (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  note text,
  created_at timestamptz not null default now(),
  constraint physical_year_end_after_start check (end_date > start_date)
);
alter table physical_year_settings enable row level security;
create policy "authenticated_all_physical_year_settings" on physical_year_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

```ts
// src/lib/calculations/physicalYear.ts
export function weeksLeftInYear(
  years: { startDate: IsoDate; endDate: IsoDate }[],
  today: IsoDate
): number | null {
  const current = years.find((y) => y.startDate <= today && today <= y.endDate);
  if (!current) return null;
  const todayMonday = mondayOf(today);
  const endMonday = mondayOf(current.endDate);
  const weeks = Math.round((new Date(endMonday).getTime() - new Date(todayMonday).getTime()) / (7 * 86400000));
  return Math.max(weeks + 1, 0); // inclusive of the current week
}
```

Settings UI: new section, same list pattern as Paid Holidays (add start date + end date + optional note, list existing entries, remove). No uniqueness constraint required beyond the `end_date > start_date` check — overlapping ranges aren't validated against in v1 (Micro-app tier; user is trusted not to double-enter).

## Pay Period Recap Page Layout

`src/app/(app)/page.tsx`, reading an optional `?period=<week1Start>` search param (default: `payPeriodWeek1Start(today)`):

1. Week 1 stats card row (Actual / Target / Delta).
2. Week 2 stats card row (Actual / Target / Delta) — shows 0/pending values gracefully if Week 2 hasn't started yet.
3. Rolling Balance (large card, as of period end).
4. Leave Remaining cards + new Weeks Left in Year card, same row style.
5. Day-by-day list, both weeks (14 rows) via the EXISTING `getDailyHistoryRows(week1Start, addDays(week1Start, 13))` — reuse as-is, no changes needed to that function. Columns stay Date/Raw/Break/Total/Other (no Delta column — user confirmed this would be redundant with the Week 1/2 stat cards above). Add a visual divider (border/spacing) between day 7 and day 8. Each row is a `<Link href={`/entries/${date}`}>`.
6. Prev/Next: links to `?period=${addDays(week1Start, -14)}` / `?period=${addDays(week1Start, 14)}`.

## History Tab

Replace `src/lib/calculations/periods.ts`'s naive `chunkWeeksIntoPeriods` with ISO-based grouping:

```ts
export function groupWeeksIntoPayPeriods(weeks: WeekSummary[]): PeriodSummary[] {
  const byWeek1Start = new Map<IsoDate, WeekSummary[]>();
  for (const week of weeks) {
    const key = payPeriodWeek1Start(week.weekStart);
    byWeek1Start.set(key, [...(byWeek1Start.get(key) ?? []), week]);
  }
  return [...byWeek1Start.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([week1Start, periodWeeks]) => ({ /* same shape as before */ }));
}
```

The History page excludes whichever period's `week1Start === payPeriodWeek1Start(today)`.

## UI Cleanup

- `src/app/(app)/entries/[date]/page.tsx`: remove the "Recent Entries" section and its `listRecentDayEntries` call.
- `src/components/Nav.tsx`: reorder links — Daily Entry, Recap, History, Settings.

## Migration Data (from `references/source-app/sheet-export-2026-01-*.csv` through `2026-05-01.csv`)

**Settings updates** (all three are `UPDATE`s to the existing live rows, not new inserts — values unchanged, only `effective_date` moves earlier):
- `weekly_target_settings`: `effective_date` 2026-05-04 → **2026-01-12**.
- `break_duration_settings`: `effective_date` 2026-05-04 → **2026-01-12**.
- `standard_workday_hours_settings`: `effective_date` 2026-05-04 → **2026-01-12**.
- `rolling_balance_seed`: `balance` -27.67 → **-7.87** (mathematically verified in `planning/DECISIONS.md` to reproduce every already-proofed Sprint 3 number exactly).

**New holidays**: `2026-04-02` "Holy Thursday", `2026-04-03` "Good Friday", `2026-04-06` "Easter Monday" (inferred from date + the organization's existing Holy-Day-of-Obligation references; editable in Settings if wrong).

**New leave_entries**: 2026-01-16 (vacation, 8), 2026-01-19 (vacation, 6.4), 2026-02-13 (vacation, 8), 2026-04-08 (sick, 8), 2026-04-09 (sick, 3), 2026-04-10 (sick, 8), 2026-04-16 (sick, 6.4), 2026-04-17 (paternity, 6.4), 2026-04-21 (paternity, 6.4), 2026-04-23 (paternity, 4), 2026-05-01 (paternity, 6.4).

**New break_minutes_override days**: 2026-01-20 (60), 2026-01-29 (60), 2026-02-04 (60), 2026-02-20 (30), 2026-03-04 (60), 2026-03-05 (120), 2026-03-10 (60).

**Day-by-day session mapping**: same rules as Sprint 003 (each non-blank Check-in/Check-out pair = one `sessions` row; `h` = holiday, no leave_entries row; `x` = break override, no leave_entries row; `v`/`s`/`p` = leave_entries addition). Days with zero sessions, no ADJ code, and not a holiday get no `day_entries` row at all. Every date from 2026-01-12 through 2026-05-01 needs mapping EXCEPT the zero days (see the source CSVs for the complete day list — every date in this range appears in one of the four files, including the recovered `Mar-9` stray row in the third file).

**Excluded**: 2026-01-10 (Sat, 4.25 real hours) and 2026-01-11 (Sun, 0) — before the first fully-reconstructable Monday-Sunday week. Do not attempt to import these; their contribution is already accounted for in the derived seed.

## Verified Weekly Table (2026-01-12 through 2026-04-26, seed -7.87)

| Week (Mon-Sun) | Actual | Delta | Rolling Balance |
|---|---:|---:|---:|
| 2026-01-12 – 01-18 | 30.50 | -1.50 | -9.37 |
| 2026-01-19 – 01-25 | 29.40 | -2.60 | -11.97 |
| 2026-01-26 – 02-01 | 27.00 | -5.00 | -16.97 |
| 2026-02-02 – 02-08 | 27.25 | -4.75 | -21.72 |
| 2026-02-09 – 02-15 | 34.50 | +2.50 | -19.22 |
| 2026-02-16 – 02-22 | 41.00 | +9.00 | -10.22 |
| 2026-02-23 – 03-01 | 45.50 | +13.50 | +3.28 |
| 2026-03-02 – 03-08 | 26.83 | -5.17 | -1.89 |
| 2026-03-09 – 03-15 | 30.75 | -1.25 | -3.14 |
| 2026-03-16 – 03-22 | 28.00 | -4.00 | -7.14 |
| 2026-03-23 – 03-29 | 23.75 | -8.25 | -15.39 |
| 2026-03-30 – 04-05 | 26.30 | -5.70 | -21.09 |
| 2026-04-06 – 04-12 | 37.07 | +5.07 | -16.02 |
| 2026-04-13 – 04-19 | 25.30 | -6.70 | -22.72 |
| 2026-04-20 – 04-26 | 29.40 | -2.60 | -25.32 |
| 2026-04-27 – 05-03 (already live) | 29.65 | -2.35 | -27.67 |

The last row is the exact already-live, already-verified boundary — the Builder should confirm the app reproduces `-27.67` there without having touched anything downstream of it.

## Out of Scope for This Sprint

- Data before 2026-01-12.
- Fixing the 53-ISO-week-year edge case.
- Any UI for editing the Rolling Balance Seed.

============================================================
FILE: planning/sprints/004-pay-period-recap-and-full-year-import/acceptance.md
============================================================

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

============================================================
FILE: planning/sprints/004-pay-period-recap-and-full-year-import/handoff-prompt.md
============================================================

# Sprint 004 Builder Handoff Prompt — Pay Period Recap Redesign + Full-Year Historical Import

Read `AGENTS.md`, `planning/STATE.md`, `planning/DOMAIN.md`, `planning/DECISIONS.md`, `planning/RISKS.md`, `docs/ARCHITECTURE.md`, `docs/VALIDATION.md`, all four new CSVs in `references/source-app/`, and all four files in `planning/sprints/004-pay-period-recap-and-full-year-import/` first.

## The code gate (mandatory)

Before creating, editing, or deleting any source/test/app file, stop and post:

- A concrete file-by-file plan (follow `blueprint.md`'s build order).
- The scope guards — explicitly state you will NOT import data before 2026-01-12, will NOT build employer-anchored pay periods, will NOT build an in-app import feature, and will NOT run any destructive SQL against the live database.
- The acceptance criteria you're building toward, especially the Sprint 3 regression check.

Wait for explicit approval before writing any code.

## Do

- Build and verify the Pay Period Recap redesign BEFORE running the historical import SQL — the import's acceptance criteria depend on the new page existing.
- Write the schema-migration SQL (new `physical_year_settings` table) and the data-import SQL as separate scripts, additive-only, handed to the user to run manually — you have no direct DB access.
- Before declaring the import complete, explicitly re-verify the ENTIRE already-live Sprint 3 weekly table is unchanged — this is a live, real, in-use database now, not an empty or truncated one.
- Ask the user to confirm both SQL scripts have been run before treating the import as complete.

## Do not

- Do not import any data before 2026-01-12.
- Do not build employer-specific or user-configurable pay-period anchoring — ISO 8601 standard only, per `planning/DECISIONS.md`.
- Do not build an in-page modal/pop-out for day editing — day rows navigate to the existing `/entries/{date}` page.
- Do not run TRUNCATE, DROP, or any destructive statement against the live database.
- Do not let the Pay Period Recap's "extend weeks through a future date" logic leak into the History tab's or Leave Bank's calculations — those must stay bounded to `today`.
- Do not commit real Supabase credentials or any secret to the repository.

## Next step

Once verified, the next Architect session is open — no specific follow-up is queued beyond the still-open, low-priority question of whether 2026-01-01–01-09 can ever be recovered from other records.

============================================================
FILE: docs/ARCHITECTURE.md
============================================================

# Architecture

Time Tracker v1 — architecture defined by the Architect Layer across Packs 001-004.

---

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Supabase (Postgres + Auth via `@supabase/ssr`), Vercel, Vitest.

## Users & Access

Single user, personal use, gated by Supabase email/password login via middleware.

## Data Model

| Table | Purpose | Key Fields |
|---|---|---|
| `day_entries` | One row per date. | `date` (unique), `break_minutes_override` |
| `sessions` | Check-in/check-out pairs per day. | `day_entry_id`, `check_in`, `check_out` |
| `leave_entries` | Leave hours logged against a date. | `date`, `leave_type`, `hours` |
| `holidays` | Recognized paid holidays. | `date`, `label` |
| `weekly_target_settings` | Effective-dated weekly target hours. | `hours`, `effective_date` (unique) |
| `break_duration_settings` | Effective-dated default break duration. | `minutes`, `effective_date` (unique) |
| `standard_workday_hours_settings` | Effective-dated holiday-credit hours. | `hours`, `effective_date` (unique) |
| `leave_banks` | Effective-dated total hours per leave type. | `leave_type`, `total_hours`, `effective_date` (unique per type) |
| `rolling_balance_seed` | One-time starting offset for Rolling Balance. No UI. | `balance`, `note` |
| `physical_year_settings` | **New Sprint 004.** User-entered year date ranges, for Weeks Left in Year. Not effective-dated — looked up by "which range contains this date." | `start_date`, `end_date`, `note` |

All effective-dated tables share the "most recent entry with effective_date <= the date being calculated" lookup rule.

**Critical**: the earliest `weekly_target_settings` entry's `effective_date` determines the first week the whole app computes. As of Sprint 004 this is `2026-01-12`.

## Calculation Rules

Rules 1-12 (Raw Hours through Effective-dating) are unchanged since Sprint 003 — see `planning/DOMAIN.md`.

**New, Sprint 004** (Rules 13-17 in `planning/DOMAIN.md`): ISO 8601 Week Number; Pay Period (two ISO weeks, odd/even paired); Weeks Left in Year (from the matching Physical Year record); the 53-ISO-week-year pairing edge case is a known, accepted limitation.

`src/lib/calculations/isoWeek.ts` and `physicalYear.ts` implement these as standalone, UI-independent, unit-tested modules, same pattern as the rest of `src/lib/calculations/`.

## Screens (v1, updated Sprint 004)

- **Login** — Supabase Auth sign-in.
- **Daily Entry** — first in nav order. Sessions, break override, leave hours. No "Recent Entries" list; reachable via day-row links from the Pay Period Recap.
- **Pay Period Recap** (landing page) — Week 1 + Week 2 stats, Rolling Balance, Leave Remaining, Weeks Left in Year, a clickable 14-day list bound to the period (not a rolling window), Prev/Next period navigation.
- **History** — every fully-elapsed pay period (excludes the current one), ISO odd/even paired.
- **Settings** — weekly target, break duration, standard workday hours (under Paid Holidays), leave banks, holidays, and the new Physical Year list.

## Migration

One-time SQL scripts, run directly by the user. As of Sprint 004, imports run against a LIVE database with real data — strictly additive, no destructive operations, with mandatory regression verification against every previously-proofed number.

## Out of Scope for v1

See `planning/DOMAIN.md`.

============================================================
FILE: docs/VALIDATION.md
============================================================

# Validation

Per the Micro-app rigor profile: cover the happy path and the one or two failure modes that would lose the user's data. Do not over-test.

## Sprint 004 Validation Priorities

- **Highest priority — the live-data regression check**: after the import, the entire already-proofed Sprint 3 weekly table (2026-05-04–2026-06-26) must reproduce EXACTLY. This is checking against real, currently-relied-upon numbers, not a fresh/empty database — treat any mismatch as a stop-everything issue.
- **Pay Period week-extension isolation**: confirm the Pay Period Recap's "compute Week 2 even if it's in the future" logic does not affect the History tab's period list or the Leave Bank remaining figures — those must stay bounded to `today`.
- **ISO week number correctness**: unit test against the verified reference dates in `blueprint.md` (2026-01-12 = week 3, 2026-04-27 = week 18, 2026-05-04 = week 19).
- **Migration spot-checks**: the four worked-example dates in `acceptance.md` (2026-01-20, 2026-02-13, 2026-03-05, 2026-04-09) should be manually verified in the running app against the source CSVs.

## Deferred

- Full manual walkthrough of every imported day is not required — the recomputed weekly table plus spot-checks are sufficient per the Micro-app rigor tier.
- The 53-ISO-week-year edge case and 2026-01-01–01-09 recovery are both explicitly deferred, not validated in this sprint.

============================================================
FILE: planning/STATUS.json
============================================================

{
  "schemaVersion": 1,
  "phase": "apply-pack",
  "sprint": "004-pay-period-recap-and-full-year-import",
  "updated": "2026-07-09"
}
