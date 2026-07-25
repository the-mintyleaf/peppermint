import { createQueryKeys } from "@peppermint/admin";
import type { FileOwnerScope } from "./uploadedFiles.types";

export const fileQueryKeys = createQueryKeys("files.files");

/**
 * A scoped-list key keyed by the embedding owner filter, so each `FilesPanel`
 * instance (one per applicant/journey/offer/document) caches independently.
 * `isArchived` is part of the key too — the panel's default view and a future
 * "show archived" toggle are different queries, not the same one re-filtered
 * client-side (§3 — omitting `is_archived` returns archived files too).
 */
export function filesListKey(scope: FileOwnerScope, isArchived = false) {
  return fileQueryKeys.list({ ...scope, is_archived: isArchived });
}

/** `[...detail(id), "versions"]` — a strict suffix of `detail(id)`, so invalidating `detail(id)` refreshes it too. */
export function fileVersionsKey(id: string) {
  return [...fileQueryKeys.detail(id), "versions"] as const;
}
