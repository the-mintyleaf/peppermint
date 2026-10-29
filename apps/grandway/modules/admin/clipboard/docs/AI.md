# Clipboard Module — AI Navigation Map

## Purpose

A user's personal list of saved text snippets (a ward office name, a bank address) that
staff reuse when filling documents. Owns no business state. Backend base path
`/api/v1/auth/me/clipboard/` (+ `categories/`). Contract:
`apps/grandway/docs/backend/authenticate/INTEGRATION.md` v1.5.0 (personal clipboard
section) and `FLOWS.md`.

## Module type

ModalModule — **no route**. A right-hand `Drawer` opened from the shell (caller owns the
open state, like `NotificationDrawer`), plus an attachable field helper for document forms.

## Entry points

| Surface                    | Export                                 | File                                                     |
| -------------------------- | -------------------------------------- | -------------------------------------------------------- |
| Shell drawer               | `ClipboardDrawer`                      | drawer/ClipboardDrawer/ClipboardDrawer.tsx               |
| Document-form field helper | `ClipboardFieldSuggest`                | \_shared/ClipboardFieldSuggest/ClipboardFieldSuggest.tsx |
| Attach to a Mantine form   | `bindClipboardFields`, `withClipboard` | \_shared/ClipboardFieldSuggest/withClipboard.tsx         |
| Same, headless             | `useClipboardSuggestions`              | clipboard.hooks.ts                                       |

`<ClipboardDrawer opened onClose zIndex? />` — pass `zIndex={CLIPBOARD_DRAWER_OVER_MODAL_Z_INDEX}`
(250) when it opens over a Modal (200).
`<ClipboardFieldSuggest fieldKey value onInsert fieldLabel? fieldKeyLabel? disabled? size? popoverZIndex? />`
— `fieldLabel` is the field's own label (aria name "Saved snippets for …", snippet-name
prefill); `fieldKeyLabel` is the human name of the KEY shown in "Save this value"
("Offered again on: Ward office — Spokesperson name"), defaulting to `fieldKeyLabel(fieldKey)`.

### Attaching to a form field (one line per field)

```tsx
const clip = bindClipboardFields(form, { family: "cv", disabled: isLoading });
<TextInput {...form.getInputProps("nationality")} {...clip("nationality", "Nationality")} />
<Textarea {...form.getInputProps("skills")} {...clip("skills", "Skills", { multiline: true })} />
```

- `form` is any controlled Mantine form — `useForm(...)` or FormWrapper's
  `useFormInstance().form`. Insert calls the field's own `getInputProps(path).onChange`,
  so validation and dirty state behave exactly as typing.
- Overrides: `clipboardKey` (explicit registered key), `multiline` (Textarea — pins the
  button to the first line), `disabled`.
- Not a form? `withClipboard({ fieldKey, value, onInsert, fieldLabel, fieldKeyLabel, multiline })`
  returns the same `rightSection` props.
- Free-text inputs only: never number, date (incl. date-like text), select/combobox,
  switch or segmented controls. Short codes are fine — the button is a subtle grey icon.

## Access (critical)

**Owner-only for EVERY authority, superadmin included.** There is no capability to gate
on and no tier comparison to write — mount it for any signed-in account. No endpoint
reads another account's clipboard. `must_change_password` / MFA enrolment do not block it.

## Data layer (module root)

| File                   | Holds                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| clipboard.types.ts     | `ClipboardEntry`, `ClipboardCategory`, create/update bodies, delete result, list filters                                                                |
| clipboard.constants.ts | Caps (200 entries / 50 categories), field limits, page sizes, `CATEGORY_FILTER_NONE`, confirm + over-modal drawer z-index                               |
| clipboard.fieldKeys.ts | **The `field_key` vocabulary** (frontend-owned): registered keys, families, `deriveFieldKey`, `derivedFieldKeyLabel`, `fieldKeyLabel`/`fieldKeyOptions` |
| clipboard.queryKeys.ts | `clipboardEntryKeys`, `clipboardCategoryKeys` (`createQueryKeys`)                                                                                       |
| clipboard.api.ts       | `createResourceApi` for entries; `markClipboardEntryUsed` + categories hand-rolled (bare array, no `count`)                                             |
| clipboard.errors.ts    | `getClipboardErrorMessage` — module-local copy for the six `AUTH_CLIPBOARD_*` codes, falls back to the app                                              |
| clipboard.hooks.ts     | queries, mutations, `useCopyClipboardEntry` (copy → then `use`), `useClipboardTotal`                                                                    |

## Facts that shape the code

- **List order is most-used first, always** — no ordering param; do not build sort UI.
  Copy/insert calls `POST …/use/`, which re-ranks, so a paged list can shuffle.
- **Cap is on the whole clipboard** (200), so `useClipboardTotal` reads an unfiltered
  `page_size=1` list; a filtered list's `meta.total` is not the total.
- **No single-entry GET** — edit works from the list row (`view.entry` in the drawer).
- **Write shape differs from read**: `category` is `{id,name}` on read, a bare id/`null`
  on write; sending the object is a `VALIDATION_ERROR`. `field_key: ""` clears it.
- `use` is a ranking signal only: silent on success and failure; called only after the
  `navigator.clipboard.writeText` succeeds.
- Categories list is a bare array (api-client unwraps it; no `meta.count`), ≤50.
  Deleting a category keeps its entries (uncategorised) — confirm copy says how many.
