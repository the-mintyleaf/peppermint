// DTOs mirror `docs/backend/authenticate/INTEGRATION.md` v1.5.0 — "Personal clipboard"
// models (ClipboardEntry, ClipboardCategory, Clipboard delete result).

/** `{ id, name }` — the READ shape of an entry's category. Written as a bare uuid. */
export interface ClipboardCategoryRef {
  id: string;
  name: string;
}

export interface ClipboardEntry {
  id: string;
  label: string;
  text: string;
  /** `""` when unset — otherwise a lowercase dotted key (`father.name`). */
  field_key: string;
  category: ClipboardCategoryRef | null;
  usage_count: number;
  /** `null` until first use. */
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClipboardCategory {
  id: string;
  name: string;
  entry_count: number;
  created_at: string;
  updated_at: string;
}

/** Create body. `category` is the category's id (uuid) or `null`, never the read object. */
export interface ClipboardEntryCreate {
  label: string;
  text: string;
  field_key?: string;
  category?: string | null;
}

/** Any subset. `field_key: ""` clears the key; `category: null` uncategorises. */
export type ClipboardEntryUpdate = Partial<ClipboardEntryCreate>;

export interface ClipboardCategoryInput {
  name: string;
}

/** `{ deleted: true }` for an entry; plus `entries_uncategorized` for a category. */
export interface ClipboardDeleteResult {
  deleted: boolean;
  entries_uncategorized?: number;
}

/** `category` is a category id or the literal `"none"` (uncategorised only). */
export interface ClipboardListFilters {
  /** One key or a comma list; exact match. */
  field_key?: string;
  category?: string;
  /** Case-insensitive substring of label, text or category name (≤100). */
  search?: string;
  page?: number;
  page_size?: number;
}
