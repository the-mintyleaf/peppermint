export interface OneTimeSecretModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  description: string;
  /** One or more secret values to display (e.g. a single temporary password). */
  secrets: string[];
}
