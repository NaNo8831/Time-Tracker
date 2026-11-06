# Sprint 009 Blueprint — Last-backup note + Today link

## 0. Principles

- Smallest change that does the job: one tiny table, one data function, one pure helper per feature, two small UI edits.
- The Builder has **no database access**. It writes the SQL and script changes; the **user** runs them. Never print, log, commit or ask for secrets or connection strings.
- The backup lookup must **never throw into a page**: if the table is missing or the query fails, the header shows `No backup yet`.
- Pure, unit-tested helpers for everything with logic (age/label/tone; current-period detection and link targets).

## 1. Database

### `neon/migration-009-last-backup.sql` (new — the user runs it once in the Neon SQL editor)

Idempotent (safe to re-run), additive, no deletes:

- Create `last_backup`: single-row table — `id smallint primary key default 1 check (id = 1)`, `backed_up_at timestamptz not null`.
- Insert the starting row for the backup already taken: `backed_up_at = '2026-11-06T12:00:00Z'`, `on conflict (id) do nothing` (so re-running never overwrites a newer real backup).

### `neon/schema.sql` (edit)

Append the same `create table if not exists last_backup (...)` (no seed row) so a fresh/restored database has the table. Keep the file idempotent.

The table is **not** added to `scripts/lib/tables.mjs` `TABLES`: it is not user data and must not appear in the backup export or the Supabase→Neon copy/parity script.

## 2. Backup script: `scripts/backup-db.mjs` (edit)

After the backup file is successfully written (and only then), run one upsert:
`insert into last_backup (id, backed_up_at) values (1, now()) on conflict (id) do update set backed_up_at = excluded.backed_up_at`.

- Wrap it in try/catch. On failure (e.g. the migration has not been run yet) print a plain-English note — "Backup saved, but the date could not be recorded in the app. Run neon/migration-009-last-backup.sql in Neon, then back up again." — and **exit 0**. A recording failure must never fail, hide, or alter a successful backup.
- On success print one extra line: "Recorded in the app header." Do not change the file contents/format or the row-count output.
- Update the file's header comment (it says "Read-only"): it now writes exactly one row, `last_backup`, after the file is saved.

## 3. Data layer: `src/lib/data/backup.ts` (new)

- `getLastBackupAt(): Promise<string | null>` — `select backed_up_at::text ...` normalized via the existing `toTimestampText` helper (`src/lib/dbNormalize.ts`) to the app's `YYYY-MM-DDTHH:MM:SS+00:00` shape; `null` when there is no row.
- The whole function is wrapped in try/catch and returns `null` on any error (missing table before the SQL is run, network blip). It never throws.

## 4. Pure helper: `src/lib/calculations/backupStatus.ts` (new)

- `describeBackup(lastBackupAt: string | null, now: Date): { label: string; shortLabel: string; stale: boolean }`.
  - `null` or unparseable input → `label`/`shortLabel` = `No backup yet`, `stale: true`.
  - Whole-day age = floor of (now − backup) in days, using UTC; never negative (a future-dated value, e.g. clock skew, is treated as 0 days = `today`).
  - `label`: `Last backup: <Mon D> (<age>)`, `<age>` = `today` | `1 day ago` | `N days ago`; the `, YYYY` suffix is added to the date only when the backup's year differs from `now`'s year. `shortLabel`: `Last backup: <Mon D>` (no age part).
  - `stale` = age in days **> 35**.
  - English month abbreviations come from a fixed array — no locale/`Intl` dependence (the server and browser must render identically).
- Export `STALE_AFTER_DAYS = 35` so the threshold is a named constant.

## 5. Header UI: `src/components/Nav.tsx` (edit)

- Make `Nav` an async server component that awaits `getLastBackupAt()` and calls `describeBackup(...)` with `new Date()`.
- Layout: keep the links on the left. The right side becomes `<div className="flex items-center gap-4">` holding the backup note (a `<span>`, small, `text-xs`) followed by the existing Sign out form. Full `label` from the `sm` breakpoint up; below `sm` show `shortLabel` only (e.g. render both spans with `hidden sm:inline` / `sm:hidden`). Must not cause horizontal scroll at 375 px width.
- Colour: muted token normally; the new `--color-warning` token when `stale`. Add `title="Run npm run db:backup and keep the file somewhere safe"` as a hover hint (plain text, no claims).
- The layout already has `dynamic = "force-dynamic"` (`src/app/(app)/layout.tsx`), so the note is fresh on every request; do not change that.

### Theme token: `--color-warning`

There is no amber token today. Add `--color-warning` to **every** theme block in `src/app/globals.css` (all 5 themes): a readable amber on that theme's card background (suggested `#b45309` on light themes, `#fbbf24` on the dark theme — Builder verifies contrast against the nav background). Add a row to the token table in `docs/THEMING.md`.

## 6. Recap "Today" link

### Pure helper: add to `src/lib/calculations/payCycle.ts`

`periodNav(week1Start: IsoDate, today: IsoDate): { prev: IsoDate; next: IsoDate; isCurrent: boolean }`

- `prev` = `week1Start − 14 days`, `next` = `week1Start + 14 days` (exactly today's values in `page.tsx`).
- `isCurrent` = `week1Start === payPeriodStart(today)`.

### `src/app/(app)/page.tsx` (edit)

Replace the inline `prevPeriod`/`nextPeriod` with `periodNav(...)`. The link row becomes `← Prev`, **`Today`**, `Next →`:

- `Today` is a `<Link href="/">` styled like the others when `!isCurrent`.
- When `isCurrent`, render a non-link `<span aria-disabled="true">` in the faint text colour with no underline (greyed out, not focusable/clickable).
- Prev and Next hrefs/behaviour are unchanged. The "before your tracked history" empty state is untouched (no Today link needed there).

## 7. Tests (Vitest, no database needed)

- `tests/calculations/backupStatus.test.ts`: `null`/garbage → `No backup yet` + stale; same-day → `today`; 1 day → `1 day ago`; N days; exactly 35 days → not stale; 36 days → stale; year suffix only when the year differs; future timestamp → `today`, not stale; labels contain no locale-dependent text.
- Extend `tests/calculations/payCycle.test.ts` (or add `periodNav.test.ts`): `isCurrent` true for the current period start, false for a past and a future period start; `prev`/`next` are ±14 days; a mid-period `today` still marks its own period start current.
- All existing 114+ tests keep passing; no assertions weakened.

## 8. Docs

- `docs/OPERATIONS.md` (Backups section): describe the header note, what it does and does not mean, the amber threshold, and add the one-time step: run `neon/migration-009-last-backup.sql` in the Neon SQL editor (after the code is deployed), then reload the app.
- `docs/ARCHITECTURE.md`: note the `last_backup` table, `backup.ts`, `backupStatus.ts`, and the Nav change under the Neon section. `docs/VALIDATION.md`: Sprint 009 checks. `planning/FILE_INVENTORY.md`: new files.

## 9. Release order (the Builder writes these steps into `docs/OPERATIONS.md`; the user performs them)

1. Merge the PR; Vercel deploys. The header shows `No backup yet` (amber) — expected until step 2.
2. In the Neon SQL editor, run `neon/migration-009-last-backup.sql`. Reload the app: the header shows `Last backup: Nov 6 (N days ago)`.
3. Next time the user runs `npm run db:backup`, the script prints "Recorded in the app header." and the date updates.

No data freeze is needed; nothing existing is modified.

## Out of Scope

Automated backups, notifications, backup history, an in-app backup button, any change to calculations or existing tables.
