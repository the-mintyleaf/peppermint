import { useQuery } from "@peppermint/ui";

import { fetchUnitsFlat } from "../../organization.api";
import { organizationQueryKeys } from "../../organization.queryKeys";

export function useUnitOptions(organizationId: string) {
  return useQuery({
    queryKey: organizationQueryKeys.unitsFlat(organizationId),
    queryFn: () => fetchUnitsFlat(organizationId),
    enabled: Boolean(organizationId),
    staleTime: 30_000,
  });
}
