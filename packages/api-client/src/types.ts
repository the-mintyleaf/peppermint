/**
 * Why a refresh was definitively refused, handed to `onAuthFailure`. Every field is
 * `null` when the information is unavailable (e.g. no refresh request was sent).
 */
export interface AuthFailureInfo {
  /** HTTP status of the refresh response, or `null` when no request was made. */
  status: number | null;
  /** `error.code` from the refresh response envelope (e.g. `"AUTH_REFRESH_INVALID"`). */
  code: string | null;
  /**
   * `error.details.reason` from the refresh response (e.g. `"replaced_same_device"`),
   * or `"missing"` when there was no client-side refresh token to send.
   */
  reason: string | null;
}

/**
 * How the refresh credential travels.
 * - `"body"` (default): POST `{ refresh: <localStorage refresh token> }`; fails with
 *   reason `"missing"` when none is stored. Rotated tokens are persisted.
 * - `"cookie"`: POST no body with `credentials: "include"` (HttpOnly cookie) plus a
 *   double-submit CSRF header; nothing is read from or written to localStorage.
 * - `"auto"`: always `credentials: "include"`, and ALSO sends a stored body refresh
 *   token when one exists; a rotated body token is persisted, an absent one keeps the
 *   newest held. Serves a backend that uses a cookie in production and the body in
 *   development, with no config change between them. No CSRF header.
 */
export type RefreshMode = "body" | "cookie" | "auto";

/**
 * Configuration for `configureApiClient`. Every field is optional; Peppermint
 * defaults are applied. Token keys are parameterized so an app can consolidate onto
 * a single key set without touching this package.
 */
export interface ApiClientConfig {
  /** Base URL for all requests (e.g. `process.env.NEXT_PUBLIC_API_URL`). */
  baseURL?: string;
  /** `localStorage` key holding the access token. Defaults to `"access_token"`. */
  accessTokenKey?: string;
  /** `localStorage` key holding the refresh token. Defaults to `"refresh_token"`. */
  refreshTokenKey?: string;
  /**
   * `localStorage` key holding the access token's expiry (ISO 8601). Written from
   * each refresh response; the app writes it at login. Drives proactive refresh.
   * Defaults to `"access_expires_at"`.
   */
  accessExpiresAtKey?: string;
  /**
   * Endpoint POSTed to refresh the access token. Absolute URLs are used as-is; a
   * leading-slash path is resolved against `baseURL`. Defaults to
   * `"/api/v1/auth/refresh/"`.
   */
  refreshEndpoint?: string;
  /**
   * Called once when a refresh is definitively refused (a 4xx other than 429, or no
   * refresh token in body mode). Receives why. Not called for a rate limit, a 5xx,
   * or a network error — the session may still be intact. Defaults to clearing the
   * stored tokens and redirecting to `"/"`.
   */
  onAuthFailure?: (info: AuthFailureInfo) => void;
  /** Extra default headers merged onto every request. */
  headers?: Record<string, string>;
  /** Refresh credential transport — see {@link RefreshMode}. Defaults to `"body"`. */
  refreshMode?: RefreshMode;
  /**
   * Send credentials (cookies) with instance requests and the refresh call. Implied
   * `true` when `refreshMode` is `"cookie"` or `"auto"` — the login response must be
   * credentialed for the browser to store a refresh cookie at all.
   */
  withCredentials?: boolean;
  /**
   * Name of the JS-readable CSRF cookie echoed in the refresh request's CSRF header
   * (`"cookie"` mode only). Defaults to `"csrftoken"`.
   */
  csrfCookieName?: string;
  /** Header the CSRF cookie value is sent under. Defaults to `"X-CSRFToken"`. */
  csrfHeaderName?: string;
  /**
   * Field on the (unwrapped) refresh response holding the new access token.
   * Defaults to `"access"`; backends that return `access_token` set that here.
   */
  accessResponseField?: string;
  /**
   * Field on the (unwrapped) refresh response holding the access token's expiry.
   * Defaults to `"access_expires_at"`.
   */
  expiresAtResponseField?: string;
  /**
   * Refresh ahead of the stored access expiry instead of waiting for a 401.
   * Inactive until an expiry is stored. Defaults to `true`.
   */
  proactiveRefresh?: boolean;
  /** How long before the access expiry the proactive refresh fires. Defaults to 60 000 ms. */
  refreshLeadTimeMs?: number;
  /**
   * Request URL fragments whose 401 is never treated as an expired access token
   * (e.g. `"/api/v1/auth/login/"`), even when a stale Bearer token rode along.
   * Requests that carried no Bearer token never trigger a refresh regardless.
   */
  skipRefreshPaths?: string[];
  /**
   * How many times a rate-limited (429) refresh is retried, with exponential
   * backoff, before giving up without signing out. Defaults to 3.
   */
  maxRateLimitRetries?: number;
}
