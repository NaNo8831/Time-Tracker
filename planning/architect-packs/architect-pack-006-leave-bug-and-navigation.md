============================================================
FILE: planning/STATE.md
============================================================

# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-11-05

---

## Current Phase

Sprint 006 Ready — Leave Entry Bug Fix + Navigation Improvements

---

## Current Status

Sprint 005 (weekly Actual fix + week drill-down modal) is complete, committed (`e1810e8`), pushed, and deployed to Vercel (`https://time-tracker-red-six.vercel.app`, GitHub auto-deploy on push to `main`). The earlier planning-doc note saying it was "not yet committed" was stale and is corrected here.

**Sprint 006 is now authorized.** On 2026-11-05 the user reported a bug and three pain points:

- **Bug (root cause found by the Architect, read-only)**: `getDayEntryDetail()` in `src/lib/data/entries.ts` returns early when the date has no `day_entries` row, before ever querying `leave_entries`. A `day_entries` row is only created when a session or break is saved, so a leave-only day shows an empty Leave list (nothing visible, nothing removable) even though the leave rows exist and are counted in the Recap totals. The user, seeing nothing happen, added leave repeatedly on 2026-11-05 until 72 hours accumulated (consistent with nine 8-hour entries). This is also the true root cause of the July "leave not showing on mobile" report — the `ActionForm`/`router.refresh()` fix addressed a symptom that was never a refresh problem (it is harmless and stays).
- **Pain point 1**: the Daily Entry date picker should navigate as soon as a date is chosen — no "Go" button.
- **Pain point 3**: History tab pay-period date ranges should link to that period's Recap.
- **Pain point 4**: drop ISO week numbers from Recap headings; show "Week 1" / "Week 2" of the pay period.
- **Pain point 2 (aligning pay periods to the user's pay stubs)** is deliberately deferred to **Sprint 007**, once the user provides the last two pay stubs. It reverses part of the July ISO-week decision.

---

## Active Sprint

`planning/sprints/006-leave-bug-and-navigation/`

---

## Active Work

Builder: read `planning/sprints/006-leave-bug-and-navigation/` in full, then stop at the code gate — post a concrete file-by-file plan and wait for explicit approval before writing any code.

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

See `planning/DOMAIN.md` and `docs/ARCHITECTURE.md` for full detail. Current shipped scope (through Sprint 005), with Sprint 006 changes noted:

- **Pay Period Recap** (landing page): Week 1 + Week 2 stats (ISO-paired odd/even; **Sprint 006**: headings read "Week 1"/"Week 2" instead of ISO week numbers), Actual/Delta counting every logged day in the week (Sprint 005), Rolling Balance as of the last fully-completed week, Leave Remaining (collapsible) + Weeks Left in Year, Prev/Next navigation, per-week "Actual" modal with hover split and Day column.
- **Physical Year setting**: user-entered start/end date ranges, used for Weeks Left in Year.
- **History tab**: period-level summary rows for fully-elapsed periods. **Sprint 006**: each period's date range links to that period's Recap.
- **Daily Entry**: Break/Session/Leave forms (`ActionForm` refresh). **Sprint 006**: leave entries now load for any date (bug fix); date picker navigates on selection (no Go button).
- **Nav**, **Appearance** (5 themes), **Historical import** (2026-01-12 onward), **Deployment** (Vercel auto-deploy): unchanged.
- Out of scope: employer-specific pay-period anchoring for now (ISO pairing stays until Sprint 007), data before 2026-01-12, reports/analytics, multi-user.

---

## Next Actions

1. Builder executes Sprint 006 from `planning/sprints/006-leave-bug-and-navigation/` only, starting with the mandatory code gate.
2. After Sprint 006 ships, the user supplies the last two pay stubs and the Architect scopes Sprint 007 (pay periods aligned to the stubs).
3. User removes the duplicate 2026-11-05 leave entries through the UI once the bug fix is live (no SQL needed).

---

## Blockers

None for Sprint 006. Sprint 007 is blocked on the user providing two pay stubs.

---

## Watch Items

- **Year-boundary heads-up**: 2026 has 53 ISO weeks. The known, accepted limitation (Rule 17 — odd/even Week 1/Week 2 pairing doesn't alternate cleanly across a 53-week year boundary) will surface around the 2026-12-28 / 2027-01-04 weeks. Sprint 007's stub-aligned fixed-cycle approach would eliminate it; if Sprint 007 slips past late December, revisit.
- The Physical Year list and paid-holiday list may need new entries for the coming year.
- No duplicate guard exists on leave entries (adding the same leave twice is allowed). Not in scope for Sprint 006; consider alongside Sprint 007.
- New earliest tracked Monday: `2026-01-12`. Rolling balance seed: `-7.87`.
- 2026-01-10 and 2026-01-11 are NOT imported as discrete day records — documented, not a bug.
- Process note: all work since 2026-07-14 goes through Architect discussion first, per the user's request.

============================================================
FILE: planning/sprints/006-leave-bug-and-navigation/requirements.md
============================================================

# Sprint 006 Requirements — Leave Entry Bug Fix + Navigation Improvements

## Background

On 2026-11-05 the user reported that a leave entry made that day was not showing on the Daily Entry page and could not be removed, and that somehow 72 hours had been entered. Investigation (read-only) found the cause: `getDayEntryDetail()` returns early when the date has no `day_entries` row, so `leave_entries` is never queried for leave-only days. The entries were saved (and counted in Recap totals) but invisible on the page, so the user kept re-adding them. This is also the real root cause of the July "leave not showing on mobile" report.

The user also asked for three small navigation/labeling improvements. A fourth request (aligning pay periods with pay stubs) is deferred to Sprint 007 pending the stubs.

## Goals

1. **Bug fix**: the Daily Entry page shows (and allows removing) every leave entry for the selected date, regardless of whether any session or break has ever been saved for that date.
2. **Date picker auto-navigates**: choosing a date in the Daily Entry date picker opens that date immediately. Remove the "Go" button.
3. **History links to Recap**: on the History tab, each pay period's date range is a link that opens the Recap for that period (`/?period=<period start>`).
4. **Week labels**: on the Pay Period Recap, week headings read "Week 1" and "Week 2" (followed by the date range) instead of ISO week numbers. This applies to the section headings and the week modal title.

## Non-goals (explicitly out of scope)

- No change to pay-period boundaries or the ISO odd/even pairing — that is Sprint 007, after the user provides two pay stubs.
- No change to Business Rules 1-18 or any calculation (Actual, Delta, Rolling Balance, Leave Bank).
- No deletion or modification of the user's existing leave data by the Builder. The duplicate 2026-11-05 entries are removed by the user through the fixed UI.
- No duplicate-leave guard, no leave editing, no other Daily Entry redesign.
- No change to the History table's columns or contents beyond making the date range a link.

## Users / Roles

Unchanged — single user, Supabase auth.

## Acceptance Summary

See `acceptance.md`. Headline: opening 2026-11-05 in the live app shows the leave entries and each can be removed; picking a date opens it with no Go button; a History period's date range opens the right Recap; Recap headings say "Week 1"/"Week 2".

============================================================
FILE: planning/sprints/006-leave-bug-and-navigation/blueprint.md
============================================================

# Sprint 006 Blueprint — Leave Entry Bug Fix + Navigation Improvements

## 1. Bug fix: `src/lib/data/entries.ts` — `getDayEntryDetail()`

Current behavior: queries `day_entries` for the date; if no row, returns `{ id: null, ..., sessions: [], leaveEntries: [] }` immediately. `leave_entries` is keyed by `date` (not `day_entry_id`), so it must NOT depend on the day record existing.

Required behavior:
- Query `day_entries` (by date, `maybeSingle`) and `leave_entries` (by date) **in parallel**, always.
- Query `sessions` only if a `day_entries` row exists (sessions hang off `day_entry_id`).
- Always return the leave entries.

To make this unit-testable without mocking Supabase, extract the assembly into a pure function (e.g. `buildDayEntryDetail({ date, dayEntry, sessions, leaveEntries })` in the same file or a small sibling module) that maps raw rows to `DayEntryDetail`, where `dayEntry` may be `null`. `getDayEntryDetail()` fetches rows and calls it.

**Audit**: while in this file and in `src/lib/data/`, check for any other place that gates leave (or any other date-keyed table) behind the existence of a `day_entries` row. Report findings at the code gate; do not change anything beyond what's needed to fix the same pattern.

### Tests
- `buildDayEntryDetail` with `dayEntry = null` and one or more leave rows returns `id: null`, empty sessions, and all leave entries mapped (this is the regression test for the reported bug).
- With a `dayEntry` and sessions plus leave, returns everything.
- With `dayEntry = null` and no leave, returns the empty shape.

### Live verification
After deploy (or via the isolated preview technique if auth blocks): open 2026-11-05; the leave entries must appear and each must be removable.

## 2. Date picker auto-navigates

File: `src/app/(app)/entries/[date]/page.tsx` (the `goToDate` form in the header) plus a new small client component, e.g. `src/components/DateJump.tsx`.

- `DateJump` renders `<input type="date" defaultValue={date}>` styled as today. On change, if the value matches `YYYY-MM-DD` and the year is within 2000–2099, call `router.push('/entries/' + value)` (use `useRouter` from `next/navigation`). Ignore empty/partial/out-of-range values (desktop typing changes the value per keystroke; the year guard prevents jumping mid-typing, e.g. year `0002`).
- Remove the "Go" button and the `<form action={goToDate}>`.
- `goToDate` in `src/app/(app)/entries/actions.ts` becomes unused — remove it (no dead code).
- Fifth deliberate client-side component; no shared abstraction needed.

## 3. History links to Recap

File: `src/app/(app)/history/page.tsx`.

- In each period row, render the `{periodStart} – {periodEnd}` range as a `<Link href={`/?period=${period.periodStart}`}>` styled like the existing accent links (`text-[var(--color-accent)] underline`).
- `periodStart` is already the pay period's Week 1 Monday — exactly what the Recap's `?period=` parameter expects. No other History changes.

## 4. Week labels

File: `src/app/(app)/page.tsx`.

- Replace `Week ${isoWeekNumber(week1.weekStart)}` / `Week ${isoWeekNumber(week2.weekStart)}` with the literal titles `Week 1` / `Week 2`. The `weekLabel` passed to `WeekLogModal` is derived from the same title, so the modal heading updates automatically.
- Remove the now-unused `isoWeekNumber` import from `page.tsx` only. Do **not** touch `isoWeek.ts` — `isoWeekNumber` is still used by `payPeriodWeek1Start()` for the odd/even pairing.

## Out of Scope

- Pay-period boundaries / ISO pairing (Sprint 007).
- Any calculation or business-rule change.
- Modifying or deleting existing leave rows (user does this via the UI).
- Duplicate-leave guards, leave editing.

============================================================
FILE: planning/sprints/006-leave-bug-and-navigation/acceptance.md
============================================================

# Sprint 006 Acceptance — Leave Entry Bug Fix + Navigation Improvements

Sprint 006 is complete when all of the following are true:

## Bug fix
- Opening the Daily Entry page for a date that has leave entries but no sessions and no saved break (e.g. 2026-11-05) shows every leave entry, and each can be removed with its Remove button.
- Adding a leave entry on a brand-new date (no prior session/break) shows it in the list immediately after saving.
- New unit tests cover: leave-only day (null day record) returns its leave entries; full day returns sessions + leave; empty day returns the empty shape.
- Any other place that gated date-keyed data behind a `day_entries` row is reported at the code gate (fixed only if it's the same bug pattern).
- The Recap's Actual/Delta/Rolling Balance numbers are unchanged by this sprint (no calculation code touched).

## Date picker
- Choosing a date in the Daily Entry picker opens that date's page immediately; there is no "Go" button.
- Partial or out-of-range values (e.g. mid-typing a year) do not navigate.
- `goToDate` and its form are removed; no dead code remains.

## History links
- Each pay period's date range on the History tab is a link that opens the Recap for exactly that period (Week 1 / Week 2 matching the row's dates).
- The History table is otherwise unchanged (same columns, same numbers).

## Week labels
- The Recap's two week headings read "Week 1 · <date range>" and "Week 2 · <date range>"; the week modal title matches. No ISO week numbers appear anywhere on the Recap.
- Week 1 / Week 2 still correspond to the same dates as before (no boundary change).

## Regression
- Sprint 002–005 acceptance still holds: auth gate, Daily Entry saves refresh via `ActionForm`, themes, mobile layout, week modal, hover tooltip.
- `npm test`, `npx tsc --noEmit`, and `npm run build` pass clean.

============================================================
FILE: planning/sprints/006-leave-bug-and-navigation/handoff-prompt.md
============================================================

# Sprint 006 Builder Handoff Prompt

Read `templates/method/120x-agent-identity.md`, then `AGENTS.md`, then `planning/STATE.md` and `planning/DECISIONS.md`, then this sprint's `requirements.md`, `blueprint.md`, and `acceptance.md` in full.

Act as the Builder. Implement only what's in this sprint's files:

1. Fix `getDayEntryDetail()` so leave entries load for any date, independent of whether a `day_entries` row exists (extract a pure `buildDayEntryDetail` and unit-test the leave-only case). Audit `src/lib/data/` for the same gating pattern and report findings at the code gate.
2. Replace the Daily Entry "Go" form with a `DateJump` client component that navigates on a complete, valid date (year 2000–2099); remove the now-unused `goToDate` action.
3. Make each History period's date range a link to `/?period=<periodStart>`.
4. Change the Recap week headings to "Week 1" / "Week 2" and drop the unused `isoWeekNumber` import from `page.tsx`.

Scope guards — do NOT:
- Change pay-period boundaries, ISO pairing, or `isoWeek.ts`.
- Change any calculation or Business Rule.
- Modify or delete the user's existing leave data; the duplicate 2026-11-05 entries are removed by the user via the UI.
- Add duplicate-leave guards or leave editing.

Stop at the mandatory code gate before writing any code: post your concrete file-by-file plan, scope guards, and acceptance criteria, and wait for explicit approval.

At close: update `planning/STATE.md` and `planning/DECISIONS.md`, refresh `planning/ARCHITECT_BRIEFING.md` (leading with a plain-English "Where things stand"), and mark `planning/STATUS.json` `sprint-closed`. Do not commit to git unless the user explicitly asks.

============================================================
FILE: planning/STATUS.json
============================================================

{
  "schemaVersion": 1,
  "phase": "apply-pack",
  "sprint": "006-leave-bug-and-navigation",
  "updated": "2026-11-05"
}
