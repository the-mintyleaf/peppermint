# Zetsel Framework — Implementation Plan

## Overview

This document is the authoritative implementation plan for the Zetsel admin dashboard framework. It defines package boundaries, state management contracts, form correctness rules, and build order.

Stack: React 19, Next.js App Router, Mantine v9, TanStack Query v5, Zustand v5, Zod v3, Axios v1.

---

## Package Map

| Package | Role | Status |
|---|---|---|
| `@zetsel/ui` | Mantine wrapper — base components, AppWrapper, QueryClientWrapper | Exists — extend |
| `@zetsel/utils` | Pure hooks and helpers — no framework deps | Exists as stub — build out |
| `@zetsel/api-client` | HTTP client + CRUD helpers — no React, no JSX | Exists as stub — build out |
| `@zetsel/admin` | Wrappers + shells — the full UI framework layer | Exists as stub — build out |

No `@zetsel/types` package. Types belong to the package that owns the concept:
- HTTP/data types (`ApiResponse`, `PaginationData`, `RequestOptions`) → `@zetsel/api-client`
- UI types (`ColumnDef`, `FilterDef`, `ActionDef`) → `@zetsel/admin`
- Shared primitive types used across both → inline in each package; duplication at this scale is cheaper than a fourth dependency

---

## Dependency Graph

```
App (Next.js)
      ↓
@zetsel/admin       wrappers, shells, notification
   ↓          ↘
@zetsel/api-client  @zetsel/ui
```

- `@zetsel/api-client` — depends on nothing in the monorepo. Pure Axios + TypeScript.
- `@zetsel/ui` — depends on nothing in the monorepo. Mantine re-exports + AppWrapper.
- `@zetsel/admin` — depends on `@zetsel/api-client` and `@zetsel/ui`.
- `@zetsel/utils` — no monorepo deps. Usable at any layer.

**Hard rule:** no package imports from a layer above it. `@zetsel/api-client` never imports from `@zetsel/admin`.

---

## Package Responsibilities

### `@zetsel/utils`
Pure hooks and utility functions. `react` is a peer dep only — no framework coupling.

- `useDebounce<T>(value, delay)` — debounce any value
- `useLocalStorage<T>(key, initial)` — persistent state, syncs across tabs
- `usePrevious<T>(value)` — value from previous render
- `useWindowSize()` — reactive viewport dimensions
- `formatting.ts` — date, number, string formatters (dayjs-based)
- `validation.ts` — Zod helpers (`zodResolver`, `parseOrNull`)

### `@zetsel/api-client`
Pure data layer. No React, no JSX, no context, no hooks. Must be importable in Node.js.

Owns its own types: `ApiResponse<T>`, `PaginationData`, `RequestOptions`.

- `apiDispatch` — Axios instance with auth, token refresh, retry, offline queue
- `moduleApiCall` — CRUD helpers wrapping `apiDispatch`

Cache invalidation (`queryClient.invalidateQueries`) lives in `@zetsel/admin` — it requires a `QueryClient` reference which only exists inside a React tree.

### `@zetsel/admin`
The full UI framework layer. Depends on `@zetsel/api-client` and `@zetsel/ui`.

Owns its own UI types: `ColumnDef<T>`, `FilterDef`, `ActionDef<T>`, `RowExpansionDef<T>`, `ModuleInfo`.

**Public exports:**
- `FormWrapper` + `useFormInstance()` + `useFormControls()` — form state engine
- `DataTableWrapper` + `useDataTableContext()` + `useDataTableStore()` — table state engine
- `DataTableShell` — pre-built full table page (uses `DataTableWrapper` internally)
- `FormShell` — pre-built full form page (uses `FormWrapper` internally)
- `DataTableModalShell` — pre-built table + inline CRUD modals
- `EmptyState`, `ErrorState`, `LoadingSkeleton` — shared UI primitives
- `triggerNotification` — imperative notification helper

Wrappers are public so consumers can build custom layouts beyond what the shells provide. The shells remain the recommended path — they are the pre-built car; the wrappers are the engine available separately.

### `@zetsel/ui`
Already built. Two additions:
- `QueryClientWrapper` — `QueryClientProvider` with sensible defaults
- `AppWrapper` gains `withQuery?: boolean` prop to mount `QueryClientWrapper` automatically

---

## State Management Architecture

