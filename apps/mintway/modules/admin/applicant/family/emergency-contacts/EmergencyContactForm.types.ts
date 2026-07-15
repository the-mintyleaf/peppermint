import type { ModalFormComponentProps } from "@peppermint/admin";
import type { EmergencyContact } from "../../_shared";

/** Emergency contact form state — strings + the primary flag; the api payload drops empties. */
export interface EmergencyContactFormValues extends Record<string, unknown> {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  is_primary: boolean;
}

/** Cleaned create/update payload the form emits (empties dropped). */
export interface EmergencyContactPayload extends Record<string, unknown> {
  name: string;
  is_primary: boolean;
}

export type EmergencyContactFormProps = ModalFormComponentProps<
  EmergencyContact,
  EmergencyContactPayload
>;
