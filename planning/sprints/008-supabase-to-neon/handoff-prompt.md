# Sprint 008 Builder Handoff Prompt

Read `templates/method/120x-agent-identity.md`, then `AGENTS.md`, then `planning/STATE.md` and `planning/DECISIONS.md`, then this sprint's `requirements.md`, `blueprint.md`, and `acceptance.md` in full.

Act as the Builder. Implement only what's in this sprint's files:

1. Add `@neondatabase/serverless`, add `pg` as a devDependency, remove the `@supabase/*` packages.
2. Create `src/lib/db.ts` (server-only Neon access; rows normalized to the exact shapes the app has always received) and rewrite the query bodies of `src/lib/data/entries.ts`, `recap.ts`, `settings.ts` to parameterized SQL, keeping every exported function's name, parameters, and return shape. Keep Settings' duplicate-date error handling working.
3. Replace Supabase Auth with the single-password login: `session.ts` (Web-Crypto signed cookie), `password.ts` (scrypt), `actions.ts`, `middleware.ts`, and a password-only login page. Delete `src/lib/supabase/*`.
4. Write `neon/schema.sql`, `scripts/hash-password.mjs`, `scripts/migrate-supabase-to-neon.mjs`, `scripts/backup-db.mjs`, `docs/OPERATIONS.md` (env vars, password/secret rotation, backup, restore, cutover, rollback), update `.env.local.example` and `.gitignore` (`backups/`).
5. Add the tests listed in the blueprint (§7) and keep all existing tests passing.

Scope guards — do NOT:
- Change any feature, screen, calculation, or schema (beyond dropping Supabase-specific RLS/auth parts).
- Access, query, or modify either database, run any SQL, or handle credentials: you have no database access; every script is run by the user. Never print, log, commit, or ask for secrets or connection strings.
- Delete or alter existing `supabase/*.sql` files, or anything in the Supabase project.
- Add a second user, a password-reset flow, or other login features.

Stop at the mandatory code gate before writing any code: post your concrete file-by-file plan, scope guards, and acceptance criteria, and wait for explicit approval.

At close: update `planning/STATE.md`, `planning/DECISIONS.md`, `planning/ARCHITECT_BRIEFING.md` (leading with a plain-English "Where things stand"), `docs/ARCHITECTURE.md`, `docs/VALIDATION.md`, `planning/FILE_INVENTORY.md`, and mark `planning/STATUS.json` `sprint-closed`. Do not commit to git unless the user explicitly asks.
