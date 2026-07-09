-- Sprint 003: historical data import, 2026-05-02 through 2026-06-26 (8 weeks).
-- Run this ONCE in the Supabase SQL editor, AFTER schema-migration-003-break-rework.sql
-- has been applied and the app's break-model code changes are live.
--
-- Source: references/source-app/sheet-export-2026-05-02-to-2026-05-29.csv
--         references/source-app/sheet-export-2026-05-30-to-2026-06-26.csv
-- See planning/sprints/003-break-rework-and-migration/blueprint.md for the
-- mapping rules this script implements.
--
-- Days with zero sessions, no leave/ADJ code, and not a holiday are
-- intentionally omitted — the app treats a missing date as zero
-- contribution automatically.

-- ============================================================
-- Settings (all effective 2026-05-04 — the Monday of the first FULL
-- Monday-Sunday week with real activity. The source sheet groups weeks
-- Saturday-Friday (its own "Week Summary" blocks), but the app groups
-- Monday-Sunday (Business Rule 4/7 — already locked). Using 2026-04-27
-- (the Monday of the week merely containing 2026-05-02) would create an
-- extra, differently-bounded first week and a wrong first-week checkpoint;
-- 2026-05-04 aligns the app's week boundaries so every week from the 2nd
-- one onward lands on the exact same Rolling Balance as the sheet itself
-- (see acceptance.md for the verified week-by-week values). Do NOT use an
-- earlier placeholder date either — see planning/RISKS.md for the
-- phantom-empty-week risk.)
-- ============================================================

insert into weekly_target_settings (hours, effective_date)
values (32, '2026-05-04');

insert into break_duration_settings (minutes, effective_date)
values (0, '2026-05-04');

insert into standard_workday_hours_settings (hours, effective_date)
values (6.4, '2026-05-04');

-- Paternity bank: seeded with the sheet's already-known Remaining value
-- (Total 64, Used 23.2, Remaining 40.8) as of just before this import
-- window — no "P" code appears in either source CSV, so no prior usage
-- needs to be reconstructed.
insert into leave_banks (leave_type, total_hours, effective_date, note)
values (
  'paternity',
  40.8,
  '2026-05-01',
  'Carried over from pre-migration tracking (sheet showed Total 64 / Used 23.2 / Remaining 40.8 as of this window).'
);

insert into holidays (date, label)
values ('2026-05-25', 'Memorial Day');

-- Rolling Balance Seed: the sheet's own running balance immediately before
-- the week of 2026-05-02. Must be replaced (not added to) if an earlier
-- import (e.g. January 2026) later becomes the new earliest tracked week.
insert into rolling_balance_seed (balance, note)
values (
  -27.67,
  'Seeded from source Google Sheet running balance immediately before the week of 2026-05-02. Replace if an earlier import later becomes the new earliest tracked week.'
);

-- ============================================================
-- Week of 2026-05-02 (Sat) - 2026-05-08 (Fri)
-- ============================================================

