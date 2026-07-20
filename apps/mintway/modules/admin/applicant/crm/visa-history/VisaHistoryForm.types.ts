import type { ModalFormComponentProps } from "@peppermint/admin";
import type { VisaHistory } from "../../_shared";

/** Visa-history form state — all strings; the api payload drops empties. */
export interface VisaHistoryFormValues extends Record<string, unknown> {
  country: string;
  visa_type: string;
  application_date: string;
  decision_date: string;
  decision: string;
  reference_number: string;
  refusal_reason: string;
  notes: string;
  /** `Media` id owned by the same applicant (`Nullable=Yes` — clears with `null`). */
  evidence_media: string;
}

/** Cleaned create/update payload the form emits (empties dropped; country kept). */
export interface VisaHistoryPayload extends Record<string, unknown> {
  country: string;
}

export type VisaHistoryFormProps = ModalFormComponentProps<
  VisaHistory,
  VisaHistoryPayload
>;
