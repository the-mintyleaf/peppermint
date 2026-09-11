export interface SignatureManagerModalProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * Which sub-screen the modal is showing. A modal-inside-a-modal is the wrong
 * shape for a library this small, so create and edit are **views of the same
 * modal**, mirroring the sub-screen convention in `AccountSettingsModal`.
 *
 * `edit` carries only the id, never the row: the row is re-read from the list
 * query, so an upload or a status change that lands while the form is open is
 * reflected rather than being shadowed by a stale copy.
 */
export type SignatureManagerView =
  | { mode: "list" }
  | { mode: "create" }
  | { mode: "edit"; id: string };
