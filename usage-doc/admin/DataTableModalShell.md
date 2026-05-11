# DataTableModalShell — Usage Examples

## Minimal usage

```tsx
import { DataTableModalShell, useFormInstance } from '@zetsel/admin';
import { getRecords, createRecord, editRecord, deleteRecord } from '@zetsel/api-client';
import { TextInput } from '@zetsel/ui';
import type { ColumnDef } from '@zetsel/admin';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserInput {
  name: string;
  email: string;
}

const columns: ColumnDef<User>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
];

function UserForm() {
  const { form } = useFormInstance<UserInput>();
  return (
    <>
      <TextInput label="Name" {...form.getInputProps('name')} />
      <TextInput label="Email" {...form.getInputProps('email')} />
    </>
  );
}

export default function UsersPage() {
  return (
    <DataTableModalShell<User, UserInput, UserInput>
      moduleInfo={{ title: 'Users' }}
      queryKey="users"
      queryGetFn={(params) => getRecords<User>('/api/users', params)}
      columns={columns}
      idAccessor="id"
      onCreateApi={(data) => createRecord('/api/users', data)}
      onEditApi={(id, data) => editRecord('/api/users', id, data)}
      onDeleteApi={(id) => deleteRecord('/api/users', id)}
      createFormComponent={UserForm}
      editFormComponent={UserForm}
      createInitial={{ name: '', email: '' }}
      editInitial={(r) => ({ name: r.name, email: r.email })}
    />
  );
}
```

---

## Different create and edit forms

```tsx
interface CreateInput { name: string; email: string; password: string; }
interface EditInput { name: string; email: string; }

function CreateUserForm() {
  const { form } = useFormInstance<CreateInput>();
  return (
    <>
      <TextInput label="Name" {...form.getInputProps('name')} />
      <TextInput label="Email" {...form.getInputProps('email')} />
      <PasswordInput label="Password" {...form.getInputProps('password')} />
    </>
  );
}

function EditUserForm({ record }: { record: User }) {
  const { form } = useFormInstance<EditInput>();
  return (
    <>
      <TextInput label="Name" {...form.getInputProps('name')} />
      <TextInput label="Email" {...form.getInputProps('email')} />
      <Text size="sm" c="dimmed">Editing: {record.name}</Text>
    </>
  );
}

<DataTableModalShell<User, CreateInput, EditInput>
  ...
  createFormComponent={CreateUserForm}
  editFormComponent={EditUserForm}
  createInitial={{ name: '', email: '', password: '' }}
  editInitial={(r) => ({ name: r.name, email: r.email })}
/>
```

---

## With validation

```tsx
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email(),
  password: z.string().min(8, 'At least 8 characters'),
});

// Validation is passed via FormWrapper inside each modal.
// Wrap your API calls to thread validation through:
<DataTableModalShell
  ...
  onCreateApi={(data) => {
    const result = createSchema.safeParse(data);
    if (!result.success) return Promise.resolve({ ok: false, status: 422, data: null, message: 'Validation failed' });
    return createRecord('/api/users', result.data);
  }}
/>
```

---

## With filters and large modal

```tsx
import type { FilterDef } from '@zetsel/admin';

const filterList: FilterDef[] = [
  { key: 'role', label: 'Role', type: 'select', options: [
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' },
  ]},
];

<DataTableModalShell<User, UserInput, UserInput>
  ...
  filterList={filterList}
  modalSize="lg"
  pageSizes={[20, 50, 100]}
  onCreateSuccess={() => console.log('created')}
  onDeleteSuccess={() => console.log('deleted')}
/>
```
