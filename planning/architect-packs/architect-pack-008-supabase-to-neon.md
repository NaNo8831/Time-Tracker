============================================================
FILE: planning/STATE.md
============================================================

# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-11-06

---

## Current Phase

Sprint 008 Ready — Move data storage and login off Supabase (to Neon Postgres + a single-password login)

---

## Current Status

Sprint 007 (Saturday–Friday weeks, fixed 14-day pay periods anchored 2026-01-10) is complete: merged, deployed, its SQL run by the user, and the new period dates confirmed live (2026-11-05). A follow-up hotfix (PR #3, `resolvePeriodStart()`) fixed the Recap's Prev/Next buttons and History links, which had all been showing the current period; it is merged to `main` — the user should confirm Prev/Next now works.

**Sprint 008 is now authorized.** The user needs their second free Supabase project for something else and asked to move Time Tracker's data storage to something free. Research (2026-11-06) found **Neon** (permanent free plan, no card; per Neon's own FAQ 100 projects × 1 GB each, scales to zero and wakes automatically) the best fit because the tables are already Postgres. Decisions made with the user:

- **Database:** Neon Postgres, accessed only from the server with a secret connection string.
- **Login:** replace Supabase Auth with **one password** (stored hashed in an environment variable) plus a signed login cookie.
- **Backups:** a script the user runs for a full export; Neon's free restore window is short, so exports are the real safety net.
- Supabase stays untouched until the user has verified the new setup; deleting the Supabase project is the user's own later step.

This supersedes: "Auth is Supabase email/password" (2026-07-09), "Backups rely on Supabase's built-in automatic backups" (2026-07-09), and "RLS enabled on all tables" (the database is no longer reachable from the browser at all).

---

## Active Sprint

`planning/sprints/008-supabase-to-neon/`

---

## Active Work

Builder: read `planning/sprints/008-supabase-to-neon/` in full, then stop at the code gate — post a concrete file-by-file plan and wait for explicit approval before writing any code. You have no access to either database; every script is run by the user.

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
| Tech stack | Next.js 14 (App Router), Neon Postgres (Supabase until Sprint 008 ships), single-password cookie login (Supabase Auth until Sprint 008 ships), Tailwind CSS, Vitest, Vercel |

---

## v1 Scope Snapshot

Features are unchanged by Sprint 008 (see `planning/DOMAIN.md`): Pay Period Recap (Sat–Fri weeks, fixed 14-day periods anchored 2026-01-10), per-week modal, History with links to each period, Daily Entry (date picker auto-navigates, leave loads on any date), Settings (incl. Physical Year, 5 themes), Vercel auto-deploy. Sprint 008 changes only where data is stored and how login works.

- Out of scope: any feature change, schema redesign, multi-user, stub paid-hours comparison, deleting the Supabase project (user does that after verifying).

---

## Next Actions

1. Builder executes Sprint 008 from `planning/sprints/008-supabase-to-neon/` only, starting with the mandatory code gate.
2. User confirms the Prev/Next hotfix works live (small, independent).
3. Before cutover the user creates the Neon project and captures "before" screenshots of History and the current Recap for the parity check.

---

## Blockers

None.

---

## Watch Items

