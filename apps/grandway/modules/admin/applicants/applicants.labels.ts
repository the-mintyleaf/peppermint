import type {
  ApplicantDestination,
  ApplicantStatus,
  CreationSource,
  EducationCompletionStatus,
  FamilyRelationship,
  UserBrief,
} from "./applicants.types";

/** All statuses in display order. */
export const APPLICANT_STATUSES: ApplicantStatus[] = [
  "active",
  "dormant",
  "archived",
];

/**
 * The statuses `POST /status/` may move between freely. `archived` is not one
 * of them any more: archiving is the soft delete (its own confirm), and only
 * an Admin's `POST /restore/` leaves it.
 */
export const WORKING_STATUSES: ApplicantStatus[] = ["active", "dormant"];

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

/** Display order for the family relationship picker; grandparents feed WODA letters. */
export const FAMILY_RELATIONSHIP_OPTIONS: {
  value: FamilyRelationship;
  label: string;
}[] = [
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "grandfather", label: "Grandfather" },
  { value: "grandmother", label: "Grandmother" },
  { value: "spouse", label: "Spouse" },
  { value: "sibling", label: "Sibling" },
  { value: "child", label: "Child" },
  { value: "guardian", label: "Guardian" },
  { value: "other", label: "Other" },
];

/** An unknown future value renders as its raw string. */
export function familyRelationshipLabel(value: string): string {
  return (
    FAMILY_RELATIONSHIP_OPTIONS.find((option) => option.value === value)
      ?.label ?? value
  );
}

export const COMPLETION_STATUS_LABELS: Record<
  EducationCompletionStatus,
  string
> = {
  completed: "Completed",
  ongoing: "Ongoing",
};

/** `display_name`, falling back to the username — never a blank chip. */
export function userBriefLabel(user: UserBrief): string {
  return user.display_name.trim() || user.username;
}

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
