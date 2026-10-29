import type { NoteFormValues, NoteTabCategory } from "../../NotesPanel.types";

export interface NoteComposerProps {
  /** The active tab — a new note is filed under it. */
  category: NoteTabCategory;
  bodyLabel: string;
  /** Resolve on success (the composer collapses); reject with the API error. */
  onCreate: (values: NoteFormValues) => Promise<void>;
  popoverZIndex?: number;
}
