import type { Metadata } from "next";
import "./globals.css";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Time Tracker",
  description: "Personal hours-worked tracker for Ly-Ark.",
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var t = localStorage.getItem("${THEME_STORAGE_KEY}") || "${DEFAULT_THEME}";
    document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text)]">
        {children}
      </body>
    </html>
  );
}
