# ContainedModule — Usage Guide

A **ContainedModule** lives on a single route and handles its full CRUD lifecycle there. List, create, edit, and delete are all managed by `ModalTableShell` — creates and edits open in drawers/modals, no page navigation happens.

Use this when:

- The module lives at one URL (e.g. `/admin/students`)
- The form is self-contained and reasonably sized
- You don't need a dedicated detail or multi-step create page

Shell used: `ModalTableShell`

Reference implementation: `apps/mint-consultancy/modules/students/`

---

## File structure

```
modules/
└── <name>/
    ├── index.ts                       # exports Module<Name> (single named export)
    ├── <name>.types.ts                # entity type + response shape
    ├── <name>.api.ts                  # fetch / create / update / delete functions
    ├── <name>.queryKeys.ts            # React Query key helpers
    ├── form/
    │   ├── <Name>Form.tsx             # form component with its own submit button
    │   ├── <name>Form.types.ts        # FormProps type
    │   └── index.ts
    └── pages/
        └── list/
            ├── <Name>List.tsx         # mounts ModalTableShell
            └── <name>.columns.tsx     # DataTableShellColumn array
```

---

## Step-by-step

### 1. `<name>.types.ts`

The entity type must extend `Record<string, unknown>` — required by the table shell's generic constraint.

```ts
export type StudentStatus = "active" | "on-leave" | "graduated" | "dropped";

export interface Student extends Record<string, unknown> {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: StudentStatus;
  enrolledAt: string;
  program: string;
  nationality: string;
}

export interface StudentsFetchResponse {
  data: Student[];
  meta: { total: number; page: number; pageSize: number };
}
```

### 2. `<name>.queryKeys.ts`

```ts
export const studentQueryKeys = {
  list: () => "students.list",
};
```

### 3. `<name>.api.ts`

Import `QueryParams` from `@peppermint/admin` so the function signature matches what the table shell passes.

```ts
import type { QueryParams } from "@peppermint/admin";
import type { Student, StudentsFetchResponse } from "./students.types";

export async function fetchStudents(
  params?: QueryParams,
): Promise<StudentsFetchResponse> {
  // params.filters.status is set by the active tab
  // params.search, params.page, params.pageSize, params.sort are handled here
}

export async function createStudent(
  values: Partial<Student>,
): Promise<Student> {
  /* ... */
}
export async function updateStudent(
  id: string,
  values: Partial<Student>,
): Promise<Student> {
  /* ... */
}
export async function deleteStudent(id: string): Promise<void> {
  /* ... */
}
```

### 4. `pages/list/<name>.columns.tsx`

Use `DataTableShellColumn<T>` — it extends mantine-datatable's `DataTableColumn<T>` with optional `key` and `defaultVisible` fields.

Only add a `render` function when the default cell output is insufficient (e.g. a badge, an icon, a stacked line). When you do use `render`, default all text to `size="xs"` unless there is a specific reason to go larger.

```tsx
import type { DataTableShellColumn } from "@peppermint/admin";
import type { Student } from "../../students.types";

export const studentsColumns: DataTableShellColumn<Student>[] = [
  { accessor: "fullName", title: "Full Name", sortable: true },
  { accessor: "email", title: "Email", sortable: true },
  {
    accessor: "status",
    title: "Status",
    render: (record) => (
      <Badge color={colorMap[record.status]}>{record.status}</Badge>
    ),
  },
];
```

### 5. `form/<Name>Form.tsx`

The form owns its submit button. `ModalTableShell` passes `initialValues`, `onSubmit`, and `isLoading` as props.

```tsx
import { Stack, TextInput, Select, Button } from "@peppermint/ui";
import { useForm } from "@peppermint/ui";
import type { StudentFormProps } from "./StudentForm.types";
import type { Student } from "../students.types";

export function StudentForm({
  initialValues,
  onSubmit,
  isLoading,
}: StudentFormProps) {
  const form = useForm<Student>({
    initialValues: initialValues ?? {
      fullName: "",
      email: "",
      status: "active" /* ... */,
    },
    validate: {
      fullName: (v) => (!v ? "Required" : null),
      email: (v) =>
        !v ? "Required" : !/^\S+@\S+$/.test(v) ? "Invalid email" : null,
    },
    onSubmit,
  });

  return (
    <form onSubmit={form.onSubmit}>
      <Stack gap="md" p="md">
        <TextInput
          label="Full Name"
          placeholder="Alice Johnson"
          required
          disabled={isLoading}
          {...form.getInputProps("fullName")}
        />
        <TextInput
          label="Email"
          placeholder="student@example.com"
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
        <Button type="submit" loading={isLoading} fullWidth>
          {initialValues?.id ? "Update Student" : "Create Student"}
        </Button>
      </Stack>
    </form>
  );
}
```

