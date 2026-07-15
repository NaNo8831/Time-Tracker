import Link from "next/link";
import CollapsibleSection from "@/components/CollapsibleSection";
import WeekLogModal from "@/components/WeekLogModal";
import { buildPayPeriodRecap } from "@/lib/calculations/payPeriodRecap";
import { isoWeekNumber, payPeriodWeek1Start } from "@/lib/calculations/isoWeek";
import { weeksLeftInYear } from "@/lib/calculations/physicalYear";
import { addDays } from "@/lib/calculations/dates";
import { splitWeekActual, type DailyBreakdownRow } from "@/lib/calculations/dailyBreakdown";
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

function actualHoverTitle(rows: DailyBreakdownRow[], today: IsoDate): string {
  const split = splitWeekActual(rows, today);
  const throughToday = `${split.throughTodayHours.toFixed(2)} hrs through today`;
  if (split.laterThisWeekHours <= 0) return throughToday;
  const { vacation, sick, paternity } = split.laterThisWeekByType;
  return `${throughToday} · ${split.laterThisWeekHours.toFixed(2)} hrs already logged for later this week (v: ${vacation.toFixed(2)} · s: ${sick.toFixed(2)} · p: ${paternity.toFixed(2)})`;
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
  const week1Rows = historyRows.slice(0, 7);
  const week2Rows = historyRows.slice(7, 14);
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

      <WeekSection
        title={`Week ${isoWeekNumber(week1.weekStart)}`}
        week={week1}
        rows={week1Rows}
        today={today}
      />
      <WeekSection
        title={`Week ${isoWeekNumber(week2.weekStart)}`}
        week={week2}
        rows={week2Rows}
        today={today}
      />

      <section>
        <StatCard
          label="Rolling Balance"
          value={formatHours(rollingBalance)}
          tone={rollingBalance < 0 ? "negative" : "positive"}
          large
        />
      </section>

      <CollapsibleSection title="Leave Remaining">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
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
      </CollapsibleSection>
    </main>
  );
}

function WeekSection({
  title,
  week,
  rows,
  today,
}: {
  title: string;
  week: WeekSummary;
  rows: DailyBreakdownRow[];
  today: IsoDate;
}) {
  const weekLabel = `${title} · ${formatWeekRange(week.weekStart)}`;

  return (
    <section className="space-y-2">
      <h2 className="text-base font-medium text-[var(--color-text)]">{weekLabel}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <WeekLogModal
          value={`${week.actualHours.toFixed(2)} hrs`}
          hoverTitle={actualHoverTitle(rows, today)}
          weekLabel={weekLabel}
          rows={rows}
        />
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
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-2.5 shadow-sm sm:p-4">
      <p
        className={`text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-faint)] sm:text-xs ${
          capitalizeLabel ? "capitalize" : ""
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1 font-semibold ${large ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"} ${toneClass}`}
      >
        {value}
      </p>
    </div>
  );
}
