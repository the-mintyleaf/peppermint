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

/** Parse a "YYYY-MM-DD" key to a local Date (no UTC drift). */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** e.g. "06 Aug" from a "YYYY-MM-DD" key. */
export function formatDueShort(key?: string): string | null {
  if (!key) return null;
  return parseDateKey(key).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

/** Human due offset from REFERENCE_TODAY: "Today", "Tomorrow", "In 3 days", "2 days ago". */
export function dueRelative(key?: string): string | null {
  if (!key) return null;
  const MS = 86_400_000;
  const diff = Math.round(
    (parseDateKey(key).getTime() - REFERENCE_TODAY.getTime()) / MS,
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return diff > 0 ? `In ${diff} days` : `${-diff} days ago`;
}

export function isDueToday(key?: string): boolean {
  return !!key && key === dayKey(REFERENCE_TODAY);
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

/* ── Week time-grid geometry ─────────────────────────────────────────────────
 * Tasks carry only a due *date*, not a clock time. The week grid needs a time to
 * lay cards against, so we synthesize a stable slot per task from its id (mock-data
 * convention — the app has no backend). Larger tasks (more assignees + subtasks)
 * get longer slots, so they render as taller cards.
 */

export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 19;
export const HOUR_PX = 56;
export const GRID_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60;
export const GRID_HEIGHT = GRID_MINUTES * (HOUR_PX / 60);

/** Hour marks for the left rail, e.g. [8, 9, … 19]. */
export const HOUR_MARKS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
  (_, i) => DAY_START_HOUR + i,
);

/** Minute offsets from DAY_START; both within [0, GRID_MINUTES]. */
export interface Slot {
  start: number;
  end: number;
}

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** People + subtasks — drives both slot length and card richness. */
export function taskWeight(task: {
  assignees?: unknown[];
  subtasks?: unknown[];
}): number {
  return (task.assignees?.length ?? 1) + (task.subtasks?.length ?? 0);
}

/** Deterministic time slot for a task, weighted by its people + subtasks. */
export function taskSlot(id: string, weight: number): Slot {
  const h = hashString(id);
  const startHour = DAY_START_HOUR + (h % 8); // 08:00 – 15:00
  const startMinute = (Math.floor(h / 8) % 2) * 30; // :00 or :30
  const duration = weight <= 1 ? 30 : Math.min(60 + (weight - 1) * 25, 210);
  const start = (startHour - DAY_START_HOUR) * 60 + startMinute;
  const end = Math.min(start + duration, GRID_MINUTES);
  return { start, end };
}

function clockLabel(hour24: number, minute: number): string {
  const period = hour24 >= 12 ? "PM" : "AM";
  const h12 = ((hour24 + 11) % 12) + 1;
  return `${h12}:${`${minute}`.padStart(2, "0")} ${period}`;
}

/** e.g. "9:00 – 10:30 AM"-ish, from a minute offset. */
export function formatSlotRange(slot: Slot): string {
  const startAbs = DAY_START_HOUR * 60 + slot.start;
  const endAbs = DAY_START_HOUR * 60 + slot.end;
  const start = clockLabel(Math.floor(startAbs / 60), startAbs % 60);
  const end = clockLabel(Math.floor(endAbs / 60), endAbs % 60);
  return `${start} – ${end}`;
}

export function hourMarkLabel(hour24: number): string {
  const period = hour24 >= 12 ? "PM" : "AM";
  const h12 = ((hour24 + 11) % 12) + 1;
  return `${h12} ${period}`;
}

export interface Packed<T> {
  item: T;
  start: number;
  end: number;
  /** 0-based column within its overlap cluster. */
  lane: number;
  /** total columns in the cluster (for width). */
  lanes: number;
}

/**
 * Column-pack a day's timed items so overlapping cards sit side by side. Standard
 * sweep: chain-overlapping items form a cluster; within it each item takes the
 * first free lane; the cluster's lane count sets every member's width.
 */
export function packDay<T>(
  items: { item: T; start: number; end: number }[],
): Packed<T>[] {
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end);
  const out: Packed<T>[] = [];
  let cluster: Packed<T>[] = [];
  let clusterEnd = -Infinity;

  const flush = () => {
    const laneEnds: number[] = [];
    for (const ev of cluster) {
      let lane = laneEnds.findIndex((end) => end <= ev.start);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(ev.end);
      } else {
        laneEnds[lane] = ev.end;
      }
      ev.lane = lane;
    }
    for (const ev of cluster) ev.lanes = laneEnds.length;
    out.push(...cluster);
    cluster = [];
    clusterEnd = -Infinity;
  };

  for (const it of sorted) {
    if (cluster.length && it.start >= clusterEnd) flush();
    cluster.push({ ...it, lane: 0, lanes: 1 });
    clusterEnd = Math.max(clusterEnd, it.end);
  }
  if (cluster.length) flush();
  return out;
}
