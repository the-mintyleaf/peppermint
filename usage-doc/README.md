# Zetsel Framework — Usage Docs

Practical examples for every public API. Each file shows real import paths and working code snippets.

For the full API reference (props tables, type signatures, architecture notes), see `packages/<pkg>/docs/`.

---

## `@zetsel/utils`

| What | File |
|---|---|
| Hooks (`useDebounce`, `useLocalStorage`, `usePrevious`, `useWindowSize`) + formatting + Zod validation resolver | [utils/utils.md](utils/utils.md) |

---

## `@zetsel/api-client`

| What | File |
|---|---|
| HTTP client — `configureApiClient`, `api.get/post/patch/del/login`, offline queue | [api-client/apiDispatch.md](api-client/apiDispatch.md) |
| CRUD helpers — `getRecords`, `createRecord`, `editRecord`, `deleteRecord` | [api-client/moduleApiCall.md](api-client/moduleApiCall.md) |
| Batch helpers — `createGroupRecords`, `editGroupRecords`, `deleteGroupRecords` | [api-client/moduleApiCall.md](api-client/moduleApiCall.md) |

---

## `@zetsel/ui`

| What | File |
|---|---|
| `AppWrapper` — Next.js root layout with Mantine + Modals + Notifications | [ui/AppWrapper.md](ui/AppWrapper.md) |
| `QueryClientWrapper` — React Query provider, standalone or via `AppWrapper withQuery` | [ui/QueryClientWrapper.md](ui/QueryClientWrapper.md) |

---

## `@zetsel/admin`

### Notification

| What | File |
|---|---|
| `triggerNotification` — imperative success/error/loading toasts, form lifecycle helpers | [admin/triggerNotification.md](admin/triggerNotification.md) |

### Low-level wrappers (build your own UI on top)

| What | File |
|---|---|
| `FormWrapper` — form state engine, `useFormInstance`, `useFormControls` | [admin/FormWrapper.md](admin/FormWrapper.md) |
| `DataTableWrapper` — table state engine, `useDataTableContext`, `useDataTableStore` | [admin/DataTableWrapper.md](admin/DataTableWrapper.md) |

### Shells (drop-in full pages)

| What | File |
|---|---|
| `DataTableShell` — full table page: search, filters, pagination, bulk delete, export | [admin/DataTableShell.md](admin/DataTableShell.md) |
| `FormShell` — full form page: breadcrumbs, stepper, sticky footer, unsaved warning | [admin/FormShell.md](admin/FormShell.md) |
| `DataTableModalShell` — table + create/edit/delete modals wired together | [admin/DataTableModalShell.md](admin/DataTableModalShell.md) |

---

## Decision guide

**Starting a new CRUD page with a table?**
→ Use [`DataTableModalShell`](admin/DataTableModalShell.md) if your create/edit forms open in modals.
→ Use [`DataTableShell`](admin/DataTableShell.md) if create/edit navigate to separate pages.

**Starting a new form page?**
→ Use [`FormShell`](admin/FormShell.md). Add `steps` for a multi-step wizard.

**Need custom table or form UI not covered by the shells?**
→ Use [`DataTableWrapper`](admin/DataTableWrapper.md) or [`FormWrapper`](admin/FormWrapper.md) directly and compose your own layout.

**Fetching data outside a shell?**
→ Use [`getRecords` / `getSingleRecord`](api-client/moduleApiCall.md) with `useQuery` from `@tanstack/react-query`.

**Showing a toast notification?**
→ Use [`triggerNotification`](admin/triggerNotification.md).
