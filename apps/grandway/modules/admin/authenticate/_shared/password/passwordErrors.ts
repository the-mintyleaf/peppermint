import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";

/** Where a resolved password API error should surface. */
export interface PasswordFieldError {
  /** Field to attach the error to, or `null` for a top-level (notification) error. */
  field: "current_password" | "new_password" | "new_password_confirm" | null;
  message: string;
}

/**
 * Map a Grandway password-endpoint error to a form field + message
 * (`authenticate/docs/INTEGRATION.md` §7 — `password/change`). Policy failures land on
 * the new-password field with the server's own detail messages; a wrong current
 * password lands on that field; everything else is a top-level error.
 */
export function resolvePasswordError(error: unknown): PasswordFieldError {
  const apiError = getApiError(error);
  const message = getApiErrorMessage(error);

  switch (apiError.code) {
    case "AUTH_PASSWORD_INCORRECT":
      return { field: "current_password", message };
    case "AUTH_PASSWORD_WEAK": {
      const reasons = apiError.details?.new_password;
      const detail = Array.isArray(reasons) ? reasons.join(" ") : message;
      return { field: "new_password", message: detail };
    }
    default:
      return { field: null, message };
  }
}
