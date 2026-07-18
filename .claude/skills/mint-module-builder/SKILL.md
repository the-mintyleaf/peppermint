---
name: mint-module-builder
description: >
  Know-how and build guide for Peppermint monorepo apps. Read this before
  building any module or page. Covers stack rules, the Contained/Not-Contained
  decision, ContainedModule and MultiPageModule patterns, file structure, and
  common mistakes. Use as a bootstrap doc when given a requirements document.
model: opus
---

# Peppermint Module Build Guide

This is the authoritative build guide for module work across the Peppermint monorepo
apps (`mintway`, `mintflow`, `mintflow-admin`). Reading this replaces the need to
re-scan the repository before building a module.

---

## 1. Stack at a Glance

| Concern               | Tool                                                   | Rule                                                              |
| --------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| UI components         | `@peppermint/ui`                                       | Always import from here — never from `@mantine/*` directly        |
| Forms                 | `@mantine/form` via `@peppermint/ui`                   | Never React Hook Form or any other form library                   |
| Server state          | React Query (`useQuery` / `useMutation`)               | No fetching in `useEffect`; no direct Axios in event handlers     |
| Global client state   | Zustand                                                | Colocate in `<Component>.store.ts`                                |
| Scoped subtree state  | React Context                                          |                                                                   |
| Local component state | `useState`                                             |                                                                   |
| Routing               | Next.js App Router                                     | `app/` directory only; no client-side router libraries            |
| Icons                 | Phosphor Icons                                         | Default weight `regular`; always `aria-label` on meaningful icons |
| Animations            | Framer Motion                                          | Duration > 300ms or layout-shifting → check `useReducedMotion()`  |
| Admin shells          | `@peppermint/admin`                                    | `ModalTableShell`, `DataTableShell`, `FormWrapper`, `FormShell`   |
| Module page wrapper   | `@peppermint/ui`                                       | `ModalPaper` — never hand-roll `Paper` + manual `radius`/`h`      |
| HTTP client           | `@peppermint/api-client` or the app's `src/lib/api.ts` | Never instantiate Axios inline                                    |

**TypeScript:** strict mode. No `any`. No `@ts-ignore` without an explanatory comment.
Functional components only. Props typed as `[Name]Props` in `<Name>.types.ts`.

---

## 2. Contained vs Not Contained — Decision Rule

Before building any module or page, decide:

### Contained

A module is **Contained** when it maps to one of the admin framework patterns — it manages a list of records with create / edit / delete functionality. This is the default for most feature modules.

> A _list of cards_ is still **Contained**. Being a list means the normal module rules apply. The "cards" exception does **not** extend to lists of cards.

Use `ModalTableShell` (ContainedModule) or `DataTableShell` + `FormWrapper` + `FormShell` (MultiPageModule) as appropriate.

### Not Contained

A module is **Not Contained** ONLY when it is:

- A **reporting page** (charts, KPIs, analytics dashboards with no CRUD)
- A **page composed of information cards** (a status overview, a settings summary page made entirely of info panels)

Not Contained pages do not use the admin shells. Build them as regular Next.js pages following the standard component structure.

---

## 3. Picking the Right Module Pattern

Once you know a module is **Contained**, pick the shape by route count:

| Pattern             | Route count | Shell                                          | Use when                                                                       |
| ------------------- | ----------- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| **ContainedModule** | 1           | `ModalTableShell`                              | Single list page; create & edit open in modals/drawers; form has ≤ ~8 fields   |
| **MultiPageModule** | 2–4         | `DataTableShell` + `FormWrapper` + `FormShell` | Complex form, multi-step wizard, file uploads, or a dedicated detail/view page |

The **form** in _both_ patterns is built on `FormWrapper` (the state/validation/submit
engine — see Step 5). The difference is chrome: a ContainedModule form renders inside the
`ModalTableShell` modal (FormWrapper only, no `FormShell`); a MultiPageModule form route
wraps FormWrapper in `FormShell` for the full-page header / stepper / footer. Never
hand-roll `useForm` for a module form.

`ModalModule` and `RouteModule` (CLAUDE.md § Module Types) are **distinct types, not aliases** of these two patterns. A `ModalModule` has no route — another module opens it via state (e.g. the profile overlay in the user-avatar menu). A `RouteModule` owns its own layout shell wired in `app/`. Neither fits the Contained builder patterns above: treat both as custom work built inline by the orchestrator — never dispatched to `module-builder` agents (see `.claude/PARALLEL.md` §1).

