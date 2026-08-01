import { dayjs } from "@peppermint/ui";
import type { BsDate } from "./dashboard.types";

/** ISO datetime -> readable local string, `—` when null. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return dayjs(value).format("MMM D, YYYY h:mm A");
}

/** `YYYY-MM-DD`/ISO date + its BS sibling's `display`, `—` when null. Never recomputes BS. */
export function formatDate(
  value: string | null | undefined,
  bs?: BsDate | null,
): string {
  if (!value) return "—";
  const formatted = dayjs(value).format("MMM D, YYYY");
  return bs?.display ? `${formatted} (${bs.display})` : formatted;
}

/**
 * Data-freshness stamp for a section (`useQuery`'s `dataUpdatedAt`). There is no
 * refresh contract (INTEGRATION.md §9 "the client decides when to refetch") and
 * nothing polls, so the page must say when what you are reading was fetched
 * rather than imply it is live. `0` means nothing has landed yet.
 */
export function formatFetchedAt(updatedAt: number): string {
  if (!updatedAt) return "—";
  return dayjs(updatedAt).format("h:mm A");
}

/**
 * How long ago something last happened, for a queue row where the AGE is the
 * reason the row is in the queue — "4d ago" is the fact an operator acts on,
 * where a formatted date would have to be subtracted from today first.
 * `null` renders as an explicit "never", not an empty cell.
 */
export function formatSince(value: string | null | undefined): string {
  if (!value) return "never";
  return dayjs(value).fromNow();
}

/** `Rate.percent` renders as "—" (never "0%") when the denominator was 0. */
export function formatRatePercent(percent: number | null): string {
  return percent === null ? "—" : `${percent}%`;
}
