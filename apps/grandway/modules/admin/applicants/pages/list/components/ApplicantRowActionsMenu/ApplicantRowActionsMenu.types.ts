import type { Applicant } from "../../../../applicants.types";

export interface ApplicantRowActionsMenuProps {
  applicant: Applicant;
  onViewDetails: (applicant: Applicant) => void;
}
