"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DailyBreakdownRow } from "@/lib/calculations/dailyBreakdown";
import type { IsoDate } from "@/lib/types";

function isWeekend(date: IsoDate): boolean {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

function dayOfWeek(date: IsoDate): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

function othersBreakdownTitle(
  byType: { vacation: number; sick: number; paternity: number },
  holidayCredit: number
): string {
  return `Vacation: ${byType.vacation.toFixed(2)} · Sick: ${byType.sick.toFixed(2)} · Paternity: ${byType.paternity.toFixed(2)} · Holiday: ${holidayCredit.toFixed(2)}`;
}

/**
 * Renders the "Actual" stat card as a clickable trigger; clicking opens a
 * modal with that week's 7-day log. Third deliberate client-side component
 * in the app (after ThemePicker and ActionForm) — see docs/ARCHITECTURE.md.
 */
export default function WeekLogModal({
  value,
  hoverTitle,
  weekLabel,
  rows,
}: {
  value: string;
  hoverTitle: string;
  weekLabel: string;
  rows: DailyBreakdownRow[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={hoverTitle}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-2.5 text-left shadow-sm hover:border-[var(--color-border-strong)] sm:p-4"
      >
        <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-faint)] sm:text-xs">
          Actual
        </p>
        <p className="mt-1 text-lg font-semibold text-[var(--color-text)] sm:text-xl">{value}</p>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-[var(--color-card-bg)] p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-medium text-[var(--color-text)]">{weekLabel}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
              >
                ✕
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
              <table className="min-w-full divide-y divide-[var(--color-border)] text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-faint)]">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Day</th>
                    <th className="px-3 py-2 text-right">Raw</th>
                    <th className="px-3 py-2 text-right">Break</th>
                    <th
                      className="px-3 py-2 text-right"
                      title="Vacation + Sick + Paternity + Holiday Credit — hover a row's value for the breakdown"
                    >
                      Other
                    </th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {rows.map((row) => (
                    <tr key={row.date} className={isWeekend(row.date) ? "bg-[var(--color-weekend-bg)]" : undefined}>
                      <td className="px-3 py-1.5">
                        <Link
                          href={`/entries/${row.date}`}
                          className="text-[var(--color-accent)] underline"
                        >
                          {row.date}
                        </Link>
                      </td>
                      <td className="px-3 py-1.5">{dayOfWeek(row.date)}</td>
                      <td className="px-3 py-1.5 text-right">{row.rawHours.toFixed(2)}</td>
                      <td className="px-3 py-1.5 text-right">{row.breakHours.toFixed(2)}</td>
                      <td
                        className="px-3 py-1.5 text-right underline decoration-dotted"
                        title={othersBreakdownTitle(row.leaveHoursByType, row.holidayCredit)}
                      >
                        {row.othersTotal.toFixed(2)}
                      </td>
                      <td className="px-3 py-1.5 text-right font-medium">{row.paidHours.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
