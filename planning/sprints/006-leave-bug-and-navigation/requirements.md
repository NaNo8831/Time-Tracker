# Sprint 006 Requirements — Leave Entry Bug Fix + Navigation Improvements

## Background

On 2026-11-05 the user reported that a leave entry made that day was not showing on the Daily Entry page and could not be removed, and that somehow 72 hours had been entered. Investigation (read-only) found the cause: `getDayEntryDetail()` returns early when the date has no `day_entries` row, so `leave_entries` is never queried for leave-only days. The entries were saved (and counted in Recap totals) but invisible on the page, so the user kept re-adding them. This is also the real root cause of the July "leave not showing on mobile" report.

The user also asked for three small navigation/labeling improvements. A fourth request (aligning pay periods with pay stubs) is deferred to Sprint 007 pending the stubs.

## Goals

1. **Bug fix**: the Daily Entry page shows (and allows removing) every leave entry for the selected date, regardless of whether any session or break has ever been saved for that date.
2. **Date picker auto-navigates**: choosing a date in the Daily Entry date picker opens that date immediately. Remove the "Go" button.
3. **History links to Recap**: on the History tab, each pay period's date range is a link that opens the Recap for that period (`/?period=<period start>`).
4. **Week labels**: on the Pay Period Recap, week headings read "Week 1" and "Week 2" (followed by the date range) instead of ISO week numbers. This applies to the section headings and the week modal title.

## Non-goals (explicitly out of scope)

- No change to pay-period boundaries or the ISO odd/even pairing — that is Sprint 007, after the user provides two pay stubs.
- No change to Business Rules 1-18 or any calculation (Actual, Delta, Rolling Balance, Leave Bank).
- No deletion or modification of the user's existing leave data by the Builder. The duplicate 2026-11-05 entries are removed by the user through the fixed UI.
- No duplicate-leave guard, no leave editing, no other Daily Entry redesign.
- No change to the History table's columns or contents beyond making the date range a link.

## Users / Roles

Unchanged — single user, Supabase auth.

## Acceptance Summary

See `acceptance.md`. Headline: opening 2026-11-05 in the live app shows the leave entries and each can be removed; picking a date opens it with no Go button; a History period's date range opens the right Recap; Recap headings say "Week 1"/"Week 2".
