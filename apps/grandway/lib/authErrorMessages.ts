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

  // Leads
  LEADS_ACTOR_FORBIDDEN: "Your authority level may not perform this action.",
  LEADS_LEAD_NOT_FOUND: "Lead not found.",
  LEADS_CONTACT_REQUIRED: "At least one contact number is required.",
  LEADS_STAGE_INVALID_TRANSITION:
    "This stage cannot be selected directly; use the mark-lost or convert action.",
  LEADS_STAGE_NOT_EDITABLE:
    "This lead is lost or converted; reopen it before making this change.",
  LEADS_LOSS_REASON_REQUIRED: "A loss reason is required to close a lead.",
  LEADS_LOSS_DETAIL_REQUIRED: "This loss reason requires an explanation.",
  LEADS_SOURCE_NOT_FOUND: "Lead source not found.",
  LEADS_SOURCE_INACTIVE: "That lead source is no longer available.",
  LEADS_SOURCE_DETAIL_REQUIRED:
    "This lead source requires a short description.",
  LEADS_SOURCE_CODE_TAKEN: "That source code is already in use.",
  LEADS_LOSS_REASON_NOT_FOUND: "Loss reason not found.",
  LEADS_LOSS_REASON_INACTIVE: "That loss reason is no longer available.",
  LEADS_LOSS_REASON_CODE_TAKEN: "That loss reason code is already in use.",
  LEADS_LEAD_NOT_LOST: "Only a lost or converted lead can be reopened.",
  LEADS_LEAD_ALREADY_CONVERTED:
    "This lead has already been converted into an applicant.",
  LEADS_CONVERSION_NOT_READY:
    "A lost or converted lead must be reopened before it can be converted.",

  // Applicants
  APPLICANTS_ACTOR_FORBIDDEN:
    "Your authority level may not perform this action.",
  APPLICANTS_APPLICANT_NOT_FOUND: "Applicant not found.",
  APPLICANTS_CONTACT_REQUIRED: "At least one contact number is required.",
  APPLICANTS_PASSPORT_EXPIRY_INVALID:
    "Expiry date must be after the issue date.",

  // Applicant journeys
  JOURNEYS_ACTOR_FORBIDDEN: "Your authority level may not perform this action.",
  JOURNEYS_JOURNEY_NOT_FOUND: "Journey not found.",
  JOURNEYS_APPLICANT_NOT_FOUND: "That applicant couldn't be found.",
  JOURNEYS_STAGE_NOT_EDITABLE:
    "This journey is completed, closed, or deferred; reopen it before making this change.",
  JOURNEYS_STAGE_INVALID_TRANSITION:
    "This stage cannot be selected directly; use the defer, close, or reopen action.",
  JOURNEYS_DEFER_INTAKE_REQUIRED:
    "An intake is required to defer this journey.",
  JOURNEYS_OUTCOME_REQUIRED: "An outcome is required to close this journey.",
  JOURNEYS_OUTCOME_DETAIL_REQUIRED: "Please explain this outcome.",
  JOURNEYS_JOURNEY_NOT_TERMINAL:
    "Only a completed, closed, or deferred journey can be reopened.",

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
