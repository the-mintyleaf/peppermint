import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Lead } from "./leads.types";

/**
 * Lead form state — all strings plus the tri-state visa flag, so `FormWrapper`
 * controls them uniformly. The api layer drops empties on create and sends them
 * explicitly on edit so a cleared field actually clears.
 *
 * `education_qualification` / `work_experience` are deliberately absent: the
 * contract gives their entries no field shape (gaps.md #10), so there is nothing
 * to build a control against. Existing values are shown read-only on the record.
 */
export interface LeadFormValues extends Record<string, unknown> {
  first_name: string;
  middle_name: string;
  last_name: string;
  full_name: string;
  name_native: string;
  email: string;
  contact_number: string;
  lead_source: string;
  lead_source_detail: string;
  date_of_birth: string;
  address: string;
  passport_number: string;
  guardian_name: string;
  guardian_contact: string;
  education_level: string;
  payment_status: string;
  /** `""` = unknown (sent as `null`), `"yes"` / `"no"` = the booleans. */
  has_applied_visa_before: string;
  notes: string;
}

export type LeadFormPayload = Record<string, unknown>;

export type LeadFormProps = ModalFormComponentProps<Lead, LeadFormPayload>;
