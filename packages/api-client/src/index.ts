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
}

const DEFAULT_ACCESS_TOKEN_KEY = "access_token";
const DEFAULT_REFRESH_TOKEN_KEY = "refresh_token";
const DEFAULT_REFRESH_ENDPOINT = "/api/v1/auth/refresh/";

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
 * Create a configured Axios instance for a Peppermint app. Call once at app boot
 * (e.g. in `src/lib/api.ts`) and export the returned instance.
 *
 * The instance:
 * - injects `Authorization: Bearer <accessToken>` from `localStorage` on every request,
 * - unwraps the `{ success, data, meta }` envelope (paginated lists keep `{ data, meta }`,
 *   everything else unwraps to `data`),
 * - transparently refreshes the access token once on a 401, serializing concurrent
 *   refreshes and guarding against retry loops, and calls `onAuthFailure` if refresh fails.
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
  } = config;

  const instance = axios.create({
    baseURL,
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
  let isRefreshing = false;
  let refreshQueue: Array<(token: string) => void> = [];

  const drainQueue = (newToken: string) => {
    refreshQueue.forEach((cb) => cb(newToken));
    refreshQueue = [];
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

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(instance(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = readToken(refreshTokenKey);
        if (!refreshToken) throw new Error("No refresh token");

        // Raw fetch (not the instance) so this call skips the interceptors above.
        const res = await fetch(refreshUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });
        if (!res.ok) throw new Error("Refresh failed");

        const payload: unknown = await res.json();
        const data =
          payload && typeof payload === "object" && "data" in payload
            ? (payload as { data: { access?: string; refresh?: string } }).data
            : (payload as { access?: string; refresh?: string });

        const access = data?.access;
        if (!access) throw new Error("Refresh response missing access token");

        if (typeof window !== "undefined") {
          window.localStorage.setItem(accessTokenKey, access);
          if (data.refresh)
            window.localStorage.setItem(refreshTokenKey, data.refresh);
        }

        drainQueue(access);
        original.headers.Authorization = `Bearer ${access}`;
        return instance(original);
      } catch {
        refreshQueue = [];
        handleAuthFailure();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    },
  );

  return instance;
}
