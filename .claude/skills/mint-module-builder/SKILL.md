---
name: mint-module-builder
description: >
  Know-how and build guide for the Mojito app (Peppermint monorepo). Read this before
  building any module or page. Covers stack rules, the Contained/Not-Contained
  decision, ContainedModule and MultiPageModule patterns, file structure, and
  common mistakes. Use as a bootstrap doc when given a requirements document.
model: opus
---

# Mojito AI Usage Guide

This is the authoritative build guide for the Mojito app and the Peppermint monorepo.
Reading this replaces the need to re-scan the repository before building a module.

---

## 1. Stack at a Glance

| Concern | Tool | Rule |
|---|---|---|
| UI components | `@peppermint/ui` | Always import from here — never from `@mantine/*` directly |
| Forms | `@mantine/form` via `@peppermint/ui` | Never React Hook Form or any other form library |
| Server state | React Query (`useQuery` / `useMutation`) | No fetching in `useEffect`; no direct Axios in event handlers |
| Global client state | Zustand | Colocate in `<Component>.store.ts` |
| Scoped subtree state | React Context | |
| Local component state | `useState` | |
| Routing | Next.js App Router | `app/` directory only; no client-side router libraries |
| Icons | Phosphor Icons | Default weight `regular`; always `aria-label` on meaningful icons |
| Animations | Framer Motion | Duration > 300ms or layout-shifting → check `useReducedMotion()` |
| Admin shells | `@peppermint/admin` | `ModalTableShell`, `DataTableShell`, `FormWrapper`, `FormShell` |
| HTTP client | `@peppermint/api-client` or the app's `src/lib/api.ts` | Never instantiate Axios inline |

**TypeScript:** strict mode. No `any`. No `@ts-ignore` without an explanatory comment.
Functional components only. Props typed as `[Name]Props` in `<Name>.types.ts`.

---

## 2. Contained vs Not Contained — Decision Rule

Before building any module or page, decide:

### Contained
A module is **Contained** when it maps to one of the admin framework patterns — it manages a list of records with create / edit / delete functionality. This is the default for most feature modules.

> A *list of cards* is still **Contained**. Being a list means the normal module rules apply. The "cards" exception does **not** extend to lists of cards.

Use `ModalTableShell` (ContainedModule) or `DataTableShell` + `FormWrapper` + `FormShell` (MultiPageModule) as appropriate.

### Not Contained
A module is **Not Contained** ONLY when it is:
- A **reporting page** (charts, KPIs, analytics dashboards with no CRUD)
- A **page composed of information cards** (a status overview, a settings summary page made entirely of info panels)

Not Contained pages do not use the admin shells. Build them as regular Next.js pages following the standard component structure.

---

## 3. Picking the Right Module Pattern

Once you know a module is **Contained**, pick the shape by route count:

| Pattern | Route count | Shell | Use when |
|---|---|---|---|
| **ContainedModule** | 1 | `ModalTableShell` | Single list page; create & edit open in modals/drawers; form has ≤ ~8 fields |
| **MultiPageModule** | 2–4 | `DataTableShell` + `FormWrapper` + `FormShell` | Complex form, multi-step wizard, file uploads, or a dedicated detail/view page |

The CRUD strategies (`ModalModule`, `RouteModule`) documented elsewhere refer to the same two options under different terminology. `ModalModule` = ContainedModule; `RouteModule` = MultiPageModule.

---

## 4. ContainedModule — Build Guide

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

Entity **must** extend `Record<string, unknown>` — required by the shell's generic constraint.

```ts
export type StudentStatus = "active" | "on-leave" | "graduated" | "dropped";

export interface Student extends Record<string, unknown> {
  id: string;
  fullName: string;
  email: string;
  status: StudentStatus;
  enrolledAt: string;
}

export interface StudentsFetchResponse {
  data: Student[];
  meta: { total: number; page: number; pageSize: number };
}
```

### Step 2 — `<name>.queryKeys.ts`

```ts
export const studentQueryKeys = {
  list: () => "students.list",
};
```

### Step 3 — `<name>.api.ts`

Use `QueryParams` from `@peppermint/admin` — matches what the shell passes automatically.

```ts
import type { QueryParams } from "@peppermint/admin";
import type { Student, StudentsFetchResponse } from "./students.types";

export async function fetchStudents(params?: QueryParams): Promise<StudentsFetchResponse> {
  // params.filters.status — set by the active tab
  // params.search, params.page, params.pageSize, params.sort — standard pagination
}

export async function createStudent(values: Partial<Student>): Promise<Student> { /* ... */ }
export async function updateStudent(id: string, values: Partial<Student>): Promise<Student> { /* ... */ }
export async function deleteStudent(id: string): Promise<void> { /* ... */ }
```

