# Open Questions

Questions that need answers from the Architect or Builder.

---

| Question | Owner | Needed By | Status | Answer / Notes |
|---|---|---|---|---|
| Which weekly target value applies if the target changes mid-week? | Architect/User | Sprint 002 | Resolved | Value in effect on the week's Monday. |
| What auth approach does v1 need? | User | Sprint 002 | Resolved | Supabase email/password, single account, no signup. |
| What backup/export strategy should protect the data? | Architect | Sprint 002 | Resolved | Supabase's built-in automatic backups. |
| Should blackout dates become a future sprint? | User | Post-v1 | Deferred | Out of scope for v1. |
| Should reports/analytics beyond the recap become a v2 direction? | User | Post-v1 | Deferred | Out of scope for v1. |
| Should pre-2026 historical sheet data ever be migrated? | User | Post-v1 | Open | Not needed for v1. |
| Should single-account RLS be revisited before a second account is added? | Architect | Before 2nd account | Open | Accepted v1 tradeoff. |
| Should the recap support a user-configurable pay-period cycle? | User/Architect | N/A | Resolved | User explicitly chose the ISO 8601 standard, not a configurable/employer anchor — "it's a tracking metric." Implemented in Sprint 004. |
| Does the Jan-April 2026 "4-day week" era need its own settings values? | User/Architect | Sprint 004 | Resolved | No — real data confirms the "5-day week, 6.4 hrs standard workday, 0-min break default" rate was already in effect throughout. |
| Should 2026-01-01 through 2026-01-09 ever be imported, if the user locates those records later? | User | Whenever found | Open | Currently excluded — no source data available. Low priority. |
| **New**: should History tab ever get the same per-week drill-down modal as the Pay Period Recap? | User | N/A | Resolved | No, explicitly declined in the Sprint 005 discussion — Prev/Next on the Recap page already covers browsing past periods, and History's summary-row format is intentionally more compact. Revisit only if the user asks again. |
| **New**: how should pay periods be anchored to the user's pay stubs (fixed start date + 14-day cycles? semi-monthly? other)? | User/Architect | Sprint 007 | **Resolved** | Sat–Fri weeks everywhere, fixed 14-day cycle anchored at 2026-01-10, from the user's stub dates (Sprint 007). Stub amounts not needed. |
| **New**: how often should the user run the backup export (suggested: monthly, and before any risky change)? | User | After Sprint 008 | Resolved | Monthly (documented in `docs/OPERATIONS.md`); Sprint 009 shows the age of the last backup in the app header, amber after 35 days. |
