export interface SessionInterval {
  checkIn: string; // ISO datetime
  checkOut: string; // ISO datetime
}

/** Two intervals overlap (including exact duplicates) if one starts before the other ends, both ways. */
export function sessionsOverlap(a: SessionInterval, b: SessionInterval): boolean {
  const aStart = new Date(a.checkIn).getTime();
  const aEnd = new Date(a.checkOut).getTime();
  const bStart = new Date(b.checkIn).getTime();
  const bEnd = new Date(b.checkOut).getTime();

  return aStart < bEnd && bStart < aEnd;
}

/** Returns the first existing session that overlaps or duplicates the candidate, or undefined if none. */
export function findOverlappingSession(
  candidate: SessionInterval,
  existing: SessionInterval[]
): SessionInterval | undefined {
  return existing.find((session) => sessionsOverlap(candidate, session));
}
