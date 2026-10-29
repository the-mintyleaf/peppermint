import type { UploadedFile } from "../../../uploadedFiles.types";

export interface FileRowActionsMenuProps {
  file: UploadedFile;
  /**
   * Opens the in-app viewer. When given, a "Preview" item appears for images
   * and PDFs (other types only have "Download").
   */
  onPreview?: (file: UploadedFile) => void;
  onReplace: (file: UploadedFile) => void;
  onEdit: (file: UploadedFile) => void;
  onVerify: (file: UploadedFile) => void;
}
