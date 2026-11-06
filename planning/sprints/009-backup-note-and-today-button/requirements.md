# Sprint 009 Requirements — Last-backup note in the header + "Today" link on the Recap

## Background

Sprint 008 moved the app to Neon and added a user-run backup script. A backup only protects the user if it is actually taken, and the habit (monthly) lives only in documentation. The user sees the app far more often than the code, so they want the age of their last backup visible in the app. Separately, after paging back through old pay periods on the Recap there is no quick way back to the current one.

## Goals

1. **Last-backup note in the app header.** In the Nav bar, in the free space between the links and "Sign out", show the date and age of the last recorded backup:
   - `Last backup: Nov 6 (3 days ago)`; `today` / `1 day ago` / `N days ago`; the year is added only when it is not the current year (`Nov 6, 2026`).
   - Muted text normally; **amber** when the last backup is more than **35 days** old (36+ days = stale; exactly 35 is not).
   - `No backup yet` when nothing has been recorded (shown in the amber/attention style).
   - On narrow (phone) screens the "(N days ago)" part is dropped so the header does not wrap awkwardly; the date stays.
2. **Record the date.** `npm run db:backup` records the time it finished writing the backup file into a new one-row table. The user's existing backup (taken and stored safely on 2026-11-06) is recorded as the starting value by a one-time SQL statement the user runs in Neon.
3. **"Today" link on the Recap.** The header row becomes `← Prev   Today   Next →`. "Today" goes to the current pay period (`/`). When the user is already viewing the current pay period it is shown greyed out and is not clickable.

## Non-goals (explicitly out of scope)

- Any change to calculations, History, Daily Entry, Settings content, login, or existing tables.
- Automated or scheduled backups, e-mail/notification reminders, an in-app "Back up now" button, or showing backup history/list.
- Verifying that the user copied the file somewhere safe (the app cannot know). Wording must say "Last backup", never "Safe" or "Verified".
- Changing how the backup file is written (the restore the user already tested must stay valid).

## Users / Roles

Single user (the owner).

## Acceptance Summary

See `acceptance.md`. Headline: the header shows the right date/age/colour in every state, the backup script records its run without ever failing the backup, no page breaks if the new table does not exist yet, and the Today link is correct on current, past, and future periods.
