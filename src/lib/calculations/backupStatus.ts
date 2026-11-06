/** A backup older than this many days is shown as stale (amber) in the header. */
export const STALE_AFTER_DAYS = 35;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MS_PER_DAY = 86400000;

export interface BackupStatus {
  /** Full text, e.g. "Last backup: Nov 6 (3 days ago)". */
  label: string;
  /** Date only, for narrow screens, e.g. "Last backup: Nov 6". */
  shortLabel: string;
  /** True when no backup is recorded or it is more than STALE_AFTER_DAYS old. */
  stale: boolean;
}

const NONE: BackupStatus = { label: "No backup yet", shortLabel: "No backup yet", stale: true };

/**
 * Turns the recorded backup time into the header text. The date means the
 * backup script finished — not that the file was copied somewhere safe — so
 * the wording is deliberately just "Last backup". Uses UTC and a fixed English
 * month list so the server and browser always render the same text.
 */
export function describeBackup(lastBackupAt: string | null, now: Date): BackupStatus {
  if (!lastBackupAt) return NONE;
  const backedUp = new Date(lastBackupAt);
  if (Number.isNaN(backedUp.getTime())) return NONE;

  const days = Math.max(0, Math.floor((now.getTime() - backedUp.getTime()) / MS_PER_DAY));
  const age = days === 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`;

  const month = MONTHS[backedUp.getUTCMonth()];
  const sameYear = backedUp.getUTCFullYear() === now.getUTCFullYear();
  const date = sameYear
    ? `${month} ${backedUp.getUTCDate()}`
    : `${month} ${backedUp.getUTCDate()}, ${backedUp.getUTCFullYear()}`;

  return {
    label: `Last backup: ${date} (${age})`,
    shortLabel: `Last backup: ${date}`,
    stale: days > STALE_AFTER_DAYS,
  };
}
