import type { UploadedFile } from "../../../../uploadedFiles.types";

export interface FileTileGridProps {
  files: UploadedFile[];
  /** Opens the in-app viewer (images/PDFs). Other types download instead. */
  onPreview: (file: UploadedFile) => void;
  onReplace: (file: UploadedFile) => void;
  onEdit: (file: UploadedFile) => void;
  onVerify: (file: UploadedFile) => void;
}

export type FileTileProps = Omit<FileTileGridProps, "files"> & {
  file: UploadedFile;
};
