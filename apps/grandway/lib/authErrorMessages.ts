import type { AxiosError } from "axios";

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Grandway error codes → user-facing copy. Codes are defined in
 * `docs/backend/authenticate/INTEGRATION.md` §7 and `docs/backend/audit/INTEGRATION.md`
 * §7. Login failures are deliberately generic — never reveal which field was wrong,
 * whether the account exists, or whether it's locked (non-enumeration, by contract).
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Session / login
  AUTH_CREDENTIALS_INVALID: "Invalid username or password.",
  AUTH_MFA_REQUIRED: "Enter the code from your authenticator app.",
  AUTH_MFA_INVALID: "That code is incorrect or has expired. Try again.",
  AUTH_DEVICE_LIMIT_REACHED:
    "You're signed in on the maximum number of devices. Sign out on another device first, or sign back in on a device you already used.",
  AUTH_REFRESH_INVALID: "Your session has expired. Please sign in again.",
  AUTH_REFRESH_REUSED:
    "You were signed out for security. Please sign in again.",

  // Password
  AUTH_PASSWORD_INCORRECT: "Your current password is incorrect.",
  AUTH_PASSWORD_WEAK: "That password doesn't meet the strength requirements.",

  // MFA management
  AUTH_MFA_ALREADY_ENROLLED: "Multi-factor authentication is already enabled.",
  AUTH_MFA_NOT_ENROLLED: "Multi-factor authentication isn't enabled.",
  AUTH_MFA_MANDATORY:
    "Multi-factor authentication is required for this account and can't be disabled.",

  // Account administration
  AUTH_USER_NOT_FOUND: "That account couldn't be found.",
  AUTH_INVALID_AUTHORITY: "You can't create an account with that authority.",
  AUTH_USERNAME_TAKEN: "That username is already in use.",
  AUTH_SESSION_NOT_FOUND: "That session couldn't be found.",

  // Audit
  AUDIT_EVENT_NOT_FOUND: "That audit event couldn't be found.",

  // Framework-level
  VALIDATION_ERROR: "Please check the highlighted fields and try again.",
  AUTHENTICATION_REQUIRED: "Please sign in to continue.",
  PERMISSION_DENIED: "You don't have permission to do that.",
  RATE_LIMIT_EXCEEDED: "Too many attempts. Please wait a moment and try again.",
  NOT_FOUND: "That record couldn't be found.",
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
};

export function getApiError(error: unknown): ApiErrorShape {
  const axiosError = error as AxiosError<{ error?: ApiErrorShape }>;
  const apiError = axiosError?.response?.data?.error;
  if (apiError?.code) {
    return apiError;
  }
  return {
    code: "UNKNOWN_ERROR",
    message: "Something went wrong. Please try again.",
  };
}

export function getApiErrorMessage(error: unknown): string {
  const apiError = getApiError(error);
  return (
    ERROR_MESSAGES[apiError.code] ??
    apiError.message ??
    ERROR_MESSAGES.UNKNOWN_ERROR
  );
}
