# Zetsel Framework — Phase Status

Tracks completion state per build-order phase. Updated as each phase ships.

---

## Phase 1 — `@zetsel/utils` ✅ Complete

**Branch:** `dev/framework-phase1-utils`  
**Commit:** `43416b9`

### Checklist
- [x] `packages/utils/package.json` name is `"@zetsel/utils"`
- [x] `packages/utils/tsconfig.json` created
- [x] `useDebounce` — debounces any value; clears timer on cleanup
- [x] `useLocalStorage` — persistent state, syncs across tabs via `storage` event, SSR-safe
- [x] `usePrevious` — returns value from previous render
- [x] `useWindowSize` — reactive `{ width, height }`, SSR-safe
- [x] `formatting.ts` — `formatDate`, `formatDateTime`, `formatRelative`, `formatNumber`, `formatCurrency`, `truncate`, `capitalize`, `slugify`
- [x] `validation.ts` — `zodResolver` (Mantine adapter, handles nested dot-paths), `parseOrNull`
- [x] `src/index.ts` barrel exports everything
- [x] `pnpm check-types` passes with zero errors
- [x] `packages/utils/docs/utils.md` — API reference
- [x] `usage-doc/utils/utils.md` — usage examples

---

## Phase 2a — `@zetsel/api-client` › `apiDispatch` ✅ Complete

**Branch:** `dev/framework-phase1-utils`  
**Commit:** `fb4253f`

### Checklist
- [x] `packages/api-client/package.json` name is `"@zetsel/api-client"`, deps are axios-only
- [x] `packages/api-client/tsconfig.json` created
- [x] `apiDispatch.types.ts` — `ApiResponse<T>`, `PaginationData`, `RequestOptions`, `ApiClientConfig`
- [x] `interceptors.ts` — single Axios instance, bearer token injection, 401 refresh+retry with pause queue, debug logging
- [x] `queue.ts` — offline mutation buffer, auto-drains on `window 'online'`
- [x] `apiDispatch.ts` — `api.get/post/patch/del/login`, all return `ApiResponse<T>`, errors never thrown, `post/patch/del` offline-aware
- [x] `apiDispatch/index.ts` barrel exports `api`, `configureApiClient`, all types
- [x] `pnpm check-types` passes with zero errors
- [x] `packages/api-client/docs/apiDispatch.md` — API reference
- [x] `usage-doc/api-client/apiDispatch.md` — usage examples
- [x] `apps/testapp/package.json` updated from `@zetsel/api` to `@zetsel/api-client`

---

## Phase 2b — `@zetsel/api-client` › `moduleApiCall` ✅ Complete

**Branch:** `dev/framework-phase1-utils`  
**Commit:** `6082548`

### Checklist
- [x] `crud.ts` — `getRecords`, `getSingleRecord`, `createRecord`, `editRecord`, `deleteRecord`
- [x] `batch.ts` — `createGroupRecords`, `editGroupRecords`, `deleteGroupRecords`
- [x] `moduleApiCall/index.ts` re-exports all CRUD + batch functions
- [x] Root `packages/api-client/src/index.ts` re-exports both `apiDispatch` and `moduleApiCall`
- [x] `pnpm check-types` passes with zero errors
- [x] `packages/api-client/docs/moduleApiCall.md` — API reference
- [x] `usage-doc/api-client/moduleApiCall.md` — usage examples

---

## Phase 3a — `@zetsel/admin` › `triggerNotification` ✅ Complete

**Commit:** `ee4d246`

### Checklist
- [x] `triggerNotification.success/error/info/warning` — pre-set colours and timeouts
- [x] `triggerNotification.loading(message): string` — persistent spinner, returns id
- [x] `triggerNotification.update(id, data)` — updates any notification by id
- [x] `triggerNotification.form.isLoading/isSuccess/isError` — fixed `'form-submit'` id lifecycle
- [x] `pnpm check-types` passes
- [x] `packages/admin/docs/triggerNotification.md`
- [x] `usage-doc/admin/triggerNotification.md`

---

## Phase 3b — `@zetsel/admin` › `FormWrapper` ✅ Complete

**Commit:** `e885b41`

### Checklist
- [x] `FormWrapper.types.ts` — `FormWrapperProps`, `FormInstanceContextValue`, `FormControlsContextValue`
- [x] `FormWrapper.context.ts` — two independent contexts: `FormInstanceContext` (stable) + `FormControlsContext` (navigation)
- [x] `FormWrapper.utils.ts` — `validateStep`, `shallowEqual`, `draftSerialize`
- [x] `FormWrapper.hooks.ts` — `useFormInstance()`, `useFormControls()` (throw outside provider)
- [x] `FormWrapper.tsx` — all 7 form correctness rules enforced
- [x] Barrel exports wired
- [x] `pnpm check-types` passes
- [x] `packages/admin/docs/FormWrapper.md`
- [x] `usage-doc/admin/FormWrapper.md`

---

## Phase 3c — `@zetsel/admin` › `DataTableWrapper` ✅ Complete

**Commit:** `aae06eb`

