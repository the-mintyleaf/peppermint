export interface PasswordStrengthMeterProps {
  /** The current new-password value to score. Empty renders the zeroed meter. */
  password: string;
  /** The hard length rule, so the checklist matches what submit will enforce. */
  minLength: number;
}

export interface PasswordRequirementItemProps {
  met: boolean;
  label: string;
}
