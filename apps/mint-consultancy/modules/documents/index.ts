import { DocumentEditor } from "./pages/editor/DocumentEditor";
import { DocumentsList } from "./pages/list/DocumentsList";

export const ModuleDocuments = {
  list: DocumentsList,
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
  PrintLog,
  DocumentFormProps,
  DocumentTemplateProps,
  DocumentConfigBarProps,
} from "./documents.types";
