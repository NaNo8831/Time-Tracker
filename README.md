# Time Tracker

**Client:** 

Time Tracker is a personal tool for logging worked time against a weekly target and reviewing history. It shows a pay-period Recap (two Saturday-Friday weeks in a fixed 14-day cycle), a rolling balance, leave remaining, a per-week breakdown, and a History of past pay periods.

## Tech stack

- **App:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database:** Neon Postgres (`@neondatabase/serverless`), accessed only from the server
- **Login:** one password (scrypt hash in an environment variable) with a signed, httpOnly cookie
- **Hosting:** Vercel (auto-deploys `main`)
- **Tests:** Vitest
- **History:** the app ran on Supabase until Sprint 008 (2026-11-06)

## Running it locally

```bash
npm install
npm run dev
```

Create `.env.local` (never commit it) with `DATABASE_URL`, `APP_PASSWORD_HASH` and `SESSION_SECRET`. See `.env.local.example`, and `docs/OPERATIONS.md` for how to create each one.

## Useful scripts

| Command | What it does |
|---|---|
| `npm test` | Runs the test suite. |
| `npm run db:hash-password` | Creates the password hash and session secret. |
| `npm run db:backup` | Exports the database to `backups/` (gitignored) and updates the "Last backup" date in the app header. Run monthly. |
| `npm run db:check` | Read-only: shows which database the app connects to and row counts. |
| `npm run db:migrate` | One-time Supabase to Neon copy (already done). |

## Project docs

This project follows the 120x Architect / Builder method. Start with `AGENTS.md`, then `planning/STATE.md`.

- `docs/ARCHITECTURE.md`: how it is built
- `docs/OPERATIONS.md`: environment variables, password changes, backups, restore, rollback
- `docs/VALIDATION.md`: what has been tested
- `planning/`: state, decisions, risks, sprints and Architect Packs
