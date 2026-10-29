import type { ClipboardCategory } from "../../clipboard.types";

export interface CategoryManagerProps {
  categories: ClipboardCategory[];
  /** Back to the snippet list. */
  onBack: () => void;
  /** Called after a category is deleted, so the drawer can reset a filter pointing at it. */
  onCategoryDeleted?: (categoryId: string) => void;
}
