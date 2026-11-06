# Architect Briefing

**Last updated:** 2026-11-06 (Sprint 008 deployed and verified live)

---

## Where things stand

Sprint 008 is finished and live. Time Tracker now stores its data in Neon (free) and signs you in with one password, so your second free Supabase project is free to use for something else once you delete the old one. You merged it, signed in on the live site, and the Recap and History matched your before screenshots. Next: take and test-restore a first backup, give it a few days, then remove the old Supabase variables and delete the Supabase project.

## Current status

Sprint 008 (Supabase to Neon) is merged (PR #4) and deployed. The rehearsal copy and the final reset copy both matched on every table. A stale `.next` cache briefly made the local Recap look blank; clearing it fixed that, and it was not a code problem. Supabase is untouched and still holds a copy of the data; it is the fallback until the user deletes it.

## Since last sprint

- New data layer (`src/lib/db.ts`, `dbNormalize.ts`) and rewritten `entries.ts`/`recap.ts`/`settings.ts` with the same exports and row shapes.
- Single-password login: scrypt hash env var, HMAC-signed 30-day cookie, middleware check, password-only login page.
- `neon/schema.sql`; user-run scripts for hash creation, Supabase-to-Neon copy (count + checksum parity) and backup; `docs/OPERATIONS.md`.
- `force-dynamic` on the signed-in layout (build had started pre-rendering pages).
- Supabase packages and client files removed.

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
