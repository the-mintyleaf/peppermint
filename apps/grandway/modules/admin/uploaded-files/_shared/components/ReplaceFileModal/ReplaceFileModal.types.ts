import type { UploadedFile } from "../../../uploadedFiles.types";

export interface ReplaceFileModalProps {
  /** The file being superseded — owner and category are inherited, never shown as fields. */
  file: UploadedFile;
  opened: boolean;
  onClose: () => void;
  /** Called with the NEW file's id after a successful replace (e.g. FileDetail navigates to it). */
  onReplaced?: (newFileId: string) => void;
}
