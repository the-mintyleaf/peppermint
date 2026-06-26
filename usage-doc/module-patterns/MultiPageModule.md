# MultiPageModule — Usage Guide

A **MultiPageModule** owns multiple routes. Each route is a separate page component; the module exports them together as a named object so app pages stay as thin re-exports.

Use this when:

- The module needs distinct URLs for list, create, edit, and/or detail (e.g. `/products`, `/products/new`, `/products/:id/edit`, `/products/:id`)
- The form is complex — multi-step, file uploads, or a dedicated detail view

Shells used: `DataTableShell` (list) · `FormWrapper` + `FormShell` (new/edit) · custom component (view)

Reference implementation: `apps/mintflow/modules/admin/product/`

---

## File structure

```
modules/admin/
└── <name>/
    ├── index.ts                        # exports Module<Name> = { main, new, edit, view }
    ├── module.api.ts                   # entity type + fetch/create/update/delete
    ├── module.config.ts                # optional — query key, API base, module title
    ├── form/
    │   ├── index.tsx                   # ProductForm — wraps FormWrapper + FormShell
    │   ├── <name>Form.initial.ts       # initial values for FormWrapper
    │   ├── <name>Form.schemas.ts       # per-step Zod schemas + STEP_FIELDS map
    │   ├── <name>Form.types.ts         # FormValues type
    │   └── steps/
    │       ├── Step<A>.tsx             # one component per form step
    │       └── Step<B>.tsx
    └── pages/
        ├── list/
        │   ├── index.tsx               # mounts DataTableShell
        │   └── list.columns.ts         # DataTableShellColumn array
        ├── new/
        │   └── index.tsx               # mounts the form (onBack → history.back)
        ├── edit/
        │   └── index.tsx               # mounts the form with existing values
        └── view/
            ├── index.tsx               # reads :id from useParams, renders detail
            └── <Name>View.tsx          # detail component
```

---

## Step-by-step

### 1. `module.api.ts`

Define the entity type and all API functions in one file. The entity must extend `Record<string, unknown>`.

```ts
import type { QueryParams } from "@peppermint/admin";

export interface Product extends Record<string, unknown> {
  id: number;
  title: string;
  category: string;
  price: number;
  stock: number;
  availabilityStatus: string;
  // ...
}

export interface ProductsResponse {
  products: Product[];
  meta: { total: number };
}

export async function fetchProducts(
  params?: QueryParams,
): Promise<ProductsResponse> {
  // params.filters.availabilityStatus is set by the active tab
  // handle params.page, params.pageSize, params.sort, params.search
}

export async function fetchProduct(id: number): Promise<Product> {
  /* ... */
}
export async function createProduct(data: Partial<Product>): Promise<Product> {
  /* ... */
}
export async function updateProduct(
  id: number,
  data: Partial<Product>,
): Promise<Product> {
  /* ... */
}
export async function deleteProduct(id: number): Promise<void> {
  /* ... */
}
```

### 2. `form/<name>Form.types.ts`

```ts
export interface ProductFormValues {
  title: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  // ...
}
```

### 3. `form/<name>Form.initial.ts`

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

### 4. `form/<name>Form.schemas.ts`

One Zod schema per step. `STEP_FIELDS` maps each step index to the field names it owns — `FormWrapper` uses this to run per-step validation without validating future steps.

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

// maps step index → field names validated at that step
export const PRODUCT_STEP_FIELDS: string[][] = [
  ["title", "brand", "category"], // step 0 — identity
  ["price", "stock"], // step 1 — pricing
];
```

### 5. `form/steps/Step<Name>.tsx`

Step components receive no props — they read form state via `useFormControls()`.

```tsx
import { Stack, TextInput, Select } from "@peppermint/ui";
import { useFormControls } from "@peppermint/admin";
import type { ProductFormValues } from "../productForm.types";

export function StepIdentity() {
  const { form } = useFormControls<ProductFormValues>();
  return (
    <Stack gap="md">
      <TextInput
        label="Title"
        placeholder="iPhone 15 Pro"
        required
        {...form.getInputProps("title")}
      />
      <TextInput
        label="Brand"
        placeholder="Apple"
        required
        {...form.getInputProps("brand")}
      />
      <TextInput
        label="Category"
        placeholder="Smartphones"
        required
        {...form.getInputProps("category")}
      />
    </Stack>
  );
}
```

### 6. `form/index.tsx`

`FormWrapper` owns state and per-step validation. `FormShell` renders the chrome (title, stepper, back button, footer nav). Step components live between them.

```tsx
"use client";

import { useFormControls, FormShell, FormWrapper } from "@peppermint/admin";
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

### 7. `pages/list/list.columns.ts`

Only add a `render` function when the default cell output is insufficient (e.g. a badge, an icon, a stacked line). When you do use `render`, default all text to `size="xs"` unless there is a specific reason to go larger.

```ts
import type { DataTableShellColumn } from "@peppermint/admin";
import type { Product } from "../../module.api";

export const PRODUCT_COLUMNS: DataTableShellColumn<Product>[] = [
  {
    accessor: "title",
    title: "Product",
    key: "title",
    sortable: true,
    width: 260,
  },
  {
    accessor: "brand",
    title: "Brand",
    key: "brand",
    sortable: true,
    width: 140,
  },
  {
    accessor: "category",
    title: "Category",
    key: "category",
    sortable: true,
    width: 140,
  },
  {
    accessor: "price",
    title: "Price",
    key: "price",
    sortable: true,
    width: 100,
    render: (row) => `$${row.price.toFixed(2)}`,
  },
  {
    accessor: "stock",
    title: "Stock",
    key: "stock",
    sortable: true,
    width: 90,
  },
  {
    accessor: "availabilityStatus",
    title: "Status",
    key: "status",
    width: 130,
  },
];
```

