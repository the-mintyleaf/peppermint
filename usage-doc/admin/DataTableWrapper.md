# DataTableWrapper — Usage Guide

Data fetching and state engine for `@peppermint/admin`. Handles React Query integration, server-side and client-side pagination, search, multi-column sort, row selection, column visibility, and user preference persistence — no prop drilling required.

Import from `@peppermint/admin`:

```ts
import {
  DataTableWrapper,
  useTableData,
  useTableStore,
  useInvalidateTable,
  useTableSelection,
} from "@peppermint/admin";
```

---

## When to use directly

`DataTableWrapper` is the low-level primitive. It provides state and data — it renders nothing itself. Use it directly when:

- You're composing your own table layout with `mantine-datatable` or any other table component
- You need full control over the header, toolbar, and footer
- You're building a table inside a modal or drawer with custom chrome

---

## Concepts

### Two-context architecture

`DataTableWrapper` uses two separate React contexts:

- **`DataTableDataContext`** — rows, loading state, error state, pagination meta. Re-renders when a query settles.
- **`DataTableStoreContext`** — the Zustand store instance. Never re-renders. Consumers subscribe to slices via `useTableStore()`.

This means a search input re-renders only when `search` in the store changes — not when rows load. A table body re-renders only when `rows` changes — not when the user types. They are fully independent.

### Instance-scoped store

Each `DataTableWrapper` mount gets its own isolated Zustand store. Multiple tables on the same page never interfere with each other.

---

## Basic usage — client-side mode

Client-side mode fetches all data once and handles search, sort, and pagination in the browser. No server integration needed.

```tsx
"use client";
import {
  DataTableWrapper,
  useTableData,
  useTableStore,
} from "@peppermint/admin";
import { DataTable } from "mantine-datatable";

type User = { id: number; name: string; email: string; role: string };

const getUsers = async () => api.get({ endpoint: "/users/" });

export function UsersTableModule() {
  return (
    <DataTableWrapper<User>
      queryKey="users.list"
      queryGetFn={getUsers}
      dataKey="data"
      defaultPageSize={20}
    >
      <UsersTable />
    </DataTableWrapper>
  );
}

function UsersTable() {
  const { rows, isLoading, paginationMeta } = useTableData<User>();
  const useTable = useTableStore();
  const page = useTable((s) => s.page);
  const setPage = useTable((s) => s.setPage);
  const setSearch = useTable((s) => s.setSearch);

  return (
    <>
      <TextInput
        placeholder="Search…"
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="sm"
      />
      <DataTable
        records={rows}
        fetching={isLoading}
        columns={[
          { accessor: "name", title: "Name" },
          { accessor: "email", title: "Email" },
          { accessor: "role", title: "Role" },
        ]}
        totalRecords={paginationMeta.total}
        recordsPerPage={paginationMeta.pageSize}
        page={page}
        onPageChange={setPage}
      />
    </>
  );
}
```

`UsersTableModule` owns the wrapper and data fetching. `UsersTable` reads from context — it has no idea how data arrives.

---

## Server-side mode

When `enableServerQuery` is true, the wrapper sends `page`, `pageSize`, `search`, `sort`, and `filters` to your API on every change. Your API handles filtering and pagination. The wrapper only renders what the server returns.

```tsx
"use client";
import {
  DataTableWrapper,
  useTableData,
  useTableStore,
} from "@peppermint/admin";
import type { QueryParams } from "@peppermint/admin";

type Product = { id: number; name: string; price: number; stock: number };

const getProducts = (params?: QueryParams) =>
  api.get({ endpoint: "/products/", params });

export function ProductsTableModule() {
  return (
    <DataTableWrapper<Product>
      queryKey="products.list"
      queryGetFn={getProducts}
      dataKey="data.items"
      paginationKey="data" // response.data.total is used as the record count
      enableServerQuery
      defaultPageSize={25}
      debounceMs={400} // wait 400ms after typing before firing a request
    >
      <ProductsTable />
    </DataTableWrapper>
  );
}
```

Your `queryGetFn` receives a `QueryParams` object:

```ts
interface QueryParams {
  page: number;
  pageSize: number;
  search: string;
  sort: SortState[]; // primary sort first
  filters: FilterState;
}
```

Map these to your API's expected shape inside `queryGetFn` — the wrapper doesn't assume a specific API contract.

---

## `dataKey` and `paginationKey`

Both accept dot-notation paths into the response object.

