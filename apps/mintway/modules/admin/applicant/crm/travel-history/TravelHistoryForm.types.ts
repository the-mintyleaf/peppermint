import type { ModalFormComponentProps } from "@peppermint/admin";
import type { TravelHistory } from "../../_shared";

/** Travel-history form state — all strings; the api payload drops empties. */
export interface TravelHistoryFormValues extends Record<string, unknown> {
  country: string;
  purpose: string;
  travelled_from: string;
  travelled_to: string;
  visa_type: string;
  notes: string;
}

/** Cleaned create/update payload the form emits (empties dropped; country kept). */
export interface TravelHistoryPayload extends Record<string, unknown> {
  country: string;
}

export type TravelHistoryFormProps = ModalFormComponentProps<
  TravelHistory,
  TravelHistoryPayload
>;
