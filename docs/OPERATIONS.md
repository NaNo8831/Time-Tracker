# Operations — Time Tracker (Neon + Vercel)

How the app is configured, how to move off Supabase, and how to back up and restore. Never put real secrets in this file or commit them.

## Environment variables

| Name | Where it goes | What it is |
|---|---|---|
| `DATABASE_URL` | `.env.local` and Vercel (Production) | Neon's **pooled** connection string (host contains `-pooler`, ends with `sslmode=require`). Secret. Never prefix with `NEXT_PUBLIC_`. |
| `APP_PASSWORD_HASH` | `.env.local` and Vercel | A scrypt hash of your login password (format `scrypt:<N>:<salt>:<hash>`). The password itself is never stored. |
| `SESSION_SECRET` | `.env.local` and Vercel | Random key that signs the login cookie. |
| `SUPABASE_DB_URL` | `.env.local` only, **one time** | Supabase's Postgres connection string, used only by the copy script. Use the **Session pooler** string if your network has no IPv6. |

Entering them:
- In **`.env.local`**, keep the double quotes around the hash and secret.
- In **Vercel's Environment Variables screen**, paste the value **without** quotes (Vercel stores exactly what you type, quotes included).
- The hash uses `:` separators on purpose. A `$` would be mangled by Next.js when it loads `.env.local`.

## Creating or changing the password

```bash
npm run db:hash-password
```

Type the password at the hidden prompt (twice). It prints two lines, `APP_PASSWORD_HASH=...` and `SESSION_SECRET=...`. Put both in `.env.local` and in Vercel, then redeploy (Vercel → Deployments → Redeploy) so the site picks them up.

- Changing the password = run the script again and replace **both** values (or just the hash if you want to keep the same cookie key).
- Replacing `SESSION_SECRET` signs everyone out immediately (all existing login cookies stop working).
- Login cookies last 30 days. There is no "forgot password": just generate a new hash.

## Cutting over from Supabase to Neon (one time)

The live site keeps running on Supabase until you merge the PR, so you can rehearse safely.

**Before merging the PR**

1. Create the Neon project (production branch). Copy the pooled connection string into `.env.local` as `DATABASE_URL`.
2. In the Neon SQL editor, run **`neon/schema.sql`** (safe to re-run).
3. Take "before" screenshots of the live site: the top rows of **History**, and the current **Recap** (Rolling Balance, both weeks' Actual/Target/Delta, and one week's "Actual" pop-up).
4. Add `SUPABASE_DB_URL` to `.env.local` (Supabase dashboard → Connect → **Session pooler** string; the password is your database password).
5. Rehearse the copy. First a dry run (counts only, writes nothing):
   ```bash
   npm run db:migrate
   ```
   Then copy:
   ```bash
   npm run db:migrate -- --apply
   ```
   Every table must show `yes` in the match column. Any `NO` or `ERROR` means stop and investigate.
6. Create the login values with `npm run db:hash-password`. Add `DATABASE_URL`, `APP_PASSWORD_HASH` and `SESSION_SECRET` to **Vercel** (Production). The old Supabase variables stay for now; the currently deployed site ignores the new ones.
7. Optional rehearsal: run `npm run dev` locally. It now reads Neon, so you can sign in with the new password and compare the numbers to your screenshots without touching the live site.

**Cutover (don't log any entries during these few minutes)**

8. Final copy that empties the Neon tables first and re-copies everything fresh. This only ever empties **Neon**, never Supabase, and needs a confirmation variable:
   - PowerShell: `$env:CONFIRM_RESET="yes"; npm run db:migrate -- --apply --reset-target`
   - Git Bash: `CONFIRM_RESET=yes npm run db:migrate -- --apply --reset-target`

   All tables must match again.
9. Merge the PR. Vercel deploys the Neon version.
10. Check the live site against your screenshots: sign in; History and the Recap numbers must match exactly; add and remove a test session, leave entry and break on a scratch date and confirm times display correctly (an 08:00 check-in shows 08:00); add and remove a Settings item; click Prev/Next and a History date range.

**Rollback (if anything is wrong)**

In Vercel → Deployments, promote the previous deployment (the Supabase one). The old Supabase variables are still set, so it works immediately. Any entries made on Neon after cutover will not be in Supabase — roll back quickly, or re-enter them.

**Afterwards (on your own schedule)**

Once you're happy for a while: remove the old `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY` variables from Vercel and `.env.local`, take a first backup, and only then delete the Time Tracker project in Supabase to free the slot.

## Backups

Neon's free plan keeps only a short restore history, so exports are your real safety net. Run one monthly and before any risky change:

```bash
npm run db:backup
```

It writes `backups/time-tracker-YYYY-MM-DD.sql` (the `backups/` folder is gitignored — copy the file somewhere safe, e.g. cloud storage) and prints the row count per table. It only reads from the database.

### Restore

1. Create a new empty Neon database (a scratch project or branch is ideal).
2. Run `neon/schema.sql` in its SQL editor.
3. Run the contents of the backup `.sql` file in the same editor (or with `psql`).
4. Point `DATABASE_URL` at it if you want the app to use it, and check the row counts against what the backup script printed.

**A backup only counts once you have restored it somewhere at least once.** Do a test restore into a scratch database right after your first backup.

## Notes on Neon's free plan

- The database sleeps when idle and wakes automatically on the next request (the first page after a long gap can take a moment longer).
- Free-plan limits and restore windows change; check neon.com's current pricing/limits page before relying on any specific number.
- The database is reachable only from the server (Vercel) through the secret connection string; nothing in the browser can query it.
