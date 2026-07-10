"use client";

import { useEffect, useState } from "react";
import { DEFAULT_THEME, isThemeId, THEME_STORAGE_KEY, THEMES, type ThemeId } from "@/lib/theme";

export default function ThemePicker() {
  const [active, setActive] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeId(stored)) setActive(stored);
  }, []);

  function choose(id: ThemeId) {
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
    setActive(id);
  }

  return (
    <div className="flex flex-wrap gap-3">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => choose(theme.id)}
          aria-pressed={active === theme.id}
          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
            active === theme.id
              ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]"
              : "border-[var(--color-border)]"
          }`}
        >
          <span
            className="h-4 w-4 rounded-full border border-[var(--color-border-strong)]"
            style={{ backgroundColor: theme.swatch }}
          />
          {theme.label}
        </button>
      ))}
    </div>
  );
}