---

## 4. ContainedModule — Build Guide

> **Staff CRUD list pages:** prefer the app-level `createListModule(config)` (from
> `@/components/createListModule`) — it collapses the
> `RequireStaff → ModuleHeader → ModalPaper → ModalTableShell` skeleton into a single
> config (`createListModule<Row, FormValues>({ ... })`). The manual `ModalPaper` +
> `ModalTableShell` wiring shown below is the underlying shape it wraps — use it directly
> when a page needs something `createListModule` does not cover.

### When to use

- One URL owns the entire lifecycle (e.g. `/admin/channels`)
- Form is self-contained (no multi-step, no file uploads, no detail view)

### File structure

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

### Step 1 — `<name>.types.ts`

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

### Step 2 — `<name>.queryKeys.ts`

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

### Step 3 — `<name>.api.ts`

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

### Step 4 — `pages/list/<name>.columns.tsx`

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

### Step 5 — `form/<Name>Form.tsx`

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

### Step 6 — `pages/list/<Name>List.tsx`

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

### Step 7 — `index.ts`

Single named export. No internals exposed.

```ts
export { StudentsList as ModuleStudents } from "./pages/list/StudentsList";
```

### Step 8 — `app/admin/<name>/page.tsx`

(Orchestrator-owned when running as a dispatched parallel agent — report the re-export line instead of writing this file.)

One line. No logic. No imports from inside the module.

```tsx
import { ModuleStudents } from "@/modules/students";
export default ModuleStudents;
```

### Step 9 — `modules/admin/<name>/docs/AI.md`

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

## 5. MultiPageModule — Build Guide

### When to use

- Module needs distinct URLs: `/products`, `/products/new`, `/products/:id/edit`, `/products/:id`
- Form is complex: multi-step, file uploads, or a dedicated detail/view page

### File structure

```
modules/admin/
└── <name>/
    ├── index.ts                        # exports Module<Name> = { main, new, edit, view }
    ├── module.api.ts                   # entity type + all API functions
    ├── module.config.ts                # optional — query key, API base, module title
    ├── form/
    │   ├── index.tsx                   # <Name>Form — wraps FormWrapper + FormShell
    │   ├── <name>Form.initial.ts       # initial values for FormWrapper
    │   ├── <name>Form.schemas.ts       # per-step Zod schemas + STEP_FIELDS map
    │   ├── <name>Form.types.ts         # FormValues type
    │   └── steps/
    │       ├── Step<A>.tsx             # one component per form step
    │       └── Step<B>.tsx
    └── pages/
        ├── list/
        │   ├── index.tsx               # mounts DataTableShell (wrapped in Paper)
        │   └── list.columns.ts         # DataTableShellColumn<T> array
        ├── new/
        │   └── index.tsx               # mounts the form (onBack → history.back())
        ├── edit/
        │   └── index.tsx               # mounts the form with existing values
        └── view/
            ├── index.tsx               # reads :id from useParams, renders detail
            └── <Name>View.tsx          # detail component
```

### Step 1 — `module.api.ts`

All entity types and API functions in one file. The entity is a **plain interface**
(shells constrain `T extends object` — no `extends Record<string, unknown>`). Keep the
create/update payloads distinct from the read entity.

```ts
import type { QueryParams } from "@peppermint/admin";

export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  stock: number;
  availabilityStatus: string;
}

/** Request payloads — separate from the read entity. */
export interface ProductCreatePayload {
  title: string;
  category: string;
  price: number;
  stock: number;
}
export type ProductUpdatePayload = Partial<ProductCreatePayload>;

export interface ProductsResponse {
  products: Product[];
  meta: { total: number };
}

export async function fetchProducts(
  params?: QueryParams,
): Promise<ProductsResponse> {
  /* ... */
}
export async function fetchProduct(id: number): Promise<Product> {
  /* ... */
}
export async function createProduct(
  data: ProductCreatePayload,
): Promise<Product> {
  /* ... */
}
export async function updateProduct(
  id: number,
  data: ProductUpdatePayload,
): Promise<Product> {
  /* ... */
}
export async function deleteProduct(id: number): Promise<void> {
  /* ... */
}
```

### Step 2 — `form/<name>Form.types.ts`

```ts
export interface ProductFormValues {
  title: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
}
```

### Step 3 — `form/<name>Form.initial.ts`

```ts
import type { ProductFormValues } from "./productForm.types";

export const PRODUCT_FORM_INITIAL: ProductFormValues = {
  title: "",
  brand: "",
  category: "",
  price: 0,
  stock: 0,
};
```

