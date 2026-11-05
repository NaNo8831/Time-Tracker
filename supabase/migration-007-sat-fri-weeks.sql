-- Sprint 007: align weeks and pay periods with the user's pay stubs.
-- Weeks become Saturday–Friday; pay periods are fixed 14-day blocks anchored at
-- Sat 2026-01-10. This script lines the database up with the new app code.
--
-- RUN ORDER: deploy the Sprint 007 code first (merge the PR, wait for Vercel),
-- THEN run this script immediately in the Supabase SQL editor. Between the
-- deploy and this script the app's week/period figures are briefly off
-- (read-only display; do not log entries in that window).
--
-- Additive and safe to re-run: no deletes, no truncates. Every step checks
-- before acting, so running it twice changes nothing the second time.
--
-- Verified before release (see planning/DECISIONS.md, 2026-11-05): with seed
-- -12.12 at 2026-01-10 and Sat–Fri weeks, the app's weekly Actual and rolling
-- balance match the user's sheet for all 24 weeks from Jan 10 through Jun 26.

-- 1. Import 2026-01-10 (Sat): one session 07:00-11:15 (4.25 hrs). 2026-01-11 was
--    an empty day, so there is nothing to insert for it.
do $$
declare
  new_day_id uuid;
begin
  if not exists (select 1 from day_entries where date = '2026-01-10') then
    insert into day_entries (date) values ('2026-01-10') returning id into new_day_id;
    insert into sessions (day_entry_id, check_in, check_out)
    values (new_day_id, '2026-01-10T07:00:00', '2026-01-10T11:15:00');
  end if;
end $$;

-- 2. Move the three settings' effective date from 2026-01-12 to 2026-01-10 so the
--    first tracked week starts on the Saturday. Values are unchanged.
update weekly_target_settings
  set effective_date = '2026-01-10'
  where effective_date = '2026-01-12';

update break_duration_settings
  set effective_date = '2026-01-10'
  where effective_date = '2026-01-12';

update standard_workday_hours_settings
  set effective_date = '2026-01-10'
  where effective_date = '2026-01-12';

-- 3. Rolling balance seed: the sheet's own carried-in balance at 2026-01-10
--    (replaces -7.87, which was derived for a Monday 2026-01-12 start).
with s as (
  select id from rolling_balance_seed order by created_at desc limit 1
)
update rolling_balance_seed
  set balance = -12.12,
      note = 'Sprint 007: the sheet''s carried-in balance at 2026-01-10 (Saturday–Friday weeks, pay cycle anchored at 2026-01-10).'
  where id = (select id from s);

-- Quick checks (read-only) — run these after the script:
--   select date from day_entries where date = '2026-01-10';                -- 1 row
--   select effective_date from weekly_target_settings order by 1 limit 1;  -- 2026-01-10
--   select balance from rolling_balance_seed order by created_at desc limit 1; -- -12.12
