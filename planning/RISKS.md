# Risks

Known project risks and mitigation notes.

---

| Risk | Likelihood | Impact | Mitigation | Status |
|---|---:|---:|---|---|
| Effective-dated settings model is more complex than a flat settings table; a bug in "which value was in effect" lookups could silently corrupt historical balances the user relies on. | Medium | High | Document the lookup rule explicitly (Business Rule 7 in `planning/DOMAIN.md`); Sprint 002 acceptance criteria should include a specific test around a setting change mid-history. | Open |
| Migrated 2026 sheet data may be inconsistent (manual entry errors, format drift within the year). | Medium | Medium | Manually spot-check a sample of migrated rows against the source sheet after import; treat migration as a one-time reviewable step, not a live sync. | Open |
| No backup/export strategy defined yet for Supabase-hosted personal data. | Medium | Medium | Define a simple export/backup approach before or during Sprint 002. | Open |
| Rolling balance and leave-bank math both depend on getting week/date boundary rules exactly right (e.g., which target applies if it changes mid-week). | Low | Medium | Resolve the open week-boundary question in `planning/QUESTIONS.md` before Sprint 002 is scoped. | Open |
| Scope creep toward a "full time management tool" the user explicitly does not want. | Low | Medium | Every future sprint should be checked against the Out of Scope list in `planning/DOMAIN.md` before being authorized. | Open |
