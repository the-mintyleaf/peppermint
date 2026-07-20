import { configureApiClient } from "@peppermint/api-client";

/**
 * The app's shared Axios instance. Auth-header injection, `{ success, data, meta }`
 * envelope unwrapping, and single-flight 401 refresh all live in
 * `@peppermint/api-client` — this file only supplies app-specific config.
 *
 * mintplayground has no backend: `baseURL` is left unset so every request is
 * relative and resolves against the app's own origin, where the mock route
 * handlers under `app/api/v1/` serve it. Nothing else about the client changes,
 * so the refresh and unwrap paths are the real ones.
 *
 * Always import the instance from here, never from `@peppermint/api-client` directly.
 */
const api = configureApiClient({
  refreshEndpoint: "/api/v1/auth/refresh/",
});

export default api;
