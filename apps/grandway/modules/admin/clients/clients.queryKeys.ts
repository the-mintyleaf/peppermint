import { createQueryKeys } from "@peppermint/admin";

export const clientQueryKeys = createQueryKeys("clients.clients");

/**
 * History lives under a client's detail key, so invalidating `detail(id)` (or
 * the broader `all`) refreshes an open History panel by prefix match.
 */
export const clientHistoryKey = (id: string) =>
  [...clientQueryKeys.detail(id), "history"] as const;
