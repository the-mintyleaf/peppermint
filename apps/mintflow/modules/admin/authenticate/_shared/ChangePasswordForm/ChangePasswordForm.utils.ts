export interface PasswordRequirement {
  label: string;
  test: (value: string) => boolean;
}

/** The one length rule we enforce on submit (see ChangePasswordForm validation). */
export const PASSWORD_MIN_LENGTH = 12;

export const PASSWORD_LENGTH_REQUIREMENT: PasswordRequirement = {
  label: `At least ${PASSWORD_MIN_LENGTH} characters`,
  test: (value) => value.length >= PASSWORD_MIN_LENGTH,
};

/**
 * Character-variety checks. These are NOT enforced server-side, so they never
 * block submission — they only raise the strength score and guide the user
 * toward a stronger password.
 */
export const PASSWORD_STRENGTH_CHECKS: PasswordRequirement[] = [
  {
    label: "Includes a lowercase letter",
    test: (value) => /[a-z]/.test(value),
  },
  {
    label: "Includes an uppercase letter",
    test: (value) => /[A-Z]/.test(value),
  },
  { label: "Includes a number", test: (value) => /\d/.test(value) },
  {
    label: "Includes a symbol",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

/** Full checklist shown by the meter: the hard length rule plus the strength checks. */
export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  PASSWORD_LENGTH_REQUIREMENT,
  ...PASSWORD_STRENGTH_CHECKS,
];

/** Score below which a password can never rank above "Weak". */
const WEAK_CEILING = 40;

/** Percentage of the requirement checklist a password satisfies (0–100). */
export function getPasswordStrength(value: string): number {
  if (!value) return 0;
  const met = PASSWORD_REQUIREMENTS.filter((req) => req.test(value)).length;
  const score = Math.round((met / PASSWORD_REQUIREMENTS.length) * 100);
  // The length rule is a prerequisite: a too-short password is unusable no
  // matter how varied it is, so never advertise it above "Weak".
  return PASSWORD_LENGTH_REQUIREMENT.test(value)
    ? score
    : Math.min(score, WEAK_CEILING);
}

export interface PasswordStrengthMeta {
  label: string;
  color: string;
}

export function getPasswordStrengthMeta(
  strength: number,
): PasswordStrengthMeta {
  if (strength >= 100) return { label: "Strong", color: "teal" };
  if (strength >= 60) return { label: "Good", color: "yellow" };
  if (strength > 0) return { label: "Weak", color: "red" };
  return { label: "", color: "gray" };
}
