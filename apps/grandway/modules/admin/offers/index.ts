export { ModuleOffersWorklist } from "./pages/list/OffersWorklist";
export { ModuleOfferDetail } from "./pages/detail/OfferDetail";

// Public API for cross-module reuse (e.g. a journey view listing its offers).
// Consumers import these from the barrel; internal siblings import concrete
// files to avoid cycles.
export { listOffers, getOffer } from "./offers.api";
export { useOfferDetail } from "./offers.hooks";
export { offerQueryKeys } from "./offers.queryKeys";
export {
  OFFER_STATUS_COLORS,
  OFFER_STATUS_LABELS,
  OFFER_TYPE_LABELS,
} from "./offers.labels";
export type {
  Offer,
  OfferDetail,
  OfferStatus,
  OfferType,
  Condition,
} from "./offers.types";
