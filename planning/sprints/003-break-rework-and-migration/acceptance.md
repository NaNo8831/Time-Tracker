# Sprint 003 Acceptance — Break Model Rework + Historical Migration

Sprint 003 is complete when all of the following are true:

## Break Model

- `day_entries` has no `lunch_taken` column; it has `break_minutes_override` (nullable, enforced multiple of 15 at the database level).
- The Daily Entry screen's break control accepts either "(use default)" or a specific 15-minute-increment value; leaving it blank and saving does not write an override.
- With no override set for a date, Work Hours for that date reflects the `break_duration_settings` value in effect for that date. With an override set, Work Hours reflects the override instead, regardless of the default setting.
- Settings screen shows "Break Duration" (not "Lunch Duration") with the same effective-dated add/history pattern as every other setting, and the same duplicate-effective-date rejection.

## Rolling Balance Seed

- With `rolling_balance_seed` set to -27.67 and `weekly_target_settings`' earliest entry at `effective_date = 2026-05-04` (the Monday of the first full Monday-Sunday week with real activity — NOT 2026-04-27, which would create an extra, differently-bounded boundary week), the Weekly Recap and History tab show no phantom weeks before 2026-05-04, and the Rolling Balance at the end of each Monday-Sunday week matches these exact values (independently recomputed from the real per-day Work Hours, using the app's own Monday-anchored week grouping — NOT copied directly from the source sheet's Saturday-Friday week blocks, which use a different boundary and therefore a different first-week split; every week from the 2nd onward coincidentally lands on the identical cumulative value either way, since the only day-level differences between the two groupings fall on zero-activity weekend days):

  | Week (Mon-Sun) | Expected Rolling Balance |
  |---|---:|
  | 2026-05-04 – 2026-05-10 | -23.42 |
  | 2026-05-11 – 2026-05-17 | -26.42 |
  | 2026-05-18 – 2026-05-24 | -24.67 |
  | 2026-05-25 – 2026-05-31 | -14.77 |
  | 2026-06-01 – 2026-06-07 | -14.02 |
  | 2026-06-08 – 2026-06-14 | -7.27 |
  | 2026-06-15 – 2026-06-21 | -13.52 |
  | 2026-06-22 – 2026-06-28 | -19.52 |

## Migration Data

- The Weekly Recap and History tab show exactly the 8 weeks above, in order, with no data outside 2026-05-02–2026-06-26 (the last week extends to 2026-06-28 because it's a Monday-Sunday week, but 2026-06-27 and 2026-06-28 correctly show zero — nothing was imported for those two dates).
- Daily Entry for 2026-05-14 shows one session (8:00–14:15) and a break override of 60 minutes.
- Daily Entry for 2026-05-20 shows one session (8:00–12:00) and 4 vacation hours logged.
- Daily Entry for 2026-05-25 shows no sessions, and the Weekly Recap/History reflects 6.4 hours of Holiday Credit for that date (Settings → Paid Holidays lists 2026-05-25 as "Memorial Day").
- Daily Entry for 2026-06-11 shows two sessions (9:30–13:00 and 14:00–16:30) and 2 sick hours logged.
- Settings → Leave Banks → Paternity shows 40.8 hours remaining (no leave logged against it in this window, so it stays at the seeded value).
- Settings → Weekly Target Hours shows one entry: 32 hours, effective 2026-05-04.

## Regression

- All Sprint 002 acceptance criteria still hold: auth gate, session overlap/duplicate rejection (verify it still works with the new break field alongside it), duplicate effective-date rejection on all four settings tables, no letter codes or raw sheet math exposed in the UI.
- The effective-dating regression test still passes: adding a new `weekly_target_settings` entry effective a future date does not change any of the 8 weeks' already-computed values above.
- No day between 2026-04-27 and 2026-05-03 has phantom/incorrect data — those dates fall before the tracked window entirely and simply show as zero, same as any other untracked date.
- Unit tests updated for all renamed fields/functions; `npm test`, `npx tsc --noEmit`, and `npm run build` all pass clean.
