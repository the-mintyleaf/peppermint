# Zetsel Framework — Agent Route Map

Read this file first. It tells you what exists and when to read the detail doc.
Full API references are in `packages/<pkg>/docs/`. Usage examples are in `usage-doc/<pkg>/`.

---

## Quick rule

> If you are building a page, shell, or form — check this map before writing any component from scratch. Everything here is already built.

---

## What's available

### Boot / providers

| Export | Package | Read when |
|---|---|---|
| `AppWrapper` | `@zetsel/ui` | Setting up a Next.js root layout | [usage](ui/AppWrapper.md) · [api](../packages/ui/docs/AppWrapper.md) |
| `QueryClientWrapper` | `@zetsel/ui` | Need React Query outside AppWrapper, or custom QueryClient config | [usage](ui/QueryClientWrapper.md) · [api](../packages/ui/docs/QueryClientWrapper.md) |
| `configureApiClient` | `@zetsel/api-client` | Wiring auth token key, refresh endpoint, logout callback at app boot | [usage](api-client/apiDispatch.md) · [api](../packages/api-client/docs/apiDispatch.md) |

---

### HTTP / data fetching

| Export | Package | Read when |
|---|---|---|
| `api.get/post/patch/del/login` | `@zetsel/api-client` | Making raw HTTP calls with auth, retry, or offline queue | [usage](api-client/apiDispatch.md) |
| `getRecords`, `getSingleRecord` | `@zetsel/api-client` | Fetching a list or single record for use with `useQuery` | [usage](api-client/moduleApiCall.md) |
| `createRecord`, `editRecord`, `deleteRecord` | `@zetsel/api-client` | Single-item mutations | [usage](api-client/moduleApiCall.md) |
| `createGroupRecords`, `editGroupRecords`, `deleteGroupRecords` | `@zetsel/api-client` | Bulk mutations | [usage](api-client/moduleApiCall.md) · [api](../packages/api-client/docs/moduleApiCall.md) |

---

### Notifications

| Export | Package | Read when |
|---|---|---|
| `triggerNotification.success/error/info/warning` | `@zetsel/admin` | Showing a toast from any event handler | [usage](admin/triggerNotification.md) |
| `triggerNotification.loading` / `.update` | `@zetsel/admin` | Async operations that need a persistent spinner then a result | [usage](admin/triggerNotification.md) |
| `triggerNotification.form.isLoading/isSuccess/isError` | `@zetsel/admin` | Form submit lifecycle feedback | [usage](admin/triggerNotification.md) |

---

### Table pages

| Export | Package | Read when |
|---|---|---|
| `DataTableModalShell` | `@zetsel/admin` | **Start here for any CRUD table page.** Create/edit open in modals. | [usage](admin/DataTableModalShell.md) · [api](../packages/admin/docs/DataTableModalShell.md) |
| `DataTableShell` | `@zetsel/admin` | Table page where create/edit navigate to separate routes instead of modals | [usage](admin/DataTableShell.md) · [api](../packages/admin/docs/DataTableShell.md) |
| `DataTableWrapper` + `useDataTableContext` + `useDataTableStore` | `@zetsel/admin` | Custom table layout not covered by the shells | [usage](admin/DataTableWrapper.md) · [api](../packages/admin/docs/DataTableWrapper.md) |

---

### Form pages

| Export | Package | Read when |
|---|---|---|
| `FormShell` | `@zetsel/admin` | **Start here for any create/edit form page.** Add `steps` for a wizard. | [usage](admin/FormShell.md) · [api](../packages/admin/docs/FormShell.md) |
| `FormWrapper` + `useFormInstance` + `useFormControls` | `@zetsel/admin` | Custom form layout not covered by FormShell, or embedding a form inside another component | [usage](admin/FormWrapper.md) · [api](../packages/admin/docs/FormWrapper.md) |

---

### Utilities

| Export | Package | Read when |
|---|---|---|
| `useDebounce`, `useLocalStorage`, `usePrevious`, `useWindowSize` | `@zetsel/utils` | Need one of these hooks | [usage](utils/utils.md) |
| `formatDate`, `formatCurrency`, `truncate`, `slugify`, etc. | `@zetsel/utils` | Formatting a value for display | [usage](utils/utils.md) |
| `zodResolver`, `parseOrNull` | `@zetsel/utils` | Connecting a Zod schema to a Mantine form, or safely parsing unknown data | [usage](utils/utils.md) · [api](../packages/utils/docs/utils.md) |

---

## Module patterns (app-level)

When building a full CRUD module inside an app, use one of these two patterns. Both define the same internal file structure (`module.config.ts`, `module.api.ts`, `form/`, `pages/`, `index.ts`).

| Pattern | When to use | Read |
|---|---|---|
| **ModalModule** | Simple form (≤ ~8 fields). List, create, edit, delete all on one route. | [module-patterns/ModalModule.md](module-patterns/ModalModule.md) |
| **RouteModule** | Complex form, multi-step wizard, or dedicated detail/profile view needed. Each action gets its own route. | [module-patterns/RouteModule.md](module-patterns/RouteModule.md) |

---

## Dependency order

```
@zetsel/utils          ← no monorepo deps
@zetsel/api-client     ← no monorepo deps
@zetsel/ui             ← no monorepo deps (re-exports Mantine)
@zetsel/admin          ← depends on ui, api-client, utils
apps/*                 ← depends on any of the above
```

An app should never import `@mantine/*` directly — always go through `@zetsel/ui`.
