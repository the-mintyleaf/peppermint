import type { FileOwnerScope } from "../../../uploadedFiles.types";

export interface UploadFileModalProps {
  /** Exactly one key set — inherited from the embedding `FilesPanel`, never shown as a field. */
  scope: FileOwnerScope;
  opened: boolean;
  onClose: () => void;
}
