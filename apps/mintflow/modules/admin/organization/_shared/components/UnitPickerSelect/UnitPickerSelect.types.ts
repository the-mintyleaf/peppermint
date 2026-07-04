export interface UnitPickerSelectProps {
  organizationId: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  /** Excludes these unit ids from the options — used by the move form so a unit can't be moved under itself or its own descendants. */
  excludeUnitIds?: string[];
  value: string | null;
  onChange: (unitId: string | null) => void;
  error?: string;
}
