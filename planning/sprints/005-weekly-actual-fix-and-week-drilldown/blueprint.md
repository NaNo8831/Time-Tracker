# Sprint 005 Blueprint — Weekly Actual Fix + Week Drill-down Modal

## 1. The fix: `src/lib/calculations/recap.ts`

Current (buggy) day loop inside `buildWeeklyRecap()`:

```ts
const weeklyActuals = weekStarts.map((weekStart) => {
  let total = 0;
  for (let offset = 0; offset < 7; offset += 1) {
    const date = addDays(weekStart, offset);
    if (date > input.today) break; // <-- the bug: silently drops real future data
    total += calcWorkHours({ date, sessions: ..., leaveEntries: ..., ... });
  }
  return total;
});
```

Fixed:

```ts
const weeklyActuals = weekStarts.map((weekStart) => {
  let total = 0;
  for (let offset = 0; offset < 7; offset += 1) {
    const date = addDays(weekStart, offset);
    total += calcWorkHours({ date, sessions: ..., leaveEntries: ..., ... });
  }
  return total;
});
```

That's the entire fix to the calculation engine — one line removed. `calcWorkHours` (via `workHours()`) already correctly returns 0 for a day with no sessions and no leave entries, so this only changes the result when real data exists for a date after `today`.

**Do not touch**: the week-level loop bound (`endWeekMonday` / `weekStarts` generation) — that governs how many WEEKS exist in the array at all (still bounded by `today` or `extendThroughWeek`), which is correct and unrelated to this bug. Do not touch `buildPayPeriodRecap()`'s "last fully-completed week" Rolling Balance selection (`week2Complete` / `week1Complete` checks) — that's a separate, calendar-based gate that stays exactly as-is.

### Tests to add (`tests/calculations/recap.test.ts`)

- A day after `today` but within the *current* week, with real logged data (e.g. a `leaveHoursByDate` entry), now counts toward that week's `actualHours`/`delta`. Assert the value before the fix would have been wrong (i.e. don't just assert the new value — assert it reflects the future day's contribution).
- A day after `today` within a week reached via `extendThroughWeek`, with real logged data, now counts (extends the existing "extendThroughWeek includes a future week with zero actual hours" test — add a sibling test with actual data present instead of empty).
- Existing tests should all still pass unmodified (none of them have data logged on a future date within their fixtures, so none should need behavior changes — verify this rather than assume it).

### Regression checks

- History tab (`groupWeeksIntoPayPeriods` + the History page) must show identical numbers before/after — it only ever displays fully-elapsed periods (`payPeriodWeek1Start(today)` is always excluded), so every week it shows has no "future" days relative to today by construction. Confirm with a spot-check, no code change expected there.
- `buildPayPeriodRecap()`'s Rolling Balance value must be unchanged for the same inputs — it depends on `addDays(week.weekStart, 6) < today`, not on `actualHours`, so it's unaffected by this fix. Confirm with the existing `payPeriodRecap.test.ts` suite (all should still pass unmodified).

## 2. Hover tooltip: "Actual" through-today vs. later-this-week split

New pure function, e.g. in `src/lib/calculations/dailyBreakdown.ts` (reuses `DailyBreakdownRow`, already computed for the daily table):

```ts
export interface WeekActualSplit {
  throughTodayHours: number;
  laterThisWeekHours: number;
  laterThisWeekByType: Record<LeaveType, number>;
}

export function splitWeekActual(rows: DailyBreakdownRow[], today: IsoDate): WeekActualSplit {
  let throughToday = 0;
  let later = 0;
  const laterByType = { vacation: 0, sick: 0, paternity: 0 } as Record<LeaveType, number>;

  for (const row of rows) {
    if (row.date <= today) {
      throughToday += row.paidHours;
    } else {
      later += row.paidHours;
      for (const type of ["vacation", "sick", "paternity"] as LeaveType[]) {
        laterByType[type] += row.leaveHoursByType[type];
      }
    }
  }

  return { throughTodayHours: throughToday, laterThisWeekHours: later, laterThisWeekByType: laterByType };
}
```

Takes exactly one week's 7 `DailyBreakdownRow[]` (already fetched server-side via `getDailyHistoryRows`, no new data source needed) plus `today`. `throughTodayHours + laterThisWeekHours` must equal that week's `actualHours` from `buildPayPeriodRecap()` (add this as an acceptance check — they're computed via two different code paths that happen to implement the same Rule 5/6 math, same pattern already relied on since Sprint 004 for the daily table vs. weekly totals).

Tooltip text, built in the page component (same style as the existing `othersBreakdownTitle` helper): something like `"6.25 hrs through Jul 14 · 17.5 hrs already logged for later this week (v: 8.0 · s: 4.0 · p: 0.0)"`. Use the short codes `v`/`s`/`p` per the user's request. Omit the later-segment breakdown entirely if `laterThisWeekHours` is 0 (nothing to show).

### Tests to add (`tests/calculations/dailyBreakdown.test.ts` or a new `weekActualSplit.test.ts`)

- Splits a mixed week (some days ≤ today with sessions, some days > today with leave entries of different types) correctly into the two totals and the type breakdown.
- A week entirely ≤ today: `laterThisWeekHours` is 0, `laterThisWeekByType` all zero.
- A week entirely > today (like the user's Week 30 example): `throughTodayHours` is 0, everything in `laterThisWeekHours`/`laterThisWeekByType`.

## 3. Week drill-down modal

New client component, e.g. `src/components/WeekLogModal.tsx`:

```tsx
"use client";
// Takes: week (WeekSummary), rows (that week's 7 DailyBreakdownRow[]), a trigger render (the Actual StatCard).
// Local useState for open/closed. Renders the trigger as a clickable element;
// when open, renders a fixed-position overlay + centered panel with the
// Date/Day/Raw/Break/Other/Total table (7 rows), reusing the existing
// weekend-highlight (isWeekend) styling and each date still linking to
// /entries/{date}. Dismiss via backdrop click, Escape key, and a close button.
```

No new npm dependency needed — a simple fixed-overlay `<div>` is sufficient at this scale (Micro-app tier).

### Wiring on the Recap page (`src/app/(app)/page.tsx`)

- Keep fetching `historyRows` via `getDailyHistoryRows(week1Start, addDays(week1Start, 13))` exactly as today (14 rows, no new query).
- Split: `const week1Rows = historyRows.slice(0, 7); const week2Rows = historyRows.slice(7, 14);`
- Remove the always-visible bottom table section (the whole "Date/Raw/Break/Other/Total" block currently rendered unconditionally) — delete it entirely.
- In `WeekSection`, wrap the "Actual" `StatCard` in `WeekLogModal`, passing that week's 7 rows and computing the hover title via `splitWeekActual(rows, today)`.
- Target/Delta cards are NOT clickable — only Actual opens the modal, per the user's explicit scoping.

## 4. Day-of-week column

Add a "Day" column to the modal's table, between Date and Raw. Compute via the same UTC-anchored pattern already used elsewhere in this codebase (e.g. `formatWeekRange`):

```ts
function dayOfWeek(date: IsoDate): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}
```

Applies only inside the new modal's table — there is no other daily-row table in the app (History shows period summaries, Daily Entry has no table, Settings has no table).

## Out of Scope

- History tab: no changes.
- Any change to `buildPayPeriodRecap()`'s Rolling Balance selection logic.
- Any change to Business Rules 1-5, 7-17.
- Any projection/estimation of hours not yet logged — everything shown must be real, already-saved data.
