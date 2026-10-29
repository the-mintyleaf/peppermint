import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";

/**
 * Clipboard error codes → copy. Kept in the module (rather than only in
 * `lib/authErrorMessages.ts`) so the messages are right whether or not the app map has
 * been extended; anything not listed falls through to the app resolver.
 */
export const CLIPBOARD_ERROR_MESSAGES: Record<string, string> = {
  AUTH_CLIPBOARD_ENTRY_NOT_FOUND:
    "That snippet is no longer on your clipboard. It may have been deleted.",
  AUTH_CLIPBOARD_LIMIT_REACHED:
    "Your clipboard is full (200 snippets). Delete some you no longer use, then try again.",
  AUTH_CLIPBOARD_CATEGORY_INVALID:
    "That category no longer exists. Pick another one.",
  AUTH_CLIPBOARD_CATEGORY_NOT_FOUND:
    "That category no longer exists. The list has been refreshed.",
  AUTH_CLIPBOARD_CATEGORY_NAME_TAKEN:
    "You already have a category with that name.",
  AUTH_CLIPBOARD_CATEGORY_LIMIT_REACHED:
    "You have 50 categories, the most allowed. Delete one you no longer use first.",
};

export function getClipboardErrorMessage(error: unknown): string {
  return (
    CLIPBOARD_ERROR_MESSAGES[getApiError(error).code] ??
    getApiErrorMessage(error)
  );
}

/** True when the failure means "you are at the wall" rather than "try again". */
export function isClipboardLimitError(error: unknown): boolean {
  const code = getApiError(error).code;
  return (
    code === "AUTH_CLIPBOARD_LIMIT_REACHED" ||
    code === "AUTH_CLIPBOARD_CATEGORY_LIMIT_REACHED"
  );
}
