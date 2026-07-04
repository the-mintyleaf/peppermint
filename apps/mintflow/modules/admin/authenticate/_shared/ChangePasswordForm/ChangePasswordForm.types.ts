export interface ChangePasswordFormValues {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordFormProps {
  onSuccess?: () => void;
}
