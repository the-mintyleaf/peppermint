import { createQueryKeys } from "@peppermint/admin";

export const applicantsQueryKeys = createQueryKeys("applicants");

export const applicantHistoryKey = (id: string) =>
  [...applicantsQueryKeys.detail(id), "history"] as const;

/**
 * Base key for the Notes tab — `NotesPanel` appends its list params and
 * invalidates by prefix. Nested under `detail(id)` like history, so a detail
 * invalidation (status, restore, assign) also refreshes an open Notes tab.
 */
export const applicantNotesKey = (id: string) =>
  [...applicantsQueryKeys.detail(id), "notes"] as const;

/** The Admin's assignee picker — the accounts `GET /auth/users/` lets them see. */
export const assignableStaffKey = [
  ...applicantsQueryKeys.all,
  "assignable-staff",
] as const;
