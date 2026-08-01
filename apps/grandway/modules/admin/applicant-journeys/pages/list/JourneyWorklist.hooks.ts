"use client";

import { useMemo } from "react";
import type { DataTableShellTab } from "@peppermint/admin";
// Concrete-file import, not the `institutions` barrel — cycle-safe.
import { useCountries } from "@/modules/admin/institutions/institutions.hooks";
import type { ApplicantJourney } from "../../applicantJourneys.types";

/**
 * `DataTableShellTab.forceFilter` is generic over the row type, so the journey shape is
 * narrowed here rather than at the signature.
 */
const withoutCountry = <T>(rows: T[]): T[] =>
  rows.filter((row) => {
    const { target_country } = row as Partial<ApplicantJourney>;
    return !String(target_country ?? "").trim();
  });

/**
 * Country tabs for the journeys worklist: **All**, then one tab per usable country in
 * reference order, then **Unassigned**.
 *
 * Each country tab is a server tab — it sends `target_country` to `GET /journeys/`
 * (INTEGRATION.md §3), so paging and counts stay honest. That filter is a *partial*
 * match, so a country whose name contains another's (e.g. "Ireland" inside "Northern
 * Ireland") shows the broader set; the rows are still real journeys, so nothing is
 * hidden — and `JourneyForm` now writes canonical names, which keeps the overlap rare.
 *
 * **Unassigned has no server equivalent** — the endpoint offers no "empty country"
 * filter — so it is a client-side pass over the fetched page. Its row count is
 * therefore per-page rather than a true total; the alternative was paging the whole
 * table client-side, which this worklist deliberately does not do.
 *
 * Retired countries get no tab: they can't be chosen for a new journey, and any older
 * journey pointing at one is still reachable from All (and the column filter).
 */
export function useCountryTabs(): DataTableShellTab[] {
  const { data: countries = [] } = useCountries();

  return useMemo(
    () => [
      { label: "All" },
      ...countries
        .filter((country) => country.is_usable)
        .sort((a, b) => a.display_order - b.display_order)
        .map((country) => ({
          label: country.name,
          filter: { target_country: country.name },
        })),
      { label: "Unassigned", forceFilter: withoutCountry },
    ],
    [countries],
  );
}
