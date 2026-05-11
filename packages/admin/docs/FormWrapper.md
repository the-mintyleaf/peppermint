# FormWrapper — API Reference

Form state engine for `@zetsel/admin`. Mounts two independent React contexts that eliminate cross-render between field input and navigation state.

---

## Architecture

```
FormWrapper
└── FormInstanceContext.Provider   ← stable; set once at mount, never re-provides
    └── FormControlsContext.Provider  ← re-provides on step/submit changes only
        └── {children}
```

**Why two contexts?** A single context holding both form values and navigation state causes every keystroke to re-render the stepper/footer, and every step navigation to re-render every field. The split prevents both.

---

## `FormWrapper<T>`

```typescript
<FormWrapper
  initial={initialValues}
  apiSubmitFn={async (data) => api.post({ url: '/items', body: data })}
  validation={[step0Schema, step1Schema]}  // sparse — indexed by step
  transformFnSubmit={(data) => { data.name = data.name.trim(); return data; }}
  submitSuccessFn={() => router.push('/items')}
  stepFields={[['name', 'email'], ['address.city']]}
  formClearOnSuccess={false}
>
  {children}
</FormWrapper>
```

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `initial` | `T` | Yes | Initial form values. Read once at mount via ref — never re-read. |
| `apiSubmitFn` | `(data: T) => Promise<ApiResponse<unknown>>` | Yes | Called on submit with a `structuredClone` of values |
| `validation` | `ZodTypeAny[]` | No | Sparse array — index matches step. Step with no entry is always valid. |
| `transformFnSubmit` | `(data: T) => T` | No | Receives a deep clone — safe to mutate |
| `submitSuccessFn` | `() => void` | No | Called after successful submit |
| `stepFields` | `string[][]` | No | Field keys per step for scoped validation on Next |
| `formClearOnSuccess` | `boolean` | No | Call `form.reset()` after successful submit |
| `hasDirtCheck` | `boolean` | No | Reserved — unsaved-changes warning (implemented in `FormShell`) |
| `children` | `ReactNode` | Yes | Content rendered inside both contexts |

---

## `useFormInstance<T>()`

Returns the stable Mantine form instance. Subscribe here for field rendering — never re-renders on navigation changes.

```typescript
const { form } = useFormInstance<MyFormValues>();
// form.getInputProps('name'), form.values, form.errors, etc.
```

Throws if called outside a `FormWrapper`.

---

## `useFormControls()`

Returns navigation and submission state. Subscribe here for steppers, footers, and submit buttons — never re-renders on keystrokes.

```typescript
const {
  current,         // current step index
  isLoading,       // true while submit is in flight
  stepStatus,      // Record<number, 'pending' | 'complete' | 'error'>
  completionPct,   // 0–100, based on completed steps
  handleSubmit,    // call to trigger submit
  handleStepNext,  // validates current step's fields, then advances
  handleStepBack,  // go back one step
  handleStepGo,    // jump to specific step
} = useFormControls();
```

Throws if called outside a `FormWrapper`.

---

## Form Correctness Rules Enforced

| Rule | Enforcement |
|---|---|
| Rule 1 — Initialise Once | `initial` captured in `useRef`, never a dependency |
| Rule 2 — Validate on Blur | `validateInputOnChange: false`, `validateInputOnBlur: true` |
| Rule 3 — Synchronous Submit Guard | `setIsLoading(true)` called before first `await` |
| Rule 4 — Deep Clone Before Transform | `structuredClone(form.values)` before `transformFnSubmit` |
| Rule 5 — Modal Reset | Consumers use `keepMounted={false}` — `FormWrapper` unmounts between opens |
| Rule 6 — Auto-Save Debounced | Use `useDebounce` from `@zetsel/utils` externally with `shallowEqual` |
| Rule 7 — Step Validation Scoped | `handleStepNext` validates only `stepFields[current]` |

---

## Helper utilities (internal, also exported)

### `validateStep(form, fieldKeys): boolean`

Validates only the listed field keys. Returns `true` if all pass.

### `shallowEqual(a, b): boolean`

Shallow object comparison. Used to diff auto-save snapshots.

### `draftSerialize(values): string`

JSON serialise form values for draft storage. Returns `''` on failure.
