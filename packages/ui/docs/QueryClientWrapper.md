# QueryClientWrapper — API Reference

Provides a `QueryClient` to the component tree via `@tanstack/react-query`'s `QueryClientProvider`.

Default configuration:

- `staleTime`: 5 minutes
- `gcTime`: 10 minutes
- `retry`: 1
- `refetchOnWindowFocus`: `false`

---

## `QueryClientWrapper`

```typescript
<QueryClientWrapper>
  <App />
</QueryClientWrapper>
```

### Props

| Prop       | Type                | Required | Description                                  |
| ---------- | ------------------- | -------- | -------------------------------------------- |
| `children` | `ReactNode`         | Yes      | Component tree that needs React Query access |
| `config`   | `QueryClientConfig` | No       | Override the default `QueryClient` config    |

---

## Via `AppWrapper`

The recommended way to mount `QueryClientWrapper` in a Next.js app is via the `withQuery` prop on `AppWrapper`:

```typescript
<AppWrapper withQuery>
  {children}
</AppWrapper>
```

This mounts `QueryClientWrapper` around `MantineProvider` and `ModalsProvider`. `configureApiClient()` is called separately in `app/layout.tsx` — `AppWrapper` does not import `@peppermint/api-client`.
