export interface PositionPickerOption {
  id: string;
  title: string;
  code: string;
  unitName?: string;
  unitId?: string;
}

export interface PositionPickerProps {
  value: string | null;
  onChange: (positionId: string | null, option?: PositionPickerOption) => void;
  fetchOptions: (search: string) => Promise<PositionPickerOption[]>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}
