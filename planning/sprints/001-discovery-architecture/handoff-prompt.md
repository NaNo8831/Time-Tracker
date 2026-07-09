# Sprint 001 Builder Handoff Prompt — Discovery / Architecture

Read `AGENTS.md`, `planning/STATE.md`, `planning/DOMAIN.md`, `planning/DECISIONS.md`, `planning/RISKS.md`, `planning/QUESTIONS.md`, and `docs/ARCHITECTURE.md` first.

This sprint's deliverable is the planning pack itself — there is no further Builder implementation work in Sprint 001.

Do:
- Apply this Architect Pack with `node scripts/apply-architect-pack.js planning/architect-packs/architect-pack-001-discovery.md --dry-run`, review the output, then apply it without `--dry-run`.
- Confirm the generated files match what's described above.
- Leave `planning/STATUS.json` set to `phase: "apply-pack"` (already set by this pack) — do not advance it further from this sprint.

Do not:
- Write, edit, or delete any application/source/test file (nothing outside `planning/` and `docs/`).
- Start implementing the data model, screens, or migration described in `planning/sprints/001-discovery-architecture/blueprint.md` — that requires a new Architect Pack (Sprint 002) with explicit build authorization.

Next step: start a new Architect session to scope Architect Pack 002 — Sprint 002: Core MVP Build. Resolve the open questions in `planning/QUESTIONS.md` (auth approach, week-boundary rule for target changes, backup/export strategy) as part of that planning session.
