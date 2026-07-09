# Sprint 002 Acceptance — Core MVP Build

Sprint 002 is complete when all of the following are true:

## Auth

- An unauthenticated visitor cannot view or mutate any data — every route except `/login` redirects to `/login` without a valid session.
- A valid login with the single provisioned account reaches the Weekly Recap screen.
- Logout ends the session and returns the user to a state where protected routes redirect to `/login` again.

## Daily Entry

- A day can be created/edited with one or more check-in/check-out session pairs (e.g., 8am–2pm, then 6pm–10pm on the same day) and the sessions are stored and re-displayed correctly.
- The "took lunch" toggle, when checked, deducts the effective lunch duration exactly once for that day regardless of how many sessions exist.
- Leave hours (vacation/sick/paternity, full or partial day) can be logged against a date alongside worked sessions.

## Settings / Preferences

- Each of weekly target hours, lunch duration, standard workday hours, and each leave bank (vacation/sick/paternity) can have a new dated entry added, and prior entries remain visible as history (not overwritten).
- The paid holiday list supports adding and removing a date + label entry.

## Weekly Recap

- The landing page (default route after login) shows the current week's Work Hours, Weekly Target, Weekly Delta, the Rolling Balance across all tracked weeks, and remaining balance for each leave bank.
- No letter codes or raw internal balance math are exposed in the UI — only the computed, human-readable numbers.

## Calculation Correctness (highest-priority checks — see `planning/RISKS.md`)

- **Effective-dating regression test**: after adding a new weekly target entry effective this coming Monday, all previously computed weeks' Weekly Delta and Rolling Balance values are unchanged. The same holds for a new lunch duration, standard workday hours, or leave bank entry — past calculations must not shift.
- A multi-session day sums correctly, and the lunch deduction applies exactly once regardless of session count.
- Holiday credit applies automatically for a date in the holiday list, with no session/clock-in required that day.
- If logged leave hours for a type exceed that type's current remaining balance, the UI visibly flags it (does not silently go negative unnoticed).

## General

- The app runs locally against a real Supabase project using only environment variables supplied outside the repo (no secrets committed).
- No Google Sheet migration code or UI exists in this sprint's deliverable.
- `planning/STATE.md` is updated to reflect Sprint 002's completion status at close, per `AGENTS.md` Completion Standard.
