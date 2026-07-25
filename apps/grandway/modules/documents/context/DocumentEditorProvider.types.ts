import type { RefObject } from "react";
import type {
  Document,
  DocumentContent,
  DocumentStatusValue,
  DocumentType,
  HistoricalSnapshot,
  Signature,
  StudentFullData,
} from "../documents.types";

/**
 * A history entry the user can preview in place of the live document. In grandway a history
 * entry is a `document_history` **print snapshot** (each carries its frozen `content`, so it
 * previews and can be recovered). `snapshot` feeds the template's `historicalSnapshot`.
 */
export interface ActiveHistoricalEntry {
  id: string;
  /** The `document_history` snapshot id (used by the recover/reprint actions). */
  snapshotId: string;
  type: DocumentType;
  snapshot: HistoricalSnapshot;
  at: string;
  versionNumber: number;
  captureNote?: string;
}

export interface DocumentEditorContextValue {
  /** Applicant workspace id, or `null` for a standalone single-document editor. */
  applicantId: string | null;
  /** True when the editor is scoped to one standalone document (no applicant). */
  isStandalone: boolean;
  studentFullData: StudentFullData | null | undefined;
  documents: Document[];
  isLoadingDocuments: boolean;
  activeDocumentId: string | null;
  activeDocument: Document | null;
  setActiveDocumentId: (id: string | null) => void;
  activeHistoricalLog: ActiveHistoricalEntry | null;
  setActiveHistoricalLog: (log: ActiveHistoricalEntry | null) => void;
  signatures: Signature[];
  createModalOpen: boolean;
  createModalType: DocumentType | null;
  openCreateModal: (type: DocumentType) => void;
  closeCreateModal: () => void;
  editFieldsModalOpen: boolean;
  setEditFieldsModalOpen: (open: boolean) => void;
  /**
   * Persist a content edit. `content` is replaced WHOLESALE by the backend, so callers pass
   * the complete content object every time (`documents/INTEGRATION.md` §3). There is no
   * optimistic-concurrency token in grandway — last write wins.
   */
  updateDocumentContent: (documentId: string, content: DocumentContent) => void;
  /**
   * Render-only content update: writes to the local query cache so the preview/print reflect
   * the change, but never persists. Used by the bank Customizations panel (print-layout tweaks).
   */
  updateDocumentContentLocal: (
    documentId: string,
    content: DocumentContent,
  ) => void;
  addDocumentToList: (doc: Document) => void;
  quickCreateDocument: (type: DocumentType) => void;
  createDocumentWithContent: (
    type: DocumentType,
    content: DocumentContent,
    label?: string,
  ) => void;
  /** Creates a bank's certificate + statement together (they live as a pair). */
  createBankPair: (slugKey: string) => void;
  isCreatingDocument: boolean;
  /** Move the active document between `draft` and `ready` (`POST /<id>/status/`). */
  setDocumentStatus: (value: DocumentStatusValue) => void;
  /** Archive the active document with a mandatory reason (the "delete" affordance). */
  archiveActiveDocument: (reason: string) => void;
  /** Restore the active (archived) document — always returns to `draft`. */
  restoreActiveDocument: () => void;
  isRunningStatusAction: boolean;
  isPrintingAll: boolean;
  beginPrintAll: () => void;
  endPrintAll: () => void;
  printableContentRef: RefObject<HTMLDivElement | null>;
  hasUnsavedChanges: boolean;
  markUnsavedChanges: () => void;
  confirmLeave: (onConfirm: () => void) => void;
}
