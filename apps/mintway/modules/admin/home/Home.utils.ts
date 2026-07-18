/**
 * Compact relative-time label without pulling in a dayjs plugin. Falls back to a short
 * absolute date once the gap exceeds a week, where "6d ago" stops being useful.
 */
export function formatRelative(date: string | number, now: number): string {
  const then = typeof date === "number" ? date : new Date(date).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(then).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
