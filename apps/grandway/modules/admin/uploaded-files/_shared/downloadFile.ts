import { notifications } from "@peppermint/ui";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { downloadFileBlob } from "../uploadedFiles.api";

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
  } catch (error) {
    notifications.show({
      color: "red",
      title: "Couldn't download file",
      message: getApiErrorMessage(error),
    });
  }
}
