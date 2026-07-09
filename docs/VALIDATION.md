# Validation

Per the Micro-app rigor profile (`docs/RIGOR_PROFILE.md`): cover the happy path and the one or two failure modes that would lose the user's data. Do not over-test.

## v1 Validation Priorities (for Sprint 002 planning)

- A setting change (weekly target, lunch duration, standard workday hours, or a leave bank) must never alter the calculated Work Hours, Weekly Delta, or Rolling Balance for dates before that setting's `effective_date`. This is the most important behavior to verify given the effective-dated/changelog design — see the risk logged in `planning/RISKS.md`.
- Multi-session days (e.g., 8am-2pm, then 6pm-10pm) must sum correctly, and the lunch deduction must apply once per day regardless of session count.
- Leave bank remaining must never go negative silently without being visible to the user — flag when logged leave hours exceed the remaining balance.
- Holiday credit must apply automatically without requiring a manual clock-in on that date.
- Migration (when executed) should be spot-checked against the source sheet for a sample of days before being treated as trustworthy.
