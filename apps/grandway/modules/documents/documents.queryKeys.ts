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
 * An applicant's document **list rows** (`documentsApi.listByApplicant`) — the light
 * shape, without `content`.
 *
 * Deliberately its own namespace rather than `documentQueryKeys.list({ applicant })`,
 * which the editor provider uses for a different payload: that one follows each row
 * with a detail fetch and caches whole documents. Two shapes under sibling keys is
 * how the applicant panel and the list-row button previously disagreed about what
 * `documentQueryKeys.list(id)` held.
 *
 * `bankFamilies` is part of the key because callers filter the result by the
 * families the viewer may see. Without it, an admin and a staff session in the same
 * tab after a re-login would share one entry, and whichever fetched first would
 * decide what the other saw.
 */
export const documentsByApplicantKey = (
  applicantId: string,
  scope: { bankFamilies: boolean },
) => ["documents", "by-applicant", applicantId, scope] as const;

/**
 * Prefix of the above, for invalidation. Matches every family scope for one
 * applicant, so a mutation refreshes the list whichever viewer warmed it — writers
 * must invalidate this whenever they create, edit, archive or restore a document,
 * or the panel and the list-row button keep serving a stale answer for the query
 * client's `staleTime`.
 */
export const documentsByApplicantPrefix = (applicantId: string) =>
  ["documents", "by-applicant", applicantId] as const;

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
