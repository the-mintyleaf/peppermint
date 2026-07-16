import { useQuery } from "@peppermint/ui";

import { fetchPositions } from "../../../positions/positions.api";
import { positionsQueryKeys } from "../../../positions/positions.queryKeys";

export function usePositionOptions(unitId: string | null) {
  return useQuery({
    queryKey: positionsQueryKeys.listKey(unitId ?? ""),
    queryFn: () => fetchPositions(unitId as string),
    enabled: Boolean(unitId),
  });
}
