import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Education } from "../../_shared";

/** Education form state — all strings; the api payload drops empties. */
export interface EducationFormValues extends Record<string, unknown> {
  institution: string;
  degree: string;
  qualification: string;
  field_of_study: string;
  program: string;
  country: string;
  start_date: string;
  end_date: string;
  completion_status: string;
  gpa: string;
  grade: string;
  grading_system: string;
  registration_number: string;
  graduation_year: string;
  notes: string;
}

/** Cleaned create/update payload (empties dropped; dates omitted if unset). */
export type EducationPayload = Record<string, unknown>;

export type EducationFormProps = ModalFormComponentProps<
  Education,
  EducationPayload
>;
