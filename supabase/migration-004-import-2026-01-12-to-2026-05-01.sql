-- Sprint 004: historical data import, 2026-01-12 through 2026-05-01.
-- Run this ONCE in the Supabase SQL editor, AFTER schema-migration-004-physical-year.sql
-- has been applied and the app's Pay Period Recap code is live (so the import
-- can be verified against the app immediately).
--
-- Source: references/source-app/sheet-export-2026-01-10-to-2026-02-06.csv
--         references/source-app/sheet-export-2026-02-07-to-2026-03-06.csv
--         references/source-app/sheet-export-2026-03-07-to-2026-04-03.csv
--         references/source-app/sheet-export-2026-04-04-to-2026-05-01.csv
-- See planning/sprints/004-pay-period-recap-and-full-year-import/blueprint.md
-- for the mapping rules and the full verified weekly rolling-balance table
-- this script reproduces exactly.
--
-- This runs against a LIVE database with real, already-verified data from
-- Sprint 003 (2026-05-02 onward). It is STRICTLY ADDITIVE for day_entries /
-- sessions / leave_entries / holidays — every date below is new, none
-- already exists. The only mutations to existing rows are the 3 settings'
-- effective_date (moved earlier, values unchanged) and the rolling balance
-- seed value, both below, and both mathematically verified to reproduce
-- every already-proofed Sprint 3 number exactly (planning/DECISIONS.md).
--
-- Excluded: 2026-01-10 (Sat) and 2026-01-11 (Sun) — before the first
-- fully-reconstructable Monday-Sunday week; their contribution is already
-- accounted for in the derived seed. Do NOT import these.
--
-- Days with zero sessions, no ADJ code, and not a holiday are intentionally
-- omitted — the app treats a missing date as zero contribution automatically.

-- ============================================================
-- Settings: move existing effective dates earlier (values unchanged) so the
-- weekly target / break duration / standard workday hours settings apply
-- retroactively to this whole import window.
-- ============================================================

update weekly_target_settings
  set effective_date = '2026-01-12'
  where effective_date = '2026-05-04';

update break_duration_settings
  set effective_date = '2026-01-12'
  where effective_date = '2026-05-04';

update standard_workday_hours_settings
  set effective_date = '2026-01-12'
  where effective_date = '2026-05-04';

-- Rolling Balance Seed: replace the Sprint 3 seed (-27.67, which represented
-- the balance immediately before 2026-05-04) with the balance immediately
-- before 2026-01-12. Mathematically derived so every week from here forward
-- — including the already-live 2026-04-27 - 05-03 week — reproduces its
-- already-verified rolling balance exactly (see planning/DECISIONS.md).
with s as (
  select id from rolling_balance_seed order by created_at desc limit 1
)
update rolling_balance_seed
  set balance = -7.87,
      note = 'Reseeded for Sprint 004 full-year import: derived to reproduce the already-verified -27.67 rolling balance at the 2026-04-27 - 05-03 week boundary exactly.'
  where id = (select id from s);

-- New holidays (inferred Holy-Day-of-Obligation dates; editable in Settings
-- if wrong). Memorial Day (2026-05-25) was already added in Sprint 3.
insert into holidays (date, label) values
  ('2026-04-02', 'Holy Thursday'),
  ('2026-04-03', 'Good Friday'),
  ('2026-04-06', 'Easter Monday');

-- ============================================================
-- Week of 2026-01-12 (Mon) - 2026-01-18 (Sun)
-- ============================================================

