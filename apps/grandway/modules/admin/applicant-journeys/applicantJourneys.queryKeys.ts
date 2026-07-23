import { createQueryKeys } from "@peppermint/admin";

export const journeyQueryKeys = createQueryKeys("applicant-journeys.journeys");

export const journeyHistoryKey = (id: string) =>
  [...journeyQueryKeys.detail(id), "history"] as const;
