import type { RefObject } from "react";
import type {
  Document,
  DocumentContent,
  DocumentType,
  PrintLog,
  Signature,
  StudentFullData,
} from "../documents.types";

export interface DocumentEditorContextValue {
  studentId: string;
  studentFullData: StudentFullData | null | undefined;
  documents: Document[];
  isLoadingDocuments: boolean;
  activeDocumentId: string | null;
  activeDocument: Document | null;
  setActiveDocumentId: (id: string | null) => void;
  activeHistoricalLog: PrintLog | null;
  setActiveHistoricalLog: (log: PrintLog | null) => void;
  signatures: Signature[];
  createModalOpen: boolean;
  createModalType: DocumentType | null;
  openCreateModal: (type: DocumentType) => void;
  closeCreateModal: () => void;
  editFieldsModalOpen: boolean;
  setEditFieldsModalOpen: (open: boolean) => void;
  updateDocumentContent: (documentId: string, content: DocumentContent) => void;
  removeDocumentFromList: (documentId: string) => void;
  addDocumentToList: (doc: Document) => void;
  quickCreateDocument: (type: DocumentType) => void;
  createDocumentWithContent: (type: DocumentType, content: DocumentContent, label?: string) => void;
  isCreatingDocument: boolean;
  printableContentRef: RefObject<HTMLDivElement | null>;
  hasUnsavedChanges: boolean;
  markUnsavedChanges: () => void;
  confirmLeave: (onConfirm: () => void) => void;
}
