-- Time Tracker v1 schema.
-- Run this once in the Supabase SQL editor against a fresh project.
-- See planning/architect-packs/architect-pack-002-core-mvp-build.md,
-- planning/architect-packs/architect-pack-003-break-rework-and-migration.md,
-- and docs/ARCHITECTURE.md for the design this implements.
--
-- If you already have a live project built from the Sprint 002 version of
-- this file, do NOT re-run this whole script — use
-- supabase/schema-migration-003-break-rework.sql instead to bring an
-- existing database up to this same end-state.

create extension if not exists "pgcrypto";

-- One row per date. break_minutes_override is a manual per-day override
-- (multiple of 15 minutes); when null, the break_duration_settings value in
-- effect for that date is used instead (see Business Rule 2).
create table if not exists day_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  break_minutes_override integer,
  created_at timestamptz not null default now(),
  constraint day_entries_break_override_multiple_of_15
    check (break_minutes_override is null or break_minutes_override % 15 = 0),
  constraint day_entries_break_override_non_negative
    check (break_minutes_override is null or break_minutes_override >= 0)
);

-- One or more check-in/check-out pairs per day.
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  day_entry_id uuid not null references day_entries (id) on delete cascade,
  check_in timestamptz not null,
  check_out timestamptz not null,
  created_at timestamptz not null default now(),
  constraint sessions_check_out_after_check_in check (check_out > check_in)
);

-- Vacation/sick/paternity hours logged against a date (full or partial day).
create table if not exists leave_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  leave_type text not null check (leave_type in ('vacation', 'sick', 'paternity')),
  hours numeric not null check (hours > 0),
  created_at timestamptz not null default now()
);

-- User-maintained list of recognized paid holidays.
create table if not exists holidays (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  label text not null,
  created_at timestamptz not null default now()
);

-- Effective-dated weekly target hours. One entry per effective_date — a
-- second value for a date already logged must be a correction (edit/delete
-- the existing row), not a duplicate row with the same date.
create table if not exists weekly_target_settings (
  id uuid primary key default gen_random_uuid(),
  hours numeric not null,
  effective_date date not null unique,
  created_at timestamptz not null default now()
);

-- Effective-dated default break duration (minutes), used when a day has no
-- break_minutes_override. One entry per effective_date.
create table if not exists break_duration_settings (
  id uuid primary key default gen_random_uuid(),
  minutes numeric not null,
  effective_date date not null unique,
  created_at timestamptz not null default now()
);

-- Effective-dated hours credited automatically for a holiday. One entry per effective_date.
create table if not exists standard_workday_hours_settings (
  id uuid primary key default gen_random_uuid(),
  hours numeric not null,
  effective_date date not null unique,
  created_at timestamptz not null default now()
);

-- Effective-dated total hours per leave type (vacation/sick/paternity). One
-- entry per (leave_type, effective_date) pair.
create table if not exists leave_banks (
  id uuid primary key default gen_random_uuid(),
  leave_type text not null check (leave_type in ('vacation', 'sick', 'paternity')),
  total_hours numeric not null,
  effective_date date not null,
  note text,
  created_at timestamptz not null default now(),
  constraint leave_banks_type_effective_date_unique unique (leave_type, effective_date)
);

-- A one-time starting offset for Rolling Balance, representing pre-app
-- history (e.g. a source spreadsheet's own running total). No Settings UI
-- for this — set once via SQL during a historical migration. At most one
-- row is expected to exist at a time; if more than one is ever inserted,
-- the application uses the most recently created row.
create table if not exists rolling_balance_seed (
  id uuid primary key default gen_random_uuid(),
  balance numeric not null,
  note text,
  created_at timestamptz not null default now()
);

-- Row Level Security: single-account v1. Every table is readable/writable by
-- any authenticated session, not scoped by a user_id column.
-- See planning/DECISIONS.md (2026-07-09) for the reasoning and the accepted
-- risk if a second account is ever added.

alter table day_entries enable row level security;
alter table sessions enable row level security;
alter table leave_entries enable row level security;
alter table holidays enable row level security;
alter table weekly_target_settings enable row level security;
alter table break_duration_settings enable row level security;
alter table standard_workday_hours_settings enable row level security;
alter table leave_banks enable row level security;
alter table rolling_balance_seed enable row level security;

create policy "authenticated_all_day_entries" on day_entries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all_sessions" on sessions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all_leave_entries" on leave_entries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all_holidays" on holidays
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all_weekly_target_settings" on weekly_target_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all_break_duration_settings" on break_duration_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all_standard_workday_hours_settings" on standard_workday_hours_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all_leave_banks" on leave_banks
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_all_rolling_balance_seed" on rolling_balance_seed
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create index if not exists sessions_day_entry_id_idx on sessions (day_entry_id);
create index if not exists leave_entries_date_idx on leave_entries (date);
-- No separate effective_date indexes needed for the three settings tables or
-- leave_banks: their unique constraints above already create matching indexes.
