# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-07-14

---

## Current Phase

Sprint 005 Complete — Weekly Actual Fix + Week Drill-down Modal

---

## Current Status

Sprint 005 is done and fully verified. The real bug the user found via screenshot — a week's "Actual" hours silently dropping real, already-logged data for days after today (e.g. pre-planned vacation) — is fixed: `buildWeeklyRecap()`'s day loop no longer stops at `today`. Live-verified against the user's own numbers: Week 29 went from a wrong 6.25 hrs to the correct 23.75 hrs, Week 30 from a wrong 0.00 hrs to the correct 40.00 hrs.

On top of the fix: each week's "Actual" card now has a hover tooltip splitting hours-through-today vs. hours-already-logged-for-later-this-week (broken down by v/s/p), and clicking "Actual" opens a modal with that week's 7-day log (now including a Day-of-week column), replacing the always-visible 14-day table that used to sit at the bottom of the page. History tab and Rolling Balance's "last fully-completed week" logic are both confirmed unaffected (existing test suites for both pass unmodified).

Sprint 004 remains fully complete and live (SQL run, user-verified), the app is deployed to Vercel with GitHub auto-deploy, and the three unplanned post-Sprint-004 rounds (theming, mobile UX fixes, the `ActionForm` mobile-refresh fix) are all still in place.

Not yet committed to git this session (user has not asked for a commit).

---

## Active Sprint

None. Sprint 005's folder (`planning/sprints/005-weekly-actual-fix-and-week-drilldown/`) is closed.

---

## Active Work

None. Everything from Sprint 005 is implemented, tested, and verified live (via an isolated non-auth preview reproducing the user's real scenario). Awaiting the user's next request.

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

1. User to test Sprint 005 live once deployed (git push not yet requested this session) — spot-check the two real weeks from the original screenshot, try the modal on mobile.
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
- Sprint 005's fix confirmed NOT to change Rolling Balance's "last fully-completed week" selection logic or History tab's numbers — both existing test suites pass unmodified, plus a live spot-check.
- Third and fourth deliberate client-side components now exist (`WeekLogModal.tsx`, after `ThemePicker`/`CollapsibleSection`/`ActionForm`) — still no shared modal abstraction; revisit only if a differently-shaped case shows up.
- **Process note**: this session correctly routed the Sprint 005 request through a full Architect conversation before any code was touched (planning docs refreshed, pack written, code gate honored) — the pattern the user asked for after the earlier unplanned rounds.
