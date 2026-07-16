export interface AssignmentPickerSelectProps {
  organizationId: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  value: string | null;
  onChange: (assignmentId: string | null) => void;
  error?: string;
}
