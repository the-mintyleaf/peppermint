export interface PermissionKeyPickerProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value: string | null;
  onChange: (permissionKey: string | null) => void;
  error?: string;
  /** Restrict the picker to permissions belonging to this app key. */
  appFilter?: string;
}
