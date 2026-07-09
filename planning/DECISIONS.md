# Decisions

Record durable decisions future sprints must respect.

---

## Decision Log

| Date | Decision | Reason | Impact |
|---|---|---|---|
| 2026-07-08 | Tech stack is Next.js + Supabase + Vercel for v1. | Fastest path for a single-user tool; user already knows the stack; a Next.js app is not locked to Vercel, so self-hosting stays possible later if desired. | No self-hosting infrastructure work in v1. |
| 2026-07-08 | Work Hours (day) = Raw Hours (sum of all check-in/check-out sessions) minus Lunch Deduction (flat, once per day, only if "took lunch" is checked) plus Leave Hours (vacation/sick/paternity logged that day) plus Holiday Credit (if the date is a saved holiday). | Confirmed against the user's real usage pattern (e.g., 8am-2pm, lunch, 6pm-10pm) and against the existing Google Sheet's Work Hours formula, which the user confirmed as correct. | Day entries must support multiple sessions per day. Lunch is a single flat subtraction independent of session count, not tied to any specific session gap. |
| 2026-07-08 | Weekly target hours, lunch duration default, standard workday hours, and each leave bank (vacation/sick/paternity) are all stored as effective-dated changelog entries, not single mutable values. | The user needs to adjust these over time (e.g., weekly target changed from a 4-day/32hr week to a 5-day/32hr week) without rewriting the math on past weeks. | Settings become versioned records (value + effective date). Calculations must always look up "the value in effect as of the date being calculated," not the current value. |
| 2026-07-08 | Holiday credit hours come from a directly user-editable "Standard Workday Hours" setting, not a formula derived from weekly target divided by workdays per week. | The user's workdays-per-week has changed historically (4-day to 5-day week); a derived formula would silently change past holiday credit whenever the target or day count changed. | Standard Workday Hours is its own effective-dated setting, independent of weekly target hours. |
| 2026-07-08 | Leave banks (vacation, sick, paternity) are self-reported: the user manually enters/adjusts each bank's total hours with an effective date, matching what their employer reports. There is no employer system integration. | The user reconciles balances against their employer manually and needs full manual control, including corrections. | No auth/integration work with an employer HR system. Remaining balance = latest bank total in effect minus sum of that leave type's hours logged since that bank's effective date. |
| 2026-07-08 | Historical migration covers only calendar-year 2026 entries from the source Google Sheet. | The sheet's format evolved over its roughly three-year life; only the current year's format is clean enough to migrate reliably. | Pre-2026 history remains in the original Google Sheet only and is not migrated into the app. |
| 2026-07-08 | Blackout dates / recurring non-work-day rules (e.g., "never works Sunday") are out of scope for v1. | Adds recurring-exclusion-rule complexity and interacts with holiday logic; conflicts with the user's explicit "don't turn this into a full time management tool" boundary. | Logged as a future enhancement in `planning/QUESTIONS.md`. Not part of Sprint 002 scope. |
| 2026-07-08 | Reports/analytics beyond the weekly recap view are out of scope for v1. | Matches the user's explicit out-of-scope intake boundary. | v1 ships only the weekly recap (hours vs. target, rolling balance, leave balances). |
