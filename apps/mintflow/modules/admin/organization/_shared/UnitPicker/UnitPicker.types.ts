export interface UnitPickerOption {
  id: string;
  name: string;
  code: string;
  parentName?: string;
  unitType?: string;
}

export interface UnitPickerProps {
  value: string | null;
  onChange: (unitId: string | null, option?: UnitPickerOption) => void;
  fetchOptions: (search: string) => Promise<UnitPickerOption[]>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}
