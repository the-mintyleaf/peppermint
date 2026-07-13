// Single source of truth for auth-token storage on the client.
//
// These keys MUST match the defaults `@peppermint/api-client`'s configureApiClient
// reads (`access_token` / `refresh_token`). Interim hardening: tokens live only in
// localStorage under this one key set — no parallel sessionStorage copies, and no
// client-decoded JWT claims are persisted or trusted for authorization (the app
// derives identity from the `/me` endpoint via React Query).

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
