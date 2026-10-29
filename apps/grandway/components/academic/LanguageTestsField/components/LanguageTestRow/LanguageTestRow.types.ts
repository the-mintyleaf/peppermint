import type { LanguageTestFormRow } from "../../../academic.types";

export interface LanguageTestRowProps {
  /** Dot path of the list (the row lives at `${path}.${index}`). */
  path: string;
  index: number;
  row: LanguageTestFormRow;
  onRemove: (index: number) => void;
  disabled?: boolean;
  popoverZIndex?: number;
}
