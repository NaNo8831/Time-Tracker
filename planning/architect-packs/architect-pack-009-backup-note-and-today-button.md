============================================================
FILE: planning/STATE.md
============================================================

# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-11-06

---

## Current Phase

Sprint 009 Ready — "Last backup" note in the app header and a "Today" link on the Recap

---

## Current Status

Sprint 008 (move to Neon Postgres + single-password login) is complete: merged (PR #4), deployed, verified live by the user on 2026-11-06 (Recap and History match the pre-cutover screenshots). The user took a first full backup with `npm run db:backup` and test-restored it into a scratch Neon database: every table's row count matched, scratch project deleted. The backup file is stored safely off the computer. Supabase still holds a copy of the data and is the fallback until the user deletes the project (their own step, after a few good days).

**Sprint 009 is now authorized.** Two small quality-of-life changes the user asked for, decisions made in the Architect conversation:

- **Last-backup note:** shown in the app header (the Nav bar, in the free space between the Settings link and "Sign out"), not buried in Settings. Reads e.g. `Last backup: Nov 6 (3 days ago)`; turns amber after 35 days; says `No backup yet` before any is recorded. The date is stored in the database: one tiny new table, written by `npm run db:backup` after the file is saved. The user runs one SQL statement in Neon that creates the table and records **2026-11-06** as the starting date (the backup they already took and stored).
- **Today link:** on the Recap, between Prev and Next (`← Prev   Today   Next →`). It goes to the current pay period. It is greyed out and not clickable when the user is already viewing the current period.

No calculation, page layout (beyond those two spots), or existing table changes.

---

## Active Sprint

`planning/sprints/009-backup-note-and-today-button/`

---

## Active Work

Builder: read `planning/sprints/009-backup-note-and-today-button/` in full, then stop at the code gate — post a concrete file-by-file plan and wait for explicit approval before writing any code. You have no access to either database; the user runs all SQL and scripts.

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
| Tech stack | Next.js 14 (App Router), Neon Postgres, single-password cookie login, Tailwind CSS, Vitest, Vercel |

---

## v1 Scope Snapshot

Pay Period Recap (Sat–Fri weeks, fixed 14-day periods anchored 2026-01-10), per-week modal, History with links to each period, Daily Entry, Settings (incl. Physical Year, 5 themes), single-password login, user-run backup script, Vercel auto-deploy. Sprint 009 adds the header backup note and the Recap "Today" link only.

- Out of scope: any calculation or data-model change, automated/scheduled backups, backup emails or notifications, in-app backup button, multi-user, stub paid-hours comparison.

---

## Next Actions

1. Builder executes Sprint 009 from `planning/sprints/009-backup-note-and-today-button/` only, starting with the mandatory code gate.
2. User (independent, not blocking): after a few good days, remove `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY` from Vercel (all environments) and `SUPABASE_DB_URL` from `.env.local`, then delete the Time Tracker project in Supabase.
3. User: confirm Settings > Physical Year shows its row on the live site (the restore test shows 1 row exists).
4. User, after Sprint 009 deploys: run the one SQL statement in Neon (see `neon/migration-009-last-backup.sql`), then the header should show `Last backup: Nov 6`.

---

## Blockers

None.

---

## Watch Items

- **Deploy order**: deploy the code first, then the user runs the SQL. Until the SQL runs, the header must show `No backup yet` and every page must still load (the backup lookup must never throw).
- **What the note means**: the date records that `npm run db:backup` finished writing the file, not that the user copied it somewhere safe. The docs and the UI wording must not claim more.
- **Backup script becomes a writer**: it was read-only; it will now write exactly one row (`last_backup`) after the file is saved. A failure to record must never fail or hide a successful backup.
- The new table is bookkeeping, not user data: it is excluded from the backup export and the Supabase-to-Neon copy script, but is part of `neon/schema.sql`.
- Free-tier terms change often; confirm on neon.com before relying on any specific limit.
- Keep URL/param parsing and "is this the current period" logic in tested pure helpers (lesson from the Prev/Next hotfix, PR #3).
- No duplicate guard on leave entries (accepted). Physical Year and holiday lists may need entries for the coming year.

============================================================
FILE: planning/sprints/009-backup-note-and-today-button/requirements.md
============================================================

# Sprint 009 Requirements — Last-backup note in the header + "Today" link on the Recap

## Background

Sprint 008 moved the app to Neon and added a user-run backup script. A backup only protects the user if it is actually taken, and the habit (monthly) lives only in documentation. The user sees the app far more often than the code, so they want the age of their last backup visible in the app. Separately, after paging back through old pay periods on the Recap there is no quick way back to the current one.

## Goals

1. **Last-backup note in the app header.** In the Nav bar, in the free space between the links and "Sign out", show the date and age of the last recorded backup:
   - `Last backup: Nov 6 (3 days ago)`; `today` / `1 day ago` / `N days ago`; the year is added only when it is not the current year (`Nov 6, 2026`).
   - Muted text normally; **amber** when the last backup is more than **35 days** old (36+ days = stale; exactly 35 is not).
   - `No backup yet` when nothing has been recorded (shown in the amber/attention style).
   - On narrow (phone) screens the "(N days ago)" part is dropped so the header does not wrap awkwardly; the date stays.
2. **Record the date.** `npm run db:backup` records the time it finished writing the backup file into a new one-row table. The user's existing backup (taken and stored safely on 2026-11-06) is recorded as the starting value by a one-time SQL statement the user runs in Neon.
3. **"Today" link on the Recap.** The header row becomes `← Prev   Today   Next →`. "Today" goes to the current pay period (`/`). When the user is already viewing the current pay period it is shown greyed out and is not clickable.

## Non-goals (explicitly out of scope)

- Any change to calculations, History, Daily Entry, Settings content, login, or existing tables.
- Automated or scheduled backups, e-mail/notification reminders, an in-app "Back up now" button, or showing backup history/list.
- Verifying that the user copied the file somewhere safe (the app cannot know). Wording must say "Last backup", never "Safe" or "Verified".
- Changing how the backup file is written (the restore the user already tested must stay valid).

## Users / Roles

Single user (the owner).

## Acceptance Summary

See `acceptance.md`. Headline: the header shows the right date/age/colour in every state, the backup script records its run without ever failing the backup, no page breaks if the new table does not exist yet, and the Today link is correct on current, past, and future periods.

============================================================
FILE: planning/sprints/009-backup-note-and-today-button/blueprint.md
============================================================

# Sprint 009 Blueprint — Last-backup note + Today link

## 0. Principles

- Smallest change that does the job: one tiny table, one data function, one pure helper per feature, two small UI edits.
- The Builder has **no database access**. It writes the SQL and script changes; the **user** runs them. Never print, log, commit or ask for secrets or connection strings.
- The backup lookup must **never throw into a page**: if the table is missing or the query fails, the header shows `No backup yet`.
- Pure, unit-tested helpers for everything with logic (age/label/tone; current-period detection and link targets).

## 1. Database

### `neon/migration-009-last-backup.sql` (new — the user runs it once in the Neon SQL editor)

Idempotent (safe to re-run), additive, no deletes:

- Create `last_backup`: single-row table — `id smallint primary key default 1 check (id = 1)`, `backed_up_at timestamptz not null`.
- Insert the starting row for the backup already taken: `backed_up_at = '2026-11-06T12:00:00Z'`, `on conflict (id) do nothing` (so re-running never overwrites a newer real backup).

### `neon/schema.sql` (edit)

Append the same `create table if not exists last_backup (...)` (no seed row) so a fresh/restored database has the table. Keep the file idempotent.

The table is **not** added to `scripts/lib/tables.mjs` `TABLES`: it is not user data and must not appear in the backup export or the Supabase→Neon copy/parity script.

## 2. Backup script: `scripts/backup-db.mjs` (edit)

After the backup file is successfully written (and only then), run one upsert:
`insert into last_backup (id, backed_up_at) values (1, now()) on conflict (id) do update set backed_up_at = excluded.backed_up_at`.

- Wrap it in try/catch. On failure (e.g. the migration has not been run yet) print a plain-English note — "Backup saved, but the date could not be recorded in the app. Run neon/migration-009-last-backup.sql in Neon, then back up again." — and **exit 0**. A recording failure must never fail, hide, or alter a successful backup.
- On success print one extra line: "Recorded in the app header." Do not change the file contents/format or the row-count output.
- Update the file's header comment (it says "Read-only"): it now writes exactly one row, `last_backup`, after the file is saved.

## 3. Data layer: `src/lib/data/backup.ts` (new)

- `getLastBackupAt(): Promise<string | null>` — `select backed_up_at::text ...` normalized via the existing `toTimestampText` helper (`src/lib/dbNormalize.ts`) to the app's `YYYY-MM-DDTHH:MM:SS+00:00` shape; `null` when there is no row.
- The whole function is wrapped in try/catch and returns `null` on any error (missing table before the SQL is run, network blip). It never throws.

## 4. Pure helper: `src/lib/calculations/backupStatus.ts` (new)

- `describeBackup(lastBackupAt: string | null, now: Date): { label: string; shortLabel: string; stale: boolean }`.
  - `null` or unparseable input → `label`/`shortLabel` = `No backup yet`, `stale: true`.
  - Whole-day age = floor of (now − backup) in days, using UTC; never negative (a future-dated value, e.g. clock skew, is treated as 0 days = `today`).
  - `label`: `Last backup: <Mon D> (<age>)`, `<age>` = `today` | `1 day ago` | `N days ago`; the `, YYYY` suffix is added to the date only when the backup's year differs from `now`'s year. `shortLabel`: `Last backup: <Mon D>` (no age part).
  - `stale` = age in days **> 35**.
  - English month abbreviations come from a fixed array — no locale/`Intl` dependence (the server and browser must render identically).
- Export `STALE_AFTER_DAYS = 35` so the threshold is a named constant.

## 5. Header UI: `src/components/Nav.tsx` (edit)

- Make `Nav` an async server component that awaits `getLastBackupAt()` and calls `describeBackup(...)` with `new Date()`.
- Layout: keep the links on the left. The right side becomes `<div className="flex items-center gap-4">` holding the backup note (a `<span>`, small, `text-xs`) followed by the existing Sign out form. Full `label` from the `sm` breakpoint up; below `sm` show `shortLabel` only (e.g. render both spans with `hidden sm:inline` / `sm:hidden`). Must not cause horizontal scroll at 375 px width.
- Colour: muted token normally; the new `--color-warning` token when `stale`. Add `title="Run npm run db:backup and keep the file somewhere safe"` as a hover hint (plain text, no claims).
- The layout already has `dynamic = "force-dynamic"` (`src/app/(app)/layout.tsx`), so the note is fresh on every request; do not change that.

### Theme token: `--color-warning`

There is no amber token today. Add `--color-warning` to **every** theme block in `src/app/globals.css` (all 5 themes): a readable amber on that theme's card background (suggested `#b45309` on light themes, `#fbbf24` on the dark theme — Builder verifies contrast against the nav background). Add a row to the token table in `docs/THEMING.md`.

## 6. Recap "Today" link

### Pure helper: add to `src/lib/calculations/payCycle.ts`

`periodNav(week1Start: IsoDate, today: IsoDate): { prev: IsoDate; next: IsoDate; isCurrent: boolean }`

- `prev` = `week1Start − 14 days`, `next` = `week1Start + 14 days` (exactly today's values in `page.tsx`).
- `isCurrent` = `week1Start === payPeriodStart(today)`.

### `src/app/(app)/page.tsx` (edit)

Replace the inline `prevPeriod`/`nextPeriod` with `periodNav(...)`. The link row becomes `← Prev`, **`Today`**, `Next →`:

- `Today` is a `<Link href="/">` styled like the others when `!isCurrent`.
- When `isCurrent`, render a non-link `<span aria-disabled="true">` in the faint text colour with no underline (greyed out, not focusable/clickable).
- Prev and Next hrefs/behaviour are unchanged. The "before your tracked history" empty state is untouched (no Today link needed there).

## 7. Tests (Vitest, no database needed)

- `tests/calculations/backupStatus.test.ts`: `null`/garbage → `No backup yet` + stale; same-day → `today`; 1 day → `1 day ago`; N days; exactly 35 days → not stale; 36 days → stale; year suffix only when the year differs; future timestamp → `today`, not stale; labels contain no locale-dependent text.
- Extend `tests/calculations/payCycle.test.ts` (or add `periodNav.test.ts`): `isCurrent` true for the current period start, false for a past and a future period start; `prev`/`next` are ±14 days; a mid-period `today` still marks its own period start current.
- All existing 114+ tests keep passing; no assertions weakened.

## 8. Docs

- `docs/OPERATIONS.md` (Backups section): describe the header note, what it does and does not mean, the amber threshold, and add the one-time step: run `neon/migration-009-last-backup.sql` in the Neon SQL editor (after the code is deployed), then reload the app.
- `docs/ARCHITECTURE.md`: note the `last_backup` table, `backup.ts`, `backupStatus.ts`, and the Nav change under the Neon section. `docs/VALIDATION.md`: Sprint 009 checks. `planning/FILE_INVENTORY.md`: new files.

## 9. Release order (the Builder writes these steps into `docs/OPERATIONS.md`; the user performs them)

1. Merge the PR; Vercel deploys. The header shows `No backup yet` (amber) — expected until step 2.
2. In the Neon SQL editor, run `neon/migration-009-last-backup.sql`. Reload the app: the header shows `Last backup: Nov 6 (N days ago)`.
3. Next time the user runs `npm run db:backup`, the script prints "Recorded in the app header." and the date updates.

No data freeze is needed; nothing existing is modified.

## Out of Scope

Automated backups, notifications, backup history, an in-app backup button, any change to calculations or existing tables.

============================================================
FILE: planning/sprints/009-backup-note-and-today-button/acceptance.md
============================================================

# Sprint 009 Acceptance — Last-backup note + Today link

## Code

- [ ] `describeBackup` returns the labels in the blueprint: `today`, `1 day ago`, `N days ago`; year suffix only when the year differs; `No backup yet` for `null`/unparseable; stale only when strictly more than 35 days; a future timestamp is `today`.
- [ ] `getLastBackupAt` returns the timestamp in the app's `YYYY-MM-DDTHH:MM:SS+00:00` shape, `null` when there is no row, and returns `null` (never throws) when the query fails or the table does not exist.
- [ ] Header (Nav): note sits between the links and Sign out; muted normally, amber (`--color-warning`) when stale or `No backup yet`; full text from `sm` up, date-only below `sm`; no horizontal scroll at 375 px; present on every signed-in page; not shown on `/login`.
- [ ] `--color-warning` exists in all 5 themes with readable contrast; `docs/THEMING.md` updated.
- [ ] `periodNav` returns `prev`/`next` = ±14 days and `isCurrent` correctly for current, past and future periods; the Recap uses it.
- [ ] Recap row reads `← Prev   Today   Next →`; Today links to `/`; on the current period it is greyed out, has no link/underline, and is not clickable; Prev/Next behave exactly as before.
- [ ] `tsc --noEmit`, `vitest run` (all existing + new tests), and `next build` pass.

## Scripts & SQL (Builder writes, user runs)

- [ ] `neon/migration-009-last-backup.sql` is idempotent: creates `last_backup` if missing, seeds `2026-11-06T12:00:00Z` with `on conflict do nothing` (re-running never overwrites a newer value); contains no deletes and touches no other table. `neon/schema.sql` also creates the table (no seed).
- [ ] `scripts/backup-db.mjs`: the backup file contents/format and row-count output are unchanged; after the file is written it upserts `last_backup`; a recording failure prints the plain-English note and exits 0 without affecting the file; success prints "Recorded in the app header."; the header comment no longer says "Read-only".
- [ ] `last_backup` is **not** in `scripts/lib/tables.mjs` (so not in the backup export or the migrate parity check).
- [ ] Verified without a database where possible (e.g. SQL checked in-process with PGlite if available, as in Sprint 008).

## Live (user-checked after deploy)

- [ ] Before the SQL runs: header shows `No backup yet` in amber and every page loads normally.
- [ ] After running the SQL: header shows `Last backup: Nov 6 (N days ago)` in muted text.
- [ ] After `npm run db:backup`: the script prints "Recorded in the app header." and the header shows `Last backup: <today's date> (today)`.
- [ ] On the Recap, Today is greyed out on the current period; after clicking Prev, Today is active and returns to the current period; Next/Prev still page correctly; History links unchanged.
- [ ] Phone width: header does not wrap awkwardly or scroll sideways.

## Non-goals confirmed untouched

- No calculation, History, Daily Entry, Settings content, login, or existing-table changes; no backup-file format change; no scheduled/automated backups or notifications.

## Regression

- Sprint 002–008 acceptance still holds (Sat–Fri periods, week modal, leave display, date jump, themes, password login, restore of an existing backup file).

============================================================
FILE: planning/sprints/009-backup-note-and-today-button/handoff-prompt.md
============================================================

# Sprint 009 Builder Handoff Prompt

Read `templates/method/120x-agent-identity.md`, then `AGENTS.md`, then `planning/STATE.md` and `planning/DECISIONS.md`, then this sprint's `requirements.md`, `blueprint.md`, and `acceptance.md` in full.

Act as the Builder. Implement only what's in this sprint's files:

1. Write `neon/migration-009-last-backup.sql` (idempotent: create the one-row `last_backup` table, seed `2026-11-06T12:00:00Z` with `on conflict do nothing`) and add the table (no seed) to `neon/schema.sql`.
2. Edit `scripts/backup-db.mjs` so that after the file is written it upserts `last_backup`, never failing the backup if recording fails (plain-English note, exit 0). Do not change the backup file format or row-count output; do NOT add `last_backup` to `scripts/lib/tables.mjs`.
3. Add `src/lib/data/backup.ts` (`getLastBackupAt`, never throws) and `src/lib/calculations/backupStatus.ts` (`describeBackup`, `STALE_AFTER_DAYS = 35`, fixed English month names).
4. Edit `src/components/Nav.tsx` (async) to show the note between the links and Sign out; add `--color-warning` to all 5 themes in `src/app/globals.css` and to `docs/THEMING.md`.
5. Add `periodNav` to `src/lib/calculations/payCycle.ts`; update `src/app/(app)/page.tsx` to use it and render `← Prev  Today  Next →` (Today greyed out and not a link on the current period).
6. Add the tests listed in the blueprint (§7) and keep every existing test passing.
7. Update `docs/OPERATIONS.md` (Backups section + release order), `docs/ARCHITECTURE.md`, `docs/VALIDATION.md`, `planning/FILE_INVENTORY.md`.

Scope guards — do NOT:
- Change any calculation, History, Daily Entry, Settings content, login, or existing table/column.
- Access, query, or modify either database, run any SQL, or handle credentials: you have no database access; the user runs the SQL and the backup script. Never print, log, commit, or ask for secrets or connection strings.
- Change how the backup file is written, or add the new table to the backup export or the Supabase→Neon copy script.
- Add scheduled/automated backups, notifications, an in-app backup button, or claim in any wording that the backup is "safe" or "verified" (the date only means the script finished).
- Let the backup lookup throw into a page.

Stop at the mandatory code gate before writing any code: post your concrete file-by-file plan, scope guards, and acceptance criteria, and wait for explicit approval.

At close: update `planning/STATE.md`, `planning/DECISIONS.md`, `planning/ARCHITECT_BRIEFING.md` (leading with a plain-English "Where things stand"), and mark `planning/STATUS.json` `sprint-closed`. Do not commit to git unless the user explicitly asks.

============================================================
FILE: planning/STATUS.json
============================================================

{
  "schemaVersion": 1,
  "phase": "apply-pack",
  "sprint": "009-backup-note-and-today-button",
  "updated": "2026-11-06"
}
