# @peppermint/api-client — API Reference

HTTP client layer for the Peppermint framework. Wraps Axios with auth-header
injection, `{ success, data, meta }` envelope unwrapping, and single-flight 401
refresh/retry.

No React. No JSX. The factory reads `localStorage` and `window` (guarded, so it is
SSR-safe to import), and it installs `storage` / `visibilitychange` listeners in the
browser for proactive refresh.

Source layout: `src/index.ts` (factory + interceptors), `src/session.ts` (single-flight
refresh, token persistence, proactive timer), `src/refresh.ts` (transport + outcome
classification + 429 backoff), `src/storage.ts`, `src/types.ts`.

---

## `configureApiClient(config?)`

Call once at app boot (e.g. in `src/lib/api.ts`) and export the returned Axios
instance. All app data access goes through that instance via React Query.

```typescript
import { configureApiClient } from "@peppermint/api-client";

const api = configureApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  refreshEndpoint: "/api/v1/auth/refresh/",
  refreshMode: "auto", // cookie in production, body in development
  skipRefreshPaths: ["/api/v1/auth/login/"],
  onAuthFailure: (info) => {
    clearTokens();
    window.location.href = `/?signed_out=${info.reason ?? "1"}`;
  },
});

export default api;
```

Returns a standard `AxiosInstance` — use `api.get`, `api.post`, `api.patch`,
`api.delete` as normal; responses are already unwrapped (see below).

### `ApiClientConfig`

| Option                   | Type                              | Required | Default                      | Description                                                                                                                           |
| ------------------------ | --------------------------------- | -------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `baseURL`                | `string`                          | No       | `undefined`                  | Base URL for all requests.                                                                                                            |
| `accessTokenKey`         | `string`                          | No       | `"access_token"`             | `localStorage` key for the access token.                                                                                              |
| `refreshTokenKey`        | `string`                          | No       | `"refresh_token"`            | `localStorage` key for a body-transported refresh token.                                                                              |
| `accessExpiresAtKey`     | `string`                          | No       | `"access_expires_at"`        | `localStorage` key for the access expiry (ISO 8601). The app writes it at login; each refresh rewrites it. Drives proactive refresh.  |
| `refreshEndpoint`        | `string`                          | No       | `"/api/v1/auth/refresh/"`    | Absolute URL, or a path resolved against `baseURL`.                                                                                   |
| `refreshMode`            | `"body" \| "cookie" \| "auto"`    | No       | `"body"`                     | Refresh transport — see below.                                                                                                        |
| `withCredentials`        | `boolean`                         | No       | `true` for `cookie` / `auto` | Credentials on instance requests and the refresh call.                                                                                |
| `csrfCookieName`         | `string`                          | No       | `"csrftoken"`                | `cookie` mode only: JS-readable CSRF cookie echoed on refresh.                                                                        |
| `csrfHeaderName`         | `string`                          | No       | `"X-CSRFToken"`              | `cookie` mode only: header that echo is sent under.                                                                                   |
| `accessResponseField`    | `string`                          | No       | `"access"`                   | Field on the refresh response holding the access token.                                                                               |
| `expiresAtResponseField` | `string`                          | No       | `"access_expires_at"`        | Field on the refresh response holding the access expiry.                                                                              |
| `proactiveRefresh`       | `boolean`                         | No       | `true`                       | Refresh ahead of the stored expiry. Inactive until an expiry is stored.                                                               |
| `refreshLeadTimeMs`      | `number`                          | No       | `60000`                      | How long before the expiry the proactive refresh fires.                                                                               |
| `skipRefreshPaths`       | `string[]`                        | No       | `[]`                         | URL fragments whose 401 never triggers a refresh, even with a stale Bearer attached (e.g. the login endpoint).                        |
| `maxRateLimitRetries`    | `number`                          | No       | `3`                          | Retries (exponential backoff, `Retry-After` honoured when readable) for a 429 refresh.                                                |
| `onAuthFailure`          | `(info: AuthFailureInfo) => void` | No       | clear tokens + redirect `/`  | Called once when a refresh is definitively refused. `info` is `{ status, code, reason }` from the refresh error envelope (see below). |
| `headers`                | `object`                          | No       | `{}`                         | Extra default headers merged onto every request.                                                                                      |

All additions are backward compatible: `onAuthFailure: () => void` still type-checks,
and the default `"body"` transport behaves as before.

### Refresh transports (`refreshMode`)

- **`"body"`** — POST `{ refresh: <stored token> }`. With no stored token, no request
  is sent and `onAuthFailure({ status: null, code: null, reason: "missing" })` runs.
- **`"cookie"`** — POST with no body and `credentials: "include"` (HttpOnly refresh
  cookie) plus a double-submit CSRF header. Nothing is read from or written to
  `localStorage` for the refresh token.
