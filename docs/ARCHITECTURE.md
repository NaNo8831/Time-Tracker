# Architecture

Time Tracker v1 — architecture defined by the Architect Layer across Packs 001-007.

---

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Neon Postgres (`@neondatabase/serverless`), single-password cookie login, Vercel, Vitest. *(Supabase Postgres + Auth until Sprint 008; superseded below.)*

## Users & Access

Single user, personal use, gated by a single-password login via middleware (Sprint 008; previously Supabase email/password). See "Neon + password login (Sprint 008)".

## Data Model

| Table | Purpose | Key Fields |
|---|---|---|
| `day_entries` | One row per date. | `date` (unique), `break_minutes_override` |
| `sessions` | Check-in/check-out pairs per day. | `day_entry_id`, `check_in`, `check_out` |
| `leave_entries` | Leave hours logged against a date. | `date`, `leave_type`, `hours` |
| `holidays` | Recognized paid holidays. | `date`, `label` |
| `weekly_target_settings` | Effective-dated weekly target hours. | `hours`, `effective_date` (unique) |
| `break_duration_settings` | Effective-dated default break duration. | `minutes`, `effective_date` (unique) |
| `standard_workday_hours_settings` | Effective-dated holiday-credit hours. | `hours`, `effective_date` (unique) |
| `leave_banks` | Effective-dated total hours per leave type. | `leave_type`, `total_hours`, `effective_date` (unique per type) |
| `rolling_balance_seed` | One-time starting offset for Rolling Balance. No UI. | `balance`, `note` |
| `physical_year_settings` | User-entered year date ranges, for Weeks Left in Year. Not effective-dated — looked up by "which range contains this date." | `start_date`, `end_date`, `note` |

All effective-dated tables share the "most recent entry with effective_date <= the date being calculated" lookup rule.

**Critical**: the earliest `weekly_target_settings` entry's `effective_date` determines the first week the whole app computes. As of Sprint 004 this is `2026-01-12`.

**Important**: `leave_entries` is keyed by `date`, NOT by `day_entries` — a day can have leave with no day record (Sprint 006 fixed a bug where the Daily Entry page skipped leave when no day record existed). `day_entries`/`sessions`/`leave_entries` are not restricted to past dates — a user can and does log data (especially leave) for future dates. All weekly/daily calculations must treat "future" purely as "no data yet, naturally contributes 0," never as an artificial hard stop (Sprint 005 fixed a bug where the weekly aggregation incorrectly did the latter).

## Calculation Rules

Rules 1-5, 7-17 unchanged since Sprint 004 — see `planning/DOMAIN.md`. **Rule 6 (Sprint 005)**: Weekly Actual Hours sums Work Hours for all 7 days in a week regardless of the day's relation to "today" — the rule's wording never said otherwise; a day-loop bug that stopped at today was fixed.

`src/lib/calculations/isoWeek.ts` and `physicalYear.ts` implement Sprint 004's rules as standalone, UI-independent, unit-tested modules, same pattern as the rest of `src/lib/calculations/`. Sprint 005 adds `splitWeekActual()` (in `dailyBreakdown.ts` or similar) as a presentation-only split of the same Rule 5/6 total — not a new business rule.

## Screens (v1, updated Sprint 005)

- **Login** — Supabase Auth sign-in.
- **Daily Entry** — first in nav order. Sessions, break override, leave hours, any date past or future. No "Recent Entries" list. Forms refresh via a client-side `router.refresh()` after saving. Leave loads for any date; the date picker navigates on selection (Sprint 006).
- **Pay Period Recap** (landing page) — Week 1 + Week 2 stats, headings "Week 1"/"Week 2" (Sprint 006), (Actual now correctly includes all logged days, not just through-today), Rolling Balance, Leave Remaining (collapsible), Weeks Left in Year, Prev/Next period navigation. **Sprint 005**: no more always-visible 14-day table; each week's "Actual" card opens a modal with that week's 7-day log (with a Day-of-week column) and carries a hover tooltip splitting hours through-today vs. later-this-week (by leave type).
- **History** — every fully-elapsed pay period (excludes the current one), ISO odd/even paired, period-level summary rows only; each period range links to that period's Recap (Sprint 006).
- **Settings** — weekly target, break duration, standard workday hours (under Paid Holidays), leave banks, holidays, Physical Year list, and Appearance (5 color/dark-mode presets).

## Client-side Interactivity

The app is server-rendered by default (Server Components + Server Actions, no client-side data fetching). Three deliberate, scoped exceptions exist so far: the theme picker (`ThemePicker.tsx`), the collapsible section (`CollapsibleSection.tsx`), the form-refresh wrapper (`ActionForm.tsx`), the week drill-down modal (Sprint 005), and the Daily Entry date jump (`DateJump.tsx`, Sprint 006). Each is a small, single-purpose client component — no shared modal/dialog abstraction exists yet; introduce one only if a fourth, differently-shaped case appears.

## Migration

