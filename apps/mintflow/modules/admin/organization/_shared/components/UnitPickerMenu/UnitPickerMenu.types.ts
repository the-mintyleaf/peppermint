export interface UnitOption {
  value: string;
  label: string;
  depth: number;
}

export interface UnitPickerMenuProps {
  options: UnitOption[];
  value: string | null;
  onChange: (unitId: string) => void;
  loading?: boolean;
  disabled?: boolean;
}
