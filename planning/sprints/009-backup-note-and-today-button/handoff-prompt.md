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
