export interface UserPickerProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value: string | null;
  onChange: (userId: string | null) => void;
  error?: string;
}
