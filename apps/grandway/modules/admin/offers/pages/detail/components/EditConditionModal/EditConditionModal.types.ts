import type { Condition } from "../../../../offers.types";

export interface EditConditionModalProps {
  offerId: string;
  /** The condition being edited; the parent renders this modal only when set. */
  condition: Condition;
  opened: boolean;
  onClose: () => void;
}
