import { configureApiClient } from "@peppermint/api-client";

/**
 * The app's shared Axios instance. Auth-header injection, `{ success, data, meta }`
 * envelope unwrapping, and single-flight 401 refresh all live in
 * `@peppermint/api-client`.
 *
 * Grandway's login returns `data.access` always; `data.refresh` only in the backend's
 * development mode — in production the refresh credential is meant to be a
 * `Secure; HttpOnly; SameSite` cookie instead (`authenticate/docs/INTEGRATION.md` §3).
 *
 * **`refreshMode: "cookie"` is NOT enabled here, even though this env's target backend
 * has no `data.refresh` in the body** (confirmed: no `refresh_token` in localStorage
 * after login) — cookie mode flips `withCredentials` on for every request through this
 * instance, and this backend's CORS policy currently returns
 * `Access-Control-Allow-Origin: *` (wildcard), which browsers categorically reject on
 * any credentialed request. Turning it on breaks *login itself* (blocked before the
 * request leaves the browser — confirmed in devtools), which is worse than the original
 * bug. **Body mode doesn't work either against this deployment** (no refresh token is
 * ever issued to store), so right now neither transport can refresh a token against
 * this specific backend instance — a session silently bounces to `/` the moment its
 * access token expires, and that requires a backend-side fix (either return
 * `data.refresh` for this environment, or fix CORS to echo the specific origin + send
 * `Access-Control-Allow-Credentials: true` so cookie mode can be turned on here).
 *
 * Always import the instance from here, never from `@peppermint/api-client` directly.
 */
const api = configureApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export default api;
