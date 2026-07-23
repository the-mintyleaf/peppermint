import { configureApiClient } from "@peppermint/api-client";

/**
 * The app's shared Axios instance. Auth-header injection, `{ success, data, meta }`
 * envelope unwrapping, and single-flight 401 refresh all live in
 * `@peppermint/api-client`.
 *
 * Grandway's login returns `data.access` (+ `data.refresh` in development only — in
 * production the refresh credential is an HttpOnly cookie, not built out yet here; see
 * `authenticate/docs/INTEGRATION.md` §3). Every option below is the package default —
 * `refreshEndpoint` already defaults to `/api/v1/auth/refresh/` and
 * `accessResponseField` already defaults to `"access"`, both matching this backend's
 * contract exactly, so no overrides are needed.
 *
 * Always import the instance from here, never from `@peppermint/api-client` directly.
 */
const api = configureApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export default api;
