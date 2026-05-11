# DataTableWrapper — API Reference

Table state engine for `@zetsel/admin`. Mounts two independent contexts that decouple server data from UI interaction state.

---

## Architecture

```
DataTableWrapper
└── DataContext.Provider     ← changes when React Query fetches (rows, loading, error)
    └── StoreContext.Provider  ← passes Zustand store instance
        └── {children}
```

**Why two contexts?** Server data and UI state change at different frequencies and for different reasons. Mixing them forces the table body to re-render on every filter pill toggle, and forces every filter to re-render on every background refetch.

---

## `DataTableWrapper<T>`

```typescript
<DataTableWrapper
  queryKey="users"
  queryGetFn={(params) => getRecords<User>('/api/users', params)}
  pageSizes={[20, 50, 100]}
  paginationResponseFn={(res) => res.data.pagination}
  forceFilter={{ status: 'active' }}
>
  {children}
</DataTableWrapper>
```

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `queryKey` | `string` | Yes | React Query cache key; also used for `localStorage` preference persistence |
| `queryGetFn` | `(params?) => Promise<ApiResponse<T[]>>` | Yes | Called with merged query params on every page/sort/filter change |
| `pageSizes` | `number[]` | No | Available page sizes; first entry is the default |
| `enableServerQuery` | `boolean` | No | Reserved — always true in current implementation |
| `paginationResponseFn` | `(response) => PaginationData` | No | Maps API response to `{ page, pageSize, total, totalPages }` |
| `forceFilter` | `Record<string, unknown>` | No | Always applied to queries; never exposed as a UI filter |
| `children` | `ReactNode` | Yes | Rendered inside both contexts |

---

## `useDataTableContext<T>()`

Subscribe here for server data — rows, loading skeleton, error state.

```typescript
const { rows, isLoading, isError, total, refetch } = useDataTableContext<User>();
```

Throws if called outside a `DataTableWrapper`.

---

## `useDataTableStore(selector)`

Subscribe to exactly the slice your component needs. Re-renders only when that slice changes.

```typescript
// Correct — re-renders only when page changes
const page = useDataTableStore((s) => s.page);

// Correct — re-renders only when either of these change
const [page, pageSize] = useDataTableStore((s) => [s.page, s.pageSize] as const);

// Wrong — re-renders on every store change
const store = useDataTableStore((s) => s);
```

**Sub-component subscription map** (from the plan):

| Component | Subscribes to |
|---|---|
| `TableHeader` | `s.search` |
| `TableFilters` | `s.filters` |
| `TableToolbar` | `s.selectedIds`, `s.density`, `s.columnVisibility` |
| `TableBody` | `DataContext` (rows) + `s.selectedIds` |
| `TablePagination` | `s.page`, `s.pageSize` + total from `DataContext` |

Throws if called outside a `DataTableWrapper`.

---

## `useInvalidateTable(queryKey)`

Returns a callback that invalidates the table's React Query cache. Call after a successful mutation.

```typescript
const invalidate = useInvalidateTable('users');
// in mutation onSuccess:
invalidate();
```

Requires a `QueryClient` — must be called inside a React tree wrapped with `QueryClientProvider`.

---

## `DataTableStoreState` actions

| Action | Effect |
|---|---|
| `setPage(page)` | Set page |
| `setPageSize(pageSize)` | Set page size, reset to page 1 |
| `setSearch(search)` | Set search query, reset to page 1 |
| `setFilters(filters)` | Replace active filters, reset to page 1 |
| `setSort(sort)` | Set sort key + direction, reset to page 1 |
| `toggleRow(id)` | Toggle one row in selection |
| `selectAll(ids)` | Replace selection with all ids |
| `clearSelection()` | Clear selection |
| `setColumnVisibility(v)` | Update column visibility map |
| `setDensity(density)` | Set `'compact' \| 'normal' \| 'spacious'` |

---

## Types

### `ColumnDef<T>`

```typescript
interface ColumnDef<T> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: number | string;
}
```

### `FilterDef`

```typescript
interface FilterDef {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean';
  options?: { value: string; label: string }[];
}
```

### `ModuleInfo`

```typescript
interface ModuleInfo {
  title: string;
  description?: string;
}
```
