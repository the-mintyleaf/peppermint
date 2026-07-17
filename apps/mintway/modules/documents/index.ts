import { DocumentEditor } from "./pages/editor/DocumentEditor";

// The list, "new", and signatures screens moved to admin-scoped modules
// (`@/modules/admin/documents`, `@/modules/admin/signatures`). Only the full-screen
// editor stays here — it needs the standalone `/documents/[applicantId]` layout.
export const ModuleDocuments = {
  editor: DocumentEditor,
};

export { DocumentEditorProvider, useDocumentEditor } from "./context";
export { useDocumentActions } from "./hooks/useDocumentActions";
export { useDocumentHistory } from "./hooks/useDocumentHistory";
export { useSignatures } from "./hooks/useSignatures";

// Shared engine surface consumed by the admin-scoped Documents and Signatures modules.
export { documentsApi } from "./documents.api";
export { documentQueryKeys } from "./documents.queryKeys";

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
  DocumentWorkspaceSummary,
  Signature,
  SignatureInput,
} from "./documents.types";
