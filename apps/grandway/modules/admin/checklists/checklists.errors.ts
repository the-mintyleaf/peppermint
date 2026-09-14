import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";

/**
 * A template's `key` is derived from its label and never shown on create, so the
 * backend's duplicate-key `VALIDATION_ERROR` (§7) would otherwise surface as
 * "check the highlighted fields" against a field the user cannot see. Name the
 * field they *can* change instead. Everything else falls through to the app's
 * shared resolver.
 */
export function getTemplateErrorMessage(error: unknown): string {
  const apiError = getApiError(error);
  if (apiError.code === "VALIDATION_ERROR" && mentionsKey(apiError.details)) {
    return "A template with this name already exists. Give this one a different label.";
  }
  return getApiErrorMessage(error);
}

function mentionsKey(details: Record<string, unknown> | undefined): boolean {
  return details !== undefined && Object.keys(details).includes("key");
}