### Step 4 — `pages/list/<name>.columns.tsx`

Use `DataTableShellColumn<T>`. The default rule is **no `render`** — the shell renders plain values correctly on its own. Only add a `render` function when the output genuinely cannot be expressed as plain text: a colored badge, an icon, a stacked multi-line cell. Never wrap plain text in `<Text>` just to have a `render`. When you do use `render`, every piece of text inside it must be `size="xs"` unless there is a specific, documented reason to go larger.

**Every column must pass an `icon`** (Phosphor icon component from `@phosphor-icons/react/dist/csr/*`). `DataTableShell` renders it beside the column title in the table header — do not skip icons on list columns.

```tsx
import type { DataTableShellColumn } from "@peppermint/admin";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/csr/Envelope";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import type { Student } from "../../students.types";

export const studentsColumns: DataTableShellColumn<Student>[] = [
  { accessor: "fullName", title: "Full Name", icon: UserIcon, sortable: true },
  { accessor: "email",    title: "Email",     icon: EnvelopeIcon, sortable: true },
  {
    accessor: "status",
    title: "Status",
    icon: PulseIcon,
    render: (record) => <Badge size="xs" color={colorMap[record.status]}>{record.status}</Badge>,
  },
];
```

### Step 5 — `form/<Name>Form.tsx`

The form owns its submit button. `ModalTableShell` injects `initialValues`, `onSubmit`, and `isLoading`.

```tsx
import { Stack, TextInput, Select, Button, useForm } from "@peppermint/ui";
import type { StudentFormProps } from "./StudentForm.types";
import type { Student } from "../students.types";

export function StudentForm({ initialValues, onSubmit, isLoading }: StudentFormProps) {
  const form = useForm<Student>({
    initialValues: initialValues ?? { fullName: "", email: "", status: "active" },
    validate: {
      fullName: (v) => (!v ? "Required" : null),
      email:    (v) => (!v ? "Required" : !/^\S+@\S+$/.test(v) ? "Invalid email" : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md" p="md">
        <TextInput label="Full Name" required disabled={isLoading} {...form.getInputProps("fullName")} />
        <TextInput label="Email" type="email" required disabled={isLoading} {...form.getInputProps("email")} />
        <Select label="Status" data={[
          { value: "active",     label: "Active" },
          { value: "on-leave",   label: "On Leave" },
          { value: "graduated",  label: "Graduated" },
          { value: "dropped",    label: "Dropped" },
        ]} disabled={isLoading} {...form.getInputProps("status")} />
        <Button type="submit" loading={isLoading} fullWidth>
          {initialValues?.id ? "Update Student" : "Create Student"}
        </Button>
      </Stack>
    </form>
  );
}
```

`form/<Name>Form.types.ts`:

```ts
import type { Student } from "../students.types";

export interface StudentFormProps {
  initialValues?: Student;
  onSubmit: (values: Student) => void;
  isLoading?: boolean;
}
```

### Step 6 — `pages/list/<Name>List.tsx`

Always wrap the shell in `<Paper p={0} withBorder radius="var(--mantine-radius-default)" h="calc(100vh - 16px)">`.
Use `radius="var(--mantine-radius-default)"` — not a hardcoded size like `"md"` — so the section always respects whatever the app's Mantine theme configures as its default radius.
Tabs must be typed as `DataTableShellTab[]`. Use `filter` (not `forceFilter`) — `filter` sends values to the server via `params.filters`.

```tsx
"use client";

import { ModalTableShell } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import type { DataTableShellTab } from "@peppermint/admin";
import { UsersIcon }       from "@phosphor-icons/react/dist/csr/Users";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "../../students.api";
import { studentsColumns } from "./students.columns";
import { studentQueryKeys } from "../../students.queryKeys";
import { StudentForm } from "../../form/StudentForm";
import type { Student } from "../../students.types";

const tabs: DataTableShellTab[] = [
  { label: "All Students", icon: UsersIcon },
  { label: "Active",       icon: CheckCircleIcon, filter: { status: "active" } },
];

export function StudentsList() {
  return (
    <Paper p={0} withBorder radius="var(--mantine-radius-default)" h="calc(100vh - 16px)">
      <ModalTableShell<Student>
        queryKey={studentQueryKeys.list()}
        queryGetFn={fetchStudents}
        dataKey="data"
        paginationKey="meta"
        columns={studentsColumns}
        moduleInfo={{ name: "students", label: "Students", description: "Manage students" }}
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

### Step 7 — `index.ts`

Single named export. No internals exposed.

```ts
export { StudentsList as ModuleStudents } from "./pages/list/StudentsList";
```

### Step 8 — `app/admin/<name>/page.tsx`

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
| Task | Files |
|---|---|
| List UI | pages/list/<Name>List.tsx |
| Form UI | <Name>Form.tsx |
| Queries | <name>.queryKeys.ts, module.api.ts |
| Types | <name>.types.ts |

## State ownership
- Server data: React Query
- Local UI state: useState

## Do not do
- Do not fetch data in useEffect.
- Do not import Mantine directly.
```

