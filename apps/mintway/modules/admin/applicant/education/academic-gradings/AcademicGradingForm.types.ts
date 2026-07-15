import type { ModalFormComponentProps } from "@peppermint/admin";
import type { AcademicGrading } from "../../_shared";

/** Academic-grading form state — all strings (numbers kept as strings). */
export interface AcademicGradingFormValues extends Record<string, unknown> {
  context: string;
  month_or_period: string;
  grammar: string;
  conversation: string;
  composition: string;
  listening: string;
  reading: string;
  total_days: string;
  class_hours: string;
  present: string;
  absent: string;
  attendance_percentage: string;
}

/** Cleaned create/update payload (empties dropped; numeric fields coerced). */
export type AcademicGradingPayload = Record<string, unknown>;

export type AcademicGradingFormProps = ModalFormComponentProps<
  AcademicGrading,
  AcademicGradingPayload
>;
