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
