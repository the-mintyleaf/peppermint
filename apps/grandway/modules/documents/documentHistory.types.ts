import type {
  BsDate,
  DocumentContent,
  DocumentFamily,
} from "./documents.types";

/** Print-event verb (`document_history` sets it — never client-supplied). */
export type PrintEventType = "capture" | "reprint" | "recovery";

/** An immutable print snapshot list row (`GET /document-history/documents/<id>/snapshots/`). */
export interface DocumentSnapshot {
  id: string;
  documentId: string;
  versionNumber: number;
  family: DocumentFamily;
  templateKey: string;
  label: string;
  captureNote: string;
  capturedByUsername: string;
  createdAt: string;
  createdAtBs: BsDate | null;
}

/** Full frozen snapshot (`GET /document-history/snapshots/<id>/`) — adds the body + context. */
export interface DocumentSnapshotDetail extends DocumentSnapshot {
  content: DocumentContent;
  renderContext: Record<string, unknown>;
}

/** A print/reprint/recovery event (`GET /document-history/documents/<id>/timeline/`). */
export interface DocumentPrintEvent {
  id: string;
  snapshotId: string;
  documentId: string;
  versionNumber: number;
  label: string;
  eventType: PrintEventType;
  note: string;
  performedByUsername: string;
  createdAt: string;
  createdAtBs: BsDate | null;
}

/** Body for capturing a snapshot — `content` is copied from the document, never sent. */
export interface CaptureSnapshotInput {
  /** Frontend-computed derived values + any render metadata; convention: `{ computed, ... }`. */
  renderContext: Record<string, unknown>;
  captureNote?: string;
}
