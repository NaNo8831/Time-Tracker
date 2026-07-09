# Open Questions

Questions that need answers from the Architect or Builder.

---

| Question | Owner | Needed By | Status | Answer / Notes |
|---|---|---|---|---|
| Which weekly target value applies if the target changes mid-week — the value in effect at the start of the week, or something else? | Architect/User | Sprint 002 planning | Open | Working assumption for Sprint 002 planning: use the value in effect on the first day of the week (Monday). Confirm before building. |
| What auth approach does v1 need — a single login/shared secret, or none at all (trusted network / home use only)? | User | Sprint 002 planning | Open | Rigor tier allows "single login, shared secret, or none if local-only." Needs a decision before Sprint 002 scope is locked. |
| What backup/export strategy should protect the Supabase-hosted data? | Architect | Sprint 002 or later | Open | Not yet defined. |
| Should blackout dates / recurring non-work-day rules (e.g., "never works Sunday") become a future sprint? | User | Post-v1 | Deferred | Explicitly out of scope for v1 per user request; revisit after v1 ships. |
| Should reports/analytics beyond the weekly recap become a v2 direction? | User | Post-v1 | Deferred | Explicitly out of scope for v1; user flagged interest in "useful reports" as a future possibility. |
| Should pre-2026 historical sheet data ever be migrated, or does the original Google Sheet remain the permanent archive for that period? | User | Post-v1 | Open | Not needed for v1; the source sheet stays authoritative for pre-2026 history for now. |
