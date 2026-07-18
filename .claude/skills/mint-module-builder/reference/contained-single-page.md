# ContainedModule — Build Guide (Contained · single route)

> Read this after the router (`SKILL.md`) has landed you on **Contained · one route**.
> A ContainedModule owns a single URL and mounts `ModalTableShell`; create & edit open
> in modals/drawers. For 2–4 routes (dedicated new/edit/view pages, multi-step forms,
> file uploads) use `reference/contained-multi-page.md` instead.

> **Staff CRUD list pages:** prefer the app-level `createListModule(config)` (from
> `@/components/createListModule`) — it collapses the
> `RequireStaff → ModuleHeader → ModalPaper → ModalTableShell` skeleton into a single
> config (`createListModule<Row, FormValues>({ ... })`). The manual `ModalPaper` +
> `ModalTableShell` wiring shown below is the underlying shape it wraps — use it directly
> when a page needs something `createListModule` does not cover.

## When to use

- One URL owns the entire lifecycle (e.g. `/admin/channels`)
- Form is self-contained (no multi-step, no file uploads, no detail view)

## File structure

```
modules/admin/
└── <name>/
    ├── index.ts                       # exports Module<Name> (single named export)
    ├── <name>.types.ts                # entity type + response shape
    ├── <name>.api.ts                  # fetch / create / update / delete functions
    ├── <name>.queryKeys.ts            # React Query key helpers
    ├── form/
    │   ├── <Name>Form.tsx             # form component — owns its submit button
    │   ├── <Name>Form.types.ts        # FormProps type
    │   └── index.ts
    └── pages/
        └── list/
            ├── <Name>List.tsx         # mounts ModalTableShell (wrapped in Paper)
            └── <name>.columns.tsx     # DataTableShellColumn<T> array
```

## Step 1 — `<name>.types.ts`

The entity is a **plain interface**. The shells constrain `T extends object`, which a
plain interface already satisfies — do **not** add `extends Record<string, unknown>`
(only React-Flow node data legitimately needs that index signature). Declare the read
entity and the write payloads as **distinct** types: the create/update request shapes
usually differ from the read entity (server-set fields like `id`/`enrolledAt` are not
sent on create).

```ts
export type StudentStatus = "active" | "on-leave" | "graduated" | "dropped";

export interface Student {
  id: string;
  fullName: string;
  email: string;
  status: StudentStatus;
  enrolledAt: string;
}

/** Request payloads — separate from the read entity. */
export interface StudentCreatePayload {
  fullName: string;
  email: string;
  status: StudentStatus;
}
export type StudentUpdatePayload = Partial<StudentCreatePayload>;

export interface StudentsFetchResponse {
  data: Student[];
  meta: { total: number; page: number; pageSize: number };
}
```

## Step 2 — `<name>.queryKeys.ts`

Use `createQueryKeys` from `@peppermint/admin` — it produces stable **array-form** keys
(`.all` / `.lists()` / `.list(params)` / `.detail(id)`). Never hand-write stringly keys
like `"students.list"` or `.split(".")` them.

```ts
import { createQueryKeys } from "@peppermint/admin";

export const studentQueryKeys = createQueryKeys("students");
// studentQueryKeys.list()            → ["students", "list"]
// studentQueryKeys.list({ page: 2 }) → ["students", "list", { page: 2 }]
// studentQueryKeys.detail(id)        → ["students", "detail", id]
```

## Step 3 — `<name>.api.ts`

Use `QueryParams` from `@peppermint/admin` — matches what the shell passes automatically.

```ts
import type { QueryParams } from "@peppermint/admin";
import type {
  Student,
  StudentCreatePayload,
  StudentUpdatePayload,
  StudentsFetchResponse,
} from "./students.types";

export async function fetchStudents(
  params?: QueryParams,
): Promise<StudentsFetchResponse> {
  // params.filters.status — set by the active tab
  // params.search, params.page, params.pageSize, params.sort — standard pagination
}

export async function createStudent(
  values: StudentCreatePayload,
): Promise<Student> {
  /* ... */
}
export async function updateStudent(
  id: string,
  values: StudentUpdatePayload,
): Promise<Student> {
  /* ... */
}
export async function deleteStudent(id: string): Promise<void> {
  /* ... */
}
```

