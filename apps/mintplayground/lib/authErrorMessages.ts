import type { AxiosError } from "axios";

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * User-facing copy for the auth error codes the mock auth API can surface. Account
 * administration is out of scope for the playground, so the organization / permissions
 * codes are intentionally omitted here — this client app only hits the auth
 * endpoints (login, refresh, logout, me, change-password).
 */
export const ERROR_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: "Invalid username or password.",
  AUTH_DEVICE_LIMIT_REACHED:
    "You've reached the maximum number of active sessions. Sign out of another device, or ask an administrator to revoke a session for you.",
  AUTH_REFRESH_REQUIRED: "Your session has expired. Please sign in again.",
  AUTH_TOKEN_INVALID: "Your session has expired. Please sign in again.",
  AUTH_PASSWORD_INVALID: "The current password you entered is incorrect.",
  AUTH_PASSWORD_REUSE_BLOCKED:
    "That password has been used recently. Choose a different password.",
  AUTH_MFA_INVALID_CODE: "That code isn't valid. Please try again.",
  AUTH_MFA_CHALLENGE_EXPIRED:
    "Your verification session expired. Restart sign-in to get a new code.",
  AUTH_MFA_NOT_ENROLLED: "You need to set up MFA before doing this.",
  VALIDATION_ERROR: "Please check the highlighted fields and try again.",
  AUTHENTICATION_REQUIRED: "Please sign in to continue.",
  PERMISSION_DENIED: "You don't have permission to do that.",
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
