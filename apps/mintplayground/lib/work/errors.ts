/**
 * Work-domain error handling — the frozen error-code → user-message + UI-state
 * map. Follows the app's existing extraction pattern (`lib/authErrorMessages.ts`):
 * the api-client rejects with the raw error envelope, so the code lives at
 * `error.response.data.error.code`. Every code here traces to
 * docs/api-contracts/work.md "Error codes → UI state".
 */

import type { AxiosError } from "axios";

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * How the UI should react to an error, independent of the specific code. Lets a
 * component branch on intent (`not_found` → 404 view, `conflict` → refetch, …)
 * without hard-coding every code.
 */
export type WorkErrorUiState =
  | "auth" // 401 — session expired
  | "permission" // 403 — denied
  | "not_found" // 404 — unknown OR invisible (anti-enumeration; never "denied")
  | "conflict" // 409 — stale/already-resolved; refetch + retry
  | "validation" // 422 — inline field/validation error
  | "gated" // 503 — feature unavailable; disabled control + explanation
  | "unknown";

interface WorkErrorMeta {
  message: string;
  ui: WorkErrorUiState;
}

export const WORK_ERROR_MESSAGES: Record<string, WorkErrorMeta> = {
  WORK_PERMISSION_DENIED: {
    message: "You don't have permission to do that.",
    ui: "permission",
  },
  WORK_RESOURCE_NOT_VISIBLE: {
    message: "You don't have access to this work item.",
    ui: "permission",
  },
  WORK_SENSITIVITY_ACCESS_DENIED: {
    message: "This item's sensitivity level restricts access.",
    ui: "permission",
  },
  WORK_ITEM_NOT_FOUND: {
    message: "That work item couldn't be found.",
    ui: "not_found",
  },
  WORK_TASK_NOT_FOUND: {
    message: "That task couldn't be found.",
    ui: "not_found",
  },
  WORK_ASSIGNMENT_NOT_FOUND: {
    message: "That assignment couldn't be found.",
    ui: "not_found",
  },
  WORK_REVIEW_NOT_FOUND: {
    message: "That review couldn't be found.",
    ui: "not_found",
  },
  WORK_EVIDENCE_NOT_FOUND: {
    message: "That evidence couldn't be found.",
    ui: "not_found",
  },
  WORK_STAKEHOLDER_NOT_FOUND: {
    message: "That stakeholder couldn't be found.",
    ui: "not_found",
  },
  WORK_ATTACHMENT_NOT_FOUND: {
    message: "That attachment couldn't be found.",
    ui: "not_found",
  },
  WORK_VERSION_CONFLICT: {
    message:
      "This was changed elsewhere. We refreshed it — review and try again.",
    ui: "conflict",
  },
  WORK_INVALID_STATUS_TRANSITION: {
    message: "That action isn't allowed from the current status.",
    ui: "conflict",
  },
  WORK_ARCHIVED: {
    message: "This work item is archived. Restore it before making changes.",
    ui: "conflict",
  },
  WORK_IDEMPOTENCY_CONFLICT: {
    message: "This looks like a duplicate submission with different details.",
    ui: "conflict",
  },
  WORK_ASSIGNMENT_ALREADY_RESOLVED: {
    message: "This assignment has already been answered.",
    ui: "conflict",
  },
  WORK_OWNERSHIP_TRANSFER_ALREADY_RESOLVED: {
    message: "This transfer has already been decided.",
    ui: "conflict",
  },
  WORK_EVIDENCE_ALREADY_RESOLVED: {
    message: "This evidence has already been resolved.",
    ui: "conflict",
  },
  WORK_ROUTING_LOOP_DETECTED: {
    message:
      "That route would loop back. Provide an override reason to route it anyway.",
    ui: "conflict",
  },
  WORK_ROUTING_HOP_LIMIT_EXCEEDED: {
    message: "This has been routed too many times and will be escalated.",
    ui: "conflict",
  },
  WORK_TASK_CYCLE_DETECTED: {
    message: "That would create a task cycle.",
    ui: "conflict",
  },
  WORK_TASK_DEPENDENCY_CYCLE: {
    message: "That would create a circular dependency.",
    ui: "conflict",
  },
  WORK_HIERARCHY_TARGET_UNRESOLVED: {
    message: "No eligible recipient could be resolved for that target.",
    ui: "conflict",
  },
  WORK_REVIEW_REQUIRED: {
    message: "This work requires review before it can be closed.",
    ui: "conflict",
  },
  WORK_REVIEW_SNAPSHOT_STALE: {
    message: "The submission changed after review. Re-request review.",
    ui: "conflict",
  },
  WORK_SELF_REVIEW_FORBIDDEN: {
    message: "You can't review your own submission.",
    ui: "permission",
  },
  WORK_OWNER_INELIGIBLE: {
    message: "That person isn't eligible to own this work.",
    ui: "validation",
  },
  WORK_OWNER_REQUIRED: {
    message: "Active work must have an owner.",
    ui: "validation",
  },
  WORK_ASSIGNMENT_TARGET_INVALID: {
    message: "That assignment target is invalid.",
    ui: "validation",
  },
  WORK_HIERARCHY_CONTEXT_INVALID: {
    message: "The organization or unit context is invalid.",
    ui: "validation",
  },
  WORK_TASK_PARENT_INVALID: {
    message: "That parent task is outside this work item.",
    ui: "validation",
  },
  WORK_TASK_DEPTH_EXCEEDED: {
    message: "Tasks can't be nested that deeply.",
    ui: "validation",
  },
  WORK_REVIEWER_INELIGIBLE: {
    message: "The resolved reviewer isn't eligible.",
    ui: "validation",
  },
  WORK_CLOSURE_REQUIREMENTS_UNMET: {
    message: "Fill in the fields required for that closure outcome.",
    ui: "validation",
  },
  WORK_CLOSURE_OUTCOME_INVALID: {
    message: "That closure outcome isn't valid.",
    ui: "validation",
  },
  WORK_DEADLINE_EXTENSION_REASON_REQUIRED: {
    message: "A reason is required to extend the deadline.",
    ui: "validation",
  },
  WORK_EVIDENCE_INVALID: {
    message: "That evidence action isn't allowed.",
    ui: "validation",
  },
  WORK_ATTACHMENT_INVALID: {
    message: "That attachment is invalid.",
    ui: "validation",
  },
  WORK_ATTACHMENT_ALREADY_DETACHED: {
    message: "That attachment is already detached.",
    ui: "conflict",
  },
  WORK_ACTIVITY_IMMUTABLE: {
    message: "Submitted activity can't be edited — add a correction instead.",
    ui: "conflict",
  },
  WORK_VISIBILITY_MODE_UNSUPPORTED: {
    message:
      "Restricted, confidential and explicit visibility aren't available yet.",
    ui: "validation",
  },
  WORK_EXTERNAL_NOTIFICATION_NOT_APPROVED: {
    message: "This notification needs an approved template first.",
    ui: "permission",
  },
  WORK_DOCUMENT_INTEGRATION_UNAVAILABLE: {
    message: "File attachments aren't available yet.",
    ui: "gated",
  },
  WORK_FILE_INTEGRATION_UNAVAILABLE: {
    message: "File handling isn't available yet.",
    ui: "gated",
  },
};

