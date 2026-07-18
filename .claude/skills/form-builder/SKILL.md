---
name: form-builder
description: Triggers automatically whenever a form or form-like input surface is being built or edited in the Peppermint monorepo. Produces forms that are highly fillable, correct, accessible, and designed around real human use cases — not just functional, but genuinely effortless to complete. Uses only Mantine controls exposed through `@peppermint/ui`, wired through the `@peppermint/admin` FormWrapper/FormShell engine (never hand-rolled `useForm`).
---

# form-builder

## Prime directive

A form is a conversation, not an interrogation. Optimize every form for four things, in order: **low error rate, speed of completion, low cognitive load, and trust.** Every field must earn its place. If the form feels effortless to a real human filling it under real conditions, the skill has done its job.

This skill never just "renders fields." Before writing anything, it _reasons_ about the task, the person, and the data — then designs the most fillable surface possible.

> **Two layers, never confuse them.** _What the form should be_ (fields, controls, order, disclosure — sections 1–12 below) is design reasoning. _How it's wired in this repo_ (`FormWrapper` / `FormShell` / modal-shell form components — section 13) is a hard project contract. This skill owns the design reasoning; it defers the plumbing to the Peppermint form engine. Do both.

---

## Operating procedure

Whenever a form is being built, run this reasoning loop **before** writing components:

1. **Purpose & audience** — What is this form for? Who fills it, how often, on what device, under what pressure (a rushed checkout vs. a careful settings page)?
2. **Field reduction** — What is _truly_ required? Cut, defer, or infer everything else.
3. **Data modeling** — For each surviving field, what is its natural shape and the right control?
4. **Grouping & sequence** — Cluster into titled sections; order them the way a human thinks about the task.
5. **Layout** — Field widths, single vs. paired rows, tabular vs. stacked.
6. **Size & disclosure** — Does length demand accordion / tabs / stepper / conditional reveal?
7. **Surface** — Full page (`FormShell`) or modal (modal-shell form component)? This decides the plumbing in section 13.
8. **Validation & error strategy** — When to validate, what messages to show.
9. **Accessibility & responsive pass.**
10. **Quality checklist** — Must pass every gate before the form is considered done.

Do not skip the reasoning even for "simple" forms. A login form and a 40-field intake form get the same discipline, scaled.

---

## 1. Field reduction (do this first, always)

- Every field has a cost paid by the user. Question each one: _Do we need this now? Can we infer it, default it, or ask later?_
- Prefer smart defaults, prefills, and inference over asking.
- **Mark the minority.** If most fields are required, mark only the optional ones; if most are optional, mark only the required ones. Never make the user parse a wall of asterisks.
- Defer nice-to-have fields into a collapsed "Optional / Advanced" section rather than the main flow.

The best field is the one the user never has to fill.

---

## 2. Microcopy: labels, descriptions, placeholders

Three distinct roles — never conflate them. Each maps to a real Mantine prop:

- **Label** (`label` prop, always present): the field's name, in sentence case, programmatically tied to the input by Mantine. **Never use a placeholder as the label** — it vanishes on focus, fails accessibility, and destroys short-term memory.
- **Description / help text** (`description` prop, when useful): persistent context or constraints, shown near the field — _not_ a placeholder. E.g. "We'll only use this for delivery updates."
- **Placeholder** (`placeholder` prop, optional): a realistic **example of valid input**, never an instruction and never the label. E.g. `jane@company.com`, not "Enter your email."

Tone throughout: plain, human, concise. Say "Work email," not "Please provide your email address."

---

## 3. Choosing the right control

Text inputs are the last resort, not the default. Map data to the control that makes valid entry easiest. Every control below is exported from `@peppermint/ui` (the main barrel re-exports `@mantine/core` and `@mantine/dates`) — **except Dropzone**, which is the `@peppermint/ui/dropzone` subpath:

| Data / intent                          | Control                                                             |
| -------------------------------------- | ------------------------------------------------------------------- |
| Short free text                        | `TextInput`                                                         |
| Long / multi-line text                 | `Textarea` (`autosize`)                                             |
| Number, quantity, price                | `NumberInput` (min/max/step, prefix/suffix, thousands formatting)   |
| One choice, 2–5 options                | `Radio.Group` or `SegmentedControl`                                 |
| One choice, many options               | `Select` (`searchable`)                                             |
| Several choices, few options           | `Checkbox.Group`                                                    |
| Several choices, many options          | `MultiSelect`                                                       |
| On/off setting                         | `Switch`                                                            |
| Single consent / agreement             | single `Checkbox`                                                   |
| Date / date range                      | `DateInput` / `DatePickerInput` (`type="range"`)                    |
| Time                                   | `TimeInput`                                                         |
| Password                               | `PasswordInput` (reveal toggle; add a strength meter when creating) |
| Tags / keywords                        | `TagsInput`                                                         |
| Rating                                 | `Rating`                                                            |
| Color                                  | `ColorInput`                                                        |
| File upload                            | `FileInput`, or `Dropzone` from `@peppermint/ui/dropzone`           |
| Constrained format (phone, card, code) | `TextInput` with an input mask / format-on-change                   |

