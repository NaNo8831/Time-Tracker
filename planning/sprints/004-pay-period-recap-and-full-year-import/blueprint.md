# Sprint 004 Blueprint — Pay Period Recap Redesign + Full-Year Historical Import

## Approach

Build in this order:

1. `isoWeek.ts` + unit tests (pure functions, no dependencies — build and verify first).
2. Extend `buildWeeklyRecap()` / add `buildPayPeriodRecap()`, with unit tests including the Sprint 3 regression check.
3. Physical Year setting: schema, data layer, Settings UI, `weeksLeftInYear()`.
4. Pay Period Recap page rewrite.
5. History tab rewrite.
6. Daily Entry cleanup + Nav reorder.
7. Schema migration SQL (physical_year_settings table) — hand to user.
8. Data-import SQL (2026-01-12–2026-05-01, additive) — hand to user, run AFTER step 7 and after the app code is live, so the new Pay Period Recap page can be used to verify it.
9. Verify against `acceptance.md`, including the Sprint 3 regression check.

## ISO Week Calculation

```ts
// src/lib/calculations/isoWeek.ts
export function isoWeekNumber(date: IsoDate): number {
  const d = new Date(`${date}T00:00:00Z`);
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstThursdayDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNum + 3);
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000));
}

/** The Monday that starts "Week 1" of the pay period containing `date`. */
export function payPeriodWeek1Start(date: IsoDate): IsoDate {
  const weekMonday = mondayOf(date); // from ./weekly.ts
  const weekNum = isoWeekNumber(weekMonday);
  return weekNum % 2 === 1 ? weekMonday : addDays(weekMonday, -7);
}
```

