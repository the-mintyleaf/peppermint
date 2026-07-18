export interface ActivityModalProps {
  workId: string;
  opened: boolean;
  onClose: () => void;
}

// Form-value type satisfies the FormWrapper Record<string, unknown> contract.
export interface ActivityFormValues extends Record<string, unknown> {
  activity_type: string;
  description: string;
  occurred_at: string | null;
  visibility_classification: string;
}
