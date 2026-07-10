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
| Should the recap support a user-configurable pay-period cycle? | User/Architect | N/A | **Resolved** | User explicitly chose the ISO 8601 standard, not a configurable/employer anchor — "it's a tracking metric." Implemented in Sprint 004. |
| Does the Jan-April 2026 "4-day week" era need its own settings values (different Standard Workday Hours / break default)? | User/Architect | Sprint 004 | **Resolved** | No — real data from 2026-01-10 through 2026-05-01 confirms the "5-day week, 6.4 hrs standard workday, 0-min break default" rate was already in effect throughout. If a 4-day-week era exists, it predates 2026-01-10 and remains unconfirmed/unneeded. |
| **New**: should 2026-01-01 through 2026-01-09 ever be imported, if the user locates those records later? | User | Whenever found | Open | Currently excluded — no source data available. Low priority, low impact per `planning/RISKS.md`. |