### Step 4 — `form/<name>Form.schemas.ts`

One Zod schema per step. `STEP_FIELDS` maps each step index to its field names — `FormWrapper` runs only that step's validation when advancing.

```ts
import { z } from "zod";

export const identitySchema = z.object({
  title: z.string().min(1, "Required"),
  brand: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
});

export const pricingSchema = z.object({
  price: z.number().positive("Must be positive"),
  stock: z.number().int().min(0),
});

export const PRODUCT_STEP_FIELDS: string[][] = [
  ["title", "brand", "category"], // step 0
  ["price", "stock"], // step 1
];
```

### Step 5 — `form/steps/Step<Name>.tsx`

Step components receive no props — they read form state via `useFormControls()`.

```tsx
import { Stack, TextInput } from "@peppermint/ui";
import { useFormControls } from "@peppermint/admin";
import type { ProductFormValues } from "../productForm.types";

export function StepIdentity() {
  const { form } = useFormControls<ProductFormValues>();
  return (
    <Stack gap="md">
      <TextInput label="Title" required {...form.getInputProps("title")} />
      <TextInput label="Brand" required {...form.getInputProps("brand")} />
      <TextInput
        label="Category"
        required
        {...form.getInputProps("category")}
      />
    </Stack>
  );
}
```

### Step 6 — `form/index.tsx`

`FormWrapper` owns state and per-step validation. `FormShell` renders the chrome (title, stepper, back button, footer nav). Each step component in `STEP_COMPONENTS` must have a stable `key`.

```tsx
"use client";

import { useFormControls, FormShell, FormWrapper } from "@peppermint/admin";
import { createProduct } from "../module.api";
import { PRODUCT_FORM_INITIAL } from "./productForm.initial";
import {
  identitySchema,
  pricingSchema,
  PRODUCT_STEP_FIELDS,
} from "./productForm.schemas";
import { StepIdentity } from "./steps/StepIdentity";
import { StepPricing } from "./steps/StepPricing";
import type { ProductFormValues } from "./productForm.types";

const STEPS = [
  { label: "Identity", description: "Name, brand & category" },
  { label: "Pricing", description: "Price & stock" },
];

const STEP_COMPONENTS = [
  <StepIdentity key="identity" />,
  <StepPricing key="pricing" />,
];

function ProductFormBody({ onBack }: { onBack: () => void }) {
  const { current, handleStepNext, handleStepBack } = useFormControls();
  return (
    <FormShell
      title="New Product"
      description="Fill all steps to publish the product"
      onBack={onBack}
      steps={STEPS}
      showStepper
      showDirtyBanner={false}
      allowStepJump="completed-only"
      onStepNext={handleStepNext}
      onStepBack={handleStepBack}
    >
      {STEP_COMPONENTS[current]}
    </FormShell>
  );
}

interface ProductFormProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export function ProductForm({ onBack, onSuccess }: ProductFormProps) {
  return (
    <FormWrapper<ProductFormValues>
      initial={PRODUCT_FORM_INITIAL}
      finalSubmitFn={async (data) => {
        await createProduct(data);
        onSuccess?.();
        return { ok: true };
      }}
      validation={[identitySchema, pricingSchema]}
      stepFields={PRODUCT_STEP_FIELDS}
      formClearOnSuccess
      hasDirtCheck
    >
      <ProductFormBody onBack={onBack} />
    </FormWrapper>
  );
}
```

### Step 7 — `pages/list/list.columns.ts`

Same as ContainedModule: **no `render` by default**. Only add one when the cell genuinely needs a badge, icon, or multi-line layout that plain text cannot express. Inside a `render`, prefer a compact `size="xs"` for dense cells; go larger only when the content needs the emphasis.

**Prefer a header `icon` on each column** (Phosphor icon component from `@phosphor-icons/react/dist/csr/*`) so `DataTableShell` can render it beside the title — a strong default that aids scanning, applied where it helps rather than as an absolute requirement.