State management is the highest-priority concern. Every piece of state has exactly one correct home — wrong placement causes cascading re-renders, stale data, and form bugs.

### State Ownership

| State | Owner | Reason |
|---|---|---|
| Server data (rows, single record) | React Query `useQuery` | Caching, deduplication, background refetch |
| Table UI state (page, sort, filters, selection, density) | Zustand — instance-scoped per table | No prop drilling across sub-components; selector subscriptions prevent sibling re-renders; preference state persists to `localStorage` |
| Form field values | Mantine `useForm` (uncontrolled) | Fields update without triggering React re-renders — Mantine holds values in a ref internally |
| Form navigation state (step, loading, stepStatus) | React Context — `FormControlsContext` | Scoped to one form tree; only the footer and stepper subscribe |
| Modal open/close | `useState` in the shell that owns the modal | Local, not shared |
| Notifications | Imperative call — `triggerNotification.x()` | Fire-and-forget; no state to own |
| App-level global state | Zustand — consumer's responsibility | Framework does not own application state |

### Two-Context Split for `FormWrapper`

The single biggest cause of form lag is a single context holding both form values and navigation state. Every keystroke causes `isLoading`, `current`, and `stepStatus` consumers to re-render, and vice versa — clicking Next re-renders every field.

The solution is a hard split into two contexts that never merge:

```
FormInstanceContext   — holds the Mantine form instance (stable object ref, set once at mount)
FormControlsContext  — holds current step, isLoading, stepStatus, errors (changes on navigation/submit)
```

`useFormInstance()` subscribes to `FormInstanceContext` only → fields never re-render on navigation.
`useFormControls()` subscribes to `FormControlsContext` only → stepper/footer never re-render on keystrokes.

```typescript
// Stable for the lifetime of the form — never triggers re-renders in consumers
interface FormInstanceContextValue<T extends FormValues> {
  form: UseFormReturnType<T>;
}

// Changes only on step navigation and submission
interface FormControlsContextValue {
  current: number;
  isLoading: boolean;
  stepStatus: Record<number, 'pending' | 'complete' | 'error'>;
  completionPct: number;
  handleSubmit: () => void;
  handleStepNext: () => void;
  handleStepBack: () => void;
  handleStepGo: (step: number) => void;
}
```

Provider nesting — outer is stable, inner changes:

```
FormWrapper
└── FormInstanceContext.Provider   ← never re-provides; form ref is stable
    └── FormControlsContext.Provider  ← re-provides on step/submit changes
        └── {children}
```

### Two-Store Split for `DataTableWrapper`

Same principle as the form split. Server data and UI state change at different frequencies and for different reasons — mixing them forces the table body to re-render on every filter pill toggle.

```
DataContext     — rows, isLoading, isError, refetch (changes when React Query fetches)
StoreContext    — page, sort, filters, selection, density (changes on user interaction)
```

`useDataTableContext()` → table body and loading skeleton subscribe here.
`useDataTableStore(selector)` → each sub-component subscribes to exactly its slice.

```typescript
// Instance-scoped — createStore() not create(), so no global leak
const store = createStore<DataTableStoreState>((set) => ({
  page: 1, pageSize: 20, search: '', filters: [], sort: null,
  selectedIds: [], columnVisibility: {}, density: 'normal',
  setPage: (page) => set({ page }),
  setSearch: (search) => set({ search, page: 1 }),  // reset to page 1 on new search
  setSort: (sort) => set({ sort, page: 1 }),
  toggleRow: (id) => set((s) => ({
    selectedIds: s.selectedIds.includes(id)
      ? s.selectedIds.filter((x) => x !== id)
      : [...s.selectedIds, id],
  })),
  // ...
}));
```

Selector discipline — always subscribe to the minimum slice:

```typescript
// Wrong — re-renders on every store change
const store = useDataTableStore();

// Correct — re-renders only when this value changes
const page = useDataTableStore((s) => s.page);
const [page, pageSize] = useDataTableStore((s) => [s.page, s.pageSize]);
```

Sub-component subscription map:

| Component | Subscribes to |
|---|---|
| `TableHeader` | `s.search` only |
| `TableFilters` | `s.filters` only |
| `TableToolbar` | `s.selectedIds`, `s.density`, `s.columnVisibility` |
| `TableBody` | `DataContext` (rows) + `s.selectedIds` |
| `TablePagination` | `s.page`, `s.pageSize` + total from `DataContext` |

