# FormShell — API Reference

Pre-built full form page. Wraps `FormWrapper` internally with `FormHeader`, `FormStepper`, and `FormFooter` wired up.

Layout:
```
┌──────────────────────────────────────────────────┐
│  ← Breadcrumb / Breadcrumb       [● Saving...]   │  ← FormHeader
├──────────────────────────────────────────────────┤
│    ①  Step One   ②  Step Two   ③  Step Three     │  ← FormStepper (multi-step only)
├──────────────────────────────────────────────────┤
│                                                   │
│   {children}                                      │
│                                                   │
├──────────────────────────────────────────────────┤
│  [Cancel]                  [← Back]   [Next →]   │  ← FormFooter (sticky)
└──────────────────────────────────────────────────┘
```

---

## `FormShell<T>`

```typescript
<FormShell<UserForm>
  title="Edit User"
  initial={{ name: '', email: '' }}
  apiSubmitFn={(data) => editRecord('/api/users', id, data)}
  submitSuccessFn={() => router.push('/users')}
  onCancel={() => router.back()}
>
  {/* form fields here */}
</FormShell>
```

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Shown in `FormHeader` when no `bread` is provided |
| `initial` | `T` | Yes | Initial form values — set once via ref, never reassigned |
| `apiSubmitFn` | `(data: T) => Promise<ApiResponse<unknown>>` | Yes | Called on submit with a deep clone of form values |
| `bread` | `BreadcrumbItem[]` | No | Breadcrumb items — renders instead of `title` when provided |
| `moduleInfo` | `ModuleInfo` | No | `{ title, description? }` — reserved for future header use |
| `validation` | `ZodSchema[]` | No | Sparse array — index matches step index. Single-step: pass `[schema]` |
| `transformFnSubmit` | `(data: T) => T` | No | Receives a `structuredClone` — safe to mutate and return |
| `submitSuccessFn` | `() => void` | No | Called after a successful API response |
| `hasDirtCheck` | `boolean` | No | Warns user before leaving with unsaved changes |
| `formClearOnSuccess` | `boolean` | No | Resets form to initial values after successful submit |
| `steps` | `string[]` | No | Step labels — enables multi-step mode when length > 1 |
| `showStepper` | `boolean` | No | Show/hide `FormStepper` in multi-step mode (default: `true`) |
| `disabledSteps` | `number[]` | No | Step indices that cannot be navigated to |
| `enableStepClick` | `boolean` | No | Allow clicking stepper steps directly to navigate |
| `onCancel` | `() => void` | No | Renders a Cancel button in `FormFooter` when provided |

---

## Sub-components

All sub-components read from `FormWrapper` contexts — no prop drilling.

| Component | Context | Renders |
|---|---|---|
| `FormHeader` | `FormControlsContext` (`isLoading`) | Title or breadcrumbs, saving indicator |
| `FormStepper` | `FormControlsContext` (`current`, `stepStatus`) | Step indicators |
| `FormFooter` | `FormControlsContext` | Cancel, Back, Next/Save buttons |

---

## `useUnsavedWarning(isDirty)`

Attaches a `beforeunload` handler when `isDirty` is true to warn the user before leaving with unsaved changes. `FormShell` calls this automatically when `hasDirtCheck` is set.

```typescript
useUnsavedWarning(form.isDirty());
```
