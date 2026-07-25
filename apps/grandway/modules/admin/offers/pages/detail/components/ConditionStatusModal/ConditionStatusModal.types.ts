import type { Condition } from "../../../../offers.types";

export interface ConditionStatusModalProps {
  offerId: string;
  condition: Condition;
  opened: boolean;
  onClose: () => void;
}
