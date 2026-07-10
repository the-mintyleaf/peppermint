export interface ChangePasswordFormValues {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordFormProps {
  onSuccess?: () => void;
  /** Mantine size for the inputs and submit button. Defaults to "sm". */
  size?: "xs" | "sm" | "md";
}
