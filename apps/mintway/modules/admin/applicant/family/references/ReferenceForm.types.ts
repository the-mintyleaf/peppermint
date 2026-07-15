import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Reference } from "../../_shared";

/** Reference form state — all strings (reference_order parsed on submit); payload drops empties. */
export interface ReferenceFormValues extends Record<string, unknown> {
  reference_order: string;
  name: string;
  title: string;
  institution: string;
  address: string;
  email: string;
  contact: string;
  relationship_to_applicant: string;
  notes: string;
}

/** Cleaned create/update payload the form emits (empties dropped; order omitted if unset). */
export interface ReferencePayload extends Record<string, unknown> {
  name: string;
}

export type ReferenceFormProps = ModalFormComponentProps<
  Reference,
  ReferencePayload
>;
