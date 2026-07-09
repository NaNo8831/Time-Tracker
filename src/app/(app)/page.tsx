import { buildWeeklyRecap } from "@/lib/calculations/recap";
import { addDays } from "@/lib/calculations/dates";
import { summarizeDailyHistory } from "@/lib/calculations/history";
import { getDailyHistoryRows, getRecapInput } from "@/lib/data/recap";

const HISTORY_DAYS = 14;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatHours(hours: number): string {
  const sign = hours > 0 ? "+" : "";
  return `${sign}${hours.toFixed(2)} hrs`;
}

function othersBreakdownTitle(
  byType: { vacation: number; sick: number; paternity: number },
  holidayCredit: number
): string {
  return `Vacation: ${byType.vacation.toFixed(2)} · Sick: ${byType.sick.toFixed(2)} · Paternity: ${byType.paternity.toFixed(2)} · Holiday: ${holidayCredit.toFixed(2)}`;
}

export default async function WeeklyRecapPage() {
  const today = todayIso();
  const historyStart = addDays(today, -(HISTORY_DAYS - 1));

  const [input, historyRows] = await Promise.all([
    getRecapInput(today),
    getDailyHistoryRows(historyStart, today),
  ]);
  const recap = input ? buildWeeklyRecap(input) : null;
  const historySummary = summarizeDailyHistory(historyRows);

  if (!recap) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <h1 className="text-xl font-semibold text-slate-900">Weekly Recap</h1>
        <p className="text-sm text-slate-600">
          Set a weekly target hours value in Settings to see your recap here.
        </p>
      </main>
    );
  }

  const { currentWeek, leaveBankRemaining } = recap;

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <h1 className="text-xl font-semibold text-slate-900">Weekly Recap</h1>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="This Week" value={`${currentWeek.actualHours.toFixed(2)} hrs`} />
        <StatCard label="Target" value={`${currentWeek.targetHours.toFixed(2)} hrs`} />
        <StatCard
          label="Delta"
          value={formatHours(currentWeek.delta)}
          tone={currentWeek.delta < 0 ? "negative" : "positive"}
        />
      </section>

      <section>
        <StatCard
          label="Rolling Balance"
          value={formatHours(currentWeek.rollingBalance)}
          tone={currentWeek.rollingBalance < 0 ? "negative" : "positive"}
          large
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium text-slate-900">Leave Remaining</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(Object.keys(leaveBankRemaining) as (keyof typeof leaveBankRemaining)[]).map(
            (type) => (
              <StatCard
                key={type}
                label={type}
                value={`${leaveBankRemaining[type].toFixed(1)} hrs`}
                tone={leaveBankRemaining[type] < 0 ? "negative" : undefined}
                capitalizeLabel
              />
            )
          )}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium text-slate-900">Last {HISTORY_DAYS} Days</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Raw</th>
                <th className="px-3 py-2 text-right">Break</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th
                  className="px-3 py-2 text-right"
                  title="Vacation + Sick + Paternity + Holiday Credit — hover a row's value for the breakdown"
                >
                  Other
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyRows.map((row) => (
                <tr key={row.date}>
                  <td className="px-3 py-1.5">{row.date}</td>
                  <td className="px-3 py-1.5 text-right">{row.rawHours.toFixed(2)}</td>
                  <td className="px-3 py-1.5 text-right">{row.breakHours.toFixed(2)}</td>
                  <td className="px-3 py-1.5 text-right font-medium">{row.paidHours.toFixed(2)}</td>
                  <td
                    className="px-3 py-1.5 text-right underline decoration-dotted"
                    title={othersBreakdownTitle(row.leaveHoursByType, row.holidayCredit)}
                  >
                    {row.othersTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 font-semibold">
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2 text-right">{historySummary.totalRawHours.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{historySummary.totalBreakHours.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{historySummary.totalPaidHours.toFixed(2)}</td>
                <td
                  className="px-3 py-2 text-right underline decoration-dotted"
                  title={othersBreakdownTitle(
                    historySummary.totalLeaveHoursByType,
                    historySummary.totalHolidayCredit
                  )}
                >
                  {historySummary.totalOthersTotal.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone,
  large,
  capitalizeLabel,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
  large?: boolean;
  capitalizeLabel?: boolean;
}) {
  const toneClass =
    tone === "negative"
      ? "text-red-600"
      : tone === "positive"
        ? "text-emerald-600"
        : "text-slate-900";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p
        className={`text-xs font-medium uppercase tracking-wide text-slate-500 ${
          capitalizeLabel ? "capitalize" : ""
        }`}
      >
        {label}
      </p>
      <p className={`mt-1 font-semibold ${large ? "text-3xl" : "text-xl"} ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}
