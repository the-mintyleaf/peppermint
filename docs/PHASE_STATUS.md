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

## Phase 3d — `@zetsel/admin` › `DataTableShell` ⬜ Pending

Depends on: Phase 3c complete

---

## Phase 3e — `@zetsel/admin` › `FormShell` ⬜ Pending

Depends on: Phase 3b complete

---

## Phase 3f — `@zetsel/admin` › `DataTableModalShell` ⬜ Pending

Depends on: Phases 3d + 3e complete

---

## Phase 4 — `@zetsel/ui` additions ⬜ Pending

Depends on: Phase 2a complete ✅ (no React in api-client — safe to wire)

---

## Phase 5 — Storybook + docs ⬜ Pending

Depends on: All Phase 3 complete
