export { ClipboardDrawer } from "./drawer";
export type { ClipboardDrawerProps } from "./drawer";
// Raise the drawer above an open Modal (a document form) with this.
export { CLIPBOARD_DRAWER_OVER_MODAL_Z_INDEX } from "./clipboard.constants";

// Field-level helper for document forms: a button + popover, the hook underneath it,
// and the two attach helpers — `bindClipboardFields(form, { family })` (one spread
// per field of a Mantine form) and `withClipboard({...})` (any input).
export {
  ClipboardFieldSuggest,
  bindClipboardFields,
  withClipboard,
} from "./_shared/ClipboardFieldSuggest";
export type {
  BindClipboardFieldsOptions,
  ClipboardBindableForm,
  ClipboardFieldBinder,
  ClipboardFieldOverrides,
  ClipboardFieldSuggestProps,
  ClipboardInputSectionProps,
  WithClipboardOptions,
} from "./_shared/ClipboardFieldSuggest";
export { useClipboardSuggestions } from "./clipboard.hooks";

// The `field_key` vocabulary (frontend-owned): registered keys + the derivation rule.
export {
  CLIPBOARD_FIELD_KEYS,
  deriveFieldKey,
  derivedFieldKeyLabel,
  fieldKeyLabel,
} from "./clipboard.fieldKeys";
export type { ClipboardFieldKeyOption } from "./clipboard.fieldKeys";

export {
  clipboardEntryKeys,
  clipboardCategoryKeys,
} from "./clipboard.queryKeys";
export { getClipboardErrorMessage } from "./clipboard.errors";
export type {
  ClipboardEntry,
  ClipboardCategory,
  ClipboardCategoryRef,
  ClipboardListFilters,
} from "./clipboard.types";