Preference state (density, column visibility, sort direction) is persisted to `localStorage` under `zetsel-table-{queryKey}` via `useLocalStorage` from `@zetsel/utils`.

---

## Form Correctness Rules

Non-negotiable. Each rule prevents a specific reproducible bug.

### Rule 1 — Initialise Once

The Mantine form instance is created exactly once at mount. `initial` is read via `useRef` — it is never a `useEffect` dependency.

```typescript
// Wrong — parent re-renders with new object literal → form resets mid-edit
const form = useForm({ initialValues: props.initial });

// Correct — captured once at mount, never re-read
const initialRef = useRef(props.initial);
const form = useForm({ initialValues: initialRef.current });
```

Edit mode pre-population uses `form.setValues()` in a `useEffect` keyed to the record id:

```typescript
useEffect(() => {
  if (recordId && record) form.setValues(record);
}, [recordId]); // NOT [record] — object reference changes every query refetch
```

### Rule 2 — Validate on Blur, Not on Change

`validateInputOnChange` is never enabled. Validation fires at three points only:

- **Blur** — validate the single field that lost focus
- **Next** — validate all field keys belonging to the current step only
- **Submit** — run the full Zod schema for all steps

```typescript
const form = useForm({
  initialValues: initialRef.current,
  validateInputOnChange: false,
  validateInputOnBlur: true,
});
```

Per-step validation targets only the keys in that step — `form.validate()` is never called on Next because it marks future-step fields as invalid before the user has reached them:

```typescript
function validateCurrentStep(fieldKeys: string[]): boolean {
  fieldKeys.forEach((key) => form.validateField(key));
  return fieldKeys.every((key) => !form.errors[key]);
}
```

### Rule 3 — Synchronous Submit Guard

`isLoading` is set to `true` synchronously before the first `await`. The submit button reads from `FormControlsContext` and is disabled the instant the handler runs — not after the first async tick.

```typescript
async function handleSubmit() {
  setIsLoading(true);                                      // synchronous
  const cloned = structuredClone(form.values);
  const payload = props.transformFnSubmit?.(cloned) ?? cloned;
  try {
    await props.apiSubmitFn(payload);
    props.submitSuccessFn?.();
    if (props.formClearOnSuccess) form.reset();
  } catch {
    triggerNotification.form.isError();
  } finally {
    setIsLoading(false);
  }
}
```

### Rule 4 — Deep Clone Before Transform

`transformFnSubmit` always receives a `structuredClone` of form values. Consumer functions are allowed to mutate the object — they are not required to be pure.

### Rule 5 — Modal Form Reset

All modals in `DataTableModalShell` use `keepMounted={false}`. The `FormWrapper` inside each modal fully unmounts and remounts between opens — no stale values, no dirty-state bleed from previous edits.

The only exception: if `keepMounted={true}` is set for performance, the modal component must call `form.reset()` then `form.setValues(record)` in a `useEffect` keyed to the record id — not to the open/close boolean.

### Rule 6 — Auto-Save is Debounced and Diffed

Auto-save draft writes on a minimum 800ms debounce via `useDebounce` from `@zetsel/utils`. Before writing, it shallow-compares against the last saved snapshot. No write occurs if values are unchanged — this prevents per-keystroke `localStorage` writes.

```typescript
const debouncedValues = useDebounce(form.values, 800);

useEffect(() => {
  if (!shallowEqual(debouncedValues, lastSavedRef.current)) {
    saveDraft(debouncedValues);
    lastSavedRef.current = debouncedValues;
  }
}, [debouncedValues]);
```

### Rule 7 — Step Validation is Scoped

`validation` is an array of Zod schemas indexed by step number. Step N's schema is only evaluated when the user attempts to advance past step N. A step with no schema entry is always considered valid.

```typescript
interface FormShellProps<T> {
  validation?: ZodSchema[]; // [step0Schema, step1Schema, ...] — sparse array is valid
}
```

---

## Phase 1 — `@zetsel/utils`

```
packages/utils/
├── src/
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePrevious.ts
│   │   └── useWindowSize.ts
│   ├── formatting.ts
│   ├── validation.ts
│   └── index.ts
├── package.json     # name: "@zetsel/utils", peerDeps: { react: ">=19" }
├── tsconfig.json
└── docs/
```

Fix before starting: `package.json` currently has `"name": "utils"` — rename to `"@zetsel/utils"`.

