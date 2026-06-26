import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeOrganizationStatus } from "./organizations.api";
import { organizationsQueryKeys } from "./organizations.queryKeys";
import type { ChangeStatusPayload } from "./organizations.types";

export function useChangeOrganizationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ChangeStatusPayload;
    }) => changeOrganizationStatus(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: organizationsQueryKeys.list() });
    },
  });
}
