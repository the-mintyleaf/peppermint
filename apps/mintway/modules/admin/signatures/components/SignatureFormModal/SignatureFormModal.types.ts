import type { Signature } from "@/modules/documents";

export interface SignatureFormModalProps {
  opened: boolean;
  /** The signature being edited, or `null` when creating a new one. */
  signature: Signature | null;
  onClose: () => void;
  /** Called after a successful create/update so the parent can invalidate + close. */
  onSaved: () => void;
}