---

## Phase 2 — `@zetsel/api-client`

No React. No JSX. No context. No hooks.

### `apiDispatch`

```
packages/api-client/src/
├── apiDispatch/
│   ├── apiDispatch.ts       # api.get / post / patch / del / login
│   ├── apiDispatch.types.ts # ApiResponse, RequestOptions, PaginationData
│   ├── interceptors.ts      # Axios instance, token injection, 401 → refresh → retry
│   ├── queue.ts             # offline mutation queue
│   └── index.ts
```

- Single Axios instance created in `interceptors.ts`, never exported directly
- `configureApiClient()` called once at app boot — sets token key, refresh endpoint, logout callback
- On 401: pause original request, hit refresh endpoint, retry original on success, call `onLogout` on failure
- Offline queue: buffer mutations when `!navigator.onLine`, drain on `window 'online'` event
- All methods return `ApiResponse<T>` — errors are returned, never thrown

```typescript
export function configureApiClient(options: {
  tokenKey: string;          // sessionStorage key for the access token
  refreshEndpoint: string;   // POST endpoint for token refresh
  onLogout: () => void;      // called when refresh fails
  debug?: boolean;           // logs all requests/responses to console
}): void

export const api = {
  get<T>(options: Omit<RequestOptions, 'body'>): Promise<ApiResponse<T>>,
  post<T>(options: RequestOptions): Promise<ApiResponse<T>>,
  patch<T>(options: RequestOptions): Promise<ApiResponse<T>>,
  del<T>(options: Omit<RequestOptions, 'body'>): Promise<ApiResponse<T>>,
  login<T>(options: RequestOptions): Promise<ApiResponse<T>>,
}
```

### `moduleApiCall`

```
packages/api-client/src/
├── moduleApiCall/
│   ├── crud.ts    # getRecords, getSingleRecord, createRecord, editRecord, deleteRecord
│   ├── batch.ts   # createGroupRecords, editGroupRecords, deleteGroupRecords
│   └── index.ts
```

All methods return `Promise<ApiResponse<T>>`. Errors never thrown.

---

## Phase 3 — `@zetsel/admin`

### File Structure

```
packages/admin/src/
├── wrappers/
│   ├── FormWrapper/
│   │   ├── FormWrapper.tsx           # mounts both contexts; owns the form instance
│   │   ├── FormWrapper.types.ts      # FormWrapperProps + both context value interfaces
│   │   ├── FormWrapper.context.ts    # FormInstanceContext + FormControlsContext — two separate exports
│   │   ├── FormWrapper.hooks.ts      # useFormInstance(), useFormControls() — public exports
│   │   ├── FormWrapper.utils.ts      # validateStep(), shallowEqual(), draftSerialize()
│   │   └── index.ts
│   │
│   └── DataTableWrapper/
│       ├── DataTableWrapper.tsx      # mounts DataContext + StoreContext; runs useQuery
│       ├── DataTableWrapper.types.ts # DataTableWrapperProps + both context value interfaces
│       ├── DataTableWrapper.context.ts  # DataContext + StoreContext — two separate exports
│       ├── DataTableWrapper.store.ts    # createStore() — instance-scoped Zustand store
│       ├── DataTableWrapper.hooks.ts    # useDataTableContext(), useDataTableStore() — public exports
│       └── index.ts
│
├── shells/
│   ├── DataTableShell/
│   │   ├── DataTableShell.tsx
│   │   ├── DataTableShell.types.ts
│   │   ├── DataTableShell.module.css
│   │   ├── DataTableShell.hooks.ts     # useExport (CSV)
│   │   ├── components/
│   │   │   ├── TableHeader/
│   │   │   ├── TableFilters/
│   │   │   ├── TableToolbar/
│   │   │   ├── TableBody/
│   │   │   └── TablePagination/
│   │   ├── docs/
│   │   └── index.ts
│   │
│   ├── FormShell/
│   │   ├── FormShell.tsx
│   │   ├── FormShell.types.ts
│   │   ├── FormShell.module.css
│   │   ├── FormShell.hooks.ts          # useUnsavedWarning
│   │   ├── components/
│   │   │   ├── FormHeader/
│   │   │   ├── FormStepper/
│   │   │   └── FormFooter/
│   │   ├── docs/
│   │   └── index.ts
│   │
│   └── DataTableModalShell/
│       ├── DataTableModalShell.tsx
│       ├── DataTableModalShell.types.ts
│       ├── components/
│       │   ├── CreateModal/
│       │   ├── EditModal/
│       │   └── DeleteConfirmModal/
│       ├── docs/
│       └── index.ts
│
├── components/
│   ├── EmptyState/
│   ├── ErrorState/
│   └── LoadingSkeleton/
│
├── notification/
│   ├── notification.ts
│   └── index.ts
│
└── index.ts    # all public exports
```

