/**
 * Pure view-model helpers for the work domain — envelope→page mapping, BS +
 * Gregorian date rendering, and bilingual title resolution. Kept free of design
 * tokens so it can be imported anywhere; each module keeps its own status→color
 * presentational map (re-keyed to the real enums).
 */

import type { BikramSambatDate, Page, Paginated } from "./types";

/** Map the unwrapped paginated envelope (`{ data, meta }`) to a UI page. */
export function toPage<T>(res: Paginated<T>): Page<T> {
  return {
    items: res.data,
    total: res.meta.count,
    page: res.meta.page,
    pageSize: res.meta.page_size,
  };
}

/**
 * Render a Gregorian ISO-8601 timestamp as `15 Aug 2026`. The value is a full
 * timezone-aware timestamp, so `new Date` is safe here (no date-only day shift).
 * Returns `""` for null so callers can fall back to a placeholder.
 */
export function formatGregorian(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Render a Bikram Sambat date; English display by default, Devanagari optional. */
export function formatBs(
  bs: BikramSambatDate | null | undefined,
  locale: "en" | "np" = "en",
): string {
  if (!bs) return "";
  return locale === "np" ? bs.display_np : bs.display_en;
}

/**
 * Combined "<Gregorian> · <BS>" label for a date field paired with its `*_bs`
 * object, e.g. `14 Apr 2025 · 2082 Baisakh 1`. Degrades gracefully when either
 * side is missing.
 */
export function formatDatePair(
  iso: string | null | undefined,
  bs: BikramSambatDate | null | undefined,
  locale: "en" | "np" = "en",
): string {
  const greg = formatGregorian(iso);
  const nepali = formatBs(bs, locale);
  if (greg && nepali) return `${greg} · ${nepali}`;
  return greg || nepali;
}

/**
 * Choose the human title for a bilingual record. Prefers the requested locale,
 * then the other language, then the romanized fallback. `title_np` is always
 * present on the backend, so this never returns empty for a real record.
 */
export function resolveTitle(
  record: { title_np: string; title_en?: string; title_romanized?: string },
  locale: "en" | "np" = "en",
): string {
  if (locale === "np") {
    return record.title_np || record.title_en || record.title_romanized || "";
  }
  return record.title_en || record.title_romanized || record.title_np || "";
}
