# FormShell

Opinionated form layout shell for `@peppermint/admin`. Provides header, progress bar, dirty banner, stepper, scrollable content area, and sticky footer — all pre-wired to `FormWrapper` contexts via `useFormControls()`.

**Must be rendered inside `<FormWrapper>`.**

## Props

| Prop | Type | Required | Default | Notes |
|---|---|---|---|---|
| `title` | `string` | Yes | — | Shown in the header |
| `description` | `string` | No | — | Shown next to title, dimmed |
| `onBack` | `() => void` | Yes | — | Called when Back is clicked. If `isDirty`, a confirm modal fires first |
| `steps` | `(string \| Step)[]` | No | `[]` | Enables stepper, progress bar, and multi-step footer |
| `disabledSteps` | `number[]` | No | `[]` | Step indices blocked from jump navigation |
| `showStepper` | `boolean` | No | `true` | Hides stepper trigger when false |
| `allowStepJump` | `StepJumpMode` | No | `'never'` | `'always'` / `'completed-only'` / `'never'` |
| `onStepBack` | `() => void` | No | — | Overrides `handleStepBack` from context |
| `onStepNext` | `() => void` | No | — | Overrides `handleStepNext` from context |
| `onCancel` | `() => void` | No | — | Shows a Cancel button in the footer |
| `iconActive` | `ReactNode` | No | — | Icon shown in stepper menu for the active step |
| `iconComplete` | `ReactNode` | No | — | Icon shown for completed steps |
| `iconIncomplete` | `ReactNode` | No | — | Icon shown for pending steps |
| `children` | `ReactNode` | Yes | — | Form fields |

## Step type

```ts
type Step = { label: string; description?: string };
// or simply a string
```

## Layout

```
┌─────────────────────────────────────┐  ← FormShellHeader (h=40, fixed)
├─────────────────────────────────────┤  ← Progress bar (xs, teal) — multi-step only
├─────────────────────────────────────┤  ← Dirty banner (yellow alert) — when isDirty
├─────────────────────────────────────┤  ← FormShellStepper (compact Menu) — multi-step only
│                                     │
│  scrollable content (flex: 1)       │
│  └─ Container sm                    │
│     └─ Paper (dark.7 bg)            │
│        └─ {children}                │
│                                     │
├─────────────────────────────────────┤  ← Divider
│  [← Prev]           [Cancel] [Next →]│  ← FormShellFooter (sticky)
└─────────────────────────────────────┘
```

## Enhancements

- **Progress bar** — driven by `completionPct` from `useFormControls()`. Only shown for multi-step forms.
- **Dirty banner** — reads `isDirty` from `useFormControls()`. Requires `hasDirtCheck={true}` on the parent `<FormWrapper>`.
- **Step error indicator** — Mantine `Indicator` on the stepper trigger shows a red badge with the count of errored steps.
- **Scrollable content** — content area is `overflow-y: auto` with header and footer remaining fixed.