### Wrapper Architecture

**`FormWrapper`** mounts both contexts. The outer context holds the stable form instance; the inner holds navigation state that changes:

```
FormWrapper
└── FormInstanceContext.Provider    value={{ form }}   ← set once, never changes
    └── FormControlsContext.Provider  value={{ current, isLoading, ... }}
        └── {children}
```

`useFormInstance()` and `useFormControls()` are standalone named exports — not methods on `FormWrapper`. Consumers import them directly from `@zetsel/admin`.

**`DataTableWrapper`** mounts data context and passes the Zustand store instance via a second context:

```
DataTableWrapper
└── DataContext.Provider    value={{ rows, isLoading, isError, refetch }}
    └── StoreContext.Provider  value={storeInstance}
        └── {children}
```

`useDataTableContext()` reads `DataContext`. `useDataTableStore(selector)` reads from the Zustand store instance. Both are standalone named exports.

Cache invalidation lives here, not in `@zetsel/api-client`:

```typescript
// DataTableWrapper.hooks.ts
export function useInvalidateTable(queryKey: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [queryKey] });
}
```

### Shell Props

**`DataTableShell`:**

```typescript
interface DataTableShellProps<T = unknown> {
  moduleInfo: ModuleInfo;
  queryKey: string;
  queryGetFn: (params?: Record<string, unknown>) => Promise<ApiResponse<T[]>>;
  columns: ColumnDef<T>[];
  idAccessor: keyof T & string;

  newButtonHref?: string;
  onNewClick?: () => void;
  onEditClick?: (id: string | number, row: T) => void;
  onDeleteClick?: (ids: Array<string | number>) => void;

  filterList?: FilterDef[];
  forceFilter?: Record<string, unknown>;  // always applied, never shown as a UI filter
  pageSizes?: number[];
  hideFilters?: boolean;
  rowExpansion?: RowExpansionDef<T>;
  enableServerQuery?: boolean;
  paginationResponseFn?: (response: unknown) => PaginationData;
}
```

**`FormShell`:**

```typescript
interface FormShellProps<T extends FormValues> {
  title: string;
  moduleInfo?: ModuleInfo;
  bread?: BreadcrumbItem[];

  queryKey: string;
  initial: T;
  apiSubmitFn: (data: T) => Promise<ApiResponse<unknown>>;
  validation?: ZodSchema[];           // sparse array — index matches step index
  transformFnSubmit?: (data: T) => T; // receives structuredClone — safe to mutate
  submitSuccessFn?: () => void;
  hasDirtCheck?: boolean;
  formClearOnSuccess?: boolean;

  steps?: string[];
  showStepper?: boolean;
  disabledSteps?: number[];
  enableStepClick?: boolean;

  onCancel?: () => void;
  children: React.ReactNode;
}
```

**`DataTableModalShell`:**

```typescript
interface DataTableModalShellProps<T = unknown> {
  moduleInfo: ModuleInfo;
  queryKey: string;
  queryGetFn: (params?: Record<string, unknown>) => Promise<ApiResponse<T[]>>;
  columns: ColumnDef<T>[];
  idAccessor: keyof T & string;

  onCreateApi: (data: unknown) => Promise<ApiResponse<unknown>>;
  onEditApi: (id: string | number, data: unknown) => Promise<ApiResponse<unknown>>;
  onDeleteApi: (id: string | number) => Promise<ApiResponse<void>>;

  // ComponentType — not ReactNode — so the modal renders them inside FormWrapper context
  createFormComponent: React.ComponentType;
  editFormComponent: React.ComponentType<{ record: T }>;

  filterList?: FilterDef[];
  modalSize?: string | number;

  onCreateSuccess?: (data: unknown) => void;
  onEditSuccess?: (data: unknown) => void;
  onDeleteSuccess?: () => void;
}
```

### `triggerNotification`

