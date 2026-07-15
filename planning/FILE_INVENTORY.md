# File Inventory

Use this file to track important project files, references, samples, and their status.

---

## Source Material Reviewed

| Reference | Purpose | Status | Notes |
|---|---|---|---|
| Google Sheet (see `planning/DOMAIN.md`) | Source of the manual time-tracking workflow. | Reviewed | Six real CSV exports reviewed cell-by-cell across Sprints 003-004, covering 2026-01-10 through 2026-06-26. |
| `references/source-app/sheet-export-2026-01-10-to-2026-02-06.csv` | Real source data, Sprint 004 import batch. | Saved | Verbatim export. |
| `references/source-app/sheet-export-2026-02-07-to-2026-03-06.csv` | Real source data, Sprint 004 import batch. | Saved | Verbatim export. |
| `references/source-app/sheet-export-2026-03-07-to-2026-04-03.csv` | Real source data, Sprint 004 import batch. | Saved | Verbatim export. Has a stray leading data row (`Mar-9`) — see `planning/DECISIONS.md`. |
| `references/source-app/sheet-export-2026-04-04-to-2026-05-01.csv` | Real source data, Sprint 004 import batch. | Saved | Verbatim export. Connects directly into the already-imported 2026-05-02 window. |

## Sprint 004 Deliverables

| File | Purpose | Status |
|---|---|---|
| `planning/sprints/004-pay-period-recap-and-full-year-import/requirements.md` | Sprint 004 requirements. | Created by Architect Pack 004 |
| `planning/sprints/004-pay-period-recap-and-full-year-import/blueprint.md` | Pay Period redesign + import technical design. | Created by Architect Pack 004 |
| `planning/sprints/004-pay-period-recap-and-full-year-import/acceptance.md` | Sprint 004 acceptance criteria. | Created by Architect Pack 004 |
| `planning/sprints/004-pay-period-recap-and-full-year-import/handoff-prompt.md` | Sprint 004 Builder handoff prompt. | Created by Architect Pack 004 |
| `docs/ARCHITECTURE.md` | Durable architecture reference. | Updated by Architect Pack 004, 005 |
| `docs/VALIDATION.md` | Validation priorities. | Updated by Architect Pack 004, 005 |
| `supabase/schema-migration-004-physical-year.sql`, `supabase/migration-004-import-2026-01-12-to-2026-05-01.sql` | Sprint 004 SQL, run and verified 2026-07-09. | Run against production |

## Post-Sprint-004 Deliverables (2026-07-09, direct Builder work — no sprint folder)

| File | Purpose | Status |
|---|---|---|
| `src/components/ThemePicker.tsx`, `src/lib/theme.ts` | Client-side theme preset picker (5 presets incl. dark). | Live |
| `src/app/globals.css` | CSS custom properties per `[data-theme]`, used app-wide instead of hardcoded Tailwind colors. | Live |
| `docs/THEMING.md` | Local-only (gitignored) guide to editing the color palette. | Not in repo — local reference only |
| `src/components/CollapsibleSection.tsx` | Generic collapsible section wrapper (used for Leave Remaining). | Live |
| `src/components/ActionForm.tsx` | Client wrapper that calls `router.refresh()` after a server action completes; fixes the mobile leave-entry refresh bug. | Live |
| `.claude/launch.json` | Added a second dev-server config (`time-tracker-dev-preview`, port 3100) for isolated QA without disturbing the user's own running dev server. | Local tooling, not app code |

## Sprint 005 Deliverables

| File | Purpose | Status |
|---|---|---|
| `planning/sprints/005-weekly-actual-fix-and-week-drilldown/requirements.md` | Sprint 005 requirements. | Created by Architect Pack 005 |
| `planning/sprints/005-weekly-actual-fix-and-week-drilldown/blueprint.md` | Bug-fix + modal technical design. | Created by Architect Pack 005 |
| `planning/sprints/005-weekly-actual-fix-and-week-drilldown/acceptance.md` | Sprint 005 acceptance criteria. | Created by Architect Pack 005 |
| `planning/sprints/005-weekly-actual-fix-and-week-drilldown/handoff-prompt.md` | Sprint 005 Builder handoff prompt. | Created by Architect Pack 005 |
