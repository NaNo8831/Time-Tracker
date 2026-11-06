# Validation

Per the Micro-app rigor profile: cover the happy path and the one or two failure modes that would lose the user's data. Do not over-test.

## Sprint 009 Validation (done 2026-11-06 by the Builder; live checks by the user after deploy + SQL)

- `npx tsc --noEmit` clean, `npx vitest run` 123/123 (9 new: backup status labels/boundary/year/future/garbage, `periodNav`), `npm run build` clean.
- `neon/schema.sql` and `neon/migration-009-last-backup.sql` run against PGlite (in-process Postgres): schema twice is safe; the migration seeds 2026-11-06 12:00 UTC once, a re-run does not overwrite a newer value; `id = 2` is rejected; the migration also works alone on an empty database.
- `scripts/backup-db.mjs` syntax-checked; the recording step is wrapped so a failure cannot affect the saved file.
- **Not verified by the Builder (user, after deploy)**: the header before the SQL (`No backup yet`, amber, pages still load), after the SQL (`Last backup: Nov 6 (N days ago)`), after the next `npm run db:backup` ("Recorded in the app header." and today's date), the Today link on current/past periods, and the phone-width header. The Builder did not render the signed-in UI (no database access, password unknown).

## Sprint 008 Validation (done 2026-11-06 by the Builder; live checks by the user at cutover)

- `npx tsc --noEmit` clean, `npx vitest run` 114/114, `npm run build` clean (after adding `force-dynamic`).
- New tests: session token (valid, expiry boundary, wrong secret, tampered, extended expiry, malformed), password hashing round trip through the real script, row-shape parity of the normalizers (08:00 stays 08:00).
- Schema and every query were run against PGlite (in-process real Postgres) because the Builder has no database access.
- Login smoke test on a throwaway dev server: signed-out visit redirects to `/login`; form has only a Password field; wrong password shows "Incorrect password."; correct password sets the cookie and `/login` then redirects to `/`.
- **Not verified by the Builder (user, at cutover)**: real Neon connectivity, the copy script's count/checksum match on real data, before/after screenshots of History and Recap, add/remove of a session, leave, break and setting on a scratch date, Prev/Next, and a test restore of a backup. See `docs/OPERATIONS.md`.

## Sprint 007 Validation Priorities (done 2026-11-05; live checks by the user after deploy + SQL)

- **Highest priority — reconciliation against the sheet**: every Sat–Fri week Jan 10 → Jun 26 must match the sheet's printed weekly Actual (±0.02) and rolling balance (±0.05) before the SQL is released.
- Period boundaries equal the user's stubs: Sep 19–Oct 2, Oct 3–Oct 16, Oct 17–Oct 30; current period Oct 31–Nov 13.
- No remaining references to ISO weeks or Monday-based weeks in `src/` or `tests/`.

## Sprint 005 Validation Priorities

- **Highest priority — the bug's own regression check**: a day after today with real logged data (sessions or leave) must count toward that week's Actual/Delta. Spot-check against the user's own reported case (2026-07-15/16/17 and 2026-07-20–07-24).
- **Isolation checks**: History tab numbers unchanged; Rolling Balance unchanged for the same inputs. Both should be provable by running the existing test suites unmodified plus one live spot-check each.
- **Split-total identity**: `splitWeekActual()`'s two totals must sum to exactly the week's `actualHours` — add this as an explicit test, not just a manual check.
- **Modal behavior**: opens from either week's Actual card, shows the right 7 rows with a working Day column, dismissible, and works the same whether viewing the current period or one reached via Prev/Next.

## Sprint 004 Validation Priorities (carried forward, already complete)

- The live-data regression check (2026-05-04–2026-06-26 reproduced exactly) — done, user-verified 2026-07-09.
- Pay Period week-extension isolation — done.
- ISO week number correctness — done, unit-tested.
- Migration spot-checks — done, user-verified.

## Deferred

- Full manual walkthrough of every day is not required — targeted spot-checks plus the automated suite are sufficient per the Micro-app rigor tier.
- The 53-ISO-week-year edge case and 2026-01-01–01-09 recovery remain explicitly deferred.
- History tab per-week drill-down: explicitly out of scope, not validated.
