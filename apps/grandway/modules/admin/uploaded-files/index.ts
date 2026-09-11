export { FilesPanel } from "./_shared/FilesPanel";
export type { FilesPanelProps } from "./_shared/FilesPanel";
export { ModuleFileDetail } from "./pages/detail/FileDetail";
export { ModuleFileReviewQueue } from "./pages/review/FileReviewQueue";

// Public API for cross-module reuse (e.g. an applicant/offer/journey detail
// page embedding `FilesPanel`, or a checklist evidence picker listing files
// — `checklists.item.status` cites a file id as `evidence_file`, per this
// module's INTEGRATION.md §"Referenced by other apps"). Internal siblings
// import concrete files to avoid cycles; this barrel is for OTHER modules.
export { archiveFile, getFile, listFiles } from "./uploadedFiles.api";
export { useFileDetail, useFilesList } from "./uploadedFiles.hooks";
// Inline image preview for another module's owned file — the signatory library
// renders signature images this way, since the download route 401s an `<img
// src>` and the bytes must be fetched and handed over as an object URL. Kept
// here rather than re-implemented per consumer: this hook owns the object-URL
// lifecycle, and getting that wrong leaks a browser resource per render.
export { useFileBlob } from "./_shared/useFileBlob";
export { fileQueryKeys, filesListKey } from "./uploadedFiles.queryKeys";
export {
  FILE_CATEGORY_LABELS,
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
} from "./uploadedFiles.labels";
export type {
  ArchiveFilePayload,
  FileCategory,
  FileOwnerScope,
  UploadedFile,
  VerificationStatus,
} from "./uploadedFiles.types";
