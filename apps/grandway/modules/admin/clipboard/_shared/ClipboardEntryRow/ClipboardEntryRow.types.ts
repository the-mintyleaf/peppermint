import type { ClipboardEntry } from "../../clipboard.types";

export interface ClipboardEntryRowProps {
  entry: ClipboardEntry;
  /** Resolves `true` when the text reached the system clipboard. */
  onCopy: (entry: ClipboardEntry) => Promise<boolean>;
  onEdit: (entry: ClipboardEntry) => void;
  /** Asks for confirmation upstream — the row never deletes by itself. */
  onDelete: (entry: ClipboardEntry) => void;
  /** True while this entry's delete is in flight. */
  isDeleting?: boolean;
}
