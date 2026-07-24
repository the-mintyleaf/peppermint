import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

/**
 * Configuration for {@link configureApiClient}.
 *
 * Every field except the resulting instance is optional; sensible Peppermint
 * defaults are applied. Token keys are parameterized so an app can consolidate
 * onto a single key set without touching this package.
 */
export interface ApiClientConfig {
  /** Base URL for all requests (e.g. `process.env.NEXT_PUBLIC_API_URL`). */
  baseURL?: string;
  /** `localStorage` key holding the access token. Defaults to `"access_token"`. */
  accessTokenKey?: string;
  /** `localStorage` key holding the refresh token. Defaults to `"refresh_token"`. */
  refreshTokenKey?: string;
  /**
   * Endpoint POSTed to refresh the access token on a 401. Absolute URLs are used
   * as-is; a leading-slash path is resolved against `baseURL`.
   * Defaults to `"/api/v1/auth/refresh/"`.
   */
  refreshEndpoint?: string;
  /**
   * Called when refresh fails (no refresh token, or the refresh request itself
   * fails). Defaults to clearing tokens and redirecting to `"/"`.
   */
  onAuthFailure?: () => void;
  /** Extra default headers merged onto every request. */
  headers?: Record<string, string>;
  /**
   * How the access token is refreshed on a 401.
   * - `"body"` (default): POST `{ refresh: <localStorage refresh token> }`; the response
   *   carries new `access`/`refresh` tokens (the historical Peppermint behavior).
   * - `"cookie"`: POST with **no body** and `credentials: "include"` so an HttpOnly
   *   refresh cookie is sent; a double-submit CSRF header is added from `csrfCookieName`.
   *   No refresh token is read from or written to localStorage.
   */
  refreshMode?: "body" | "cookie";
  /**
   * Send credentials (cookies) with same-instance requests and the refresh call.
   * Implied `true` when `refreshMode` is `"cookie"`.
   */
  withCredentials?: boolean;
  /**
   * Name of the JS-readable CSRF cookie whose value is echoed in the refresh
   * request's CSRF header (cookie refresh mode). Defaults to `"csrftoken"`.
   */
  csrfCookieName?: string;
  /** Header the CSRF cookie value is sent under. Defaults to `"X-CSRFToken"`. */
  csrfHeaderName?: string;
  /**
   * Field on the (unwrapped) refresh response holding the new access token.
   * Defaults to `"access"`; backends that return `access_token` set that here.
   */
  accessResponseField?: string;
}

const DEFAULT_ACCESS_TOKEN_KEY = "access_token";
const DEFAULT_REFRESH_TOKEN_KEY = "refresh_token";
const DEFAULT_REFRESH_ENDPOINT = "/api/v1/auth/refresh/";
const DEFAULT_CSRF_COOKIE_NAME = "csrftoken";
const DEFAULT_CSRF_HEADER_NAME = "X-CSRFToken";

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

function readToken(key: string): string | null {
  return typeof window !== "undefined"
    ? window.localStorage.getItem(key)
    : null;
}

/**
 * Read a browser cookie's **raw** value by name (client-only; `null` on the server).
 * The value is intentionally not URL-decoded: it is echoed verbatim into the
 * double-submit CSRF header so it matches the raw cookie the backend compares, and
 * a bare `%` in a token would otherwise make `decodeURIComponent` throw.
 */
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(
      `(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`,
    ),
  );
  return match ? match[1] : null;
}

/**
 * Create a configured Axios instance for a Peppermint app. Call once at app boot
 * (e.g. in `src/lib/api.ts`) and export the returned instance.
 *
 * The instance:
 * - injects `Authorization: Bearer <accessToken>` from `localStorage` on every request,
 * - unwraps the `{ success, data, meta }` envelope (paginated lists keep `{ data, meta }`,
 *   everything else unwraps to `data`),
 * - transparently refreshes the access token once on a 401, serializing concurrent
 *   refreshes and guarding against retry loops, and calls `onAuthFailure` if refresh fails.
 *
 * Refresh transport is configurable via `refreshMode`: the default `"body"` posts a
 * localStorage refresh token, while `"cookie"` posts no body with `credentials: "include"`
 * (HttpOnly refresh cookie) plus a double-submit CSRF header — for backends like grandway
 * that keep the refresh token in a cookie and return `access_token`.
 */
