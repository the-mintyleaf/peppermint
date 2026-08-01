import type {
  ApplicantDestination,
  ApplicantStatus,
  CreationSource,
} from "./applicants.types";

/** All statuses in display order — freely interchangeable, no terminal state. */
export const APPLICANT_STATUSES: ApplicantStatus[] = [
  "active",
  "dormant",
  "archived",
];

export const STATUS_LABELS: Record<ApplicantStatus, string> = {
  active: "Active",
  dormant: "Dormant",
  archived: "Archived",
};

/** Server-set and immutable — a fact about the record's provenance. */
export const CREATION_SOURCE_LABELS: Record<CreationSource, string> = {
  lead_conversion: "Converted lead",
  direct_admin: "Added directly",
};

export const STATUS_COLORS: Record<ApplicantStatus, string> = {
  active: "green",
  dormant: "yellow",
  archived: "gray",
};

/**
 * The one place an applicant's name is turned into display text. `full_name` is
 * non-blank at the model level, but rows migrated from the old bilingual
 * columns can carry an empty string — and an empty name silently becomes an
 * empty aria-label or an empty modal title, which reads as a broken control
 * rather than as missing data.
 */
export function applicantDisplayName(applicant: { full_name: string }): string {
  return applicant.full_name.trim() || "Unnamed applicant";
}

/**
 * The destination names to print for a row, de-duplicated in arrival order —
 * two journeys to the same country are one destination to a reader, even though
 * the projection returns both.
 *
 * A journey with no catalogue link has an empty `country_name` and only its
 * free text, so that text is the label there; a journey with neither is dropped
 * rather than rendered as a blank chip.
 */
export function applicantDestinationNames(
  destinations: ApplicantDestination[],
): string[] {
  const names = destinations
    .map(
      (destination) => destination.country_name || destination.target_country,
    )
    .map((name) => name.trim())
    .filter(Boolean);
  return Array.from(new Set(names));
}
