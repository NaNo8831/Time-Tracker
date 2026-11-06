-- Time Tracker schema for Neon Postgres (Sprint 008).
-- Run once in the Neon SQL editor against an EMPTY project (the "production" branch).
-- Safe to re-run: every statement uses "if not exists".
--
-- This is the same schema the app has used on Supabase, minus the
-- Supabase-specific parts: no row-level-security policies (they depended on
-- Supabase's auth.role()) and no pgcrypto extension (gen_random_uuid() is
-- built in). The database is only ever reached from the server through the
-- secret DATABASE_URL, never from the browser.
--
-- Column ORDER differs from the live Supabase tables in places (e.g.
-- day_entries); that is fine — the copy script maps columns by name.

-- One row per date. break_minutes_override is a manual per-day override
-- (multiple of 15 minutes); when null, the break_duration_settings value in
-- effect for that date is used instead (Business Rule 2).
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

-- Effective-dated weekly target hours. One entry per effective_date.
create table if not exists weekly_target_settings (
  id uuid primary key default gen_random_uuid(),
  hours numeric not null,
  effective_date date not null unique,
  created_at timestamptz not null default now()
);

-- Effective-dated default break duration (minutes). One entry per effective_date.
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

-- Effective-dated total hours per leave type. One entry per (leave_type, effective_date).
create table if not exists leave_banks (
  id uuid primary key default gen_random_uuid(),
  leave_type text not null check (leave_type in ('vacation', 'sick', 'paternity')),
  total_hours numeric not null,
  effective_date date not null,
  note text,
  created_at timestamptz not null default now(),
  constraint leave_banks_type_effective_date_unique unique (leave_type, effective_date)
);

-- One-time starting offset for the Rolling Balance (pre-app history). At most
-- one row is expected; if more exist, the app uses the most recently created.
create table if not exists rolling_balance_seed (
  id uuid primary key default gen_random_uuid(),
  balance numeric not null,
  note text,
  created_at timestamptz not null default now()
);

-- User-entered "physical year" date ranges, used for Weeks Left in Year.
create table if not exists physical_year_settings (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  note text,
  created_at timestamptz not null default now(),
  constraint physical_year_end_after_start check (end_date > start_date)
);

create index if not exists sessions_day_entry_id_idx on sessions (day_entry_id);
create index if not exists leave_entries_date_idx on leave_entries (date);

-- When the last backup (npm run db:backup) finished; shown in the app header.
-- One row at most (id is always 1). Bookkeeping only: NOT part of the backup
-- export or the Supabase copy. A fresh database starts with no row ("No backup yet").
create table if not exists last_backup (
  id smallint primary key default 1,
  backed_up_at timestamptz not null,
  constraint last_backup_single_row check (id = 1)
);
