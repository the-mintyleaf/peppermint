# ModalTableShell

A shell component that wraps `DataTableShell` and adds full CRUD modal management—create, edit, and delete operations happen in Mantine modals without navigating away from the table.

## Usage

```tsx
import { ModalTableShell, type ModalTableShellProps, type ModalFormComponentProps } from '@zetsel/admin';

interface User {
  id: string;
  name: string;
  email: string;
}

function UserFormModal(props: ModalFormComponentProps<User>) {
  const { initialValues, onSubmit, isLoading } = props;
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit({ id: initialValues?.id ?? '', name: '', email: '' });
    }}>
      {/* form fields */}
      <button disabled={isLoading}>Save</button>
    </form>
  );
}

export function UsersModule() {
  return (
    <ModalTableShell<User>
      queryKey="users"
      queryGetFn={async (params) => {
        const res = await api.get('/users', { params });
        return res.data;
      }}
      moduleInfo={{ name: 'User', label: 'Users' }}
      columns={[
        { accessor: 'id', title: 'ID', hidden: true },
        { accessor: 'name', title: 'Name' },
        { accessor: 'email', title: 'Email' },
      ]}
      idAccessor="id"
      
      // CRUD handlers
      createFormComponent={UserFormModal}
      editFormComponent={UserFormModal}
      onCreateApi={async (values) => {
        await api.post('/users', values);
      }}
      onEditApi={async (values, record) => {
        await api.put(`/users/${record.id}`, values);
      }}
      onDeleteApi={async (id) => {
        await api.delete(`/users/${id}`);
      }}
      
      // Success callbacks
      onCreateSuccess={() => {
        // optional: run custom logic after create
      }}
      onEditSuccess={() => {
        // optional: run custom logic after edit
      }}
      onDeleteSuccess={() => {
        // optional: run custom logic after delete
      }}
    />
  );
}
```

## Props

### Core Table Props (pass through to `DataTableShell`)

- `queryKey: string` — React Query cache key (e.g., `"users"`)
- `queryGetFn: (params?: QueryParams) => Promise<unknown>` — fetches table data
- `moduleInfo: DataTableShellModuleInfo` — name, label, description for display
- `columns: DataTableShellColumn<T>[]` — table columns
- `idAccessor?: string` — field containing unique record ID (default: `"id"`)
- `tabs?: DataTableShellTab[]` — optional filter tabs
- `forceFilter?: (rows: T[]) => T[]` — client-side row filter
- `rowStyle?: (record: T, index) => CSSProperties` — row styling
- `rowExpansion?: DataTableRowExpansionProps<T>` — expandable rows
- `hideToolbar?: boolean` — hide search/columns toolbar
- `disableActions?: boolean` — disable the floating action bar
- `pageSizes?: number[]` — pagination options

### Modal & Form Props

- `modalWidth?: number | string` — modal width (default: `"md"`)
- `createModalTitle?: string` — "New X" by default
- `editModalTitle?: string` — "Edit X" by default
- `createFormComponent?: React.ComponentType<ModalFormComponentProps<T>>` — form for create modal
- `editFormComponent?: React.ComponentType<ModalFormComponentProps<T>>` — form for edit modal

### CRUD API Props

- `onCreateApi?: (values: unknown) => Promise<unknown>` — submit create form
- `onEditApi?: (values: unknown, record: T) => Promise<unknown>` — submit edit form
- `onDeleteApi?: (id: string | number) => Promise<unknown>` — delete a record

### CRUD Callbacks

- `onCreateSuccess?: (result: unknown) => void` — fires after successful create
- `onEditSuccess?: (result: unknown) => void` — fires after successful edit
- `onDeleteSuccess?: () => void` — fires after successful delete

### Advanced Props

- `onEditTrigger?: (record: T) => Promise<T>` — async fetch/enrich record before opening edit modal. Opens modal immediately and shows a `<Loader>` while the promise resolves.
- `transformOnCreate?: (values: T) => unknown` — transform form values before sending to `onCreateApi`
- `transformOnEdit?: (values: T, record: T) => unknown` — transform form values before sending to `onEditApi`
- `transformOnDelete?: (id: string | number) => unknown` — transform id before sending to `onDeleteApi`

### Review & Review Button

- `onReviewClick?: (record: T) => void` — callback when review button is clicked
- `disableReviewButton?: boolean` — disable the review button

## Form Component Contract

Form components passed to `createFormComponent` and `editFormComponent` must match `ModalFormComponentProps<T>`:

```ts
interface ModalFormComponentProps<T extends Record<string, unknown>> {
  initialValues?: Partial<T>;
  onSubmit: (values: T) => void;
  isLoading: boolean;
}
```

- **`initialValues`** — undefined for create, pre-populated record for edit
- **`onSubmit`** — call this when form submission is confirmed; shell handles API call
- **`isLoading`** — true while the mutation is pending; disable form inputs/buttons

### Example Form

```tsx
import { Stack, TextInput, Button } from '@zetsel/ui';
import { useForm } from '@zetsel/ui';

interface UserFormProps extends ModalFormComponentProps<User> {}

export function UserForm({ initialValues, onSubmit, isLoading }: UserFormProps) {
  const form = useForm({
    initialValues: initialValues ?? { name: '', email: '' },
    onSubmit,
  });

  return (
    <form onSubmit={form.onSubmit}>
      <Stack gap="md">
        <TextInput
          label="Name"
          {...form.getInputProps('name')}
          disabled={isLoading}
        />
        <TextInput
          label="Email"
          {...form.getInputProps('email')}
          disabled={isLoading}
        />
        <Button type="submit" loading={isLoading}>
          Save
        </Button>
      </Stack>
    </form>
  );
}
```

## Async Record Enrichment with `onEditTrigger`

Use `onEditTrigger` when you need to fetch additional details before opening the edit modal:

```tsx
<ModalTableShell
  editFormComponent={UserForm}
  onEditTrigger={async (record) => {
    // Fetch full record details from API
    const { data } = await api.get(`/users/${record.id}`);
    return data;
  }}
  onEditApi={async (values, record) => {
    await api.put(`/users/${record.id}`, values);
  }}
  // ...
/>
```

The modal opens immediately with a spinner inside. Once the promise resolves, the form is populated with the enriched data.

## Context Hook

If you need to access modal state from nested components, use `useModalTableShellContext`:

```tsx
import { useModalTableShellContext } from '@zetsel/admin';

function MyNestedComponent() {
  const { isCreateModalOpen, openCreateModal, activeEditRecord } =
    useModalTableShellContext<User>();
  
  return (
    // use context values
  );
}
```

Must be used inside a `<ModalTableShell>`.

## Features

- ✅ Create, edit, delete with inline modals
- ✅ Confirmation dialog for delete (single & bulk)
- ✅ Async record enrichment on edit via `onEditTrigger`
- ✅ Value transforms before API calls
- ✅ Auto refetch after mutations
- ✅ Loading states and notifications
- ✅ Review/view mode button (passthrough from `DataTableShell`)
- ✅ Full TypeScript support
- ✅ Disabled button auto-derive from form presence
