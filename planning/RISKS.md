# Risks

Known project risks and mitigation notes.

---

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| Effective-dated settings model complexity could corrupt historical balances if a lookup bug exists. | Medium | High | Regression-tested since Sprint 002, re-verified in Sprint 003. | Resolved — ongoing regression coverage |
| No backup/export strategy for Supabase-hosted personal data. | Medium | Medium | Resolved: Supabase's built-in automatic backups. | Resolved |
| RLS policy permits any authenticated session to read/write all rows (not scoped per-user). | Low | Medium | Deliberate v1 tradeoff; revisit before any second account is created. | Open — accepted for v1 |
| Losing the single Supabase account's access with no self-serve signup fallback. | Low | Low | Standard password-reset-by-email flow covers recovery. | Open — accepted for v1 |
| **New**: this sprint's historical import runs against a LIVE database with real, user-verified data (unlike Sprints 002/003, which ran against empty or freshly-truncated tables). A mistake here risks corrupting data the user is actively relying on. | Medium | High | Import is strictly additive (no TRUNCATE/DROP); the only mutations to existing rows (3 settings' `effective_date`, the seed's value) are mathematically pre-verified to reproduce Sprint 3's exact already-proofed numbers. Acceptance criteria include a hard regression check of that entire 8-week table before Sprint 004 is considered done. | Open — addressed in Sprint 004 acceptance criteria |
| **New**: extending `buildWeeklyRecap()` to compute weeks beyond `today` (needed so a Pay Period Recap can show "Week 2" even when today is still in Week 1) could, if implemented carelessly, start counting future/not-yet-happened weeks into the Rolling Balance shown elsewhere (e.g., the History tab, or the "current week" figure). | Medium | Medium | Blueprint specifies this extension is scoped to the Pay Period Recap's own period-bounded view only, not the underlying `weeks[]` array used for History/Leave Bank calculations elsewhere. | Open — addressed in acceptance criteria |
| **New**: 2026-01-10/11 (4.25 real hours on Jan-10) are excluded from tracked history since the rest of that Monday-Sunday week isn't documented anywhere. | Low | Low | Documented clearly; does not affect Rolling Balance correctness (verified). If the user later finds records for 2026-01-05–01-09, those days plus Jan-10/11 could be imported as a small follow-up. | Open — accepted, low stakes |
| **New**: 53-ISO-week years may not pair cleanly under the Week1/Week2 odd/even rule at the year boundary. | Low | Low | Documented as a known, accepted limitation. Not solved in v1. | Open — accepted for v1 |
