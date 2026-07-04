import { useQuery } from "@peppermint/ui";

import { fetchPositionHolders } from "../../../positions/positions.api";
import { organizationQueryKeys } from "../../organization.queryKeys";

export function usePositionHolderOptions(positionId: string | null) {
  return useQuery({
    queryKey: organizationQueryKeys.positionHolders(positionId ?? ""),
    queryFn: () => fetchPositionHolders(positionId as string),
    enabled: Boolean(positionId),
  });
}