Rule of thumb: if the set of valid values is knowable, let the user **pick** instead of **type**.

---

## 4. Compound & grouped fields

- **Split compound values into natural parts** when the parts are independently useful: name → given / (middle) / family; address → line 1 / line 2 / city / region / postal / country.
- **Don't over-split.** If a part is never used on its own, keep it whole. Splitting for its own sake adds friction.
- **Pair tightly related short fields on one row** using `Group` or `Grid`/`SimpleGrid` from `@peppermint/ui`: first + last, city + postal code, card expiry + CVC.
- **Match field width to expected input length.** A 5-character postal code gets a short field; an email gets a wide one. Never a full-width input for a tiny value — width is a silent hint about what's expected.

---

## 5. Tabular & repeatable data

When the user enters multiple structured rows — line items, team members, schedule entries — use a **table/grid layout with add & remove rows**, not stacked duplicate field groups. In Peppermint this is a Mantine `Table` (from `@peppermint/ui`) whose rows map over a list field managed by the form engine (`form.insertListItem` / `form.removeListItem` from `useFormInstance()`).

- Clear "Add row" affordance and per-row delete.
- A helpful empty state ("No items yet — add your first").
- Keep visible columns manageable; push overflow detail into a row-expand.
- Inline validation per cell, so errors stay next to the offending value.

---

## 6. Ordering & flow

- Order fields the way the **user** thinks about the task, not the way the database stores them. Known / easy / high-confidence fields first; rare or effortful ones later.
- Group into **titled sections** with clear visual separation (`Fieldset` / `Divider` from `@peppermint/ui`). One idea per section — don't mix unrelated concerns.
- Reveal **conditional fields only when relevant** — read the current values off `useFormInstance()` (`form.values`) and render the dependent field only when it applies. Never show a field that doesn't apply to the current answers.

---

## 7. Handling large forms — progressive disclosure

Pick the pattern by shape and length, not habit. All containers below come from `@peppermint/ui`; the `Stepper` case is handled for you by `FormShell` (see section 13):

| Situation                                    | Pattern                                                                                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| ≤ ~7 fields                                  | Single view, minimal chrome — a `Stack` of fields                                                     |
| Medium, multi-topic                          | Grouped visual sections (`Fieldset` / `Divider`), one scroll                                          |
| Long, independent topics (fill in any order) | `Accordion`                                                                                           |
| Long, parallel categories                    | `Tabs`                                                                                                |
| Sequential / dependent / onboarding          | `FormShell` multi-step wizard (`steps` prop) — progress bar + per-step validation gating are built in |
| Fields that only sometimes apply             | Conditional reveal off `form.values`                                                                  |

For the stepper case, don't hand-build step state — `FormShell` + `FormWrapper` already gate advancement on `stepFields[current]` validation and show progress (section 13).

---

## 8. Modals specifically

A modal is not a page — keep modal forms **compact**. In Peppermint, modal forms are built as a field component passed to a modal table shell (`ModalTableShell` / `DataTableModalShell`) via `createFormComponent` / `editFormComponent`; the shell owns the `FormWrapper`, the modal chrome, and the sticky submit footer (see section 13).

- If the content exceeds a comfortable modal height, either (a) move it to a full page (`FormShell`) or a `Drawer`, or (b) split it into **progressive sections where the next opens only once the previous is valid and complete** — drive the reveal off `form.values` / field-error state from `useFormInstance()`.
- The shell keeps the primary action in a **sticky footer** — don't add a competing submit button inside the scroll area, and don't nest a scroll trap that hides it.
- Never cram a long, multi-topic form into a scrolling modal. If it wants tabs or a stepper, it wants a page.

---

## 9. Validation & errors

