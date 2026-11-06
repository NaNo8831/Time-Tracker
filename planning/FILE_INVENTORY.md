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

## Sprint 006 Deliverables

| File | Purpose | Status |
|---|---|---|
| `planning/sprints/006-leave-bug-and-navigation/requirements.md` | Sprint 006 requirements. | Created by Architect Pack 006 |
| `planning/sprints/006-leave-bug-and-navigation/blueprint.md` | Bug fix + navigation changes design. | Created by Architect Pack 006 |
| `planning/sprints/006-leave-bug-and-navigation/acceptance.md` | Sprint 006 acceptance criteria. | Created by Architect Pack 006 |
| `planning/sprints/006-leave-bug-and-navigation/handoff-prompt.md` | Sprint 006 Builder handoff prompt. | Created by Architect Pack 006 |

## Sprint 007 Deliverables

| File | Purpose | Status |
|---|---|---|
| `planning/sprints/007-pay-cycle-alignment/requirements.md` | Sprint 007 requirements. | Created by Architect Pack 007 |
| `planning/sprints/007-pay-cycle-alignment/blueprint.md` | Sat–Fri weeks / fixed 14-day cycle design, reconciliation gate, SQL. | Created by Architect Pack 007 |
| `planning/sprints/007-pay-cycle-alignment/acceptance.md` | Sprint 007 acceptance criteria. | Created by Architect Pack 007 |
| `planning/sprints/007-pay-cycle-alignment/handoff-prompt.md` | Sprint 007 Builder handoff prompt. | Created by Architect Pack 007 |
| `src/lib/calculations/payCycle.ts` | Pay cycle anchor, `payWeekStart`, `payPeriodStart` (replaces `isoWeek.ts`). | Built Sprint 007 |
| `tests/calculations/payCycle.test.ts`, `tests/calculations/payCycleRealData.test.ts` | Stub-date tests; real-sheet regression (-9.37/-11.97/-16.97). | Built Sprint 007 |
| `supabase/migration-007-sat-fri-weeks.sql` | Additive, idempotent: Jan 10 import, settings dates → 2026-01-10, seed → -12.12. | Written; user runs after deploy |

## Sprint 008 Deliverables

| File | Purpose | Status |
|---|---|---|
| `planning/sprints/008-supabase-to-neon/requirements.md` | Sprint 008 requirements. | Created by Architect Pack 008 |
| `planning/sprints/008-supabase-to-neon/blueprint.md` | Neon data layer, password login, scripts, cutover/rollback. | Created by Architect Pack 008 |
| `planning/sprints/008-supabase-to-neon/acceptance.md` | Sprint 008 acceptance criteria. | Created by Architect Pack 008 |
| `planning/sprints/008-supabase-to-neon/handoff-prompt.md` | Sprint 008 Builder handoff prompt. | Created by Architect Pack 008 |

### Built in Sprint 008

| File | Purpose | Status |
|---|---|---|
| `src/lib/db.ts`, `src/lib/dbNormalize.ts` | Neon query helper; row-shape normalizers. | Built |
| `src/lib/data/{entries,recap,settings}.ts` | Rewritten to parameterized SQL, same exports. | Built |
| `src/lib/auth/{session,password,actions}.ts`, `src/middleware.ts`, `src/app/login/page.tsx` | Password login with signed cookie. | Built |
| `src/app/(app)/layout.tsx` | `force-dynamic`. | Edited |
| `neon/schema.sql` | Schema for Neon (idempotent). | Built; user runs |
| `scripts/{hash-password,migrate-supabase-to-neon,backup-db}.mjs`, `scripts/lib/tables.mjs` | User-run password hash, copy, backup. | Built; user runs |
| `docs/OPERATIONS.md` | Env vars, cutover, rollback, backups, restore. | Built |
| `tests/auth/*.test.ts`, `tests/data/rowParity.test.ts` | Session, password and shape-parity tests. | Built |
| `src/lib/supabase/{client,server}.ts` | Removed. | Deleted |
