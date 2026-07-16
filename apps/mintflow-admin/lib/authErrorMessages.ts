import type { AxiosError } from "axios";

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export const ERROR_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: "Invalid username or password.",
  AUTH_DEVICE_LIMIT_REACHED:
    "You've reached the maximum number of active sessions. Sign out of another device, or ask an administrator to revoke a session for you.",
  AUTH_REFRESH_REQUIRED: "Your session has expired. Please sign in again.",
  AUTH_TOKEN_INVALID: "Your session has expired. Please sign in again.",
  AUTH_PASSWORD_INVALID: "The current password you entered is incorrect.",
  AUTH_PASSWORD_REUSE_BLOCKED:
    "That password has been used recently. Choose a different password.",
  AUTH_CANNOT_DISABLE_SELF: "You can't take this action on your own account.",
  AUTH_MFA_INVALID_CODE: "That code isn't valid. Please try again.",
  AUTH_MFA_CHALLENGE_EXPIRED:
    "Your verification session expired. Restart sign-in to get a new code.",
  AUTH_MFA_NOT_ENROLLED: "You need to set up MFA before doing this.",
  AUTH_MFA_DISABLE_BLOCKED_BY_POLICY:
    "MFA is required by policy on this account. Contact an administrator to reset it.",
  AUTH_SERVICE_ACCOUNT_ACTOR_TYPE_INVALID:
    "Service account credentials can only be created for non-human actors.",
  AUTH_USERNAME_ALREADY_EXISTS: "That username is already taken.",
  AUTH_EMAIL_ALREADY_EXISTS: "That email is already in use.",
  PERMISSIONS_ROLE_KEY_EXISTS: "That role key is already in use.",
  PERMISSIONS_ROLE_NOT_FOUND:
    "That role couldn't be found. Refreshing the list may help.",
  PERMISSIONS_PERMISSION_KEY_UNKNOWN:
    "That permission key isn't recognized by the policy engine.",
  PERMISSIONS_PERMISSION_KEY_INACTIVE:
    "That permission key is deprecated and can't be attached.",
  PERMISSIONS_ROLE_PERMISSION_EXISTS:
    "That permission is already attached to this role.",
  PERMISSIONS_ROLE_NOT_ASSIGNABLE: "That role isn't assignable right now.",
  PERMISSIONS_SCOPE_INVALID:
    "The scope fields don't match the selected scope type.",
  PERMISSIONS_ROLE_BINDING_DUPLICATE:
    "An active binding for this user, role, and scope already exists.",
  PERMISSIONS_GRANT_NOT_FOUND:
    "That grant couldn't be found. Refreshing the list may help.",
  PERMISSIONS_DENY_NOT_FOUND:
    "That denial couldn't be found. Refreshing the list may help.",
  PERMISSIONS_ROLE_BINDING_NOT_FOUND:
    "That binding couldn't be found. Refreshing the list may help.",
  PERMISSIONS_ROLE_PERMISSION_NOT_FOUND:
    "That permission isn't currently attached.",
  VALIDATION_ERROR: "Please check the highlighted fields and try again.",
  AUTHENTICATION_REQUIRED: "Please sign in to continue.",
  PERMISSION_DENIED: "You don't have permission to do that.",
  NOT_FOUND: "That record couldn't be found.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",

  // Organization app
  ORGANIZATION_CODE_EXISTS: "That organization code is already in use.",
  ORGANIZATION_NOT_FOUND:
    "That organization couldn't be found. Returning to the organization list may help.",
  ORGANIZATION_UNIT_CODE_EXISTS:
    "That unit code is already in use within this organization.",
  ORGANIZATION_UNIT_NOT_FOUND:
    "That unit couldn't be found. Refreshing the tree may help.",
  ORGANIZATION_CROSS_ORGANIZATION_REFERENCE:
    "That selection belongs to a different organization.",
  ORGANIZATION_UNIT_CYCLE_DETECTED:
    "A unit can't be moved under itself or one of its own descendants.",
  ORGANIZATION_UNIT_HAS_ACTIVE_CHILDREN:
    "This unit still has active child units. Deactivate or move them first.",
  ORGANIZATION_MEMBERSHIP_EXISTS:
    "This user already has an active membership in this organization.",
  ORGANIZATION_MEMBERSHIP_NOT_FOUND:
    "That membership couldn't be found. Refreshing the list may help.",
  ORGANIZATION_POSITION_CODE_EXISTS:
    "That position code is already in use within this organization.",
  ORGANIZATION_POSITION_NOT_FOUND:
    "That position couldn't be found. Refreshing the list may help.",
  ORGANIZATION_POSITION_INACTIVE:
    "That position is inactive and can't accept a new assignment.",
  ORGANIZATION_POSITION_CAPACITY_EXCEEDED:
    "That position has no available capacity for another occupant.",
  ORGANIZATION_ASSIGNMENT_NOT_FOUND:
    "That assignment couldn't be found. Refreshing the list may help.",
  ORGANIZATION_REPORTING_LINE_CYCLE_DETECTED:
    "That reporting line would create a cycle in the chain of command.",
  ORGANIZATION_REPORTING_LINE_NOT_FOUND:
    "That reporting line couldn't be found. Refreshing the list may help.",
  ORGANIZATION_DELEGATION_INVALID:
    "That delegation isn't valid — check for self-delegation or an end date before the start date.",
  ORGANIZATION_DELEGATION_NOT_FOUND:
    "That delegation couldn't be found. Refreshing the list may help.",
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
