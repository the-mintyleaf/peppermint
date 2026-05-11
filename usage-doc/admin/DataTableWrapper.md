# DataTableWrapper — Usage Examples

## Basic table with React Query

```tsx
import { DataTableWrapper, useDataTableContext, useDataTableStore } from '@zetsel/admin';
import { getRecords } from '@zetsel/api-client';

function UsersTable() {
  return (
    <DataTableWrapper<User>
      queryKey="users"
      queryGetFn={(params) => getRecords<User>('/api/users', params)}
      pageSizes={[20, 50, 100]}
    >
      <TableBody />
      <TablePagination />
    </DataTableWrapper>
  );
}

function TableBody() {
  const { rows, isLoading } = useDataTableContext<User>();
  const selectedIds = useDataTableStore((s) => s.selectedIds);

  if (isLoading) return <div>Loading…</div>;
  return (
    <table>
      {rows.map((row) => (
        <tr key={row.id} className={selectedIds.includes(row.id) ? 'selected' : ''}>
          <td>{row.name}</td>
        </tr>
      ))}
    </table>
  );
}

function TablePagination() {
  const { total } = useDataTableContext<User>();
  const page = useDataTableStore((s) => s.page);
  const pageSize = useDataTableStore((s) => s.pageSize);
  const setPage = useDataTableStore((s) => s.setPage);

  return (
    <div>
      Page {page} of {Math.ceil(total / pageSize)}
      <button onClick={() => setPage(page + 1)}>Next</button>
    </div>
  );
}
```

---

## After a mutation — invalidate the table cache

```tsx
import { useMutation } from '@tanstack/react-query';
import { useInvalidateTable } from '@zetsel/admin';
import { deleteRecord } from '@zetsel/api-client';

function DeleteButton({ userId }: { userId: number }) {
  const invalidate = useInvalidateTable('users');

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteRecord('/api/users', userId),
    onSuccess: () => invalidate(),
  });

  return <button disabled={isPending} onClick={() => mutate()}>Delete</button>;
}
```

---

## Server-side pagination with custom response mapping

```tsx
<DataTableWrapper<Product>
  queryKey="products"
  queryGetFn={(params) => api.get({ url: '/api/products', params })}
  paginationResponseFn={(res) => ({
    page: res.data.meta.current_page,
    pageSize: res.data.meta.per_page,
    total: res.data.meta.total,
    totalPages: res.data.meta.last_page,
  })}
>
  {/* sub-components */}
</DataTableWrapper>
```

---

## Force filter (always applied, never shown in UI)

```tsx
// Only show records belonging to the current tenant
<DataTableWrapper<Order>
  queryKey="orders"
  queryGetFn={(params) => getRecords<Order>('/api/orders', params)}
  forceFilter={{ tenantId: currentTenantId }}
>
  {/* filters shown to user won't include tenantId */}
</DataTableWrapper>
```

---

## Selector discipline

Always select the minimum slice to avoid unnecessary re-renders:

```tsx
// Table header — only cares about search
const search = useDataTableStore((s) => s.search);
const setSearch = useDataTableStore((s) => s.setSearch);

// Toolbar — only cares about selection count
const selectionCount = useDataTableStore((s) => s.selectedIds.length);

// Never do this — subscribes to the entire store
const everything = useDataTableStore((s) => s);
```