const UNKNOWN: WorkErrorMeta = {
  message: "Something went wrong. Please try again.",
  ui: "unknown",
};

/** Pull the structured error envelope off a rejected api call. */
export function getWorkApiError(error: unknown): ApiErrorShape {
  const axiosError = error as AxiosError<{ error?: ApiErrorShape }>;
  const apiError = axiosError?.response?.data?.error;
  if (apiError?.code) return apiError;
  return { code: "UNKNOWN_ERROR", message: UNKNOWN.message };
}

/** HTTP status of a rejected api call, if any. */
export function getWorkErrorStatus(error: unknown): number | undefined {
  return (error as AxiosError | undefined)?.response?.status;
}

/** User-facing copy for an error (code map first, then server message, then fallback). */
export function getWorkErrorMessage(error: unknown): string {
  const { code, message } = getWorkApiError(error);
  return WORK_ERROR_MESSAGES[code]?.message ?? message ?? UNKNOWN.message;
}

/** How the UI should react — derived from the code, falling back to the HTTP status. */
export function getWorkErrorUiState(error: unknown): WorkErrorUiState {
  const { code } = getWorkApiError(error);
  const known = WORK_ERROR_MESSAGES[code]?.ui;
  if (known) return known;
  switch (getWorkErrorStatus(error)) {
    case 401:
      return "auth";
    case 403:
      return "permission";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 422:
      return "validation";
    case 503:
      return "gated";
    default:
      return "unknown";
  }
}

/** True when the resource is unknown or invisible (render the not-found view). */
export function isWorkNotFound(error: unknown): boolean {
  return getWorkErrorUiState(error) === "not_found";
}

/** True when a mutation lost an optimistic-concurrency race (refetch + retry). */
export function isWorkVersionConflict(error: unknown): boolean {
  return getWorkApiError(error).code === "WORK_VERSION_CONFLICT";
}

/** True when the feature is backend-gated (render disabled + explanation). */
export function isWorkGated(error: unknown): boolean {
  return getWorkErrorUiState(error) === "gated";
}
