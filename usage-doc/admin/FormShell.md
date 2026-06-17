# FormShell — Usage Guide

Pre-composed form layout for `@peppermint/admin`. Renders a top bar with breadcrumb and cancel/refill actions, a progress bar, a dirty-state banner, a collapsible stepper, scrollable content, and a sticky footer with Previous / Next / Submit buttons — all wired to `FormWrapper` contexts automatically.

```ts
import { FormWrapper, FormShell } from '@peppermint/admin';
```

`FormShell` must always be rendered inside a `<FormWrapper>`. It reads all state from context — no props for loading, step index, or handlers are required beyond the step definitions.

---

## Single-step form

```tsx
'use client';
import { TextInput } from '@peppermint/ui';
import { FormWrapper, FormShell, useFormInstance } from '@peppermint/admin';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
});
type CreateUserValues = z.infer<typeof schema> & Record<string, unknown>;

function UserFields() {
  const { form } = useFormInstance<CreateUserValues>();
  return (
    <>
      <TextInput label="Name" {...form.getInputProps('name')} />
      <TextInput label="Email" {...form.getInputProps('email')} />
    </>
  );
}

export function CreateUserPage() {
  return (
    <FormWrapper<CreateUserValues>
      initial={{ name: '', email: '' }}
      validation={[schema]}
      finalSubmitFn={async (data) => {
        const res = await fetch('/api/users', { method: 'POST', body: JSON.stringify(data) });
        return { ok: res.ok };
      }}
    >
      <FormShell title="Create User" onBack={() => history.back()}>
        <UserFields />
      </FormShell>
    </FormWrapper>
  );
}
```

Without `steps`, `FormShell` renders no stepper or progress bar, and the footer shows only a Submit button.

---

## Multi-step form

```tsx
'use client';
import { TextInput } from '@peppermint/ui';
import { z } from 'zod';
import { FormWrapper, FormShell, useFormInstance, useFormControls } from '@peppermint/admin';
import type { StepApiConfig } from '@peppermint/admin';

interface OnboardingValues extends Record<string, unknown> {
  name: string;
  email: string;
  street: string;
  city: string;
}

const STEPS = [
  { label: 'Basic Info', description: 'Name and email' },
  { label: 'Address', description: 'Where to ship' },
  { label: 'Review' },
];

const STEP_FIELDS = [
  ['name', 'email'],
  ['street', 'city'],
  [],
];

const STEP_API_CONFIGS: (StepApiConfig<OnboardingValues> | undefined)[] = [
  {
    // Creates the user record on Next, patches on re-visit
    mode: 'on-next',
    createFn: async (data) => userApi.create(data),
    patchFn: async (id, data) => userApi.patch(id, data),
  },
  {
    // Patches address using the user ID from step 0
    mode: 'on-next',
    createFn: async (data, stepIds) => userApi.patchAddress(stepIds[0], data),
    patchFn: async (id, data) => userApi.patchAddress(id, data),
  },
  // Step 2 — review only, no API
  undefined,
];

function StepContent() {
  const { form } = useFormInstance<OnboardingValues>();
  const { current } = useFormControls();

  if (current === 0) return (
    <>
      <TextInput label="Name" {...form.getInputProps('name')} />
      <TextInput label="Email" {...form.getInputProps('email')} />
    </>
  );
  if (current === 1) return (
    <>
      <TextInput label="Street" {...form.getInputProps('street')} />
      <TextInput label="City" {...form.getInputProps('city')} />
    </>
  );
  return <ReviewPanel />;
}

export function OnboardingPage() {
  return (
    <FormWrapper<OnboardingValues>
      initial={{ name: '', email: '', street: '', city: '' }}
      stepApiConfigs={STEP_API_CONFIGS}
      finalSubmitFn={async (data, stepIds) => userApi.finalize(stepIds[0], data)}
      onStepSuccess={(stepIndex, id) => {
        if (stepIndex === 0 && id) router.replace(`/onboarding/${id}`);
      }}
      validation={[
        z.object({ name: z.string().min(1), email: z.string().email() }),
        z.object({ street: z.string().min(1), city: z.string().min(1) }),
      ]}
      stepFields={STEP_FIELDS}
      hasDirtCheck
    >
      <FormShell
        title="Onboarding"
        description="Set up your account"
        steps={STEPS}
        onBack={() => history.back()}
        onCancel={() => router.push('/dashboard')}
        allowStepJump="completed-only"
        showStepper
      >
        <StepContent />
      </FormShell>
    </FormWrapper>
  );
}
```

