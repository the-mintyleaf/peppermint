# moduleApiCall — Usage Examples

## Installation

Already included in `@zetsel/api-client` — no separate import needed:

```typescript
import { getRecords, createRecord, editRecord, deleteRecord } from '@zetsel/api-client';
```

---

## With React Query (recommended pattern)

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRecords,
  getSingleRecord,
  createRecord,
  editRecord,
  deleteRecord,
} from '@zetsel/api-client';

const USERS_URL = '/api/users';

// --- Queries ---

function useUsers(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getRecords<User>(USERS_URL, params),
    select: (res) => res.data ?? [],
  });
}

function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getSingleRecord<User>(USERS_URL, id),
    select: (res) => res.data,
  });
}

// --- Mutations ---

function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserBody) => createRecord<User>(USERS_URL, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

function useEditUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<User> }) =>
      editRecord<User>(USERS_URL, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRecord(USERS_URL, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
```

---

## Batch operations

```typescript
import { createGroupRecords, editGroupRecords, deleteGroupRecords } from '@zetsel/api-client';

// Import 50 users at once
await createGroupRecords<User>('/api/users/batch', usersFromCSV);

// Bulk update statuses
await editGroupRecords<User>('/api/users/batch', [
  { id: 1, status: 'active' },
  { id: 2, status: 'inactive' },
]);

// Bulk delete
await deleteGroupRecords('/api/users', selectedIds);
```

---

## Error handling

All functions return `ApiResponse<T>` — always check `result.ok`:

```typescript
const result = await createRecord<User>('/api/users', body);
if (!result.ok) {
  triggerNotification.error(result.message);
  return;
}
// result.data is typed as User | null
const user = result.data;
```
