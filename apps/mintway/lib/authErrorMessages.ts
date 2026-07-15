import type { AxiosError } from "axios";

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Grandway (`authenticate` app) error codes → user-facing copy. Codes are defined in
 * the backend's `AuthErrorCode`; see `.todo/auth_doc_grandway/API.md` §Error Code Reference.
 * Login failures are deliberately generic (never reveal account state).
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Session
  AUTH_LOGIN_INVALID_CREDENTIALS: "Invalid username or password.",
  AUTH_TOKEN_INVALID: "Your session has expired. Please sign in again.",
  AUTH_CSRF_FAILED: "Your session couldn't be verified. Please sign in again.",

  // Password flows
  AUTH_CHALLENGE_INVALID:
    "This password-change link has expired. Please sign in again to restart.",
  AUTH_PASSWORD_POLICY_VIOLATION:
    "That password doesn't meet the requirements. Please choose a stronger one.",
  AUTH_PASSWORD_CURRENT_INCORRECT:
    "The current password you entered is incorrect.",
  AUTH_PASSWORD_HISTORY_REUSED:
    "That password has been used recently. Choose a different password.",
  AUTH_PASSWORD_CHANGE_REQUIRED:
    "You need to change your password before continuing.",

  // Account administration
  AUTH_USER_NOT_FOUND:
    "That account couldn't be found. Refreshing the list may help.",
  AUTH_USER_TARGET_FORBIDDEN: "You can't perform this action on this account.",
  AUTH_USER_STATE_CONFLICT:
    "This account isn't in a state that allows that action.",
  AUTH_USER_ROLE_INVALID: "That role isn't valid for this operation.",
  AUTH_USER_USERNAME_TAKEN: "That username is already in use.",
  AUTH_USER_EMPLOYEE_CODE_TAKEN: "That employee code is already in use.",

  // Framework-level
  VALIDATION_ERROR: "Please check the highlighted fields and try again.",
  AUTHENTICATION_REQUIRED: "Please sign in to continue.",
  AUTHENTICATION_FAILED: "Please sign in to continue.",
  PERMISSION_DENIED: "You don't have permission to do that.",
  RATE_LIMIT_EXCEEDED: "Too many attempts. Please wait a moment and try again.",
  NOT_FOUND: "That record couldn't be found.",
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