- **Validate at the right moment.** `FormWrapper` takes Zod schemas via its `validation` prop (a sparse array, one schema per step). Full-page forms validate `stepFields[current]` on Next and everything on Submit. Modal shells that don't expose `validation` should validate inside the API call and return `{ ok: false, message }` (see `usage-doc/module-patterns/ModalModule.md`). Either way — don't throw errors while the user is still typing their first character.
- **Error messages are specific and actionable** — say what's wrong _and_ how to fix it. "Enter a date in the future," not "Invalid date." Put the message in the Zod schema so it surfaces through `form.getInputProps`.
- **Never wipe the form on error.** `FormWrapper` preserves values on a failed submit — don't reset it yourself.
- **Focus the first error** on failed submit; for long/multi-step forms, the stepper already badges errored steps.
- Show positive validity where it reassures (password strength, username availability).
- Prefer letting the user attempt submission and guiding fixes over a permanently disabled button with no explanation.

---

## 10. Reducing effort

- Prefill sensible defaults and any values already known via `FormWrapper`'s `initial` prop (read once at mount — see the "unstable initial" mistake in `usage-doc/admin/FormWrapper.md`).
- Set correct `autoComplete` attributes so browser autofill works (name, email, address, tel, one-time codes).
- Apply input **masks / format-as-you-type** for structured inputs (phone, card, dates).
- Set the right mobile input mode / keyboard per field (`inputMode`, `type`).
- For long or interruption-prone forms, prefer the multi-step `FormShell` flow with `on-next` step APIs so partial progress is persisted server-side.

---

## 11. Accessibility (non-negotiable)