`form/<name>Form.types.ts`:

```ts
import type { Student } from "../students.types";

export interface StudentFormProps {
  initialValues?: Student;
  onSubmit: (values: Student) => void;
  isLoading?: boolean;
}
```

### 6. `pages/list/<Name>List.tsx`

Always wrap the shell in a `Paper` with `p={0}`, `withBorder`, `radius="lg"`, and `h="calc(100vh - 16px)"`.

```tsx
"use client";

import { ModalTableShell } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import type { DataTableShellTab } from "@peppermint/admin";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";
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

const tabs: DataTableShellTab[] = [
  { label: "All Students", icon: UsersIcon },
  { label: "Active", icon: CheckCircleIcon, filter: { status: "active" } },
  { label: "On Leave", icon: ClockIcon, filter: { status: "on-leave" } },
  {
    label: "Graduated",
    icon: GraduationCapIcon,
    filter: { status: "graduated" },
  },
  { label: "Dropped", icon: XCircleIcon, filter: { status: "dropped" } },
];

export function StudentsList() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <ModalTableShell<Student>
        queryKey={studentQueryKeys.list()}
        queryGetFn={fetchStudents}
        dataKey="data"
        paginationKey="meta"
        columns={studentsColumns}
        moduleInfo={{
          name: "students",
          label: "Students",
          description: "Manage student enrollments and profiles",
        }}
        idAccessor="id"
        createFormComponent={StudentForm}
        editFormComponent={StudentForm}
        onCreateApi={(values) => createStudent(values)}
        onEditApi={(values) => updateStudent(values.id, values)}
        onDeleteApi={(id) => deleteStudent(String(id))}
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        tabs={tabs}
        basePath="/admin/students"
      />
    </Paper>
  );
}
```

**Tab rule:** always type tabs as `DataTableShellTab[]` and use `filter` (not `forceFilter`) so the value is sent to the server as part of `params.filters`. `forceFilter` is client-side only — do not use it when the API handles filtering.

### 7. `index.ts`

```ts
export { StudentsList as ModuleStudents } from "./pages/list/StudentsList";
```

Single named export. No types or internals exposed unless another module needs them.

### 8. `app/admin/<name>/page.tsx`

```tsx
import { ModuleStudents } from "@/modules/students";
export default ModuleStudents;
```

No logic. No imports from inside the module. One line.

---

## Common mistakes

**Using `forceFilter` in tabs instead of `filter`**

```tsx
// ❌ fetches all rows from the server, then discards non-matching ones client-side
{ label: "Active", forceFilter: (rows) => rows.filter(r => r.status === "active") }

// ✅ sends { status: "active" } as params.filters to the server
{ label: "Active", filter: { status: "active" } }
```

**Untyped tabs array**

```tsx
// ❌ no type — TypeScript won't catch prop name mistakes
const tabs = [{ label: "Active", filter: { status: "active" } }];

// ✅
const tabs: DataTableShellTab[] = [
  { label: "Active", icon: CheckCircleIcon, filter: { status: "active" } },
];
```

**Putting logic in `app/page.tsx`**

```tsx
// ❌ logic leaks out of the module
export default function Page() {
  const [open, setOpen] = useState(false);
  return <StudentsList onOpen={() => setOpen(true)} />;
}

// ✅ app page is a thin re-export
import { ModuleStudents } from "@/modules/students";
export default ModuleStudents;
```

**Overusing `render` in columns or using the wrong text size**

```tsx
// ❌ render used for plain text — unnecessary
{ accessor: "email", render: (r) => <Text>{r.email}</Text> }

// ✅ no render needed for plain text
{ accessor: "email", title: "Email", sortable: true }

// ❌ render used correctly but text size not set
{ accessor: "status", render: (r) => <Badge>{r.status}</Badge> }

// ✅ when render is needed, text inside is size="xs" by default
{ accessor: "status", render: (r) => <Badge size="xs">{r.status}</Badge> }
{ accessor: "name", render: (r) => <Text size="xs">{r.name}</Text> }
```

**Not wrapping the shell in Paper**

```tsx
// ❌ shell floats with no visual container
export function StudentsList() {
  return <ModalTableShell<Student> ... />;
}

// ✅ always wrap with the full Paper spec
export function StudentsList() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <ModalTableShell<Student> ... />
    </Paper>
  );
}
```

**Not extending `Record<string, unknown>` on the entity type**

`DataTableShellColumn<T>` and `ModalTableShell<T>` require `T extends Record<string, unknown>`. Omitting it causes a generic constraint error.