```typescript
export const triggerNotification = {
  success(message: string, options?: Partial<NotificationData>): void,
  error(message: string, options?: Partial<NotificationData>): void,
  info(message: string, options?: Partial<NotificationData>): void,
  warning(message: string, options?: Partial<NotificationData>): void,
  loading(message: string): string,       // returns notification id
  update(id: string, data: Partial<NotificationData>): void,
  form: {
    isLoading(): void,
    isSuccess(): void,
    isError(error?: string): void,
  },
}
```

### Layout Diagrams

**DataTableShell:**
```
┌──────────────────────────────────────────────────┐
│  Module title          [Search]        [+ New]   │  ← TableHeader
├──────────────────────────────────────────────────┤
│  [pill] [pill] [+ Filter]         [⋮ Toolbar]    │  ← TableFilters + TableToolbar
├──────────────────────────────────────────────────┤
│  ☐  Col A    Col B    Col C           Actions    │
│  ☐  ...                                          │  ← TableBody
│  ☐  ...                                          │
├──────────────────────────────────────────────────┤
│  1–20 of 134                   [< 1  2  3 ... >] │  ← TablePagination
└──────────────────────────────────────────────────┘
```

**FormShell:**
```
┌──────────────────────────────────────────────────┐
│  ← Breadcrumb / Breadcrumb       [● Saving...]   │  ← FormHeader
├──────────────────────────────────────────────────┤
│    ①  Step One   ②  Step Two   ③  Step Three     │  ← FormStepper
├──────────────────────────────────────────────────┤
│                                                   │
│   {children}                                      │
│                                                   │
├──────────────────────────────────────────────────┤
│  [Cancel]                  [← Back]   [Next →]   │  ← FormFooter (sticky)
└──────────────────────────────────────────────────┘
```

---

## Phase 4 — `@zetsel/ui` additions

- `QueryClientWrapper` — `QueryClientProvider` with default stale/cache time config
- `AppWrapper` gains `withQuery?: boolean` — mounts `QueryClientWrapper` when true
- `configureApiClient()` is called in the app's `layout.tsx` at boot, not inside `AppWrapper` — keeps the UI package free of `@zetsel/api-client` as a dependency

---

## Phase 5 — Developer Experience

- Storybook: each shell gets three stories — minimal, fully configured, error/empty/loading states
- All packages: `"strict": true`, `"noImplicitAny": true`, `"moduleResolution": "bundler"` in `tsconfig.json`
- Docs: `packages/<pkg>/docs/<Name>.md` (API reference) + `usage-doc/<pkg>/<Name>.md` (usage examples) per CLAUDE.md

---

## Deferred

| Feature | Condition for adding |
|---|---|
| Virtual scrolling | Table performance becomes a measured problem |
| Inline table cell editing | Confirmed use case |
| Table row grouping | Confirmed use case |
| Real-time / WebSocket updates | Backend contract established |
| Form draft versioning / migrations | Schema changes become frequent |
| Export to Excel | CSV proves insufficient |
| Module registry / CLI codegen | Multiple teams using the framework |

---

## Open Questions

1. **`configureApiClient()` call site** — `app/layout.tsx` is the correct place, but it means every app must call it manually. Should `AppWrapper` accept `apiConfig` as a prop and call it internally? That would make setup one-liner but couples `@zetsel/ui` to `@zetsel/api-client`.

2. **`mantine-datatable` evaluation** — before building `TableBody` from scratch, evaluate `mantine-datatable` for row selection, pinning, and row expansion. Saves significant implementation time if it fits.

---

## Build Order

```
Phase 1   @zetsel/utils          hooks + helpers (fix package name first)
Phase 2a  apiDispatch            HTTP client, no React
Phase 2b  moduleApiCall          CRUD helpers, no React
Phase 3a  triggerNotification    needed by all shells
Phase 3b  FormWrapper            form state engine — two contexts, all 7 rules enforced
Phase 3c  DataTableWrapper       table state engine — two contexts, Zustand selectors
Phase 3d  DataTableShell         uses DataTableWrapper internally
Phase 3e  FormShell              uses FormWrapper internally
Phase 3f  DataTableModalShell    composes DataTableShell + FormWrapper modals
Phase 4   QueryClientWrapper     wire into @zetsel/ui AppWrapper
Phase 5   Storybook + docs
```

Each phase is independently usable. `apps/testapp` is the live test bed at each phase.
