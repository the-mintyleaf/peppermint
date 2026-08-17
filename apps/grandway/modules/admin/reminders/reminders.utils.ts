import type {
  BsDate,
  Reminder,
  ReminderUpdatePayload,
} from "./reminders.types";

/**
 * The one clock this module reads.
 *
 * A reminder is due at the **start of its `due_date` in Asia/Kathmandu**
 * (+05:45), not in the viewer's timezone (INTEGRATION.md §3). The backend
 * enforces its create/update date floor against Nepal's today, so a form
 * validating against `new Date()` in a browser set to, say, UTC would reject
 * dates the server accepts — and accept dates the server rejects — for the
 * ~5h45m each day where the two calendars disagree.
 *
 * `en-CA` is used purely because its date format is `YYYY-MM-DD`, which is
 * exactly the wire format; it is a formatting trick, not a locale choice, and
 * must not be swapped for the user's locale.
 */
const NEPAL_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kathmandu",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today in Nepal as `YYYY-MM-DD` — the date floor for every write in this module. */
export function nepalToday(): string {
  return NEPAL_DATE_FORMATTER.format(new Date());
}

/**
 * Where a reminder sits relative to Nepal's today.
 *
 * Not a server enum — the API has no due-bucket concept at all — so this is
 * derived per render. Closed reminders short-circuit to `closed`: a completed
 * follow-up whose date has passed is **not** overdue, and showing it as such
 * would put permanent red rows in a record's history.
 *
 * `today` is passed in rather than read here so a caller bucketing a whole list
 * uses **one** clock for the whole pass. Bucketing N rows against N calls to
 * `nepalToday()` can straddle midnight and split a page inconsistently.
 */
export type ReminderDueBucket = "overdue" | "today" | "upcoming" | "closed";

export function dueBucket(
  reminder: Reminder,
  today: string = nepalToday(),
): ReminderDueBucket {
  if (reminder.status !== "active") return "closed";
  // `YYYY-MM-DD` is lexicographically ordered, so string comparison is date
  // comparison — and avoids constructing a Date, which would re-introduce the
  // timezone problem this module exists to avoid.
  if (reminder.due_date < today) return "overdue";
  if (reminder.due_date === today) return "today";
  return "upcoming";
}

/** The rank each bucket sorts to in a worklist: most urgent first, closed last. */
const BUCKET_ORDER: Record<ReminderDueBucket, number> = {
  overdue: 0,
  today: 1,
  upcoming: 2,
  closed: 3,
};

/**
 * Reading order for a reminders panel: soonest-due first, closed rows sunk to
 * the bottom, `created_at` breaking ties.
 *
 * This is a **client-side sort of one already-fetched page** — the API has no
 * `ordering` parameter and always returns newest-created first (§3), so the
 * order the user reads is the frontend's to choose and the frontend's alone.
 * Returns a new array; never mutates the query cache's data in place.
 */
export function sortRemindersForPanel(
  reminders: Reminder[],
  today: string = nepalToday(),
): Reminder[] {
  return [...reminders].sort((a, b) => {
    const bucketDelta =
      BUCKET_ORDER[dueBucket(a, today)] - BUCKET_ORDER[dueBucket(b, today)];
    if (bucketDelta !== 0) return bucketDelta;
    const dateDelta = a.due_date.localeCompare(b.due_date);
    if (dateDelta !== 0) return dateDelta;
    return b.created_at.localeCompare(a.created_at);
  });
}

/**
 * The **only** safe way to build a `PATCH` body in this module.
 *
 * `applicant`, `client`, `status`, `closed_at` and `closed_by` are rejected
 * with 400 `REMINDERS_FIELD_IMMUTABLE` rather than ignored (§3), and an empty
 * `PATCH` is also a 400 — so a submit handler must send exactly the changed
 * subset of `{due_date, note}` and must not fire at all when nothing moved.
 *
 * Returns `null` for "nothing changed", which callers treat as a successful
 * no-op (close the modal, skip the request) rather than an error state.
 */
export function changedUpdateFields(
  reminder: Reminder,
  values: { due_date: string; note: string },
): ReminderUpdatePayload | null {
  const payload: ReminderUpdatePayload = {};
  if (values.due_date !== reminder.due_date) payload.due_date = values.due_date;
  if (values.note !== reminder.note) payload.note = values.note;
  return Object.keys(payload).length > 0 ? payload : null;
}

/**
 * The Bikram Sambat sibling as display text. Every `*_bs` field is an **object
 * or `null`, never a string** (§3) — reading `.display` is the whole contract
 * for rendering one, and no client should assemble the date from the parts.
 */
export function formatBs(bs: BsDate | null): string {
  return bs?.display ?? "";
}

/**
 * The Gregorian half of a date, for a reader who does not work in BS.
 * Intentionally **not** timezone-shifted: `due_date` is a calendar date, not an
 * instant, so it is split and re-rendered rather than passed through `Date`,
 * which would move it a day for viewers west of Kathmandu.
 */
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDueDate(dueDate: string): string {
  const [year, month, day] = dueDate.split("-");
  const monthName = MONTH_NAMES[Number(month) - 1];
  if (!monthName) return dueDate;
  return `${Number(day)} ${monthName} ${year}`;
}

/**
 * How a due date reads next to today: "in 3 days", "3 days overdue", "today".
 * Whole days only — a date-only field has no finer resolution to report, and
 * inventing one ("in 3 days, 4 hours") would be a lie about what was stored.
 */
export function formatDueDistance(
  dueDate: string,
  today: string = nepalToday(),
): string {
  const days = daysBetween(today, dueDate);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "1 day overdue";
  if (days > 0) return `in ${days} days`;
  return `${Math.abs(days)} days overdue`;
}

/**
 * Whole days from `from` to `to`, both `YYYY-MM-DD`.
 *
 * Both dates are parsed as **UTC midnight** — the same fixed offset for each —
 * so the subtraction measures calendar days and never picks up a DST or
 * local-offset shift. The values are Nepal calendar dates; UTC is only the
 * arithmetic frame, and using it for both sides is what makes that safe.
 */
function daysBetween(from: string, to: string): number {
  const MS_PER_DAY = 86_400_000;
  const fromMs = Date.parse(`${from}T00:00:00Z`);
  const toMs = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) return 0;
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}
