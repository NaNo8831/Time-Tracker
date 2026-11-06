# API

No separate REST/GraphQL API is built. The Next.js app talks to Neon Postgres directly from the server (updated Sprint 008; Supabase before that):

- **Reads**: Server Components call the data layer (`src/lib/data/*`), which runs parameterized SQL through `src/lib/db.ts` (Neon HTTP driver).
- **Writes**: Next.js Server Actions call the same data layer (create/update day entries, sessions, leave entries, holidays, and each effective-dated settings table).
- **Auth**: a single password (`APP_PASSWORD_HASH`, scrypt) is checked by the `signIn` server action, which sets a signed 30-day cookie (`SESSION_SECRET`). Next.js middleware verifies the cookie on every request to a protected route and redirects to `/login` if absent.

The database is reachable only from the server through the secret `DATABASE_URL`; nothing in the browser can query it. See `docs/ARCHITECTURE.md` ("Neon + password login") and `docs/OPERATIONS.md`.