## Step 4 — `pages/list/<name>.columns.tsx`

Use `DataTableShellColumn<T>`. The default is **no `render`** — the shell renders plain values correctly on its own. Only add a `render` function when the output genuinely cannot be expressed as plain text: a colored badge, an icon, a stacked multi-line cell. Never wrap plain text in `<Text>` just to have a `render`. When you do use `render`, prefer a compact `size="xs"` for dense table cells; go larger only when the cell's content genuinely needs the emphasis.

**Prefer a header `icon` on each column** (Phosphor icon component from `@phosphor-icons/react/dist/csr/*`) — `DataTableShell` renders it beside the column title, and a consistent icon set reads better. Add one when it aids scanning; it is a strong default, not an absolute requirement for every column.

```tsx
import type { DataTableShellColumn } from "@peppermint/admin";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/csr/Envelope";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import type { Student } from "../../students.types";

export const studentsColumns: DataTableShellColumn<Student>[] = [
  { accessor: "fullName", title: "Full Name", icon: UserIcon, sortable: true },
  { accessor: "email", title: "Email", icon: EnvelopeIcon, sortable: true },
  {
    accessor: "status",
    title: "Status",
    icon: PulseIcon,
    render: (record) => (
      <Badge size="xs" color={colorMap[record.status]}>
        {record.status}
      </Badge>
    ),
  },
];
```

## Step 5 — `form/<Name>Form.tsx`

> **Before writing any field, run `/form-builder`** (CLAUDE.md Development-Workflow
> checklist). It decides the controls, ordering, grouping, and disclosure — _what_ the
> form should be. `FormWrapper` below is only the plumbing that renders that decision.

**Build module forms on `FormWrapper` — it owns form state, Zod validation, dirty
tracking, and the submit flow. Do NOT hand-roll `useForm` for a module form.** For a
modal form (ContainedModule + `ModalTableShell`), the shell injects `initialValues`
(edit prefill), `onSubmit`, and `isLoading`; `FormWrapper`'s `finalSubmitFn` hands the
validated values back to the shell's mutation. There is **no `FormShell`** here — the
modal is the chrome. Fields live in a **child component** so they subscribe to the form
context (not navigation).

```tsx
"use client";
import { Stack, TextInput, Select, Button } from "@peppermint/ui";
import {
  FormWrapper,
  useFormInstance,
  useFormControls,
} from "@peppermint/admin";
import { z } from "zod";
import type { StudentFormProps, StudentFormValues } from "./StudentForm.types";

const schema = z.object({
  fullName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  status: z.enum(["active", "on-leave", "graduated", "dropped"]),
});

const INITIAL: StudentFormValues = {
  fullName: "",
  email: "",
  status: "active",
};

export function StudentForm({
  initialValues,
  onSubmit,
  isLoading,
}: StudentFormProps) {
  return (
    <FormWrapper<StudentFormValues>
      initial={{ ...INITIAL, ...initialValues }} // for records that differ from the form shape, map explicitly
      validation={[schema]} // one schema per step; single-step passes [schema]
      finalSubmitFn={async (values) => {
        onSubmit(values); // hand validated values to ModalTableShell's create/edit mutation
        return { ok: true };
      }}
    >
      <StudentFields isLoading={isLoading} />
    </FormWrapper>
  );
}

// Fields in a child component — reads the form via useFormInstance, submits via useFormControls.
function StudentFields({ isLoading }: { isLoading?: boolean }) {
  const { form } = useFormInstance<StudentFormValues>();
  const { handleSubmit } = useFormControls();
  return (
    <Stack gap="md" p="md">
      <TextInput
        label="Full Name"
        required
        disabled={isLoading}
        {...form.getInputProps("fullName")}
      />
      <TextInput
        label="Email"
        type="email"
        required
        disabled={isLoading}
        {...form.getInputProps("email")}
      />
      <Select
        label="Status"
        data={[
          { value: "active", label: "Active" },
          { value: "on-leave", label: "On Leave" },
          { value: "graduated", label: "Graduated" },
          { value: "dropped", label: "Dropped" },
        ]}
        disabled={isLoading}
        {...form.getInputProps("status")}
      />
      {/* spinner = shell's isLoading (the real mutation); handleSubmit validates then submits */}
      <Button loading={isLoading} onClick={handleSubmit} fullWidth>
        Save
      </Button>
    </Stack>
  );
}
```

