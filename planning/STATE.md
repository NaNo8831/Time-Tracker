# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-11-05

---

## Current Phase

Sprint 006 Complete — Leave Entry Bug Fix + Navigation Improvements

---

## Current Status

Sprint 005 (weekly Actual fix + week drill-down modal) is complete, committed (`e1810e8`), pushed, and deployed to Vercel (`https://time-tracker-red-six.vercel.app`, GitHub auto-deploy on push to `main`). The earlier planning-doc note saying it was "not yet committed" was stale and is corrected here.

**Sprint 006 is done and verified (not yet committed/pushed — awaiting the user).** It was triggered on 2026-11-05 the user reported a bug and three pain points:

- **Bug (root cause found by the Architect, read-only)**: `getDayEntryDetail()` in `src/lib/data/entries.ts` returns early when the date has no `day_entries` row, before ever querying `leave_entries`. A `day_entries` row is only created when a session or break is saved, so a leave-only day shows an empty Leave list (nothing visible, nothing removable) even though the leave rows exist and are counted in the Recap totals. The user, seeing nothing happen, added leave repeatedly on 2026-11-05 until 72 hours accumulated (consistent with nine 8-hour entries). This is also the true root cause of the July "leave not showing on mobile" report — the `ActionForm`/`router.refresh()` fix addressed a symptom that was never a refresh problem (it is harmless and stays).
- **Pain point 1**: the Daily Entry date picker should navigate as soon as a date is chosen — no "Go" button.
- **Pain point 3**: History tab pay-period date ranges should link to that period's Recap.
- **Pain point 4**: drop ISO week numbers from Recap headings; show "Week 1" / "Week 2" of the pay period.
- **Pain point 2 (aligning pay periods to the user's pay stubs)** is deliberately deferred to **Sprint 007**, once the user provides the last two pay stubs. It reverses part of the July ISO-week decision.

---

## Active Sprint

None. Sprint 006 (`planning/sprints/006-leave-bug-and-navigation/`) is closed.

---

## Active Work

None. Delivered: `getDayEntryDetail()` now always loads leave (pure `buildDayEntryDetail` + 3 regression tests); `DateJump` client component replaces the Go form (`goToDate` removed); History period ranges link to `/?period=<start>`; Recap headings read "Week 1"/"Week 2". 86/86 tests, typecheck and build clean; DateJump behavior verified in an isolated preview (bad year ignored, valid date navigates).

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

1. User decides whether to commit/push Sprint 006, then removes the duplicate 2026-11-05 leave entries via the Daily Entry page and checks History links and the date picker live.
2. After Sprint 006 ships, the user supplies the last two pay stubs and the Architect scopes Sprint 007 (pay periods aligned to the stubs).

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
