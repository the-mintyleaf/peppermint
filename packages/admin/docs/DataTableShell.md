# DataTableShell — API Reference

Pre-built full table page. Composes `DataTableWrapper` internally with all five sub-components wired up.

Layout:
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

---

## `DataTableShell<T>`

```typescript
<DataTableShell<User>
  moduleInfo={{ title: 'Users' }}
  queryKey="users"
  queryGetFn={(params) => getRecords<User>('/api/users', params)}
  columns={columns}
  idAccessor="id"
  onNewClick={() => router.push('/users/new')}
  onEditClick={(id, row) => router.push(`/users/${id}/edit`)}
  onDeleteClick={(ids) => deleteUsers(ids)}
  filterList={filterDefs}
  pageSizes={[20, 50, 100]}
/>
```

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `moduleInfo` | `ModuleInfo` | Yes | `{ title, description? }` — shown in `TableHeader` |
| `queryKey` | `string` | Yes | React Query cache key |
| `queryGetFn` | `(params?) => Promise<ApiResponse<T[]>>` | Yes | Data fetcher |
| `columns` | `ColumnDef<T>[]` | Yes | Column definitions |
| `idAccessor` | `keyof T & string` | Yes | Key used for row identity and selection |
| `newButtonHref` | `string` | No | href for "+ New" button — use `onNewClick` instead if you need router navigation |
| `onNewClick` | `() => void` | No | Click handler for "+ New" button |
| `onEditClick` | `(id, row) => void` | No | Called when per-row edit icon is clicked |
| `onDeleteClick` | `(ids) => void` | No | Called with selected ids from bulk delete or per-row delete |
| `filterList` | `FilterDef[]` | No | Filter controls shown in `TableFilters` |
| `forceFilter` | `Record<string, unknown>` | No | Always applied to queries; never shown as a UI filter |
| `pageSizes` | `number[]` | No | Available page sizes; first entry is the default (default: `[20, 50, 100]`) |
| `hideFilters` | `boolean` | No | Hides the `TableFilters` row entirely |
| `rowExpansion` | `RowExpansionDef<T>` | No | Renders extra content below a selected row |
| `paginationResponseFn` | `(response) => PaginationData` | No | Maps API response to pagination metadata |

---

## `useExport<T>(columns, filename?)`

CSV export hook. Must be called inside a `DataTableWrapper` (or `DataTableShell`).

```typescript
const exportCSV = useExport(columns, 'users.csv');
<Button onClick={exportCSV}>Export CSV</Button>
```

Exports all currently loaded rows. Values with commas or quotes are properly escaped.

---

## Sub-components

All sub-components read from `DataTableWrapper` contexts directly — no prop drilling.

| Component | Subscribes to | Renders |
|---|---|---|
| `TableHeader` | `s.search` | Title, search input, "+ New" button |
| `TableFilters` | `s.filters` | Filter controls + active filter pills |
| `TableToolbar` | `s.selectedIds`, `s.density` | Bulk delete, density picker |
| `TableBody` | `DataContext` (rows) + `s.selectedIds` | Table rows, select checkboxes, per-row actions |
| `TablePagination` | `s.page`, `s.pageSize` + total from `DataContext` | Page controls, rows-per-page selector |
