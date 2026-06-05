import { DocumentEditor } from "./pages/editor/DocumentEditor";
import { DocumentsList } from "./pages/list/DocumentsList";

export const ModuleDocuments = {
  list: DocumentsList,
  editor: DocumentEditor,
};

export type {
  Document,
  DocumentType,
  DocumentContent,
  PrintLog,
} from "./documents.types";
