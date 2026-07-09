# Sprint 003 Blueprint — Break Model Rework + Historical Migration

## Approach

Build in this order:

1. Schema migration SQL (break model rename/rework + rolling_balance_seed table) — hand to user to run first.
2. Calculation engine renames + rolling balance seed support, with updated unit tests.
3. Daily Entry + Settings UI updates for the new break model.
4. Data-import SQL script (settings rows, then day-by-day day_entries/sessions/leave_entries) — hand to user to run after step 1-3 are live.
5. Verify against the exact expected values in `acceptance.md`.

## Schema Changes

```sql
-- Break model rework (live tables are empty post-TRUNCATE, so this is a
-- clean structural change, not a data-preserving migration).

alter table day_entries drop column lunch_taken;
alter table day_entries add column break_minutes_override integer;
alter table day_entries add constraint day_entries_break_override_multiple_of_15
  check (break_minutes_override is null or break_minutes_override % 15 = 0);
alter table day_entries add constraint day_entries_break_override_non_negative
  check (break_minutes_override is null or break_minutes_override >= 0);

alter table lunch_duration_settings rename to break_duration_settings;
alter table break_duration_settings rename constraint
  lunch_duration_settings_effective_date_unique to break_duration_settings_effective_date_unique;
-- RLS policy also needs renaming (drop the old lunch-named policy, create
-- an equivalent one on break_duration_settings — same authenticated-only rule).

create table rolling_balance_seed (
  id uuid primary key default gen_random_uuid(),
  balance numeric not null,
  note text,
  created_at timestamptz not null default now()
);
alter table rolling_balance_seed enable row level security;
create policy "authenticated_all_rolling_balance_seed" on rolling_balance_seed
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

Update `supabase/schema.sql` itself to reflect this end-state directly (for future fresh installs) — do not leave it describing the old boolean model.

## Calculation Engine Changes

- `src/lib/calculations/workHours.ts`: rename `lunchDeduction(lunchTaken, lunchDurationMinutesInEffect)` → `breakDeduction(overrideMinutes, defaultMinutesInEffect, hasSessions)`. **Important**: the default only applies when the day has at least one session — an override always applies regardless. Naively applying `(overrideMinutes ?? defaultMinutesInEffect ?? 0)` on every calendar day (including days with zero sessions) would silently subtract the default break from every untouched day in a week, corrupting Weekly Actual Hours. Update `WorkHoursInput` and `workHours()` accordingly (rename `lunchTaken`/`lunchDurationMinutesInEffect` fields to `breakMinutesOverride`/`breakDurationMinutesInEffect`, and pass `sessions.length > 0` as the third argument).
- `src/lib/calculations/dailyBreakdown.ts`, `history.ts`: same field renames flowing through (the output field `breakHours` already has the right name — only inputs change).
- `src/lib/calculations/recap.ts`: `RecapInput.lunchTakenByDate: Map<IsoDate, boolean>` → `breakMinutesOverrideByDate: Map<IsoDate, number | null>`; `lunchDurationSettings` → `breakDurationSettings`. Add `rollingBalanceSeed: number` to `RecapInput` (default 0), and change `buildWeeklyRecap()` to seed `rollingBalance()`'s starting value instead of always starting at 0 — either by adding a seed parameter to `rollingBalance()` in `weekly.ts`, or by adding the seed to the final computed values after the fact (simplest: add seed to every entry in the returned array, since it's a constant offset applied uniformly).
- Update `docs/VALIDATION.md`-referenced regression tests and all existing unit tests referencing `lunchTaken`/`lunchDurationMinutesInEffect` to the new names.

## Data Layer Changes

- `src/lib/data/entries.ts`: `DayEntryDetail.lunchTaken` → `breakMinutesOverride: number | null`; `setLunchTaken(date, boolean)` → `setBreakOverride(date, minutes: number | null)`.
- `src/lib/data/settings.ts`: `LunchDurationSetting` → `BreakDurationSetting`; `getLunchDurationSettings`/`addLunchDurationSetting` → `getBreakDurationSettings`/`addBreakDurationSetting`, reading/writing `break_duration_settings`.
- `src/lib/data/recap.ts`: update all queries referencing `lunch_duration_settings`/`lunch_taken` to `break_duration_settings`/`break_minutes_override`; fetch the single `rolling_balance_seed` row (if any) and pass its `balance` into `RecapInput.rollingBalanceSeed`.

## UI Changes

- New component `src/components/BreakMinutesSelect.tsx`: a `<select>` with a blank "(use default)" option plus values 0, 15, 30, ..., 240 (4 hours) in 15-minute steps — same pattern as `TimeSelect.tsx` but for a duration, not a time of day.
- `src/app/(app)/entries/[date]/page.tsx`: replace the "Took lunch today" checkbox/form with `BreakMinutesSelect`, submitting to a renamed action (`setBreak`, replacing `toggleLunch`) that accepts an empty value as `null`.
- `src/app/(app)/entries/actions.ts`: rename `toggleLunch` → `setBreak`.
- `src/app/(app)/settings/page.tsx` and `actions.ts`: rename the "Lunch Duration" section/fields/action to "Break Duration" / `addBreakDuration`.

## Migration Data (from `references/source-app/sheet-export-*.csv`)

**Settings, all effective 2026-05-04 unless noted** (the Monday of the first FULL Monday-Sunday week with real activity — NOT 2026-04-27, the Monday of the week merely *containing* 2026-05-02. The source sheet groups weeks Saturday-Friday; the app groups Monday-Sunday, Business Rule 4/7. Using 2026-04-27 creates an extra, differently-bounded first week and a wrong first-week Rolling Balance checkpoint. 2026-05-04 aligns the app's weeks so every week from the 2nd onward lands on the exact same cumulative Rolling Balance as the sheet — verified in `acceptance.md`. Do NOT use an earlier placeholder date either — see the phantom-week note in `planning/DOMAIN.md` and `planning/RISKS.md`):
- `weekly_target_settings`: 32 hours.
- `break_duration_settings`: 0 minutes (matches the real data — Break Hours was 0 on every ordinary day in both CSVs).
- `standard_workday_hours_settings`: 6.4 hours.
- `leave_banks`: `leave_type='paternity', total_hours=40.8, effective_date='2026-05-01'` (the sheet's already-known Remaining value; no "P" code appears in either CSV, so no reconstruction of prior usage is needed).
- `holidays`: `date='2026-05-25', label='Memorial Day'`.
- `rolling_balance_seed`: `balance=-27.67, note='Seeded from source Google Sheet running balance immediately before the week of 2026-05-02. Must be replaced if an earlier (e.g. January 2026) import later becomes the new earliest tracked week.'`

**Day-by-day mapping rule** (validated against multiple real rows during Architect discovery — see worked examples below): for each date in the CSVs with any real activity —
- Every non-blank Check-in/Check-out (and Check-in 2/Check-out 2) pair becomes one `sessions` row, `check_in`/`check_out` = that date + the listed time (24-hour, combine directly — timezone-of-record doesn't matter since only the duration is ever used in calculations).
- If the ADJ code is `v`, `s`, or `P`: insert one `leave_entries` row (`leave_type` = vacation/sick/paternity respectively, `hours` = the adjacent numeric value, `date` = that day).
- If the ADJ code is `h`: that date is a holiday (see `holidays` above for 2026-05-25) — no `leave_entries` row; Holiday Credit is automatic from the `holidays` + `standard_workday_hours_settings` tables.
- If the ADJ code is `x`: set `day_entries.break_minutes_override` for that date to the adjacent numeric value × 60 (e.g., `x,1` → 60). Do NOT insert a `leave_entries` row for `x`.
- Days with zero sessions, no ADJ code, and not a holiday (most weekend/off days) do not need a `day_entries` row at all — the app treats a missing date as zero contribution automatically.
- Worked examples confirmed to reproduce the sheet's own Work Hours exactly: 2026-05-14 (`x,1`, session 8:00-14:15) → rawHours 6.25, breakDeduction 1 (override), leave 0, holiday 0 → workHours 5.25 (sheet: 5.25 ✓). 2026-05-20 (`v,4`, session 8:00-12:00) → raw 4, break 0 (default), leave 4, holiday 0 → work 8 (sheet: 8.00 ✓). 2026-05-25 (`h,6.4`, no session) → raw 0, break 0, leave 0, holiday 6.4 → work 6.4 (sheet: 6.40 ✓). 2026-06-11 (`s,2`, two sessions 9:30-13:00 + 14:00-16:30) → raw 6, break 0, leave 2, holiday 0 → work 8 (sheet: 8.00 ✓).

## Out of Scope for This Sprint

- Data outside 2026-05-02–2026-06-26.
- Any UI for the Rolling Balance Seed.
- Pay-period-cycle configuration.
