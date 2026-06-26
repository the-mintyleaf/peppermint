export interface UserPickerOption {
  id: string;
  fullName: string;
  email: string;
  employeeCode?: string;
}

export interface UserPickerProps {
  value: string | null;
  onChange: (userId: string | null, option?: UserPickerOption) => void;
  fetchOptions: (search: string) => Promise<UserPickerOption[]>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}