### Checklist
- [x] `DataTableWrapper.types.ts` — `ColumnDef`, `FilterDef`, `ActionDef`, `ModuleInfo`, `DataTableStoreState`, `DataContextValue`
- [x] `DataTableWrapper.store.ts` — instance-scoped `createDataTableStore` (not global singleton), page-1 reset on search/filter/sort
- [x] `DataTableWrapper.context.ts` — `DataContext` (server data) + `StoreContext` (Zustand instance)
- [x] `DataTableWrapper.hooks.ts` — `useDataTableContext`, `useDataTableStore(selector)`, `useInvalidateTable`
- [x] `DataTableWrapper.tsx` — `useQuery` integration, merged params, both contexts mounted
- [x] Barrel exports wired
- [x] `pnpm check-types` passes
- [x] `packages/admin/docs/DataTableWrapper.md`
- [x] `usage-doc/admin/DataTableWrapper.md`

---

## Phase 3d — `@zetsel/admin` › `DataTableShell` ✅ Complete

**Commit:** `732cdf6`

### Checklist
- [x] `DataTableShell.types.ts` — `DataTableShellProps<T>` extending all wrapper + sub-component props
- [x] `DataTableShell.tsx` — composes `DataTableWrapper` + all five sub-components
- [x] `DataTableShell.hooks.ts` — `useExport(columns, filename?)` CSV export hook
- [x] `DataTableShell.module.css` — `.shell` and `.tableWrapper` layout classes
- [x] Sub-components: `TableHeader`, `TableFilters`, `TableToolbar`, `TableBody`, `TablePagination`
- [x] `packages/admin/declaration.d.ts` — CSS module + `@phosphor-icons/react` type stubs
- [x] Barrel exports wired (`DataTableShell`, `useExport`, `DataTableShellProps`)
- [x] `pnpm check-types` passes with zero errors
- [x] `packages/admin/docs/DataTableShell.md`
- [x] `usage-doc/admin/DataTableShell.md`

---

## Phase 3e — `@zetsel/admin` › `FormShell` ✅ Complete

### Checklist
- [x] `FormShell.types.ts` — `FormShellProps<T>`, `BreadcrumbItem`
- [x] `FormShell.hooks.ts` — `useUnsavedWarning(isDirty)` — `beforeunload` guard
- [x] `FormShell.module.css` — `.shell`, `.body`, `.footer` layout classes
- [x] `FormShell.tsx` — wraps `FormWrapper`, renders header/stepper/body/footer
- [x] `FormHeader` — title or breadcrumb trail + saving indicator
- [x] `FormStepper` — Mantine `Stepper`, reads `current` + `stepStatus` from context
- [x] `FormFooter` — sticky Cancel/Back/Next/Save buttons, multi-step aware
- [x] Barrel exports wired
- [x] `pnpm check-types` passes with zero errors
- [x] `packages/admin/docs/FormShell.md`
- [x] `usage-doc/admin/FormShell.md`

---

## Phase 3f — `@zetsel/admin` › `DataTableModalShell` ✅ Complete

### Checklist
- [x] `DataTableModalShell.types.ts` — `DataTableModalShellProps<T, TCreate, TEdit>`
- [x] `DataTableModalShell.tsx` — composes `DataTableShell` + three modals, manages open/close state
- [x] `CreateModal` — wraps `FormWrapper`, clears on success, invalidates query
- [x] `EditModal` — wraps `FormWrapper` with `editInitial(record)`, invalidates query
- [x] `DeleteConfirmModal` — fires `onDeleteApi` per id in parallel, error/success notifications
- [x] Barrel exports wired
- [x] `pnpm check-types` passes with zero errors
- [x] `packages/admin/docs/DataTableModalShell.md`
- [x] `usage-doc/admin/DataTableModalShell.md`

---

## Phase 4 — `@zetsel/ui` additions ✅ Complete

### Checklist
- [x] `QueryClientWrapper` — `QueryClientProvider` with default stale/cache config (5min stale, 10min gc, retry 1, no refetchOnWindowFocus)
- [x] `AppWrapper` gains `withQuery?: boolean` — mounts `QueryClientWrapper` when true
- [x] `@tanstack/react-query` added to `@zetsel/ui` deps
- [x] `QueryClientWrapper` re-exported from `@zetsel/ui` root index
- [x] `tsc --noEmit` passes in `packages/ui`
- [x] `packages/ui/docs/QueryClientWrapper.md`
- [x] `usage-doc/ui/QueryClientWrapper.md`

---

## Phase 5 — Storybook + docs ✅ Complete

**Commit:** `7919fe3`

### Checklist
- [x] `apps/storybook/.storybook/preview.tsx` — global `MantineProvider` + `QueryClientWrapper` + `ModalsProvider` decorator
- [x] `apps/storybook/tsconfig.json` — `moduleResolution: bundler`, explicit `paths` for all `@zetsel/*` packages, stories use package aliases not relative paths
- [x] `packages/admin` excludes `*.stories.tsx` from `check-types` (checked by storybook tsconfig instead)
- [x] `@storybook/react` added to `@zetsel/admin` devDeps
- [x] `DataTableShell.stories.tsx` — Minimal, FullyConfigured, EmptyState, LoadingState, ErrorState
- [x] `FormShell.stories.tsx` — Minimal, WithBreadcrumbsAndCancel, MultiStep, SubmitError
- [x] `DataTableModalShell.stories.tsx` — Minimal, WithFilters, EmptyState
- [x] `tsc --noEmit` passes in both `packages/admin` and `apps/storybook`
