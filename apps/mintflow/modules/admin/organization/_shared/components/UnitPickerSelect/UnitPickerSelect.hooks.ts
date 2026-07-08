import { useQuery } from "@peppermint/ui";

import { organizationQueryKeys } from "../../organization.queryKeys";
import { useStructureData } from "../../structure-data";

export function useUnitOptions(organizationId: string) {
  // Reads from the data-source context (default = real axios). Inside the
  // test-tree's provider this resolves to the in-memory source; everywhere else
  // (positions/delegations/member forms) it is the real API, unchanged.
  const { dataSource } = useStructureData();
  return useQuery({
    queryKey: organizationQueryKeys.unitsFlat(organizationId),
    queryFn: () => dataSource.fetchUnitsFlat(organizationId),
    enabled: Boolean(organizationId),
    staleTime: 30_000,
  });
}
