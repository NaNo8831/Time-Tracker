============================================================
FILE: planning/STATE.md
============================================================

# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-07-14

---

## Current Phase

Sprint 005 Ready — Weekly Actual Fix + Week Drill-down Modal

---

## Current Status

Sprint 004 is fully complete and live: both SQL scripts ran successfully against the live database, and the user confirmed the imported numbers match expectations. The app is deployed to Vercel with GitHub auto-deploy wired up (every push to `main` ships automatically) at `https://time-tracker-red-six.vercel.app`.

Since Sprint 004 closed, three more rounds of work happened directly with the Builder (outside the normal Architect → pack → sprint flow — noted so it doesn't happen silently again):

1. **Theming**: a 5-preset color/dark-mode picker (Slate, Ocean, Forest, Rose, Dark) in Settings → Appearance, CSS-variable-based, applied instantly and remembered per-device via localStorage. Also fixed the nav bar wrapping awkwardly on the narrowest phone screens.
2. **Mobile/UX bug-fix round** (7 items from live testing): Pay Period Recap stat cards now use a 2-column grid on mobile instead of fully stacking; "Leave Remaining" is now collapsible; the daily table's Total column moved to the far right; Rolling Balance now reflects only the last fully-completed week (previously an in-progress week's partial hours could drag it down misleadingly); the time picker's blank option now sits near 08:00 in the list so the dropdown opens near a typical start time; and a regression test was added proving a leave-only day (no session) already counts correctly toward that week's hours.
3. **Mobile refresh bug**: adding a leave entry (e.g. vacation) on the Daily Entry page wasn't visibly updating on mobile until another save triggered it. First attempt (forcing a `redirect()` after save) didn't fully fix it. Root-caused and fixed properly with a small client component (`ActionForm`) that calls Next.js's `router.refresh()` after each save — verified end-to-end with a live click-and-observe test, not just code review.

All that work is committed and pushed (`main` at `5f4fe8b` as of this pack).

**Sprint 005 is now authorized.** The user found a genuine bug while testing (screenshot evidence): a week's "Actual" hours silently drop any real, already-logged data for days after today — e.g. pre-planned vacation logged for next week showed as 0 actual hours even though the daily table below clearly showed hours recorded for those dates. Sprint 005 fixes this, adds a hover breakdown to make the fix legible, and replaces the always-visible 14-day table at the bottom of the Pay Period Recap page with a per-week pop-out log (triggered by clicking each week's "Actual" card), including a new day-of-week column.

---

## Active Sprint

`planning/sprints/005-weekly-actual-fix-and-week-drilldown/`

---

## Active Work

Builder: read `planning/sprints/005-weekly-actual-fix-and-week-drilldown/` in full, then stop at the code gate — post a concrete file-by-file plan and wait for explicit approval before writing any code.

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

See `planning/DOMAIN.md` and `docs/ARCHITECTURE.md` for full detail. Current shipped scope (Sprint 004 plus the three unplanned rounds after it), with Sprint 005 changes noted:

- **Pay Period Recap** (landing page): Week 1 + Week 2 stats (ISO-week-numbered, odd/even paired). **Sprint 005**: Actual/Delta now count every day in the week's range, including days after today with real logged data — not just days through today. Rolling Balance as of the last fully-completed week (unchanged), Leave Remaining (collapsible) + Weeks Left in Year, Prev/Next period navigation (unlimited range). **Sprint 005**: the always-visible 14-day table at the bottom is removed; clicking a week's "Actual" card instead pops open that week's 7-day log in a modal, with a new Day-of-week column and an hover breakdown on "Actual" itself.
- **Physical Year setting**: user-entered start/end date ranges (list-style, like Paid Holidays), used to compute Weeks Left in Year.
- **History tab**: same period-list format, re-paired by ISO odd/even week, excludes the current in-progress period. **Unchanged by Sprint 005** — no per-week drill-down added here, by explicit user decision.
- **Daily Entry**: "Recent Entries" list removed. Break/Session/Leave forms use a client-side `router.refresh()` after saving so changes always show immediately (mobile included).
- **Nav**: ordered Daily Entry, Recap, History, Settings.
- **Appearance**: 5-preset color/dark-mode picker in Settings, per-device (localStorage), applied instantly.
- **Historical import**: full year to date (2026-01-12 through present), imported and user-verified.
- **Deployment**: live on Vercel, GitHub auto-deploy on push to `main`.
- Out of scope: employer-specific pay-period anchoring (ISO standard only, not configurable), any data before 2026-01-12, reports/analytics beyond what's described here, multi-user, History tab drill-down (explicitly deferred/declined this round).

---

## Next Actions

1. Builder executes Sprint 005 from `planning/sprints/005-weekly-actual-fix-and-week-drilldown/` only, starting with the mandatory code gate.
2. The earliest remaining historical gap is 2026-01-01 through 2026-01-09 (data not available). No action needed unless the user finds additional records later.

---

## Blockers

None.

---

## Watch Items

