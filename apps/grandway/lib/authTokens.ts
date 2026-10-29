/**
 * Single source of truth for auth-token storage on the client. These keys MUST match
 * the defaults `@peppermint/api-client`'s `configureApiClient` reads (`access_token` /
 * `refresh_token` / `access_expires_at`); `lib/api.ts` passes them explicitly too.
 */
export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
/** ISO 8601 UTC expiry of the access token — drives the proactive refresh. */
export const ACCESS_EXPIRES_AT_KEY = "access_expires_at";

/**
 * Persist a fresh session from `login`. `refreshToken` is present only in the
 * backend's development mode (production uses an HttpOnly cookie); an absent one
 * keeps whatever is held. `accessExpiresAt` is `data.access_expires_at`.
 */
export function storeAuthTokens(
  accessToken: string,
  refreshToken?: string,
  accessExpiresAt?: string,
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  if (accessExpiresAt) {
    window.localStorage.setItem(ACCESS_EXPIRES_AT_KEY, accessExpiresAt);
  } else {
    window.localStorage.removeItem(ACCESS_EXPIRES_AT_KEY);
  }
}

export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(ACCESS_EXPIRES_AT_KEY);
}

export function hasAccessToken(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(ACCESS_TOKEN_KEY));
}