-- 2026-05-04: session only
with d as (
  insert into day_entries (date) values ('2026-05-04') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-04T16:00:00', '2026-05-04T17:00:00' from d;

-- 2026-05-05: session only
with d as (
  insert into day_entries (date) values ('2026-05-05') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-05T08:00:00', '2026-05-05T15:00:00' from d;

-- 2026-05-06: session only
with d as (
  insert into day_entries (date) values ('2026-05-06') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-06T08:00:00', '2026-05-06T16:00:00' from d;

-- 2026-05-07: session only
with d as (
  insert into day_entries (date) values ('2026-05-07') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-07T08:00:00', '2026-05-07T15:45:00' from d;

-- 2026-05-08: session only
with d as (
  insert into day_entries (date) values ('2026-05-08') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-08T08:00:00', '2026-05-08T17:00:00' from d;

-- ============================================================
-- Week of 2026-05-09 (Sat) - 2026-05-15 (Fri)
-- ============================================================

-- 2026-05-09: two sessions, no ADJ
with d as (
  insert into day_entries (date) values ('2026-05-09') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, v.check_in, v.check_out from d, (values
  ('2026-05-09T06:00:00'::timestamptz, '2026-05-09T08:30:00'::timestamptz),
  ('2026-05-09T20:00:00'::timestamptz, '2026-05-09T21:00:00'::timestamptz)
) as v(check_in, check_out);

-- 2026-05-11: session only
with d as (
  insert into day_entries (date) values ('2026-05-11') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-11T10:00:00', '2026-05-11T11:30:00' from d;

-- 2026-05-12: session only
with d as (
  insert into day_entries (date) values ('2026-05-12') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-12T08:00:00', '2026-05-12T17:00:00' from d;

-- 2026-05-13: session only
with d as (
  insert into day_entries (date) values ('2026-05-13') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-13T08:00:00', '2026-05-13T14:00:00' from d;

-- 2026-05-14: session + "x" break override (1 hour = 60 minutes)
with d as (
  insert into day_entries (date, break_minutes_override) values ('2026-05-14', 60) returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-14T08:00:00', '2026-05-14T14:15:00' from d;

-- 2026-05-15: session only (sheet listed check-in as "8:00:00 AM")
with d as (
  insert into day_entries (date) values ('2026-05-15') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-15T08:00:00', '2026-05-15T15:15:00' from d;

-- ============================================================
-- Week of 2026-05-16 (Sat) - 2026-05-22 (Fri)
-- ============================================================

-- 2026-05-18: session only
with d as (
  insert into day_entries (date) values ('2026-05-18') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-18T17:00:00', '2026-05-18T20:15:00' from d;

-- 2026-05-19: session only
with d as (
  insert into day_entries (date) values ('2026-05-19') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-19T08:00:00', '2026-05-19T16:30:00' from d;

-- 2026-05-20: session + vacation leave (4 hrs)
with d as (
  insert into day_entries (date) values ('2026-05-20') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-20T08:00:00', '2026-05-20T12:00:00' from d;

insert into leave_entries (date, leave_type, hours)
values ('2026-05-20', 'vacation', 4);

-- 2026-05-21: session only
with d as (
  insert into day_entries (date) values ('2026-05-21') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-21T08:00:00', '2026-05-21T16:30:00' from d;

-- 2026-05-22: session only
with d as (
  insert into day_entries (date) values ('2026-05-22') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-22T08:00:00', '2026-05-22T13:30:00' from d;

-- ============================================================
-- Week of 2026-05-23 (Sat) - 2026-05-29 (Fri)
-- ============================================================

-- 2026-05-25: holiday only (Memorial Day, already in the holidays table
-- above) — no session, no day_entries row needed. Holiday Credit applies
-- automatically from holidays + standard_workday_hours_settings.

-- 2026-05-26: session only
with d as (
  insert into day_entries (date) values ('2026-05-26') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-26T08:00:00', '2026-05-26T15:00:00' from d;

-- 2026-05-27: session only
with d as (
  insert into day_entries (date) values ('2026-05-27') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-27T08:00:00', '2026-05-27T16:00:00' from d;

-- 2026-05-28: session only
with d as (
  insert into day_entries (date) values ('2026-05-28') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-28T08:00:00', '2026-05-28T16:30:00' from d;

-- 2026-05-29: session + vacation leave (8 hrs)
with d as (
  insert into day_entries (date) values ('2026-05-29') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-29T10:30:00', '2026-05-29T14:30:00' from d;

insert into leave_entries (date, leave_type, hours)
values ('2026-05-29', 'vacation', 8);

-- ============================================================
-- Week of 2026-05-30 (Sat) - 2026-06-05 (Fri)
-- ============================================================

-- 2026-06-02: session only
with d as (
  insert into day_entries (date) values ('2026-06-02') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-06-02T08:00:00', '2026-06-02T16:45:00' from d;

-- 2026-06-03: session only
with d as (
  insert into day_entries (date) values ('2026-06-03') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-06-03T08:00:00', '2026-06-03T15:00:00' from d;

-- 2026-06-04: session + sick leave (4 hrs)
with d as (
  insert into day_entries (date) values ('2026-06-04') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-06-04T08:00:00', '2026-06-04T12:00:00' from d;

insert into leave_entries (date, leave_type, hours)
values ('2026-06-04', 'sick', 4);

-- 2026-06-05: session + vacation leave (4 hrs)
with d as (
  insert into day_entries (date) values ('2026-06-05') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-06-05T08:00:00', '2026-06-05T13:00:00' from d;

insert into leave_entries (date, leave_type, hours)
values ('2026-06-05', 'vacation', 4);

-- ============================================================
-- Week of 2026-06-06 (Sat) - 2026-06-12 (Fri)
-- ============================================================

-- 2026-06-08: session only
with d as (
  insert into day_entries (date) values ('2026-06-08') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-06-08T10:00:00', '2026-06-08T14:00:00' from d;

-- 2026-06-09: session only
with d as (
  insert into day_entries (date) values ('2026-06-09') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-06-09T08:00:00', '2026-06-09T16:45:00' from d;

-- 2026-06-10: session only
with d as (
  insert into day_entries (date) values ('2026-06-10') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-06-10T08:00:00', '2026-06-10T16:30:00' from d;

-- 2026-06-11: two sessions + sick leave (2 hrs); sheet's second check-in
-- was written as "2:00:00 PM" = 14:00
with d as (
  insert into day_entries (date) values ('2026-06-11') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, v.check_in, v.check_out from d, (values
  ('2026-06-11T09:30:00'::timestamptz, '2026-06-11T13:00:00'::timestamptz),
  ('2026-06-11T14:00:00'::timestamptz, '2026-06-11T16:30:00'::timestamptz)
) as v(check_in, check_out);

insert into leave_entries (date, leave_type, hours)
values ('2026-06-11', 'sick', 2);

-- 2026-06-12: session + vacation leave (4 hrs)
with d as (
  insert into day_entries (date) values ('2026-06-12') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-06-12T10:00:00', '2026-06-12T15:30:00' from d;

insert into leave_entries (date, leave_type, hours)
values ('2026-06-12', 'vacation', 4);

-- ============================================================
-- Week of 2026-06-13 (Sat) - 2026-06-19 (Fri)
-- ============================================================

-- 2026-06-16: session only
with d as (
  insert into day_entries (date) values ('2026-06-16') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-06-16T08:00:00', '2026-06-16T16:45:00' from d;

-- 2026-06-17: session only
with d as (
  insert into day_entries (date) values ('2026-06-17') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-06-17T08:45:00', '2026-06-17T13:00:00' from d;

-- 2026-06-18: two sessions, no ADJ
with d as (
  insert into day_entries (date) values ('2026-06-18') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, v.check_in, v.check_out from d, (values
  ('2026-06-18T08:00:00'::timestamptz, '2026-06-18T15:30:00'::timestamptz),
  ('2026-06-18T19:15:00'::timestamptz, '2026-06-18T21:00:00'::timestamptz)
) as v(check_in, check_out);

-- 2026-06-19: session only
with d as (
  insert into day_entries (date) values ('2026-06-19') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-06-19T13:00:00', '2026-06-19T16:30:00' from d;

-- ============================================================
-- Week of 2026-06-20 (Sat) - 2026-06-26 (Fri)
-- ============================================================

-- 2026-06-23: session only
with d as (
  insert into day_entries (date) values ('2026-06-23') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-06-23T09:30:00', '2026-06-23T16:30:00' from d;

-- 2026-06-24: session only
with d as (
  insert into day_entries (date) values ('2026-06-24') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-06-24T09:15:00', '2026-06-24T16:30:00' from d;

-- 2026-06-25: session only
with d as (
  insert into day_entries (date) values ('2026-06-25') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-06-25T08:00:00', '2026-06-25T16:45:00' from d;

-- 2026-06-26: session only
with d as (
  insert into day_entries (date) values ('2026-06-26') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-06-26T10:00:00', '2026-06-26T13:00:00' from d;
