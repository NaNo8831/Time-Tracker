# Validation

Per the Micro-app rigor profile: cover the happy path and the one or two failure modes that would lose the user's data. Do not over-test.

## Sprint 004 Validation Priorities

- **Highest priority — the live-data regression check**: after the import, the entire already-proofed Sprint 3 weekly table (2026-05-04–2026-06-26) must reproduce EXACTLY. This is checking against real, currently-relied-upon numbers, not a fresh/empty database — treat any mismatch as a stop-everything issue.
- **Pay Period week-extension isolation**: confirm the Pay Period Recap's "compute Week 2 even if it's in the future" logic does not affect the History tab's period list or the Leave Bank remaining figures — those must stay bounded to `today`.
- **ISO week number correctness**: unit test against the verified reference dates in `blueprint.md` (2026-01-12 = week 3, 2026-04-27 = week 18, 2026-05-04 = week 19).
- **Migration spot-checks**: the four worked-example dates in `acceptance.md` (2026-01-20, 2026-02-13, 2026-03-05, 2026-04-09) should be manually verified in the running app against the source CSVs.

## Deferred

- Full manual walkthrough of every imported day is not required — the recomputed weekly table plus spot-checks are sufficient per the Micro-app rigor tier.
- The 53-ISO-week-year edge case and 2026-01-01–01-09 recovery are both explicitly deferred, not validated in this sprint.
