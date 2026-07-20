import type { Applicant, ApplicantSectionId } from "../../../_shared";

export interface SectionContentProps {
  sectionId: ApplicantSectionId;
  applicant: Applicant;
  isAdmin: boolean;
}
