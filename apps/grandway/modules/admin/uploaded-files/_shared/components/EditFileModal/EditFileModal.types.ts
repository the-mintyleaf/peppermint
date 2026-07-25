import type { UploadedFile } from "../../../uploadedFiles.types";

export interface EditFileModalProps {
  file: UploadedFile;
  opened: boolean;
  onClose: () => void;
}
