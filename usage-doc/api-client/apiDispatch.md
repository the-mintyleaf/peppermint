# apiDispatch — Usage Examples

## Setup

Call `configureApiClient` once at app boot in `app/layout.tsx`:

```tsx
// apps/my-app/app/layout.tsx
import { configureApiClient } from '@zetsel/api-client';

configureApiClient({
  tokenKey: 'access_token',
  refreshEndpoint: '/api/auth/refresh',
  onLogout: () => {
    // redirect to login — replace with your router
    window.location.href = '/login';
  },
  debug: process.env.NODE_ENV === 'development',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body>{children}</body></html>;
}
```

---

## Basic GET

```typescript
import { api } from '@zetsel/api-client';

const result = await api.get<User[]>({ url: '/api/users' });
if (result.ok) {
  console.log(result.data); // User[]
} else {
  console.error(result.status, result.message);
}
```

---

## With React Query

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@zetsel/api-client';

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<User[]>({ url: '/api/users' }),
    select: (res) => res.data ?? [],
  });
}

function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserBody) =>
      api.post<User>({ url: '/api/users', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
```

---

## Login flow

```typescript
import { api } from '@zetsel/api-client';

async function login(email: string, password: string) {
  const result = await api.login<{ access_token: string }>({
    url: '/api/auth/login',
    body: { email, password },
  });

  if (result.ok && result.data) {
    sessionStorage.setItem('access_token', result.data.access_token);
    // navigate to dashboard
  } else {
    // show error: result.message
  }
}
```

---

## Query params + custom headers

```typescript
const result = await api.get<ProductPage>({
  url: '/api/products',
  params: { page: 2, pageSize: 20, category: 'electronics' },
  headers: { 'X-Tenant-Id': 'acme' },
});
```

---

## Offline queue behaviour

When the user goes offline, `post`/`patch`/`del` calls are silently queued:

```typescript
// Returns immediately with { ok: false, status: 0, message: 'Offline — queued' }
const result = await api.post({ url: '/api/notes', body: { text: 'Remember this' } });

// When the browser comes back online, the call fires automatically.
```

Always check `result.status === 0` to detect offline queueing if your UI needs to show a "saved offline" indicator.
