# FormWrapper — Usage Guide

Form state engine for `@peppermint/admin`. Handles multi-step navigation, per-step field validation, per-step API calls (create on first visit, patch on re-visit), entity ID storage across steps, and dirty tracking — no prop drilling required.

```ts
import {
  FormWrapper,
  useFormInstance,
  useFormControls,
} from "@peppermint/admin";
import type { StepApiConfig } from "@peppermint/admin";
```

---

## When to use directly

`FormWrapper` is the low-level primitive. In most cases you want `FormShell`, which composes `FormWrapper` with a header, stepper, and footer already wired. Use `FormWrapper` directly when:

- You need a custom layout that `FormShell` can't accommodate
- You're building a form inside a modal with your own shell
- You want only the state engine without opinionated chrome

---

## Basic single-step form (no API per step)

For simple forms that submit everything at once, pass only `finalSubmitFn`:

```tsx
"use client";
import { TextInput, Button } from "@peppermint/ui";
import {
  FormWrapper,
  useFormInstance,
  useFormControls,
} from "@peppermint/admin";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

type ContactForm = z.infer<typeof schema>;

export function ContactFormExample() {
  return (
    <FormWrapper<ContactForm>
      initial={{ name: "", email: "" }}
      validation={[schema]}
      finalSubmitFn={async (data) => {
        const res = await fetch("/api/contact", {
          method: "POST",
          body: JSON.stringify(data),
        });
        return { ok: res.ok };
      }}
      formClearOnSuccess
    >
      <ContactFields />
      <SubmitButton />
    </FormWrapper>
  );
}

function ContactFields() {
  const { form } = useFormInstance<ContactForm>();
  return (
    <>
      <TextInput label="Name" {...form.getInputProps("name")} />
      <TextInput label="Email" {...form.getInputProps("email")} />
    </>
  );
}

function SubmitButton() {
  const { isLoading, handleSubmit } = useFormControls();
  return (
    <Button loading={isLoading} onClick={handleSubmit}>
      Save
    </Button>
  );
}
```

---

## Multi-step form with per-step API calls

The key pattern: each step declares a `StepApiConfig` that fires either `on-next` (when the user advances) or `on-submit` (when the final submit button is clicked). Steps without a config are validation-only.

```tsx
"use client";
import {
  FormWrapper,
  useFormInstance,
  useFormControls,
} from "@peppermint/admin";
import type { StepApiConfig } from "@peppermint/admin";
import { z } from "zod";

// --- Types ---
interface CampaignForm extends Record<string, unknown> {
  name: string;
  goal: string;
  budget: number;
  audience: string;
}

// --- Schemas (one per step, sparse array) ---
const step0Schema = z.object({
  name: z.string().min(1),
  goal: z.string().min(1),
});
const step1Schema = z.object({ budget: z.number().min(1, "Budget required") });
// step 2 has no schema — review only

// --- Per-step API configs ---
const STEP_CONFIGS: (StepApiConfig<CampaignForm> | undefined)[] = [
  {
    // Step 0 — creates the campaign on first Next, patches on re-visit
    mode: "on-next",
    createFn: async (data) => campaignApi.create(data),
    patchFn: async (id, data) => campaignApi.patch(id, data),
  },
  {
    // Step 1 — patches budget using the ID from step 0
    mode: "on-next",
    createFn: async (data, stepIds) =>
      campaignApi.patchBudget(stepIds[0], data),
    patchFn: async (id, data) => campaignApi.patchBudget(id, data),
  },
  // Step 2 — review only, no API call
  undefined,
];

export function CampaignWizard() {
  return (
    <FormWrapper<CampaignForm>
      initial={{ name: "", goal: "", budget: 0, audience: "" }}
      stepApiConfigs={STEP_CONFIGS}
      finalSubmitFn={async (data, stepIds) => {
        // stepIds[0] = campaign ID from step 0
        return campaignApi.publish(stepIds[0], data);
      }}
      onStepSuccess={(stepIndex, id) => {
        // Update the URL after step 0 creates the entity
        if (stepIndex === 0 && id) router.replace(`/campaigns/${id}/edit`);
      }}
      validation={[step0Schema, step1Schema]}
      stepFields={[["name", "goal"], ["budget"], ["audience"]]}
      hasDirtCheck
    >
      <CampaignFormBody />
    </FormWrapper>
  );
}
```

