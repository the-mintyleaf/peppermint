import type { ApplicantStatus } from "./applicants.types";

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

export const STATUS_COLORS: Record<ApplicantStatus, string> = {
  active: "green",
  dormant: "yellow",
  archived: "gray",
};
