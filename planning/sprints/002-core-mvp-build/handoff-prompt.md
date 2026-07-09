# Sprint 002 Builder Handoff Prompt — Core MVP Build

Read `AGENTS.md`, `planning/STATE.md`, `planning/DOMAIN.md`, `planning/DECISIONS.md`, `planning/RISKS.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, and `docs/VALIDATION.md` first, then all four files in `planning/sprints/002-core-mvp-build/`.

## The code gate (mandatory)

Before creating, editing, or deleting any source/test/app file, stop and post:

- A concrete file-by-file plan (what you will create/edit, in what order).
- The scope guards — explicitly state you will NOT build the Google Sheet migration, reports/analytics beyond the weekly recap, multi-user/signup, or anything else on the Sprint 002 out-of-scope list.
- The acceptance criteria you're building toward, from `planning/sprints/002-core-mvp-build/acceptance.md`.

Wait for explicit approval of that plan before writing any code. An earlier "generate the pack" or "proceed" approval does not count as code-gate approval.

## Do

- Implement only from `planning/sprints/002-core-mvp-build/requirements.md`, `blueprint.md`, and `acceptance.md`.
- Follow the build order in `blueprint.md`: schema → auth → calculation engine → settings → daily entry → weekly recap.
- Ask the user for real Supabase project credentials (URL, anon key, service role key) to place in a local, untracked `.env.local` — do not invent or commit placeholder secrets as if real.
- Verify the app manually against the acceptance criteria (per `docs/VALIDATION.md`), especially the effective-dating regression scenario, before declaring the sprint done.
- Update `planning/STATE.md`, and record any new decisions or risks encountered during the build in `planning/DECISIONS.md` / `planning/RISKS.md`, per the Completion Standard in `AGENTS.md`.

## Do not

- Do not implement the Google Sheet migration — that is Sprint 003 and requires its own Architect session.
- Do not add reports/analytics beyond the weekly recap, multi-user support, a signup flow, calendar integrations, reminders, or blackout-date logic.
- Do not add a `user_id` column or change the RLS approach documented in `planning/DECISIONS.md` without flagging it first.
- Do not commit real Supabase credentials or any secret to the repository.

## Next step

Once Sprint 002 is built and the user has verified it against real (test) usage, start a new Architect session to scope Sprint 003 — Historical Data Migration (2026 Google Sheet import).
