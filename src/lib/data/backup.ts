import { query } from "@/lib/db";
import { toTimestampText } from "@/lib/dbNormalize";

/**
 * When `npm run db:backup` last finished writing a backup file, as the app's
 * usual `YYYY-MM-DDTHH:MM:SS+00:00` text, or null when none is recorded.
 *
 * This feeds a header note on every page, so it must never throw: if the table
 * does not exist yet (the Sprint 009 SQL has not been run) or the query fails,
 * it returns null and the header shows "No backup yet".
 */
export async function getLastBackupAt(): Promise<string | null> {
  try {
    const rows = await query<{ backed_up_at: string }>(
      `select (backed_up_at at time zone 'UTC')::text as backed_up_at from last_backup where id = 1`
    );
    return rows.length > 0 ? toTimestampText(rows[0].backed_up_at) : null;
  } catch {
    return null;
  }
}
