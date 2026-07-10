export const THEMES = [
  { id: "slate", label: "Slate", swatch: "#0f172a" },
  { id: "ocean", label: "Ocean", swatch: "#0369a1" },
  { id: "forest", label: "Forest", swatch: "#047857" },
  { id: "rose", label: "Rose", swatch: "#be123c" },
  { id: "dark", label: "Dark", swatch: "#0f172a" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeId = "slate";
export const THEME_STORAGE_KEY = "time-tracker-theme";

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return THEMES.some((t) => t.id === value);
}
