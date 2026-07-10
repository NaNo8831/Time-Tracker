import { signIn } from "@/lib/auth/actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        action={signIn}
        className="w-full max-w-sm space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-sm"
      >
        <h1 className="text-lg font-semibold text-[var(--color-text)]">Time Tracker</h1>

        {searchParams.error && (
          <p className="rounded-md bg-[var(--color-error-bg)] px-3 py-2 text-sm text-[var(--color-error-text)]">
            {searchParams.error}
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-muted)]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-muted)]">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-[var(--color-btn-bg)] px-3 py-2 text-sm font-medium text-[var(--color-btn-text)] hover:bg-[var(--color-btn-bg-hover)]"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
