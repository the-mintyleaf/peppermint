# DataTableShell — Usage Guide

Pre-composed admin table page for `@peppermint/admin`. Renders a page header, an icon-based toolbar (sort, filter, columns, search, settings, add), an active filters bar, a `mantine-datatable` table with pagination, and a floating bulk-action bar — all wired to `DataTableWrapper` state automatically.

```ts
import { DataTableShell } from "@peppermint/admin";
```

`DataTableShell` is self-contained. It wraps `DataTableWrapper` internally — you do not need to add a separate wrapper. It accepts all `DataTableWrapper` props directly alongside its own.

---

## Minimal usage

```tsx
"use client";
import { DataTableShell } from "@peppermint/admin";
import type { DataTableShellColumn } from "@peppermint/admin";
import { api } from "@/lib/api";

type User = { id: number; name: string; email: string; role: string };

const COLUMNS: DataTableShellColumn<User>[] = [
  { accessor: "name", title: "Name", key: "name", sortable: true },
  { accessor: "email", title: "Email", key: "email", sortable: true },
  { accessor: "role", title: "Role", key: "role" },
];

export function UsersPage() {
  return (
    <DataTableShell<User>
      queryKey="users.list"
      queryGetFn={() => api.get({ endpoint: "/users/" })}
      dataKey="data"
      columns={COLUMNS}
      moduleInfo={{
        name: "User",
        label: "Users",
        description: "Manage all users",
      }}
      basePath="/admin/users"
    />
  );
}
```

The shell renders the full page layout. The `basePath` prop is used to build navigation hrefs:

- Add button (toolbar) → `${basePath}/new`
- Edit (from action bar) → `${basePath}/${id}/edit`
- Review (from action bar) → `${basePath}/${id}`

---

## Server-side mode

Pass `enableServerQuery` to have React Query send page, pageSize, search, sort, and filters to your API on every change.

```tsx
<DataTableShell<User>
  queryKey="users.list"
  queryGetFn={(params) => api.get({ endpoint: "/users/", params })}
  dataKey="data.items"
  paginationKey="data.meta"
  enableServerQuery
  columns={COLUMNS}
  moduleInfo={{ name: "User", label: "Users" }}
  basePath="/admin/users"
/>
```

`params` is a `QueryParams` object:

```ts
{
  page: number;
  pageSize: number;
  search: string;
  sort: Array<{ field: string; direction: "asc" | "desc" }>;
  filters: Record<string, unknown>;
}
```

Search and filter changes are debounced 300ms before triggering a new request (configurable via `debounceMs`).

---

## Column definitions

Columns extend mantine-datatable's `DataTableColumn<T>` with additional fields:

```ts
type DataTableColumnFilterType = "text" | "select" | "number" | "date";

interface DataTableColumnFilter {
  type?: DataTableColumnFilterType; // default: 'text'
  icon?: React.ComponentType<{ size?: number; weight?: string }>;
  options?: Array<{ label: string; value: string }>; // required for 'select'
  placeholder?: string;
}

type DataTableShellColumn<T> = DataTableColumn<T> & {
  key?: string; // visibility map key — defaults to String(accessor)
  defaultVisible?: boolean; // initial visibility — defaults to true
  filter?: DataTableColumnFilter; // when set, column appears in the filter picker
};
```

Always provide a `key` when your column accessor might not be a plain string, or when two columns share the same accessor.

```ts
const COLUMNS: DataTableShellColumn<Order>[] = [
  { accessor: "id", title: "#", key: "id", defaultVisible: false },
  {
    accessor: "customer",
    title: "Customer",
    key: "customer",
    sortable: true,
    filter: { type: "text" },
  },
  { accessor: "total", title: "Total", key: "total", sortable: true },
  {
    accessor: "status",
    title: "Status",
    key: "status",
    filter: {
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
  },
  {
    accessor: "createdAt",
    title: "Created",
    key: "createdAt",
    defaultVisible: false,
    render: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
];
```

