"use client";

import { useState } from "react";

export default function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <h2 className="text-base font-medium text-[var(--color-text)]">{title}</h2>
        <span className="text-[var(--color-text-faint)]">{open ? "▾" : "▸"}</span>
      </button>
      {open && children}
    </section>
  );
}
