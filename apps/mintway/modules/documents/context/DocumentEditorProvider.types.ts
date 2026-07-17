import type { RefObject } from "react";
import type {
  Document,
  DocumentContent,
  DocumentStatusAction,
  DocumentType,
  HistoricalSnapshot,
  Signature,
  StudentFullData,
} from "../documents.types";

/**
 * A history entry the user can preview in place of the live document. Unifies a saved
 * revision and a print event so the History sidebar renders one timeline. `snapshot` feeds
 * the template's `historicalSnapshot`.
 */
export interface ActiveHistoricalEntry {
  id: string;
  kind: "revision" | "print";
  type: DocumentType;
  snapshot: HistoricalSnapshot;
  at: string;
  revisionNumber?: number;
}

export interface DocumentEditorContextValue {
  applicantId: string;
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
  updateDocumentContent: (documentId: string, content: DocumentContent) => void;
  /**
   * Render-only content update: writes to the local query cache so the preview/print reflect
   * the change, but never persists or creates a revision snapshot. Used by the bank
   * Customizations panel (padding tweaks are print-layout render adjustments, not saved edits).
   */
  updateDocumentContentLocal: (
    documentId: string,
    content: DocumentContent,
  ) => void;
  removeDocumentFromList: (documentId: string) => void;
  addDocumentToList: (doc: Document) => void;
  quickCreateDocument: (type: DocumentType) => void;
  createDocumentWithContent: (
    type: DocumentType,
    content: DocumentContent,
    label?: string,
  ) => void;
  isCreatingDocument: boolean;
  runStatusAction: (action: DocumentStatusAction) => void;
  isRunningStatusAction: boolean;
  isPrintingAll: boolean;
  beginPrintAll: () => void;
  endPrintAll: () => void;
  printableContentRef: RefObject<HTMLDivElement | null>;
  hasUnsavedChanges: boolean;
  markUnsavedChanges: () => void;
  confirmLeave: (onConfirm: () => void) => void;
}
