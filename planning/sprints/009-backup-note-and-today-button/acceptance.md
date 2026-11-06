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
