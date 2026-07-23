const DEVICE_ID_KEY = "grandway_device_id";

/**
 * A stable per-browser device identifier, required on every `login` call
 * (`authenticate/docs/INTEGRATION.md` §3 — device binding). Generated once and
 * persisted; the backend enforces at most 3 concurrent devices per account, keyed on
 * this value.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const generated = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}