- **`field_key` vocabulary is ours.** Backend checks only `^[a-z0-9_]+(\.[a-z0-9_]+)*$` (≤100). Two kinds of key, both in `clipboard.fieldKeys.ts`:
  - **Derived (the default — every text field of every document form).**
    `deriveFieldKey(family, fieldPath)` → `<family>.<field path>`: segments lowercased,
    anything outside `[a-z0-9_]` → `_`, edge underscores trimmed, **numeric list indexes
    dropped** (`experiences.2.role` → `cv.experiences.role`, one key for every row),
    capped at 100 with no trailing dot. Families: `woda` (every Woda letter, Japan and
    English), `lor`, `moi`, `cv` (all CV forms), `bank` (statement + certificate share it),
    `certificate` (reserved for the student certificate). Same family + same field name =
    same key, so a snippet saved on a field comes back on that field of every letter in
    the family. Human name: `derivedFieldKeyLabel(family, fieldLabel)` ("Ward office —
    Spokesperson name"); `fieldKeyLabel(key)` falls back to family + path in words when
    no label is at hand (drawer rows, the Save form's select). A new family gets a row in
    `FAMILY_LABELS`; derived keys need no registry row.
  - **Registered (explicit).** Rows in `CLIPBOARD_FIELD_KEYS`, used when one value is
    shared across families or field names, or to keep matching snippets saved before
    derivation: `ward.spokesperson.{name,post,contact}` (Woda spokesperson section; `name`
    also on the affidavit's ward chairman), `ward.office.name` (tax-clearance contact
    office), `guardian.occupation`, `study.institution.{name,location}` (affidavit),
    `institution.recommender.{name,title}` (LOR), `institution.signatory.name` (MOI),
    `bank.spokesperson.{name,post}` (bank certificate), `cv.reference.*` (both Extended-CV
    referees share them). Woda/LOR/MOI name them via `clipboardKey` on a `WodaField`;
    hand-built forms via `clip(path, label, { clipboardKey })`. **Never rename a registered
    key** — saved snippets match on the string. `bank.name`, `bank.address`,
    `ward.office.address` and the applicant/parent keys attach to no field and are kept
    for saved snippets.
  - The Save form shows the human name behind a disclosure, never the dotted key; an
    unregistered key on an existing entry is kept in the select under `fieldKeyLabel`.
- Suggestions are fetched on demand (popover open), one page of 10 — never per keystroke.
- **Safe inside a form Modal.** The popover is portalled at 300 (above a Modal's 200 — no
  `popoverZIndex` needed there); every control is `type="button"`; Enter in "Name this
  snippet" is swallowed; and every focusable element in it carries
  `data-mantine-stop-propagation` (`STOP_MODAL_ESCAPE`) — Mantine Modals/Drawers close on
  Escape from a window capture listener that fires first and honours only that flag, so
  without it Escape in the popover closed the document form underneath.

## Drawer (one drawer, three screens)

`ClipboardDrawer` switches `view` in place: list (`_shared/ClipboardBrowser`, stays
mounted, hidden, so search/filter survive) → save/edit (`_shared/ClipboardEntryForm`,
`FormWrapper` only) → categories (`_shared/CategoryManager`). Closing resets to list.
Confirm modals sit at `CLIPBOARD_CONFIRM_Z_INDEX` (400) to clear the drawer (200, or 250
over a Modal); its select lists at 400/500. Opened over a document form by
`modules/documents/components/DocumentFormModal` (sticky header button), and from the
editor header (`DocHeader`).
At 180+ snippets a warning shows; at 200 Save is disabled and "Review least-used
snippets" jumps to the last page (the least-used end).

## Error codes → copy

Defined in `clipboard.errors.ts` (`AUTH_CLIPBOARD_ENTRY_NOT_FOUND`, `…_LIMIT_REACHED`,
`…_CATEGORY_INVALID`, `…_CATEGORY_NOT_FOUND`, `…_CATEGORY_NAME_TAKEN`,
`…_CATEGORY_LIMIT_REACHED`). `lib/authErrorMessages.ts` has no clipboard rows; the
module resolver covers them either way.

## Common edit targets

| Task                          | Files                                                                |
| ----------------------------- | -------------------------------------------------------------------- |
| Add a registered key / family | clipboard.fieldKeys.ts (`CLIPBOARD_FIELD_KEYS` / `FAMILY_LABELS`)    |
| Document forms that attach it | modules/documents — see its docs/AI.md "Clipboard on document forms" |
| Drawer chrome / screens       | drawer/ClipboardDrawer/ClipboardDrawer.tsx                           |
| List, filters, limit notice   | \_shared/ClipboardBrowser/ClipboardBrowser.tsx                       |
| Save/edit form                | \_shared/ClipboardEntryForm/ClipboardEntryForm.tsx                   |
| Category CRUD                 | \_shared/CategoryManager/CategoryManager.tsx                         |
| Field button + popover        | \_shared/ClipboardFieldSuggest/ClipboardFieldSuggest.tsx             |
| Attach helpers                | \_shared/ClipboardFieldSuggest/withClipboard.tsx                     |

## Do not do

- Do not gate on authority — superadmin has a clipboard too.
- Do not add ordering/sort controls (none exists) or a link to an applicant (never linked).
- Do not send the category object back on write — send `category.id`.
- Do not call `use` before the copy succeeds, or fetch suggestions per keystroke.
- Do not hand-build a `field_key` string for a field — derive it (`bindClipboardFields`
  / `deriveFieldKey`) or use a registered key.
- Do not rename a registered key or change the derivation rule — saved snippets match on
  the exact string and would silently stop being offered.
- Do not fetch in `useEffect`; do not import Mantine directly.
