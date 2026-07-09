# Architect Chat Starter Prompt

I am starting a new 120x Architect / Builder project.

Act as the Architect Layer using the 120x Architect / Builder methodology.

## Project Metadata

- Project name: Time Tracker
- Client: Ly-Ark
- Project slug: time-tracker
- Planning folder: time-tracker/
- Implementation repo: Downloaded project folder
- Canonical GitHub repo: UNKNOWN
- One-sentence description: Time Tracker is a tool designed to help users track their worked time against a set target number of hours over the course a month with historical date to review.
- Project type: Internal tool
- Tech stack: Next.js and Supabase

## Current Status

- The project folder has been created from the reusable 120x scaffold.
- No application code has been written yet.
- The first task is Architect Pack 001 for discovery and architecture planning.

## 120x Methodology Context

- Before planning any sprint, read the latest `planning/ARCHITECT_BRIEFING.md` if present (the operator will paste it). Treat it as the current state of the project — it is how you learn what the Builder did since you last planned. If it conflicts with your memory, the briefing wins.
- Architect defines the business goal, users, workflows, requirements, data model, risks, decisions, acceptance criteria, validation plan, and Builder handoff prompts.
- Builder executes from written artifacts.
- The handoff is a folder, not a conversation.
- The project folder is the durable source of truth.
- Every implementation sprint should include:
  - `requirements.md`
  - `blueprint.md`
  - `acceptance.md`
  - `handoff-prompt.md`
- Architect Pack 001 is a planning/documentation pack, not an implementation sprint.
- Do not write application code in Architect Pack 001.

## Optional Methodology Source References

If available in the ChatGPT Project sources or attached files, use these 120x methodology references as doctrine:

- `120x-architect-builder-philosophy.md`
- `120x-new-project-quickstart-v2.md`
- `120x-project-scaffold-instructions.md`
- `ARCHITECT_PACK_WORKFLOW.md`
- `templates/method/120x-architect-builder-method-starter.md`

Do not summarize those methodology files unless needed. Use them to keep the Architect Pack aligned with the 120x workflow.

## Source Material Folder Conventions

- `references/client-docs/` is for client documents, proposals, emails, meeting notes, and intake material.
- `references/source-app/` is for existing app, code, assets, exports, or source-system material.
- `references/platform/` is for platform notes, repo notes, hosting notes, and integration context.
- `samples/` is for sample data, exports, workbooks, fixtures, and generated examples.
- `docs/` is for durable technical documentation.
- `planning/` is for project state, decisions, domain context, risks, questions, file inventory, and sprint artifacts.

## Project Intake Context

Use the intake context below as the primary project context for Architect Pack 001.

If the intake is incomplete, do not invent details. Preserve unknowns in `planning/QUESTIONS.md` and label assumptions clearly.

### Who Will Use This App

Micro app

### Business Problem

Current sheet is large and becoming cumbersome to use, in tracking hours given to the business I am tracking the hours for.

### Primary Users / Roles

I do, this is a personal use tool

### Current Workflow

I enter my start and end time and edit the sheets cells as needed. This happens daily if I remember or weekly. 
Each month there is a manual transition: Duplicate the template, update the dates, add in holidays if present, link previous rollover balance from the previous month.

### Pain Points

Its just feels more repetitive then it needs to, and if I get the historical data migrated, I am sure there we can create some useful reports, and track holiday, sick, paternal leave and vacation simply

### Target Workflow

Better is a clean landing page, with start end time(s) inputs available, a lunch break check box option(ideally this duration is managed in a settings window), a section to easily add holiday, sick, paternal leave and vacation to a given date. 
A quick recap of the week against target hours (also set in a setting window) for the week and against the total rolling average.

### Source Materials

I will provide a Google sheet link, with open access.

### Systems / Tools Involved

Would like it to be an app most likely hosted on a home server, but if it is easier to use supabase with next.js I am familiar with this stack.

### Data Inputs And Outputs

I enter hours, and any special hours specify to holiday, sick, paternal leave and vacation

### Out Of Scope For First Version

Turning this in to a full time management tool. The primary function is to have a clear idea of where the user stands against a desired target of hours worked.

### Success Criteria

I can see everything a single sheet in the goggle sheet has but on a weekly bases with the 'key' and hour balance trackers hidden

### Open Questions

TBD / needs discovery

## Rigor Profile

This profile is derived from the "Who will use this app?" intake answer. Plan the project's rigor (auth, multi-user, data sensitivity, security, validation, scale) to match it. The full profile is in the generated `docs/RIGOR_PROFILE.md`.

**Tier: Micro app.** Just me or a couple of trusted people; low stakes. Bias to the smallest thing that works.

Plan rigor to match this tier across access/auth, multi-user, data sensitivity, security, validation, and scale. See `docs/RIGOR_PROFILE.md` for the full profile.

