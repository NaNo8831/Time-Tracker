const MAX_MINUTES = 240; // 4 hours

function buildOptions(): number[] {
  const options: number[] = [];
  for (let minutes = 0; minutes <= MAX_MINUTES; minutes += 15) {
    options.push(minutes);
  }
  return options;
}

const MINUTE_OPTIONS = buildOptions();

/**
 * 15-minute-increment break duration picker. A blank selection means "use
 * the effective-dated default break duration setting"; any other value is
 * a manual per-day override (including 0, meaning "no break today").
 */
export default function BreakMinutesSelect({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: number | null;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue === null || defaultValue === undefined ? "" : defaultValue}
      className="rounded-md border border-slate-300 px-2 py-1 text-sm"
    >
      <option value="">(use default)</option>
      {MINUTE_OPTIONS.map((minutes) => (
        <option key={minutes} value={minutes}>
          {minutes} min
        </option>
      ))}
    </select>
  );
}
