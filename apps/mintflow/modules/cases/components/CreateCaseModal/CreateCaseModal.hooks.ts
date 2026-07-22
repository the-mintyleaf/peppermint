"use client";

import { useMemo } from "react";
import { useQuery, type ComboboxItem } from "@peppermint/ui";

import {
  fetchAssignableUsers,
  fetchOrganizations,
  fetchUnitsForOrg,
} from "./CreateCaseModal.api";

/** Names change rarely — cache reference lists aggressively across opens. */
const REF_STALE_MS = 5 * 60_000;

/** Organizations, as ready-to-use Select options (English name, code fallback). */
export function useOrganizationOptions() {
  const query = useQuery({
    queryKey: ["cases", "ref", "organizations"],
    queryFn: fetchOrganizations,
    staleTime: REF_STALE_MS,
  });
  const options = useMemo<ComboboxItem[]>(
    () =>
      (query.data ?? []).map((o) => ({
        value: o.id,
        label: o.name_en || o.name_np || o.code,
      })),
    [query.data],
  );
  return { options, isLoading: query.isLoading, isError: query.isError };
}

/** Units for the chosen org, as Select options. Idle until an org is picked. */
export function useUnitOptions(orgId: string | null) {
  const query = useQuery({
    queryKey: ["cases", "ref", "units", orgId],
    queryFn: () => fetchUnitsForOrg(orgId as string),
    enabled: Boolean(orgId),
    staleTime: REF_STALE_MS,
  });
  const options = useMemo<ComboboxItem[]>(
    () =>
      (query.data ?? []).map((u) => ({
        value: u.id,
        label: u.name_en || u.name_np || u.code,
      })),
    [query.data],
  );
  return { options, isLoading: query.isLoading, isError: query.isError };
}

/**
 * Assignable actors for the proposed-owner picker, as Select options. Only
 * fetched when the assignment section is open (`enabled`) — the essentials path
 * (creator becomes owner) never touches the user directory.
 */
export function useAssignableUserOptions(enabled: boolean) {
  const query = useQuery({
    queryKey: ["cases", "ref", "users"],
    queryFn: fetchAssignableUsers,
    enabled,
    staleTime: REF_STALE_MS,
  });
  const options = useMemo<ComboboxItem[]>(
    () =>
      (query.data ?? []).map((u) => ({
        value: u.id,
        label: u.display_name || u.username,
      })),
    [query.data],
  );
  return { options, isLoading: query.isLoading };
}
