import type { OfferDetail } from "../../../../offers.types";

export interface IssueOfferModalProps {
  offer: OfferDetail;
  opened: boolean;
  onClose: () => void;
}