```tsx
// Response: { data: { items: Product[], total: 120, page: 1 } }
<DataTableWrapper
  dataKey="data.items"    // rows = response.data.items
  paginationKey="data"    // total = response.data.total
/>

// Response: { results: User[] }
<DataTableWrapper
  dataKey="results"       // rows = response.results
/>

// Response is already an array
<DataTableWrapper
  // no dataKey — uses the response directly
/>
```

---

## Multi-column sort

`sort` in the store is `SortState[]`. Index 0 is the primary sort, index 1 is the secondary tiebreaker.

Use `toggleSort` to let users sort by clicking column headers. It cycles each field through `asc → desc → removed`:

```tsx
function SortableTable() {
  const { rows } = useTableData<User>();
  const useTable = useTableStore();
  const sort = useTable((s) => s.sort);
  const toggleSort = useTable((s) => s.toggleSort);

  const getSortIcon = (field: string) => {
    const entry = sort.find((s) => s.field === field);
    if (!entry) return null;
    return entry.direction === "asc" ? "↑" : "↓";
  };

  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => toggleSort("name")}>Name {getSortIcon("name")}</th>
          <th onClick={() => toggleSort("email")}>
            Email {getSortIcon("email")}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{r.name}</td>
            <td>{r.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

To set sort programmatically (e.g., default sort on mount):

```tsx
const setSort = useTable((s) => s.setSort);
// Pass [] to clear all sorts
setSort([{ field: "name", direction: "asc" }]);
```

---

## Row selection

Use `useTableSelection()` for all selection operations. It binds directly to the store — no manual `setSelection` needed.

```tsx
function SelectableTable() {
  const { rows } = useTableData<User>();
  const useTable = useTableStore();
  const selection = useTable((s) => s.selection);

  const {
    toggle,
    selectPage,
    deselectPage,
    clearSelection,
    isAllPageSelected,
  } = useTableSelection();

  const ids = rows.map((r) => r.id);
  const allSelected = isAllPageSelected(ids);

  return (
    <>
      <Button
        variant="subtle"
        disabled={selection.size === 0}
        onClick={clearSelection}
      >
        Clear ({selection.size} selected)
      </Button>

      <DataTable
        records={rows}
        selectedRecords={rows.filter((r) => selection.has(r.id))}
        onSelectedRecordsChange={(selected) => {
          // mantine-datatable passes the new selected array
          const selectedIds = new Set(selected.map((r) => r.id));
          useTable((s) => s.setSelection)(selectedIds);
        }}
      />
    </>
  );
}
```

Or wire it to individual checkboxes:

```tsx
// Header checkbox — select/deselect all rows on current page
<Checkbox
  checked={allSelected}
  indeterminate={selection.size > 0 && !allSelected}
  onChange={() => (allSelected ? deselectPage(ids) : selectPage(ids))}
/>

// Row checkbox
<Checkbox
  checked={selection.has(row.id)}
  onChange={() => toggle(row.id)}
/>
```

After a bulk mutation, call `useInvalidateTable()` to refetch:

```tsx
function BulkDeleteButton() {
  const useTable = useTableStore();
  const selection = useTable((s) => s.selection);
  const { clearSelection } = useTableSelection();
  const invalidate = useInvalidateTable();

  const handleDelete = async () => {
    await api.post({
      endpoint: "/users/bulk-delete/",
      body: { ids: Array.from(selection) },
    });
    clearSelection();
    invalidate();
  };

  return (
    <Button color="red" disabled={selection.size === 0} onClick={handleDelete}>
      Delete ({selection.size})
    </Button>
  );
}
```

---

## Invalidating the cache

`useInvalidateTable()` returns a stable function that invalidates this table's React Query entry. Call it after any mutation that changes the data.

```tsx
function CreateUserModal() {
  const invalidate = useInvalidateTable();

  const handleSubmit = async (data: CreateUserInput) => {
    const res = await api.post({ endpoint: "/users/", body: data });
    if (res.ok) invalidate(); // table refetches automatically
  };
}
```

This hook must be called inside a component that is a descendant of `DataTableWrapper`.

---

## Column visibility and persistence

`columnVisibility` and `columnOrder` live in the store. Toggle them with `useTableStore()`:

```tsx
const useTable = useTableStore();
const columnVisibility = useTable((s) => s.columnVisibility);
const toggleColumn = useTable((s) => s.toggleColumn);
const columnOrder = useTable((s) => s.columnOrder);
const setColumnOrder = useTable((s) => s.setColumnOrder);

// Toggle a column
<Switch
  label="Show Email"
  checked={columnVisibility.email !== false}
  onChange={(e) => toggleColumn("email", e.currentTarget.checked)}
