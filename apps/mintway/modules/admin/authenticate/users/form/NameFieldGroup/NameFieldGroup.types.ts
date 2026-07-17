import type { ChangeEvent, FocusEvent, ReactNode } from "react";

/**
 * The subset of a `form.getInputProps(field)` result that a joined text segment
 * consumes. Structural so the app never imports `@mantine/form` directly.
 */
export interface NameInputBinding {
  value?: string;
  defaultValue?: string;
  error?: ReactNode;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}

export interface NameFieldGroupProps {
  /** Label for the joined control. Defaults to "Name". */
  label?: string;
  /** Show the required asterisk (first + last are the required segments). */
  required?: boolean;
  disabled?: boolean;
  firstName: NameInputBinding;
  middleName: NameInputBinding;
  lastName: NameInputBinding;
}
