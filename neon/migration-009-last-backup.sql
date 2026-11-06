-- Sprint 009: remember when the last backup was taken (shown in the app header).
--
-- Run ONCE in the Neon SQL editor, after the Sprint 009 code is deployed.
-- Safe to re-run: it only creates the table if missing and never overwrites a
-- newer value. It touches no other table and deletes nothing.

create table if not exists last_backup (
  id smallint primary key default 1,
  backed_up_at timestamptz not null,
  constraint last_backup_single_row check (id = 1)
);

-- Starting value: the backup taken and stored safely on 2026-11-06.
-- `npm run db:backup` replaces it each time it finishes.
insert into last_backup (id, backed_up_at)
values (1, '2026-11-06T12:00:00Z')
on conflict (id) do nothing;
