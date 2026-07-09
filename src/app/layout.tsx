import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Time Tracker",
  description: "Personal hours-worked tracker for Ly-Ark.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