- **`"auto"`** — `credentials: "include"` on every instance request and on the
  refresh call, **and** the stored body token as `{ refresh }` when one exists
  (`{}` otherwise). A rotated body token is persisted; an answer without one (cookie
  transport, or a concurrent-refresh grace answer) keeps the newest held. For a
  backend that uses a cookie in production and the body in development. Requires a
  CORS answer that echoes the exact origin with `Access-Control-Allow-Credentials:
true`, because every instance request is credentialed (the login response must be,
  or the browser drops its `Set-Cookie`).

### `AuthFailureInfo`

`{ status: number | null; code: string | null; reason: string | null }`:
`status` is the refresh response's HTTP status, `code` its `error.code`, and `reason` its
`error.details.reason` (or `"missing"` when there was nothing to send). Exported from
the package root.

---

## Interceptor behaviour

**Request:** the Bearer token and credentials go **only** to the API origin (the
origin `baseURL` resolves to, or the page's origin without a `baseURL`). An absolute
URL on any other origin is sent with no `Authorization` header and
`withCredentials: false`. For API requests it then re-syncs the proactive timer from
storage (this is how a login in the same tab is picked up). If the stored access token
is already past its stored expiry, it refreshes first rather than spend a 401 round
trip. Finally it reads `localStorage[accessTokenKey]` and sets
`Authorization: Bearer <token>` (skipped during SSR).

**Response (success):** if the body is a `{ success: true, data, meta? }` envelope,
it is unwrapped — paginated lists (a `meta.count` number) keep `{ data, meta }` so
consumers can read both the rows and the total; everything else unwraps to `data`.

**Response (401):** any 401 on a request that carried a Bearer token, whatever its
`error.code`, is refresh-then-retry-once. These are passed straight to the caller with
no refresh:

- a 401 on a request with no Bearer token (login, refresh, public endpoints);
- a 401 on a `skipRefreshPaths` match;
- a 401 that arrives after the stored access token was cleared (a deliberate logout,
  or an earlier refusal). Refreshing then would redirect twice or bring a signed-out
  session back.

If the stored token already differs from the one the request carried (another
request or tab refreshed), the request is just retried. Otherwise one
**single-flight** refresh runs per instance, and every concurrent 401 awaits it. A
per-request `_retry` guard prevents loops. Refresh outcomes:

| Refresh answer                                                                                                 | Effect                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2xx with an access token                                                                                       | Tokens + expiry stored, timer rescheduled, waiting requests retried.                                                                                                                     |
| 429                                                                                                            | The waiting request fails fast. In the background, backoff + retry up to `maxRateLimitRetries` (exponential from 1 s; `Retry-After` honoured but never under 1 s). **No sign-out.**      |
| Anything else that is not a JSON auth refusal: 5xx, network, 408, proxy/WAF 403/404/405, HTML or non-token 2xx | The request rejects. **No sign-out.**                                                                                                                                                    |
| JSON auth refusal: 401 with an `error.code`, or 403 with an `AUTH_*` code                                      | `onAuthFailure(info)` and the timer stops. Fires **at most once per session**: re-armed only by a successful refresh or a new login (a different stored token). Waiting requests reject. |

A round that ends neither ok nor refused starts a **cooldown** (30 s, doubling per
round up to 5 min, reset by success or a new login). During it, refreshes are not
sent, so a throttled credential (10/min server-side) can recover.

A refresh that finishes after the stored token was cleared writes nothing back. One
superseded by another tab or a new login neither overwrites the newer token nor signs
that newer session out.

**Proactive refresh:** when an expiry is stored, a timer fires `refreshLeadTimeMs`
(minus up to 5 s jitter) before it, through the same single-flight. Tabs share
`localStorage`. When one tab refreshes, the others get a `storage` event and
reschedule. A tab whose timer fires also re-checks the stored expiry, and if another
tab moved it, follows that instead of refreshing. A timer that runs late (a throttled
background tab, a machine waking from sleep) is re-checked on `visibilitychange` and
on the next request.

Every refresh attempt is recorded in storage (`<accessTokenKey>_refresh_attempt_at`).
Proactive and pre-flight refreshes wait at least 30 s after the last attempt **from
any tab**, which prevents a loop or tab-to-tab ping-pong when the client clock runs
ahead of the server's. They also respect the cooldown. A proactive refresh that comes
back unavailable retries after `max(15 s, cooldown)`.

**Storage failures:** `localStorage` reads and writes never throw. A failed write
(quota, Safari private mode, `SecurityError`) is kept in memory for the current tab,
and the failure is logged once with `console.warn`. If localStorage later changes
underneath it (the app cleared it, or another tab wrote it), localStorage wins again.

## Notes

- The refresh call uses raw `fetch` (not the instance) so it bypasses these
  interceptors and can never recurse.
- Token keys are parameterized so an app can consolidate onto a single key set
  without editing this package.
- Typed per-resource CRUD helpers (`createResourceApi`) are a planned layer on top
  of this instance — see the framework plan, Phase 3.
