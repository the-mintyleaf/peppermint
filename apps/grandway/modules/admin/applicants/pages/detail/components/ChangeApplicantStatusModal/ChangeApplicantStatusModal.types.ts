import type { Applicant } from "../../../../applicants.types";

export interface ChangeApplicantStatusModalProps {
  applicant: Applicant;
  opened: boolean;
  onClose: () => void;
}
