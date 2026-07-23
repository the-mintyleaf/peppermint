import { createQueryKeys } from "@peppermint/admin";

export const leadManagementQueryKeys = createQueryKeys("lead-management.leads");
export const leadSourceQueryKeys = createQueryKeys("lead-management.sources");
export const lossReasonQueryKeys = createQueryKeys(
  "lead-management.loss-reasons",
);

export const leadNotesKey = (id: string) =>
  [...leadManagementQueryKeys.detail(id), "notes"] as const;

export const leadHistoryKey = (id: string) =>
  [...leadManagementQueryKeys.detail(id), "history"] as const;