Verified reference values (see `planning/DECISIONS.md`): 2026-01-12 = ISO week 3 (odd, so it's a clean Week 1 with no partial-period edge case at the very start of tracked history). 2026-04-27 = ISO week 18 (even, Week 2 of the period starting 2026-04-20). 2026-05-04 = ISO week 19 (odd, Week 1 of the next period).

## Pay Period Recap Calculation

`buildWeeklyRecap()` currently iterates weeks only through `mondayOf(input.today)`. Add an optional parameter (e.g., `extendThroughWeek?: IsoDate`) so the returned `weeks[]` array can include weeks beyond today WHEN EXPLICITLY REQUESTED — the day-loop inside each week still correctly stops contributing actual hours once `date > today` (already-existing behavior), so a "future" week just shows 0 actual / full negative delta, which is exactly the right display for "this week hasn't happened yet."

**Important**: only the Pay Period Recap page should ever pass `extendThroughWeek`. The History tab and Leave Bank calculations must keep using the unextended, `today`-bounded array — do not let a requested future extension leak into those.

```ts
export function buildPayPeriodRecap(recapInput: RecapInput, week1Start: IsoDate) {
  const week2Start = addDays(week1Start, 7);
  const recap = buildWeeklyRecap({ ...recapInput, /* extend through week2Start */ });
  if (!recap) return null;
  const week1 = recap.weeks.find((w) => w.weekStart === week1Start);
  const week2 = recap.weeks.find((w) => w.weekStart === week2Start);
  // week1 should always exist for any period at/before "today"'s period;
  // week2 may need the array extended through week2Start if it's the
  // current, in-progress period.
  return { week1, week2, rollingBalance: (week2 ?? week1)!.rollingBalance };
}
```

## Physical Year + Weeks Left in Year

```sql
create table if not exists physical_year_settings (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,
  note text,
  created_at timestamptz not null default now(),
  constraint physical_year_end_after_start check (end_date > start_date)
);
alter table physical_year_settings enable row level security;
create policy "authenticated_all_physical_year_settings" on physical_year_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

```ts
// src/lib/calculations/physicalYear.ts
export function weeksLeftInYear(
  years: { startDate: IsoDate; endDate: IsoDate }[],
  today: IsoDate
): number | null {
  const current = years.find((y) => y.startDate <= today && today <= y.endDate);
  if (!current) return null;
  const todayMonday = mondayOf(today);
  const endMonday = mondayOf(current.endDate);
  const weeks = Math.round((new Date(endMonday).getTime() - new Date(todayMonday).getTime()) / (7 * 86400000));
  return Math.max(weeks + 1, 0); // inclusive of the current week
}
```

Settings UI: new section, same list pattern as Paid Holidays (add start date + end date + optional note, list existing entries, remove). No uniqueness constraint required beyond the `end_date > start_date` check — overlapping ranges aren't validated against in v1 (Micro-app tier; user is trusted not to double-enter).

## Pay Period Recap Page Layout

`src/app/(app)/page.tsx`, reading an optional `?period=<week1Start>` search param (default: `payPeriodWeek1Start(today)`):

1. Week 1 stats card row (Actual / Target / Delta).
2. Week 2 stats card row (Actual / Target / Delta) — shows 0/pending values gracefully if Week 2 hasn't started yet.
3. Rolling Balance (large card, as of period end).
4. Leave Remaining cards + new Weeks Left in Year card, same row style.
5. Day-by-day list, both weeks (14 rows) via the EXISTING `getDailyHistoryRows(week1Start, addDays(week1Start, 13))` — reuse as-is, no changes needed to that function. Columns stay Date/Raw/Break/Total/Other (no Delta column — user confirmed this would be redundant with the Week 1/2 stat cards above). Add a visual divider (border/spacing) between day 7 and day 8. Each row is a `<Link href={`/entries/${date}`}>`.
6. Prev/Next: links to `?period=${addDays(week1Start, -14)}` / `?period=${addDays(week1Start, 14)}`.

## History Tab

Replace `src/lib/calculations/periods.ts`'s naive `chunkWeeksIntoPeriods` with ISO-based grouping:

```ts
export function groupWeeksIntoPayPeriods(weeks: WeekSummary[]): PeriodSummary[] {
  const byWeek1Start = new Map<IsoDate, WeekSummary[]>();
  for (const week of weeks) {
    const key = payPeriodWeek1Start(week.weekStart);
    byWeek1Start.set(key, [...(byWeek1Start.get(key) ?? []), week]);
  }
  return [...byWeek1Start.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([week1Start, periodWeeks]) => ({ /* same shape as before */ }));
}
```

The History page excludes whichever period's `week1Start === payPeriodWeek1Start(today)`.

## UI Cleanup

- `src/app/(app)/entries/[date]/page.tsx`: remove the "Recent Entries" section and its `listRecentDayEntries` call.
- `src/components/Nav.tsx`: reorder links — Daily Entry, Recap, History, Settings.

## Migration Data (from `references/source-app/sheet-export-2026-01-*.csv` through `2026-05-01.csv`)

**Settings updates** (all three are `UPDATE`s to the existing live rows, not new inserts — values unchanged, only `effective_date` moves earlier):
- `weekly_target_settings`: `effective_date` 2026-05-04 → **2026-01-12**.
- `break_duration_settings`: `effective_date` 2026-05-04 → **2026-01-12**.
- `standard_workday_hours_settings`: `effective_date` 2026-05-04 → **2026-01-12**.
- `rolling_balance_seed`: `balance` -27.67 → **-7.87** (mathematically verified in `planning/DECISIONS.md` to reproduce every already-proofed Sprint 3 number exactly).

**New holidays**: `2026-04-02` "Holy Thursday", `2026-04-03` "Good Friday", `2026-04-06` "Easter Monday" (inferred from date + the organization's existing Holy-Day-of-Obligation references; editable in Settings if wrong).

**New leave_entries**: 2026-01-16 (vacation, 8), 2026-01-19 (vacation, 6.4), 2026-02-13 (vacation, 8), 2026-04-08 (sick, 8), 2026-04-09 (sick, 3), 2026-04-10 (sick, 8), 2026-04-16 (sick, 6.4), 2026-04-17 (paternity, 6.4), 2026-04-21 (paternity, 6.4), 2026-04-23 (paternity, 4), 2026-05-01 (paternity, 6.4).

**New break_minutes_override days**: 2026-01-20 (60), 2026-01-29 (60), 2026-02-04 (60), 2026-02-20 (30), 2026-03-04 (60), 2026-03-05 (120), 2026-03-10 (60).

**Day-by-day session mapping**: same rules as Sprint 003 (each non-blank Check-in/Check-out pair = one `sessions` row; `h` = holiday, no leave_entries row; `x` = break override, no leave_entries row; `v`/`s`/`p` = leave_entries addition). Days with zero sessions, no ADJ code, and not a holiday get no `day_entries` row at all. Every date from 2026-01-12 through 2026-05-01 needs mapping EXCEPT the zero days (see the source CSVs for the complete day list — every date in this range appears in one of the four files, including the recovered `Mar-9` stray row in the third file).

**Excluded**: 2026-01-10 (Sat, 4.25 real hours) and 2026-01-11 (Sun, 0) — before the first fully-reconstructable Monday-Sunday week. Do not attempt to import these; their contribution is already accounted for in the derived seed.

## Verified Weekly Table (2026-01-12 through 2026-04-26, seed -7.87)

| Week (Mon-Sun) | Actual | Delta | Rolling Balance |
|---|---:|---:|---:|
| 2026-01-12 – 01-18 | 30.50 | -1.50 | -9.37 |
| 2026-01-19 – 01-25 | 29.40 | -2.60 | -11.97 |
| 2026-01-26 – 02-01 | 27.00 | -5.00 | -16.97 |
| 2026-02-02 – 02-08 | 27.25 | -4.75 | -21.72 |
| 2026-02-09 – 02-15 | 34.50 | +2.50 | -19.22 |
| 2026-02-16 – 02-22 | 41.00 | +9.00 | -10.22 |
| 2026-02-23 – 03-01 | 45.50 | +13.50 | +3.28 |
| 2026-03-02 – 03-08 | 26.83 | -5.17 | -1.89 |
| 2026-03-09 – 03-15 | 30.75 | -1.25 | -3.14 |
| 2026-03-16 – 03-22 | 28.00 | -4.00 | -7.14 |
| 2026-03-23 – 03-29 | 23.75 | -8.25 | -15.39 |
| 2026-03-30 – 04-05 | 26.30 | -5.70 | -21.09 |
| 2026-04-06 – 04-12 | 37.07 | +5.07 | -16.02 |
| 2026-04-13 – 04-19 | 25.30 | -6.70 | -22.72 |
| 2026-04-20 – 04-26 | 29.40 | -2.60 | -25.32 |
| 2026-04-27 – 05-03 (already live) | 29.65 | -2.35 | -27.67 |

The last row is the exact already-live, already-verified boundary — the Builder should confirm the app reproduces `-27.67` there without having touched anything downstream of it.

## Out of Scope for This Sprint

- Data before 2026-01-12.
- Fixing the 53-ISO-week-year edge case.
- Any UI for editing the Rolling Balance Seed.
