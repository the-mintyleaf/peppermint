import { useQuery } from "@peppermint/ui";

import { fetchUnitTree } from "../../../_shared/organization.api";
import { organizationQueryKeys } from "../../../_shared/organization.queryKeys";
import {
  fetchMembershipsCount,
  fetchOrganization,
} from "../../organizations.api";
import { organizationsQueryKeys } from "../../organizations.queryKeys";

export function useOrganizationDetail(organizationId: string) {
  return useQuery({
    queryKey: organizationsQueryKeys.detail(organizationId),
    queryFn: () => fetchOrganization(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useSetupProgress(organizationId: string) {
  const unitTreeQuery = useQuery({
    queryKey: organizationQueryKeys.unitTree(organizationId),
    queryFn: () => fetchUnitTree(organizationId),
    enabled: Boolean(organizationId),
  });

  const membershipsCountQuery = useQuery({
    queryKey: [
      ...organizationsQueryKeys.detail(organizationId),
      "memberships-count",
    ],
    queryFn: () => fetchMembershipsCount(organizationId),
    enabled: Boolean(organizationId),
  });

  return {
    hasRootUnit: (unitTreeQuery.data?.length ?? 0) > 0,
    membersInvited: membershipsCountQuery.data ?? 0,
    isLoading: unitTreeQuery.isLoading || membershipsCountQuery.isLoading,
  };
}
