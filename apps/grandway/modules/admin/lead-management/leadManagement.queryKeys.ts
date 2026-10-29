import { createQueryKeys } from "@peppermint/admin";

export const leadManagementQueryKeys = createQueryKeys("lead-management.leads");
export const leadSourceQueryKeys = createQueryKeys("lead-management.sources");
export const lossReasonQueryKeys = createQueryKeys(
  "lead-management.loss-reasons",
);

/**
 * The `NotesPanel` adapter's base key — the panel appends its own
 * `["list", params]` and invalidates this prefix after every note write.
 */
export const leadNotesKey = (id: string) =>
  [...leadManagementQueryKeys.detail(id), "notes"] as const;

export const leadHistoryKey = (id: string) =>
  [...leadManagementQueryKeys.detail(id), "history"] as const;

/**
 * Admin "Deleted leads" view (`?deleted=true`). Under `lists()`, so every
 * delete/restore invalidating `lists()` refreshes it alongside the board.
 */
export const deletedLeadsKey = (page: number, pageSize: number) =>
  leadManagementQueryKeys.list({ deleted: true, page, pageSize });
