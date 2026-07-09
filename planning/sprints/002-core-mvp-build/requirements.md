# Sprint 002 Requirements — Core MVP Build

## Goal

Build the working Time Tracker application — login, daily entry, settings/preferences, and the weekly recap — implementing the data model and calculation rules locked in `planning/DOMAIN.md` and `docs/ARCHITECTURE.md`. This sprint ships a real, usable app the user can start entering live data into, with an empty database (no historical migration yet).

## In Scope

- Supabase schema: create all tables from `docs/ARCHITECTURE.md` (`day_entries`, `sessions`, `leave_entries`, `holidays`, `weekly_target_settings`, `lunch_duration_settings`, `standard_workday_hours_settings`, `leave_banks`), with RLS enabled per `planning/DECISIONS.md`.
- Auth: Supabase email/password login screen; middleware-based route protection so no page or data is reachable without an authenticated session; logout action. No signup/registration screen.
- Daily Entry screen: create/edit a day — date picker, add/remove one or more check-in/check-out session pairs, a single "took lunch" toggle, optional leave hours entry by type (vacation/sick/paternity, partial-day supported).
- Settings / Preferences screen: manage weekly target hours, lunch duration default, standard workday hours, and the three leave banks — each as an effective-dated changelog (add a new dated entry; view history); manage the paid holiday list (add/remove date + label).
- Weekly Recap landing page: current week's Work Hours vs. Weekly Target, the Rolling Balance carried forward from all tracked weeks, and current remaining balance for each leave bank. This is the default/home screen after login.
- Calculation engine: implement all 9 business rules from `planning/DOMAIN.md` as a shared, testable module — this is the highest-risk part of the sprint (see `planning/RISKS.md`).

## Out of Scope

- Migrating any Google Sheet data (2026 or otherwise) — planned as Sprint 003.
- Reports/analytics beyond the weekly recap view.
- Multi-user accounts, roles, invites, or a signup flow.
- Mobile app / native clients (a responsive web layout is sufficient; no native build).
- Calendar integrations, reminders, or notifications.
- Blackout dates / recurring non-work-day rules.
- Custom data export/backup tooling.
- Anything else on the "Out of Scope for v1" list in `planning/DOMAIN.md`.

## Tied to Business Goal

Directly delivers the business goal in `planning/DOMAIN.md`: replacing the user's Google Sheet with a fast, low-friction tool for logging hours and seeing a clean weekly recap against target and leave balances.
