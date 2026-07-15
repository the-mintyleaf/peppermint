import { configureApiClient } from "@peppermint/api-client";

/**
 * The app's shared Axios instance. Auth-header injection, `{ success, data, meta }`
 * envelope unwrapping, and single-flight 401 refresh all live in
 * `@peppermint/api-client`.
 *
 * Grandway auth is cookie-based: the refresh token rides in an HttpOnly
 * `mintway_refresh` cookie and is rotated at `/api/v1/auth/token/refresh/` with a
 * double-submit CSRF header echoed from the JS-readable `mintway_csrf` cookie; the
 * login response returns `access_token` (never a refresh token in the body).
 *
 * Always import the instance from here, never from `@peppermint/api-client` directly.
 */
const api = configureApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  refreshEndpoint: "/api/v1/auth/token/refresh/",
  refreshMode: "cookie",
  withCredentials: true,
  csrfCookieName: "mintway_csrf",
  accessResponseField: "access_token",
});

export default api;
