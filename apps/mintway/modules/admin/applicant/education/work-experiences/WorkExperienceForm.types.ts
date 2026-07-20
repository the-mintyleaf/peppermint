import type { ModalFormComponentProps } from "@peppermint/admin";
import type { WorkExperience } from "../../_shared";

/** Work-experience form state — all strings plus the current-role flag. */
export interface WorkExperienceFormValues extends Record<string, unknown> {
  company: string;
  role: string;
  country: string;
  start_period: string;
  end_period: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
}

export type WorkExperiencePayload = Record<string, unknown>;

export type WorkExperienceFormProps = ModalFormComponentProps<
  WorkExperience,
  WorkExperiencePayload
>;
