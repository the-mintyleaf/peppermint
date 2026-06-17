# RouteModule — Usage Guide

A **RouteModule** is a CRUD admin module where each operation lives on its **own route**. The list is at `/[module]`, create at `/[module]/new`, edit at `/[module]/[id]/edit`, and the detail view at `/[module]/[id]`.

Use this when:
- The record form is complex (many fields, multi-step, file uploads)
- You want a dedicated detail/profile view for a record
- Deep-linking to a specific record or form state matters

Shells used: `DataTableShell` (list) · `FormShell` (new/edit)

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
│           │   ├── list/
│           │   │   ├── page.tsx          # list page — mounts DataTableShell
│           │   │   └── list.columns.tsx  # ColumnDef array
│           │   ├── new/
│           │   │   └── page.tsx          # create page — mounts FormShell
│           │   ├── edit/
│           │   │   └── page.tsx          # edit page — fetches record, mounts FormShell
│           │   └── view/
│           │       └── page.tsx          # detail/profile page — read-only
│           └── form/
│               └── [ModuleName]Form.tsx  # shared form fields (used by new + edit)
└── app/
    └── admin/
        └── [module-name]/
            ├── page.tsx                  # → modules/.../list/page.tsx
            ├── new/
            │   └── page.tsx              # → modules/.../new/page.tsx
            └── [id]/
                ├── edit/
                │   └── page.tsx          # → modules/.../edit/page.tsx
                └── page.tsx              # → modules/.../view/page.tsx
```

---

## Step-by-step

### 1. `module.config.ts`

```ts
export const MODULE_KEY = 'users';
export const MODULE_API = '/api/users';
export const MODULE_TITLE = 'Users';
export const MODULE_ROOT = '/admin/users';
```

### 2. `module.api.ts`

```ts
import { getRecords, getSingleRecord, createRecord, editRecord, deleteRecord } from '@peppermint/api-client';
import { MODULE_API } from './module.config';
import type { User, CreateUserInput, EditUserInput } from './index';

export const userApi = {
  list: (params?: Record<string, unknown>) =>
    getRecords<User>(MODULE_API, params),

  get: (id: string | number) =>
    getSingleRecord<User>(MODULE_API, id),

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
import type { ColumnDef } from '@peppermint/admin';
import type { User } from '../../index';

export const userColumns: ColumnDef<User>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
];
```

### 4. `form/UserForm.tsx`

Shared between the new and edit pages. Fields only — `FormShell` provides the submit button.

```tsx
import { Stack, TextInput, Select, Textarea } from '@peppermint/ui';
import { useFormInstance } from '@peppermint/admin';
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
      <Textarea label="Bio" {...form.getInputProps('bio')} />
    </Stack>
  );
}
```

### 5. `pages/list/page.tsx`

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { DataTableShell } from '@peppermint/admin';
import { triggerNotification } from '@peppermint/admin';
import { deleteRecord } from '@peppermint/api-client';
import { MODULE_KEY, MODULE_TITLE, MODULE_API, MODULE_ROOT } from '../../module.config';
import { userApi } from '../../module.api';
import { userColumns } from './list.columns';
import type { User } from '../../index';

export function UserListPage() {
  const router = useRouter();

  async function handleDelete(ids: Array<string | number>) {
    const results = await Promise.all(ids.map((id) => deleteRecord(MODULE_API, id)));
    const failed = results.filter((r) => !r.ok);
    if (failed.length > 0) {
      triggerNotification.error(failed[0].message || 'Delete failed');
    } else {
      triggerNotification.success(`${ids.length} record(s) deleted`);
    }
  }

  return (
    <DataTableShell<User>
      moduleInfo={{ title: MODULE_TITLE }}
      queryKey={MODULE_KEY}
      queryGetFn={userApi.list}
      columns={userColumns}
      idAccessor="id"
      onNewClick={() => router.push(`${MODULE_ROOT}/new`)}
      onEditClick={(id) => router.push(`${MODULE_ROOT}/${id}/edit`)}
      onDeleteClick={handleDelete}
    />
  );
}
```

### 6. `pages/new/page.tsx`

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { FormShell } from '@peppermint/admin';
import { MODULE_TITLE, MODULE_ROOT } from '../../module.config';
import { userApi } from '../../module.api';
import { UserForm } from '../../form/UserForm';
import type { CreateUserInput } from '../../index';

const INITIAL: CreateUserInput = { name: '', email: '', role: 'user', bio: '' };

