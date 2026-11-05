"use client";

import { useRouter } from "next/navigation";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Date picker that opens the chosen date immediately (no "Go" button).
 * Only complete, plausible dates navigate: desktop typing changes the value
 * per keystroke (a year typed digit by digit passes through 0002, 0020, ...),
 * so years outside 2000-2099 are ignored.
 */
export default function DateJump({ date }: { date: string }) {
  const router = useRouter();

  function onChange(value: string) {
    const match = ISO_DATE.exec(value);
    if (!match) return;
    const year = Number(match[1]);
    if (year < 2000 || year > 2099) return;
    if (value === date) return;
    router.push(`/entries/${value}`);
  }

  return (
    <input
      type="date"
      defaultValue={date}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Jump to date"
      className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
    />
  );
}
