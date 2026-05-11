# QueryClientWrapper — Usage Examples

## Recommended: via AppWrapper

```tsx
// app/layout.tsx
import { AppWrapper } from '@zetsel/ui';
import { configureApiClient } from '@zetsel/api-client';

configureApiClient({
  tokenKey: 'access_token',
  refreshEndpoint: '/api/auth/refresh',
  onLogout: () => { window.location.href = '/login'; },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppWrapper withQuery title="My App">
      {children}
    </AppWrapper>
  );
}
```

---

## Standalone usage

Use `QueryClientWrapper` directly when you need React Query outside of `AppWrapper`:

```tsx
import { QueryClientWrapper } from '@zetsel/ui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <QueryClientWrapper>
          {children}
        </QueryClientWrapper>
      </body>
    </html>
  );
}
```

---

## Custom QueryClient config

```tsx
import { QueryClientWrapper } from '@zetsel/ui';

<QueryClientWrapper
  config={{
    defaultOptions: {
      queries: {
        staleTime: 0,       // always refetch
        retry: 3,
        refetchOnWindowFocus: true,
      },
    },
  }}
>
  {children}
</QueryClientWrapper>
```