```tsx
import type { DataTableShellColumn } from "@peppermint/admin";
import { CurrencyDollarIcon } from "@phosphor-icons/react/dist/csr/CurrencyDollar";
import { PackageIcon } from "@phosphor-icons/react/dist/csr/Package";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { Text } from "@peppermint/ui";
import type { Product } from "../../module.api";

export const PRODUCT_COLUMNS: DataTableShellColumn<Product>[] = [
  {
    accessor: "title",
    title: "Product",
    icon: PackageIcon,
    key: "title",
    sortable: true,
    width: 260,
  },
  {
    accessor: "brand",
    title: "Brand",
    icon: TagIcon,
    key: "brand",
    sortable: true,
    width: 140,
  },
  {
    accessor: "category",
    title: "Category",
    icon: TagIcon,
    key: "category",
    sortable: true,
    width: 140,
  },
  {
    accessor: "price",
    title: "Price",
    icon: CurrencyDollarIcon,
    key: "price",
    sortable: true,
    width: 100,
    render: (row) => <Text size="xs">${row.price.toFixed(2)}</Text>,
  },
  {
    accessor: "availabilityStatus",
    title: "Status",
    icon: PulseIcon,
    key: "status",
    width: 130,
  },
];
```

### Step 8 — `pages/list/index.tsx`

Wrap in `ModalPaper`. Tabs typed as `DataTableShellTab[]`. Use `filter`, not `forceFilter`. Set `enableServerQuery`.

```tsx
"use client";

import { DataTableShell, createQueryKeys } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import type { DataTableShellTab } from "@peppermint/admin";
import { PackageIcon } from "@phosphor-icons/react/dist/csr/Package";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { fetchProducts } from "../../module.api";
import { PRODUCT_COLUMNS } from "./list.columns";
import type { Product } from "../../module.api";

const productKeys = createQueryKeys("products");

const STATUS_TABS: DataTableShellTab[] = [
  { label: "All Products", icon: PackageIcon },
  {
    label: "In Stock",
    icon: CheckCircleIcon,
    filter: { availabilityStatus: "In Stock" },
  },
];

export function ProductsList() {
  return (
    <ModalPaper withBorder>
      <DataTableShell<Product>
        queryKey={productKeys.list()}
        queryGetFn={(params) => fetchProducts(params)}
        dataKey="products"
        paginationKey="meta"
        enableServerQuery
        columns={PRODUCT_COLUMNS}
        moduleInfo={{
          name: "Product",
          label: "Products",
          description: "Manage your product catalogue",
        }}
        basePath="/admin/product-management/products"
        tabs={STATUS_TABS}
        pageSizes={[10, 20, 50, 100]}
        defaultPageSize={20}
      />
    </ModalPaper>
  );
}
```

`basePath` drives automatic link generation: New → `${basePath}/new`, Edit → `${basePath}/${id}/edit`, View → `${basePath}/${id}`.

### Step 9 — `pages/new/index.tsx` and `pages/edit/index.tsx`

Both are thin wrappers. Wrap in `ModalPaper`. `onBack` calls `history.back()`.

```tsx
"use client";
import { ModalPaper } from "@peppermint/ui";
import { ProductForm } from "../../form";

export function ProductsNew() {
  return (
    <ModalPaper withBorder>
      <ProductForm onBack={() => history.back()} />
    </ModalPaper>
  );
}
```

### Step 10 — `pages/view/index.tsx`

```tsx
"use client";
import { useParams } from "next/navigation";
import { ModalPaper } from "@peppermint/ui";
import { ProductView } from "./ProductView";

export function ProductsView() {
  const { id } = useParams<{ id: string }>();
  return (
    <ModalPaper withBorder>
      <ProductView productId={id} />
    </ModalPaper>
  );
}
```

### Step 11 — `index.ts`

Export an object — consumers pick the page they need; no deep imports into module internals.

```ts
import { ProductsList } from "./pages/list";
import { ProductsNew } from "./pages/new";
import { ProductsEdit } from "./pages/edit";
import { ProductsView } from "./pages/view";

export const ModuleProducts = {
  main: ProductsList,
  new: ProductsNew,
  edit: ProductsEdit,
  view: ProductsView,
};
```

### Step 12 — App pages

(Orchestrator-owned when running as a dispatched parallel agent — report one re-export line per route instead of writing these files.)

```tsx
// app/admin/product-management/products/page.tsx
import { ModuleProducts } from "@/modules/admin/product";
export default ModuleProducts.main;

// app/admin/product-management/products/new/page.tsx
import { ModuleProducts } from "@/modules/admin/product";
export default ModuleProducts.new;

// app/admin/product-management/products/[id]/edit/page.tsx
import { ModuleProducts } from "@/modules/admin/product";
export default ModuleProducts.edit;

// app/admin/product-management/products/[id]/page.tsx
import { ModuleProducts } from "@/modules/admin/product";
export default ModuleProducts.view;
```

