import type { Offer } from "../../../../offers.types";

export interface OfferRowActionsMenuProps {
  offer: Offer;
  onViewDetails: (offer: Offer) => void;
}
