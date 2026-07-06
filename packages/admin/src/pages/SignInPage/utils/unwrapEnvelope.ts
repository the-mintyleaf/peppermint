/**
 * Unwraps the standard `{ success, data }` API envelope to reach the payload.
 *
 * Enveloped responses (e.g. `{ success: true, data: { access, refresh } }`)
 * return the inner `data` object; flat responses are returned unchanged so
 * APIs that don't envelope still work.
 */
export function unwrapEnvelope(body: unknown): any {
  if (
    body &&
    typeof body === "object" &&
    (body as { success?: unknown }).success === true &&
    "data" in (body as object) &&
    (body as { data?: unknown }).data &&
    typeof (body as { data?: unknown }).data === "object"
  ) {
    return (body as { data: unknown }).data;
  }
  return body;
}