### Create vs patch — how it works

`FormWrapper` keeps a `stepIds` map (`Record<number, string>`) internally. When a step's API call succeeds and returns `{ data: { id: '...' } }`, that ID is stored at `stepIds[stepIndex]`.

On every subsequent `handleStepNext` for that step:

- If `stepIds[stepIndex]` exists → calls `patchFn(id, data, stepIds)`
- If not → calls `createFn(data, stepIds)`

This means going back and clicking Next again **never creates a duplicate** — it always patches.

`stepIds` is available on `useFormControls()` so any child component can read it:

```tsx
function Step1() {
  const { stepIds } = useFormControls();
  const campaignId = stepIds[0]; // ID returned by step 0's createFn
  // ...
}
```

---

## `on-next` vs `on-submit`

| Mode          | When the API fires                           | Use for                                                                                 |
| ------------- | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| `'on-next'`   | When the user clicks Next on that step       | Creating/patching a resource progressively (user can see the URL update, partial saves) |
| `'on-submit'` | When the user clicks the final Submit button | Data that only makes sense to write after all earlier steps are done                    |

Steps with `mode: 'on-submit'` fire in array order before `finalSubmitFn`. If any fails, the sequence stops and `finalSubmitFn` does not run.

---

## `StepApiConfig<T>` shape

```ts
interface StepApiConfig<T> {
  mode: "on-next" | "on-submit";

  // Create path — called when stepIds[stepIndex] is not set yet
  createFn: (
    data: Partial<T>,
    stepIds: Record<number, string>,
  ) => Promise<ApiResponse<{ id?: string } | undefined>>;

  // Patch path — called when stepIds[stepIndex] already exists
  // If omitted, createFn is always used
  patchFn?: (
    id: string,
    data: Partial<T>,
    stepIds: Record<number, string>,
  ) => Promise<ApiResponse>;
}
```

`data` contains only the fields listed in `stepFields[stepIndex]`. If `stepFields` has no entry for that step, full form values are sent.

`stepIds` passed into both functions gives access to IDs from all earlier steps — so step 2 can reference the ID created in step 0.

If `createFn` returns `{ ok: true, data: { id: 'abc' } }`, `'abc'` is stored as `stepIds[stepIndex]` and passed to `onStepSuccess`.

---

## `finalSubmitFn`

Called after all `on-submit` step APIs complete. Receives the full form values and the complete `stepIds` map.

```ts
finalSubmitFn?: (data: T, stepIds: Record<number, string>) => Promise<ApiResponse>
```

Use this for the final write that depends on all earlier resources being created.

---

## `onStepSuccess`

Callback fired after any step API call succeeds (both `on-next` and `on-submit`).

```ts
onStepSuccess?: (stepIndex: number, id: string | undefined, responseData: unknown) => void
```

Common use: update the URL when step 0 creates the entity:

```tsx
onStepSuccess={(stepIndex, id) => {
  if (stepIndex === 0 && id) router.replace(`/products/${id}/edit`);
}}
```

---

## Props reference

| Prop                 | Type                                                                 | Required | Notes                                                                                                             |
| -------------------- | -------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `initial`            | `T`                                                                  | Yes      | Read once at mount — changing after mount has no effect                                                           |
| `stepApiConfigs`     | `(StepApiConfig<T> \| undefined)[]`                                  | No       | Sparse — index matches step. Omit a slot for validation-only steps                                                |
| `finalSubmitFn`      | `(data: T, stepIds: Record<number, string>) => Promise<ApiResponse>` | No       | Fires on Submit after all `on-submit` configs complete                                                            |
| `onStepSuccess`      | `(stepIndex, id, responseData) => void`                              | No       | Called after any step API succeeds                                                                                |
| `validation`         | `ZodSchema[]`                                                        | No       | Sparse — `validation[i]` applies to step `i`                                                                      |
| `stepFields`         | `string[][]`                                                         | No       | Field dot-paths validated on `handleStepNext` at each step. Also scopes what `data` is sent to step API functions |
| `disabledSteps`      | `number[]`                                                           | No       | Step indices skipped during Next/Back navigation                                                                  |
| `formClearOnSuccess` | `boolean`                                                            | No       | Calls `form.reset()` after final submit succeeds                                                                  |
| `hasDirtCheck`       | `boolean`                                                            | No       | Exposes live `isDirty` in `useFormControls()`. Adds re-renders on keystrokes — only enable when needed            |

