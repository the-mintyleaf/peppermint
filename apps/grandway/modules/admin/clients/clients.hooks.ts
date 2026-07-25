"use client";

import { useQuery } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import {
  fetchClientHistory,
  getClient,
  restoreClient,
  retireClient,
} from "./clients.api";
import { clientHistoryKey, clientQueryKeys } from "./clients.queryKeys";
import type { ClientDetail } from "./clients.types";

/** Full detail for the drawer's Overview tab — always the real fetch, never the trimmed list row. */
export function useClientDetail(clientId: string | null) {
  return useQuery({
    queryKey: clientId
      ? clientQueryKeys.detail(clientId)
      : ["clients.clients", "detail", "none"],
    queryFn: () => getClient(clientId as string),
    enabled: clientId !== null,
  });
}

/** History for the drawer's History tab — readable by lead managers too (§7). */
export function useClientHistory(clientId: string | null) {
  return useQuery({
    queryKey: clientId
      ? clientHistoryKey(clientId)
      : ["clients.clients", "detail", "none", "history"],
    queryFn: () => fetchClientHistory(clientId as string),
    enabled: clientId !== null,
  });
}

/**
 * Retire — the id + reason travel with the mutate call (the mutation is created
 * once in the row-actions menu, not bound to one client). Invalidates the whole
 * `clients.clients` tree so the list, any open detail, and its history all
 * refresh (retire flips the `status` badge and appends a history event).
 */
export function useRetireClient() {
  return useAppMutation<ClientDetail, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => retireClient(id, { reason }),
    successMessage: "Client retired.",
    successTitle: "Retired",
    errorTitle: "Couldn't retire client",
    invalidateKeys: [clientQueryKeys.all],
  });
}

/** Restore — id travels with the mutate call; empty body server-side. */
export function useRestoreClient() {
  return useAppMutation<ClientDetail, string>({
    mutationFn: (id) => restoreClient(id),
    successMessage: "Client restored.",
    successTitle: "Restored",
    errorTitle: "Couldn't restore client",
    invalidateKeys: [clientQueryKeys.all],
  });
}
