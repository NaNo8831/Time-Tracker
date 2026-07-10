import Link from "next/link";
import { signOut } from "@/lib/auth/actions";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function Nav() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex gap-4 text-sm font-medium text-slate-700">
          <Link href={`/entries/${todayIso()}`} className="hover:text-slate-900">
            Daily Entry
          </Link>
          <Link href="/" className="hover:text-slate-900">
            Recap
          </Link>
          <Link href="/history" className="hover:text-slate-900">
            History
          </Link>
          <Link href="/settings" className="hover:text-slate-900">
            Settings
          </Link>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm text-slate-500 hover:text-slate-900">
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
