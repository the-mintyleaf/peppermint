import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Training } from "../../_shared";

/** Training form state — all strings; the api payload drops empties. */
export interface TrainingFormValues extends Record<string, unknown> {
  course_or_training: string;
  institution: string;
  start_date: string;
  end_date: string;
  credential: string;
  notes: string;
}

/** Cleaned create/update payload; course_or_training always sent, empties dropped. */
export interface TrainingPayload extends Record<string, unknown> {
  course_or_training: string;
}

export type TrainingFormProps = ModalFormComponentProps<
  Training,
  TrainingPayload
>;
