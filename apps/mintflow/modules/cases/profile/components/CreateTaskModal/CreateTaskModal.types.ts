export interface CreateTaskModalProps {
  workId: string;
  /** Defaults the task's responsible_unit to the case's unit. */
  responsibleUnit: string;
  opened: boolean;
  onClose: () => void;
}

// FormWrapper requires the value type to satisfy Record<string, unknown> — the
// framework's form-state contract, not a domain entity. Dates are Mantine 9
// "YYYY-MM-DD" strings.
export interface CreateTaskFormValues extends Record<string, unknown> {
  title_np: string;
  title_en: string;
  description: string;
  due_at: string | null;
  review_required: boolean;
  is_mandatory: boolean;
}
