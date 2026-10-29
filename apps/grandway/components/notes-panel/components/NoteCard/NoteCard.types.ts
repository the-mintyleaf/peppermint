import type { NoteFormValues, NotesPanelNote } from "../../NotesPanel.types";

export interface NoteCardProps {
  note: NotesPanelNote;
  /** Author or Admin, and the panel is not read-only. */
  canModify: boolean;
  isEditing: boolean;
  onEdit: (note: NotesPanelNote) => void;
  onCancelEdit: () => void;
  /** Resolve on success (the card leaves edit mode); reject with the API error. */
  onSave: (note: NotesPanelNote, values: NoteFormValues) => Promise<void>;
  onDelete: (note: NotesPanelNote) => void;
  bodyLabel: string;
  popoverZIndex?: number;
}
