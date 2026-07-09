# Validation

Per the Micro-app rigor profile (`docs/RIGOR_PROFILE.md`): cover the happy path and the one or two failure modes that would lose the user's data. Do not over-test.

## Sprint 003 Validation Priorities

- **Highest priority — the phantom-week risk**: verify `weekly_target_settings`' earliest `effective_date` is exactly 2026-05-04 (the Monday of the first full Monday-Sunday week with real activity, not the Monday of the week merely containing 2026-05-02), and that the Rolling Balance at the end of each imported week matches the exact expected values in `acceptance.md`. A wrong earliest date is silent and only shows up as a badly wrong Rolling Balance number — check it explicitly, don't assume.
- **Break override correctness**: a date with no override uses the effective-dated default; a date with an override (including an override of exactly 0) uses the override instead, never the default.
- **Effective-dating regression, still applies**: adding a new dated settings entry must never change already-computed past weeks or days — re-run this check after the break-model rename to confirm nothing broke.
- **Migration spot-checks**: the four worked examples in `blueprint.md` (2026-05-14, 05-20, 05-25, 06-11) should be manually verified in the running app against the source CSVs after import.
- **Regression on existing Sprint 002 hardening**: session overlap/duplicate rejection and settings duplicate-effective-date rejection must still work after the schema rename.

## Deferred

- Full manual walkthrough of every day in the 8-week import against the source CSVs is not required — the worked examples plus the exact Rolling Balance table are sufficient given the Micro-app rigor tier's "don't over-test" guidance.
- Validation of the January-April 2026 window is deferred to that future sprint.