Each app page is one import and one export. No logic.

### Step 13 — `modules/admin/<name>/docs/AI.md`

Create the module AI navigation map. Mandatory — a module without an AI map is incomplete.

```md
# <Name> Module — AI Navigation Map

## Purpose

<one sentence>

## Module type

MultiPageModule

## Routes

| Route                   | File        |
| ----------------------- | ----------- |
| /admin/<name>           | pages/list/ |
| /admin/<name>/new       | pages/new/  |
| /admin/<name>/[id]      | pages/view/ |
| /admin/<name>/[id]/edit | pages/edit/ |

## Entry files

- index.ts (exports Module<Name>)

## Common edit targets

| Task       | Files                              |
| ---------- | ---------------------------------- |
| List page  | pages/list/                        |
| Form steps | form/steps/                        |
| View page  | pages/view/                        |
| Queries    | <name>.queryKeys.ts, <name>.api.ts |
| Types      | <name>.types.ts                    |

## State ownership

- Server data: React Query
- Form state: @mantine/form via FormWrapper
- Shareable filters: URL search params

## Do not do

- Do not fetch data in useEffect.
- Do not import Mantine directly.
```

After creating, run `/update-ai-map` to add the module to the app's `docs/AI.md` Major Modules table. (Orchestrator-owned when running as a dispatched parallel agent — report your parent AI.md row instead; the app-level map is outside your folder.)

---

## 6. Naming Conventions

| Thing               | Convention                       | Example                            |
| ------------------- | -------------------------------- | ---------------------------------- |
| Folders             | `kebab-case`                     | `user-profile/`, `channels/`       |
| Component files     | `PascalCase`                     | `UserCard.tsx`, `ChannelForm.tsx`  |
| Non-component files | `camelCase`                      | `queryKeys.ts`, `channels.api.ts`  |
| Layout exports      | `Layout<Name>`                   | `LayoutRoot`, `LayoutAdmin`        |
| Module exports      | `Module<Name>`                   | `ModuleChannels`, `ModuleProducts` |
| Module object pages | `main`, `new`, `edit`, `view`    | `ModuleProducts.main`              |
| Layout folders      | `kebab-case` matching the export | `root-layout` → `LayoutRoot`       |
| Module folders      | `kebab-case` matching the export | `product` → `ModuleProducts`       |

---

## 7. App Structure Rules

```
apps/<app-name>/
├── app/           # Next.js App Router — thin re-exports ONLY
├── layouts/       # Layout components
├── modules/       # Feature modules (all module work lives here)
├── components/    # App-level shared components
├── config/        # App, framework, and env configs
├── context/       # Global React context (if needed)
└── assets/        # Images, SVG, fonts, etc.
```

- `app/page.tsx` — one import, one default export. Zero logic.
- `app/layout.tsx` — imports from `layouts/` only.
- Layouts use `kebab-case` folders and export `PascalCase` named exports.
- Modules use `kebab-case` folders and export `Module<Name>` named exports.

---

## 8. State Ownership Quick Reference

| Data type                                      | Where it lives                                 |
| ---------------------------------------------- | ---------------------------------------------- |
| Server / async data                            | React Query (`useQuery` / `useMutation`)       |
| Global client state (shared across components) | Zustand in `<Component>.store.ts` or `stores/` |
| Scoped subtree state                           | React Context                                  |
| Local component state                          | `useState`                                     |

Never fetch in `useEffect`. Never call Axios directly in event handlers.

---

## 9. Common Mistakes — Do Not Make These

### `forceFilter` vs `filter` in tabs

```tsx
// ❌ fetches all rows from the server, then discards non-matching ones client-side
{ label: "Active", forceFilter: (rows) => rows.filter(r => r.status === "active") }

// ✅ sends { status: "active" } as params.filters to the server
{ label: "Active", filter: { status: "active" } }
```

### Adding `extends Record<string, unknown>` to a domain row type

The shells constrain `T extends object`, which a plain interface already satisfies. Do
not add the index signature to make a shell happy — it weakens type-safety and
contradicts the root guidance (`CLAUDE.md` Anti-Patterns / `.claude/rules.md`). Only
React-Flow node data legitimately needs `Record<string, unknown>`.

```ts
// ❌ index signature not needed — and it lets any typo'd key through
export interface Student extends Record<string, unknown> {
  id: string;
  name: string;
}

// ✅ plain interface — satisfies `T extends object`
export interface Student {
  id: string;
  name: string;
}
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

### Logic in `app/page.tsx`

```tsx
// ❌ logic leaks out of the module
export default function Page() {
  const [open, setOpen] = useState(false);
  return <StudentsList onOpen={() => setOpen(true)} />;
}