**Full-page / multi-step forms (MultiPageModule new/edit routes):** keep the same
`FormWrapper`, but wrap the fields in `<FormShell title=… onBack=… steps={[…]}>` for the
header / progress bar / stepper / footer / dirty-banner chrome (multi-step also uses
`stepApiConfigs` + `stepFields`). Full API + examples: `usage-doc/admin/FormWrapper.md`
and `usage-doc/admin/FormShell.md`.

`form/<Name>Form.types.ts`:

```ts
import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Student } from "../students.types";

/** The form's own value shape — what onSubmit emits (distinct from the read entity). */
export interface StudentFormValues {
  fullName: string;
  email: string;
  status: Student["status"];
}

export type StudentFormProps = ModalFormComponentProps<
  Student,
  StudentFormValues
>;
```

## Step 6 — `pages/list/<Name>List.tsx`

Always wrap the shell in `<ModalPaper>` (from `@peppermint/ui`) — never a hand-rolled `Paper` with manual `radius`/`h`. `ModalPaper` already fills the remaining height below `ModuleHeader` and rounds only the top-left corner using the theme's default radius; adding your own `radius`/`h` props fights those defaults.
Tabs must be typed as `DataTableShellTab[]`. Use `filter` (not `forceFilter`) — `filter` sends values to the server via `params.filters`.

```tsx
"use client";

import { ModalTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import type { DataTableShellTab } from "@peppermint/admin";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../students.api";
import { studentsColumns } from "./students.columns";
import { studentQueryKeys } from "../../students.queryKeys";
import { StudentForm } from "../../form/StudentForm";
import type { Student } from "../../students.types";
import type { StudentFormValues } from "../../form/StudentForm.types";

const tabs: DataTableShellTab[] = [
  { label: "All Students", icon: UsersIcon },
  { label: "Active", icon: CheckCircleIcon, filter: { status: "active" } },
];

export function StudentsList() {
  return (
    <ModalPaper withBorder>
      <ModalTableShell<Student, StudentFormValues>
        queryKey={studentQueryKeys.list()}
        queryGetFn={fetchStudents}
        dataKey="data"
        paginationKey="meta"
        columns={studentsColumns}
        moduleInfo={{
          name: "students",
          label: "Students",
          description: "Manage students",
        }}
        idAccessor="id"
        createFormComponent={StudentForm}
        editFormComponent={StudentForm}
        onCreateApi={(values) => createStudent(values)}
        // edit id comes from the row `record` (second arg), never from form values
        onEditApi={(values, record) => updateStudent(record.id, values)}
        onDeleteApi={(id) => deleteStudent(String(id))}
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        tabs={tabs}
        basePath="/admin/students"
      />
    </ModalPaper>
  );
}
```

## Step 7 — `index.ts`

Single named export. No internals exposed.

```ts
export { StudentsList as ModuleStudents } from "./pages/list/StudentsList";
```

## Step 8 — `app/admin/<name>/page.tsx`

(Orchestrator-owned when running as a dispatched parallel agent — report the re-export line instead of writing this file.)

One line. No logic. No imports from inside the module.

```tsx
import { ModuleStudents } from "@/modules/students";
export default ModuleStudents;
```

