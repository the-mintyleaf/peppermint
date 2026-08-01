"use client";

import { useSearchParams } from "next/navigation";

/**
 * Reads the `?q=` deep-link search term, for list routes that a global-search
 * result can land on.
 *
 * Domains whose records have no detail route (leads, clients, catalogue) send
 * the user to the list instead, carrying the matched record's name — the list
 * seeds its own search box with it (`initialSearch`), so the record is one row
 * away rather than one retyped query away. Seed, not lock: the user can clear
 * or replace it immediately (see `DataTableWrapper`'s `initialSearch`).
 *
 * Returns `undefined` when absent or blank, which is what the shells treat as
 * "no seed" — an empty `?q=` must not read as a search for the empty string.
 */
export function useDeepLinkSearch(): string | undefined {
  const searchParams = useSearchParams();
  return searchParams.get("q")?.trim() || undefined;
}
