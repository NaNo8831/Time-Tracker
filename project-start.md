# Project Start

## Project Metadata

| Field | Value |
|---|---|
| Project name | Time Tracker |
| Client name | Ly-Ark |
| Project slug | time-tracker |
| One-sentence description | Time Tracker is a tool designed to help users track their worked time against a set target number of hours over the course a month with historical date to review. |
| Project type | Internal tool |
| Planning folder | time-tracker/ |
| Implementation repo path | Downloaded project folder |
| Canonical GitHub repo | UNKNOWN |
| Tech stack | Next.js and Supabase |
| Scaffold source | Hosted virtual scaffold |

## Created Structure

- `planning/architect-packs/`
- `references/client-docs/`
- `references/source-app/`
- `references/platform/`
- `samples/`

## Personalized Files

- `README.md`
- `AGENTS.md`
- `planning/STATE.md`
- `planning/DOMAIN.md`
- `planning/FILE_INVENTORY.md`

## Generated Files

- `planning/INTAKE.md`
- `project-start.md`
- `architect-chat-starter-prompt.md`

## Architect Intake

`planning/INTAKE.md` captures the guided intake context collected before project creation. Use it as primary discovery context when creating Architect Pack 001.


## Next Steps

1. Open the new project folder.
2. Review `project-start.md`.
3. Review `planning/INTAKE.md`.
4. Open `architect-chat-starter-prompt.md`.
5. Start a new Architect chat.
6. Start Architect Pack 001 discovery.
7. Generate Architect Pack 001 only after explicit approval.
8. Save the Architect Pack in `planning/architect-packs/`.
9. Dry-run the importer.
10. Apply the Architect Pack after review.

## Architect Pack Commands

Save Architect Packs in `planning/architect-packs/`.

Dry-run from the project root:

`node scripts/apply-architect-pack.js planning/architect-packs/architect-pack-###-{sprint-name}.md --dry-run`

Apply from the project root after reviewing the dry-run:

`node scripts/apply-architect-pack.js planning/architect-packs/architect-pack-###-{sprint-name}.md`

After a pack is applied, Builders implement from the generated sprint files under `planning/sprints/`, not directly from the Architect Pack.
