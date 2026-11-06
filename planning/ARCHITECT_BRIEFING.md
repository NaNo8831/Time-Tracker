# Architect Briefing

**Last updated:** 2026-11-06 (Sprint 009 live and verified)

---

## Where things stand

Sprint 009 is finished and live. Time Tracker now shows when you last took a backup in the top bar (it turns amber after 35 days), and the Recap has a Today link that jumps back to the current pay period. You merged it, ran the one SQL step, and checked both features. Along with Sprint 008 earlier today, the app now runs on Neon with a one-password login, has a proven backup you have restored once, and nothing else is queued. Next: run a backup monthly, and delete the old Supabase project whenever you are comfortable.

## Current status

Sprint 009 (last-backup note + Today link) is merged (PR #7), deployed, and the user ran `neon/migration-009-last-backup.sql` and verified it live. 123/123 tests, tsc and build clean at merge. Sprint 008 (Neon + password login) is live and verified. No sprint is active. Supabase is untouched and still holds the 2026-11-06 copy as a fallback until the user deletes it.

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

Nothing is blocking and no sprint is planned. When the user returns, check whether they have removed the old Supabase variables and deleted the Supabase project, and ask whether anything new has come up. Automated backups or reminders were deliberately left out; revisit only if the user asks.