-- 2026-01-13: session only
with d as (
  insert into day_entries (date) values ('2026-01-13') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-01-13T08:00:00', '2026-01-13T15:30:00' from d;

-- 2026-01-14: session only
with d as (
  insert into day_entries (date) values ('2026-01-14') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-01-14T08:00:00', '2026-01-14T16:30:00' from d;

-- 2026-01-15: session only
with d as (
  insert into day_entries (date) values ('2026-01-15') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-01-15T08:00:00', '2026-01-15T13:30:00' from d;

-- 2026-01-16: session + "v" vacation leave (8 hrs)
with d as (
  insert into day_entries (date) values ('2026-01-16') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-01-16T09:00:00', '2026-01-16T10:00:00' from d;

insert into leave_entries (date, leave_type, hours) values ('2026-01-16', 'vacation', 8);

-- ============================================================
-- Week of 2026-01-19 (Mon) - 2026-01-25 (Sun)
-- ============================================================

-- 2026-01-19: "v" vacation leave only (6.4 hrs), no session
insert into leave_entries (date, leave_type, hours) values ('2026-01-19', 'vacation', 6.4);

-- 2026-01-20: session + "x" break override (1 hr = 60 min)
with d as (
  insert into day_entries (date, break_minutes_override) values ('2026-01-20', 60) returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-01-20T08:00:00', '2026-01-20T16:15:00' from d;

-- 2026-01-21: session only
with d as (
  insert into day_entries (date) values ('2026-01-21') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-01-21T08:00:00', '2026-01-21T14:00:00' from d;

-- 2026-01-22: session only
with d as (
  insert into day_entries (date) values ('2026-01-22') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-01-22T08:00:00', '2026-01-22T13:15:00' from d;

-- 2026-01-23: two sessions, no ADJ
with d as (
  insert into day_entries (date) values ('2026-01-23') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, v.check_in, v.check_out from d, (values
  ('2026-01-23T10:00:00'::timestamptz, '2026-01-23T13:00:00'::timestamptz),
  ('2026-01-23T14:00:00'::timestamptz, '2026-01-23T15:30:00'::timestamptz)
) as v(check_in, check_out);

-- ============================================================
-- Week of 2026-01-26 (Mon) - 2026-02-01 (Sun)
-- ============================================================

-- 2026-01-26: session only
with d as (
  insert into day_entries (date) values ('2026-01-26') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-01-26T09:00:00', '2026-01-26T10:00:00' from d;

-- 2026-01-27: session only
with d as (
  insert into day_entries (date) values ('2026-01-27') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-01-27T08:00:00', '2026-01-27T15:30:00' from d;

-- 2026-01-28: session only
with d as (
  insert into day_entries (date) values ('2026-01-28') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-01-28T08:00:00', '2026-01-28T16:45:00' from d;

-- 2026-01-29: session + "x" break override (1 hr = 60 min)
with d as (
  insert into day_entries (date, break_minutes_override) values ('2026-01-29', 60) returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-01-29T10:30:00', '2026-01-29T16:00:00' from d;

-- 2026-01-30: session only
with d as (
  insert into day_entries (date) values ('2026-01-30') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-01-30T08:15:00', '2026-01-30T13:30:00' from d;

-- ============================================================
-- Week of 2026-02-02 (Mon) - 2026-02-08 (Sun)
-- ============================================================

-- 2026-02-03: session only
with d as (
  insert into day_entries (date) values ('2026-02-03') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-02-03T08:00:00', '2026-02-03T16:30:00' from d;

-- 2026-02-04: session + "x" break override (1 hr = 60 min)
with d as (
  insert into day_entries (date, break_minutes_override) values ('2026-02-04', 60) returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-02-04T09:30:00', '2026-02-04T15:30:00' from d;

-- 2026-02-05: session only
with d as (
  insert into day_entries (date) values ('2026-02-05') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-02-05T09:00:00', '2026-02-05T16:00:00' from d;

-- 2026-02-06: session only
with d as (
  insert into day_entries (date) values ('2026-02-06') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-02-06T08:15:00', '2026-02-06T15:00:00' from d;

-- ============================================================
-- Week of 2026-02-09 (Mon) - 2026-02-15 (Sun)
-- ============================================================

-- 2026-02-09: session only
with d as (
  insert into day_entries (date) values ('2026-02-09') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-02-09T18:15:00', '2026-02-09T21:00:00' from d;

-- 2026-02-10: session only
with d as (
  insert into day_entries (date) values ('2026-02-10') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-02-10T09:00:00', '2026-02-10T18:00:00' from d;

-- 2026-02-11: session only
with d as (
  insert into day_entries (date) values ('2026-02-11') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-02-11T09:15:00', '2026-02-11T16:30:00' from d;

-- 2026-02-12: two sessions, no ADJ
with d as (
  insert into day_entries (date) values ('2026-02-12') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, v.check_in, v.check_out from d, (values
  ('2026-02-12T09:00:00'::timestamptz, '2026-02-12T13:15:00'::timestamptz),
  ('2026-02-12T16:15:00'::timestamptz, '2026-02-12T19:30:00'::timestamptz)
) as v(check_in, check_out);

-- 2026-02-13: "v" vacation leave only (8 hrs), no session
insert into leave_entries (date, leave_type, hours) values ('2026-02-13', 'vacation', 8);

-- ============================================================
-- Week of 2026-02-16 (Mon) - 2026-02-22 (Sun)
-- ============================================================

-- 2026-02-17: session only
with d as (
  insert into day_entries (date) values ('2026-02-17') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-02-17T08:15:00', '2026-02-17T18:30:00' from d;

-- 2026-02-18: session only
with d as (
  insert into day_entries (date) values ('2026-02-18') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-02-18T08:00:00', '2026-02-18T16:30:00' from d;

-- 2026-02-19: two sessions, no ADJ
with d as (
  insert into day_entries (date) values ('2026-02-19') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, v.check_in, v.check_out from d, (values
  ('2026-02-19T08:00:00'::timestamptz, '2026-02-19T13:15:00'::timestamptz),
  ('2026-02-19T15:30:00'::timestamptz, '2026-02-19T16:30:00'::timestamptz)
) as v(check_in, check_out);

-- 2026-02-20: session + "x" break override (0.5 hr = 30 min)
with d as (
  insert into day_entries (date, break_minutes_override) values ('2026-02-20', 30) returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-02-20T08:00:00', '2026-02-20T16:30:00' from d;

-- 2026-02-21: session only
with d as (
  insert into day_entries (date) values ('2026-02-21') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-02-21T08:00:00', '2026-02-21T16:00:00' from d;

-- ============================================================
-- Week of 2026-02-23 (Mon) - 2026-03-01 (Sun)
-- ============================================================

-- 2026-02-23: session only
with d as (
  insert into day_entries (date) values ('2026-02-23') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-02-23T09:30:00', '2026-02-23T10:30:00' from d;

-- 2026-02-24: session only
with d as (
  insert into day_entries (date) values ('2026-02-24') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-02-24T08:00:00', '2026-02-24T16:30:00' from d;

-- 2026-02-25: session only
with d as (
  insert into day_entries (date) values ('2026-02-25') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-02-25T08:30:00', '2026-02-25T16:30:00' from d;

-- 2026-02-26: two sessions, no ADJ
with d as (
  insert into day_entries (date) values ('2026-02-26') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, v.check_in, v.check_out from d, (values
  ('2026-02-26T08:00:00'::timestamptz, '2026-02-26T12:45:00'::timestamptz),
  ('2026-02-26T13:15:00'::timestamptz, '2026-02-26T15:00:00'::timestamptz)
) as v(check_in, check_out);

-- 2026-02-27: two sessions, no ADJ
with d as (
  insert into day_entries (date) values ('2026-02-27') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, v.check_in, v.check_out from d, (values
  ('2026-02-27T08:45:00'::timestamptz, '2026-02-27T15:30:00'::timestamptz),
  ('2026-02-27T17:00:00'::timestamptz, '2026-02-27T20:45:00'::timestamptz)
) as v(check_in, check_out);

-- 2026-02-28: session only
with d as (
  insert into day_entries (date) values ('2026-02-28') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-02-28T08:00:00', '2026-02-28T16:00:00' from d;

-- 2026-03-01: session only
with d as (
  insert into day_entries (date) values ('2026-03-01') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-01T11:30:00', '2026-03-01T14:30:00' from d;

-- ============================================================
-- Week of 2026-03-02 (Mon) - 2026-03-08 (Sun)
-- ============================================================

-- 2026-03-02: session only (sheet listed it under "Check-in 2/Check-out 2")
with d as (
  insert into day_entries (date) values ('2026-03-02') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-02T17:15:00', '2026-03-02T19:45:00' from d;

-- 2026-03-03: two sessions, no ADJ
with d as (
  insert into day_entries (date) values ('2026-03-03') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, v.check_in, v.check_out from d, (values
  ('2026-03-03T08:00:00'::timestamptz, '2026-03-03T12:00:00'::timestamptz),
  ('2026-03-03T13:30:00'::timestamptz, '2026-03-03T15:15:00'::timestamptz)
) as v(check_in, check_out);

-- 2026-03-04: session + "x" break override (1 hr = 60 min)
with d as (
  insert into day_entries (date, break_minutes_override) values ('2026-03-04', 60) returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-04T09:25:00', '2026-03-04T14:45:00' from d;

-- 2026-03-05: session + "x" break override (2 hrs = 120 min)
with d as (
  insert into day_entries (date, break_minutes_override) values ('2026-03-05', 120) returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-05T08:00:00', '2026-03-05T14:45:00' from d;

-- 2026-03-06: session only
with d as (
  insert into day_entries (date) values ('2026-03-06') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-06T08:00:00', '2026-03-06T15:00:00' from d;

-- 2026-03-07: session only
with d as (
  insert into day_entries (date) values ('2026-03-07') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-07T08:00:00', '2026-03-07T10:30:00' from d;

-- ============================================================
-- Week of 2026-03-09 (Mon) - 2026-03-15 (Sun)
-- ============================================================

-- 2026-03-10: session + "x" break override (1 hr = 60 min)
-- (2026-03-09 was a zero day with no ADJ code — omitted, per the recovered
-- stray row in the source CSV; see planning/DECISIONS.md.)
with d as (
  insert into day_entries (date, break_minutes_override) values ('2026-03-10', 60) returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-10T08:00:00', '2026-03-10T16:30:00' from d;

-- 2026-03-11: session only
with d as (
  insert into day_entries (date) values ('2026-03-11') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-11T08:00:00', '2026-03-11T16:30:00' from d;

-- 2026-03-12: session only
with d as (
  insert into day_entries (date) values ('2026-03-12') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-12T08:00:00', '2026-03-12T15:00:00' from d;

-- 2026-03-13: session only
with d as (
  insert into day_entries (date) values ('2026-03-13') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-13T12:15:00', '2026-03-13T16:15:00' from d;

-- 2026-03-14: session only
with d as (
  insert into day_entries (date) values ('2026-03-14') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-14T10:00:00', '2026-03-14T10:45:00' from d;

-- 2026-03-15: session only
with d as (
  insert into day_entries (date) values ('2026-03-15') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-15T11:30:00', '2026-03-15T14:30:00' from d;

-- ============================================================
-- Week of 2026-03-16 (Mon) - 2026-03-22 (Sun)
-- ============================================================

-- 2026-03-17: session only
with d as (
  insert into day_entries (date) values ('2026-03-17') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-17T08:00:00', '2026-03-17T14:30:00' from d;

-- 2026-03-18: session only
with d as (
  insert into day_entries (date) values ('2026-03-18') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-18T08:00:00', '2026-03-18T16:30:00' from d;

-- 2026-03-19: session only
with d as (
  insert into day_entries (date) values ('2026-03-19') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-19T08:00:00', '2026-03-19T14:30:00' from d;

-- 2026-03-20: session only
with d as (
  insert into day_entries (date) values ('2026-03-20') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-20T08:00:00', '2026-03-20T14:30:00' from d;

-- ============================================================
-- Week of 2026-03-23 (Mon) - 2026-03-29 (Sun)
-- ============================================================

-- 2026-03-24: session only
with d as (
  insert into day_entries (date) values ('2026-03-24') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-24T08:00:00', '2026-03-24T15:45:00' from d;

-- 2026-03-25: session only
with d as (
  insert into day_entries (date) values ('2026-03-25') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-25T08:00:00', '2026-03-25T13:00:00' from d;

-- 2026-03-26: session only
with d as (
  insert into day_entries (date) values ('2026-03-26') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-26T08:00:00', '2026-03-26T10:45:00' from d;

-- 2026-03-27: session only
with d as (
  insert into day_entries (date) values ('2026-03-27') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-27T08:15:00', '2026-03-27T16:30:00' from d;

-- ============================================================
-- Week of 2026-03-30 (Mon) - 2026-04-05 (Sun)
-- ============================================================

-- 2026-03-31: session only
with d as (
  insert into day_entries (date) values ('2026-03-31') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-03-31T08:00:00', '2026-03-31T16:30:00' from d;

-- 2026-04-01: session only
with d as (
  insert into day_entries (date) values ('2026-04-01') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-04-01T08:00:00', '2026-04-01T13:00:00' from d;

-- 2026-04-02: "h" holiday only, no session (Holy Thursday, added to holidays above)
-- 2026-04-03: "h" holiday only, no session (Good Friday, added to holidays above)

-- ============================================================
-- Week of 2026-04-06 (Mon) - 2026-04-12 (Sun)
-- ============================================================

-- 2026-04-06: "h" holiday only, no session (Easter Monday, added to holidays above)

-- 2026-04-07: two sessions, no ADJ
with d as (
  insert into day_entries (date) values ('2026-04-07') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, v.check_in, v.check_out from d, (values
  ('2026-04-07T08:30:00'::timestamptz, '2026-04-07T10:40:00'::timestamptz),
  ('2026-04-07T12:00:00'::timestamptz, '2026-04-07T14:30:00'::timestamptz)
) as v(check_in, check_out);

-- 2026-04-08: "s" sick leave only (8 hrs), no session
insert into leave_entries (date, leave_type, hours) values ('2026-04-08', 'sick', 8);

-- 2026-04-09: session + "s" sick leave (3 hrs)
with d as (
  insert into day_entries (date) values ('2026-04-09') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-04-09T08:00:00', '2026-04-09T13:00:00' from d;

insert into leave_entries (date, leave_type, hours) values ('2026-04-09', 'sick', 3);

-- 2026-04-10: "s" sick leave only (8 hrs), no session
insert into leave_entries (date, leave_type, hours) values ('2026-04-10', 'sick', 8);

-- 2026-04-11: session only
with d as (
  insert into day_entries (date) values ('2026-04-11') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-04-11T06:00:00', '2026-04-11T08:00:00' from d;

-- ============================================================
-- Week of 2026-04-13 (Mon) - 2026-04-19 (Sun)
-- ============================================================

-- 2026-04-14: two sessions, no ADJ
with d as (
  insert into day_entries (date) values ('2026-04-14') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, v.check_in, v.check_out from d, (values
  ('2026-04-14T07:45:00'::timestamptz, '2026-04-14T11:45:00'::timestamptz),
  ('2026-04-14T13:30:00'::timestamptz, '2026-04-14T15:00:00'::timestamptz)
) as v(check_in, check_out);

-- 2026-04-15: session only
with d as (
  insert into day_entries (date) values ('2026-04-15') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-04-15T08:00:00', '2026-04-15T15:00:00' from d;

-- 2026-04-16: "s" sick leave only (6.4 hrs), no session
insert into leave_entries (date, leave_type, hours) values ('2026-04-16', 'sick', 6.4);

-- 2026-04-17: "p" paternity leave only (6.4 hrs), no session
insert into leave_entries (date, leave_type, hours) values ('2026-04-17', 'paternity', 6.4);

-- ============================================================
-- Week of 2026-04-20 (Mon) - 2026-04-26 (Sun)
-- ============================================================

-- 2026-04-21: "p" paternity leave only (6.4 hrs), no session
insert into leave_entries (date, leave_type, hours) values ('2026-04-21', 'paternity', 6.4);

-- 2026-04-22: session only
with d as (
  insert into day_entries (date) values ('2026-04-22') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-04-22T08:00:00', '2026-04-22T15:00:00' from d;

-- 2026-04-23: session + "p" paternity leave (4 hrs)
with d as (
  insert into day_entries (date) values ('2026-04-23') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-04-23T08:00:00', '2026-04-23T12:00:00' from d;

insert into leave_entries (date, leave_type, hours) values ('2026-04-23', 'paternity', 4);

-- 2026-04-24: "v" vacation leave only (8 hrs), no session
insert into leave_entries (date, leave_type, hours) values ('2026-04-24', 'vacation', 8);

-- ============================================================
-- Week of 2026-04-27 (Mon) - 2026-05-03 (Sun) -- partial: through 2026-05-01
-- only. 2026-05-02 and 2026-05-03 are already accounted for (zero) by the
-- already-live Sprint 3 import; do not touch them here.
-- ============================================================

-- 2026-04-28: session only
with d as (
  insert into day_entries (date) values ('2026-04-28') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-04-28T08:00:00', '2026-04-28T15:45:00' from d;

-- 2026-04-29: session only
with d as (
  insert into day_entries (date) values ('2026-04-29') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-04-29T08:00:00', '2026-04-29T13:00:00' from d;

-- 2026-04-30: session only
with d as (
  insert into day_entries (date) values ('2026-04-30') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-04-30T08:00:00', '2026-04-30T14:45:00' from d;

-- 2026-05-01: session + "p" paternity leave (6.4 hrs)
with d as (
  insert into day_entries (date) values ('2026-05-01') returning id
)
insert into sessions (day_entry_id, check_in, check_out)
select id, '2026-05-01T09:45:00', '2026-05-01T13:30:00' from d;

insert into leave_entries (date, leave_type, hours) values ('2026-05-01', 'paternity', 6.4);
