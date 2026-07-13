# @peppermint/admin — Framework Primitives

Additive building blocks that absorb the boilerplate every list/CRUD module used to
hand-write. All are exported from `@peppermint/admin`.

## Data layer

### `createQueryKeys(resource)`

Typed, array-form query keys. Replaces the stringly-typed `"resource.list"` + the
`.split(".")` hack and the dual `list()`/`listKey()` forms.

```ts
export const grantKeys = createQueryKeys("permissions.grants");
useQuery({ queryKey: grantKeys.list(), queryFn: grantApi.list });
queryClient.invalidateQueries({ queryKey: grantKeys.lists() });
```

### `createResourceApi({ client, basePath, ... })`

Typed CRUD + action factory over a REST resource. Absorbs the identical paginated
fetches, the `meta.count → total` remap, and the `POST /:id/<verb>/` template. Inject
the app's Axios instance as `client`.

```ts
import api from "@/lib/api";
export const grantApi = createResourceApi<Grant, GrantCreatePayload>({
  client: api,
  basePath: "/api/v1/permissions/grants",
  defaultParams: { page_size: 200 }, // client-paginated module
});
// grantApi.list(params?) → { data, meta: { total } }
// grantApi.get(id) · create(body) · update(id, body) · remove(id) · action(id, "revoke")
```

Override `toServerParams` / `toListResponse` when a resource deviates from the
Peppermint convention.

### `useAppMutation(options)` + `configureAppMutations`

`useMutation` + success/error notifications + cache invalidation in one call. The
app's error-code → message resolver is injected once at boot:

```ts
// app boot (e.g. a client config module)
configureAppMutations({ getErrorMessage: getApiErrorMessage });

// in a component
const revoke = useAppMutation({
  mutationFn: () => grantApi.action(record.id, "revoke"),
  successMessage: "The grant no longer applies.",
  successTitle: "Grant revoked",
  errorTitle: "Couldn't revoke grant",
  invalidateKeys: [grantKeys.lists()],
});
revoke.mutate();
```

## Columns

`statusColumn`, `dateColumn`, `booleanColumn`, and the `<StatusBadge>` component
consolidate the copy-pasted status maps, date formatters, and Yes/No cells. Each
returns a `DataTableShellColumn<T>`; extra column props pass through.

```tsx
const columns: DataTableShellColumn<Grant>[] = [
  { accessor: "permission_key", title: "Permission", sortable: true },
  statusColumn<Grant, GrantStatus>("status", {
    colorMap: { active: "green", revoked: "gray", expired: "orange" },
  }),
  dateColumn<Grant>("created_at", { format: "MMM D, YYYY" }),
  rowActionsColumn<Grant>({ actions: [...] }),
];
```

## Row actions

### `<RowActionsMenu record={} actions={} />`

The `dots → Menu.Dropdown` pattern, config-driven. Renders nothing when no action is
visible for the row. Use `rowActionsColumn({ actions })` for the trailing column.

```tsx
<RowActionsMenu
  record={position}
  actions={[
    { label: "Edit", icon: <PencilIcon />, onClick: (r) => openEdit(r) },
    { label: "Deactivate", color: "red", dividerBefore: true,
      hidden: (r) => r.status !== "active",
      onClick: (r) => openReasonConfirmModal({ ... }) },
  ]}
/>
```

### `openReasonConfirmModal(options)`

Confirmation modal with a required reason textarea (the `revoke/deactivate/end`
flow). Confirm is disabled until a reason is entered and shows a spinner while
`onConfirm` runs; the modal closes when it resolves.

```ts
openReasonConfirmModal({
  title: "Revoke delegation",
  description: "This delegation will stop applying immediately.",
  confirmLabel: "Revoke",
  confirmColor: "red",
  onConfirm: (reason) => revoke.mutateAsync({ id, reason }),
});
```

## Error boundary

### `<ModuleErrorBoundary>`

Module-level React error boundary (mandated by CLAUDE.md). Wrap a module's content so
a render error shows a recoverable fallback instead of blanking the app.

```tsx
<ModuleErrorBoundary title="Couldn't load positions">
  <PositionsList />
</ModuleErrorBoundary>
```
