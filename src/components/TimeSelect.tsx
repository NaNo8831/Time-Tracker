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

// The placeholder is positioned in the list at 08:00 (rather than the very
// top) so that when nothing is selected yet, opening the dropdown scrolls
// to a typical start-of-day time instead of midnight — the browser scrolls
// a native <select> to show its currently-selected option, and the
// placeholder IS that option when defaultValue is unset. The displayed
// closed-control value ("--:--") and the fact that all times remain fully
// scrollable in normal chronological order are both unaffected.
const OPEN_NEAR_INDEX = TIME_OPTIONS.indexOf("08:00");

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
  const placeholder = (
    <option key="placeholder" value="" disabled>
      --:--
    </option>
  );

  const timeOptions = TIME_OPTIONS.map((time) => (
    <option key={time} value={time}>
      {time}
    </option>
  ));

  const options = defaultValue
    ? [placeholder, ...timeOptions]
    : [...timeOptions.slice(0, OPEN_NEAR_INDEX), placeholder, ...timeOptions.slice(OPEN_NEAR_INDEX)];

  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      required={required}
      className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-2 py-1 text-sm text-[var(--color-text)]"
    >
      {options}
    </select>
  );
}
