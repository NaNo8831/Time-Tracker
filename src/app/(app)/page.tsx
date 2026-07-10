import Link from "next/link";
import { buildPayPeriodRecap } from "@/lib/calculations/payPeriodRecap";
import { isoWeekNumber, payPeriodWeek1Start } from "@/lib/calculations/isoWeek";
import { weeksLeftInYear } from "@/lib/calculations/physicalYear";
import { addDays } from "@/lib/calculations/dates";
import { getDailyHistoryRows, getRecapInput } from "@/lib/data/recap";
import { getPhysicalYears } from "@/lib/data/settings";
import type { WeekSummary } from "@/lib/calculations/recap";
import type { IsoDate } from "@/lib/types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatHours(hours: number): string {
  const sign = hours > 0 ? "+" : "";
  return `${sign}${hours.toFixed(2)} hrs`;
}

function formatWeekRange(weekStart: IsoDate): string {
  const start = new Date(`${weekStart}T00:00:00Z`);
  const end = new Date(`${addDays(weekStart, 6)}T00:00:00Z`);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt(start)} - ${fmt(end)}`;
}

function isWeekend(date: IsoDate): boolean {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

function othersBreakdownTitle(
  byType: { vacation: number; sick: number; paternity: number },
  holidayCredit: number
): string {
  return `Vacation: ${byType.vacation.toFixed(2)} · Sick: ${byType.sick.toFixed(2)} · Paternity: ${byType.paternity.toFixed(2)} · Holiday: ${holidayCredit.toFixed(2)}`;
}

export default async function PayPeriodRecapPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const today = todayIso();
  const week1Start = searchParams.period ?? payPeriodWeek1Start(today);
  const week2Start = addDays(week1Start, 7);

  const [input, physicalYears] = await Promise.all([getRecapInput(today), getPhysicalYears()]);

  if (!input) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Pay Period Recap</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Set a weekly target hours value in Settings to see your recap here.
        </p>
      </main>
    );
  }

  const payPeriod = buildPayPeriodRecap(input, week1Start);

  if (!payPeriod) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Pay Period Recap</h1>
        <p className="text-sm text-[var(--color-text-muted)]">This period is before your tracked history.</p>
        <Link href={`/?period=${week2Start}`} className="text-sm text-[var(--color-accent)] underline">
          Next period →
        </Link>
      </main>
    );
  }

  const historyRows = await getDailyHistoryRows(week1Start, addDays(week1Start, 13));
  const weeksLeft = weeksLeftInYear(
    physicalYears.map((y) => ({ startDate: y.startDate, endDate: y.endDate })),
    today
  );

  const { week1, week2, rollingBalance, leaveBankRemaining } = payPeriod;
  const prevPeriod = addDays(week1Start, -14);
  const nextPeriod = addDays(week1Start, 14);

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Pay Period Recap</h1>
        <div className="flex gap-4 text-sm">
          <Link href={`/?period=${prevPeriod}`} className="text-[var(--color-accent)] underline">
            ← Prev
          </Link>
          <Link href={`/?period=${nextPeriod}`} className="text-[var(--color-accent)] underline">
            Next →
          </Link>
        </div>
      </div>

      <WeekSection title={`Week ${isoWeekNumber(week1.weekStart)}`} week={week1} />
      <WeekSection title={`Week ${isoWeekNumber(week2.weekStart)}`} week={week2} />

      <section>
        <StatCard
          label="Rolling Balance"
          value={formatHours(rollingBalance)}
          tone={rollingBalance < 0 ? "negative" : "positive"}
          large
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium text-[var(--color-text)]">Leave Remaining</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
          <StatCard
            label="Weeks Left in Year"
            value={weeksLeft === null ? "Not set" : `${weeksLeft}`}
          />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium text-[var(--color-text)]">
          {formatWeekRange(week1Start)} – {formatWeekRange(week2Start)}
        </h2>
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
          <table className="min-w-full divide-y divide-[var(--color-border)] text-sm">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-faint)]">
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
            <tbody className="divide-y divide-[var(--color-border)]">
              {historyRows.map((row, index) => (
                <tr
                  key={row.date}
                  className={[
                    index === 7 ? "border-t-2 border-[var(--color-border-strong)]" : "",
                    isWeekend(row.date) ? "bg-[var(--color-weekend-bg)]" : "",
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined}
                >
                  <td className="px-3 py-1.5">
                    <Link href={`/entries/${row.date}`} className="text-[var(--color-accent)] underline">
                      {row.date}
                    </Link>
                  </td>
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
          </table>
        </div>
      </section>
    </main>
  );
}

function WeekSection({ title, week }: { title: string; week: WeekSummary }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-medium text-[var(--color-text)]">
        {title} · {formatWeekRange(week.weekStart)}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Actual" value={`${week.actualHours.toFixed(2)} hrs`} />
        <StatCard label="Target" value={`${week.targetHours.toFixed(2)} hrs`} />
        <StatCard
          label="Delta"
          value={formatHours(week.delta)}
          tone={week.delta < 0 ? "negative" : "positive"}
        />
      </div>
    </section>
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
      ? "text-[var(--color-negative)]"
      : tone === "positive"
        ? "text-[var(--color-positive)]"
        : "text-[var(--color-text)]";

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 shadow-sm">
      <p
        className={`text-xs font-medium uppercase tracking-wide text-[var(--color-text-faint)] ${
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
