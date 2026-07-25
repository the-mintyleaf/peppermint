/**
 * Admin-scoped Documents module — the list surfaces (workspaces + all-documents worklist)
 * and the cross-module applicant panel. The full-screen editor itself lives in
 * `@/modules/documents` (a RouteModule) and is wired directly by the editor routes.
 */
export { DocumentWorkspaces } from "./pages/list/DocumentWorkspaces";
export { DocumentsWorklist } from "./pages/list/DocumentsWorklist";
export { ApplicantDocumentsPanel } from "./components/ApplicantDocumentsPanel";
export type { ApplicantDocumentsPanelProps } from "./components/ApplicantDocumentsPanel";
export {
  documentEditorHref,
  workspaceEditorHref,
  fetchDocuments,
  fetchWorkspaces,
} from "./documents.queries";
export {
  FAMILY_LABELS,
  FAMILY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
} from "./documents.labels";
