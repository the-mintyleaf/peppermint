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

  // ── Applicant CRM (`applicant` app; see .todo/applications/API.md) ──
  APPLICANT_NOT_FOUND:
    "That applicant couldn't be found. It may have been archived.",
  APPLICANT_ADDRESS_NOT_FOUND: "That address couldn't be found.",
  APPLICANT_VERSION_CONFLICT:
    "This record changed since you opened it. Reload and try again.",
  APPLICANT_RECORD_LOCKED:
    "This applicant is locked and can't be edited until an admin unlocks it.",
  APPLICANT_FIELD_FORBIDDEN: "You can't change one of those fields.",
  APPLICANT_TRANSITION_INVALID:
    "That stage change isn't allowed — the funnel only moves forward.",
  APPLICANT_TRANSITION_REASON_REQUIRED:
    "A reason is required to move an applicant straight to Applicant.",
  APPLICANT_TRANSITION_ASSESSMENT_REQUIRED:
    "Moving to Potential needs a qualification assessment or an override reason.",
  APPLICANT_ENGAGEMENT_REASON_REQUIRED:
    "A reason is required for that engagement status.",
  APPLICANT_ALREADY_LOCKED: "This applicant is already locked.",
  APPLICANT_NOT_LOCKED: "This applicant isn't locked.",
  APPLICANT_LOCK_REASON_REQUIRED: "A reason is required to lock or unlock.",
  APPLICANT_ARCHIVED:
    "This applicant is archived. Reactivate it before making changes.",
  APPLICANT_CONTACT_REQUIRED: "Enter at least an email or a phone number.",
  APPLICANT_MEDIA_INVALID:
    "That file couldn't be accepted. Check the type and size.",
  APPLICANT_MEDIA_TYPE_UNSUPPORTED:
    "That file type isn't supported. Use an image or a PDF.",
  APPLICANT_MEDIA_TOO_LARGE: "That file is too large.",
  APPLICANT_MEDIA_NOT_FOUND: "That file couldn't be found.",
  APPLICANT_CHILD_NOT_FOUND: "That record couldn't be found.",
  APPLICANT_ASSESSMENT_NOT_FOUND: "That assessment couldn't be found.",
  APPLICANT_CASE_NOT_FOUND: "That case couldn't be found.",
  APPLICANT_CASE_VERSION_CONFLICT:
    "This case changed since you opened it. Reload and try again.",
  APPLICANT_CASE_TRANSITION_INVALID: "That case status change isn't allowed.",
  APPLICANT_CASE_REASON_REQUIRED: "A reason is required for that case status.",
  APPLICANT_CASE_ARCHIVED: "This case is archived.",
  APPLICANT_CASE_APPLICANT_MISMATCH:
    "That case belongs to a different applicant.",
  APPLICANT_ASSIGNMENT_NOT_FOUND: "That assignment couldn't be found.",
  APPLICANT_ASSIGNEE_INVALID: "That user can't be assigned.",
  APPLICANT_MERGE_SELF: "An applicant can't be merged into itself.",
  APPLICANT_MERGE_REASON_REQUIRED: "A reason is required to merge.",
  APPLICANT_MERGE_SURVIVING_NOT_FOUND:
    "The surviving applicant couldn't be found.",
  APPLICANT_MERGE_ALREADY_MERGED: "One of these applicants is already merged.",
  APPLICANT_IDENTITY_DATE_INVALID:
    "The issue date can't be after the expiry date.",
  APPLICANT_LANGUAGE_TEST_SCORE_INVALID:
    "A score is outside the valid range for that test.",
  APPLICANT_INTEREST_PROFILE_EXISTS:
    "This applicant already has an interest profile.",

  // Documents, revisions, print evidence, signatures.
  // NOTE: staff receive 404 (not 403) on these surfaces so they can't infer that a
  // document exists — so "not found" copy must not imply deletion.
  APPLICANT_DOCUMENT_NOT_FOUND: "That document isn't available.",
  APPLICANT_DOCUMENT_NOT_EDITABLE:
    "This document can no longer be edited. Finalised, submitted, superseded and archived documents are read-only.",
  APPLICANT_DOCUMENT_STATUS_INVALID: "That status change isn't allowed.",
  APPLICANT_DOCUMENT_TYPE_INVALID: "That document type isn't recognised.",
  APPLICANT_DOCUMENT_ARCHIVED: "This document is archived.",
  APPLICANT_DOCUMENT_VERSION_CONFLICT:
    "This document changed since you opened it. Reload to get the latest version.",
  APPLICANT_REVISION_NOT_FOUND: "That revision isn't available.",
  APPLICANT_PRINT_EVENT_NOT_FOUND: "That print record isn't available.",
  APPLICANT_SIGNATURE_NOT_FOUND: "That signature isn't available.",
  APPLICANT_SIGNATURE_INVALID: "That signature can't be used on this document.",
  // APPLICANT_DOCUMENT_CONTENT_INVALID is deliberately absent. The contract says to
  // surface the server's own message, which names the offending field; a generic
  // string here would replace it with something less useful. getApiErrorMessage
  // falls through to `error.message` for any unmapped code, which is what we want.

  // Lead intake
  APPLICANT_LEAD_NOT_FOUND: "That lead couldn't be found.",
  APPLICANT_LEAD_VERSION_CONFLICT:
    "This lead changed since you opened it. Reload and try again.",
  APPLICANT_LEAD_ALREADY_CONVERTED:
    "This lead has already been converted to an applicant.",
  APPLICANT_LEAD_CONVERT_COUNTRY_REQUIRED:
    "A target country is required to convert a lead.",

  // Framework-level
  VALIDATION_ERROR: "Please check the highlighted fields and try again.",
  AUTHENTICATION_REQUIRED: "Please sign in to continue.",
  AUTHENTICATION_FAILED: "Please sign in to continue.",
  PERMISSION_DENIED: "You don't have permission to do that.",
  RATE_LIMIT_EXCEEDED: "Too many attempts. Please wait a moment and try again.",
  NOT_FOUND: "That record couldn't be found.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
};

/**
 * A precondition the client refused to write through — e.g. a mutation blocked
 * because the record (and therefore its `record_version`) hasn't loaded yet.
 *
 * Its `message` is user-facing copy and is surfaced verbatim. Plain `Error`s stay
 * anonymised as `UNKNOWN_ERROR`, so raw technical text can never reach a user by
 * accident; opting in means choosing this class deliberately.
 */
export class ClientPreconditionError extends Error {
  readonly code = "CLIENT_PRECONDITION_FAILED";

  constructor(message: string) {
    super(message);
    this.name = "ClientPreconditionError";
  }
}

export function getApiError(error: unknown): ApiErrorShape {
  if (error instanceof ClientPreconditionError) {
    return { code: error.code, message: error.message };
  }
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
