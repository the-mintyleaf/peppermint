export interface PasswordRequirement {
  label: string;
  test: (value: string) => boolean;
}

/**
 * Character-variety checks. These are guidance, not gates — none of them block
 * submission, they only raise the strength score and steer the user toward a
 * stronger password. The one hard rule is length, which the caller supplies
 * because it has to match the backend's.
 */
export const PASSWORD_STRENGTH_CHECKS: PasswordRequirement[] = [
  { label: "Includes a lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "Includes an uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "Includes a number", test: (v) => /\d/.test(v) },
  { label: "Includes a symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

/** The hard length rule, as a requirement the checklist can render. */
export function lengthRequirement(minLength: number): PasswordRequirement {
  return {
    label: `At least ${minLength} characters`,
    test: (value) => value.length >= minLength,
  };
}

/** Full checklist shown by the meter: the hard length rule plus the strength checks. */
export function passwordRequirements(minLength: number): PasswordRequirement[] {
  return [lengthRequirement(minLength), ...PASSWORD_STRENGTH_CHECKS];
}

/** Score below which a password can never rank above "Weak". */
const WEAK_CEILING = 40;

/** Percentage of the requirement checklist a password satisfies (0–100). */
export function getPasswordStrength(value: string, minLength: number): number {
  if (!value) return 0;
  const requirements = passwordRequirements(minLength);
  const met = requirements.filter((req) => req.test(value)).length;
  const score = Math.round((met / requirements.length) * 100);
  // The length rule is a prerequisite: a too-short password is unusable no
  // matter how varied it is, so never advertise it above "Weak".
  return value.length >= minLength ? score : Math.min(score, WEAK_CEILING);
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
