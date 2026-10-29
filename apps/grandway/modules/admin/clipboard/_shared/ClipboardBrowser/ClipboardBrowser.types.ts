import type { ClipboardCategory, ClipboardEntry } from "../../clipboard.types";

export interface ClipboardBrowserProps {
  categories: ClipboardCategory[];
  onNew: () => void;
  onEdit: (entry: ClipboardEntry) => void;
  onManageCategories: () => void;
  /** Category the manager just deleted — resets the filter if it was selected. */
  deletedCategoryId?: string | null;
}

/** "all" = no filter, "none" = uncategorised, otherwise a category id. */
export type ClipboardCategoryFilter = string;
