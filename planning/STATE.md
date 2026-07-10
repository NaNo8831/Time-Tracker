# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-07-09

---

## Current Phase

Sprint 004 Complete — Pay Period Recap Redesign + Full-Year Historical Import (code done; SQL handed to user to run)

---

## Current Status

Sprint 004 code is complete, verified (74/74 unit tests, typecheck clean, production build clean), and the historical-import SQL has been independently re-derived and cross-checked to reproduce the architect's verified weekly table exactly, week by week, including the critical already-live `-27.67` boundary. Two SQL scripts are now ready for the user to run against the live Supabase project — nothing has been executed against the database yet.

- Sprint 003 remains complete and verified live (2026-05-02–2026-06-26 imported, user-confirmed correct, current hours being logged).
- **Critical**: the new import is additive only. The live database holds real, user-verified data — no destructive operations (no TRUNCATE, no DROP) are in scope. The only mutations to already-existing rows are three settings' `effective_date` and the `rolling_balance_seed`'s value, both mathematically verified (via a standalone Node script) to reproduce every already-proofed Sprint 3 number exactly.
- SQL run order: `supabase/schema-migration-004-physical-year.sql` first, then `supabase/migration-004-import-2026-01-12-to-2026-05-01.sql`.

---

## Active Sprint

`planning/sprints/004-pay-period-recap-and-full-year-import/` — code complete, awaiting user to run the two SQL scripts and spot-check the app.

---

## Active Work

None. Waiting on the user to run the Sprint 004 SQL scripts against the live database and confirm the app matches expectations (see `acceptance.md`'s Historical Import spot-checks).

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

1. User runs `supabase/schema-migration-004-physical-year.sql` in the Supabase SQL editor.
2. User runs `supabase/migration-004-import-2026-01-12-to-2026-05-01.sql` (after step 1).
3. User spot-checks the app against `planning/sprints/004-pay-period-recap-and-full-year-import/acceptance.md`'s Historical Import section, and confirms Sprint 3's already-live weekly numbers (2026-05-04 onward) are unchanged.
4. After Sprint 004 is verified live, the earliest remaining gap is 2026-01-01 through 2026-01-09 (data not available — the user's records start 2026-01-10, and 2026-01-10/11 fall outside the trackable Monday-Sunday boundary; see Decisions). No further action needed there unless the user finds additional records later.

---

## Blockers

None for the Builder. The user still needs to run the two Sprint 004 SQL scripts against the live Supabase project (Builder has no direct DB access) — those scripts touch a database with real, live, in-use data, so extra care is warranted (see Risks).

---

## Watch Items

- **Critical**: this import is additive-only against a live, real, in-use database. No TRUNCATE, no destructive statements. The three settings `effective_date` changes and the `rolling_balance_seed` value change must reproduce the EXACT already-verified 8-week table from Sprint 3 (see `planning/sprints/003-break-rework-and-migration/acceptance.md`) as a hard regression check before this sprint is considered done.
- New earliest tracked Monday: `2026-01-12`. New rolling balance seed: `-7.87`. Both mathematically derived and cross-checked against the sheet's own rollover figures and the already-live `-27.67` checkpoint — see `planning/DECISIONS.md`.
- 2026-01-10 and 2026-01-11 (4.25 real hours on Jan-10) are NOT imported as discrete day records — they fall before the first fully-reconstructable Monday-Sunday week. This does not affect Rolling Balance accuracy (the seed already accounts for it) but means that one specific day's raw session detail is not viewable in the app. Documented, not a bug.
- Three inferred holiday labels (2026-04-02 "Holy Thursday", 2026-04-03 "Good Friday", 2026-04-06 "Easter Monday") — editable in Settings if wrong.
- ISO week pairing has a known, accepted edge case in 53-ISO-week years (rare) where year-boundary pairing may not alternate cleanly — not solved in v1, Micro-app tier accepts this.
- Do not implement employer-specific pay-period anchoring — the user explicitly chose the ISO 8601 standard, not a configurable anchor.
