export interface ReasonConfirmDialogProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  description: string;
  consequenceText?: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonRequired?: boolean;
  confirmLabel?: string;
  confirmColor?: string;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}
