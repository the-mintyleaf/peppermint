import type { DocumentStatus, DocumentStatusAction } from "./documents.types";

/** Badge label + Mantine color per document status (words + color, never color alone). */
export const STATUS_META: Record<
  DocumentStatus,
  { label: string; color: string }
> = {
  draft: { label: "Draft", color: "gray" },
  ready: { label: "Ready", color: "blue" },
  finalized: { label: "Finalized", color: "indigo" },
  submitted: { label: "Submitted", color: "green" },
  superseded: { label: "Superseded", color: "gray" },
  archived: { label: "Archived", color: "dark" },
};

/**
 * The single valid forward step for the current status (the guided happy path
 * draft → ready → finalize → submit). Returns null when there is no forward step.
 */
export function getNextStatusAction(
  status: DocumentStatus,
): { action: DocumentStatusAction; label: string } | null {
  switch (status) {
    case "draft":
      return { action: "ready", label: "Mark ready" };
    case "ready":
      return { action: "finalize", label: "Finalize" };
    case "finalized":
      return { action: "submit", label: "Submit" };
    default:
      return null;
  }
}

/** Content is editable only in draft/ready (backend 409s otherwise). */
export function isEditableStatus(status: DocumentStatus): boolean {
  return status === "draft" || status === "ready";
}

/** Archive is available from any non-archived state. */
export function canArchiveStatus(status: DocumentStatus): boolean {
  return status !== "archived";
}
