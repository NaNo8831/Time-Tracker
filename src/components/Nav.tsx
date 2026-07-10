import Link from "next/link";
import { signOut } from "@/lib/auth/actions";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function Nav() {
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
        <form action={signOut}>
          <button type="submit" className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)]">
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