- Every input has a programmatically associated label — always use the Mantine `label` prop; never fake it with plain text or a placeholder.
- Required and error states are conveyed in **text, not color alone** (Mantine's `required` and `error` props render text/markers — keep them).
- Errors are announced and tied to their field — Mantine wires `aria-describedby` when you pass `error`; don't render errors in a detached element.
- Full keyboard operability, visible focus rings, logical tab order.
- Sufficient contrast and comfortable target sizes.
- Group related controls with `Fieldset` (renders a real `<fieldset>`/`<legend>`).

---

## 12. Responsive

- **Single column by default.** Multi-column only for genuinely paired short fields (`SimpleGrid` / `Grid` with responsive `cols`), and collapse to one column on small screens.
- Comfortable touch targets and spacing on mobile — lean on Mantine size/spacing props, not ad-hoc pixels.
- Correct on-screen keyboard per field.

---

## 13. Peppermint form engine (hard rule — this is the plumbing)

Controls come from `@peppermint/ui`. **State, validation, dirty-tracking, and submit come from the `@peppermint/admin` form engine — never a hand-rolled `useForm`.**

**Component source:**

- Import all controls and layout primitives from **`@peppermint/ui`** (`TextInput`, `Select`, `Stack`, `Fieldset`, `Accordion`, `Tabs`, `Group`, `SimpleGrid`, …). `Dropzone` is the one exception — `@peppermint/ui/dropzone`.
- Never import from `@mantine/*` directly. If `@peppermint/ui` doesn't re-export something you need, that's a wrapper gap to raise — not a reason to reach past it.

**Form engine — pick by surface:**

| Surface                      | Engine                                                                                                                          | Field access                                        | Submit                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------- |
| Modal (list-module CRUD)     | `FormWrapper` **provided by the modal shell** — you write a field component passed as `createFormComponent`/`editFormComponent` | `useFormInstance()` → `form.getInputProps("field")` | shell's mutation via the shell footer                   |
| Full page / multi-step route | `FormWrapper` + `FormShell` (`FormShell` sits **inside** `FormWrapper`)                                                         | `useFormInstance()`                                 | `useFormControls()` → `handleSubmit` / `handleStepNext` |
| Custom layout, no chrome     | `FormWrapper` only                                                                                                              | `useFormInstance()`                                 | `useFormControls()`                                     |

- **Never call `useForm` yourself for a module form**, and never build a parallel `useState` state system. Field components read `const { form } = useFormInstance<T>()` and spread `{...form.getInputProps("field")}`.
- Full API + copy-paste examples: `usage-doc/admin/FormWrapper.md`, `usage-doc/admin/FormShell.md`, `usage-doc/module-patterns/ModalModule.md`.
- Before hand-rolling anything around the form (a paginated resource API, query keys, a mutation-with-notification, status/date columns, a row-action menu, a reason-confirm modal, a whole list module), check the **Framework Primitives** in `.claude/CLAUDE.md` — a primitive very likely already owns it.

**Modal field-component shape** (verified against `usage-doc/module-patterns/ModalModule.md`):

```tsx
"use client";
import { Stack, TextInput, Select } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import type { ModalFormComponentProps } from "@peppermint/admin";

function UserForm(_props: ModalFormComponentProps<User, CreateUserInput>) {
  const { form } = useFormInstance<CreateUserInput>();
  return (
    <Stack gap="md">
      <TextInput label="Name" required {...form.getInputProps("name")} />
      <TextInput
        label="Work email"
        placeholder="jane@company.com"
        autoComplete="email"
        {...form.getInputProps("email")}
      />
      <Select
        label="Role"
        data={ROLES}
        searchable
        {...form.getInputProps("role")}
      />
    </Stack>
  );
}
```

**Full-page field-component shape** (verified against `usage-doc/admin/FormShell.md`):

```tsx
function UserFields() {
  const { form } = useFormInstance<CreateUserValues>();
  return (
    <Stack gap="md">
      <TextInput label="Name" {...form.getInputProps("name")} />
      <TextInput label="Email" {...form.getInputProps("email")} />
    </Stack>
  );
}
// …rendered inside <FormWrapper validation={[schema]} …><FormShell title="…" onBack={…}><UserFields/></FormShell></FormWrapper>
```

**Styling** — respect the design system: Mantine props first, `style` prop for one-offs, CSS Modules for complex selectors. Never the deprecated `sx` prop, never ad-hoc pixel spacing the system already tokenizes.

---

## 14. Quality checklist — every form must pass

Before considering a form done, confirm:

- [ ] Every field is necessary; nothing that could be inferred or deferred is being asked.
- [ ] Every input has a real, associated `label` (no placeholder-as-label).
- [ ] Placeholders show realistic example values, not instructions.
- [ ] Each field uses the _most fillable_ control for its data, not a default text input.
- [ ] Compound values are split sensibly; tiny fields aren't full-width.
- [ ] Related short fields are paired; sections are titled (`Fieldset`/`Divider`) and logically ordered.
- [ ] Large forms use the right disclosure pattern (`Accordion` / `Tabs` / `FormShell` stepper / conditional reveal).
- [ ] Modal forms are compact or progressively sectioned, with the shell's sticky primary action intact.
- [ ] Validation fires at the right time (`FormWrapper` `validation` / API-level), with specific, fixable messages.
- [ ] The form never loses data on error and surfaces the first error.
- [ ] Required/optional marking follows the "mark the minority" rule.
- [ ] Keyboard, focus, contrast, and announcements all work.
- [ ] Single-column responsive; correct autofill and mobile keyboards.
- [ ] Controls come only from `@peppermint/ui` (`Dropzone` from `@peppermint/ui/dropzone`); state comes from `FormWrapper`/`FormShell`, **never a hand-rolled `useForm`**.

---

## Anti-patterns — never do these

- Placeholder used as the label.
- **Hand-rolling `useForm` (or `useState`) for a module form** instead of `FormWrapper`/`FormShell`.
- **Importing controls from `@mantine/*` directly** instead of `@peppermint/ui`.
- Full-width field for a 3–5 character value.
- Over-splitting values whose parts are never used alone.
- Aggressive validation that errors before the user finishes typing.
- Vague errors ("Invalid input") with no path to fix.
- Wiping entered data when submission fails (`FormWrapper` already preserves it — don't reset).
- A giant, single-scroll form crammed into a modal.
- Asking for information the system already has or could infer.
- Two competing primary buttons (the shell already owns the primary action).
- Signaling required / error state with color only.

---

## Reasoning example (how the skill should think)

> **Request:** "Build a form to add a team member." (list module → modal)
>
> _Reasoning:_ Small, focused task → single modal view, no tabs/stepper. Field component passed as `createFormComponent` to the list module's modal shell; `FormWrapper` comes from the shell. Core need is identity + role + access.
>
> - Name → split into first / last, paired on one row via `Group` (both short, related).
> - Email → wide `TextInput`, `autoComplete="email"`, placeholder `jane@company.com`.
> - Role → known finite set → `Select` (`searchable`), not free text.
> - Permissions → a few options → `Checkbox.Group`, not a `MultiSelect`.
> - "Send invite now?" → single `Switch`, defaulted on.
> - Fields read via `useFormInstance()` + `form.getInputProps`; validation as a Zod schema (in the shell's `create` API, per `ModalModule.md`) with a specific email message.
> - Optional "Job title" deferred below a `Divider` so it doesn't slow the core flow.
>
> Result: five well-chosen controls, one row saved by pairing names, zero free-text where a pick would do — wired through the modal shell's `FormWrapper`, no hand-rolled `useForm`.
