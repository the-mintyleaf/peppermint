# DataTableModalShell — API Reference

Pre-built table page with create, edit, and delete modals wired up. Composes `DataTableShell` internally and manages modal open/close state.

---

## `DataTableModalShell<T, TCreate, TEdit>`

```typescript
<DataTableModalShell<User, CreateUserInput, EditUserInput>
  moduleInfo={{ title: 'Users' }}
  queryKey="users"
  queryGetFn={(params) => getRecords<User>('/api/users', params)}
  columns={columns}
  idAccessor="id"
  onCreateApi={(data) => createRecord('/api/users', data)}
  onEditApi={(id, data) => editRecord('/api/users', id, data)}
  onDeleteApi={(id) => deleteRecord('/api/users', id)}
  createFormComponent={CreateUserForm}
  editFormComponent={EditUserForm}
  createInitial={{ name: '', email: '' }}
  editInitial={(record) => ({ name: record.name, email: record.email })}
/>
```

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `moduleInfo` | `ModuleInfo` | Yes | `{ title, description? }` — shown in `TableHeader` |
| `queryKey` | `string` | Yes | React Query cache key; used for invalidation after mutations |
| `queryGetFn` | `(params?) => Promise<ApiResponse<T[]>>` | Yes | Data fetcher |
| `columns` | `ColumnDef<T>[]` | Yes | Column definitions |
| `idAccessor` | `keyof T & string` | Yes | Row identity key |
| `onCreateApi` | `(data: TCreate) => Promise<ApiResponse<unknown>>` | Yes | Called on create form submit |
| `onEditApi` | `(id, data: TEdit) => Promise<ApiResponse<unknown>>` | Yes | Called on edit form submit |
| `onDeleteApi` | `(id) => Promise<ApiResponse<void>>` | Yes | Called per-id during bulk/single delete |
| `createFormComponent` | `React.ComponentType` | Yes | Form fields component rendered inside create modal |
| `editFormComponent` | `React.ComponentType<{ record: T }>` | Yes | Form fields component rendered inside edit modal |
| `createInitial` | `TCreate` | Yes | Initial form values for create modal |
| `editInitial` | `(record: T) => TEdit` | Yes | Maps a record to edit form initial values |
| `filterList` | `FilterDef[]` | No | Passed to the underlying `DataTableShell` |
| `modalSize` | `string \| number` | No | Mantine modal size (default: `'md'`) |
| `pageSizes` | `number[]` | No | Passed to the underlying `DataTableShell` |
| `onCreateSuccess` | `(data) => void` | No | Called after successful create |
| `onEditSuccess` | `(data) => void` | No | Called after successful edit |
| `onDeleteSuccess` | `() => void` | No | Called after successful delete |

---

## Form components

`createFormComponent` and `editFormComponent` are `React.ComponentType` references (not JSX). They are rendered inside a `FormWrapper`, so they can call `useFormInstance()` and `useFormControls()` directly:

```typescript
function CreateUserForm() {
  const { form } = useFormInstance<CreateUserInput>();
  return (
    <>
      <TextInput label="Name" {...form.getInputProps('name')} />
      <TextInput label="Email" {...form.getInputProps('email')} />
    </>
  );
}
```

The submit button is provided by a `FormFooter` included automatically inside each modal.

---

## Modal behaviour

- **Create modal**: Clears form on success (`formClearOnSuccess`)
- **Edit modal**: Initialised from `editInitial(record)` each time the modal opens
- **Delete modal**: Fires `onDeleteApi` per id in parallel, shows error notification on failure, invalidates query on success
- All modals invalidate the table's React Query cache on success via `useInvalidateTable`