Column visibility is persisted to `localStorage` automatically, keyed by `moduleInfo.name`. Users can show/hide columns from the **Columns** icon in the toolbar. Their preference survives page refreshes.

---

## Toolbar

The desktop toolbar renders icon actions on the right (each with a tooltip and popover):

| Icon     | Purpose                                                                                    |
| -------- | ------------------------------------------------------------------------------------------ |
| Filter   | Two-step field picker (`Filter by` search) then value editor                               |
| Search   | Global text search across all row fields (debounced 300ms)                                 |
| Settings | Row density and reset table state                                                          |
| Columns  | Toggle column visibility                                                                   |
| Add      | Navigates to `${basePath}/new` (or calls `onNewClick` in sustained mode); uses brand color |

The **Add** button lives in the toolbar only — not in the page header. Use `headerRight` for extra header actions.

Field filters merge into the store's `filters` object and appear as removable chips above the table. Global search appears as a `Search: …` chip when active.

Filter picker behavior:

1. Click **Filter** → searchable list of columns with `filter` metadata
2. Select a field → value editor (`text`, `select`, `number`, or `date`)
3. Apply → filter chip appears; in server mode, `filters` is sent on the next query

Disable the Add button with `disableCreateButton`. Hide the entire toolbar with `hideToolbar`.

Toolbar trigger icons (Filter, Search, Settings, Columns) use Phosphor `weight="duotone"`.

---

## ModuleHeader access bar

The `ModuleHeader` right slot renders:

`Edited X min ago | Access ▾ | Bookmark | ⋯`

| Element  | Behavior                                                                                                                                                                                                                                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Edited   | Relative timestamp from `lastEditedAt`, `moduleInfo.updatedAt`, or latest row `updatedAt`                                                                                                                                                                                                                                                             |
| Access   | Popover listing roles and accounts with module access; invite + permission edits                                                                                                                                                                                                                                                                      |
| Bookmark | Toggles favorite via shared `BookmarkButton` from `@peppermint/ui`; persisted in `localStorage` at `peppermint:bookmarks` (central list). Bookmark `id` defaults to `basePath ?? moduleInfo.name`; `href` is current pathname (no filter query params). Saved bookmarks appear in AdminShell MainNav hover menu. See [Bookmarks](../ui/Bookmarks.md). |
| ⋯        | Reload table and export CSV                                                                                                                                                                                                                                                                                                                           |

```tsx
<DataTableShell<Account>
  moduleAccess={{
    accounts: [{ id: "1", name: "Jane Doe", accessLevel: "edit" }],
    roles: [{ id: "2", name: "Manager", accessLevel: "manage" }],
    invitedCount: 4,
  }}
  onModuleAccessChange={(change) => {
    // change.type: 'invite' | 'account' | 'role'
  }}
  lastEditedAt={new Date()}
  shareUrl="https://app.example.com/admin/accounts"
/>
```

Hide the Access menu with `hideAccessMenu` or omit `moduleAccess`. Use `headerRight` for additional header actions before the edited label.

---

## Tabs

Tabs appear in the toolbar as a row of filter buttons (desktop) or a dropdown menu (mobile).

### Client-side tabs — `forceFilter`

Use `forceFilter` to filter already-fetched rows without an extra network request.

```tsx
<DataTableShell<User>
  ...
  tabs={[
    { label: 'All' },
    {
      label: 'Active',
      forceFilter: (rows) => rows.filter((r) => r.status === 'active'),
    },
    {
      label: 'Suspended',
      forceFilter: (rows) => rows.filter((r) => r.status === 'suspended'),
    },
  ]}
/>
```

### Server-side tabs — `filter`

Use `filter` to send a server filter parameter when the tab is selected. Requires `enableServerQuery`.

