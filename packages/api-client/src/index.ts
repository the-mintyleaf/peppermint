import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

import { createRefreshSession } from "./session";
import type { RefreshSession } from "./session";
import { readStorage, removeStorage } from "./storage";
import type { ApiClientConfig, AuthFailureInfo } from "./types";

export type { ApiClientConfig, AuthFailureInfo, RefreshMode } from "./types";

const DEFAULT_ACCESS_TOKEN_KEY = "access_token";
const DEFAULT_REFRESH_TOKEN_KEY = "refresh_token";
const DEFAULT_ACCESS_EXPIRES_AT_KEY = "access_expires_at";
const DEFAULT_REFRESH_ENDPOINT = "/api/v1/auth/refresh/";
const DEFAULT_CSRF_COOKIE_NAME = "csrftoken";
const DEFAULT_CSRF_HEADER_NAME = "X-CSRFToken";
const DEFAULT_REFRESH_LEAD_TIME_MS = 60_000;
const DEFAULT_MAX_RATE_LIMIT_RETRIES = 3;

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/** `{ success: true, data, meta? }` response envelope emitted by the backend. */
function isEnvelope(
  raw: unknown,
): raw is { success: true; data: unknown; meta?: unknown } {
  return (
    !!raw &&
    typeof raw === "object" &&
    "success" in raw &&
    (raw as { success: unknown }).success === true &&
    "data" in raw
  );
}

function hasNumericCount(meta: unknown): meta is { count: number } {
  return (
    !!meta &&
    typeof meta === "object" &&
    typeof (meta as { count?: unknown }).count === "number"
  );
}

function bearerOf(config: InternalAxiosRequestConfig): string | null {
  const header = config.headers?.Authorization;
  return typeof header === "string" && header.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : null;
}

function matchesAny(url: string | undefined, paths: string[]): boolean {
  return paths.some((path) => (url ?? "").includes(path));
}

function defaultAuthFailure(keys: string[]): (info: AuthFailureInfo) => void {
  return () => {
    if (typeof window === "undefined") return;
    keys.forEach(removeStorage);
    window.location.href = "/";
  };
}

/**
 * Should this failed response be answered with refresh-then-retry-once? Only a 401
 * on a request that actually carried a Bearer token. A 401 on a request that never
 * carried one (login, refresh, any public endpoint) is a business answer for the
 * caller — wrong credentials, MFA required — and refreshing there would end in a
 * doomed refresh + hard redirect that stomps on the caller's own error handling.
 */
function wantsRefresh(
  error: AxiosError,
  skipRefreshPaths: string[],
): error is AxiosError & { config: RetryableConfig } {
  const original = error.config as RetryableConfig | undefined;
  if (error.response?.status !== 401 || !original || original._retry) {
    return false;
  }
  return !!bearerOf(original) && !matchesAny(original.url, skipRefreshPaths);
}

/**
 * Origin a request resolves to (`baseURL` + `url`, relative to the page), or `null`
 * when it can't be resolved (SSR without an absolute `baseURL`).
 */
function originOf(href: string | undefined): string | null {
  try {
    const page =
      typeof window !== "undefined" ? window.location.href : undefined;
    return new URL(href ?? "", page).origin;
  } catch {
    return null;
  }
}

