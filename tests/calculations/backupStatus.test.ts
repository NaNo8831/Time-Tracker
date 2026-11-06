import { describe, expect, it } from "vitest";
import { STALE_AFTER_DAYS, describeBackup } from "@/lib/calculations/backupStatus";

const NOW = new Date("2026-11-09T15:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86400000).toISOString();

describe("describeBackup", () => {
  it("says 'No backup yet' (and flags it) when nothing is recorded or the value is garbage", () => {
    for (const bad of [null, "", "not a date"]) {
      const s = describeBackup(bad, NOW);
      expect(s.label).toBe("No backup yet");
      expect(s.shortLabel).toBe("No backup yet");
      expect(s.stale).toBe(true);
    }
  });

  it("shows the date and a plain age for a recent backup", () => {
    const s = describeBackup("2026-11-06T12:00:00+00:00", NOW);
    expect(s.label).toBe("Last backup: Nov 6 (3 days ago)");
    expect(s.shortLabel).toBe("Last backup: Nov 6");
    expect(s.stale).toBe(false);
  });

  it("uses 'today' and '1 day ago' wording", () => {
    expect(describeBackup("2026-11-09T01:00:00+00:00", NOW).label).toBe("Last backup: Nov 9 (today)");
    expect(describeBackup(daysAgo(1), NOW).label).toContain("(1 day ago)");
  });

  it("is stale only when strictly more than 35 days old", () => {
    expect(STALE_AFTER_DAYS).toBe(35);
    expect(describeBackup(daysAgo(35), NOW).stale).toBe(false);
    expect(describeBackup(daysAgo(36), NOW).stale).toBe(true);
    expect(describeBackup(daysAgo(36), NOW).label).toContain("(36 days ago)");
  });

  it("adds the year only when it differs from the current year", () => {
    expect(describeBackup("2025-12-28T12:00:00+00:00", NOW).label).toBe("Last backup: Dec 28, 2025 (316 days ago)");
    expect(describeBackup("2026-01-03T12:00:00+00:00", NOW).label).toMatch(/^Last backup: Jan 3 \(/);
  });

  it("treats a future timestamp (clock skew) as today, never stale", () => {
    const s = describeBackup("2026-11-12T12:00:00+00:00", NOW);
    expect(s.label).toBe("Last backup: Nov 12 (today)");
    expect(s.stale).toBe(false);
  });
});
