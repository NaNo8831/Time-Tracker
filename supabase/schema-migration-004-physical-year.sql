-- Sprint 004: Physical Year setting (for "Weeks Left in Year").
-- Run this ONCE in the Supabase SQL editor against the live project.
-- Purely additive: creates one new table, touches nothing existing.
-- Safe to re-run from the top if a previous attempt partially applied.

create table if not exists physical_year_settings (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  note text,
  created_at timestamptz not null default now(),
  constraint physical_year_end_after_start check (end_date > start_date)
);

alter table physical_year_settings enable row level security;
drop policy if exists "authenticated_all_physical_year_settings" on physical_year_settings;
create policy "authenticated_all_physical_year_settings" on physical_year_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
