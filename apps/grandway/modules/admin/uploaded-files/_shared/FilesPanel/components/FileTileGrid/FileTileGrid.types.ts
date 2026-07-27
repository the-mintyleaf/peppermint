import type { UploadedFile } from "../../../../uploadedFiles.types";

export interface FileTileGridProps {
  files: UploadedFile[];
  onReplace: (file: UploadedFile) => void;
  onEdit: (file: UploadedFile) => void;
  onVerify: (file: UploadedFile) => void;
}

export interface FileTileProps {
  file: UploadedFile;
  onReplace: (file: UploadedFile) => void;
  onEdit: (file: UploadedFile) => void;
  onVerify: (file: UploadedFile) => void;
}
