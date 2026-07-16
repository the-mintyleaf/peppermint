export interface PositionPickerSelectProps {
  organizationId: string;
  label?: string;
  unitLabel?: string;
  required?: boolean;
  disabled?: boolean;
  value: string | null;
  onChange: (positionId: string | null) => void;
  error?: string;
}
