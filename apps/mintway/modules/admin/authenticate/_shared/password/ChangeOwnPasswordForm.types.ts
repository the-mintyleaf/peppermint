import type { MantineSize } from "@peppermint/ui";

export interface ChangeOwnPasswordFormValues extends Record<string, unknown> {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface ChangeOwnPasswordFormProps {
  /** Called after the password is changed (before the sign-out redirect, if any). */
  onSuccess?: () => void;
  /** Input size passed to the fields. Defaults to `"sm"`. */
  size?: MantineSize;
}
