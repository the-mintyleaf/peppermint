import { z } from "zod";

export const schemaSessionSummary = z.record(z.string(), z.string());

export type PropSessionSummary = z.infer<typeof schemaSessionSummary>;
