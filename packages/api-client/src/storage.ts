/** Client-only `localStorage` helpers — every one is a no-op / `null` on the server. */

export function readStorage(key: string): string | null {
  return typeof window !== "undefined"
    ? window.localStorage.getItem(key)
    : null;
}

export function writeStorage(key: string, value: string): void {
  if (typeof window !== "undefined") window.localStorage.setItem(key, value);
}

export function removeStorage(key: string): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(key);
}

/**
 * Read a browser cookie's **raw** value by name (client-only; `null` on the server).
 * The value is intentionally not URL-decoded: it is echoed verbatim into the
 * double-submit CSRF header so it matches the raw cookie the backend compares, and
 * a bare `%` in a token would otherwise make `decodeURIComponent` throw.
 */
export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(
      `(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`,
    ),
  );
  return match ? match[1] : null;
}