```tsx
<DataTableShell<User>
  enableServerQuery
  ...
  tabs={[
    { label: 'All' },
    { label: 'Active',    filter: { status: 'active' } },
    { label: 'Suspended', filter: { status: 'suspended' } },
  ]}
/>
```

When a tab is switched, the store resets (page → 1, search cleared, selection cleared) and then the tab's `filter` is applied. This prevents stale pagination state from carrying over between tabs.

A tab can have both `filter` (server) and `forceFilter` (client) simultaneously — the server narrows the dataset, `forceFilter` narrows the rendered page further.

---

## Row actions

The shell renders a floating dark action bar at the bottom of the table whenever rows are selected.

```tsx
<DataTableShell<User>
  ...
  onDeleteClick={async (ids) => {
    await api.del({ endpoint: '/users/', ids });
    // Shell clears selection after this resolves
    // Call useInvalidateTable() here to trigger a refetch
  }}
  onEditClick={(record) => {
    // sustained mode: called instead of navigating
    openEditModal(record);
  }}
  onReviewClick={(record) => {
    // called for single-record review
    router.push(`/admin/users/${record.id}`);
  }}
/>
```

**Action visibility:**

| Action | Shown when                                                                       |
| ------ | -------------------------------------------------------------------------------- |
| Review | Always (unless `disableReviewButton`) — enabled only when exactly 1 row selected |
| Edit   | Exactly 1 row selected (unless `disableEditButton`)                              |
| Delete | Always (unless `disableDeleteButton`)                                            |
| Clear  | Always                                                                           |

**After delete:** On success, the shell automatically clears the selection so the action bar disappears. The caller is responsible for calling `useInvalidateTable()` to trigger a refetch and for showing a success/error notification.

**Disable individual actions:**

```tsx
<DataTableShell
  disableEditButton
  disableReviewButton
  // or disableActions to hide the entire bar
/>
```

---

## Sustained mode (modal-based actions)

When `sustained={true}`, the New and Edit buttons trigger callbacks instead of navigating. Use this for table pages that open a modal instead of routing to a separate page.

```tsx
const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
const [editRecord, setEditRecord] = useState<User | null>(null);

<DataTableShell<User>
  ...
  sustained
  onNewClick={openCreate}
  onEditClick={(record) => setEditRecord(record)}
/>
```

In sustained mode, `basePath` is still used for the Review action bar button (single-record review navigates to `${basePath}/${id}`).

---

## Force filter

A global `forceFilter` prop applies after the tab-level `forceFilter`:

```tsx
<DataTableShell<Invoice>
  ...
  forceFilter={(rows) => rows.filter((r) => r.amount > 0)}
/>
```

> **Note:** `forceFilter` is applied client-side after the wrapper paginates the data. In server mode with `enableServerQuery`, prefer using tab `filter` or `forceFilters` prop instead to narrow the server response before pagination.

---

## `forceFilters` — always-on server filters

Pass `forceFilters` to merge permanent filter parameters into every server query. These are never cleared by tab switches or store resets.

```tsx
<DataTableShell<Invoice>
  enableServerQuery
  forceFilters={{ companyId: currentUser.companyId }}
  ...
/>
```

---

## Column visibility from code

To programmatically hide a column on initial load without user interaction, set `defaultVisible: false` on the column definition. This value is used as the fallback before any user preference is saved.

Once the user has set a preference for that column, the saved value in `localStorage` takes precedence over `defaultVisible`.

To reset all column visibility back to defaults, the user can click **Reset to default** in the Columns popover. This does not clear `localStorage` permanently — it writes the `defaultVisible` values back to the store, which then gets persisted.

---

## Row styling

```tsx
<DataTableShell<Order>
  ...
  rowStyle={(row) =>
    row.status === 'cancelled'
      ? { opacity: 0.5, textDecoration: 'line-through' }
      : {}
  }
/>
```

---

## Row expansion

Pass a `DataTableRowExpansionProps<T>` object to enable mantine-datatable's native row expansion:

