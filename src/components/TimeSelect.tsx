function buildOptions(): string[] {
  const options: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
    const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mm = String(minutes % 60).padStart(2, "0");
    options.push(`${hh}:${mm}`);
  }
  return options;
}

const TIME_OPTIONS = buildOptions();

/**
 * 24-hour, 15-minute-increment time picker. A plain <select> (not a native
 * <input type="time">) so the format and step are guaranteed regardless of
 * browser/OS locale — no AM/PM, no to-the-minute entry.
 */
export default function TimeSelect({
  name,
  defaultValue,
  required,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      required={required}
      className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
    >
      <option value="" disabled>
        --:--
      </option>
      {TIME_OPTIONS.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </select>
  );
}
