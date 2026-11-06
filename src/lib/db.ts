import { neon } from "@neondatabase/serverless";

/**
 * Server-only access to the Neon Postgres database. The connection string
 * (DATABASE_URL) is a secret and must never be exposed to the browser —
 * keep it free of the NEXT_PUBLIC_ prefix. Use the pooled connection string.
 *
 * Queries use numbered placeholders ($1, $2, ...) so user input is never
 * interpolated into SQL. See src/lib/dbNormalize.ts for the value shapes the
 * data layer returns to the rest of the app.
 */
let cached: ReturnType<typeof neon> | null = null;

function client() {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set. See docs/OPERATIONS.md.");
    }
    cached = neon(url);
  }
  return cached;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const rows = await client().query(text, params);
  return rows as unknown as T[];
}