---

## How the footer works

`FormShellFooter` reads `current` and `steps.length` from `FormControlsContext` automatically:

| Position | Buttons shown |
|---|---|
| First step | Next Step only |
| Middle step | Previous Step + Next Step |
| Last step | Previous Step + Submit |

`isLoading` disables all buttons while any API call is in flight (both per-step and final submit). The Submit button reflects the same loading state.

Next/Previous call `handleStepNext` / `handleStepBack` from context by default. Pass `onStepNext` / `onStepBack` props to override (e.g. to add custom side effects before advancing).

---

## Stepper

The stepper renders as a compact dropdown trigger showing the current step name and "Next: ..." preview. Clicking it opens a menu of all steps.

Step jump behaviour is controlled by `allowStepJump`:

| Value | Behaviour |
|---|---|
| `'never'` (default) | Stepper is display-only |
| `'completed-only'` | Only completed steps are clickable |
| `'always'` | All non-disabled steps are clickable |

When `handleStepNext` fails validation, the step is marked `'error'` in `stepStatus`. The stepper trigger shows a red badge with the count of errored steps.

---

## Progress bar

Renders above the stepper when `steps` is provided. Shows percentage of completed steps (steps marked `'complete'` in `stepStatus`). Animated. Hidden for single-step forms.

---

## Dirty banner

Requires `hasDirtCheck={true}` on `<FormWrapper>`. Renders as a full-width highlighted bar between the stepper and the content area when any field differs from its initial value.

Hidden by default on new-entity forms — pass `showDirtyBanner={false}` to suppress it. The banner only makes sense on edit forms where the user is modifying an existing record:

```tsx
// New form — no banner
<FormShell title="New Product" showDirtyBanner={false} ...>

// Edit form — banner shown when fields are dirty
<FormShell title="Edit Product" showDirtyBanner ...>
```

`showDirtyBanner` defaults to `true` so edit forms get it without any extra prop.

---

## `FormShell` props

| Prop | Type | Required | Notes |
|---|---|---|---|
| `title` | `string` | Yes | Shown in the top bar |
| `description` | `string` | No | Subtitle in the top bar |
| `onBack` | `() => void` | Yes | Called when the back/cancel button is clicked. When `hasDirtCheck` is active, clicking with unsaved changes shows a confirm modal first |
| `steps` | `(string \| { label: string; description?: string })[]` | No | Omit for single-step forms |
| `showStepper` | `boolean` | No | Default `true`. Set to `false` to hide the stepper while keeping progress bar and footer step logic |
| `showDirtyBanner` | `boolean` | No | Default `true`. Set to `false` on new-entity forms — the banner is only meaningful when editing an existing record |
| `allowStepJump` | `'never' \| 'completed-only' \| 'always'` | No | Default `'never'` |
| `disabledSteps` | `number[]` | No | Step indices hidden in the stepper menu |
| `onStepNext` | `() => void` | No | Overrides `handleStepNext` from context |
| `onStepBack` | `() => void` | No | Overrides `handleStepBack` from context |
| `onCancel` | `() => void` | No | Shows a Cancel button in the footer when provided |
| `iconActive` | `ReactNode` | No | Icon for the current step in the stepper menu |
| `iconComplete` | `ReactNode` | No | Icon for completed steps |
| `iconIncomplete` | `ReactNode` | No | Icon for pending/error steps |
| `children` | `ReactNode` | Yes | The step content to render inside the scrollable area |
