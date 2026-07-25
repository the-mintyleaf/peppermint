import { createQueryKeys } from "@peppermint/admin";

/**
 * Query keys for the documents resource (`/api/v1/documents/`). `list(params)` covers the
 * per-applicant workspace view (`{ applicant: id }`) and the standalone / all-documents
 * worklists; `detail(id)` is a single document.
 */
export const documentQueryKeys = createQueryKeys("documents.documents");

/** Workspaces roll-up (`GET /documents/workspaces/`). */
export const documentWorkspacesKey = () =>
  [...documentQueryKeys.all, "workspaces"] as const;

/**
 * A document's audit history (`GET /documents/<id>/history/`). Nested under the detail key
 * so invalidating the detail also refreshes an open History panel.
 */
export const documentHistoryKey = (id: string) =>
  [...documentQueryKeys.detail(id), "history"] as const;

/** Active signatories for the certificate signatory picker (from `document_templates`). */
export const documentSignaturesKey = () =>
  ["documents", "signatories", "active"] as const;

/** Active template catalogue for the create-document template picker. */
export const documentTemplateCatalogKey = () =>
  ["documents", "template-catalog", "active"] as const;

/** Print snapshots for a document (`document_history` module). */
export const documentSnapshotsKey = (id: string) =>
  [...documentQueryKeys.detail(id), "snapshots"] as const;

/** Print-event timeline for a document (`document_history` module). */
export const documentTimelineKey = (id: string) =>
  [...documentQueryKeys.detail(id), "timeline"] as const;
