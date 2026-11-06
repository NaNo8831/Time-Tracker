# Sprint 008 Blueprint — Move off Supabase

## 0. Principles
- Same behavior, new plumbing. Calculation code (`src/lib/calculations/*`) is NOT touched.
- Data-layer function names, parameters, and return types are unchanged, so pages/actions need no edits beyond imports of removed modules.
- The database is reachable only from the server. `DATABASE_URL` must never be `NEXT_PUBLIC_*`.
- No secrets in the repo, in docs, or in chat.

## 1. Dependencies
- Add `@neondatabase/serverless` (runtime) — use its HTTP `neon()` query function (one round trip per query; suits Vercel serverless).
- Add `pg` as a **devDependency** (used only by the user-run scripts).
- Remove `@supabase/ssr` and `@supabase/supabase-js`.

## 2. DB access module: `src/lib/db.ts` (new)
- Creates the Neon query function from `process.env.DATABASE_URL` (throw a clear error if missing). Use the **pooled** connection string. Export a small `query<T>(text, params)` helper returning rows.
- **Contract — rows must come back exactly as the app has always received them from Supabase (PostgREST):**
  - `date` columns → `'YYYY-MM-DD'` strings (never JS `Date`).
  - `timestamptz` columns (`sessions.check_in/check_out`) → ISO strings whose characters 11–16 are the UTC `HH:MM` (e.g. `2026-01-10T07:00:00+00:00`); the Daily Entry page does `iso.slice(11, 16)`. The connection's time zone must be UTC (set explicitly; inserted values like `2026-01-10T07:00:00` are interpreted as UTC, as they are today).
  - `numeric` columns (`hours`, `minutes`, `total_hours`, `balance`) → JS numbers.
  - `uuid` → strings.
- Implement the normalization either with explicit SQL casts in the queries or a small pure `normalizeRow` layer — Builder's choice, but it must be unit-tested (see §7) against sample raw driver values.

## 3. Data layer rewrite (same exports, same shapes)
Rewrite the query bodies in `src/lib/data/entries.ts`, `recap.ts`, `settings.ts` from the Supabase query builder to parameterized SQL via `db.ts`. Never string-interpolate user input. Functions to preserve exactly: `getDayEntryDetail`, `ensureDayEntry`, `setBreakOverride`, `addSession`, `removeSession`, `addLeaveEntry`, `removeLeaveEntry` (entries); `getRecapInput`, `getDailyHistoryRows` (recap); all `get*/add*/remove*` in settings (weekly target, break duration, standard workday hours, leave banks, holidays, physical years).
- `ensureDayEntry` should become an atomic `insert ... on conflict (date) do update set date = excluded.date returning id` (same result, no race).
- `in (...)` lookups → `= any($1::uuid[])`.
- Keep `pure buildDayEntryDetail` in `entryDetail.ts` unchanged.
- Preserve the existing unique-violation behavior: Settings actions detect Postgres error code `23505` (`isUniqueViolation` in `settings/actions.ts`); confirm the Neon driver surfaces the same `code` and keep the user-facing duplicate messages working. If the driver wraps errors differently, adapt `isUniqueViolation` and add a test.
- The "latest `rolling_balance_seed` row wins" rule (order by `created_at desc limit 1`) stays.

## 4. Neon schema: `neon/schema.sql` (new, run by the user in the Neon SQL editor on an empty project)
Build from `supabase/schema.sql` plus the later changes (break_minutes_override + check constraints, `break_duration_settings` naming, `rolling_balance_seed`, `physical_year_settings` with `end_date > start_date` check). Keep every table, column, type, default, unique constraint, check constraint, and index (`sessions_day_entry_id_idx`, `leave_entries_date_idx`). **Drop** `create extension pgcrypto` (not needed; `gen_random_uuid()` is built in), all `enable row level security` statements, and all `create policy ... auth.role()` statements. Idempotent (`if not exists`).

## 5. Login replacement
Files: `src/lib/auth/session.ts` (new), `src/lib/auth/password.ts` (new), `src/lib/auth/actions.ts`, `src/middleware.ts`, `src/app/login/page.tsx`; delete `src/lib/supabase/client.ts` and `server.ts`.
- **Session token** (`session.ts`, Web-Crypto-only so it runs in both Node and the Edge middleware): `token = "<expiresAtMs>.<hex HMAC-SHA256 of expiresAtMs using SESSION_SECRET>"`; `createSessionToken(now?)` (30-day expiry), `verifySessionToken(token, now?)` using `crypto.subtle.verify` (constant-time) and expiry check. Cookie name e.g. `tt_session`; `httpOnly`, `secure` in production, `sameSite=lax`, `path=/`, `maxAge` 30 days.
- **Password check** (`password.ts`, Node runtime only): `APP_PASSWORD_HASH` format `scrypt$<N>$<saltHex>$<hashHex>`; `verifyPassword(plain, stored)` with `crypto.scrypt` + `timingSafeEqual`; a matching `hashPassword(plain)` used by the helper script. A failed login adds a ~800 ms delay.
- **Actions**: `signIn(formData)` verifies the password → sets the cookie → redirects to `/`; wrong password → redirect to `/login?error=Incorrect+password`. `signOut()` deletes the cookie → `/login`.
- **Middleware**: unauthenticated requests to non-public paths redirect to `/login`; an authenticated user visiting `/login` goes to `/`. Same matcher as today. No network calls (the Supabase `getUser()` round trip disappears).
- **Login page**: a single Password field (remove the email field); same styling/errors.
- **Changing the password later**: run the hash helper, update `APP_PASSWORD_HASH` in Vercel, redeploy. Rotating `SESSION_SECRET` logs everyone out. Document both in `docs/OPERATIONS.md`.

