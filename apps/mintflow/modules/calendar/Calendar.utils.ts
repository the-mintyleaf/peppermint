/**
 * Calendar date helpers. The app has no backend and uses fixed mid-2026
 * reference dates (the dashboard hardcodes "Wednesday, 16 July"), so the
 * calendar highlights and seeds off REFERENCE_TODAY rather than the real clock —
 * otherwise the mock tasks (dated Jun–Aug 2026) would never line up with "today".
 *
 * All day bucketing goes through `dayKey`, which reads local Y/M/D — never
 * `new Date("YYYY-MM-DD")`, which parses as UTC midnight and drifts a day in
 * negative-offset zones.
 */

/** Fixed "today" for the mock calendar — Thursday, 16 July 2026. */
export const REFERENCE_TODAY = new Date(2026, 6, 16);

/** Monday-first weekday labels, matching the reference layout. */
export const WEEKDAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export interface MonthCell {
  date: Date;
  inMonth: boolean;
}

/** Stable `YYYY-MM-DD` key from a Date's local components. */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isReferenceToday(date: Date): boolean {
  return dayKey(date) === dayKey(REFERENCE_TODAY);
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Days since Monday (0 = Mon … 6 = Sun) for a Monday-first grid. */
function mondayOffset(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Add whole days to a date without mutating the input. */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Add whole months, clamping to the 1st to avoid day-overflow surprises. */
export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/**
 * 6×7 = 42 cells covering the anchor's month, Monday-first, padded with the
 * trailing/leading days of the adjacent months (`inMonth: false`).
 */
export function buildMonthMatrix(anchor: Date): MonthCell[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = addDays(first, -mondayOffset(first));
  return Array.from({ length: 42 }, (_, i) => {
    const date = addDays(start, i);
    return { date, inMonth: isSameMonth(date, anchor) };
  });
}

/** The 7 days (Mon–Sun) of the week containing the anchor. */
export function buildWeekDays(anchor: Date): Date[] {
  const start = addDays(anchor, -mondayOffset(anchor));
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatMonthTitle(anchor: Date): string {
  return anchor.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

/** e.g. "13 – 19 Jul 2026", collapsing shared month/year where possible. */
export function formatWeekRange(anchor: Date): string {
  const days = buildWeekDays(anchor);
  const start = days[0];
  const end = days[6];
  const sameMonth = isSameMonth(start, end);
  const startLabel = start.toLocaleDateString("en-GB", {
    day: "numeric",
    ...(sameMonth ? {} : { month: "short" }),
  });
  const endLabel = end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

/** Short weekday + day number for week-view column headers, e.g. "Mon 13". */
export function formatWeekdayHead(date: Date): {
  weekday: string;
  day: number;
} {
  return {
    weekday: date.toLocaleDateString("en-GB", { weekday: "short" }),
    day: date.getDate(),
  };
}
