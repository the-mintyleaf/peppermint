import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Interaction } from "../../_shared";

/** Interaction form state — strings + the confidential flag; the api payload drops empties. */
export interface InteractionFormValues extends Record<string, unknown> {
  /** Case id owned by the same applicant (`Nullable=Yes` — clears with `null`). */
  application_case: string;
  interaction_type: string;
  direction: string;
  occurred_at: string;
  summary: string;
  outcome: string;
  next_follow_up_at: string;
  follow_up_priority: string;
  is_confidential: boolean;
}

/** Cleaned create/update payload the form emits (empties dropped; required fields kept). */
export interface InteractionPayload extends Record<string, unknown> {
  interaction_type: string;
  occurred_at: string;
  is_confidential: boolean;
}

export type InteractionFormProps = ModalFormComponentProps<
  Interaction,
  InteractionPayload
>;
