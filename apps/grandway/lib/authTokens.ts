/**
 * Single source of truth for auth-token storage on the client. These keys MUST match
 * the defaults `@peppermint/api-client`'s `configureApiClient` reads (`access_token` /
 * `refresh_token`) so `lib/api.ts` needs no key overrides.
 */
export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

export function storeAuthTokens(
  accessToken: string,
  refreshToken?: string,
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasAccessToken(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(ACCESS_TOKEN_KEY));
}
