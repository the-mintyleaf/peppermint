# apiDispatch — API Reference

HTTP client layer for `@zetsel/api-client`. Wraps Axios with auth injection, 401 refresh/retry, and an offline mutation queue.

No React. No JSX. Safe to import in Node.js.

---

## `configureApiClient(options)`

Call once at app boot (e.g. in `app/layout.tsx`) before any API calls are made.

```typescript
import { configureApiClient } from '@zetsel/api-client';

configureApiClient({
  tokenKey: 'access_token',       // sessionStorage key for the access token
  refreshEndpoint: '/auth/refresh', // POST endpoint called on 401
  onLogout: () => router.push('/login'), // called when refresh fails
  debug: false,                   // optional — logs all requests/responses
});
```

| Option | Type | Required | Description |
|---|---|---|---|
| `tokenKey` | `string` | Yes | `sessionStorage` key where the access token is stored |
| `refreshEndpoint` | `string` | Yes | Endpoint POSTed to refresh the token on 401 |
| `onLogout` | `() => void` | Yes | Callback invoked when token refresh fails |
| `debug` | `boolean` | No | Logs requests and responses to the console |

---

## `api`

The main HTTP client. All methods return `Promise<ApiResponse<T>>`. Errors are returned, never thrown.

### `api.get<T>(options)`

```typescript
const result = await api.get<User[]>({ url: '/users', params: { page: 1 } });
```

### `api.post<T>(options)`

```typescript
const result = await api.post<User>({ url: '/users', body: { name: 'Alice' } });
```

If offline: mutation is queued, returns `{ ok: false, status: 0, data: null, message: 'Offline — queued' }`.

### `api.patch<T>(options)`

```typescript
const result = await api.patch<User>({ url: '/users/1', body: { name: 'Bob' } });
```

### `api.del<T>(options)`

```typescript
const result = await api.del<void>({ url: '/users/1' });
```

### `api.login<T>(options)`

Like `api.post` but always fires immediately — never queued, never intercepted for 401 refresh.

```typescript
const result = await api.login<{ access_token: string }>({
  url: '/auth/login',
  body: { email, password },
});
```

---

## `ApiResponse<T>`

```typescript
interface ApiResponse<T> {
  data: T | null;
  ok: boolean;
  status: number;
  message: string;
}
```

`ok: true` means the request succeeded. `ok: false` means it failed — inspect `status` and `message`.

---

## `RequestOptions`

```typescript
interface RequestOptions {
  url: string;
  body?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}
```

---

## `PaginationData`

```typescript
interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
```

Used by `paginationResponseFn` in `DataTableShell` to map API pagination shapes.

---

## `ApiClientConfig`

```typescript
interface ApiClientConfig {
  tokenKey: string;
  refreshEndpoint: string;
  onLogout: () => void;
  debug?: boolean;
}
```

---

## Interceptor Behaviour

**Request:** Reads `sessionStorage[tokenKey]` and sets `Authorization: Bearer <token>` on every request.

**401 Response:** Pauses all in-flight requests, calls `refreshEndpoint`, stores the new token in `sessionStorage`, retries all paused requests. If refresh fails, calls `onLogout` and rejects.

**Offline Queue:** `post`, `patch`, and `del` calls made while `navigator.onLine === false` are buffered. On `window 'online'` event, the queue drains in FIFO order.
