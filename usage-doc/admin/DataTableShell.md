# DataTableShell — Usage Examples

## Minimal usage

```tsx
import { DataTableShell } from '@zetsel/admin';
import { getRecords } from '@zetsel/api-client';
import type { ColumnDef } from '@zetsel/admin';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columns: ColumnDef<User>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
];

export default function UsersPage() {
  return (
    <DataTableShell<User>
      moduleInfo={{ title: 'Users' }}
      queryKey="users"
      queryGetFn={(params) => getRecords<User>('/api/users', params)}
      columns={columns}
      idAccessor="id"
    />
  );
}
```

---

## Full usage with actions, filters, and pagination

```tsx
import { useRouter } from 'next/navigation';
import { DataTableShell, triggerNotification } from '@zetsel/admin';
import { deleteRecord, deleteGroupRecords, getRecords } from '@zetsel/api-client';
import type { ColumnDef, FilterDef } from '@zetsel/admin';

const columns: ColumnDef<User>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  {
    key: 'status',
    label: 'Status',
    render: (val) => <Badge color={val === 'active' ? 'green' : 'gray'}>{String(val)}</Badge>,
  },
];

const filterList: FilterDef[] = [
  { key: 'role', label: 'Role', type: 'select', options: [
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' },
  ]},
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]},
];

export default function UsersPage() {
  const router = useRouter();

  async function handleDelete(ids: Array<string | number>) {
    const result = ids.length === 1
      ? await deleteRecord('/api/users', ids[0])
      : await deleteGroupRecords('/api/users', ids);
    if (result.ok) {
      triggerNotification.success(`${ids.length} user(s) deleted.`);
    } else {
      triggerNotification.error(result.message);
    }
  }

  return (
    <DataTableShell<User>
      moduleInfo={{ title: 'Users', description: 'Manage user accounts' }}
      queryKey="users"
      queryGetFn={(params) => getRecords<User>('/api/users', params)}
      columns={columns}
      idAccessor="id"
      onNewClick={() => router.push('/users/new')}
      onEditClick={(id) => router.push(`/users/${id}/edit`)}
      onDeleteClick={handleDelete}
      filterList={filterList}
      pageSizes={[20, 50, 100]}
    />
  );
}
```

---

## Custom column renderer

```tsx
const columns: ColumnDef<Order>[] = [
  { key: 'id', label: 'Order #' },
  {
    key: 'total',
    label: 'Total',
    render: (val) => formatCurrency(Number(val)),
  },
  {
    key: 'createdAt',
    label: 'Date',
    render: (val) => formatDate(String(val)),
  },
];
```

---

## Row expansion

```tsx
<DataTableShell<User>
  ...
  rowExpansion={{
    render: (row) => (
      <Box p="sm">
        <Text size="sm">Last login: {formatDate(row.lastLogin)}</Text>
        <Text size="sm">Created: {formatDate(row.createdAt)}</Text>
      </Box>
    ),
  }}
/>
```

---

## CSV export button (alongside the shell)

```tsx
import { DataTableWrapper, DataTableShell, useExport } from '@zetsel/admin';

// useExport must be inside the DataTableWrapper tree.
// DataTableShell wraps internally, so use DataTableWrapper directly if you need external access.

function ExportButton() {
  const exportCSV = useExport(columns, 'users.csv');
  return <Button variant="outline" onClick={exportCSV}>Export CSV</Button>;
}

// Wrap manually to share the context:
export default function UsersPage() {
  return (
    <DataTableWrapper<User> queryKey="users" queryGetFn={...}>
      <TableHeader moduleInfo={...} />
      <ExportButton />
      {/* ... */}
    </DataTableWrapper>
  );
}
```
