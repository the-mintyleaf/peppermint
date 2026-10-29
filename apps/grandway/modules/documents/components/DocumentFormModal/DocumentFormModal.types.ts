import type { ReactNode } from "react";
import type { ModalProps } from "@peppermint/ui";

export interface DocumentFormModalProps {
  opened: boolean;
  onClose: () => void;
  /** The modal's heading ("Edit Woda — Birth Fields"). */
  title: ReactNode;
  size?: ModalProps["size"];
  /** The document type's `Form`. The theme zeroes body padding; forms supply their own. */
  children: ReactNode;
}