```tsx
<DataTableShell<Order>
  ...
  rowExpansion={{
    allowMultiple: false,
    content: ({ record }) => (
      <Box p="md">
        <Text size="sm">Internal notes: {record.notes}</Text>
      </Box>
    ),
  }}
/>
```

---

## Accessing the table store from outside

Use `useTableStore()` and `useTableData()` anywhere inside the same `DataTableShell` subtree:

```tsx
function OrderTotals() {
  const { rows } = useTableData<Order>();
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  return <Text>Subtotal: {total}</Text>;
}

// Render inside the shell via a prop or as a sibling to shell children
```

Because `DataTableShell` renders `DataTableWrapper` internally, these hooks only work inside components that are rendered as **descendants** of `DataTableShell`. If you need to access table state from a sibling, use `DataTableWrapper` directly and put `DataTableShell` (without the wrapper) inside it — contact the team if you need this pattern.

---

## Invalidating after mutations

```tsx
import { useInvalidateTable } from "@peppermint/admin";

function DeleteButton({ ids }: { ids: number[] }) {
  const invalidate = useInvalidateTable();

  const handleDelete = async () => {
    await api.del({ endpoint: "/users/", ids });
    invalidate(); // triggers React Query refetch
  };

  return <Button onClick={handleDelete}>Delete</Button>;
}
```

Pass this to `onDeleteClick` so the table refreshes after a successful deletion:

```tsx
const invalidate = useInvalidateTable();

<DataTableShell
  onDeleteClick={async (ids) => {
    await api.del({ endpoint: "/users/", ids });
    invalidate();
  }}
/>;
```

---

## `DataTableShell` props reference

### DataTableWrapper passthrough props

| Prop                | Type                            | Default  | Notes                                                             |
| ------------------- | ------------------------------- | -------- | ----------------------------------------------------------------- |
| `queryKey`          | `string`                        | —        | Dot-notation key, e.g. `'users.list'`                             |
| `queryGetFn`        | `(params?) => Promise<unknown>` | —        | API call. Receives `QueryParams` when `enableServerQuery` is true |
| `dataKey`           | `string`                        | —        | Dot-path into response to rows array, e.g. `'data.items'`         |
| `paginationKey`     | `string`                        | —        | Dot-path to object with `total` field, e.g. `'meta'`              |
| `enableServerQuery` | `boolean`                       | `false`  | Send page/search/sort/filters to server on every change           |
| `initialSearch`     | `string`                        | —        | Seeds the search box once on mount (`?q=` deep links)             |
| `defaultPageSize`   | `number`                        | `20`     | Initial rows per page                                             |
| `staleTime`         | `number`                        | `300000` | React Query staleTime in ms (5 min)                               |
| `debounceMs`        | `number`                        | `300`    | Debounce delay before search/filter changes fire a server request |
| `forceFilters`      | `FilterState`                   | —        | Merged into every server query, never reset                       |
| `onError`           | `(error: Error) => void`        | —        | Called on query failure                                           |

### Shell props

