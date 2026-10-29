import { notifications } from "@peppermint/ui";
import { getFileBytesErrorMessage } from "./fileBytesError";
import { downloadFileBlob } from "../uploadedFiles.api";

/**
 * Hand an already-fetched blob to the browser as a download named
 * `filename`. Used directly by the in-app viewer's Download button, which
 * already holds the bytes — re-fetching would write a second audit event.
 */
export function saveBlobAs(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Deferred rather than immediate: revoking synchronously right after
  // `.click()` has been observed to cancel the download in some browsers
  // before they've finished reading the blob.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * The ONLY way anything in this module retrieves file bytes to the user's
 * disk. `GET /files/<id>/download/` requires the bearer token and returns raw
 * bytes as an attachment — there is no address to point a plain `<a href>`
 * at (§3/§9), so this fetches the blob through the authed Axios instance,
 * builds a temporary object URL, and revokes it after the click.
 *
 * Every call site fires this without awaiting (a menu action, not a
 * submission), so failures are reported here rather than at each caller —
 * `UPLOADED_FILES_FILE_BYTES_MISSING` (a platform fault, §8) or a plain 403
 * would otherwise reject silently with no user-facing feedback at all.
 */
export async function downloadFile(
  id: string,
  filename: string,
): Promise<void> {
  try {
    const blob = await downloadFileBlob(id);
    saveBlobAs(blob, filename);
  } catch (error) {
    notifications.show({
      color: "red",
      title: "Couldn't download file",
      message: getFileBytesErrorMessage(error),
    });
  }
}
