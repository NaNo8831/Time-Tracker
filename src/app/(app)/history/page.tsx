import { buildWeeklyRecap } from "@/lib/calculations/recap";
import { chunkWeeksIntoPeriods } from "@/lib/calculations/periods";
import { getRecapInput } from "@/lib/data/recap";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatHours(hours: number): string {
  const sign = hours > 0 ? "+" : "";
  return `${sign}${hours.toFixed(2)} hrs`;
}

function toneClass(hours: number): string {
  return hours < 0 ? "text-red-600" : "text-emerald-600";
}

export default async function HistoryPage() {
  const today = todayIso();
  const input = await getRecapInput(today);
  const recap = input ? buildWeeklyRecap(input) : null;

  if (!recap) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <h1 className="text-xl font-semibold text-slate-900">History</h1>
        <p className="text-sm text-slate-600">
          Set a weekly target hours value in Settings to see your history here.
        </p>
      </main>
    );
  }

  // Oldest-first internally; show most recent period first.
  const periods = chunkWeeksIntoPeriods(recap.weeks).reverse();

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <h1 className="text-xl font-semibold text-slate-900">History</h1>
      <p className="text-sm text-slate-600">
        Every tracked week, grouped into two-week chunks, most recent first. Rolling
        balance is the running total as of the end of that period.
      </p>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2">Period</th>
              <th className="px-3 py-2 text-right">Actual</th>
              <th className="px-3 py-2 text-right">Target</th>
              <th className="px-3 py-2 text-right">Delta</th>
              <th className="px-3 py-2 text-right">Rolling Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {periods.map((period) => (
              <tr key={period.periodStart}>
                <td className="px-3 py-1.5">
                  {period.periodStart} – {period.periodEnd}
                </td>
                <td className="px-3 py-1.5 text-right">{period.actualHours.toFixed(2)}</td>
                <td className="px-3 py-1.5 text-right">{period.targetHours.toFixed(2)}</td>
                <td className={`px-3 py-1.5 text-right ${toneClass(period.delta)}`}>
                  {formatHours(period.delta)}
                </td>
                <td className={`px-3 py-1.5 text-right font-medium ${toneClass(period.rollingBalance)}`}>
                  {formatHours(period.rollingBalance)}
                </td>
              </tr>
            ))}
            {periods.length === 0 && (
              <tr>
                <td className="px-3 py-2 text-slate-500" colSpan={5}>
                  No tracked weeks yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
