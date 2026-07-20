import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Consent } from "../../_shared";

/** Consent form state — all strings; the api payload drops empties. */
export interface ConsentFormValues extends Record<string, unknown> {
  consent_type: string;
  status: string;
  consent_text_version: string;
  captured_at: string;
  expires_at: string;
  notes: string;
  /** `Media` id owned by the same applicant (`Nullable=Yes` — clears with `null`). */
  evidence_media: string;
}

/** Cleaned create/update payload the form emits (empties dropped; required fields kept). */
export interface ConsentPayload extends Record<string, unknown> {
  consent_type: string;
  status: string;
}

export type ConsentFormProps = ModalFormComponentProps<Consent, ConsentPayload>;
