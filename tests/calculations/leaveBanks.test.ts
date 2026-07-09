import { describe, expect, it } from "vitest";
import { leaveBankRemaining } from "@/lib/calculations/leaveBanks";

describe("leaveBankRemaining", () => {
  it("subtracts leave logged on/after the bank's effective date", () => {
    const bankEntries = [
      { leaveType: "paternity" as const, totalHours: 64, effectiveDate: "2026-01-01" },
    ];
    const leaveEntries = [
      { date: "2026-02-01", hours: 16 },
      { date: "2026-03-01", hours: 7.2 },
    ];

    expect(leaveBankRemaining(bankEntries, leaveEntries)).toBeCloseTo(40.8);
  });

  it("ignores leave logged before the latest bank entry's effective date", () => {
    const bankEntries = [
      { leaveType: "vacation" as const, totalHours: 40, effectiveDate: "2026-01-01" },
      { leaveType: "vacation" as const, totalHours: 80, effectiveDate: "2026-06-01" },
    ];
    const leaveEntries = [
      { date: "2026-03-01", hours: 40 }, // before the reset — should not count
      { date: "2026-06-15", hours: 10 },
    ];

    expect(leaveBankRemaining(bankEntries, leaveEntries)).toBe(70);
  });

  it("returns 0 when there is no bank entry yet", () => {
    expect(leaveBankRemaining([], [{ date: "2026-01-01", hours: 5 }])).toBe(0);
  });

  it("can go negative to signal an overdraw for the UI to flag", () => {
    const bankEntries = [
      { leaveType: "sick" as const, totalHours: 10, effectiveDate: "2026-01-01" },
    ];
    const leaveEntries = [{ date: "2026-02-01", hours: 12 }];

    expect(leaveBankRemaining(bankEntries, leaveEntries)).toBe(-2);
  });
});
