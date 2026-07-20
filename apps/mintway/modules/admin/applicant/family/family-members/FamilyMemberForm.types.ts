import type { ModalFormComponentProps } from "@peppermint/admin";
import type { FamilyMember } from "../../_shared";

/** Family member form state — strings + the sponsor flag; the api payload drops empties. */
export interface FamilyMemberFormValues extends Record<string, unknown> {
  name: string;
  relationship: string;
  date_of_birth: string;
  /** Integer as a string; parsed on submit (`Nullable=Yes` — clears with `null`). */
  age_snapshot: string;
  occupation: string;
  contact: string;
  address: string;
  is_financial_sponsor: boolean;
  notes: string;
}

/** Cleaned create/update payload the form emits (empties dropped; date omitted if unset). */
export interface FamilyMemberPayload extends Record<string, unknown> {
  name: string;
  is_financial_sponsor: boolean;
}

export type FamilyMemberFormProps = ModalFormComponentProps<
  FamilyMember,
  FamilyMemberPayload
>;
