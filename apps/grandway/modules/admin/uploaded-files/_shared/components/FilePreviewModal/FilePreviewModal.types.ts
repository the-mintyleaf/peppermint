import type { UploadedFile } from "../../../uploadedFiles.types";

export interface FilePreviewModalProps {
  /** An image or PDF — `getFileViewKind(file)` must not be `"download"`. */
  file: UploadedFile;
  opened: boolean;
  onClose: () => void;
  /**
   * Fired once the close transition has finished — the caller unmounts the
   * modal here, which revokes the object URL (see `useFilePreview`).
   */
  onExited?: () => void;
}

export interface PreviewStageProps {
  name: string;
  kind: "image" | "pdf";
  preview: FilePreview;
}

export interface FilePreview {
  /** Object URL over the bytes, typed with the viewer MIME type; `null` until ready. */
  url: string | null;
  /** The fetched bytes, for the Download button (no second request). */
  blob: Blob | null;
  isError: boolean;
  error: unknown;
  isRetrying: boolean;
  retry: () => void;
}
