/** Pure date helpers for the case profile. Fixed reference keeps the mock's
 *  "in N days" labels stable regardless of the real clock. */

const MONTHS = [
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

/** The mock lives in mid-July 2026; anchor relative labels there. */
const REFERENCE_DATE = new Date("2026-07-16T00:00:00Z");
const DAY_MS = 86_400_000;

/** "2026-07-20" → "Jul 20". */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** A due date read relative to the reference: "due today" / "in 4 days" / "5 days overdue". */
export function dueRelative(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  const days = Math.round((d.getTime() - REFERENCE_DATE.getTime()) / DAY_MS);
  if (days === 0) return "due today";
  if (days > 0) return `in ${days} day${days === 1 ? "" : "s"}`;
  const overdue = Math.abs(days);
  return `${overdue} day${overdue === 1 ? "" : "s"} overdue`;
}
