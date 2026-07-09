# API

No separate REST/GraphQL API is built for v1. The Next.js app talks to Supabase directly:

- **Reads**: Server Components fetch via the Supabase server client.
- **Writes**: Next.js Server Actions call the Supabase server client directly (create/update day entries, sessions, leave entries, holidays, and each effective-dated settings table).
- **Auth**: Supabase Auth handles login/session/logout; Next.js middleware checks the session on every request to a protected route and redirects to `/login` if absent.

All data access — reads and writes — must go through an authenticated Supabase session; RLS policies (see `docs/ARCHITECTURE.md`) enforce this at the database level as a second layer, not just in the app.

This file will be revisited if Sprint 003 (Google Sheet migration) needs a dedicated import script or endpoint — likely a one-off Node script run locally against the Supabase service role key, not a public API route.
