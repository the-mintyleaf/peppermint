"use client";

import { useQuery } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import {
  archiveFile,
  fetchFileVersions,
  getFile,
  listFiles,
  replaceFile,
  restoreFile,
  updateFile,
  uploadFile,
  verifyFile,
} from "./uploadedFiles.api";
import {
  fileQueryKeys,
  filesListKey,
  fileVersionsKey,
} from "./uploadedFiles.queryKeys";
import type {
  ArchiveFilePayload,
  FileOwnerScope,
  RestoreFilePayload,
  UpdateFilePayload,
  UploadedFile,
  VerifyFilePayload,
} from "./uploadedFiles.types";

/**
 * Every files panel in the product — `FilesPanel`'s own data hook, modelled on
 * `audit/_shared/useEntityAuditTrail.ts`'s "scoped list embedded in another
 * screen" pattern. Requests a generous single page (a panel shows a record's
 * files, not a paginated browser); disabled until a real owner id is present.
 */
export function useFilesList(scope: FileOwnerScope, isArchived = false) {
  return useQuery({
    queryKey: filesListKey(scope, isArchived),
    queryFn: () =>
      listFiles({
        page: 1,
        pageSize: 100,
        search: "",
        sort: [],
        filters: { ...scope, is_archived: isArchived },
      }),
    enabled: Object.values(scope).some(Boolean),
  });
}

/** Full detail for the File Detail route — always the real fetch. */
export function useFileDetail(fileId: string | null) {
  return useQuery({
    queryKey: fileId
      ? fileQueryKeys.detail(fileId)
      : ["files.files", "detail", "none"],
    queryFn: () => getFile(fileId as string),
    enabled: fileId !== null,
  });
}

/** Version chain — oldest first, unpaginated (§3). Works from any member of the chain. */
export function useFileVersions(fileId: string | null) {
  return useQuery({
    queryKey: fileId
      ? fileVersionsKey(fileId)
      : ["files.files", "detail", "none", "versions"],
    queryFn: () => fetchFileVersions(fileId as string),
    enabled: fileId !== null,
  });
}

/**
 * Every mutation below invalidates the whole `files.files` tree (`fileQueryKeys.all`)
 * rather than one scoped key — a single file write can affect an open Files panel
 * (any owner), an open File Detail, its Version history, and the Review queue all at
 * once, and there is no cheap way to know which scoped list keys are mounted (same
 * broad-invalidate reasoning as `clients.hooks.ts`'s retire/restore).
 */
function invalidateAllFiles() {
  return [fileQueryKeys.all];
}

/** `POST /api/v1/files/` — 201, multipart. `formData` is built by `UploadFileModal`. */
export function useUploadFile() {
  return useAppMutation<UploadedFile, FormData>({
    mutationFn: (formData) => uploadFile(formData),
    successMessage: "File uploaded.",
    errorTitle: "Couldn't upload file",
    invalidateKeys: invalidateAllFiles(),
  });
}

/** `POST /api/v1/files/<id>/replace/` — 201, multipart. Returns a NEW file (new id). */
export function useReplaceFile(fileId: string) {
  return useAppMutation<UploadedFile, FormData>({
    mutationFn: (formData) => replaceFile(fileId, formData),
    successMessage: "File replaced.",
    errorTitle: "Couldn't replace file",
    invalidateKeys: invalidateAllFiles(),
  });
}

/** `PATCH /api/v1/files/<id>/` — category and/or notes only (§7). */
export function useUpdateFile(fileId: string) {
  return useAppMutation<UploadedFile, UpdateFilePayload>({
    mutationFn: (body) => updateFile(fileId, body),
    successMessage: "File updated.",
    errorTitle: "Couldn't update file",
    invalidateKeys: invalidateAllFiles(),
  });
}

/** `POST /api/v1/files/<id>/verify/` — Admin only. A verdict may be revised later (§CONCEPT). */
export function useVerifyFile(fileId: string) {
  return useAppMutation<UploadedFile, VerifyFilePayload>({
    mutationFn: (body) => verifyFile(fileId, body),
    successMessage: "Verification recorded.",
    errorTitle: "Couldn't record verification",
    invalidateKeys: invalidateAllFiles(),
  });
}

/** `POST /api/v1/files/<id>/archive/` — Admin only, reason required. Fully reversible via restore. */
export function useArchiveFile(fileId: string) {
  return useAppMutation<UploadedFile, ArchiveFilePayload>({
    mutationFn: (body) => archiveFile(fileId, body),
    successMessage: "File archived.",
    errorTitle: "Couldn't archive file",
    invalidateKeys: invalidateAllFiles(),
  });
}

/** `POST /api/v1/files/<id>/restore/` — Admin only. Clears all three archive fields (§7). */
export function useRestoreFile(fileId: string) {
  return useAppMutation<UploadedFile, RestoreFilePayload>({
    mutationFn: (body) => restoreFile(fileId, body),
    successMessage: "File restored.",
    errorTitle: "Couldn't restore file",
    invalidateKeys: invalidateAllFiles(),
  });
}
