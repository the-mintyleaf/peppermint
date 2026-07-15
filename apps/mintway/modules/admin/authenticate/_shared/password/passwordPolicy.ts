import { z } from "zod";

/**
 * Grandway password policy (frontend mirror of the backend `AUTH_PASSWORD_VALIDATORS`;
 * see `.todo/auth_doc_grandway/SECURITY.md` §2). The backend is authoritative — this is
 * supplementary client-side guidance. Rules: length 8–128, ≥1 upper, ≥1 lower, ≥1 number,
 * ≥1 symbol. (History reuse and similarity checks are enforced server-side only.)
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export interface PasswordRequirement {
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    label: `Between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`,
    test: (v) =>
      v.length >= PASSWORD_MIN_LENGTH && v.length <= PASSWORD_MAX_LENGTH,
  },
  { label: "Includes a lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "Includes an uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "Includes a number", test: (v) => /\d/.test(v) },
  { label: "Includes a symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

/** A single Zod schema for a new password, matching the policy requirements. */
export const newPasswordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Must be at least ${PASSWORD_MIN_LENGTH} characters`,
  )
  .max(PASSWORD_MAX_LENGTH, `Must be at most ${PASSWORD_MAX_LENGTH} characters`)
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/\d/, "Must include a number")
  .regex(/[^A-Za-z0-9]/, "Must include a symbol");

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
  if (strength >= 100) return { label: "Strong", color: "teal" };
  if (strength >= 60) return { label: "Good", color: "yellow" };
  if (strength > 0) return { label: "Weak", color: "red" };
  return { label: "", color: "gray" };
}
