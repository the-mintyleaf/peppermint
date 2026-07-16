import { DocumentEditor } from "./pages/editor/DocumentEditor";
import { DocumentsList } from "./pages/list/DocumentsList";
import { DocumentsNew } from "./pages/new/DocumentsNew";
import { SignaturesManager } from "./pages/signatures/SignaturesManager";

export const ModuleDocuments = {
  list: DocumentsList,
  new: DocumentsNew,
  editor: DocumentEditor,
  signatures: SignaturesManager,
};

export { DocumentEditorProvider, useDocumentEditor } from "./context";
export { useDocumentActions } from "./hooks/useDocumentActions";
export { useDocumentHistory } from "./hooks/useDocumentHistory";
export { useSignatures } from "./hooks/useSignatures";

export type {
  Document,
  DocumentType,
  DocumentContent,
  LorContent,
  PrintEvent,
  DocumentRevision,
  DocumentFormProps,
  DocumentTemplateProps,
  DocumentConfigBarProps,
} from "./documents.types";
