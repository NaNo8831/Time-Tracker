# Open Questions

Questions that need answers from the Architect or Builder.

---

| Question | Owner | Needed By | Status | Answer / Notes |
|---|---|---|---|---|
| Which weekly target value applies if the target changes mid-week? | Architect/User | Sprint 002 planning | Resolved | The value in effect on the week's Monday governs the whole week. See `planning/DECISIONS.md` and Business Rule 7. |
| What auth approach does v1 need? | User | Sprint 002 planning | Resolved | Supabase email/password login, single manually-provisioned account, no signup flow. |
| What backup/export strategy should protect the Supabase-hosted data? | Architect | Sprint 002 or later | Resolved | Rely on Supabase's built-in automatic backups for v1. |
| Should blackout dates / recurring non-work-day rules become a future sprint? | User | Post-v1 | Deferred | Explicitly out of scope for v1 per user request; revisit after v1 ships. |
| Should reports/analytics beyond the weekly recap become a v2 direction? | User | Post-v1 | Deferred | Explicitly out of scope for v1; user flagged interest as a future possibility. |
| Should pre-2026 historical sheet data ever be migrated? | User | Post-v1 | Open | Not needed for v1; the source sheet stays authoritative for pre-2026 history for now. |
| Should the single-account RLS approach be revisited before any second account is ever added? | Architect | Before any second account is created | Open | Documented as an accepted v1 tradeoff. |
| Should the recap support a user-configurable pay-period cycle (anchor date + length)? | User/Architect | Not urgent | Open | The History tab's two-week chunks are a naive chronological pairing, not real pay-period alignment. Worth revisiting once more historical data is in and the user has a feel for whether the naive chunking is good enough. |
| **New**: how should the January-April 2026 import (the "4-day week" era) be scoped, and does its Break Hours data confirm the same "no routine deduction" pattern found in the May-June window? | User/Architect | Whenever that import is planned | Open | Explicitly deferred — Sprint 003 covers only 2026-05-02 through 2026-06-26. Do not assume the same settings values (target/break-default/standard-workday-hours) apply retroactively without checking real cells from that period. |
