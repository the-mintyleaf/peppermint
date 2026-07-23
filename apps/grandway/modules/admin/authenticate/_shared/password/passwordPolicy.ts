import { z } from "zod";

/**
 * Grandway password policy (frontend mirror of Django's configured validators; see
 * `docs/backend/authenticate/INTEGRATION.md` §9 — min length 12, common-password check,
 * not-entirely-numeric, similarity-to-account-attributes). The backend is authoritative
 * and returns the definitive failure text in `error.details.new_password` — the checklist
 * below is supplementary guidance only for what can be verified client-side.
 */
export const PASSWORD_MIN_LENGTH = 12;

export interface PasswordRequirement {
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (v) => v.length >= PASSWORD_MIN_LENGTH,
  },
  { label: "Not made up of numbers only", test: (v) => /[^0-9]/.test(v) },
];

/** A single Zod schema for a new password, matching the policy requirements. */
export const newPasswordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Must be at least ${PASSWORD_MIN_LENGTH} characters`,
  )
  .regex(/[^0-9]/, "Can't be made up of numbers only");

/** Percentage of the requirement checklist a password satisfies (0–100). */
export function getPasswordStrength(value: string): number {
  if (!value) return 0;
  const met = PASSWORD_REQUIREMENTS.filter((req) => req.test(value)).length;
  return Math.round((met / PASSWORD_REQUIREMENTS.length) * 100);
}

export interface PasswordStrengthMeta {
  label: string;
  color: string;
}

export function getPasswordStrengthMeta(
  strength: number,
): PasswordStrengthMeta {
  if (strength >= 100) return { label: "Good", color: "teal" };
  if (strength > 0) return { label: "Weak", color: "red" };
  return { label: "", color: "gray" };
}