function installInterceptors(
  instance: AxiosInstance,
  session: RefreshSession,
  baseURL: string | undefined,
  accessTokenKey: string,
  skipRefreshPaths: string[],
) {
  instance.interceptors.request.use(async (req: RetryableConfig) => {
    // The Bearer token and credentials belong to the API only — never to an
    // absolute URL on another origin (a CDN, a signed upload URL, a third party).
    const apiOrigin = originOf(baseURL);
    if (apiOrigin === null || originOf(instance.getUri(req)) !== apiOrigin) {
      req.headers.delete("Authorization");
      req.withCredentials = false;
      return req;
    }

    session.sync();
    // The stored access token is already past its expiry (frozen timers, a woken
    // laptop) — refresh first rather than spend a guaranteed 401 round trip.
    if (!matchesAny(req.url, skipRefreshPaths) && session.isAccessExpired()) {
      const outcome = await session.refresh({ failFast: true });
      // Already signed out: don't let this request's 401 start a second refresh.
      if (outcome.kind === "rejected" || outcome.kind === "signed_out") {
        req._retry = true;
      }
    }
    const token = readStorage(accessTokenKey);
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

  instance.interceptors.response.use(
    (response) => {
      const raw: unknown = response.data;
      if (isEnvelope(raw)) {
        // Paginated list: preserve { data, meta } so consumers read items + total.
        // Otherwise unwrap to the payload directly.
        response.data = hasNumericCount(raw.meta)
          ? { data: raw.data, meta: raw.meta }
          : raw.data;
      }
      return response;
    },
    async (error: AxiosError) => {
      if (!wantsRefresh(error, skipRefreshPaths)) return Promise.reject(error);

      const original = error.config;
      original._retry = true;

      // Tokens were cleared while this request was in flight (deliberate logout,
      // or an earlier refusal already signed out): never refresh — that would
      // redirect a second time or resurrect the session.
      const current = readStorage(accessTokenKey);
      if (!current) return Promise.reject(error);

      // Another request (or another tab) already refreshed since this one was sent —
      // just retry with the current token.
      if (current !== bearerOf(original)) return instance(original);

      // Any 401 — `AUTHENTICATION_FAILED` (expired/revoked) or
      // `AUTHENTICATION_REQUIRED` — is refresh-then-retry-once. The request
      // interceptor re-injects the new token on the retry. A rate-limited refresh
      // fails this request fast; its retries continue in the background.
      const outcome = await session.refresh({ failFast: true });
      if (outcome.kind === "ok") return instance(original);

      // Superseded by another tab's refresh or a new login meanwhile — use that.
      const after = readStorage(accessTokenKey);
      if (after && after !== current) return instance(original);
      return Promise.reject(error);
    },
  );
}

/**
 * Create a configured Axios instance for a Peppermint app. Call once at app boot
 * (e.g. in `src/lib/api.ts`) and export the returned instance.
 *
 * The instance:
 * - injects `Authorization: Bearer <accessToken>` from `localStorage` on every request,
 * - unwraps the `{ success, data, meta }` envelope (paginated lists keep `{ data, meta }`,
 *   everything else unwraps to `data`),
 * - on any 401 to a Bearer-authenticated request, refreshes once (single-flight per
 *   instance) and retries the request once,
 * - refreshes proactively `refreshLeadTimeMs` before the stored access expiry,
 * - backs off on a rate-limited refresh and never signs out for it (or for a 5xx /
 *   network failure); calls `onAuthFailure(info)` only on a definitive refusal.
 *
 * Refresh transport is configurable via `refreshMode` (`"body"` | `"cookie"` |
 * `"auto"`) — see {@link ApiClientConfig}.
 */
export function configureApiClient(
  config: ApiClientConfig = {},
): AxiosInstance {
  const {
    baseURL,
    accessTokenKey = DEFAULT_ACCESS_TOKEN_KEY,
    refreshTokenKey = DEFAULT_REFRESH_TOKEN_KEY,
    accessExpiresAtKey = DEFAULT_ACCESS_EXPIRES_AT_KEY,
    refreshEndpoint = DEFAULT_REFRESH_ENDPOINT,
    headers,
    onAuthFailure,
    refreshMode = "body",
    csrfCookieName = DEFAULT_CSRF_COOKIE_NAME,
    csrfHeaderName = DEFAULT_CSRF_HEADER_NAME,
    accessResponseField = "access",
    expiresAtResponseField = "access_expires_at",
    proactiveRefresh = true,
    refreshLeadTimeMs = DEFAULT_REFRESH_LEAD_TIME_MS,
    skipRefreshPaths = [],
    maxRateLimitRetries = DEFAULT_MAX_RATE_LIMIT_RETRIES,
  } = config;

  // A refresh cookie is only stored from a credentialed login response and only
  // sent on a credentialed refresh, so cookie-capable modes imply credentials.
  const withCredentials =
    config.withCredentials ??
    (refreshMode === "cookie" || refreshMode === "auto");

  const instance = axios.create({
    baseURL,
    withCredentials,
    headers: { "Content-Type": "application/json", ...headers },
  });

  const session = createRefreshSession({
    transport: {
      url: refreshEndpoint.startsWith("http")
        ? refreshEndpoint
        : `${baseURL ?? ""}${refreshEndpoint}`,
      mode: refreshMode,
      withCredentials,
      refreshTokenKey,
      csrfCookieName,
      csrfHeaderName,
      accessResponseField,
      expiresAtResponseField,
    },
    accessTokenKey,
    refreshTokenKey,
    accessExpiresAtKey,
    proactive: proactiveRefresh,
    leadTimeMs: refreshLeadTimeMs,
    maxRateLimitRetries,
    onAuthFailure:
      onAuthFailure ??
      defaultAuthFailure([accessTokenKey, refreshTokenKey, accessExpiresAtKey]),
  });

  installInterceptors(
    instance,
    session,
    baseURL,
    accessTokenKey,
    skipRefreshPaths,
  );
  return instance;
}
