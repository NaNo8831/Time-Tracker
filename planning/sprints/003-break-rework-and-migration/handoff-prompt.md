# Sprint 003 Builder Handoff Prompt — Break Model Rework + Historical Migration

Read `AGENTS.md`, `planning/STATE.md`, `planning/DOMAIN.md`, `planning/DECISIONS.md`, `planning/RISKS.md`, `docs/ARCHITECTURE.md`, `docs/VALIDATION.md`, both CSVs in `references/source-app/`, and all four files in `planning/sprints/003-break-rework-and-migration/` first.

## The code gate (mandatory)

Before creating, editing, or deleting any source/test/app file, stop and post:

- A concrete file-by-file plan (what you will create/edit, in what order — follow `blueprint.md`'s build order).
- The scope guards — explicitly state you will NOT import data outside 2026-05-02–2026-06-26, will NOT build a Settings UI for the Rolling Balance Seed, and will NOT build a pay-period-cycle setting.
- The acceptance criteria you're building toward, from `acceptance.md`, especially the exact expected Rolling Balance table.

Wait for explicit approval before writing any code.

## Do

- Follow the build order in `blueprint.md`: schema SQL → calculation engine renames → UI updates → data-import SQL → verify.
- Write the schema-migration SQL and the data-import SQL as separate scripts (not embedded in application code) and hand both to the user to run manually against the live Supabase project — you have no direct DB access.
- Double-check the critical `effective_date = 2026-05-04` rule for `weekly_target_settings` before writing that INSERT — getting this wrong silently corrupts every week's Rolling Balance. Verify against the acceptance table's exact expected values once the user has run both scripts.
- Update existing unit tests for every renamed field/function (`lunchDeduction`→`breakDeduction`, etc.) — do not leave stale test names.
- Ask the user to confirm both SQL scripts have been run (schema first, then data) before treating the import as complete — you cannot verify live data yourself without their confirmation.

## Do not

- Do not import any data outside 2026-05-02 through 2026-06-26.
- Do not build a Settings UI for the Rolling Balance Seed.
- Do not build a pay-period-cycle configuration.
- Do not use an earlier placeholder `effective_date` (e.g., 2026-01-01) for `weekly_target_settings` — see the phantom-week risk in `planning/RISKS.md`.
- Do not commit real Supabase credentials or any secret to the repository.

## Next step

Once verified against the acceptance table, the next Architect session scopes the January-April 2026 import as its own sprint — including re-checking whether the break-duration-default and standard-workday-hours values from that earlier "4-day week" era differ from this sprint's (they likely do).
