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