export function UserNewPage() {
  const router = useRouter();
  return (
    <FormShell<CreateUserInput>
      title={`New ${MODULE_TITLE.slice(0, -1)}`}
      bread={[{ label: MODULE_TITLE, href: MODULE_ROOT }, { label: 'New' }]}
      initial={INITIAL}
      apiSubmitFn={userApi.create}
      submitSuccessFn={() => router.push(MODULE_ROOT)}
      onCancel={() => router.push(MODULE_ROOT)}
      hasDirtCheck
    >
      <UserForm />
    </FormShell>
  );
}
```

### 7. `pages/edit/page.tsx`

Fetch the record server-side (or via `useQuery`) to seed `initial`:

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FormShell } from '@peppermint/admin';
import { MODULE_KEY, MODULE_TITLE, MODULE_ROOT } from '../../module.config';
import { userApi } from '../../module.api';
import { UserForm } from '../../form/UserForm';
import type { EditUserInput } from '../../index';

export function UserEditPage({ id }: { id: string }) {
  const router = useRouter();

  const { data, isPending } = useQuery({
    queryKey: [MODULE_KEY, id],
    queryFn: () => userApi.get(id),
  });

  if (isPending || !data?.data) return null;

  const record = data.data;
  const initial: EditUserInput = { name: record.name, email: record.email, role: record.role, bio: record.bio };

  return (
    <FormShell<EditUserInput>
      title={`Edit ${MODULE_TITLE.slice(0, -1)}`}
      bread={[
        { label: MODULE_TITLE, href: MODULE_ROOT },
        { label: record.name, href: `${MODULE_ROOT}/${id}` },
        { label: 'Edit' },
      ]}
      initial={initial}
      apiSubmitFn={(data) => userApi.edit(id, data)}
      submitSuccessFn={() => router.push(`${MODULE_ROOT}/${id}`)}
      onCancel={() => router.push(`${MODULE_ROOT}/${id}`)}
      hasDirtCheck
    >
      <UserForm />
    </FormShell>
  );
}
```

### 8. `pages/view/page.tsx`

Read-only detail view — no shell, build with standard Mantine layout:

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button, Group, Stack, Text, Title } from '@peppermint/ui';
import { MODULE_KEY, MODULE_ROOT } from '../../module.config';
import { userApi } from '../../module.api';

export function UserViewPage({ id }: { id: string }) {
  const router = useRouter();

  const { data, isPending } = useQuery({
    queryKey: [MODULE_KEY, id],
    queryFn: () => userApi.get(id),
  });

  if (isPending || !data?.data) return null;
  const record = data.data;

  return (
    <Stack gap="lg" p="md">
      <Group justify="space-between">
        <Title order={3}>{record.name}</Title>
        <Button onClick={() => router.push(`${MODULE_ROOT}/${id}/edit`)}>Edit</Button>
      </Group>
      <Text>{record.email}</Text>
      <Text c="dimmed">{record.bio}</Text>
    </Stack>
  );
}
```

### 9. App Router page files

Each is a one-liner:

```tsx
// app/admin/users/page.tsx
import { UserListPage } from '../../../modules/admin/users/pages/list/page';
export default UserListPage;

// app/admin/users/new/page.tsx
import { UserNewPage } from '../../../modules/admin/users/pages/new/page';
export default UserNewPage;

// app/admin/users/[id]/edit/page.tsx
import { UserEditPage } from '../../../../modules/admin/users/pages/edit/page';
export default function Page({ params }: { params: { id: string } }) {
  return <UserEditPage id={params.id} />;
}

// app/admin/users/[id]/page.tsx
import { UserViewPage } from '../../../../modules/admin/users/pages/view/page';
export default function Page({ params }: { params: { id: string } }) {
  return <UserViewPage id={params.id} />;
}
```

### 10. `index.ts`

```ts
export type { User, CreateUserInput, EditUserInput } from './user.types';
export { userApi } from './module.api';
export { userColumns } from './pages/list/list.columns';
```

---

## Multi-step form variant

IMPORTANT: When building any form, always design it with a clear structure, logical field grouping, and strong usability principles to ensure an intuitive, efficient, and user-friendly experience. Organize related fields into meaningful sections, maintain consistent spacing and hierarchy, and prioritize clarity and ease of completion. Field placeholders should use realistic, relatable, and context-aware examples that help users immediately understand the expected input format.

If the form is long, pass `steps` to `FormShell` and render conditionally by `current`:

```tsx
import { useFormControls } from '@peppermint/admin';

function UserFormSteps() {
  const { current } = useFormControls();
  return (
    <>
      {current === 0 && <UserBasicFields />}
      {current === 1 && <UserRoleFields />}
      {current === 2 && <UserBioFields />}
    </>
  );
}

// In new/page.tsx:
<FormShell<CreateUserInput>
  ...
  steps={['Basic Info', 'Role', 'Profile']}
>
  <UserFormSteps />
</FormShell>
```

Per-step Zod validation: pass a sparse array to `validation` where index = step index.
