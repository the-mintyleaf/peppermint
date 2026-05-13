# ModalModule — Usage Guide

A **ModalModule** is a CRUD admin module where the list, create, edit, and delete all live on a **single route**. Create and edit open in modals; no page navigation happens.

Use this when:
- The record form is simple enough to fit in a modal (< ~8 fields)
- You want the user to stay on the list after acting

Shell used: `DataTableModalShell`

---

## File structure

```
apps/<app-name>/
├── modules/
│   └── admin/
│       └── [module-name]/
│           ├── index.ts                  # re-exports everything public
│           ├── module.config.ts          # query key, API base URL, module title
│           ├── module.api.ts             # typed API call wrappers
│           ├── pages/
│           │   └── list/
│           │       ├── page.tsx          # the only page — mounts DataTableModalShell
│           │       └── list.columns.tsx  # ColumnDef array
│           └── form/
│               └── [ModuleName]Form.tsx  # shared form fields (no submit button)
└── app/
    └── admin/
        └── [module-name]/
            └── page.tsx                  # thin re-export of modules/.../list/page.tsx
```

---

## Step-by-step

### 1. `module.config.ts`

```ts
export const MODULE_KEY = 'users';
export const MODULE_API = '/api/users';
export const MODULE_TITLE = 'Users';
```

### 2. `module.api.ts`

```ts
import { getRecords, createRecord, editRecord, deleteRecord } from '@zetsel/api-client';
import { MODULE_API } from './module.config';
import type { User, CreateUserInput, EditUserInput } from './index';

export const userApi = {
  list: (params?: Record<string, unknown>) =>
    getRecords<User>(MODULE_API, params),

  create: (data: CreateUserInput) =>
    createRecord<User>(MODULE_API, data),

  edit: (id: string | number, data: EditUserInput) =>
    editRecord<User>(MODULE_API, id, data),

  delete: (id: string | number) =>
    deleteRecord(MODULE_API, id),
};
```

### 3. `list/list.columns.tsx`

```tsx
import type { ColumnDef } from '@zetsel/admin';
import type { User } from '../../index';

export const userColumns: ColumnDef<User>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  {
    key: 'status',
    label: 'Status',
    render: (val: unknown) => (
      <Badge color={val === 'active' ? 'green' : 'gray'}>{String(val)}</Badge>
    ),
  },
];
```

### 4. `form/UserForm.tsx`

IMPORTANT: When building any form, always design it with a clear structure, logical field grouping, and strong usability principles to ensure an intuitive, efficient, and user-friendly experience. Organize related fields into meaningful sections, maintain consistent spacing and hierarchy, and prioritize clarity and ease of completion. Field placeholders should use realistic, relatable, and context-aware examples that help users immediately understand the expected input format.

Fields only — no submit button. Rendered inside modals by `DataTableModalShell`.

```tsx
import { Stack, TextInput, Select } from '@zetsel/ui';
import { useFormInstance } from '@zetsel/admin';
import type { CreateUserInput } from '../../index';

export function UserForm() {
  const { form } = useFormInstance<CreateUserInput>();
  return (
    <Stack gap="md">
      <TextInput label="Name" required {...form.getInputProps('name')} />
      <TextInput label="Email" required type="email" {...form.getInputProps('email')} />
      <Select
        label="Role"
        data={[{ value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }]}
        {...form.getInputProps('role')}
      />
    </Stack>
  );
}
```

If the edit form needs to show read-only data from the record (not just field values), accept the record as a prop:

```tsx
export function UserEditForm({ record }: { record: User }) {
  const { form } = useFormInstance<EditUserInput>();
  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">Editing: {record.email}</Text>
      <TextInput label="Name" required {...form.getInputProps('name')} />
    </Stack>
  );
}
```

### 5. `pages/list/page.tsx`

```tsx
import { DataTableModalShell } from '@zetsel/admin';
import { MODULE_KEY, MODULE_TITLE } from '../../module.config';
import { userApi } from '../../module.api';
import { userColumns } from './list.columns';
import { UserForm } from '../../form/UserForm';
import type { User, CreateUserInput, EditUserInput } from '../../index';

const CREATE_INITIAL: CreateUserInput = { name: '', email: '', role: 'user' };

export function UserListPage() {
  return (
    <DataTableModalShell<User, CreateUserInput, EditUserInput>
      moduleInfo={{ title: MODULE_TITLE }}
      queryKey={MODULE_KEY}
      queryGetFn={userApi.list}
      columns={userColumns}
      idAccessor="id"
      onCreateApi={userApi.create}
      onEditApi={userApi.edit}
      onDeleteApi={userApi.delete}
      createFormComponent={UserForm}
      editFormComponent={UserForm}
      createInitial={CREATE_INITIAL}
      editInitial={(r) => ({ name: r.name, email: r.email, role: r.role })}
    />
  );
}
```

### 6. `app/admin/[module-name]/page.tsx`

```tsx
import { UserListPage } from '../../../modules/admin/users/pages/list/page';
export default UserListPage;
```

### 7. `index.ts`

```ts
// Types
export type { User } from './user.types';
export type { CreateUserInput, EditUserInput } from './user.types';

// Public API (optional — expose if other modules need these)
export { userApi } from './module.api';
export { userColumns } from './pages/list/list.columns';
```

---

## Adding filters

Define `FilterDef[]` in `list.columns.tsx` alongside the column definitions and pass to `filterList`:

```tsx
import type { FilterDef } from '@zetsel/admin';

export const userFilters: FilterDef[] = [
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    options: [{ value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }],
  },
];
```

```tsx
<DataTableModalShell
  ...
  filterList={userFilters}
/>
```

---

## Adding Zod validation to forms

Pass schemas via the `FormWrapper` — but `DataTableModalShell` doesn't expose a `validation` prop directly. Validate inside the API call instead, or extend the shell:

```ts
// module.api.ts
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
  role: z.string().min(1, 'Required'),
});

export const userApi = {
  create: (data: CreateUserInput) => {
    const parsed = createSchema.safeParse(data);
    if (!parsed.success) {
      return Promise.resolve({ ok: false, status: 422, data: null, message: parsed.error.issues[0].message });
    }
    return createRecord<User>(MODULE_API, parsed.data);
  },
  // ...
};
```
