import { configureApiClient } from "@peppermint/api-client";

import {
  ACCESS_EXPIRES_AT_KEY,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  clearAuthTokens,
} from "./authTokens";
import { signInUrlFor } from "./signOutReason";

/**
 * Grandway's production API. `NEXT_PUBLIC_API_URL` still wins when it is set (a local
 * backend during development), but the default is the real deployment — env files are
 * git-ignored, so a server that never got one still talks to production instead of
 * building with an empty `baseURL` and failing every request against its own origin.
 */
const PRODUCTION_API_URL = "https://api.grandwayeducation.com";

/**
 * The app's shared Axios instance. Auth-header injection, `{ success, data, meta }`
 * envelope unwrapping, and refresh all live in `@peppermint/api-client`. Session
 * contract: `docs/backend/authenticate/INTEGRATION.md` §3, §4 (Session tokens), §8.
 *
 * **Refresh transport — `refreshMode: "auto"`.** The backend sends the refresh
 * credential as the HttpOnly cookie `grandway_refresh` (path `/api/v1/auth/`) in
 * production and as `data.refresh` in the body in development. `"auto"` serves both
 * with no code change:
 * - every request through this instance is credentialed — the *login* response has
 *   to be, or the browser silently drops the `Set-Cookie` (the old instance wasn't,
 *   which is why production could never refresh at all);
 * - the refresh POST is credentialed and also carries `{ refresh }` when a body
 *   token is stored. Harmless: with the cookie enabled the backend reads only the
 *   cookie, otherwise only the body (`authenticate/views.py` `_resolve_refresh_token`);
 * - a grace-window answer (a concurrent refresh) carries no new refresh — the newest
 *   held one is kept.
 * Credentialed requests need an exact-origin CORS answer with
 * `Access-Control-Allow-Credentials: true`. Production now gives one (verified
 * against `https://admin.grandwayeducation.com`), and the dev settings list explicit
 * localhost origins with credentials on — the wildcard-CORS blocker that kept cookie
 * mode off before is gone.
 *
 * Any 401 on an authenticated request is refresh-then-retry-once (an expired access
 * token is `AUTHENTICATION_FAILED`), and the client refreshes 60 s before
 * `access_expires_at`. Login is excluded: its 401s are answers (bad password, MFA).
 * When a refresh is refused the user lands on sign-in with `?signed_out=<reason>`.
 *
 * Always import the instance from here, never from `@peppermint/api-client` directly.
 */
const api = configureApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || PRODUCTION_API_URL,
  refreshEndpoint: "/api/v1/auth/refresh/",
  refreshMode: "auto",
  accessTokenKey: ACCESS_TOKEN_KEY,
  refreshTokenKey: REFRESH_TOKEN_KEY,
  accessExpiresAtKey: ACCESS_EXPIRES_AT_KEY,
  refreshLeadTimeMs: 60_000,
  skipRefreshPaths: ["/api/v1/auth/login/"],
  onAuthFailure: (info) => {
    clearAuthTokens();
    if (typeof window !== "undefined") {
      window.location.href = signInUrlFor(info);
    }
  },
});

export default api;
