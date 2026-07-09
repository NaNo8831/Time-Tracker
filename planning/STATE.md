# Project State

**Project:** Time Tracker
**Client:** Ly-Ark
**Last updated:** 2026-07-08

---

## Current Phase

Architecture Locked — Ready for Build Sprint Planning

---

## Current Status

Architect Pack 001 (Discovery / Architecture) has been applied. The v1 product direction, data model, and calculation rules are locked based on a discovery conversation and a review of the existing Google Sheet the user currently tracks hours in.

- No application code has been written yet.
- Sprint 001 (Discovery / Architecture) is complete — its deliverable was this planning pack, not working software.
- Sprint 002 (Core MVP Build) has not been planned yet and requires a new Architect session before any implementation begins.

---

## Active Sprint

`planning/sprints/001-discovery-architecture/` — complete (planning-only sprint, no code authorized).

---

## Active Work

Start a new Architect session to plan Sprint 002 — Core MVP Build (data model implementation, daily entry screen, settings/preferences screen, weekly recap landing page, 2026 data migration from the Google Sheet).

---

## Project Metadata

| Field | Value |
|---|---|
| Project name | Time Tracker |
| Client name | Ly-Ark |
| Project slug | time-tracker |
| One-sentence description | Time Tracker is a tool designed to help users track their worked time against a set target number of hours over the course a month with historical date to review. |
| Project type | Internal tool |
| Planning folder | time-tracker/ |
| Implementation repo | Downloaded project folder |
| Canonical GitHub repo | UNKNOWN |
| Tech stack | Next.js, Supabase, Vercel |

---

## v1 Scope Snapshot

See `planning/DOMAIN.md` and `docs/ARCHITECTURE.md` for full detail. Summary:

- Daily entry: date, one or more check-in/check-out sessions, a "took lunch" toggle, optional vacation/sick/paternity leave hours (full or partial day).
- Settings (all effective-dated/changelog): weekly target hours, lunch duration default, standard workday hours (holiday credit), three leave banks (vacation, sick, paternity), plus a plain list of paid holidays.
- Weekly recap landing page: hours worked vs. target, rolling balance carried forward, current leave balances.
- One-time migration of 2026 daily entries from the source Google Sheet.
- Out of scope for v1: reports/analytics beyond the weekly recap, multi-user/accounts, mobile app, calendar integrations, reminders, blackout/recurring non-work dates.

---

## Next Actions

1. Start a new Architect session to plan Architect Pack 002 — Sprint 002: Core MVP Build.
2. Resolve the open questions in `planning/QUESTIONS.md` (auth approach, week-boundary rule, backup/export strategy) before Sprint 002 is scoped.
3. Implement only from generated sprint files under `planning/sprints/` once Sprint 002 is authorized.

---

## Blockers

No known blocker.

---

## Watch Items

- Do not write application code until an active sprint explicitly authorizes it. Sprint 001 does not authorize it.
- Keep the effective-dated/changelog pattern consistent across all settings (weekly target, lunch duration, standard workday hours, leave banks) — see `planning/DECISIONS.md`.
- Keep secrets, credentials, and private tokens out of project files.
