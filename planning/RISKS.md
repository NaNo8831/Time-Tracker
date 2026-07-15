# Risks

Known project risks and mitigation notes.

---

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| Effective-dated settings model complexity could corrupt historical balances if a lookup bug exists. | Medium | High | Regression-tested since Sprint 002, re-verified in Sprint 003. | Resolved — ongoing regression coverage |
| No backup/export strategy for Supabase-hosted personal data. | Medium | Medium | Resolved: Supabase's built-in automatic backups. | Resolved |
| RLS policy permits any authenticated session to read/write all rows (not scoped per-user). | Low | Medium | Deliberate v1 tradeoff; revisit before any second account is created. | Open — accepted for v1 |
| Losing the single Supabase account's access with no self-serve signup fallback. | Low | Low | Standard password-reset-by-email flow covers recovery. | Open — accepted for v1 |
| Sprint 004's historical import ran against a LIVE database with real, user-verified data. | Medium | High | Import was strictly additive; the only mutations to existing rows were mathematically pre-verified; user confirmed the imported numbers are correct after running both scripts. | Resolved (2026-07-09) |
| Extending `buildWeeklyRecap()` to compute weeks beyond `today` could, if implemented carelessly, start counting future/not-yet-happened weeks into the Rolling Balance shown elsewhere. | Medium | Medium | The extension is scoped to the Pay Period Recap's own period-bounded view only; unit tests cover the isolation. | Resolved |
| 2026-01-10/11 (4.25 real hours on Jan-10) are excluded from tracked history since the rest of that Monday-Sunday week isn't documented anywhere. | Low | Low | Documented clearly; does not affect Rolling Balance correctness (verified). | Open — accepted, low stakes |
| 53-ISO-week years may not pair cleanly under the Week1/Week2 odd/even rule at the year boundary. | Low | Low | Documented as a known, accepted limitation. Not solved in v1. | Open — accepted for v1 |
| Three rounds of real feature/bugfix work happened directly with the Builder between 2026-07-09 and 2026-07-14 without an Architect session in between, leaving `STATE.md` and `ARCHITECT_BRIEFING.md` stale relative to reality. | Low | Low | User caught it and asked for a planning-doc refresh (done 2026-07-14); going forward, the user wants Architect-mode conversations before new Builder work starts. | Resolved for now — process reminder |
| **New**: Weekly Actual Hours silently excluded real, already-logged data for days after today (Rule 6's day-loop had an unwritten `date > today` cutoff that contradicted the actual written rule). Found via user testing with pre-logged future vacation. | Was Medium (already shipped, affecting every week the user had pre-logged anything into) | Medium — no data was lost or corrupted, but the displayed Actual/Delta was wrong for any week with future-dated entries | Sprint 005 removes the cutoff; unit tests added proving a future day with real data now counts, and proving History/Rolling-Balance are unaffected. | Open — addressed in Sprint 005 |
| **New**: Sprint 005 introduces a third client-side interactive component (a modal), after the theme picker and `ActionForm`. No shared modal/dialog pattern exists yet — each component has been built standalone. | Low | Low | Fine for now at this scale (Micro-app tier); worth a shared pattern only if a fourth distinct interactive component appears with a different shape. | Open — accepted, watch for a 4th case |
