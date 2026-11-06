# Architect Briefing

**Last updated:** 2026-11-06 (Sprint 009 built; awaiting merge, deploy and one SQL step)

---

## Where things stand

Sprint 009 is built and tested. The top bar of the app will now show when you last took a backup (for example "Last backup: Nov 6 (3 days ago)"), turning amber after 35 days, and the Recap has a Today link between Prev and Next that jumps back to the current pay period. Nothing is live yet and nothing is committed. Next: merge it, let Vercel deploy, then run one small SQL file in Neon so the app knows about your Nov 6 backup. Until you run it the bar just says "No backup yet" and everything else works.

## Current status

Sprint 009 (last-backup note + Today link) code complete on branch `sprint-009-backup-note-and-today-button`, uncommitted. tsc clean, 123/123 tests, build clean. The SQL was validated on an in-process Postgres; the Builder did not render the signed-in UI (no database access). Sprint 008 remains live and verified.

## Since last sprint

- New one-row `last_backup` table (`neon/migration-009-last-backup.sql`, also in `neon/schema.sql`); `npm run db:backup` records its finish time after saving the file (a failure to record never affects the backup).
- Never-throwing lookup `src/lib/data/backup.ts`; pure label/stale logic `backupStatus.ts` (stale after 35 days); async `Nav.tsx` shows the note; new `--color-warning` theme token.
- Pure `periodNav()` in `payCycle.ts`; Recap row is Prev, Today, Next (Today greyed out on the current period).
- 9 new tests; docs updated.

## Architecture / file map

See `docs/ARCHITECTURE.md` ("Neon + password login (Sprint 008)") and `planning/FILE_INVENTORY.md`.

## Decisions

See `planning/DECISIONS.md`: 2026-11-06 scoping entry and "Sprint 008 build decisions" (colon-separated hash format, force-dynamic, parity method, reset safety).

## Risks / watch-items

- Real-data parity is unproven until the user runs the copy and compares screenshots; the copy script fails loudly on any count/checksum mismatch.
- `DATABASE_URL` was missing from this project's `.env.local` when checked.
- Add the new Vercel variables BEFORE merging; keep old Supabase variables until verified; log no entries during the final copy.
- Neon free-plan limits change; recheck before relying on restore windows. Backups only count after a test restore.

## Open questions for the Architect

None blocking.

## Validation / test status

See `docs/VALIDATION.md` "Sprint 008 Validation".

## Recommended next Architect action

Nothing is blocking. After the user has taken and test-restored a backup and removed the old Supabase variables and project, decide the next sprint (no feature work is currently planned). Automated backups were deliberately left out; revisit only if the user wants them.
