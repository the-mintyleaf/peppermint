import { DocumentEditor } from "./pages/editor/DocumentEditor";

/**
 * The full-screen document editor. Rendered by the admin-scoped Documents module routes
 * (`@/modules/admin/documents`) for both applicant workspaces and standalone documents.
 */
export const ModuleDocuments = {
  editor: DocumentEditor,
};

export { DocumentEditor } from "./pages/editor/DocumentEditor";
export { DocumentEditorProvider, useDocumentEditor } from "./context";
export { useDocumentActions } from "./hooks/useDocumentActions";
export { useDocumentHistory } from "./hooks/useDocumentHistory";
export { useSignatures } from "./hooks/useSignatures";

// Shared engine surface consumed by the admin-scoped Documents module + panels.
export { documentsApi } from "./documents.api";
export type {
  DocumentListParams,
  DocumentsListResult,
  DocumentCatalogTemplate,
} from "./documents.api";
export {
  BANK_FAMILIES,
  DOCUMENT_FAMILIES,
  allowedDocumentFamilies,
  canSeeFamily,
  isBankFamily,
  isBankTemplateKey,
} from "./documents.families";
export { documentHistoryApi } from "./documentHistory.api";
export {
  documentQueryKeys,
  documentWorkspacesKey,
  documentHistoryKey,
  documentsByApplicantKey,
  documentsByApplicantPrefix,
} from "./documents.queryKeys";
export { documentTypeList, getDocumentTypeConfig } from "./documentTypeConfig";
export {
  STATUS_META,
  getNextStatusAction,
  isEditableStatus,
  canArchiveStatus,
} from "./documents.status";
// The signature validity helpers are gone. They were built on `validFrom`/
// `validTo`, fields no endpoint in `document_templates` has ever supplied, so
// every signatory read as "unbounded" and the picker suffix was always "".
// A picker annotation that says something true lives in
// `@/modules/admin/signatures`' `signatureSourceSuffix`.

export type {
  Document,
  DocumentListItem,
  DocumentType,
  DocumentStatus,
  DocumentStatusValue,
  DocumentFamily,
  DocumentContent,
  LorContent,
  DocumentHistoryEvent,
  DocumentHistoryAction,
  DocumentFormProps,
  DocumentTemplateProps,
  DocumentConfigBarProps,
  DocumentTypeConfig,
  DocumentWorkspaceSummary,
  CreateDocumentInput,
  UpdateDocumentInput,
  Signature,
  StudentFullData,
  HistoricalSnapshot,
  BsDate,
} from "./documents.types";
export type {
  DocumentSnapshot,
  DocumentSnapshotDetail,
  DocumentPrintEvent,
  PrintEventType,
  CaptureSnapshotInput,
} from "./documentHistory.types";
