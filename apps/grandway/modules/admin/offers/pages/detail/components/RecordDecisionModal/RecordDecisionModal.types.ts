import type { OfferDetail } from "../../../../offers.types";

export interface RecordDecisionModalProps {
  offer: OfferDetail;
  opened: boolean;
  onClose: () => void;
}
