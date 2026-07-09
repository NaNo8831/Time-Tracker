-- Sprint 003: break model rework + rolling balance seed.
-- Run this ONCE in the Supabase SQL editor against your existing live
-- project (the one already built from the Sprint 002 schema.sql).
-- Do NOT re-run the full schema.sql over a live project — this script
-- brings an existing database up to the same end-state safely.
--
-- Safe to run on the current live database: day_entries and
-- lunch_duration_settings are both empty (post-TRUNCATE), so this is a
-- clean structural change, not a data-preserving migration.
--
-- Written to be safe to re-run from the top even if a previous attempt
-- partially applied (each step checks before acting).

-- 1. day_entries: replace lunch_taken (boolean) with break_minutes_override.
alter table day_entries drop column if exists lunch_taken;
alter table day_entries add column if not exists break_minutes_override integer;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'day_entries_break_override_multiple_of_15'
  ) then
    alter table day_entries add constraint day_entries_break_override_multiple_of_15
      check (break_minutes_override is null or break_minutes_override % 15 = 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'day_entries_break_override_non_negative'
  ) then
    alter table day_entries add constraint day_entries_break_override_non_negative
      check (break_minutes_override is null or break_minutes_override >= 0);
  end if;
end $$;

-- 2. Rename lunch_duration_settings -> break_duration_settings (table,
--    unique constraint, and RLS policy all need renaming). Only rename the
--    table if it hasn't already been renamed by a previous partial run.
do $$
begin
  if exists (select 1 from pg_tables where tablename = 'lunch_duration_settings') then
    alter table lunch_duration_settings rename to break_duration_settings;
  end if;
end $$;

-- The live unique constraint was originally added via a separate ALTER
-- script during Sprint 002 hardening with an explicit name ending in
-- "_unique" (NOT the Postgres-default "_key" suffix a constraint declared
-- inline in CREATE TABLE would get). Rename whichever one actually exists.
do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'lunch_duration_settings_effective_date_unique'
  ) then
    alter table break_duration_settings
      rename constraint lunch_duration_settings_effective_date_unique
      to break_duration_settings_effective_date_unique;
  elsif exists (
    select 1 from pg_constraint where conname = 'lunch_duration_settings_effective_date_key'
  ) then
    alter table break_duration_settings
      rename constraint lunch_duration_settings_effective_date_key
      to break_duration_settings_effective_date_unique;
  end if;
end $$;

drop policy if exists "authenticated_all_lunch_duration_settings" on break_duration_settings;
drop policy if exists "authenticated_all_break_duration_settings" on break_duration_settings;
create policy "authenticated_all_break_duration_settings" on break_duration_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- 3. New rolling_balance_seed table.
create table if not exists rolling_balance_seed (
  id uuid primary key default gen_random_uuid(),
  balance numeric not null,
  note text,
  created_at timestamptz not null default now()
);
alter table rolling_balance_seed enable row level security;
drop policy if exists "authenticated_all_rolling_balance_seed" on rolling_balance_seed;
create policy "authenticated_all_rolling_balance_seed" on rolling_balance_seed
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
