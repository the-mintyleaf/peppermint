# @peppermint/api-client — API Reference

HTTP client layer for the Peppermint framework. Wraps Axios with auth-header
injection, `{ success, data, meta }` envelope unwrapping, and single-flight 401
refresh/retry.

No React. No JSX. The factory reads `localStorage` and `window`, so call it on the
client.

---

## `configureApiClient(config?)`

Call once at app boot (e.g. in `src/lib/api.ts`) and export the returned Axios
instance. All app data access goes through that instance via React Query.

```typescript
import { configureApiClient } from "@peppermint/api-client";

const api = configureApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  refreshEndpoint: "/api/v1/auth/refresh/",
});

export default api;
```

Returns a standard `AxiosInstance` — use `api.get`, `api.post`, `api.patch`,
`api.delete` as normal; responses are already unwrapped (see below).

### `ApiClientConfig`

| Option            | Type         | Required | Default                     | Description                                         |
| ----------------- | ------------ | -------- | --------------------------- | --------------------------------------------------- |
| `baseURL`         | `string`     | No       | `undefined`                 | Base URL for all requests.                          |
| `accessTokenKey`  | `string`     | No       | `"access_token"`            | `localStorage` key for the access token.            |
| `refreshTokenKey` | `string`     | No       | `"refresh_token"`           | `localStorage` key for the refresh token.           |
| `refreshEndpoint` | `string`     | No       | `"/api/v1/auth/refresh/"`   | Absolute URL, or a path resolved against `baseURL`. |
| `onAuthFailure`   | `() => void` | No       | clear tokens + redirect `/` | Called when refresh fails.                          |
| `headers`         | `object`     | No       | `{}`                        | Extra default headers merged onto every request.    |

---

## Interceptor behaviour

**Request:** reads `localStorage[accessTokenKey]` and sets
`Authorization: Bearer <token>` on every request (skipped during SSR).

**Response (success):** if the body is a `{ success: true, data, meta? }` envelope,
it is unwrapped — paginated lists (a `meta.count` number) keep `{ data, meta }` so
consumers can read both the rows and the total; everything else unwraps to `data`.

**Response (401):** the first 401 triggers a refresh POST to `refreshEndpoint` with
`{ refresh: <refreshToken> }`. Concurrent requests are queued and replayed once the
new token lands; a per-request `_retry` guard prevents loops. If refresh fails,
`onAuthFailure` runs and the original error rejects. Refresh state is per-instance.

---

## Notes

- The refresh call uses raw `fetch` (not the instance) so it bypasses these
  interceptors and can never recurse.
- Token keys are parameterized so an app can consolidate onto a single key set
  without editing this package.
- Typed per-resource CRUD helpers (`createResourceApi`) are a planned layer on top
  of this instance — see the framework plan, Phase 3.