| Prop                   | Type                                              | Default          | Notes                                                  |
| ---------------------- | ------------------------------------------------- | ---------------- | ------------------------------------------------------ |
| `columns`              | `DataTableShellColumn<T>[]`                       | —                | Column definitions                                     |
| `moduleInfo`           | `DataTableShellModuleInfo`                        | —                | `{ name, label?, description? }`                       |
| `idAccessor`           | `string`                                          | `'id'`           | Row unique key field                                   |
| `basePath`             | `string`                                          | —                | Base URL for New/Edit/Review navigation                |
| `tabs`                 | `DataTableShellTab[]`                             | `[]`             | Tab filter buttons                                     |
| `newButtonHref`        | `string`                                          | —                | Overrides `${basePath}/new` for the Add button         |
| `onNewClick`           | `() => void`                                      | —                | Called instead of navigating in sustained mode         |
| `disableCreateButton`  | `boolean`                                         | `false`          | Disables the Add button                                |
| `onDeleteClick`        | `(ids: Array<string \| number>) => Promise<void>` | —                | Called with selected row IDs                           |
| `onEditClick`          | `(record: T) => void`                             | —                | Called in sustained mode; navigates otherwise          |
| `onReviewClick`        | `(record: T) => void`                             | —                | Called for single-record review; navigates otherwise   |
| `disableEditButton`    | `boolean`                                         | `false`          | Hides Edit from the action bar                         |
| `disableDeleteButton`  | `boolean`                                         | `false`          | Hides Delete from the action bar                       |
| `disableReviewButton`  | `boolean`                                         | `false`          | Hides Review from the action bar                       |
| `pageSizes`            | `number[]`                                        | `[10,20,50,100]` | Available page-size options                            |
| `forceFilter`          | `(rows: T[]) => T[]`                              | —                | Client-side post-filter applied after tab forceFilter  |
| `rowStyle`             | `(record: T, index: number) => CSSProperties`     | —                | Per-row inline style                                   |
| `rowExpansion`         | `DataTableRowExpansionProps<T>`                   | —                | mantine-datatable row expansion config                 |
| `hideToolbar`          | `boolean`                                         | `false`          | Hides the entire toolbar (tabs, icons)                 |
| `disableActions`       | `boolean`                                         | `false`          | Hides the selection action bar and disables checkboxes |
| `sustained`            | `boolean`                                         | `false`          | Add/Edit trigger callbacks instead of navigating       |
| `headerRight`          | `ReactNode`                                       | —                | Extra content in the ModuleHeader right slot           |
| `moduleAccess`         | `DataTableShellModuleAccess`                      | —                | Roles and accounts shown in the Access popover         |
| `onModuleAccessChange` | `(change) => void`                                | —                | Invite / edit permission callbacks                     |
| `lastEditedAt`         | `string \| Date`                                  | —                | Explicit edited timestamp for the header label         |
| `shareUrl`             | `string`                                          | current URL      | URL shown in Access popover footer                     |
| `hideAccessMenu`       | `boolean`                                         | `false`          | Hides the Access dropdown                              |

### `DataTableShellModuleInfo`

| Field         | Type     | Notes                                                 |
| ------------- | -------- | ----------------------------------------------------- |
| `name`        | `string` | Used as the localStorage persistence key              |
| `label`       | `string` | Display label shown in the header. Defaults to `name` |
| `description` | `string` | Subtitle shown under the title in the header          |

### `DataTableShellTab`

| Field         | Type                 | Notes                                                       |
| ------------- | -------------------- | ----------------------------------------------------------- |
| `label`       | `string`             | Button label                                                |
| `filter`      | `FilterState`        | Merged into `setFilters` when tab is selected (server mode) |
| `forceFilter` | `(rows: T[]) => T[]` | Applied client-side after wrapper resolves rows             |

---

## Common mistakes

**Forgetting `key` on columns with non-string accessors**

`DataTableShellColumn` uses `col.key ?? String(col.accessor)` as the visibility map key. If two columns have the same accessor, toggling one will toggle both. Always provide a unique `key`.

**Using `forceFilter` in server mode with pagination**

`forceFilter` runs after the wrapper paginates. If you filter out rows on the current page, the displayed count will be lower than `pageSize` even when more records exist on the server. In server mode, use `tab.filter` or `forceFilters` instead to narrow the query before pagination.

**Calling `useTableStore()` outside `DataTableShell`**

These hooks require a `DataTableWrapper` ancestor. They throw if called outside one. If you need store access from a parent component, lift the `DataTableWrapper` above the shell and pass `children` — contact the team for this edge case.

**Not calling `invalidate()` after mutations**

The shell clears selection after `onDeleteClick` resolves, but it does not automatically refetch. Call `useInvalidateTable()` inside `onDeleteClick` to trigger a refetch.
