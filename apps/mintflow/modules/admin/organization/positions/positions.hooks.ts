import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPosition, deactivatePosition } from "./positions.api";
import { positionsQueryKeys } from "./positions.queryKeys";
import type { Position } from "./positions.types";

export function useCreatePosition(orgId: string, unitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<Position>) =>
      createPosition(unitId, { ...values, organization: orgId }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: positionsQueryKeys.list(orgId) });
    },
  });
}

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
