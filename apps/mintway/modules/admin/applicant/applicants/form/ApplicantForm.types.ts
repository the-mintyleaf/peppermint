import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Applicant } from "../../_shared";

/**
 * Applicant create/edit form values. All strings (empty = unset) so `FormWrapper`
 * controls them uniformly; the api layer drops empties and enforces the staff/admin
 * field whitelist. Admin-only fields are present in the shape but only rendered +
 * submitted for admin/superadmin actors.
 */
export interface ApplicantFormValues extends Record<string, unknown> {
  first_name: string;
  middle_name: string;
  last_name: string;
  preferred_display_name: string;
  name_native: string;
  nationality: string;
  primary_email: string;
  alternate_email: string;
  primary_phone: string;
  alternate_phone: string;
  lead_source: string;
  lead_source_detail: string;
  initial_interest: string;
  // ── admin-only ──
  date_of_birth: string;
  gender: string;
  religion: string;
  summary: string;
  eligibility_summary: string;
  counselling_notes: string;
  next_follow_up_at: string;
  follow_up_priority: string;
}

export type ApplicantCreateFormProps = ModalFormComponentProps<
  Applicant,
  ApplicantFormValues
>;

export type ApplicantEditFormProps = ModalFormComponentProps<
  Applicant,
  ApplicantFormValues
>;
