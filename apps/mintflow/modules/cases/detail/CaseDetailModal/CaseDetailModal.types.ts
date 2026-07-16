import type { WorkCase } from "../../module.api";

export interface CaseDetailModalProps {
  /** The case to show; `null` keeps the modal closed. */
  workCase: WorkCase | null;
  onClose: () => void;
}
