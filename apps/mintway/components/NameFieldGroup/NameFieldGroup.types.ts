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
  /** Show the group asterisk and mark the first-name segment required. */
  required?: boolean;
  /**
   * Whether the last-name segment is required. Defaults to `required`, so a
   * caller that only needs the common "first + last required" shape passes
   * `required` alone; forms where the surname is optional pass `false`.
   */
  lastNameRequired?: boolean;
  disabled?: boolean;
  firstName: NameInputBinding;
  middleName: NameInputBinding;
  lastName: NameInputBinding;
}
