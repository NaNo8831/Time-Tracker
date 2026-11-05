# Architect Briefing

**Last updated:** 2026-11-05 (Sprint 006 complete)

---

## Where things stand

Sprint 006 is done and checked. The leave-entry bug is fixed: the Daily Entry page was skipping the leave query on any day that had no session or break saved, so a day with only vacation looked empty and nothing could be removed — which is why the same entry kept getting added until 72 hours piled up on 11-5. Leave now shows and removes on any date. The date picker opens a date as soon as you choose it (no Go button), History's pay-period date ranges now open that period's Recap, and the Recap headings say "Week 1" and "Week 2". Everything passes its tests and builds, but none of it is committed or live yet. Next: the user decides on commit/push and then removes the duplicate 11-5 entries in the app; Sprint 007 (pay periods matching pay stubs) waits on the two stubs.

---

## Current status

Sprint 006 (Leave Entry Bug Fix + Navigation Improvements) — complete, verified, not committed. No active sprint.

## Since last sprint

- **Bug fix**: `getDayEntryDetail()` (`src/lib/data/entries.ts`) now always fetches leave (keyed by date) alongside the day record and loads sessions only when a day record exists. Assembly lives in a pure `buildDayEntryDetail` (`src/lib/data/entryDetail.ts`) with 3 regression tests (`tests/calculations/entryDetail.test.ts`). Audit: this was the only place gating data behind a `day_entries` row.
- **Root-cause correction**: the July "leave not showing on mobile" report had this same cause; the `ActionForm` refresh fix addressed a symptom (harmless, kept).
- **`DateJump`** (`src/components/DateJump.tsx`, new): date input that navigates on a complete date in 2000–2099; replaces the Go form; `goToDate` action removed.
- **History**: period date ranges link to `/?period=<periodStart>`.
- **Recap**: headings "Week 1"/"Week 2"; `isoWeekNumber` import removed from `page.tsx` (still used internally for pairing).
- 86/86 tests pass (3 new), typecheck and build clean. DateJump verified in an isolated preview (bad year ignored, valid date navigates); real pages are behind login so the leave fix and links need the user's live check.

## Architecture / file map

- `src/lib/data/entryDetail.ts` (new, pure), `src/lib/data/entries.ts` (re-exports types, new `getDayEntryDetail`).
- `src/components/DateJump.tsx` (new, fifth client component).
- `src/app/(app)/entries/[date]/page.tsx`, `entries/actions.ts`, `history/page.tsx`, `page.tsx` — edited as above.
- `docs/ARCHITECTURE.md` updated (leave is keyed by date; DateJump; History links).

## Decisions

See `planning/DECISIONS.md` — 2026-11-05 entries: root cause, Sprint 006 scope, parked Sprint 007, and a closing entry with implementation details.

## Risks / watch-items

- The 2026 53-ISO-week boundary (around 2026-12-28 / 2027-01-04) is imminent; Sprint 007's stub-aligned fixed cycle would remove it. Revisit urgency if Sprint 007 slips past late December.
- No duplicate guard on leave entries (accepted for now; consider with Sprint 007).
- Physical Year and holiday lists may need entries for the coming year.
- Existing duplicate 2026-11-05 leave rows are still in the database until the user removes them in the UI (no SQL by the Builder).

## Open questions for the Architect

How to anchor pay periods to the user's stubs (fixed start + 14-day cycles, semi-monthly, other) — blocked on the last two pay stubs.

## Validation / test status

Automated: 86/86 tests, typecheck clean, production build clean. Live (real data) not yet verified — user to check 11-5 leave, History links, date picker after deploy.

## Recommended next Architect action

Once the user sends the two pay stubs, discuss and scope Sprint 007 (pay-period alignment). Before that, nothing is needed from the Architect.
