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

| Surface                    | Export                    | File                                                     |
| -------------------------- | ------------------------- | -------------------------------------------------------- |
| Shell drawer               | `ClipboardDrawer`         | drawer/ClipboardDrawer/ClipboardDrawer.tsx               |
| Document-form field helper | `ClipboardFieldSuggest`   | \_shared/ClipboardFieldSuggest/ClipboardFieldSuggest.tsx |
| Same, headless             | `useClipboardSuggestions` | clipboard.hooks.ts                                       |

`<ClipboardDrawer opened onClose />`.
`<ClipboardFieldSuggest fieldKey="father.name" value={…} onInsert={(text) => …} fieldLabel? disabled? size? popoverZIndex? />`.

## Access (critical)

**Owner-only for EVERY authority, superadmin included.** There is no capability to gate
on and no tier comparison to write — mount it for any signed-in account. No endpoint
reads another account's clipboard. `must_change_password` / MFA enrolment do not block it.

## Data layer (module root)

| File                   | Holds                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| clipboard.types.ts     | `ClipboardEntry`, `ClipboardCategory`, create/update bodies, delete result, list filters                    |
| clipboard.constants.ts | Caps (200 entries / 50 categories), field limits, page sizes, `CATEGORY_FILTER_NONE`, confirm z-index       |
| clipboard.fieldKeys.ts | **The `field_key` vocabulary** (frontend-owned) + `fieldKeyLabel`/`fieldKeyOptions`                         |
| clipboard.queryKeys.ts | `clipboardEntryKeys`, `clipboardCategoryKeys` (`createQueryKeys`)                                           |
| clipboard.api.ts       | `createResourceApi` for entries; `markClipboardEntryUsed` + categories hand-rolled (bare array, no `count`) |
| clipboard.errors.ts    | `getClipboardErrorMessage` — module-local copy for the six `AUTH_CLIPBOARD_*` codes, falls back to the app  |
| clipboard.hooks.ts     | queries, mutations, `useCopyClipboardEntry` (copy → then `use`), `useClipboardTotal`                        |

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
- **`field_key` vocabulary is ours.** Backend checks only `^[a-z0-9_]+(\.[a-z0-9_]+)*$`
  (≤100). Register keys in `clipboard.fieldKeys.ts`; the Save form shows the human name
  ("Father's name") behind a disclosure, never the dotted key. Unregistered keys on an
  existing entry are preserved in the select and shown raw.
- Suggestions are fetched on demand (popover open), one page of 10 — never per keystroke.

## Drawer (one drawer, three screens)

`ClipboardDrawer` switches `view` in place: list (`_shared/ClipboardBrowser`, stays
mounted, hidden, so search/filter survive) → save/edit (`_shared/ClipboardEntryForm`,
`FormWrapper` only) → categories (`_shared/CategoryManager`). Closing resets to list.
Confirm modals sit at `CLIPBOARD_CONFIRM_Z_INDEX` (400) to clear the drawer (200).
At 180+ snippets a warning shows; at 200 Save is disabled and "Review least-used
snippets" jumps to the last page (the least-used end).

## Error codes → copy

Defined in `clipboard.errors.ts` (`AUTH_CLIPBOARD_ENTRY_NOT_FOUND`, `…_LIMIT_REACHED`,
`…_CATEGORY_INVALID`, `…_CATEGORY_NOT_FOUND`, `…_CATEGORY_NAME_TAKEN`,
`…_CATEGORY_LIMIT_REACHED`). `lib/authErrorMessages.ts` has no clipboard rows; the
module resolver covers them either way.

## Common edit targets

| Task                        | Files                                                    |
| --------------------------- | -------------------------------------------------------- |
| Add a field key             | clipboard.fieldKeys.ts                                   |
| Drawer chrome / screens     | drawer/ClipboardDrawer/ClipboardDrawer.tsx               |
| List, filters, limit notice | \_shared/ClipboardBrowser/ClipboardBrowser.tsx           |
| Save/edit form              | \_shared/ClipboardEntryForm/ClipboardEntryForm.tsx       |
| Category CRUD               | \_shared/CategoryManager/CategoryManager.tsx             |
| Attach to a document field  | \_shared/ClipboardFieldSuggest/ClipboardFieldSuggest.tsx |

## Do not do

- Do not gate on authority — superadmin has a clipboard too.
- Do not add ordering/sort controls (none exists) or a link to an applicant (never linked).
- Do not send the category object back on write — send `category.id`.
- Do not call `use` before the copy succeeds, or fetch suggestions per keystroke.
- Do not attach `ClipboardFieldSuggest` without registering its `fieldKey`.
- Do not fetch in `useEffect`; do not import Mantine directly.
