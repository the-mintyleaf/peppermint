import type { UploadedFile } from "../../../uploadedFiles.types";

export interface VerifyFileModalProps {
  file: UploadedFile;
  opened: boolean;
  onClose: () => void;
}