One-time SQL scripts, run directly by the user. Sprint 004's import ran against a LIVE database with real data — strictly additive, no destructive operations, with mandatory regression verification against every previously-proofed number. Completed and verified 2026-07-09.

## Deployment

Live on Vercel (`https://time-tracker-red-six.vercel.app`), GitHub auto-deploy on push to `main`. No OAuth/magic-link/password-reset flows exist, so no redirect-URL allow-list configuration was needed for the deployed domain.

## Out of Scope for v1

See `planning/DOMAIN.md`.

## Pay Cycle (Sprint 007)

Weeks run **Saturday–Friday**; a pay period is a fixed 14-day block (Week 1 + Week 2) anchored at `PAY_CYCLE_ANCHOR = 2026-01-10` in `src/lib/calculations/payCycle.ts` (`payWeekStart`, `payPeriodStart`), matching the user's pay stubs. `isoWeek.ts` and `mondayOf` were removed; `recap.ts`, `periods.ts`, `physicalYear.ts`, the Recap and History pages all use the pay cycle. The Recap's `?period=` value snaps to its period start. The earliest `weekly_target_settings.effective_date` is 2026-01-10 and the rolling-balance seed is -12.12 (the sheet's carried-in balance), applied by `supabase/migration-007-sat-fri-weeks.sql`. Any text elsewhere in this file that mentions Monday–Sunday weeks, ISO week pairing, or the 53-week limitation is historical and superseded by this section.

## Neon + password login (Sprint 008)

Supersedes every Supabase data-access and auth statement above.

- **Database**: Neon Postgres. The tables are unchanged (schema in `neon/schema.sql`; no RLS or policies because the database is reachable only from the server). Connection string in `DATABASE_URL` (pooled host), server-side only.
- **Data layer**: `src/lib/db.ts` exposes `query(text, params)` over the Neon HTTP driver (lazy client). `src/lib/data/{entries,recap,settings}.ts` use parameterized SQL and keep the exported names and row shapes they always had.
- **Shape parity**: SQL casts (`date::text`, `(ts at time zone 'UTC')::text`, `numeric::float8`) plus pure normalizers in `src/lib/dbNormalize.ts` return dates as `YYYY-MM-DD`, timestamps as `YYYY-MM-DDTHH:MM:SS+00:00` (characters 11-16 = UTC HH:MM) and numbers as JS numbers. Inserts convert with `$n::timestamp at time zone 'UTC'`.
- **Login**: `APP_PASSWORD_HASH` (`scrypt:<N>:<salt>:<hash>`, colons because Next expands `$` in env files) verified in `src/lib/auth/password.ts` (Node only). On success `signIn` sets the `tt_session` cookie (`<expiresAtMs>.<hexHmac>`, HMAC-SHA256 with `SESSION_SECRET`, 30 days, httpOnly, secure in production, sameSite=lax) via `src/lib/auth/session.ts` (Web Crypto, so it also runs in Edge middleware). `src/middleware.ts` verifies the cookie; unauthenticated requests go to `/login`. Wrong password: 800 ms delay then `/login?error=...`.
- **Rendering**: with the Supabase client gone, pages no longer read cookies and would be pre-rendered at build; `src/app/(app)/layout.tsx` sets `export const dynamic = "force-dynamic"`.
- **Scripts (user-run)**: `db:hash-password`, `db:migrate` (Supabase to Neon copy with count + md5 parity check), `db:backup` (SQL export to gitignored `backups/`). Procedures in `docs/OPERATIONS.md`.
- **Env vars**: `DATABASE_URL`, `APP_PASSWORD_HASH`, `SESSION_SECRET` (plus one-time `SUPABASE_DB_URL` for the copy). `@supabase/*` packages and `src/lib/supabase/` are removed; `supabase/*.sql` is kept as history.

## Last-backup note and Today link (Sprint 009)

- **`last_backup` table** (`neon/schema.sql`, `neon/migration-009-last-backup.sql`): one row at most (`id` is always 1, `backed_up_at timestamptz`). Bookkeeping only; deliberately not in `scripts/lib/tables.mjs`, so it is not in the backup export or the Supabase copy parity check.
- **Writer**: `scripts/backup-db.mjs` upserts the row after the backup file is saved. A failure to record prints a note and never fails or alters the backup.
- **Reader**: `src/lib/data/backup.ts` `getLastBackupAt()` returns the timestamp or `null`, and never throws (a missing table or a failed query shows "No backup yet", so no page can break).
- **Text/colour logic**: pure `src/lib/calculations/backupStatus.ts` `describeBackup()` (fixed English month names, UTC, stale when more than `STALE_AFTER_DAYS` = 35).
- **Header**: `src/components/Nav.tsx` is an async server component; the note sits between the links and Sign out, full text from the `sm` breakpoint up and date-only below it. New theme token `--color-warning` (all 5 themes).
- **Recap Today link**: pure `periodNav()` in `src/lib/calculations/payCycle.ts` returns `prev`/`next` (+/-14 days) and `isCurrent`; `src/app/(app)/page.tsx` shows `Prev, Today, Next`, with Today greyed out and not a link when `isCurrent`.
