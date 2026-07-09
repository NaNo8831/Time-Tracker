# File Inventory

Use this file to track important project files, references, samples, and their status.

---

## Generated Starter Files

| File | Purpose | Status | Notes |
|---|---|---|---|
| `planning/INTAKE.md` | Generated project startup artifact. | Created | Reviewed during Architect Pack 001 discovery. |
| `project-start.md` | Generated project startup artifact. | Created | Reviewed before starting Architect Pack 001. |
| `architect-chat-starter-prompt.md` | Generated project startup artifact. | Created | Reviewed before starting Architect Pack 001. |

---

## Personalized Scaffold Files

| File | Purpose | Status | Notes |
|---|---|---|---|
| `README.md` | Project-specific starter documentation. | Personalized | Initialized from CLI metadata. |
| `AGENTS.md` | Project-specific starter documentation. | Personalized | Initialized from CLI metadata. |
| `planning/STATE.md` | Project-specific starter documentation. | Updated by Architect Pack 001 | Reflects locked v1 scope and Sprint 001 completion. |
| `planning/DOMAIN.md` | Project-specific starter documentation. | Updated by Architect Pack 001 | Full domain model, business rules, and calculation formulas. |
| `planning/FILE_INVENTORY.md` | Project-specific starter documentation. | Updated by Architect Pack 001 | This file. |

---

## Source Material Reviewed

| Reference | Purpose | Status | Notes |
|---|---|---|---|
| Google Sheet: `https://docs.google.com/spreadsheets/d/1KKEhUQkF4SOgrrC_zReIPbNJwVC6k9eW44tk7AgTcYY/edit` | Source of the current manual time-tracking workflow; basis for the v1 data model and migration plan. | Reviewed | Open-access link provided by the user. Only 2026 calendar-year entries are in scope for migration (see `planning/DECISIONS.md`). Not downloaded into `references/source-app/` — external link only. |

---

## Sprint 001 Deliverables

| File | Purpose | Status |
|---|---|---|
| `planning/sprints/001-discovery-architecture/requirements.md` | Sprint 001 requirements. | Created by Architect Pack 001 |
| `planning/sprints/001-discovery-architecture/blueprint.md` | Sprint 001 architecture blueprint (data model, calculation rules, screens, migration plan). | Created by Architect Pack 001 |
| `planning/sprints/001-discovery-architecture/acceptance.md` | Sprint 001 acceptance criteria. | Created by Architect Pack 001 |
| `planning/sprints/001-discovery-architecture/handoff-prompt.md` | Sprint 001 Builder handoff prompt. | Created by Architect Pack 001 |
| `docs/ARCHITECTURE.md` | Durable architecture reference for v1. | Updated by Architect Pack 001 |
| `docs/API.md` | API surface notes for v1 (none planned). | Updated by Architect Pack 001 |
| `docs/VALIDATION.md` | Validation priorities for Sprint 002 planning. | Updated by Architect Pack 001 |

---

## Common Source And Reference Folders

| Folder | Purpose | Status | Notes |
|---|---|---|---|
| `references/client-docs/` | Client docs, proposals, emails, meeting notes, and intake material. | Created / ensured | Keep sensitive source material local and intentional. |
| `references/source-app/` | Existing app, code, assets, exports, or source-system material. | Created / ensured | Use when there is a source app or prior implementation. |
| `references/platform/` | Platform notes, repo notes, hosting notes, and integration context. | Created / ensured | Capture platform assumptions before implementation. |
| `samples/` | Sample data, exports, workbooks, fixtures, and generated examples. | Created / ensured | Avoid secrets and credentials in samples. |
| `planning/architect-packs/` | Architect Pack files before importer dry-run/apply. | Created / ensured | After applying a pack, build from `planning/sprints/`. |