- **Cutover safety**: Supabase stays untouched and its Vercel env vars stay in place until the new setup is verified; rollback = redeploy the previous Vercel deployment.
- **Data freeze**: don't log entries between the final data copy and the cutover (a few minutes).
- **Supabase free tier** connects directly over IPv6 only; the copy script should use Supabase's "Session pooler" connection string if the user's network lacks IPv6.
- **Type/timezone parity**: the new data layer must return exactly the shapes the app has always received ('YYYY-MM-DD' strings, ISO timestamps whose characters 11–16 are HH:MM in UTC, numbers for hours). A mismatch would silently shift displayed times.
- Free-tier terms change often (figures come from Neon's own FAQ and third-party comparison pages); confirm on neon.com before cutover.
- The user's DB passwords live in the gitignored `supabase/information.md`; never commit credentials or paste them into chat.
- No duplicate guard on leave entries (accepted). Physical Year and holiday lists may need entries for the coming year.

============================================================
FILE: planning/sprints/008-supabase-to-neon/requirements.md
============================================================

# Sprint 008 Requirements — Move off Supabase (Neon Postgres + single-password login)

## Background

The user needs their second free Supabase project for something else and asked to move Time Tracker's data storage to a free alternative as quickly as practical. Supabase is used in only 7 source files (~39 query calls across `src/lib/data/entries.ts`, `recap.ts`, `settings.ts`; login in `src/lib/auth/actions.ts`, `src/middleware.ts`, `src/lib/supabase/*`), over 10 small tables with a year of data. The tables are plain Postgres, so Neon (free Postgres) can take the schema and data almost unchanged. Neon has no login system, so login is replaced with a single password (Micro-app tier: one user).

## Goals

1. **Neon as the data store**: all reads/writes go to Neon Postgres via a server-only connection string (`DATABASE_URL`). The data-layer functions keep their exact signatures and return shapes.
2. **Single-password login**: one password (scrypt hash in `APP_PASSWORD_HASH`) verified by a server action; a signed, httpOnly session cookie (HMAC-SHA256 with `SESSION_SECRET`) checked by the middleware; sign-out clears it. The login form has just a password field.
3. **Exact data parity**: a user-run copy script moves all 10 tables preserving ids and `created_at`, then proves parity (row count + checksum per table) before cutover.
4. **Backups**: a user-run script exports every table to a restorable `.sql` file (gitignored folder), plus a short restore note, because Neon's free restore window is short.
5. **Clean removal of Supabase code**: no `@supabase/*` imports, packages, or env vars remain in the app; the historical `supabase/*.sql` files stay as records.
6. **Zero behavior change** for the user: every screen, number, and workflow works as before.

## Non-goals (explicitly out of scope)

- No feature changes, no schema redesign (same tables, columns, constraints; only the Supabase-specific parts — row-level-security policies and `auth.role()` — are dropped).
- No second user, no email/password accounts, no password reset flow (changing the password = regenerate the hash and update the env var).
- No stub paid-hours comparison; no leave duplicate guard.
- The Builder does not access either database and does not delete anything; deleting the Supabase project is the user's own later step.
- No change to Vercel hosting, themes, or calculation code.

## Users / Roles

Single user. Access = knowing the password.

## Acceptance Summary

See `acceptance.md`. Headline: all 10 tables match exactly between Supabase and Neon (rows + checksum); the user's History and Recap numbers are identical before and after cutover; login/logout work; add/remove of sessions, leave, break, and settings work on Neon; a backup file restores into a scratch Neon database with matching row counts; no Supabase code or env remains.

============================================================
FILE: planning/sprints/008-supabase-to-neon/blueprint.md
============================================================

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

============================================================
FILE: planning/sprints/008-supabase-to-neon/acceptance.md
============================================================

# Sprint 008 Acceptance — Move off Supabase

Sprint 008 is complete when all of the following are true:

## Code
- No `@supabase/*` import, dependency, or env var remains in `src/`, `package.json`, or `.env.local.example` (grep confirms). `supabase/*.sql` remain as historical records.
- Data-layer function names/signatures/return shapes are unchanged; `src/lib/calculations/*` is untouched.
- `src/lib/db.ts` returns dates as `'YYYY-MM-DD'`, timestamps as ISO strings with `slice(11,16)` = UTC `HH:MM`, numerics as numbers; unit-tested.
- Login: single Password field; correct password signs in; wrong password shows an error (with a short delay); unauthenticated visits redirect to `/login`; sign-out ends the session. Session token tests (valid, tampered, expired, wrong secret) and password tests (round trip, wrong, malformed) pass.
- Settings duplicate-date errors still show their friendly messages (the Postgres unique-violation code `23505` is still detected through the new driver).
- `npm test`, `npx tsc --noEmit`, `npm run build` pass clean.

## Scripts & schema
- `neon/schema.sql` runs cleanly on an empty Neon project and contains no RLS/policy/`auth.role()`/pgcrypto statements; all tables, constraints, and indexes match the Supabase schema.
- `scripts/migrate-supabase-to-neon.mjs` defaults to dry-run; `--reset-target` requires `CONFIRM_RESET=yes` and never touches Supabase; after `--apply` it reports per-table row counts and md5 checksums and exits non-zero on any mismatch. **All 10 tables match** (day_entries, sessions, leave_entries, holidays, weekly_target_settings, break_duration_settings, standard_workday_hours_settings, leave_banks, rolling_balance_seed, physical_year_settings).
- `scripts/hash-password.mjs` produces a working `APP_PASSWORD_HASH` without taking the password on the command line.
- `scripts/backup-db.mjs` writes `backups/time-tracker-YYYY-MM-DD.sql`; `backups/` is gitignored. The user restores one backup into a scratch Neon database once and the row counts match.

## Live (user-checked after cutover)
- Login works with the new password on the deployed site.
- History and the current Recap match the user's "before" screenshots exactly (Rolling Balance, both weeks' Actual/Target/Delta, the History period rows, a week modal's rows and times).
- Add/remove a session, a leave entry, and a break override on the Daily Entry page work and appear immediately (including times displaying correctly, e.g. an 08:00 check-in shows 08:00).
- Adding a setting, a holiday, and a physical year in Settings works.
- Prev/Next and History links still open the right periods.

## Non-goals confirmed untouched
- No feature changes, no second user, no schema redesign, no deletion of the Supabase project by the Builder.

## Regression
- Sprint 002–007 acceptance still holds (leave-only days display, date jump, themes, mobile layout, week modal, Sat–Fri periods).

============================================================
FILE: planning/sprints/008-supabase-to-neon/handoff-prompt.md
============================================================

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

============================================================
FILE: planning/STATUS.json
============================================================

{
  "schemaVersion": 1,
  "phase": "apply-pack",
  "sprint": "008-supabase-to-neon",
  "updated": "2026-11-06"
}
