# MultiPageModule — Build Guide (Contained · 2–4 routes)

> Read this after the router (`SKILL.md`) has landed you on **Contained · 2–4 routes**.
> A MultiPageModule owns distinct URLs (list / new / edit / view) and mounts
> `DataTableShell` + `FormWrapper` + `FormShell`. For a single route with modal
> create/edit, use `reference/contained-single-page.md` instead.

## When to use

- Module needs distinct URLs: `/products`, `/products/new`, `/products/:id/edit`, `/products/:id`
- Form is complex: multi-step, file uploads, or a dedicated detail/view page

## File structure

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

## Step 1 — `module.api.ts`

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

## Step 2 — `form/<name>Form.types.ts`

```ts
export interface ProductFormValues {
  title: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
}
```

## Step 3 — `form/<name>Form.initial.ts`

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

## Step 4 — `form/<name>Form.schemas.ts`

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

## Step 5 — `form/steps/Step<Name>.tsx`

> **Before writing the fields, run `/form-builder`** (CLAUDE.md Development-Workflow
> checklist) — it decides the controls, ordering, grouping, step boundaries, and
> disclosure. The step components below are only where that decision is rendered.

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

## Step 6 — `form/index.tsx`

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

## Step 7 — `pages/list/list.columns.ts`

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

## Step 8 — `pages/list/index.tsx`

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

## Step 9 — `pages/new/index.tsx` and `pages/edit/index.tsx`

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

## Step 10 — `pages/view/index.tsx`

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

## Step 11 — `index.ts`

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

## Step 12 — App pages

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

## Step 13 — `modules/admin/<name>/docs/AI.md`

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

## Common Mistakes — Do Not Make These (MultiPage)

### `forceFilter` vs `filter` in tabs

```tsx
// ❌ fetches all rows from the server, then discards non-matching ones client-side
{ label: "Active", forceFilter: (rows) => rows.filter(r => r.status === "active") }

// ✅ sends { status: "active" } as params.filters to the server
{ label: "Active", filter: { status: "active" } }
```

### Not wrapping shells in `ModalPaper`

```tsx
// ❌ shell floats with no visual container — also applies to DataTableShell / form pages
// ❌ hand-rolled Paper — fights ModalPaper's height/radius defaults and drifts out of sync
export function ProductsList() {
  return (
    <Paper p={0} withBorder radius="var(--mantine-radius-default)" h="calc(100vh - 16px)">
      <DataTableShell<Product> ... />
    </Paper>
  );
}

// ✅ always wrap with ModalPaper — no manual radius/h (every list/new/edit/view page)
export function ProductsList() {
  return (
    <ModalPaper withBorder>
      <DataTableShell<Product> ... />
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
```

### Inconsistent column header icons

`DataTableShell` renders a column's `icon` in the table header beside the title. A
consistent icon set reads better, so a header icon is a strong default — add one where
it aids scanning. Skip it only when no icon meaningfully represents the column; avoid a
table where only some columns carry icons at random.

### Untyped tabs array

```tsx
// ❌ TypeScript won't catch prop name mistakes
const tabs = [{ label: "Active", filter: { status: "active" } }];

// ✅
const tabs: DataTableShellTab[] = [
  { label: "Active", icon: CheckCircleIcon, filter: { status: "active" } },
];
```

### Importing from inside a module

```tsx
// ❌ bypasses the module's public API
import { ProductsList } from "@/modules/admin/product/pages/list";

// ✅ always go through the module export
import { ModuleProducts } from "@/modules/admin/product";
export default ModuleProducts.main;
```

### Missing `key` on step components

```tsx
// ❌ React cannot key step transitions
const STEP_COMPONENTS = [<StepIdentity />, <StepPricing />];

// ✅
const STEP_COMPONENTS = [
  <StepIdentity key="identity" />,
  <StepPricing key="pricing" />,
];
```
