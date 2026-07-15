import type { ModalFormComponentProps } from "@peppermint/admin";
import type { LanguageTest } from "../../_shared";

/** Language-test form state — all strings; the api payload drops empties. */
export interface LanguageTestFormValues extends Record<string, unknown> {
  test_type: string;
  test_date: string;
  overall: string;
  listening: string;
  reading: string;
  writing: string;
  speaking_score: string;
  certificate_number: string;
  expiry_date: string;
  notes: string;
}

/** Cleaned create/update payload; test_type always sent, empties dropped. */
export interface LanguageTestPayload extends Record<string, unknown> {
  test_type: string;
}

export type LanguageTestFormProps = ModalFormComponentProps<
  LanguageTest,
  LanguageTestPayload
>;
