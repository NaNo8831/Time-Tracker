import Link from "next/link";
import { signOut } from "@/lib/auth/actions";
import { describeBackup } from "@/lib/calculations/backupStatus";
import { getLastBackupAt } from "@/lib/data/backup";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function Nav() {
  const backup = describeBackup(await getLastBackupAt(), new Date());

  return (
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-card-bg)]">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex flex-wrap gap-4 text-sm font-medium text-[var(--color-text-muted)]">
          <Link href={`/entries/${todayIso()}`} className="hover:text-[var(--color-text)]">
            Daily Entry
          </Link>
          <Link href="/" className="hover:text-[var(--color-text)]">
            Recap
          </Link>
          <Link href="/history" className="hover:text-[var(--color-text)]">
            History
          </Link>
          <Link href="/settings" className="hover:text-[var(--color-text)]">
            Settings
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span
            title="Run npm run db:backup and keep the file somewhere safe"
            className={`text-xs ${backup.stale ? "text-[var(--color-warning)]" : "text-[var(--color-text-faint)]"}`}
          >
            <span className="hidden sm:inline">{backup.label}</span>
            <span className="sm:hidden">{backup.shortLabel}</span>
          </span>
          <form action={signOut}>
            <button type="submit" className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)]">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
