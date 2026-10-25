import type {
  Document,
  DocumentStatus,
  DocumentStatusValue,
} from "./documents.types";

/** Badge label + Mantine color per document status (words + color, never color alone). */
export const STATUS_META: Record<
  DocumentStatus,
  { label: string; color: string }
> = {
  draft: { label: "Draft", color: "gray" },
  ready: { label: "Ready", color: "blue" },
  archived: { label: "Archived", color: "dark" },
};

/**
 * The single forward status step for the current status. Grandway has only
 * draft ↔ ready (archive is a separate endpoint, not a status). Returns `null`
 * when there is no forward step (already `ready`, or `archived`/frozen).
 */
export function getNextStatusAction(
  status: DocumentStatus,
): { value: DocumentStatusValue; label: string } | null {
  if (status === "draft") return { value: "ready", label: "Mark ready" };
  return null;
}

/** Content is editable in any non-archived state (backend 409s only when archived). */
export function isEditableStatus(status: DocumentStatus): boolean {
  return status !== "archived";
}

/** Archive is available from any non-archived state. */
export function canArchiveStatus(status: DocumentStatus): boolean {
  return status !== "archived";
}

/**
 * Removing a document archives it. A removed document can still be opened and
 * restored, but it is not a page: no page number, no "Print all".
 */
export function isLiveDocument(doc: Document): boolean {
  return doc.status !== "archived";
}
