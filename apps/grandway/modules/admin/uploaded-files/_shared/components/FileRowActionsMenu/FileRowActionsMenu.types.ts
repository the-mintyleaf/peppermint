import type { UploadedFile } from "../../../uploadedFiles.types";

export interface FileRowActionsMenuProps {
  file: UploadedFile;
  onReplace: (file: UploadedFile) => void;
  onEdit: (file: UploadedFile) => void;
  onVerify: (file: UploadedFile) => void;
}
