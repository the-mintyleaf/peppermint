import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Skill } from "../../_shared";

/** Skill form state — all strings (sort_order kept as string); payload drops empties. */
export interface SkillFormValues extends Record<string, unknown> {
  name: string;
  proficiency: string;
  notes: string;
  sort_order: string;
}

/** Cleaned create/update payload; name always sent, empties dropped. */
export interface SkillPayload extends Record<string, unknown> {
  name: string;
}

export type SkillFormProps = ModalFormComponentProps<Skill, SkillPayload>;