/>;
```

### Persisting preferences to localStorage

Add `persistence` to the wrapper. On mount, saved preferences are rehydrated. On change, they are written. Page refreshes preserve the user's column and density settings.

```tsx
<DataTableWrapper
  queryKey="users.list"
  queryGetFn={getUsers}
  persistence={{ storageKey: 'users-table' }}
>
```

Persist only specific slices:

```tsx
persistence={{ storageKey: 'users-table', persist: ['columnVisibility', 'density'] }}
```

The default `storageKey` is the `queryKey` string. You only need to set it explicitly if two tables share the same `queryKey` but should have independent preferences.

`reset()` on the store preserves `columnVisibility` and `columnOrder` — they are UI preferences, not query state.

---

## `forceFilters`

Filters that are always merged into every server query, regardless of what the store's `filters` contain. Never cleared by `reset()`. Use for tenant scoping, fixed status filters, or any constraint the user can't change.

```tsx
<DataTableWrapper
  queryKey="invoices.list"
  queryGetFn={getInvoices}
  enableServerQuery
  forceFilters={{ tenant_id: currentTenant.id, status: 'active' }}
>
```

---

## Density

`density` is a `'xs' | 'sm' | 'md' | 'lg' | 'xl'` value stored in the Zustand store. Use it to drive row padding or font size in your table component.

```tsx
const density = useTable((s) => s.density);
const setDensity = useTable((s) => s.setDensity);

// Density picker
<SegmentedControl
  value={density}
  onChange={(v) => setDensity(v as DensitySize)}
  data={['xs', 'sm', 'md', 'lg', 'xl']}
/>

// Passed to mantine-datatable
<DataTable rowStyle={{ fontSize: density === 'xs' ? 12 : 14 }} ... />
```

---

## Props

| Prop                | Type                            | Default  | Notes                                                                                                                                                    |
| ------------------- | ------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queryKey`          | `string`                        | —        | Required. Dot-notation, e.g. `'users.list'`. Split into array for React Query.                                                                           |
| `queryGetFn`        | `(params?) => Promise<unknown>` | —        | Required. Receives `QueryParams` when `enableServerQuery` is true, `undefined` otherwise.                                                                |
| `dataKey`           | `string`                        | —        | Dot-notation path to the rows array in the response, e.g. `'data.items'`. Omit if the response is already an array.                                      |
| `paginationKey`     | `string`                        | —        | Dot-notation path to an object with a `total` field, e.g. `'meta'`. Only used when `enableServerQuery` is true.                                          |
| `enableServerQuery` | `boolean`                       | `false`  | When true, page/search/sort/filters are sent to `queryGetFn` and the server handles them.                                                                |
| `initialSearch`     | `string`                        | —        | Seeds the search box once, on mount — for `?q=` deep links. Seed, not lock: the user can clear or replace it, and later changes to the prop are ignored. |
| `defaultPageSize`   | `number`                        | `20`     | Initial page size. Read once at mount.                                                                                                                   |
| `pageSizes`         | `number[]`                      | —        | Available page sizes. Passed to your table component — the wrapper doesn't render a selector itself.                                                     |
| `staleTime`         | `number`                        | `300000` | React Query stale time in ms.                                                                                                                            |
| `debounceMs`        | `number`                        | `300`    | Delay before search/filter changes trigger a server query. Has no effect in client-side mode.                                                            |
| `forceFilters`      | `FilterState`                   | —        | Always merged into server query params. Never reset by the store.                                                                                        |
| `persistence`       | `TablePersistenceOptions`       | —        | When set, `columnVisibility`, `columnOrder`, and/or `density` are persisted to `localStorage`.                                                           |
| `onError`           | `(error: Error) => void`        | —        | Called once when the query first enters an error state.                                                                                                  |
| `children`          | `ReactNode`                     | —        | Required.                                                                                                                                                |

### `TablePersistenceOptions`

| Field        | Type                                                      | Default    | Notes                                                       |
| ------------ | --------------------------------------------------------- | ---------- | ----------------------------------------------------------- |
| `storageKey` | `string`                                                  | `queryKey` | `localStorage` key prefix. Prefixed with `dtw:` internally. |
| `persist`    | `Array<'columnVisibility' \| 'columnOrder' \| 'density'>` | all three  | Which slices to persist.                                    |

---

## `useTableData<T>()`

Returns data context. Subscribe here in components that render the table body.

