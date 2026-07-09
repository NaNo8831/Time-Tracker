export type LeaveType = "vacation" | "sick" | "paternity";

export const LEAVE_TYPES: LeaveType[] = ["vacation", "sick", "paternity"];

// ISO date string, e.g. "2026-07-09". Used (not a Date object) everywhere in
// the calculation engine so effective-dated lookups are plain string
// comparisons with no timezone ambiguity.
export type IsoDate = string;
