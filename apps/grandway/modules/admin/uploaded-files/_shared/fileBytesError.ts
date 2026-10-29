import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";

const BYTES_MISSING_CODE = "UPLOADED_FILES_FILE_BYTES_MISSING";

/**
 * `UPLOADED_FILES_FILE_BYTES_MISSING` (404): the record exists, its bytes do
 * not. A platform fault — no retry will fix it (§8), so callers hide Retry.
 */
export function isFileBytesMissing(error: unknown): boolean {
  return getApiError(error).code === BYTES_MISSING_CODE;
}

/** User-facing copy for a failed byte fetch (download or in-app view). */
export function getFileBytesErrorMessage(error: unknown): string {
  if (isFileBytesMissing(error)) {
    return "This file could not be retrieved — its stored copy is missing. Please report it to an administrator.";
  }
  return getApiErrorMessage(error);
}
