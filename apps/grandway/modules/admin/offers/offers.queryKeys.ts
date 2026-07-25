import { createQueryKeys } from "@peppermint/admin";

export const offerQueryKeys = createQueryKeys("offers.offers");

/** `[...detail(id), "history"]` — a strict suffix of `detail(id)`, so invalidating `detail(id)` refreshes it too. */
export const offerHistoryKey = (id: string) =>
  [...offerQueryKeys.detail(id), "history"] as const;

/** `[...detail(id), "conditions"]` — the standalone conditions panel key. */
export const offerConditionsKey = (id: string) =>
  [...offerQueryKeys.detail(id), "conditions"] as const;
