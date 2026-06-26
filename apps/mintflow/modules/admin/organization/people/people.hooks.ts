import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import {
  changeMembershipStatus,
  fetchPerson,
  fetchPositionAssignments,
  fetchUnitMemberships,
} from "./people.api";
import { peopleQueryKeys } from "./people.queryKeys";
import type { ChangeMembershipStatusPayload } from "./people.types";

export function useChangeMembershipStatus(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ChangeMembershipStatusPayload;
    }) => changeMembershipStatus(id, payload),
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: peopleQueryKeys.list(orgId) });
      void qc.invalidateQueries({
        queryKey: peopleQueryKeys.detail(result.id),
      });
    },
  });
}

export function usePersonDetail(membershipId: string | null, enabled: boolean) {
  const results = useQueries({
    queries: [
      {
        queryKey: peopleQueryKeys.detail(membershipId ?? ""),
        queryFn: () => fetchPerson(membershipId!),
        enabled: enabled && membershipId !== null,
      },
      {
        queryKey: peopleQueryKeys.unitMemberships(membershipId ?? ""),
        queryFn: () => fetchUnitMemberships(membershipId!),
        enabled: enabled && membershipId !== null,
      },
      {
        queryKey: peopleQueryKeys.positionAssignments(membershipId ?? ""),
        queryFn: () => fetchPositionAssignments(membershipId!),
        enabled: enabled && membershipId !== null,
      },
    ],
  });

  const [personQuery, unitQuery, assignmentQuery] = results;

  return {
    person: personQuery.data,
    unitMemberships: unitQuery.data ?? [],
    positionAssignments: assignmentQuery.data ?? [],
    isLoading:
      personQuery.isLoading || unitQuery.isLoading || assignmentQuery.isLoading,
    isError:
      personQuery.isError || unitQuery.isError || assignmentQuery.isError,
  };
}