```tsx
const {
  rows, // T[] — current page of rows
  total, // total record count (server total or full client array length)
  isLoading, // true on first load (no data yet)
  isFetching, // true on any background refetch (data may exist from previous query)
  isError, // true when the last query failed
  refetch, // () => void — manually trigger a refetch
  paginationMeta, // { page, pageSize, total, totalPages }
} = useTableData<User>();
```

Re-renders whenever rows, loading state, or error state changes. Throws if called outside `<DataTableWrapper>`.

---

## `useTableStore()`

Returns a bound selector function for the instance store. Call the returned function at the top level of your component — it's a React hook.

```tsx
const useTable = useTableStore();

// Subscribe to individual slices:
const page = useTable((s) => s.page);
const pageSize = useTable((s) => s.pageSize);
const search = useTable((s) => s.search);
const sort = useTable((s) => s.sort); // SortState[]
const filters = useTable((s) => s.filters);
const selection = useTable((s) => s.selection); // Set<string | number>
const columnVisibility = useTable((s) => s.columnVisibility);
const columnOrder = useTable((s) => s.columnOrder);
const density = useTable((s) => s.density);

// Actions:
const setPage = useTable((s) => s.setPage);
const setSearch = useTable((s) => s.setSearch);
const toggleSort = useTable((s) => s.toggleSort); // cycles asc → desc → removed
const setSort = useTable((s) => s.setSort); // replace full sort array
const setFilters = useTable((s) => s.setFilters);
const reset = useTable((s) => s.reset); // resets query state, keeps UI prefs
```

Each `useTable(selector)` call is an independent subscription. A component that reads only `page` does not re-render when `search` changes.

Throws if called outside `<DataTableWrapper>`.

---

## `useInvalidateTable()`

Returns a stable function that invalidates this table's React Query cache entry and triggers a refetch.

```tsx
const invalidate = useInvalidateTable();
invalidate(); // call after any mutation
```

Throws if called outside `<DataTableWrapper>`.

---

## `useTableSelection()`

Returns selection helpers bound to this table's store.

```tsx
const {
  toggle, // (id) => void — add or remove a single row
  selectPage, // (ids) => void — add all given ids
  deselectPage, // (ids) => void — remove all given ids
  clearSelection, // () => void — empty the selection
  isAllPageSelected, // (ids) => boolean — true when all given ids are selected
  setSelection, // (Set<string | number>) => void — replace entire selection
} = useTableSelection();
```

Throws if called outside `<DataTableWrapper>`.

---

## `reset()`

Resets all query state to defaults: page → 1, pageSize → `defaultPageSize`, search → `''`, sort → `[]`, filters → `{}`, selection → empty.

Preserved across reset: `columnVisibility`, `columnOrder` — these are UI preferences, not query state.

```tsx
const reset = useTable((s) => s.reset);
<Button variant="subtle" onClick={reset}>
  Clear filters
</Button>;
```

---

## Common mistakes

**Don't call `useTableData`, `useTableStore`, `useInvalidateTable`, or `useTableSelection` outside `<DataTableWrapper>`** — all hooks throw with a clear error message if called without a wrapper ancestor.

**Don't put table-body logic and search-input logic in the same component:**

```tsx
// Wrong — this component re-renders on every keystroke AND every query settle
function UsersPage() {
  const { rows, isLoading } = useTableData<User>();
  const useTable = useTableStore();
  const search = useTable((s) => s.search);
  const setSearch = useTable((s) => s.setSearch);
  // ...
}

// Right — split by context boundary
function UsersSearchInput() {
  const useTable = useTableStore();
  const setSearch = useTable((s) => s.setSearch);
  return <TextInput onChange={(e) => setSearch(e.currentTarget.value)} />;
}

function UsersTableBody() {
  const { rows, isLoading } = useTableData<User>();
  // re-renders only when rows change, not when the user types
}
```

**Don't pass an unstable function reference to `queryGetFn`:**

```tsx
// Wrong — inline arrow recreates on every parent render, React Query sees a new fn
<DataTableWrapper
  queryGetFn={async (p) => api.get({ endpoint: "/users/", params: p })}
/>;

// Right — defined outside the component or wrapped in useCallback
const getUsers = (params?: QueryParams) =>
  api.get({ endpoint: "/users/", params });
<DataTableWrapper queryGetFn={getUsers} />;
```

**`queryGetFn` in server-side mode always receives the full `QueryParams` — including debounced values.** The debounce only delays when the query fires, not what it receives. There is no need to read `search` from the store inside `queryGetFn`.

**Don't use `forceFilters` for user-driven filters.** `forceFilters` is merged at request time and is never exposed to the user or stored in the Zustand store. If the user should be able to clear or change a filter, use `setFilters` instead.
