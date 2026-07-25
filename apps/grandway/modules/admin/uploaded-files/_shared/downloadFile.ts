import { downloadFileBlob } from "../uploadedFiles.api";

/**
 * The ONLY way anything in this module retrieves file bytes to the user's
 * disk. `GET /files/<id>/download/` requires the bearer token and returns raw
 * bytes as an attachment — there is no address to point a plain `<a href>`
 * at (§3/§9), so this fetches the blob through the authed Axios instance,
 * builds a temporary object URL, and revokes it immediately after the click.
 */
export async function downloadFile(
  id: string,
  filename: string,
): Promise<void> {
  const blob = await downloadFileBlob(id);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
