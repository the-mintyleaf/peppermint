/**
 * Double-submit CSRF helper for grandway's cookie-authenticated endpoints
 * (`logout/`, `logout-all/`). The backend sets a JS-readable `mintway_csrf` cookie on
 * login; these endpoints require the same value echoed in an `X-CSRFToken` header.
 *
 * The value is read raw (not URL-decoded) so it matches the cookie the backend compares.
 * `/api/v1/auth/token/refresh/` handles its own CSRF header inside `@peppermint/api-client`.
 */
export const CSRF_COOKIE_NAME = "mintway_csrf";
export const CSRF_HEADER_NAME = "X-CSRFToken";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(
      `(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`,
    ),
  );
  return match ? match[1] : null;
}

/** Returns `{ "X-CSRFToken": <value> }` when the CSRF cookie is present, else `{}`. */
export function readCsrfHeader(): Record<string, string> {
  const value = readCookie(CSRF_COOKIE_NAME);
  return value ? { [CSRF_HEADER_NAME]: value } : {};
}
