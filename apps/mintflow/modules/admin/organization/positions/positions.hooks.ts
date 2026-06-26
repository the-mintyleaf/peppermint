import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivatePosition } from "./positions.api";
import { positionsQueryKeys } from "./positions.queryKeys";

export function useDeactivatePosition(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      deactivatePosition(id, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: positionsQueryKeys.list(orgId) });
    },
  });
}