export function configureApiClient(
  config: ApiClientConfig = {},
): AxiosInstance {
  const {
    baseURL,
    accessTokenKey = DEFAULT_ACCESS_TOKEN_KEY,
    refreshTokenKey = DEFAULT_REFRESH_TOKEN_KEY,
    refreshEndpoint = DEFAULT_REFRESH_ENDPOINT,
    headers,
    onAuthFailure,
    refreshMode = "body",
    csrfCookieName = DEFAULT_CSRF_COOKIE_NAME,
    csrfHeaderName = DEFAULT_CSRF_HEADER_NAME,
    accessResponseField = "access",
  } = config;

  // Cookie refresh needs credentials on every request so the refresh cookie is sent.
  const withCredentials = config.withCredentials ?? refreshMode === "cookie";

  const instance = axios.create({
    baseURL,
    withCredentials,
    headers: { "Content-Type": "application/json", ...headers },
  });

  const refreshUrl = refreshEndpoint.startsWith("http")
    ? refreshEndpoint
    : `${baseURL ?? ""}${refreshEndpoint}`;

  const handleAuthFailure =
    onAuthFailure ??
    (() => {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(accessTokenKey);
      window.localStorage.removeItem(refreshTokenKey);
      window.location.href = "/";
    });

  // Refresh coordination — per-instance so multiple clients never clash.
  // Followers park their settle handlers here while the leader refreshes.
  interface QueuedRequest {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
    config: RetryableConfig;
  }
  let isRefreshing = false;
  let refreshQueue: QueuedRequest[] = [];

  const resolveQueue = (newToken: string) => {
    const queued = refreshQueue;
    refreshQueue = [];
    queued.forEach(({ resolve, config }) => {
      config.headers.Authorization = `Bearer ${newToken}`;
      resolve(instance(config));
    });
  };

  // On refresh failure, reject parked requests instead of leaving them hanging
  // forever (they would otherwise never settle).
  const rejectQueue = (reason: unknown) => {
    const queued = refreshQueue;
    refreshQueue = [];
    queued.forEach(({ reject }) => reject(reason));
  };

  instance.interceptors.request.use((req: InternalAxiosRequestConfig) => {
    const token = readToken(accessTokenKey);
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
    async (error) => {
      const original = error.config as RetryableConfig | undefined;

      if (error.response?.status !== 401 || !original || original._retry) {
        return Promise.reject(error);
      }

      // A 401 on a request that never carried a Bearer token in the first place
      // (login, refresh, or any other public endpoint) is a normal business
      // response for the caller to handle — wrong credentials, MFA required,
      // an expired refresh credential — not a signal that an access token needs
      // refreshing. Treating it as one here means every such response also
      // triggers a doomed refresh attempt (no session exists to refresh) that
      // ends in `handleAuthFailure()`'s hard redirect, stomping on whatever the
      // caller's own error handling just did (e.g. showing an MFA prompt).
      if (!original.headers?.Authorization) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject, config: original });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        let res: Response;

        if (refreshMode === "cookie") {
          // Cookie mode: the refresh token rides in an HttpOnly cookie, so send no
          // body and include credentials; echo the JS-readable CSRF cookie in the
          // double-submit header the backend expects.
          const csrf = readCookie(csrfCookieName);
          const refreshHeaders: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (csrf) refreshHeaders[csrfHeaderName] = csrf;

          // Raw fetch (not the instance) so this call skips the interceptors above.
          res = await fetch(refreshUrl, {
            method: "POST",
            headers: refreshHeaders,
            credentials: "include",
          });
        } else {
          const refreshToken = readToken(refreshTokenKey);
          if (!refreshToken) throw new Error("No refresh token");

          // Raw fetch (not the instance) so this call skips the interceptors above.
          res = await fetch(refreshUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
            ...(withCredentials ? { credentials: "include" } : {}),
          });
        }
        if (!res.ok) throw new Error("Refresh failed");

        // Accept the nested envelope `{ data: { <field>, refresh } }` only when it
        // carries a token; otherwise fall back to a flat `{ <field>, refresh }`.
        const payload = (await res.json()) as Record<string, unknown> | null;
        const nested = payload?.data as Record<string, unknown> | undefined;
        const tokens =
          nested && typeof nested[accessResponseField] === "string"
            ? nested
            : ((payload ?? {}) as Record<string, unknown>);

        const access = tokens[accessResponseField];
        if (typeof access !== "string" || !access) {
          throw new Error("Refresh response missing access token");
        }
        const refresh = tokens.refresh;

        if (typeof window !== "undefined") {
          window.localStorage.setItem(accessTokenKey, access);
          // Cookie mode never persists a refresh token client-side.
          if (
            refreshMode !== "cookie" &&
            typeof refresh === "string" &&
            refresh
          )
            window.localStorage.setItem(refreshTokenKey, refresh);
        }

        resolveQueue(access);
        original.headers.Authorization = `Bearer ${access}`;
        return instance(original);
      } catch {
        rejectQueue(error);
        handleAuthFailure();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    },
  );

  return instance;
}
