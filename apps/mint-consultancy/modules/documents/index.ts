import { DocumentEditor } from "./pages/editor/DocumentEditor";
import { DocumentsList } from "./pages/list/DocumentsList";
import { DocumentsNew } from "./pages/new/DocumentsNew";

export const ModuleDocuments = {
  list: DocumentsList,
  new: DocumentsNew,
  editor: DocumentEditor,
};

export { DocumentEditorProvider, useDocumentEditor } from "./context";
export { useDocumentActions } from "./hooks/useDocumentActions";
export { usePrintLogs } from "./hooks/usePrintLogs";
export { useSignatures } from "./hooks/useSignatures";

export type {
  Document,
  DocumentType,
  DocumentContent,
  LorContent,
  PrintLog,
  DocumentFormProps,
  DocumentTemplateProps,
  DocumentConfigBarProps,
} from "./documents.types";
