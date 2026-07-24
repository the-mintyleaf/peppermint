import { configureApiClient } from "@peppermint/api-client";

/**
 * The app's shared Axios instance. Auth-header injection, `{ success, data, meta }`
 * envelope unwrapping, and single-flight 401 refresh all live in
 * `@peppermint/api-client`.
 *
 * Grandway's login returns `data.access` always; `data.refresh` only in the backend's
 * development mode — in production (and against this env's target backend) the refresh
 * credential is a `Secure; HttpOnly; SameSite` cookie (`grandway_refresh`) the browser
 * sends automatically, never readable by JS (`authenticate/docs/INTEGRATION.md` §3).
 * `refreshMode: "cookie"` tells the client to refresh via that cookie (posting no body,
 * `credentials: "include"`) instead of the default `"body"` mode, which looks for a
 * `refresh_token` in `localStorage` that this backend never puts there — without this,
 * the very first 401 (access token expiry) fails to refresh and silently hard-redirects
 * to `/`, with no error shown. `refreshMode: "cookie"` also flips `withCredentials` on
 * for every request through this instance (the package's own default), which cookie-based
 * backends generally need. `accessResponseField`/`refreshEndpoint` stay at their package
 * defaults (`"access"` / `/api/v1/auth/refresh/`), already matching this contract.
 *
 * Always import the instance from here, never from `@peppermint/api-client` directly.
 */
const api = configureApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  refreshMode: "cookie",
});

export default api;
