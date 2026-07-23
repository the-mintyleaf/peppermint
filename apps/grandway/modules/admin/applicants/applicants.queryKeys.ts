import { createQueryKeys } from "@peppermint/admin";

export const applicantsQueryKeys = createQueryKeys("applicants");

export const applicantHistoryKey = (id: string) =>
  [...applicantsQueryKeys.detail(id), "history"] as const;