---

## `useFormInstance<T>()`

Returns the stable Mantine form instance. Use inside any component that renders fields.

```tsx
const { form } = useFormInstance<MyFormValues>();

form.getInputProps("fieldName");
form.values;
form.errors;
form.setFieldValue("fieldName", value);
form.insertListItem("tags", "");
form.removeListItem("tags", 2);
```

Re-renders only when field values change. Never re-renders on step navigation or submit state changes.

---

## `useFormControls()`

Returns navigation, submission, and step ID state.

```tsx
const {
  current, // current step index (0-based)
  isLoading, // true while any API call is in flight
  stepStatus, // Record<number, 'pending' | 'complete' | 'error'>
  stepIds, // Record<number, string> — IDs returned by per-step APIs
  completionPct, // 0–100; always 0 for single-step forms
  isDirty, // true when any field differs from initial (only when hasDirtCheck={true})
  handleSubmit, // validates all fields, runs on-submit configs, then calls finalSubmitFn
  handleStepNext, // validates stepFields[current], runs on-next config if present, then advances
  handleStepBack, // goes back one step (skips disabledSteps)
  handleStepGo, // jumps to a specific step index
} = useFormControls();
```

Re-renders only when navigation, loading, or `stepIds` changes. Never re-renders on keystrokes (unless `hasDirtCheck` is active).

---

## Validation flow

1. User clicks **Next** → `handleStepNext` validates only `stepFields[current]`
2. If validation fails → step marked `'error'`, navigation blocked
3. If validation passes and step has `mode: 'on-next'` config → API fires (create or patch)
4. If API fails → step marked `'error'`, notification shown, navigation blocked
5. If API succeeds (or no config) → step marked `'complete'`, advances

On **Submit**:

1. Full form validation runs across all fields
2. All `on-submit` step configs fire in sequence
3. `finalSubmitFn` is called with full values + `stepIds`

---

## Skipping steps dynamically

Read form values and compute `disabledSteps` in the parent — `FormWrapper` skips them automatically during Next/Back:

```tsx
function ProductWizard() {
  const [disabledSteps, setDisabledSteps] = useState<number[]>([]);

  return (
    <FormWrapper
      ...
      disabledSteps={disabledSteps}
    >
      <WizardBody onFormChange={(values) => {
        // Skip ratings step for services (no physical product)
        setDisabledSteps(values.type === 'service' ? [2] : []);
      }} />
    </FormWrapper>
  );
}
```

---

## apiResponse shape

All API functions must return `{ ok: boolean; message?: string; data?: T }`. On `!ok`, `FormWrapper` shows a red notification with `message` and marks the current step as `'error'`.

```ts
// module.api.ts
export async function createProduct(
  data: Partial<ProductForm>,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const res = await api.post<{ id: string }>("/products", data);
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, message: extractErrorMessage(err) };
  }
}
```

---

## Common mistakes

**Don't pass unstable `initial` values:**

```tsx
// Wrong — query re-renders parent, FormWrapper remounts, form resets
function EditPage({ id }) {
  const { data } = useQuery(...);
  return <FormWrapper initial={data} ...>; // data is undefined on first render
}

// Right — wait for data before mounting FormWrapper
function EditPage({ id }) {
  const { data } = useQuery(...);
  if (!data) return <Loader />;
  return <FormWrapper initial={data} ...>;
}
```

**Don't mix field and navigation concerns in one component** — they subscribe to different contexts. Mixing them causes the whole component to re-render on both keystrokes and navigation changes.

**Don't call `useFormInstance` or `useFormControls` outside `<FormWrapper>`** — both throw with a clear message.
