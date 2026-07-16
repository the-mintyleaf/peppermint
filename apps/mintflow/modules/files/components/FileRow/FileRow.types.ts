import type { FileItem } from "../../Files.types";

export interface FileRowProps {
  file: FileItem;
  /** Fires when the row is clicked (navigates to the file trail). */
  onOpen: (id: string) => void;
}
