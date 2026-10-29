import type {
  ApplicantDetail,
  ApplicantLanguageTest,
  Education,
} from "../../../../applicants.types";

export interface ApplicantEducationPanelProps {
  applicant: ApplicantDetail;
}

export interface EducationRowProps {
  education: Education;
}

export interface LanguageTestRowViewProps {
  test: ApplicantLanguageTest;
}

export interface CountBadgeProps {
  count: number;
}
