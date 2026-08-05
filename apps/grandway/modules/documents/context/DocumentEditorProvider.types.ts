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

/**
 * Why the editor is read-only, in precedence order, or `null` when it is not.
 *
 * Precedence matters for copy: a reader looking at an archived document should be
 * told they have view-only access, not that the document is archived — the first
 * fact is the one that would still be true if they opened a live document.
 */
export type DocumentReadOnlyReason =
  | "role"
  | "archived"
  | "historical"
  /** The server says this document is not editable, for a reason status doesn't explain. */
  | "locked"
  | null;

export interface DocumentEditorContextValue {
  /** Applicant workspace id, or `null` for a standalone single-document editor. */
  applicantId: string | null;
  /**
   * Whether this viewer may write at all — the role capability alone, constant for
   * the session. Gate an affordance that creates something (Add page, the create
   * modals) on this.
   */
  canEdit: boolean;
  /**
   * Whether the viewer may reach the workspaces roll-up (`/admin/documents`).
   * Separate from `canEdit` — that screen has its own capability, and conflating them
   * is how a "close" button ends up pointing at a forbidden route.
   */
  canOpenWorkspaces: boolean;
  /**
   * Whether the *active document* can be edited right now: `canEdit`, and the
   * document exists, and its status allows it, and the server agrees
   * (`Document.isEditable`), and we are not previewing a historical snapshot.
   *
   * **The one composed predicate.** Role, status and history stay separate inputs,
   * but nothing outside this provider recombines them — that is what stopped there
   * being three competing notions of "read-only" in this module.
   */
  isActiveDocumentEditable: boolean;
  /** Which of those inputs is responsible, so copy can name it. */
  readOnlyReason: DocumentReadOnlyReason;
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
