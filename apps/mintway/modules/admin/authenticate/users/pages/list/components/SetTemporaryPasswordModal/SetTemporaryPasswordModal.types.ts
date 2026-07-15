export interface SetTemporaryPasswordModalProps {
  opened: boolean;
  onClose: () => void;
  /** The account the password is being reset for (shown for confirmation). */
  username: string;
  isSubmitting: boolean;
  /** Called with the entered temporary password when the admin confirms. */
  onConfirm: (temporaryPassword: string) => void;
}