## Step 9 — `modules/admin/<name>/docs/AI.md`

Create the module AI navigation map. This is mandatory — a module without an AI map is incomplete.

Minimum required content:

```md
# <Name> Module — AI Navigation Map

## Purpose

<one sentence>

## Module type

ContainedModule

## Route

/admin/<name>

## Entry files

- Module<Name>.tsx
- index.ts

## Common edit targets

| Task    | Files                              |
| ------- | ---------------------------------- |
| List UI | pages/list/<Name>List.tsx          |
| Form UI | <Name>Form.tsx                     |
| Queries | <name>.queryKeys.ts, module.api.ts |
| Types   | <name>.types.ts                    |

## State ownership

- Server data: React Query
- Local UI state: useState

## Do not do

- Do not fetch data in useEffect.
- Do not import Mantine directly.
```

After creating, run `/update-ai-map` to add the module to the app's `docs/AI.md` Major Modules table. (Orchestrator-owned when running as a dispatched parallel agent — report your parent AI.md row instead; the app-level map is outside your folder.)

---

## Common Mistakes — Do Not Make These (Contained)

### `forceFilter` vs `filter` in tabs

```tsx
// ❌ fetches all rows from the server, then discards non-matching ones client-side
{ label: "Active", forceFilter: (rows) => rows.filter(r => r.status === "active") }

// ✅ sends { status: "active" } as params.filters to the server
{ label: "Active", filter: { status: "active" } }
```

### Not wrapping shells in `ModalPaper`

```tsx
// ❌ shell floats with no visual container
export function StudentsList() {
  return <ModalTableShell<Student> ... />;
}

// ❌ hand-rolled Paper — fights ModalPaper's height/radius defaults and drifts out of sync
export function StudentsList() {
  return (
    <Paper p={0} withBorder radius="var(--mantine-radius-default)" h="calc(100vh - 16px)">
      <ModalTableShell<Student> ... />
    </Paper>
  );
}

// ✅ always wrap with ModalPaper — no manual radius/h
export function StudentsList() {
  return (
    <ModalPaper withBorder>
      <ModalTableShell<Student> ... />
    </ModalPaper>
  );
}
```

### Unnecessary or oversized renders in columns

The default is **no `render`**. The shell handles plain values. Only add `render` when the cell genuinely requires a badge, icon, or multi-line layout. Inside a `render`, prefer a compact `size="xs"` for dense table cells; go larger only when the content needs the emphasis.

```tsx
// ❌ render used for plain text — never do this
{ accessor: "email", render: (r) => <Text>{r.email}</Text> }

// ✅ plain text needs no render
{ accessor: "email", title: "Email", sortable: true }

// ✅ render justified — prefer a compact size for dense cells
{ accessor: "status", render: (r) => <Badge size="xs">{r.status}</Badge> }
{ accessor: "price",  render: (r) => <Text size="xs">${r.price.toFixed(2)}</Text> }

// go larger only when the content genuinely needs the emphasis
{ accessor: "name", render: (r) => <Text size="xs">{r.name}</Text> }
```

### Inconsistent column header icons

`DataTableShell` renders a column's `icon` in the table header beside the title. A
consistent icon set reads better, so a header icon is a strong default — add one where
it aids scanning. It is not an absolute requirement: skip it when no icon meaningfully
represents the column, but avoid a table where only some columns carry icons at random.

```tsx
// prefer a Phosphor icon component where it aids scanning
import { EnvelopeIcon } from "@phosphor-icons/react/dist/csr/Envelope";
{ accessor: "email", title: "Email", icon: EnvelopeIcon, sortable: true }
```

### Untyped tabs array

```tsx
// ❌ TypeScript won't catch prop name mistakes
const tabs = [{ label: "Active", filter: { status: "active" } }];

// ✅
const tabs: DataTableShellTab[] = [
  { label: "Active", icon: CheckCircleIcon, filter: { status: "active" } },
];
```
