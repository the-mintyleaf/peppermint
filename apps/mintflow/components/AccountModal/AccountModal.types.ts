export interface AccountModalProps {
  /** Whether the modal is open. */
  opened: boolean;
  /** Close the modal (backdrop, escape, or the close button). */
  onClose: () => void;
}
