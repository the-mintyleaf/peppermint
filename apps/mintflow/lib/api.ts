import { configureApiClient } from "@peppermint/api-client";

/**
 * The app's shared Axios instance. Auth-header injection, `{ success, data, meta }`
 * envelope unwrapping, and single-flight 401 refresh all live in
 * `@peppermint/api-client` — this file only supplies app-specific config.
 *
 * Always import the instance from here, never from `@peppermint/api-client` directly.
 */
const api = configureApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  refreshEndpoint: "/api/v1/auth/refresh/",
});

export default api;
