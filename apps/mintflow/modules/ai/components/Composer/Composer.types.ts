export interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  /** Send the current input as a user message. */
  onSend: () => void;
  /** Switch to the voice screen. */
  onMic: () => void;
  /** Whether a reply is in flight (disables send). */
  pending: boolean;
}
