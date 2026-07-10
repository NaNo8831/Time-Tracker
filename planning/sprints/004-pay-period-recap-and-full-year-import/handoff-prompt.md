# Sprint 004 Builder Handoff Prompt — Pay Period Recap Redesign + Full-Year Historical Import

Read `AGENTS.md`, `planning/STATE.md`, `planning/DOMAIN.md`, `planning/DECISIONS.md`, `planning/RISKS.md`, `docs/ARCHITECTURE.md`, `docs/VALIDATION.md`, all four new CSVs in `references/source-app/`, and all four files in `planning/sprints/004-pay-period-recap-and-full-year-import/` first.

## The code gate (mandatory)

Before creating, editing, or deleting any source/test/app file, stop and post:

- A concrete file-by-file plan (follow `blueprint.md`'s build order).
- The scope guards — explicitly state you will NOT import data before 2026-01-12, will NOT build employer-anchored pay periods, will NOT build an in-app import feature, and will NOT run any destructive SQL against the live database.
- The acceptance criteria you're building toward, especially the Sprint 3 regression check.

Wait for explicit approval before writing any code.

## Do

- Build and verify the Pay Period Recap redesign BEFORE running the historical import SQL — the import's acceptance criteria depend on the new page existing.
- Write the schema-migration SQL (new `physical_year_settings` table) and the data-import SQL as separate scripts, additive-only, handed to the user to run manually — you have no direct DB access.
- Before declaring the import complete, explicitly re-verify the ENTIRE already-live Sprint 3 weekly table is unchanged — this is a live, real, in-use database now, not an empty or truncated one.
- Ask the user to confirm both SQL scripts have been run before treating the import as complete.

## Do not

- Do not import any data before 2026-01-12.
- Do not build employer-specific or user-configurable pay-period anchoring — ISO 8601 standard only, per `planning/DECISIONS.md`.
- Do not build an in-page modal/pop-out for day editing — day rows navigate to the existing `/entries/{date}` page.
- Do not run TRUNCATE, DROP, or any destructive statement against the live database.
- Do not let the Pay Period Recap's "extend weeks through a future date" logic leak into the History tab's or Leave Bank's calculations — those must stay bounded to `today`.
- Do not commit real Supabase credentials or any secret to the repository.

## Next step

Once verified, the next Architect session is open — no specific follow-up is queued beyond the still-open, low-priority question of whether 2026-01-01–01-09 can ever be recovered from other records.
