export { ClipboardDrawer } from "./drawer";
export type { ClipboardDrawerProps } from "./drawer";

// Field-level helper for document forms (not attached to any form yet): a button +
// popover, and the hook underneath it for a custom UI.
export { ClipboardFieldSuggest } from "./_shared/ClipboardFieldSuggest";
export type { ClipboardFieldSuggestProps } from "./_shared/ClipboardFieldSuggest";
export { useClipboardSuggestions } from "./clipboard.hooks";

// The `field_key` vocabulary (frontend-owned) — register a key here before using it.
export { CLIPBOARD_FIELD_KEYS, fieldKeyLabel } from "./clipboard.fieldKeys";
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
