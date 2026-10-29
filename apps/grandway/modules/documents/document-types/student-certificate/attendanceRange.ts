import type { CertificateAttendanceRow } from "./CertificateForm.types";

/**
 * **Pure.** The attendance table as a month range: a start month and a number
 * of months generate the rows; the rows give the range back. No React, no form
 * — only `import type` — so it runs under `node --experimental-strip-types`.
 */

/** The template prints a twelve-month table, and the backend takes at most 12 rows. */
export const MAX_ATTENDANCE_MONTHS = 12;

const MONTH_ABBR = [
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

/** The range the table spans. `start` is `YYYY-MM-01`, as the month picker yields. */
export interface AttendanceMonthRange {
  start: string;
  count: number;
}

/** A proposed table, and the rows holding typed data that it would remove. */
export interface AttendanceRangePlan {
  rows: CertificateAttendanceRow[];
  dropped: CertificateAttendanceRow[];
}

/** `"2024-08-01"` / `"2024-08"` → `"2024-08"`; `""` when there is no month. */
export function yearMonthOf(value: string | null | undefined): string {
  const match = value?.match(/^(\d{4})-(\d{2})/);
  if (!match) return "";
  const month = Number(match[2]);
  return month >= 1 && month <= 12 ? `${match[1]}-${match[2]}` : "";
}

/** Months since year 0 — consecutive months differ by exactly 1. */
function monthIndex(yearMonth: string): number {
  const [year, month] = yearMonth.split("-").map(Number);
  return year * 12 + (month - 1);
}

function fromMonthIndex(index: number): string {
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
}

/**
 * `count` consecutive `YYYY-MM` months from `start`, across year ends
 * (Nov 2024 × 3 → 2024-11, 2024-12, 2025-01). Capped at 12; `[]` when there is
 * no start or no count.
 */
export function consecutiveMonths(
  start: string | null | undefined,
  count: number,
): string[] {
  const first = yearMonthOf(start);
  const length = Math.min(
    Math.max(Math.floor(count), 0),
    MAX_ATTENDANCE_MONTHS,
  );
  if (!first || length === 0) return [];
  const base = monthIndex(first);
  return Array.from({ length }, (_, k) => fromMonthIndex(base + k));
}

/**
 * The range the rows form, or `null` when they are not one — no rows, a row
 * with no month (an unreadable legacy month), or months that are out of order,
 * repeated or have gaps (older certificates). A `null` table is shown as saved.
 */
export function readMonthRange(
  rows: CertificateAttendanceRow[],
): AttendanceMonthRange | null {
  if (rows.length === 0 || rows.length > MAX_ATTENDANCE_MONTHS) return null;
  const months = rows.map((row) => yearMonthOf(row.month));
  if (months.some((month) => !month)) return null;
  const base = monthIndex(months[0]);
  const unbroken = months.every((month, k) => monthIndex(month) === base + k);
  return unbroken ? { start: `${months[0]}-01`, count: rows.length } : null;
}

/** Whether a row holds anything typed — removing it would lose work. */
export function rowHasData(row: CertificateAttendanceRow): boolean {
  return row.total_days !== "" || row.present !== "";
}

/**
 * The table for a new range. A month already listed keeps its days held and
 * hours attended (the first row wins if an older certificate repeats a month);
 * a new month starts empty. `dropped` lists the rows outside the range that
 * hold data — the caller confirms before they go. Rows with no month never
 * match a range, so they are among them when they hold data.
 */
export function planMonthRange(
  rows: CertificateAttendanceRow[],
  start: string | null,
  count: number,
): AttendanceRangePlan {
  const byMonth = new Map<string, CertificateAttendanceRow>();
  for (const row of rows) {
    const month = yearMonthOf(row.month);
    if (month && !byMonth.has(month)) byMonth.set(month, row);
  }
  const kept = new Set<CertificateAttendanceRow>();
  const next = consecutiveMonths(start, count).map(
    (month): CertificateAttendanceRow => {
      const existing = byMonth.get(month);
      if (existing) kept.add(existing);
      return {
        month: `${month}-01`,
        total_days: existing ? existing.total_days : "",
        present: existing ? existing.present : "",
      };
    },
  );
  return {
    rows: next,
    dropped: rows.filter((row) => !kept.has(row) && rowHasData(row)),
  };
}

/** `"2024-08-01"` → `"Aug 2024"`; `""` when there is no month. */
export function formatMonth(value: string | null | undefined): string {
  const month = yearMonthOf(value);
  if (!month) return "";
  const [year, index] = month.split("-");
  return `${MONTH_ABBR[Number(index) - 1]} ${year}`;
}

/** How a row is named to the operator — its month, else what was stored. */
export function describeRowMonth(row: CertificateAttendanceRow): string {
  const month = formatMonth(row.month);
  if (month) return month;
  return row.source_month
    ? `the row saved as “${row.source_month}”`
    : "a row with no month";
}
