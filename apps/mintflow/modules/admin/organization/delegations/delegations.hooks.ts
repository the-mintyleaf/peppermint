import { useMutation, useQueryClient } from "@peppermint/ui";
import { revokeDelegation } from "./delegations.api";
import { delegationsQueryKeys } from "./delegations.queryKeys";
import type { RevokePayload } from "./delegations.types";

export function useRevokeDelegation(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RevokePayload }) =>
      revokeDelegation(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: delegationsQueryKeys.list(orgId),
      });
    },
  });
}