## 6. User-run scripts (plain Node ESM in `scripts/`, run with `node --env-file=.env.local ...`; they must never print secrets)
1. `scripts/hash-password.mjs` — prompts for a password (does not take it as a CLI argument, to avoid shell history), prints the `APP_PASSWORD_HASH` value, and prints a command to generate a `SESSION_SECRET`.
2. `scripts/migrate-supabase-to-neon.mjs` — reads `SUPABASE_DB_URL` (Supabase Postgres connection string; use the **Session pooler** string if the network has no IPv6) and writes to `DATABASE_URL` (Neon). Copies all 10 tables in FK-safe order (`day_entries` before `sessions`), preserving `id` and `created_at`, with `insert ... on conflict (id) do nothing`. Both connections run `set time zone 'UTC'`. Modes: default **dry-run** (counts only, writes nothing); `--apply` copies; `--apply --reset-target` first empties the **Neon** tables (refuses unless `CONFIRM_RESET=yes` is set and prints the target host first; never touches Supabase). After copying it prints, per table, source vs target **row count and md5 checksum** (`md5(string_agg(t::text, '|' order by id))`) and exits non-zero if any table differs.
3. `scripts/backup-db.mjs` — exports every table from `DATABASE_URL` to `backups/time-tracker-YYYY-MM-DD.sql` as `insert ... on conflict (id) do nothing` statements in FK-safe order; `backups/` is added to `.gitignore`. Prints per-table row counts.
- Restore note (`docs/OPERATIONS.md`): create an empty Neon database, run `neon/schema.sql`, then run the backup `.sql` in the Neon SQL editor (or `psql`); verify with the backup script's row counts. **A backup is only trusted once restored into a scratch database once.**

## 7. Tests (Vitest, no database needed)
- `tests/auth/session.test.ts`: a fresh token verifies; tampered signature/expiry fails; expired token fails; wrong secret fails.
- `tests/auth/password.test.ts`: hash→verify round trip; wrong password fails; malformed stored hash fails safely.
- `tests/data/rowParity.test.ts` (or similar): the normalizers turn raw driver values (`Date` objects, numeric strings, timestamptz strings) into the exact shapes the app expects (`'YYYY-MM-DD'`, ISO with `slice(11,16)` = `HH:MM`, numbers).
- Existing calculation/data-shape tests keep passing unmodified.

## 8. Config & docs
- `.env.local.example`: replace Supabase vars with `DATABASE_URL`, `APP_PASSWORD_HASH`, `SESSION_SECRET` (plus `SUPABASE_DB_URL` commented, "only for the one-time copy script").
- `docs/OPERATIONS.md` (new): env vars, how to set/rotate the password and secret, run the backup, restore procedure, cutover/rollback steps, how to keep Neon active (free tier limits).
- `docs/ARCHITECTURE.md`: new data/auth sections; mark the Supabase sections superseded. `docs/VALIDATION.md`, `planning/FILE_INVENTORY.md`, `planning/STATE.md`, `planning/DECISIONS.md`, `planning/ARCHITECT_BRIEFING.md`, `planning/STATUS.json` at close.

## 9. Cutover & rollback (user-run; the Builder writes these steps into `docs/OPERATIONS.md`)
**Before merging the PR (the old site keeps running on Supabase throughout):**
1. User creates the Neon project; copies the pooled connection string to `.env.local` as `DATABASE_URL` (never committed/pasted in chat).
2. User runs `neon/schema.sql` in the Neon SQL editor.
3. User takes "before" screenshots: History (top rows) and the current Recap (Rolling Balance, both weeks, a week modal).
4. Rehearsal: `migrate-supabase-to-neon.mjs --apply`; confirm all 10 tables match.
5. User runs `hash-password.mjs`, generates `SESSION_SECRET`, and adds `DATABASE_URL`, `APP_PASSWORD_HASH`, `SESSION_SECRET` to **Vercel** env vars (Production). The old Supabase vars stay; the old deployment ignores the new ones.

**Cutover (no entries logged during these minutes):**
6. Final copy with `--apply --reset-target` (`CONFIRM_RESET=yes`); confirm all 10 tables match.
7. Merge the PR → Vercel deploys the Neon build.
8. Verify live (acceptance), comparing against the "before" screenshots.

**Rollback (if anything is wrong):** in Vercel, promote the previous (Supabase) deployment — the old env vars are still set. Any entries made on Neon after cutover would not be in Supabase; roll back quickly or copy them back by hand.

**Afterwards (user's own timing):** once satisfied for a while, remove the old Supabase env vars from Vercel and delete the Time Tracker Supabase project to free the slot. Take a first backup with `backup-db.mjs`.

## Out of Scope
Feature changes; schema redesign; multi-user; the Builder touching either database; deleting the Supabase project.
