import {
  notifications,
  useMutation,
  useQuery,
  useQueryClient,
} from "@peppermint/ui";

import { getApiErrorMessage } from "@/lib/authErrorMessages";
import {
  createUnitMembership,
  fetchMemberships,
} from "@/modules/admin/organization/members/members.api";

import { organizationQueryKeys } from "../../../_shared/organization.queryKeys";

interface AddUnitMemberInput {
  membershipId: string;
  unitId: string;
  membershipType?: string;
  isPrimary: boolean;
  reason?: string;
}

/** Org memberships (people) to pick from — labelled by employee code, like the members list. */
export function useOrgMembershipOptions(
  organizationId: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: organizationQueryKeys.membershipsList(organizationId),
    queryFn: () =>
      fetchMemberships(organizationId, {
        page: 1,
        pageSize: 100,
        search: "",
        sort: [],
        filters: {},
      }),
    enabled: Boolean(organizationId) && enabled,
  });
}

export function useAddUnitMember(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      membershipId,
      unitId,
      membershipType,
      isPrimary,
      reason,
    }: AddUnitMemberInput) =>
      createUnitMembership(membershipId, {
        unit_id: unitId,
        membership_type: membershipType || undefined,
        is_primary: isPrimary,
        reason: reason || undefined,
      }),
    onSuccess: () => {
      // Refresh open tree branches so the new direct member shows on the canvas
      // (a unit's members ride on its own and its parent's `include_members` fetch).
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key[0] === "organizations" &&
            key[1] === organizationId &&
            key[2] === "unit-children"
          );
        },
      });
      notifications.show({
        color: "green",
        title: "Member added",
        message: "The member was placed in the unit.",
      });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't add member",
        message: getApiErrorMessage(error),
      });
    },
  });
}
