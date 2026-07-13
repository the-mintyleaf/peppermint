import type { FilterState, SortState } from "./DataTableWrapper.types";

/**
 * Reads a dot-notation path from a plain object.
 * Returns undefined when any segment is missing or not an object.
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  if (!path) return obj;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (
      acc !== null &&
      typeof acc === "object" &&
      key in (acc as Record<string, unknown>)
    ) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Case-insensitive substring match across all string and number leaf values in each row.
 */
export function clientSearch<T>(rows: T[], search: string): T[] {
  if (!search.trim()) return rows;
  const lower = search.toLowerCase();
  return rows.filter((row) =>
    Object.values(row as Record<string, unknown>).some((v) => {
      if (typeof v === "string") return v.toLowerCase().includes(lower);
      if (typeof v === "number") return String(v).includes(lower);
      return false;
    }),
  );
}

/** Loose equality used by client-side filtering. */
function matchesFilterValue(rowVal: unknown, filterVal: unknown): boolean {
  if (rowVal === filterVal) return true;
  if (rowVal == null) return false;
  const r = String(rowVal);
  const f = String(filterVal);
  if (r === f) return true;
  // Date filters store `YYYY-MM-DD`; the row may hold a longer ISO timestamp.
  if (/^\d{4}-\d{2}-\d{2}$/.test(f) && r.startsWith(f)) return true;
  return false;
}

/**
 * Applies the store's active filters to rows in client mode. Each filter key is a
 * dot-path into the row; a row passes when every active filter matches (scalar
 * equality, or membership when the filter value is an array). Empty/null/undefined
 * filter values are ignored. Without this, tab filters and the Filter menu are
 * cosmetic in client mode.
 */
export function clientFilter<T>(rows: T[], filters: FilterState): T[] {
  const active = Object.entries(filters).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (!active.length) return rows;
  return rows.filter((row) =>
    active.every(([key, filterVal]) => {
      const rowVal = getNestedValue(row, key);
      return Array.isArray(filterVal)
        ? filterVal.some((fv) => matchesFilterValue(rowVal, fv))
        : matchesFilterValue(rowVal, filterVal);
    }),
  );
}

function compareValues(av: unknown, bv: unknown, dir: 1 | -1): number {
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  if (typeof av === "string" && typeof bv === "string")
    return av.localeCompare(bv) * dir;
  if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
  return String(av).localeCompare(String(bv)) * dir;
}

/**
 * Returns a sorted copy of rows supporting multi-column sort.
 * Sorts are applied in order — index 0 is primary, index 1 is secondary tiebreaker, etc.
 * Null/undefined values sort last within each level.
 */
export function clientSort<T>(rows: T[], sort: SortState[]): T[] {
  if (!sort.length) return rows;
  return [...rows].sort((a, b) => {
    for (const { field, direction } of sort) {
      const dir = direction === "asc" ? 1 : -1;
      const av = (a as Record<string, unknown>)[field];
      const bv = (b as Record<string, unknown>)[field];
      const result = compareValues(av, bv, dir);
      if (result !== 0) return result;
    }
    return 0;
  });
}

/**
 * Returns the slice of rows for the given page.
 */
export function clientPaginate<T>(
  rows: T[],
  page: number,
  pageSize: number,
): T[] {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

// ---------------------------------------------------------------------------
// Row selection helpers

/**
 * Returns a new Set with all provided ids added.
 */
export function selectAll(
  current: Set<string | number>,
  ids: Array<string | number>,
): Set<string | number> {
  const next = new Set(current);
  for (const id of ids) next.add(id);
  return next;
}

/**
 * Returns an empty Set.
 */
export function clearAll(): Set<string | number> {
  return new Set();
}

/**
 * Toggles a single row id in the selection.
 */
export function toggleRow(
  current: Set<string | number>,
  id: string | number,
): Set<string | number> {
  const next = new Set(current);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

/**
 * Returns true when every id in `ids` is present in the selection.
 */
export function isAllSelected(
  current: Set<string | number>,
  ids: Array<string | number>,
): boolean {
  return ids.length > 0 && ids.every((id) => current.has(id));
}
