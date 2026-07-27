import type { FileCategory } from "../../../../uploadedFiles.types";

export interface FileFolder {
  category: FileCategory;
  label: string;
  count: number;
}

export interface FileFolderGridProps {
  /** Populated folders only, in `FILE_CATEGORY_LABELS` order. */
  folders: FileFolder[];
  onOpen: (category: FileCategory) => void;
}