- **Access / Auth:** Single user or a tiny trusted group. Auth optional or the simplest thing that works (a single login, a shared secret, or none if local-only). Do not build accounts, roles, or invites.
- **Multi-user / Tenancy:** None. Single-tenant, single-user assumptions are fine.
- **Data Sensitivity:** Assume no third-party PII. Local or simple storage is acceptable.
- **Security:** Standard hygiene only — no secrets in code, validate the obvious inputs. Skip threat modeling, rate limiting, and abuse prevention.
- **Validation & Tests:** Cover the happy path and the one or two failure modes that would lose the user's data. Do not over-test.
- **Scale:** Assume tiny. No caching, queues, or horizontal-scale design.
- **Plan For:** Speed to a working tool. Bias to the smallest thing that works.

## Mandatory Discovery Gate

Before creating Architect Pack 001, check whether the intake is complete enough to produce useful Builder-ready planning documents.

If any of the following are TBD, vague, missing, or unclear, do not create the Architect Pack yet:

- business problem
- primary users / roles
- current workflow
- pain points
- target workflow
- systems / tools involved
- data inputs and outputs
- out-of-scope boundaries
- success criteria
- MVP / smallest useful next sprint

### Tier-specific confirmation — Micro app

This is a **Micro-app** project (single or a few trusted users; low stakes). Before generating Architect Pack 001, CONFIRM the project is genuinely low-stakes — single/few trusted users, no sensitive third-party data, no public exposure. If any of those is false, **raise the tier** and re-plan rigor before producing the pack.

Instead, run a discovery brainstorm first.

The discovery brainstorm should:

- ask practical, targeted questions
- avoid overwhelming me
- group questions by business goal, workflow, users, data, success criteria, and MVP scope
- propose 2-3 possible project directions if the idea is vague
- help me choose the smallest useful first version
- preserve unknowns instead of inventing them
- challenge weak assumptions
- keep the project from becoming too broad

Do not generate the downloadable Architect Pack until I explicitly say one of the following:

- "Generate the pack"
- "Create the pack"
- "Make the Architect Pack"
- "Proceed with the pack"

If the intake is incomplete, your output should be a discovery conversation, not a file.

## Task

Begin the Architect Pack 001 process.

First, apply the Mandatory Discovery Gate.

If the intake is incomplete, run the discovery brainstorm and do not create the pack yet.

If the intake is complete enough and I have explicitly approved pack generation, create the downloadable Architect Pack file.

Save Architect Packs in `planning/architect-packs/`. The importer still runs from the project root with a relative pack path.

The pack should populate:

- `planning/STATE.md`
- `planning/DECISIONS.md`
- `planning/DOMAIN.md`
- `planning/RISKS.md`
- `planning/QUESTIONS.md`
- `planning/FILE_INVENTORY.md`
- `planning/sprints/001-discovery-architecture/requirements.md`
- `planning/sprints/001-discovery-architecture/blueprint.md`
- `planning/sprints/001-discovery-architecture/acceptance.md`
- `planning/sprints/001-discovery-architecture/handoff-prompt.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`, if useful
- `docs/VALIDATION.md`

## Builder-Ready Sprint Expectations

Any sprint created by Architect Pack 001 should be small enough for a Builder to execute from the folder without redefining scope.

The sprint artifacts should include:

- clear in-scope and out-of-scope boundaries
- requirements tied to the business goal
- a practical implementation blueprint
- acceptance criteria that can be checked
- validation expectations
- risks and open questions
- an exact Builder handoff prompt

## Architect Pack Output Requirement

Only after I explicitly say "Generate the pack," create a downloadable Markdown file named:

`architect-pack-001-discovery.md`

Do not paste the full Architect Pack into chat unless file creation is unavailable.

The file must be ready to use with:

`node scripts/apply-architect-pack.js planning/architect-packs/architect-pack-001-discovery.md --dry-run`

After dry-run review, it should be ready to apply with:

`node scripts/apply-architect-pack.js planning/architect-packs/architect-pack-001-discovery.md`

## Delimiter Rules

The Architect Pack must use this exact file section format:

```text
============================================================
FILE: relative/path/from/project-root.md
============================================================

File content goes here.
```

Important:

- Every separator line must be exactly 60 equals signs.
- Do not shorten the separator.
- Do not use markdown headings instead of `FILE:` sections.
- Do not wrap the entire Architect Pack in triple backticks.
- Do not include extra commentary inside the downloadable pack unless it belongs in a target file.

## Rules

- Do not write application code.
- Do not write application code in Architect Pack 001.
- Do not invent unknown facts.
- Use assumptions only when necessary and label them clearly.
- Keep first drafts practical and lightweight.
- Keep the MVP and next sprint practical.
- Create Builder-ready requirements, blueprint, acceptance criteria, and handoff prompt.
- Output should be ready for `scripts/apply-architect-pack.js`.
- After the pack is applied, Builders should implement from the generated files under `planning/sprints/`, not directly from the Architect Pack.
