import type { ReactNode } from "react";

export interface ReferenceCrudPanelProps<T extends { id: string }> {
  /** e.g. "country" / "field" — used in the Add button and empty/error copy. */
  entityLabel: string;
  entries: T[];
  /** Whether an entry counts as currently in use (drives the retired filter). */
  isEntryActive: (entry: T) => boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  renderCreateForm: (onDone: () => void) => ReactNode;
  renderEditForm: (entry: T, onDone: () => void) => ReactNode;
  renderCard: (entry: T, onEdit: () => void) => ReactNode;
  /** Reports whether an add/edit draft is open, so the modal can guard its close. */
  onDraftStateChange?: (hasDraft: boolean) => void;
}