// ✅
import { ModuleStudents } from "@/modules/students";
export default ModuleStudents;
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

### Importing from inside a module (MultiPage)

```tsx
// ❌ bypasses the module's public API
import { ProductsList } from "@/modules/admin/product/pages/list";

// ✅ always go through the module export
import { ModuleProducts } from "@/modules/admin/product";
export default ModuleProducts.main;
```

### Missing `key` on step components (MultiPage)

```tsx
// ❌ React cannot key step transitions
const STEP_COMPONENTS = [<StepIdentity />, <StepPricing />];

// ✅
const STEP_COMPONENTS = [
  <StepIdentity key="identity" />,
  <StepPricing key="pricing" />,
];
```

---

## 10. Git Commit Format

```
[<package-name or app-name>/<component-name or file-name>] <update-type>: <description>
```

Square brackets are literal — they are part of the commit message.

**Update types:** `add` · `fix` · `update` · `remove` · `docs`

Examples:

```
[mintway/channels] add: ContainedModule for channel management
[@peppermint/admin/DataTableShell] fix: server filter not sent on tab change
[mintway/products] update: add pricing step to MultiPageModule form
```

---

## 11. Package Imports Quick Reference

```ts
// UI components (Mantine wrappers — always use this)
import {
  ModalPaper,
  Paper,
  Stack,
  TextInput,
  Select,
  Button,
  Badge,
  Text,
} from "@peppermint/ui";
import { useForm } from "@peppermint/ui";

// Admin shells
import {
  ModalTableShell,
  DataTableShell,
  FormWrapper,
  FormShell,
  useFormControls,
} from "@peppermint/admin";
import type {
  DataTableShellColumn,
  DataTableShellTab,
  QueryParams,
} from "@peppermint/admin";

// Icons — always from the CSR path
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";

// Routing (Next.js only)
import { useParams, useRouter } from "next/navigation";
```

---

## 12. Building from a Requirements Document — Checklist

Given a requirements doc, follow this sequence:

> Before this sequence, the design decisions — page/route surface, form field order, column order + icons, shell choice — should already be made and user-confirmed via `/design-decisions`. If they aren't, run it first; don't improvise them while building.

0. **Check for a contract digest** — if `apps/<app>/docs/api-contracts/<domain>.md` exists for your module's domain, it is required reading and the authority on DTO shapes, endpoints, envelopes, and error codes. Do not guess API shapes it already answers; if it's missing but `docs/backend/<domain>/` exists, ask the orchestrator to run `/sync-api` first.
1. **Decide Contained vs Not Contained** (Section 2).
1. **If Contained — pick ContainedModule or MultiPageModule** (Section 3).
1. **Create the branch** (orchestrator-only): `git checkout -b dev/<feature-name>`.
1. **Build in order** (within a single module): types → query keys → API → columns → form → list page → index → app page.
1. **Every page** gets wrapped in `<ModalPaper withBorder>` — never a hand-rolled `Paper` with manual `radius`/`h`.
1. **Every `app/` page** is a one-line re-export.
1. **Tabs** → always `DataTableShellTab[]`, always `filter` (not `forceFilter`).
1. **Entity type** → plain interface (shells constrain `T extends object`); keep create/update payloads distinct from the read entity.
1. **Imports** → always from `@peppermint/ui`, never from `@mantine/*`.
1. **Commit format** → `[app-name/module-name] add: description`.
1. **Multiple independent modules in the doc** → do not build them one after another. Dispatch one `module-builder` agent per `[CONTAINED]`/`[MULTI_PAGE]` module, concurrently, per `.claude/PARALLEL.md`. `[NOT_CONTAINED]`/`[CUSTOM]` and dependent modules stay inline/sequential.
1. **When running as a dispatched agent** → write only inside your assigned module folder. Outer barrels, `app/` pages, parent AI.md, and `.todo` belong to the orchestrator — report the exact wiring lines instead of writing them (see `.claude/agents/module-builder.md`). Items 3, 11, and 13 are **orchestrator-only** — as a dispatched agent, never attempt git operations, agent dispatch, or reviews.
1. **After each phase** (orchestrator) → commit (repo format), then run the dual adversarial review per `.claude/PARALLEL.md` Section 7 unless the phase doesn't warrant it.
