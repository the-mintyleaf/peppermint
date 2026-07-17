export interface SignatureCropModalProps {
  opened: boolean;
  /** Object URL of the image being cropped (null while nothing is queued). */
  src: string | null;
  /** Emits the cropped, downscaled PNG when the user confirms. */
  onConfirm: (file: File) => void;
  onClose: () => void;
}