`key` can differ from `accessor` — it's used as the column visibility map key. Use a short, stable string.

### 8. `pages/list/index.tsx`

Always wrap the shell in a `Paper` with `p={0}`, `withBorder`, `radius="lg"`, and `h="calc(100vh - 16px)"`. Apply this to every page in the module (list, new, edit, view).

```tsx
"use client";

import { DataTableShell } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import type { DataTableShellTab } from "@peppermint/admin";
import { PackageIcon } from "@phosphor-icons/react/dist/csr/Package";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { fetchProducts } from "../../module.api";
import { PRODUCT_COLUMNS } from "./list.columns";
import type { Product } from "../../module.api";

const STATUS_TABS: DataTableShellTab[] = [
  { label: "All Products", icon: PackageIcon },
  {
    label: "In Stock",
    icon: CheckCircleIcon,
    filter: { availabilityStatus: "In Stock" },
  },
  {
    label: "Low Stock",
    icon: WarningIcon,
    filter: { availabilityStatus: "Low Stock" },
  },
  {
    label: "Out of Stock",
    icon: ProhibitIcon,
    filter: { availabilityStatus: "Out of Stock" },
  },
];

export function ProductsList() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <DataTableShell<Product>
        queryKey="products.list"
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
    </Paper>
  );
}
```

`basePath` drives automatic New / Edit / View link generation. New → `${basePath}/new`, edit → `${basePath}/${id}/edit`, view → `${basePath}/${id}`.

### 9. `pages/new/index.tsx` and `pages/edit/index.tsx`

```tsx
"use client";
import { Paper } from "@peppermint/ui";
import { ProductForm } from "../../form";

export function ProductsNew() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <ProductForm onBack={() => history.back()} />
    </Paper>
  );
}
```

```tsx
"use client";
import { Paper } from "@peppermint/ui";
import { ProductForm } from "../../form";

export function ProductsEdit() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <ProductForm onBack={() => history.back()} />
    </Paper>
  );
}
```

### 10. `pages/view/index.tsx`

```tsx
"use client";
import { useParams } from "next/navigation";
import { Paper } from "@peppermint/ui";
import { ProductView } from "./ProductView";

export function ProductsView() {
  const { id } = useParams<{ id: string }>();
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <ProductView productId={id} />
    </Paper>
  );
}
```

### 11. `index.ts`

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

Consumers import the object and pick the page they need — no deep imports into the module internals.

### 12. App pages

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

---

## Common mistakes

**Using `forceFilter` in tabs when `enableServerQuery` is true**

```tsx
// ❌ fetches ALL products then filters in the browser — breaks server pagination
{ label: "In Stock", forceFilter: (rows) => rows.filter(r => r.availabilityStatus === "In Stock") }

// ✅ sends { availabilityStatus: "In Stock" } as params.filters to the server
{ label: "In Stock", filter: { availabilityStatus: "In Stock" } }
```

**Untyped tabs array**

```tsx
// ❌ TypeScript won't catch mistyped prop names
const STATUS_TABS = [
  { label: "In Stock", filter: { availabilityStatus: "In Stock" } },
];

// ✅
const STATUS_TABS: DataTableShellTab[] = [
  {
    label: "In Stock",
    icon: CheckCircleIcon,
    filter: { availabilityStatus: "In Stock" },
  },
];
```

**Importing page components directly instead of via the module object**

```tsx
// ❌ bypasses the module's public API
import { ProductsList } from "@/modules/admin/product/pages/list";

// ✅ always go through the module export
import { ModuleProducts } from "@/modules/admin/product";
export default ModuleProducts.main;
```

**Logic in `app/page.tsx`**

App pages must be thin re-exports. Any state, hooks, or event handling belongs inside the module.

**Overusing `render` in columns or using the wrong text size**

```tsx
// ❌ render used for plain text — unnecessary
{ accessor: "title", render: (r) => <Text>{r.title}</Text> }

// ✅ no render needed for plain text
{ accessor: "title", title: "Product", sortable: true }

// ❌ render used correctly but text size not set
{ accessor: "availabilityStatus", render: (r) => <Badge>{r.availabilityStatus}</Badge> }

// ✅ when render is needed, text inside is size="xs" by default
{ accessor: "availabilityStatus", render: (r) => <Badge size="xs">{r.availabilityStatus}</Badge> }
{ accessor: "price", render: (r) => <Text size="xs">${r.price.toFixed(2)}</Text> }
```

**Not wrapping pages in Paper**

```tsx
// ❌ page has no visual container
export function ProductsList() {
  return <DataTableShell<Product> ... />;
}

// ✅ every page (list, new, edit, view) gets the full Paper spec
export function ProductsList() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <DataTableShell<Product> ... />
    </Paper>
  );
}
```

**Missing `key` on step components**

Each element in `STEP_COMPONENTS` must have a stable `key` — React uses it when switching steps.
