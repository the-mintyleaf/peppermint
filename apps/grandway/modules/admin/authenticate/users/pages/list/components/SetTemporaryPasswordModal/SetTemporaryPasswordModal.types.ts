export interface SetTemporaryPasswordModalProps {
  opened: boolean;
  onClose: () => void;
  /** The account the password is being reset for (shown for confirmation). */
  username: string;
  isSubmitting: boolean;
  /** Called with the entered password, or `undefined` to let the server auto-generate one. */
  onConfirm: (password: string | undefined) => void;
}
