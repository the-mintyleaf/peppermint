import type { ModalFormComponentProps } from "@peppermint/admin";
import type { QualificationAssessment } from "../../_shared";

export interface AssessmentFormValues extends Record<string, unknown> {
  assessment_date: string;
  preferred_destination: string;
  preferred_program_or_field: string;
  education_summary: string;
  study_gap_summary: string;
  language_readiness: string;
  financial_readiness: string;
  funding_summary: string;
  visa_risk_summary: string;
  eligibility_result: string;
  conditions: string;
  recommendation: string;
  notes: string;
  valid_until: string;
}

export type AssessmentPayload = Record<string, unknown>;

export type AssessmentFormProps = ModalFormComponentProps<
  QualificationAssessment,
  AssessmentPayload
>;
