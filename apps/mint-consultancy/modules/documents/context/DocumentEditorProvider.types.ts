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
  updateDocumentContent: (documentId: string, content: DocumentContent) => void;
  removeDocumentFromList: (documentId: string) => void;
  addDocumentToList: (doc: Document) => void;
  printableContentRef: RefObject<HTMLDivElement | null>;
}
