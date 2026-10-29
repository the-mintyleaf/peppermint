/** Backend caps (INTEGRATION.md v1.5.0) — shown in copy and used to warn before the wall. */
export const CLIPBOARD_ENTRY_LIMIT = 200;
export const CLIPBOARD_CATEGORY_LIMIT = 50;

export const CLIPBOARD_LABEL_MAX = 120;
export const CLIPBOARD_TEXT_MAX = 2000;
export const CLIPBOARD_CATEGORY_NAME_MAX = 60;
export const CLIPBOARD_SEARCH_MAX = 100;

/** The list is ordered most-used first; one generous page, with a truncation notice. */
export const CLIPBOARD_PAGE_SIZE = 100;

/** Suggestions under a document field are a handful of rows, not a pager. */
export const CLIPBOARD_SUGGESTION_PAGE_SIZE = 10;

/** `category` filter sentinel for "Uncategorised"; the "All" filter is simply no value. */
export const CATEGORY_FILTER_NONE = "none";

/** `^[a-z0-9_]+(\.[a-z0-9_]+)*$`, ≤100 — the server checks only this shape. */
export const FIELD_KEY_PATTERN = /^[a-z0-9_]+(\.[a-z0-9_]+)*$/;
export const FIELD_KEY_MAX = 100;

/** Layer above a Drawer (200) so confirm modals opened from inside it are reachable. */
export const CLIPBOARD_CONFIRM_Z_INDEX = 400;
