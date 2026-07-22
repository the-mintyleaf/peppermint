import type { SensitivityLevel, WorkPriority } from "@/lib/work";

export interface CreateCaseModalProps {
  opened: boolean;
  onClose: () => void;
}

/** Where the new case's ownership goes at create time. */
export type InitialOwnerMode = "self" | "actor" | "unit";

/**
 * Visibility modes a caller may set at create time — the backend gates the rest
 * (`WORK_VISIBILITY_MODE_UNSUPPORTED`), so the form only ever offers these two.
 */
export type CreatableVisibilityMode = "organizational" | "participants_only";

// FormWrapper requires the value type to satisfy Record<string, unknown> — the
// framework's form-state contract, not a domain entity. Dates are Mantine 9
// "YYYY-MM-DD" strings.
export interface CreateCaseFormValues extends Record<string, unknown> {
  // Essentials
  title_np: string;
  title_en: string;
  objective: string;
  description: string;
  organization: string;
  responsible_unit: string;
  priority: WorkPriority;
  due_at: string | null;
  review_required: boolean;
  // Advanced — assignment routing + classification
  owner_mode: InitialOwnerMode;
  proposed_owner: string | null;
  target_unit: string | null;
  visibility_mode: CreatableVisibilityMode;
  sensitivity_level: SensitivityLevel;
}