- New earliest tracked Monday: `2026-01-12`. Rolling balance seed: `-7.87`. See `planning/DECISIONS.md`.
- 2026-01-10 and 2026-01-11 are NOT imported as discrete day records — documented, not a bug.
- Three inferred holiday labels (2026-04-02 "Holy Thursday", 2026-04-03 "Good Friday", 2026-04-06 "Easter Monday") — editable in Settings if wrong.
- ISO week pairing has a known, accepted edge case in 53-ISO-week years — not solved in v1.
- Do not implement employer-specific pay-period anchoring.
- **Sprint 005 specifically**: the fix must not change Rolling Balance's "last fully-completed week" selection logic (orthogonal, already correct) or History tab's numbers (History only shows fully-elapsed periods, which by definition have no "future" days relative to today — this fix should be a visible no-op there; verify as a regression check).
- **Process note**: three rounds of real feature/bugfix work happened directly with the Builder between 2026-07-09 and 2026-07-14 without an Architect session in between — this file and `ARCHITECT_BRIEFING.md` were stale until refreshed 2026-07-14. Going forward the user wants Architect-mode conversations before new Builder work starts.

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
| 2026-07-09 | Landing page becomes the **Pay Period Recap**: Week 1 stats, Week 2 stats, Rolling Balance, Leave Remaining + a new Weeks Left in Year card, then a single day-by-day list for both weeks (visually divided, no longer a separate "Last 14 Days" rolling section) with each day clickable. Clicking a day navigates to the existing `/entries/{date}` page — explicitly NOT an in-page modal, to avoid introducing the app's first client-side interactive UI pattern for this. | User wants an overview-plus-drill-down flow; navigating to the already-built Daily Entry page reuses everything instead of building new UI infrastructure. | The old rolling "Last 14 Days" table is retired entirely — it was redundant with the new period-bound day list. Requires extending `buildWeeklyRecap()` to compute weeks beyond `today` when a requested period's Week 2 hasn't happened yet. **Superseded in part by Sprint 005**: the day-by-day list is no longer always-visible — see the 2026-07-14 decision below. Day rows still navigate to `/entries/{date}`, unchanged. |
| 2026-07-09 | **Weeks Left in Year** is computed from a new user-entered **Physical Year** setting (start date + end date), NOT from a plain calendar-year or ISO-year boundary. | User: "the physical year does not align with the calendar weeks" — their tracking year has its own real start/end that a naive Dec 31 cutoff would get wrong. | New `physical_year_settings` table (list-style, like Paid Holidays: date-range records, no effective-dating). Weeks Left = ISO weeks from today's week through whichever record's range contains today; blank if none matches. |
| 2026-07-09 | History tab excludes the current in-progress pay period entirely (only past, fully-elapsed periods are listed), and its period-pairing switches from "chronological since tracking started" to the same ISO odd/even rule as the landing page. | The current period is now shown live on the landing page — showing it twice is redundant, and the old chronological-pairing logic doesn't match the new ISO-anchored definition. | `src/lib/calculations/periods.ts`'s old naive `chunkWeeksIntoPeriods` is replaced with ISO-based grouping. Some already-computed May-June period pairings may regroup under the new rule — expected, not a bug (see acceptance.md for the exact recomputed pairing). |
| 2026-07-09 | The user shared four new real CSV exports covering 2026-01-10 through 2026-05-01. Parsed cell-by-cell using the exact same mapping rules validated in Sprint 003 (ADJ code + adjacent number; `x` flows into Break, others add to hours). One file (`March_April 11-14.csv`) had a stray leading data row (`Mar-9`, a zero day) positioned before its own header block — recovered by treating it as real data for that date, since the main sequential block skips directly from Mar-8 to Mar-10 otherwise. | Real data inspection, same rigor as Sprint 003. | All four saved verbatim to `references/source-app/`. |
| 2026-07-09 | The earliest fully-reconstructable Monday-Sunday week is **2026-01-12** (2026-01-10 Saturday has 4.25 real hours, but 2026-01-05–01-09 are not in any provided CSV, so that partial week cannot be safely imported). The three settings' (`weekly_target_settings`, `break_duration_settings`, `standard_workday_hours_settings`) `effective_date` moves from `2026-05-04` back to `2026-01-12` — their VALUES are unchanged (32 hrs, 0 min default break, 6.4 hrs standard workday all hold constant from January through the already-verified window), confirmed by real data across the whole span, so this is a single `UPDATE` per table, not a new dated row. | The 4-day-week era (flagged as an open question after Sprint 003) turns out not to apply to any of this data — the "5-day week, 6.4 hrs standard workday" rate was already in effect by January 2026. | Resolves the open question logged in `planning/QUESTIONS.md` after Sprint 003. If a 4-day-week era exists at all, it predates 2026-01-10 and remains unconfirmed. |
| 2026-07-09 | `rolling_balance_seed` updates from `-27.67` (representing the balance before 2026-05-04) to `-7.87` (representing the balance before 2026-01-12), independently derived and verified by computing forward through all 15 intervening weeks and confirming it reproduces `-25.32` (the sheet's own rollover value before 2026-04-27) and then exactly `-27.67` at the 2026-05-04 boundary — the figure already live and user-verified. | Mathematical proof that extending history backward does not disturb any already-proofed number. | Single `UPDATE` on the existing `rolling_balance_seed` row (or an equivalent insert-then-supersede, per existing "latest row wins" design) — not a fresh insert requiring app changes. |
| 2026-07-09 | Sprint 004's two SQL scripts ran successfully against the live database; user confirmed the imported numbers are correct. Sprint 004 code committed and pushed to `main`. | Closes out Sprint 004 for real (planning docs had drifted and said otherwise until 2026-07-14's refresh). | `planning/STATUS.json` marked `sprint-closed`; no further action needed on the Sprint 004 import. |
| 2026-07-09 | Deployed to Vercel with GitHub auto-deploy on push to `main` (project + env vars were already partially set up before this session; the missing `SUPABASE_SERVICE_ROLE_KEY` was added). No OAuth/magic-link/password-reset flows exist, so Supabase's Redirect URL allow-list did not need updating for the new domain. | User asked to get the app ready for broader/mobile testing. | Every future push to `main` ships automatically — no separate deploy step. |
| 2026-07-09 | Added a 5-preset color/dark-mode picker (Slate default, Ocean, Forest, Rose, Dark) via CSS custom properties on a `data-theme` attribute, switched instantly by a small client component and remembered per-device in `localStorage` — not synced through Supabase. | User asked for dark mode / color options; single-user personal app, so per-device is sufficient and avoids a server round-trip for something purely cosmetic. | First deliberate introduction of client-side interactivity beyond the earlier collapsible-section pattern. Full palette documented in the (gitignored, local-only) `docs/THEMING.md` for easy tweaking. |
| 2026-07-09 | Rolling Balance shown on the Pay Period Recap page now reflects the last **fully completed** week, never an in-progress one. The underlying per-week rolling-balance math (used by History, Leave Bank, etc.) is unchanged — this only changes which week's value the Recap page reads for its headline Rolling Balance figure. | User feedback: an in-progress week's partial actual hours (real hours logged so far vs. a full-week target) made the balance look artificially bad mid-week, "based on future work." | `buildPayPeriodRecap()` picks week2's balance if week2 is complete, else week1's if week1 is complete, else the prior week's (or the raw seed if week1 is the first tracked week). Does NOT change what "Actual" or "Delta" mean for a week — see Sprint 005 below for that. |
| 2026-07-09 | Daily Entry's Break/Session/Leave forms now go through a small client wrapper (`ActionForm`) that calls Next.js's `router.refresh()` after the server action completes, instead of relying on `redirect()` + `revalidatePath()` alone. | A real bug: on mobile, adding a leave entry wasn't visibly updating until a separate save (e.g. the Break form) triggered a refresh. The `redirect()`-based fix didn't fully resolve it; `router.refresh()` is the documented, guaranteed-correct API for "refetch this page's server data now," and was verified with a live, non-Supabase click-and-observe test before shipping. | Second deliberate introduction of client-side interactivity (after the theme picker and collapsible section). Pattern is now available for reuse wherever a server-action form needs a guaranteed-fresh re-render. |
| 2026-07-14 | **Bug found and fixed**: `buildWeeklyRecap()`'s day-loop had a `date > today: stop` cutoff that silently excluded any real, already-logged data (sessions or leave) for days after today — e.g. pre-planned vacation logged a week in advance showed as 0 actual hours for that week even though it was genuinely recorded. Business Rule 6 ("Weekly Actual Hours = sum of Work Hours for each day in the week") never actually said "only through today" — the cutoff was an unwritten, incorrect implementation assumption that real usage (pre-logging future leave) exposed as wrong. User caught this via a screenshot showing the daily table had real hours for dates the weekly card was ignoring. | The written rule was already correct; the code's defensive early-stop was the bug. Days genuinely without data still naturally contribute 0 — this fix only changes anything when real data exists for a future date. | The day-loop now sums all 7 days unconditionally. Only affects the current/future weeks reachable via a period's `week1`/`week2` (or `extendThroughWeek`) — History tab is unaffected by definition (only shows fully-elapsed periods, which never have "future" days relative to today). Rolling Balance's last-completed-week selection (2026-07-09 decision above) is unaffected — it's a separate, calendar-based gate. |
| 2026-07-14 | The Pay Period Recap's always-visible 14-day table (introduced Sprint 004) is retired. In its place, each week's "Actual" stat card becomes clickable and opens a modal showing that week's own 7-day log (Date, Day-of-week, Raw, Break, Other, Total), reusing the existing weekend-highlight styling; the "Actual" card also gains a hover tooltip showing hours-through-today vs. hours-logged-for-later-this-week, with the later portion broken down by leave type (v/s/p). This reverses part of the 2026-07-09 "no modal" decision — deliberately, this time, for the week-level view only (day rows still navigate to `/entries/{date}`, not a modal). | User: seeing the whole 14-day table always on-screen was less useful than being able to drill into just the week you care about, especially once "Actual" itself needed a way to show its through-today/later split. | Third deliberate client-side component in the app (after the theme picker and `ActionForm`). History tab is explicitly NOT getting this drill-down — user confirmed it should stay as-is; Prev/Next on the Recap page already lets you reach any past period, and the modal comes along automatically since it's part of the same page. |

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
| Sprint 004's historical import ran against a LIVE database with real, user-verified data. | Medium | High | Import was strictly additive; the only mutations to existing rows were mathematically pre-verified; user confirmed the imported numbers are correct after running both scripts. | Resolved (2026-07-09) |
| Extending `buildWeeklyRecap()` to compute weeks beyond `today` could, if implemented carelessly, start counting future/not-yet-happened weeks into the Rolling Balance shown elsewhere. | Medium | Medium | The extension is scoped to the Pay Period Recap's own period-bounded view only; unit tests cover the isolation. | Resolved |
| 2026-01-10/11 (4.25 real hours on Jan-10) are excluded from tracked history since the rest of that Monday-Sunday week isn't documented anywhere. | Low | Low | Documented clearly; does not affect Rolling Balance correctness (verified). | Open — accepted, low stakes |
| 53-ISO-week years may not pair cleanly under the Week1/Week2 odd/even rule at the year boundary. | Low | Low | Documented as a known, accepted limitation. Not solved in v1. | Open — accepted for v1 |
| Three rounds of real feature/bugfix work happened directly with the Builder between 2026-07-09 and 2026-07-14 without an Architect session in between, leaving `STATE.md` and `ARCHITECT_BRIEFING.md` stale relative to reality. | Low | Low | User caught it and asked for a planning-doc refresh (done 2026-07-14); going forward, the user wants Architect-mode conversations before new Builder work starts. | Resolved for now — process reminder |
| **New**: Weekly Actual Hours silently excluded real, already-logged data for days after today (Rule 6's day-loop had an unwritten `date > today` cutoff that contradicted the actual written rule). Found via user testing with pre-logged future vacation. | Was Medium (already shipped, affecting every week the user had pre-logged anything into) | Medium — no data was lost or corrupted, but the displayed Actual/Delta was wrong for any week with future-dated entries | Sprint 005 removes the cutoff; unit tests added proving a future day with real data now counts, and proving History/Rolling-Balance are unaffected. | Open — addressed in Sprint 005 |
| **New**: Sprint 005 introduces a third client-side interactive component (a modal), after the theme picker and `ActionForm`. No shared modal/dialog pattern exists yet — each component has been built standalone. | Low | Low | Fine for now at this scale (Micro-app tier); worth a shared pattern only if a fourth distinct interactive component appears with a different shape. | Open — accepted, watch for a 4th case |

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
| Should the recap support a user-configurable pay-period cycle? | User/Architect | N/A | Resolved | User explicitly chose the ISO 8601 standard, not a configurable/employer anchor — "it's a tracking metric." Implemented in Sprint 004. |
| Does the Jan-April 2026 "4-day week" era need its own settings values? | User/Architect | Sprint 004 | Resolved | No — real data confirms the "5-day week, 6.4 hrs standard workday, 0-min break default" rate was already in effect throughout. |
| Should 2026-01-01 through 2026-01-09 ever be imported, if the user locates those records later? | User | Whenever found | Open | Currently excluded — no source data available. Low priority. |
| **New**: should History tab ever get the same per-week drill-down modal as the Pay Period Recap? | User | N/A | Resolved | No, explicitly declined in the Sprint 005 discussion — Prev/Next on the Recap page already covers browsing past periods, and History's summary-row format is intentionally more compact. Revisit only if the user asks again. |

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
| `planning/sprints/004-pay-period-recap-and-full-year-import/acceptance.md` | Sprint 004 acceptance criteria. | Created by Architect Pack 004 |
| `planning/sprints/004-pay-period-recap-and-full-year-import/handoff-prompt.md` | Sprint 004 Builder handoff prompt. | Created by Architect Pack 004 |
| `docs/ARCHITECTURE.md` | Durable architecture reference. | Updated by Architect Pack 004, 005 |
| `docs/VALIDATION.md` | Validation priorities. | Updated by Architect Pack 004, 005 |
| `supabase/schema-migration-004-physical-year.sql`, `supabase/migration-004-import-2026-01-12-to-2026-05-01.sql` | Sprint 004 SQL, run and verified 2026-07-09. | Run against production |

## Post-Sprint-004 Deliverables (2026-07-09, direct Builder work — no sprint folder)

| File | Purpose | Status |
|---|---|---|
| `src/components/ThemePicker.tsx`, `src/lib/theme.ts` | Client-side theme preset picker (5 presets incl. dark). | Live |
| `src/app/globals.css` | CSS custom properties per `[data-theme]`, used app-wide instead of hardcoded Tailwind colors. | Live |
| `docs/THEMING.md` | Local-only (gitignored) guide to editing the color palette. | Not in repo — local reference only |
| `src/components/CollapsibleSection.tsx` | Generic collapsible section wrapper (used for Leave Remaining). | Live |
| `src/components/ActionForm.tsx` | Client wrapper that calls `router.refresh()` after a server action completes; fixes the mobile leave-entry refresh bug. | Live |
| `.claude/launch.json` | Added a second dev-server config (`time-tracker-dev-preview`, port 3100) for isolated QA without disturbing the user's own running dev server. | Local tooling, not app code |

## Sprint 005 Deliverables

| File | Purpose | Status |
|---|---|---|
| `planning/sprints/005-weekly-actual-fix-and-week-drilldown/requirements.md` | Sprint 005 requirements. | Created by Architect Pack 005 |
| `planning/sprints/005-weekly-actual-fix-and-week-drilldown/blueprint.md` | Bug-fix + modal technical design. | Created by Architect Pack 005 |
| `planning/sprints/005-weekly-actual-fix-and-week-drilldown/acceptance.md` | Sprint 005 acceptance criteria. | Created by Architect Pack 005 |
| `planning/sprints/005-weekly-actual-fix-and-week-drilldown/handoff-prompt.md` | Sprint 005 Builder handoff prompt. | Created by Architect Pack 005 |

============================================================
FILE: planning/sprints/005-weekly-actual-fix-and-week-drilldown/requirements.md
============================================================

# Sprint 005 Requirements — Weekly Actual Fix + Week Drill-down Modal

## Background

The user found a real bug while testing on mobile: they had pre-logged vacation leave for several days later in the current week and for an entire week further ahead, but the Pay Period Recap's "Actual" card for those weeks showed hours far lower than reality (one week showed 6.25 hrs when 23.75 hrs were genuinely logged; another showed 0.00 hrs when 40 hrs were genuinely logged). The daily table at the bottom of the same page correctly showed the real data — the bug is isolated to the weekly aggregation, which stops summing at "today" even though real data can and does exist for dates after today (the Daily Entry page has always allowed picking any date, past or future).

While fixing this, the user also asked for two related UI changes: a smarter hover tooltip on "Actual" that explains the split between hours already behind you and hours already logged ahead, and replacing the always-visible 14-day table at the bottom of the page with a per-week pop-out log (triggered by clicking each week's "Actual" card), which also gains a day-of-week column.

## Goals

1. **Fix**: Weekly Actual Hours (and therefore Delta) must sum every day's real logged Work Hours for the whole week, regardless of whether that day is before, on, or after today.
2. **Hover tooltip on "Actual"**: shows hours-through-today vs. hours-already-logged-for-later-this-week, with the later portion broken down by leave type (vacation/sick/paternity, shown as v/s/p for brevity).
3. **Week drill-down modal**: clicking a week's "Actual" card opens a modal with that week's 7-day log (Date, Day-of-week, Raw, Break, Other, Total columns), replacing the always-visible 14-day table at the bottom of the page.
4. **Day-of-week column**: add a "Day" column (short weekday name, e.g. "Mon") to the daily log table inside the new modal.

## Non-goals (explicitly out of scope this sprint)

- No change to the History tab — it stays exactly as it is today (period-level summary rows only, no per-week drill-down). The user explicitly declined adding this there; Prev/Next on the Recap page already covers browsing to any past period, and the modal comes along automatically since it's part of the same page.
- No change to Rolling Balance's "last fully-completed week" selection logic (2026-07-09 decision) — that fix is separate and orthogonal, and must keep working exactly as it does today.
- No change to Business Rules 1-5, 7-17. Rule 6's wording is unchanged (it was already correct) — only the code's incorrect implementation of it changes.
- No new "projected" or "imputed" (estimated/guessed) figures anywhere. Every number this sprint touches must be built strictly from real, already-logged data. (Earlier discussion floated a pace-projection idea; the user's screenshot revealed the real issue was a data-exclusion bug, not a need for estimation, and that idea was dropped.)

## Users / Roles

Unchanged — single user, gated by Supabase auth.

## Acceptance Summary

See `acceptance.md` for the full checklist. Headline checks: the two real cases from the user's screenshot (2026-07-15/16/17 data appearing in that week's Actual; 2026-07-20–24 data appearing in that week's Actual) must resolve correctly once the fix ships; History tab numbers must be unchanged (regression check); Rolling Balance must be unchanged (regression check); the modal must open from either week's "Actual" card and show the correct 7 rows with a Day column; the bottom-of-page 14-day table must be gone.

============================================================
FILE: planning/sprints/005-weekly-actual-fix-and-week-drilldown/blueprint.md
============================================================

# Sprint 005 Blueprint — Weekly Actual Fix + Week Drill-down Modal

## 1. The fix: `src/lib/calculations/recap.ts`

Current (buggy) day loop inside `buildWeeklyRecap()`:

```ts
const weeklyActuals = weekStarts.map((weekStart) => {
  let total = 0;
  for (let offset = 0; offset < 7; offset += 1) {
    const date = addDays(weekStart, offset);
    if (date > input.today) break; // <-- the bug: silently drops real future data
    total += calcWorkHours({ date, sessions: ..., leaveEntries: ..., ... });
  }
  return total;
});
```

Fixed:

```ts
const weeklyActuals = weekStarts.map((weekStart) => {
  let total = 0;
  for (let offset = 0; offset < 7; offset += 1) {
    const date = addDays(weekStart, offset);
    total += calcWorkHours({ date, sessions: ..., leaveEntries: ..., ... });
  }
  return total;
});
```

That's the entire fix to the calculation engine — one line removed. `calcWorkHours` (via `workHours()`) already correctly returns 0 for a day with no sessions and no leave entries, so this only changes the result when real data exists for a date after `today`.

**Do not touch**: the week-level loop bound (`endWeekMonday` / `weekStarts` generation) — that governs how many WEEKS exist in the array at all (still bounded by `today` or `extendThroughWeek`), which is correct and unrelated to this bug. Do not touch `buildPayPeriodRecap()`'s "last fully-completed week" Rolling Balance selection (`week2Complete` / `week1Complete` checks) — that's a separate, calendar-based gate that stays exactly as-is.

### Tests to add (`tests/calculations/recap.test.ts`)

- A day after `today` but within the *current* week, with real logged data (e.g. a `leaveHoursByDate` entry), now counts toward that week's `actualHours`/`delta`. Assert the value before the fix would have been wrong (i.e. don't just assert the new value — assert it reflects the future day's contribution).
- A day after `today` within a week reached via `extendThroughWeek`, with real logged data, now counts (extends the existing "extendThroughWeek includes a future week with zero actual hours" test — add a sibling test with actual data present instead of empty).
- Existing tests should all still pass unmodified (none of them have data logged on a future date within their fixtures, so none should need behavior changes — verify this rather than assume it).

### Regression checks

- History tab (`groupWeeksIntoPayPeriods` + the History page) must show identical numbers before/after — it only ever displays fully-elapsed periods (`payPeriodWeek1Start(today)` is always excluded), so every week it shows has no "future" days relative to today by construction. Confirm with a spot-check, no code change expected there.
- `buildPayPeriodRecap()`'s Rolling Balance value must be unchanged for the same inputs — it depends on `addDays(week.weekStart, 6) < today`, not on `actualHours`, so it's unaffected by this fix. Confirm with the existing `payPeriodRecap.test.ts` suite (all should still pass unmodified).

## 2. Hover tooltip: "Actual" through-today vs. later-this-week split

New pure function, e.g. in `src/lib/calculations/dailyBreakdown.ts` (reuses `DailyBreakdownRow`, already computed for the daily table):

```ts
export interface WeekActualSplit {
  throughTodayHours: number;
  laterThisWeekHours: number;
  laterThisWeekByType: Record<LeaveType, number>;
}

export function splitWeekActual(rows: DailyBreakdownRow[], today: IsoDate): WeekActualSplit {
  let throughToday = 0;
  let later = 0;
  const laterByType = { vacation: 0, sick: 0, paternity: 0 } as Record<LeaveType, number>;

  for (const row of rows) {
    if (row.date <= today) {
      throughToday += row.paidHours;
    } else {
      later += row.paidHours;
      for (const type of ["vacation", "sick", "paternity"] as LeaveType[]) {
        laterByType[type] += row.leaveHoursByType[type];
      }
    }
  }

  return { throughTodayHours: throughToday, laterThisWeekHours: later, laterThisWeekByType: laterByType };
}
```

Takes exactly one week's 7 `DailyBreakdownRow[]` (already fetched server-side via `getDailyHistoryRows`, no new data source needed) plus `today`. `throughTodayHours + laterThisWeekHours` must equal that week's `actualHours` from `buildPayPeriodRecap()` (add this as an acceptance check — they're computed via two different code paths that happen to implement the same Rule 5/6 math, same pattern already relied on since Sprint 004 for the daily table vs. weekly totals).

Tooltip text, built in the page component (same style as the existing `othersBreakdownTitle` helper): something like `"6.25 hrs through Jul 14 · 17.5 hrs already logged for later this week (v: 8.0 · s: 4.0 · p: 0.0)"`. Use the short codes `v`/`s`/`p` per the user's request. Omit the later-segment breakdown entirely if `laterThisWeekHours` is 0 (nothing to show).

### Tests to add (`tests/calculations/dailyBreakdown.test.ts` or a new `weekActualSplit.test.ts`)

- Splits a mixed week (some days ≤ today with sessions, some days > today with leave entries of different types) correctly into the two totals and the type breakdown.
- A week entirely ≤ today: `laterThisWeekHours` is 0, `laterThisWeekByType` all zero.
- A week entirely > today (like the user's Week 30 example): `throughTodayHours` is 0, everything in `laterThisWeekHours`/`laterThisWeekByType`.

## 3. Week drill-down modal

New client component, e.g. `src/components/WeekLogModal.tsx`:

```tsx
"use client";
// Takes: week (WeekSummary), rows (that week's 7 DailyBreakdownRow[]), a trigger render (the Actual StatCard).
// Local useState for open/closed. Renders the trigger as a clickable element;
// when open, renders a fixed-position overlay + centered panel with the
// Date/Day/Raw/Break/Other/Total table (7 rows), reusing the existing
// weekend-highlight (isWeekend) styling and each date still linking to
// /entries/{date}. Dismiss via backdrop click, Escape key, and a close button.
```

No new npm dependency needed — a simple fixed-overlay `<div>` is sufficient at this scale (Micro-app tier).

### Wiring on the Recap page (`src/app/(app)/page.tsx`)

- Keep fetching `historyRows` via `getDailyHistoryRows(week1Start, addDays(week1Start, 13))` exactly as today (14 rows, no new query).
- Split: `const week1Rows = historyRows.slice(0, 7); const week2Rows = historyRows.slice(7, 14);`
- Remove the always-visible bottom table section (the whole "Date/Raw/Break/Other/Total" block currently rendered unconditionally) — delete it entirely.
- In `WeekSection`, wrap the "Actual" `StatCard` in `WeekLogModal`, passing that week's 7 rows and computing the hover title via `splitWeekActual(rows, today)`.
- Target/Delta cards are NOT clickable — only Actual opens the modal, per the user's explicit scoping.

## 4. Day-of-week column

Add a "Day" column to the modal's table, between Date and Raw. Compute via the same UTC-anchored pattern already used elsewhere in this codebase (e.g. `formatWeekRange`):

```ts
function dayOfWeek(date: IsoDate): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}
```

Applies only inside the new modal's table — there is no other daily-row table in the app (History shows period summaries, Daily Entry has no table, Settings has no table).

## Out of Scope

- History tab: no changes.
- Any change to `buildPayPeriodRecap()`'s Rolling Balance selection logic.
- Any change to Business Rules 1-5, 7-17.
- Any projection/estimation of hours not yet logged — everything shown must be real, already-saved data.

============================================================
FILE: planning/sprints/005-weekly-actual-fix-and-week-drilldown/acceptance.md
============================================================

# Sprint 005 Acceptance — Weekly Actual Fix + Week Drill-down Modal

Sprint 005 is complete when all of the following are true:

## The Fix

- For a week that has real logged data (sessions or leave) on a date after today, that week's "Actual" and "Delta" cards now include it. Spot-check against the user's own reported case: with data logged on 2026-07-15/16/17 and 2026-07-20 through 07-24, the corresponding weeks' Actual figures reflect all of it, not just the portion through today.
- `throughTodayHours + laterThisWeekHours` (from `splitWeekActual`) equals that week's `actualHours` from `buildPayPeriodRecap()`, exactly, for the same week.
- History tab's numbers are unchanged before/after the fix (spot-check at least one already-elapsed period).
- Rolling Balance shown on the Recap page is unchanged before/after the fix for the same period/today combination (it depends only on which weeks are calendar-complete, not on how much of a week's data is logged).

## Hover Tooltip

- Hovering a week's "Actual" card shows the through-today / later-this-week split, with the later segment broken down by `v`/`s`/`p` when non-zero.
- A week entirely in the past (no "later" hours) shows a sensible tooltip with nothing to break down (no empty/awkward "0.0 · 0.0 · 0.0" clutter — omit the breakdown when there's nothing later).

## Week Drill-down Modal

- Clicking either week's "Actual" card opens a modal showing that week's 7 daily rows: Date, Day, Raw, Break, Other, Total.
- The Day column shows the correct short weekday name for each date (e.g. 2026-07-13 → "Mon").
- Weekend rows are still visually highlighted, matching the existing style.
- Each date is still a link to `/entries/{date}`.
- The modal can be dismissed (backdrop click, Escape, and/or a close button) and reopened.
- This works identically for the current period and for any past period reached via Prev/Next on the Recap page.
- The always-visible 14-day table that used to sit at the bottom of the Recap page is gone — nothing renders there now except what's already specified (stat cards, Rolling Balance, Leave Remaining, Weeks Left in Year).

## Non-goals confirmed untouched

- History tab: pixel-for-pixel unchanged, still period-level rows only, no modal.
- `buildPayPeriodRecap()`'s Rolling Balance "last fully-completed week" logic: unchanged, all existing `payPeriodRecap.test.ts` tests pass unmodified.
- Business Rules 1-5, 7-17: unchanged.

## Regression

- All Sprint 002-004 acceptance criteria still hold: auth gate, session overlap/duplicate rejection, duplicate-effective-date rejection, no letter codes or raw sheet math exposed, mobile layout/theme/`ActionForm` refresh behavior from the post-Sprint-004 rounds all still work.
- Unit tests added/updated for the day-loop fix and `splitWeekActual`; `npm test`, `npx tsc --noEmit`, and `npm run build` all pass clean.

============================================================
FILE: planning/sprints/005-weekly-actual-fix-and-week-drilldown/handoff-prompt.md
============================================================

# Sprint 005 Builder Handoff Prompt

Read `templates/method/120x-agent-identity.md`, then `AGENTS.md`, then `planning/STATE.md` and `planning/DECISIONS.md`, then this sprint's `requirements.md`, `blueprint.md`, and `acceptance.md` in full.

Act as the Builder. Implement only what's described in this sprint's files:

1. Fix `buildWeeklyRecap()`'s day loop in `src/lib/calculations/recap.ts` — remove the `date > today: stop` cutoff so every day in a week's range contributes its real logged Work Hours, regardless of past/future. Add regression tests proving a future day with real data now counts (both for the natural current week and for a week reached via `extendThroughWeek`), and confirm all existing tests still pass unmodified.
2. Add `splitWeekActual()` (or your preferred name matching existing conventions) to compute the through-today / later-this-week split with a v/s/p breakdown, consuming the same `DailyBreakdownRow[]` already fetched for the daily table — no new data source. Add unit tests.
3. Build the week drill-down modal (`WeekLogModal` or similar) as a small client component, wired to each week's "Actual" `StatCard` on the Pay Period Recap page. Remove the always-visible 14-day table at the bottom of the page entirely. Add a Day-of-week column to the modal's table.
4. Wire the hover tooltip onto each week's "Actual" card using `splitWeekActual()`'s output.

Scope guards — do NOT:
- Touch the History tab in any way.
- Touch `buildPayPeriodRecap()`'s Rolling Balance "last fully-completed week" selection logic.
- Change Business Rules 1-5 or 7-17, or introduce any projected/estimated (non-real) figures anywhere.
- Add the drill-down modal anywhere except the Pay Period Recap page's two "Actual" cards.

Stop at the mandatory code gate before writing any code: post your concrete file-by-file plan, scope guards, and acceptance criteria, and wait for explicit approval.

At close: update `planning/STATE.md` and `planning/DECISIONS.md`, refresh `planning/ARCHITECT_BRIEFING.md` (leading with a plain-English "Where things stand"), and mark `planning/STATUS.json` `sprint-closed`. Do not commit to git unless the user explicitly asks.

============================================================
FILE: docs/ARCHITECTURE.md
============================================================

# Architecture

Time Tracker v1 — architecture defined by the Architect Layer across Packs 001-005.

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
| `physical_year_settings` | User-entered year date ranges, for Weeks Left in Year. Not effective-dated — looked up by "which range contains this date." | `start_date`, `end_date`, `note` |

All effective-dated tables share the "most recent entry with effective_date <= the date being calculated" lookup rule.

**Critical**: the earliest `weekly_target_settings` entry's `effective_date` determines the first week the whole app computes. As of Sprint 004 this is `2026-01-12`.

**Important**: `day_entries`/`sessions`/`leave_entries` are not restricted to past dates — a user can and does log data (especially leave) for future dates. All weekly/daily calculations must treat "future" purely as "no data yet, naturally contributes 0," never as an artificial hard stop (Sprint 005 fixed a bug where the weekly aggregation incorrectly did the latter).

## Calculation Rules

Rules 1-5, 7-17 unchanged since Sprint 004 — see `planning/DOMAIN.md`. **Rule 6 (Sprint 005)**: Weekly Actual Hours sums Work Hours for all 7 days in a week regardless of the day's relation to "today" — the rule's wording never said otherwise; a day-loop bug that stopped at today was fixed.

`src/lib/calculations/isoWeek.ts` and `physicalYear.ts` implement Sprint 004's rules as standalone, UI-independent, unit-tested modules, same pattern as the rest of `src/lib/calculations/`. Sprint 005 adds `splitWeekActual()` (in `dailyBreakdown.ts` or similar) as a presentation-only split of the same Rule 5/6 total — not a new business rule.

## Screens (v1, updated Sprint 005)

- **Login** — Supabase Auth sign-in.
- **Daily Entry** — first in nav order. Sessions, break override, leave hours, any date past or future. No "Recent Entries" list. Forms refresh via a client-side `router.refresh()` after saving.
- **Pay Period Recap** (landing page) — Week 1 + Week 2 stats (Actual now correctly includes all logged days, not just through-today), Rolling Balance, Leave Remaining (collapsible), Weeks Left in Year, Prev/Next period navigation. **Sprint 005**: no more always-visible 14-day table; each week's "Actual" card opens a modal with that week's 7-day log (with a Day-of-week column) and carries a hover tooltip splitting hours through-today vs. later-this-week (by leave type).
- **History** — every fully-elapsed pay period (excludes the current one), ISO odd/even paired, period-level summary rows only — no drill-down (unchanged by Sprint 005, by explicit decision).
- **Settings** — weekly target, break duration, standard workday hours (under Paid Holidays), leave banks, holidays, Physical Year list, and Appearance (5 color/dark-mode presets).

## Client-side Interactivity

The app is server-rendered by default (Server Components + Server Actions, no client-side data fetching). Three deliberate, scoped exceptions exist so far: the theme picker (`ThemePicker.tsx`), the collapsible section (`CollapsibleSection.tsx`), the form-refresh wrapper (`ActionForm.tsx`), and now (Sprint 005) the week drill-down modal. Each is a small, single-purpose client component — no shared modal/dialog abstraction exists yet; introduce one only if a fourth, differently-shaped case appears.

## Migration

One-time SQL scripts, run directly by the user. Sprint 004's import ran against a LIVE database with real data — strictly additive, no destructive operations, with mandatory regression verification against every previously-proofed number. Completed and verified 2026-07-09.

## Deployment

Live on Vercel (`https://time-tracker-red-six.vercel.app`), GitHub auto-deploy on push to `main`. No OAuth/magic-link/password-reset flows exist, so no redirect-URL allow-list configuration was needed for the deployed domain.

## Out of Scope for v1

See `planning/DOMAIN.md`.

============================================================
FILE: docs/VALIDATION.md
============================================================

# Validation

Per the Micro-app rigor profile: cover the happy path and the one or two failure modes that would lose the user's data. Do not over-test.

## Sprint 005 Validation Priorities

- **Highest priority — the bug's own regression check**: a day after today with real logged data (sessions or leave) must count toward that week's Actual/Delta. Spot-check against the user's own reported case (2026-07-15/16/17 and 2026-07-20–07-24).
- **Isolation checks**: History tab numbers unchanged; Rolling Balance unchanged for the same inputs. Both should be provable by running the existing test suites unmodified plus one live spot-check each.
- **Split-total identity**: `splitWeekActual()`'s two totals must sum to exactly the week's `actualHours` — add this as an explicit test, not just a manual check.
- **Modal behavior**: opens from either week's Actual card, shows the right 7 rows with a working Day column, dismissible, and works the same whether viewing the current period or one reached via Prev/Next.

## Sprint 004 Validation Priorities (carried forward, already complete)

- The live-data regression check (2026-05-04–2026-06-26 reproduced exactly) — done, user-verified 2026-07-09.
- Pay Period week-extension isolation — done.
- ISO week number correctness — done, unit-tested.
- Migration spot-checks — done, user-verified.

## Deferred

- Full manual walkthrough of every day is not required — targeted spot-checks plus the automated suite are sufficient per the Micro-app rigor tier.
- The 53-ISO-week-year edge case and 2026-01-01–01-09 recovery remain explicitly deferred.
- History tab per-week drill-down: explicitly out of scope, not validated.

============================================================
FILE: planning/STATUS.json
============================================================

{
  "schemaVersion": 1,
  "phase": "apply-pack",
  "sprint": "005-weekly-actual-fix-and-week-drilldown",
  "updated": "2026-07-14"
}
