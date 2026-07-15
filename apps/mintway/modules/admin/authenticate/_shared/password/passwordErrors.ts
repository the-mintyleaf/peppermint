import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";

/** Where a resolved password API error should surface. */
export interface PasswordFieldError {
  /** Field to attach the error to, or `null` for a top-level (notification) error. */
  field: "current_password" | "new_password" | "new_password_confirm" | null;
  message: string;
  /** True when the challenge is invalid/expired — the caller should restart from login. */
  challengeInvalid: boolean;
}

/**
 * Map a grandway password-endpoint error to a form field + message. Policy/history
 * failures land on the new-password field; a wrong current password on that field; a
 * confirm mismatch on the confirm field; everything else is a top-level error.
 */
export function resolvePasswordError(error: unknown): PasswordFieldError {
  const apiError = getApiError(error);
  const message = getApiErrorMessage(error);

  switch (apiError.code) {
    case "AUTH_PASSWORD_CURRENT_INCORRECT":
      return { field: "current_password", message, challengeInvalid: false };
    case "AUTH_PASSWORD_POLICY_VIOLATION": {
      // The backend lists concrete reasons under details.password.
      const reasons = apiError.details?.password;
      const detail = Array.isArray(reasons) ? reasons.join(" ") : message;
      return {
        field: "new_password",
        message: detail,
        challengeInvalid: false,
      };
    }
    case "AUTH_PASSWORD_HISTORY_REUSED":
      return { field: "new_password", message, challengeInvalid: false };
    case "VALIDATION_ERROR":
      return {
        field: "new_password_confirm",
        message,
        challengeInvalid: false,
      };
    case "AUTH_CHALLENGE_INVALID":
      return { field: null, message, challengeInvalid: true };
    default:
      return { field: null, message, challengeInvalid: false };
  }
}
