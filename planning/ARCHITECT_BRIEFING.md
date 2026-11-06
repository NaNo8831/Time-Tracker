# Architect Briefing

**Last updated:** 2026-11-06 (Sprint 008 built; awaiting user cutover)

---

## Where things stand

Sprint 008 is built and tested. Time Tracker no longer depends on Supabase in code: data lives in Neon Postgres (free), and login is a single password instead of Supabase accounts. Everything I could check without your database passes, including a real sign-in test on a throwaway local server. Nothing is committed or live, and your Supabase project is untouched. Next: you create the Neon project and follow the cutover steps in `docs/OPERATIONS.md` (rehearse the copy, add three variables to Vercel, final copy, merge, check against screenshots).

## Current status

Sprint 008 (Supabase to Neon) code complete on branch `sprint-008-supabase-to-neon`, uncommitted. tsc clean, 114/114 tests, build clean. The Builder could not reach either database; SQL and schema were validated on an in-process Postgres (PGlite).

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

After a successful cutover and a few days live, plan removal of leftover Supabase variables/files and any follow-up features.
