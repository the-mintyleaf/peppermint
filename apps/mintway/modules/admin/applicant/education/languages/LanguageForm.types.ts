import type { ModalFormComponentProps } from "@peppermint/admin";
import type { LanguageEntry } from "../../_shared";

/** Language form state — language + proficiency strings + native flag. */
export interface LanguageFormValues extends Record<string, unknown> {
  language: string;
  proficiency: string;
  is_native: boolean;
}

/** Cleaned create/update payload; language + is_native always sent, empties dropped. */
export interface LanguagePayload extends Record<string, unknown> {
  language: string;
  is_native: boolean;
}

export type LanguageFormProps = ModalFormComponentProps<
  LanguageEntry,
  LanguagePayload
>;
