import api from "@/lib/api";
import type { MfaEnrollment } from "../authenticate.types";

/**
 * `POST /api/v1/auth/mfa/enroll/` — API §7. Returns the base32 `secret` +
 * `otpauth_url` ONCE; re-enrolling invalidates any prior pending enrollment.
 */
export async function enrollMfa(): Promise<MfaEnrollment> {
  const { data } = await api.post<MfaEnrollment>("/api/v1/auth/mfa/enroll/");
  return data;
}

/** `POST /api/v1/auth/mfa/verify/` — activates MFA; does not revoke the current session. */
export async function verifyMfa(code: string): Promise<void> {
  await api.post("/api/v1/auth/mfa/verify/", { code });
}

/**
 * `POST /api/v1/auth/mfa/disable/` — refused for superadmin (`AUTH_MFA_MANDATORY`).
 * Revokes all sessions on success.
 */
export async function disableMfa(
  currentPassword: string,
  code: string,
): Promise<void> {
  await api.post("/api/v1/auth/mfa/disable/", {
    current_password: currentPassword,
    code,
  });
}