After creating, run `/update-ai-map` to add the module to the app's `docs/AI.md` Major Modules table.

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

All entity types and API functions in one file. Entity must extend `Record<string, unknown>`.

```ts
import type { QueryParams } from "@peppermint/admin";

export interface Product extends Record<string, unknown> {
  id: number;
  title: string;
  category: string;
  price: number;
  stock: number;
  availabilityStatus: string;
}

export interface ProductsResponse {
  products: Product[];
  meta: { total: number };
}

export async function fetchProducts(params?: QueryParams): Promise<ProductsResponse> { /* ... */ }
export async function fetchProduct(id: number): Promise<Product> { /* ... */ }
export async function createProduct(data: Partial<Product>): Promise<Product> { /* ... */ }
export async function updateProduct(id: number, data: Partial<Product>): Promise<Product> { /* ... */ }
export async function deleteProduct(id: number): Promise<void> { /* ... */ }
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
  title: "", brand: "", category: "", price: 0, stock: 0,
};
```

### Step 4 — `form/<name>Form.schemas.ts`

One Zod schema per step. `STEP_FIELDS` maps each step index to its field names — `FormWrapper` runs only that step's validation when advancing.

```ts
import { z } from "zod";

export const identitySchema = z.object({
  title:    z.string().min(1, "Required"),
  brand:    z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
});

export const pricingSchema = z.object({
  price: z.number().positive("Must be positive"),
  stock: z.number().int().min(0),
});

export const PRODUCT_STEP_FIELDS: string[][] = [
  ["title", "brand", "category"],  // step 0
  ["price", "stock"],               // step 1
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
      <TextInput label="Title"    required {...form.getInputProps("title")} />
      <TextInput label="Brand"    required {...form.getInputProps("brand")} />
      <TextInput label="Category" required {...form.getInputProps("category")} />
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
import { identitySchema, pricingSchema, PRODUCT_STEP_FIELDS } from "./productForm.schemas";
import { StepIdentity } from "./steps/StepIdentity";
import { StepPricing }  from "./steps/StepPricing";
import type { ProductFormValues } from "./productForm.types";

const STEPS = [
  { label: "Identity", description: "Name, brand & category" },
  { label: "Pricing",  description: "Price & stock" },
];

const STEP_COMPONENTS = [
  <StepIdentity key="identity" />,
  <StepPricing  key="pricing"  />,
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

Same strict rule as ContainedModule: **no `render` by default**. Only add one when the cell genuinely needs a badge, icon, or multi-line layout that plain text cannot express. Every text element inside any `render` must be `size="xs"` unless there is a specific, documented reason to go larger.

**Every column must pass an `icon`** (Phosphor icon component from `@phosphor-icons/react/dist/csr/*`) so `DataTableShell` can render it in the table header beside the title.

```tsx
import type { DataTableShellColumn } from "@peppermint/admin";
import { CurrencyDollarIcon } from "@phosphor-icons/react/dist/csr/CurrencyDollar";
import { PackageIcon } from "@phosphor-icons/react/dist/csr/Package";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { Text } from "@peppermint/ui";
import type { Product } from "../../module.api";

export const PRODUCT_COLUMNS: DataTableShellColumn<Product>[] = [
  { accessor: "title",    title: "Product",  icon: PackageIcon, key: "title",    sortable: true, width: 260 },
  { accessor: "brand",    title: "Brand",    icon: TagIcon,     key: "brand",    sortable: true, width: 140 },
  { accessor: "category", title: "Category", icon: TagIcon,     key: "category", sortable: true, width: 140 },
  { accessor: "price",    title: "Price",    icon: CurrencyDollarIcon, key: "price", sortable: true, width: 100,
    render: (row) => <Text size="xs">${row.price.toFixed(2)}</Text> },
  { accessor: "availabilityStatus", title: "Status", icon: PulseIcon, key: "status", width: 130 },
];
```

### Step 8 — `pages/list/index.tsx`

Wrap in Paper. Tabs typed as `DataTableShellTab[]`. Use `filter`, not `forceFilter`. Set `enableServerQuery`.

```tsx
"use client";

import { DataTableShell } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import type { DataTableShellTab } from "@peppermint/admin";
import { PackageIcon }    from "@phosphor-icons/react/dist/csr/Package";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { fetchProducts } from "../../module.api";
import { PRODUCT_COLUMNS } from "./list.columns";
import type { Product } from "../../module.api";

const STATUS_TABS: DataTableShellTab[] = [
  { label: "All Products", icon: PackageIcon },
  { label: "In Stock",     icon: CheckCircleIcon, filter: { availabilityStatus: "In Stock" } },
];

export function ProductsList() {
  return (
    <Paper p={0} withBorder radius="var(--mantine-radius-default)" h="calc(100vh - 16px)">
      <DataTableShell<Product>
        queryKey="products.list"
        queryGetFn={(params) => fetchProducts(params)}
        dataKey="products"
        paginationKey="meta"
        enableServerQuery
        columns={PRODUCT_COLUMNS}
        moduleInfo={{ name: "Product", label: "Products", description: "Manage your product catalogue" }}
        basePath="/admin/product-management/products"
        tabs={STATUS_TABS}
        pageSizes={[10, 20, 50, 100]}
        defaultPageSize={20}
      />
    </Paper>
  );
}
```

`basePath` drives automatic link generation: New → `${basePath}/new`, Edit → `${basePath}/${id}/edit`, View → `${basePath}/${id}`.

### Step 9 — `pages/new/index.tsx` and `pages/edit/index.tsx`

Both are thin wrappers. Wrap in Paper. `onBack` calls `history.back()`.

```tsx
"use client";
import { Paper } from "@peppermint/ui";
import { ProductForm } from "../../form";

export function ProductsNew() {
  return (
    <Paper p={0} withBorder radius="var(--mantine-radius-default)" h="calc(100vh - 16px)">
      <ProductForm onBack={() => history.back()} />
    </Paper>
  );
}
```

### Step 10 — `pages/view/index.tsx`

```tsx
"use client";
import { useParams } from "next/navigation";
import { Paper } from "@peppermint/ui";
import { ProductView } from "./ProductView";

export function ProductsView() {
  const { id } = useParams<{ id: string }>();
  return (
    <Paper p={0} withBorder radius="var(--mantine-radius-default)" h="calc(100vh - 16px)">
      <ProductView productId={id} />
    </Paper>
  );
}
```

### Step 11 — `index.ts`

Export an object — consumers pick the page they need; no deep imports into module internals.

```ts
import { ProductsList } from "./pages/list";
import { ProductsNew }  from "./pages/new";
import { ProductsEdit } from "./pages/edit";
import { ProductsView } from "./pages/view";

export const ModuleProducts = {
  main: ProductsList,
  new:  ProductsNew,
  edit: ProductsEdit,
  view: ProductsView,
};
```

### Step 12 — App pages

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
| Route | File |
|---|---|
| /admin/<name> | pages/list/ |
| /admin/<name>/new | pages/new/ |
| /admin/<name>/[id] | pages/view/ |
| /admin/<name>/[id]/edit | pages/edit/ |

## Entry files
- index.ts (exports Module<Name>)

## Common edit targets
| Task | Files |
|---|---|
| List page | pages/list/ |
| Form steps | form/steps/ |
| View page | pages/view/ |
| Queries | <name>.queryKeys.ts, <name>.api.ts |
| Types | <name>.types.ts |

## State ownership
- Server data: React Query
- Form state: @mantine/form via FormWrapper
- Shareable filters: URL search params

## Do not do
- Do not fetch data in useEffect.
- Do not import Mantine directly.
```

After creating, run `/update-ai-map` to add the module to the app's `docs/AI.md` Major Modules table.

---

## 6. Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Folders | `kebab-case` | `user-profile/`, `channels/` |
| Component files | `PascalCase` | `UserCard.tsx`, `ChannelForm.tsx` |
| Non-component files | `camelCase` | `queryKeys.ts`, `channels.api.ts` |
| Layout exports | `Layout<Name>` | `LayoutRoot`, `LayoutAdmin` |
| Module exports | `Module<Name>` | `ModuleChannels`, `ModuleProducts` |
| Module object pages | `main`, `new`, `edit`, `view` | `ModuleProducts.main` |
| Layout folders | `kebab-case` matching the export | `root-layout` → `LayoutRoot` |
| Module folders | `kebab-case` matching the export | `product` → `ModuleProducts` |

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

| Data type | Where it lives |
|---|---|
| Server / async data | React Query (`useQuery` / `useMutation`) |
| Global client state (shared across components) | Zustand in `<Component>.store.ts` or `stores/` |
| Scoped subtree state | React Context |
| Local component state | `useState` |

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

### Not extending `Record<string, unknown>` on the entity
```ts
// ❌ causes a generic constraint error in DataTableShellColumn<T> and ModalTableShell<T>
export interface Student { id: string; name: string; }

// ✅
export interface Student extends Record<string, unknown> { id: string; name: string; }
```

### Not wrapping shells in Paper
```tsx
// ❌ shell floats with no visual container
export function StudentsList() {
  return <ModalTableShell<Student> ... />;
}

// ✅ always wrap with the full Paper spec
export function StudentsList() {
  return (
    <Paper p={0} withBorder radius="var(--mantine-radius-default)" h="calc(100vh - 16px)">
      <ModalTableShell<Student> ... />
    </Paper>
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

The default is **no `render`**. The shell handles plain values. Only add `render` when the cell genuinely requires a badge, icon, or multi-line layout. Every text element inside `render` must be `size="xs"` unless there is a specific reason to go larger.

```tsx
// ❌ render used for plain text — never do this
{ accessor: "email", render: (r) => <Text>{r.email}</Text> }

// ✅ plain text needs no render
{ accessor: "email", title: "Email", sortable: true }

// ❌ render justified but text size not set — always set it
{ accessor: "status", render: (r) => <Badge>{r.status}</Badge> }

// ✅ render justified, text size explicitly xs
{ accessor: "status", render: (r) => <Badge size="xs">{r.status}</Badge> }
{ accessor: "price",  render: (r) => <Text size="xs">${r.price.toFixed(2)}</Text> }

// ❌ text size bumped up with no reason
{ accessor: "name", render: (r) => <Text size="sm">{r.name}</Text> }

// ✅ if text must be rendered, xs unless there is a documented reason otherwise
{ accessor: "name", render: (r) => <Text size="xs">{r.name}</Text> }
```

### Missing column header icons

Every entry in `list.columns.ts` / `list.columns.tsx` must include an `icon` on each column. `DataTableShell` uses it in the table header — columns without `icon` render title-only headers and break the list UI convention.

```tsx
// ❌ no header icon
{ accessor: "email", title: "Email", sortable: true }

// ✅ pass a Phosphor icon component
import { EnvelopeIcon } from "@phosphor-icons/react/dist/csr/Envelope";
{ accessor: "email", title: "Email", icon: EnvelopeIcon, sortable: true }
```

### Untyped tabs array
```tsx
// ❌ TypeScript won't catch prop name mistakes
const tabs = [{ label: "Active", filter: { status: "active" } }];

// ✅
const tabs: DataTableShellTab[] = [{ label: "Active", icon: CheckCircleIcon, filter: { status: "active" } }];
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
const STEP_COMPONENTS = [<StepIdentity key="identity" />, <StepPricing key="pricing" />];
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
[mojito/channels] add: ContainedModule for channel management
[@peppermint/admin/DataTableShell] fix: server filter not sent on tab change
[mojito/products] update: add pricing step to MultiPageModule form
```

---

## 11. Package Imports Quick Reference

```ts
// UI components (Mantine wrappers — always use this)
import { Paper, Stack, TextInput, Select, Button, Badge, Text } from "@peppermint/ui";
import { useForm } from "@peppermint/ui";

// Admin shells
import {
  ModalTableShell,
  DataTableShell,
  FormWrapper,
  FormShell,
  useFormControls,
} from "@peppermint/admin";
import type { DataTableShellColumn, DataTableShellTab, QueryParams } from "@peppermint/admin";

// Icons — always from the CSR path
import { UsersIcon }       from "@phosphor-icons/react/dist/csr/Users";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";

// Routing (Next.js only)
import { useParams, useRouter } from "next/navigation";
```

---

## 12. Building from a Requirements Document — Checklist

Given a requirements doc, follow this sequence:

1. **Decide Contained vs Not Contained** (Section 2).
2. **If Contained — pick ContainedModule or MultiPageModule** (Section 3).
3. **Create the branch**: `git checkout -b dev/<feature-name>`.
4. **Build in order**: types → query keys → API → columns → form → list page → index → app page.
5. **Every page** gets wrapped in `<Paper p={0} withBorder radius="var(--mantine-radius-default)" h="calc(100vh - 16px)">`.
6. **Every `app/` page** is a one-line re-export.
7. **Tabs** → always `DataTableShellTab[]`, always `filter` (not `forceFilter`).
8. **Entity type** → always extends `Record<string, unknown>`.
9. **Imports** → always from `@peppermint/ui`, never from `@mantine/*`.
10. **Commit format** → `[app-name/module-name] add: description`.
